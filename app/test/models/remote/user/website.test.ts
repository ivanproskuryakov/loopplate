import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';
import {Promise} from 'es6-promise';

import * as faker from 'faker';
import * as usersMock from 'app/test/fixtures/models/user';
import {UserUtils} from 'app/test/utils/userUtils';
import {EmailUtils} from 'app/test/utils/emailUtils';
import {BaseRouteTest} from 'app/test/models/remote/baseRouteTest';

import * as App from 'app/server/server';
import {User} from 'app/interface/user/user';
import {AccessToken} from 'app/interface/accessToken';
import {UserService} from 'app/models/service/user/userService';
import {EmailService} from 'app/service/emailService';

@suite('Server - Routes - User - WebsiteUserTest')
export class WebsiteUserTest extends BaseRouteTest {

  @test('should request password reset, send email')
  test_password_reset_request(done) {
    let domain = faker.internet.domainName();
    let websiteUser = usersMock.user(null, 'website',
      `${UserService.WEBSITE_USER_DEFAULT_USERNAME}@${domain}`);
    let requestedByEmail = faker.internet.email(null, null, domain);

    UserUtils.registerUser(websiteUser)
      .then(login =>
        new Promise<{user: User, token: AccessToken}>((resolve, reject) => {
          // request password reset
          this.getApiClient()
            .post('/users/website/reset')
            .send({email: requestedByEmail})
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
          // check sent email
          let email = EmailUtils.getLastSentEmail();

          expect(email).to.exist;
          expect(email.data.to).to.equal(requestedByEmail);
          expect(email.data.from).to.equal(App.get('email'));
          expect(email.data.subject).to.equal((<any>EmailService).PASSWORD_RESET_EMAIL_SUBJECT);
          expect(email.data.html).to.contain(App.get('domain'));
          expect(email.data.html).to.contain(token.id);

          done();
        }))
      .catch(done);
  }

  @test('should return user not found')
  test_user_not_found(done) {
    let mailer = EmailUtils.getMailer();
    mailer.sentMail = [];

    let requestedByEmail = faker.internet.email();

    this.getApiClient()
      .post('/users/website/reset')
      .send({email: requestedByEmail})
      .expect(404)
      .expect(res => {
        expect(res.body.error.message).to.equal('User not found');
        expect(mailer.sentMail).to.have.length(0);
      })
      .end(done);
  }
}
