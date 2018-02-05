import {join} from 'path';
import * as minimist from 'minimist';
import {SitemapService} from 'app/service/sitemapService';

let defaultLocation = join(__dirname, '../../public/sitemap.xml');
let argv: any = minimist(process.argv.slice(2));

new SitemapService()
  .generate(argv.file || defaultLocation)
  .catch(err => console.error(err.message))
  .then(() => {
    console.log('finished');
    process.exit();
  });
