import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';

import * as faker from 'faker';
import {EmailUtils} from 'app/test/utils/emailUtils';

import * as App from 'app/server/server';
import {EmailService} from 'app/service/emailService';
import {ContactEvent} from 'app/models/event/contactEvent';

@suite('Models - Events - ContactEventTest')
export class ContactEventTest {

  @test('should send email when creating')
  test_send_email(done) {
    let contact = {
      email: faker.internet.email(),
      name: faker.name.title(),
      message: faker.lorem.sentence(),
      phone: faker.phone.phoneNumber()
    };
    let ctx = {
      instance: contact,
      isNewInstance: true
    };

    ContactEvent.onSaved(ctx)
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
      })
      .then(() => done())
      .catch(done);
  }
}
