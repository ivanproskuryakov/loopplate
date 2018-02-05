import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';
import {HttpMock} from 'app/test/mock/httpMock';
import {UserUtils} from 'app/test/utils/userUtils';
import {User} from 'app/interface/user/user';
import {AccessToken} from 'app/interface/accessToken';
import * as App from 'app/server/server';

let currentUser = require('app/server/boot/currentUser');

@suite('Server - Boot - CurrentUserTest')
export class CurrentUserTest {

  private static Login: {user: User, token: AccessToken};

  static before(done) {
    UserUtils.registerUser()
      .then(login => CurrentUserTest.Login = login)
      .then(() => done())
      .catch(done);
  }

  @test('should assign current user to req.user')
  test_req_user(done) {
    let middleware = currentUser(App);
    let req = HttpMock.createRequestByLogin(null, CurrentUserTest.Login.token);

    middleware(req, {}, function () {
      try {
        expect(req.user).to.exist;
        expect(req.user.id).to.deep.equal(CurrentUserTest.Login.user.id);

        done();
      } catch (err) {
        done(err);
      }
    });
  }
}
