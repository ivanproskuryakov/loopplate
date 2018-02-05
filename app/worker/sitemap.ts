import {CronJob} from 'cron';
import {join} from 'path';
import {SitemapService} from 'app/service/sitemapService';

new CronJob({
  cronTime: '0 0 3 * * *',
  onTick: () => {
    console.log('starting ...');

    let location = join(__dirname, '../../public/sitemap.xml');
    new SitemapService()
      .generate(location)
      .then(() => {
        console.log('finished');
      });
  },
  start: true
});
