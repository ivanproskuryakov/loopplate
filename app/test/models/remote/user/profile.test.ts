import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';
import {Promise} from 'es6-promise';
import {BaseRouteTest} from 'app/test/models/remote/baseRouteTest';
import {UserUtils} from 'app/test/utils/userUtils';
import {EmailUtils} from 'app/test/utils/emailUtils';

import * as cheerio from 'cheerio';

import * as App from 'app/server/server';
import {UserService} from 'app/models/service/user/userService';
import {User} from 'app/interface/user/user';
import {AccessToken} from 'app/interface/accessToken';
import {EmailService} from 'app/service/emailService';

@suite('Server - Routes - User - UserProfileTest')
export class UserProfileTest extends BaseRouteTest {

  @test('should update profile fields')
  test_profile_update(done) {
    // new values
    let firstName = 'some first name';
    let lastName = 'some last name';
    let middleName = 'some middle name';
    let dateOfBirth = new Date();
    let country = 'azgard';

    UserUtils.registerUser()
      .then(login => new Promise((resolve, reject) => {
        this.getApiClient()
          .patch(`/users/${login.user.id}`)
          .set('Authorization', login.token.id)
          .send({
            firstName: firstName,
            lastName: lastName,
            middleName: middleName,
            dateOfBirth: dateOfBirth,
            country: country
          })
          .expect(200)
          .end(err => {
            if (err) {
              return reject(err);
            }

            resolve(login.user.email);
          });
      }))
      // check database user fields
      .then(UserUtils.findUserByEmail)
      .then(user => {
        expect(user).to.exist;
        expect(user.firstName).to.equal(firstName);
        expect(user.lastName).to.equal(lastName);
        expect(user.middleName).to.equal(middleName);
        expect(user.dateOfBirth.toString()).to.equal(dateOfBirth.toString());
        expect(user.country).to.equal(country);

        done();
      })
      .catch(done);
  }

  @test('should request password reset, send email')
  test_password_reset_request(done) {

    UserUtils.registerUser()
      .then(login =>
        new Promise<{user: User, token: AccessToken}>((resolve, reject) => {
          // request password reset
          this.getApiClient()
            .post('/users/reset')
            .send({email: login.user.email})
            .expect(204)
            .end(err => {
              if (err) {
                return reject(err);
              }

              resolve(login);
            });
        }))
      // find latest token
      .then(login => UserUtils.findUserLatestToken(login.user)
        .then(token => {
          let email = EmailUtils.getLastSentEmail();

          expect(email).to.exist;
          expect(email.data.to).to.equal(login.user.email);
          expect(email.data.from).to.equal(App.get('email'));
          expect(email.data.subject).to.equal((<any>EmailService).PASSWORD_RESET_EMAIL_SUBJECT);
          expect(email.data.html).to.contain(App.get('domain'));
          expect(email.data.html).to.contain(token.id);

          done();
        }))
      .catch(done);
  }

  @test('should reset user\'s password')
  test_password_reset(done) {
    let newPassword = 'pa$$w0rd';

    UserUtils.registerUser()
      .then(login =>
        new Promise<{user: User, token: AccessToken}>((resolve, reject) => {
          // update password
          this.getApiClient()
            .put('/users/password')
            .send({
              token: login.token.id,
              password: newPassword,
              confirmation: newPassword
            })
            .expect(204)
            .end(err => {
              if (err) {
                return reject(err);
              }

              resolve(login);
            });
        }))
      .then(login => {
        // login with new password
        this.getApiClient()
          .post('/users/login')
          .send({email: login.user.email, password: newPassword})
          .expect(200)
          .expect(res => {
            expect(res.body).to.exist;
            expect(res.body.id).to.exist;
          })
          .end(done);
      })
      .catch(done);
  }

  @test('should return user\'s public profile')
  test_public_profile(done) {
    UserUtils.registerUser()
      .then(({user}) => {
        this.getApiClient()
          .get(`/users/${user.username}/profile`)
          .expect(200)
          .expect(res => {
            expect(res.body).to.exist;
            expect(res.body.id).to.equal(user.id.toString());
            expect(res.body.username).to.equal(user.username);
            expect(res.body.background).to.equal(user.background);
            expect(res.body.password).to.not.exist;
            expect(res.body.rss).to.not.exist;

            expect(res.body).to.have.property('followersCount');
            expect(res.body.followersCount).to.equal(0);
          })
          .end(done);
      })
      .catch(done);
  }

  @test('should request account delete')
  test_account_delete_request(done) {

    UserUtils.registerUser()
      .then(login => {
        return new Promise<{user: User, token: AccessToken}>((resolve, reject) => {
          // request account delete
          this.getApiClient()
            .delete(`/users/${login.user.id}`)
            .set({Authorization: login.token.id})
            .expect(200)
            .end(err => {
              if (err) {
                return reject(err);
              }

              resolve(login);
            });
        });
      })
      // find latest token
      .then(login => UserUtils.findUserLatestToken(login.user)
        .then(token => {
          let email = EmailUtils.getLastSentEmail();
          let apiUrl = `http://${App.get('domain')}:${App.get('port')}${App.get('restApiRoot')}`;
          let deleteUri = `${apiUrl}/users/delete?token=${token.id}`;

          expect(email).to.exist;
          expect(email.data.to).to.equal(login.user.email);
          expect(email.data.from).to.equal(App.get('email'));
          expect(email.data.subject).to.equal((<any>EmailService).ACCOUNT_DELETE_EMAIL_SUBJECT);
          expect(email.data.html).to.contain(deleteUri);

          done();
        }))
      .catch(done);
  }

  @test('should return meta tags on crawler request')
  test_crawler_meta(done) {
    UserUtils.registerUser()
      .then(login => {
        this.getServerClient()
          .get(`/u/${login.user.username}`)
          .set('user-agent', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)')
          .expect(200)
          .expect('Content-Type', /text\/html/)
          .expect(res => {
            expect(res.text).to.be.not.empty;
            let $ = cheerio.load(res.text);
            let expected = {
              title: login.user.username + ' - ' + App.get('meta').title,
              description: login.user.username + ' - ' + App.get('meta').description,
              keywords: login.user.username,
              type: 'profile',
              card: 'summary',
              image: login.user.avatar.location,
              url: UserService.getUserUrl(login.user),
              firstName: login.user.firstName,
              lastName: login.user.lastName,
              username: login.user.username
            };

            expect($('title').text()).to.equal(expected.title);
            expect($('meta[property="og:title"]').attr('content')).to.equal(expected.title);
            expect($('meta[property="twitter:title"]').attr('content')).to.equal(expected.title);

            expect($('meta[name="keywords"]').attr('content')).to.equal(expected.keywords);

            expect($('meta[name="description"]').attr('content')).to.equal(expected.description);
            expect($('meta[property="twitter:description"]').attr('content')).to.equal(expected.description);

            expect($('meta[property="og:type"]').attr('content')).to.equal(expected.type);
            expect($('meta[property="twitter:card"]').attr('content')).to.equal(expected.card);

            expect($('meta[property="og:image"]').attr('content')).to.equal(expected.image);
            expect($('meta[property="twitter:image"]').attr('content')).to.equal(expected.image);

            expect($('meta[property="og:url"]').attr('content')).to.equal(expected.url);
            expect($('meta[property="twitter:url"]').attr('content')).to.equal(expected.url);

            expect($('meta[property="profile:first_name"]').attr('content')).to.equal(expected.firstName);
            expect($('meta[property="profile:last_name"]').attr('content')).to.equal(expected.lastName);
            expect($('meta[property="profile:username"]').attr('content')).to.equal(expected.username);
          })
          .end(done);
      })
      .catch(done);
  }

  @test('should return angular html on browser request')
  test_browser_meta(done) {
    UserUtils.registerUser()
      .then(login => {
        this.getServerClient()
          .get(`/u/${login.user.username}`)
          .redirects(1)
          /* tslint:disable max-line-length */
          .set('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36')
          /* tslint:enable max-line-length */
          .expect(200)
          .expect('Content-Type', /text\/html/)
          .expect(res => {
            expect(res.text).to.be.not.empty;
            let $ = cheerio.load(res.text);

            expect($('title').text()).to.not.equal(App.get('meta').title);
            expect($('meta[name="description"]').attr('content')).to.not.equal(App.get('meta').description);
            expect($('body').attr('ng-class')).to.equal('appState');
          })
          .end(done);
      })
      .catch(done);
  }

  @test('should delete account')
  test_account_delete(done) {

    UserUtils.registerUser()
      .then(login => {
        return new Promise<{user: User, token: AccessToken}>((resolve, reject) => {
          this.getApiClient()
            .get(`/users/delete`)
            .send({token: login.token.id})
            .expect(302)
            .expect(res => {
              let url = res.res.headers.location;
              expect(url).to.equal(`http://${App.get('domain')}:${App.get('port')}`);
            })
            .end(err => {
              if (err) {
                return reject(err);
              }

              resolve(login);
            });
        });
      })
      .then(login => {
        let email = EmailUtils.getLastSentEmail();
        let host = `http://${App.get('domain')}`;

        expect(email).to.exist;
        expect(email.data.to).to.equal(login.user.email);
        expect(email.data.from).to.equal(App.get('email'));
        expect(email.data.subject).to.equal((<any>EmailService).ACCOUNT_DELETE_CONFIRMATION_EMAIL_SUBJECT);
        expect(email.data.html).to.contain(host);

        return Promise.all([
          App.models.Comment.count({userId: login.user.id}),
          App.models.Activity.count({userId: login.user.id}),
          App.models.Media.count({userId: login.user.id}),
          App.models.userIdentity.count({userId: login.user.id}),
          App.models.user.count({id: login.user.id})
        ]);
      }).then(counts => {
      counts.forEach(count => expect(count).to.equal(0));
    })
      .then(() => done())
      .catch(done);
  }
}
