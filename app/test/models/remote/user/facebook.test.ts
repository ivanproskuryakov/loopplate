import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';
import {BaseRouteTest} from 'app/test/models/remote/baseRouteTest';
import {UserUtils} from 'app/test/utils/userUtils';
import * as App from 'app/server/server';
import OAuth = require('app/server/oauth');
let fbUser = require('app/test/fixtures/fbUser.json');
import {parse} from 'querystring';
import * as nock from 'nock';
let cookie = require('cookie-signature');


@suite('Server - Routes - User - UserFacebookAuthTest')
export class UserFacebookAuthTest extends BaseRouteTest {

  facebook: any = OAuth(App)['facebook-login'];

  static before(done) {
    BaseRouteTest.before(() => {

      // set hook for fb profile url
      nock('https://graph.facebook.com')
        .get('/v2.5/me')
        .query(() => true)
        .reply(200, fbUser)
        .post('/oauth/access_token')
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

  @test('should redirect to facebook login')
  test_redirect(done) {
    this.getServerClient()
      .get(this.facebook.authPath)
      .expect(302)
      .expect(res => {
        let url = res.res.headers.location;

        expect(res).to.exist;
        expect(url).to.contain('www.facebook.com');

        // check query string params is set correctly
        let qs = parse(url.substring(url.indexOf('?') + 1));
        expect(qs.redirect_uri).to.equal(this.facebook.callbackURL);
        expect(qs.scope).to.equal(this.facebook.scope.join(','));
        expect(qs.client_id).to.equal(this.facebook.clientID);
      })
      .end(done);
  }

  @test('should register user after successful login')
  test_success_callback(done) {
    this.getServerClient()
      .get(`${this.facebook.callbackPath}?code=123`)
      .expect(302)
      .expect(res => {
        expect(res).to.exist;
      })
      .end(() => {
        // check if user registered in db
        UserUtils.findUserByEmail(fbUser.email)
          .then(user => {
            expect(user).to.exist;
            expect(user.type).to.equal('user');
            expect(user.username).to.exist;
            expect(user.firstName).to.equal(fbUser.first_name);
            expect(user.lastName).to.equal(fbUser.last_name);

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
      .get(this.facebook.successRedirect)
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
