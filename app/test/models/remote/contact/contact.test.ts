import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';

import * as App from 'app/server/server';
import {EmailService} from 'app/service/emailService';

import {EmailUtils} from 'app/test/utils/emailUtils';
import {BaseRouteTest} from 'app/test/models/remote/baseRouteTest';

@suite('Server - Routes - Contact - ContactTest')
export class ContactTest extends BaseRouteTest {

  @test('should send \'contact us\' email')
  test_contact_us(done) {
    let data = {
      email: 'test@mail.com',
      name: 'test 123',
      phone: '123456789',
      message: 'test test test'
    };

    this.getApiClient()
      .post('/contact')
      .send(data)
      .expect(201)
      .expect('Content-Type', /json/)
      .expect('Location', new RegExp(`^${BaseRouteTest.ApiAddress}/contact/`))
      .expect(res => {
        expect(res.body).to.be.empty;

        let email = EmailUtils.getLastSentEmail();

        expect(email).to.exist;
        expect(email.data.to).to.equal(App.get('email'));
        expect(email.data.from).to.equal(data.email);
        expect(email.data.subject).to.equal((<any>EmailService).CONTACT_US_EMAIL_SUBJECT);
        expect(email.data.html).to.contain(data.name);
        expect(email.data.html).to.contain(data.phone);
        expect(email.data.html).to.contain(data.message);
        expect(email.data.html).to.contain(data.email);
      })
      .end(done);
  }

  @test('should throw error with \'email required\' message')
  test_no_email(done) {
    let data = {
      name: 'test',
      phone: 'test',
      message: 'test'
    };
    this.getApiClient()
      .post('/contact')
      .send(data)
      .expect(422)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body.error.details.messages.email[0]).to.equal('can\'t be blank');
      })
      .end(done);
  }

  @test('should throw error with \'name required\' message')
  test_no_name(done) {
    let data = {
      email: 'test',
      phone: 'test',
      message: 'test'
    };
    this.getApiClient()
      .post('/contact')
      .send(data)
      .expect(422)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body.error.details.messages.name[0]).to.equal('can\'t be blank');
      })
      .end(done);
  }

  @test('should throw error with \'message required\' message')
  test_no_message(done) {
    let data = {
      name: 'test',
      email: 'test',
      phone: 'test'
    };
    this.getApiClient()
      .post('/contact')
      .send(data)
      .expect(422)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body.error.details.messages.message[0]).to.equal('can\'t be blank');
      })
      .end(done);
  }
}
