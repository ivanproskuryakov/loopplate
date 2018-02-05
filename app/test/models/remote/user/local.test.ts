import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';
import * as usersMock from 'app/test/fixtures/models/user';
import {BaseRouteTest} from 'app/test/models/remote/baseRouteTest';
import {UserUtils} from 'app/test/utils/userUtils';
import {EmailUtils} from 'app/test/utils/emailUtils';

import * as App from 'app/server/server';
import {EmailService} from 'app/service/emailService';

@suite('Server - Routes - User - UserLocalAuthTest')
export class UserLocalAuthTest extends BaseRouteTest {

  @test('should register user with valid username & email & password, send welcome email')
  test_registration_valid(done) {
    let user = usersMock.get(1)[0];

    this.getApiClient()
      .post('/users')
      .send(user)
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body).to.exist;
        expect(res.body.id).to.exist;
        expect(res.body.email).to.equal(user.email);
        expect(res.body.username).to.equal(user.username);

        let email = EmailUtils.getLastSentEmail();

        expect(email).to.exist;
        expect(email.data.to).to.equal(user.email);
        expect(email.data.from).to.equal(App.get('email'));
        expect(email.data.subject).to.equal((<any>EmailService).WELCOME_EMAIL_SUBJECT);
        expect(email.data.html).to.contain(App.get('domain'));
        expect(email.data.html).to.contain(user.username);
      })
      .end(done);
  }

  @test('should return 422 with email is required')
  test_email_required(done) {
    let user = usersMock.get(1)[0];
    delete user.email;

    this.getApiClient()
      .post('/users')
      .send(user)
      .expect(422)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body).to.exist;
        expect(res.body.error).to.exist;
        expect(res.body.error.name).to.equal('ValidationError');
      })
      .end(done);
  }

  @test('should return 422 with password is required')
  test_password_required(done) {
    let user = usersMock.get(1)[0];
    delete user.password;

    this.getApiClient()
      .post('/users')
      .send(user)
      .expect(422)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body).to.exist;
        expect(res.body.error).to.exist;
        expect(res.body.error.name).to.equal('ValidationError');
      })
      .end(done);
  }

  @test('should login')
  test_login(done) {
    let user = usersMock.get(1)[0];

    UserUtils.createUser(user)
      .then(({email}) => {
        this.getApiClient()
          .post('/users/login')
          .send({email: email, password: user.password})
          .expect(200)
          .expect(res => {
            expect(res.body).to.exist;
            expect(res.body.id).to.exist;
          })
          .end(done);
      })
      .catch(done);
  }

  @test('should logout')
  test_log_out(done) {
    UserUtils.createUser()
      .then(user => UserUtils.generateLoginToken(user))
      .then(({id}) => {
        this.getApiClient()
          .post('/users/logout')
          .set('Authorization', id)
          .expect(204)
          .end(done);
      })
      .catch(done);
  }
}
