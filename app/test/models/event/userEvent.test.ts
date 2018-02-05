import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';

import {UserUtils} from 'app/test/utils/userUtils';
import {EmailUtils} from 'app/test/utils/emailUtils';
import * as userMock from 'app/test/fixtures/models/user';

import * as App from 'app/server/server';
import {EmailService} from 'app/service/emailService';
import {UserEvent} from 'app/models/event/userEvent';
import {User} from 'app/interface/user/user';
import {AccessToken} from 'app/interface/accessToken';

@suite('Models - Events - UserEventTest')
export class UserEventTest {

  private static FollowersCount = 1;
  private static Login: {user: User, token: AccessToken};

  static before(done) {
    UserUtils.registerUser()
      .then(login => UserEventTest.Login = login)
      .then(() => App.models.user.create(userMock.get(1)[0]))
      .then(result => App.models.user.update({id: UserEventTest.Login.user.id}, {followersIds: [result.id]}))
      .then(() => done())
      .catch(done);
  }

  @test('should not send welcome email on update')
  test_not_send_welcome_email(done) {
    let mailer = EmailUtils.getMailer();
    // clear previous mails
    mailer.sentMail = [];
    let ctx = {
      instance: {},
      isNewInstance: false
    };

    UserEvent.onAccountAfterSaved(ctx)
      .then(() => {
        expect(mailer.sentMail).to.have.length(0);
      })
      .then(() => done())
      .catch(done);
  }

  @test('should send welcome email on create')
  test_send_welcome_email(done) {
    let ctx = {
      instance: UserEventTest.Login.user,
      isNewInstance: true
    };

    UserEvent.onAccountAfterSaved(ctx)
      .then(() => {
        let email = EmailUtils.getLastSentEmail();

        expect(email).to.exist;
        expect(email.data.to).to.equal(UserEventTest.Login.user.email);
        expect(email.data.from).to.equal(App.get('email'));
        expect(email.data.subject).to.equal((<any>EmailService).WELCOME_EMAIL_SUBJECT);
        expect(email.data.html).to.contain(App.get('domain'));
        expect(email.data.html).to.contain(UserEventTest.Login.user.username);
      })
      .then(() => done())
      .catch(done);
  }

  @test('should send password reset email')
  test_send_reset_email(done) {
    UserEvent.onResetPasswordRequest(UserEventTest.Login.user, UserEventTest.Login.token)
      .then(() => {
        let email = EmailUtils.getLastSentEmail();

        expect(email).to.exist;
        expect(email.data.to).to.equal(UserEventTest.Login.user.email);
        expect(email.data.from).to.equal(App.get('email'));
        expect(email.data.subject).to.equal((<any>EmailService).PASSWORD_RESET_EMAIL_SUBJECT);
        expect(email.data.html).to
          .contain(`http://${App.get('domain')}/user/password/reset?token=${UserEventTest.Login.token.id}`);
      })
      .then(() => done())
      .catch(done);
  }

  @test('should inject values on onRemoteFindOne')
  test_inject_on_onRemoteFindOne(done) {
    let ctx = {
      result: UserEventTest.Login.user,
    };

    UserEvent.onRemoteFindOne(ctx)
      .then(() => {
        // followers count
        expect(ctx.result.followersCount).to.equal(UserEventTest.FollowersCount);
      })
      .then(() => done())
      .catch(done);
  }

  @test('should inject values on onRemoteFindById')
  test_inject_on_onRemoteFindById(done) {
    let ctx = {
      result: UserEventTest.Login.user,
    };

    UserEvent.onRemoteFindById(ctx)
      .then(() => {
        // followers count
        expect(ctx.result.followersCount).to.equal(UserEventTest.FollowersCount);
      })
      .then(() => done())
      .catch(done);
  }
}
