import {Logger} from 'app/helper/logHelper';
import {SummaryReporter} from 'app/service/summaryReporter';

new SummaryReporter()
  .sendTodaySummary()
  .catch(err => {
    new Logger().error(err);
    return Promise.resolve();
  })
  .then(() => {
    console.log('finished');
    process.exit();
  });
