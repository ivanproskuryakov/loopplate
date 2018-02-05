import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';
import * as faker from 'faker';

import {UserUtils} from 'app/test/utils/userUtils';
import {EmailUtils} from 'app/test/utils/emailUtils';
import * as usersMock from 'app/test/fixtures/models/user';
import * as tokensMock from 'app/test/fixtures/models/accessToken';

import * as App from 'app/server/server';
import {UserService} from 'app/models/service/user/userService';
import {EmailService} from 'app/service/emailService';


@suite('Service - EmailService')
export class EmailServiceTest {

  @test('should send welcome email')
  test_send_welcome_email() {
    let user = usersMock.get(1)[0];

    return EmailService.sendWelcomeEmail(user)
      .then(() => {
        let email = EmailUtils.getLastSentEmail();

        expect(email).to.exist;
        expect(email.data.to).to.equal(user.email);
        expect(email.data.from).to.equal(App.get('email'));
        expect(email.data.subject).to.equal((<any>EmailService).WELCOME_EMAIL_SUBJECT);
        expect(email.data.html).to.contain(App.get('domain'));
        expect(email.data.html).to.contain(user.username);
      });
  }

  @test('should send password reset email')
  test_send_password_reset_email() {
    let user = usersMock.get(1)[0];
    let token = tokensMock.token(user);

    return EmailService.sendPasswordResetEmail(user, token)
      .then(() => {
        let email = EmailUtils.getLastSentEmail();

        expect(email).to.exist;
        expect(email.data.to).to.equal(user.email);
        expect(email.data.from).to.equal(App.get('email'));
        expect(email.data.subject).to.equal((<any>EmailService).PASSWORD_RESET_EMAIL_SUBJECT);
        expect(email.data.html).to.contain(App.get('domain'));
        expect(email.data.html).to.contain(token.id);
      });
  }

  @test('should send website user password reset email')
  test_send_website_user_password_reset_email() {
    let domain = 'somerandomdomain.com';
    let websiteUser = usersMock.user(`loopplate.${domain}`, 'website', `loopplate@${domain}`);
    let resetEmail = `test@${domain}`;


    return UserUtils
      .createUser(websiteUser)
      .then(() => UserService.requestWebsiteUserReset(resetEmail))
      .then(() => {
        let email = EmailUtils.getLastSentEmail();

        expect(email).to.exist;
        expect(email.data.to).to.equal(resetEmail);
        expect(email.data.from).to.equal(App.get('email'));
        expect(email.data.subject).to.equal((<any>EmailService).PASSWORD_RESET_EMAIL_SUBJECT);
        expect(email.data.html).to.contain(App.get('domain'));
      });
  }

  @test('should send account delete email')
  test_send_account_delete_email() {

    return UserUtils.createUser()
      .then(user => {
        return EmailService.sendAccountDeleteEmail(user.id)
          .then(() => {
            // find token
            return App.models.accessToken.findOne({where: {userId: user.id}});
          })
          .then(token => {
            let email = EmailUtils.getLastSentEmail();

            expect(email).to.exist;
            expect(email.data.to).to.equal(user.email);
            expect(email.data.from).to.equal(App.get('email'));
            expect(email.data.subject).to.equal((<any>EmailService).ACCOUNT_DELETE_EMAIL_SUBJECT);
            expect(email.data.html).to.contain(App.get('domain'));
            expect(email.data.html).to.contain(token.id);
          });
      });
  }

  @test('should send account delete confirmation email')
  test_send_account_delete_confirmation_email() {
    let user = usersMock.get(1)[0];

    return EmailService.sendAccountDeleteConfirmationEmail(user)
      .then(() => {
        let email = EmailUtils.getLastSentEmail();

        expect(email).to.exist;
        expect(email.data.to).to.equal(user.email);
        expect(email.data.from).to.equal(App.get('email'));
        expect(email.data.subject).to.equal((<any>EmailService).ACCOUNT_DELETE_CONFIRMATION_EMAIL_SUBJECT);
        expect(email.data.html).to.contain(App.get('domain'));
      });
  }

  @test('should send contact us email')
  test_send_contact_us_email() {
    let contact = {
      email: faker.internet.email(),
      name: faker.name.title(),
      message: faker.lorem.sentence(),
      phone: faker.phone.phoneNumber()
    };

    return EmailService.sendContactUsEmail(contact)
      .then(() => {
        let email = EmailUtils.getLastSentEmail();

        expect(email).to.exist;
        expect(email.data.to).to.equal(App.get('email'));
        expect(email.data.from).to.equal(contact.email);
        expect(email.data.subject).to.equal((<any>EmailService).CONTACT_US_EMAIL_SUBJECT);
        expect(email.data.html).to.contain(contact.name);
        expect(email.data.html).to.contain(contact.email);
        expect(email.data.html).to.contain(contact.message);
        expect(email.data.html).to.contain(contact.phone);
      });
  }
}
