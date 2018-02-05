import {CronJob} from 'cron';
import {SummaryReporter} from 'app/service/summaryReporter';

new CronJob({
  cronTime: '0 59 23 * * *',
  onTick: () => {
    console.log('starting ...');

    new SummaryReporter()
      .sendTodaySummary()
      .then(() => {
        console.log('finished');
      });
  },
  start: true
});
