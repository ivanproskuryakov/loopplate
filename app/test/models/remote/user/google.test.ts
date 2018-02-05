import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';
import {BaseRouteTest} from 'app/test/models/remote/baseRouteTest';
import {UserUtils} from 'app/test/utils/userUtils';
import * as App from 'app/server/server';
import OAuth = require('app/server/oauth');
let googleUser = require('app/test/fixtures/googleUser.json');
import {parse} from 'querystring';
import * as nock from 'nock';
let cookie = require('cookie-signature');


@suite('Server - Routes - User - UserGoogleAuthTest')
export class UserGoogleAuthTest extends BaseRouteTest {

  google: any = OAuth(App)['google-login'];

  static before(done) {
    BaseRouteTest.before(() => {

      // set hook for fb profile url
      nock('https://www.googleapis.com')
        .get('/plus/v1/people/me')
        .query(() => true)
        .reply(200, googleUser)
        .post('/oauth2/v4/token')
        .reply(200, {
          access_token: 'qwerty',
          refresh_token: 'qwerty'
        });

      done();
    });
  }

  static after(done) {
    BaseRouteTest.after(() => {

      nock.cleanAll();

      done();
    });
  }

  @test('should redirect to google login')
  test_redirect(done) {
    this.getServerClient()
      .get(this.google.authPath)
      .expect(302)
      .expect(res => {
        let url = res.res.headers.location;

        expect(res).to.exist;
        expect(url).to.contain('accounts.google.com');

        // check query string params is set correctly
        let qs = parse(url.substring(url.indexOf('?') + 1));
        expect(qs.redirect_uri).to.equal(this.google.callbackURL);
        expect(qs.scope).to.equal(this.google.scope.join(' '));
        expect(qs.client_id).to.equal(this.google.clientID);
      })
      .end(done);
  }

  @test('should register user after successful login')
  test_success_callback(done) {
    this.getServerClient()
      .get(`${this.google.callbackPath}?code=123`)
      .expect(302)
      .expect(res => {
        expect(res).to.exist;
      })
      .end(() => {
        // check if user registered in db
        UserUtils.findUserByEmail(googleUser.emails[0].value)
          .then(user => {
            expect(user).to.exist;
            expect(user.type).to.equal('user');
            expect(user.username).to.exist;
            expect(user.firstName).to.equal(googleUser.name.givenName);
            expect(user.lastName).to.equal(googleUser.name.familyName);

            done();
          })
          .catch(done);
      });
  }

  @test('should redirect to frontend after successful login')
  test_redirect_to_frontend(done) {
    let token = '123';
    let userId = '789';
    let secret = App.get('cookieSecret');
    let cookieValue = `access_token=s:${cookie.sign(token, secret)};userId=s:${cookie.sign(userId, secret)}`;

    this.getServerClient()
      .get(this.google.successRedirect)
      .set('Cookie', cookieValue)
      .expect(302)
      .expect(res => {
        let url = res.res.headers.location;

        expect(res).to.exist;
        expect(url).to.contain(App.get('domain'));

        // check query string params is set correctly
        let qs = parse(url.substring(url.indexOf('?') + 1));
        expect(qs.access_token).to.equal(token);
        expect(qs.user).to.equal(userId);
      })
      .end(done);
  }
}
