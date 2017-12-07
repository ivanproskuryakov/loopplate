import {CronJob} from 'cron';
import * as App from 'app/server/server';
import {SummaryReporter} from 'app/service/summary/summaryReporter';

new CronJob({
  cronTime: '0 59 23 * * *',
  onTick: () => {
    console.log('starting ...');

    new SummaryReporter(App)
      .sendTodaySummary()
      .then(() => {
        console.log('finished');
      });
  },
  start: true
});
