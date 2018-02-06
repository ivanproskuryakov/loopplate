import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';
const moment = require('moment');
import {EmailUtils} from 'app/test/utils/emailUtils';
import {UserUtils} from 'app/test/utils/userUtils';
import * as usersMock from 'app/test/fixtures/models/user';

import * as App from 'app/server/server';
import {SummaryReporter} from 'app/service/summaryReporter';
import {SummaryReportInterface} from 'app/interface/summaryReportInterface';

const user = usersMock.get(1)[0];

@suite('Service - SummaryReporterTest')
export class SummaryReporterTest {

  static before(done) {
    UserUtils.createUser(user)
      .then(() => done())
      .catch(done);
  }

  static after(done) {
    UserUtils.deleteUser(user)
      .then(() => done())
      .catch(done);
  }

  @test('should send email with correct values')
  test_email_send(done) {
    const from = moment(new Date()).startOf('day').toDate();
    const to = moment(new Date()).endOf('day').toDate();

    let reporter = new SummaryReporter();
    let summary: SummaryReportInterface = {
      from: from,
      to: to,
      users: [{
        username: 'test user 1',
        quantity: 10
      }, {
        username: 'test user 2',
        quantity: 20
      }],
      categories: [{
        category: 'test category 1',
        quantity: 10
      }, {
        category: 'test category 1',
        quantity: 20
      }],
      quantity: 50,
      total: 100,
      newUsers: []
    };

    (<any>reporter)
      .getNewUsers(from, to)
      .then(users => {
        summary.newUsers = users;
      })
      .then(() => {
        (<any>reporter).sendEmail(summary)
          .then(() => {

            let email = EmailUtils.getLastSentEmail();

            expect(email).to.exist;
            expect(email.data.from).to.equal(App.get('email'));
            expect(email.data.to).to.equal(App.get('email'));
            expect(email.data.subject).to.equal(SummaryReporter.SUMMARY_EMAIL_SUBJECT);

            summary.newUsers.forEach(user => {
              expect(email.data.html).to.contain(user.username);
              expect(email.data.html).to.contain(user.email);
            });
            summary.users.forEach(user => {
              expect(email.data.html).to.contain(user.username);
              expect(email.data.html).to.contain(`<b>${user.quantity}</b>`);
            });
            summary.categories.forEach(category => {
              expect(email.data.html).to.contain(category.category);
              expect(email.data.html).to.contain(`<b>${category.quantity}</b>`);
            });
            expect(email.data.html).to.contain(`${summary.quantity}`);
            expect(email.data.html).to.contain(`${summary.total}`);
          })
          .then(done)
          .catch(done);
      })


  }
}
