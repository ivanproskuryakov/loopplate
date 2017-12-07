import {Promise} from 'es6-promise';
import * as bluebird from 'bluebird';
import {writeFile} from 'fs';
import {UserService} from 'app/service/userService';
import {SitemapEntryInterface} from 'app/service/sitemap/sitemapEntryInterface';
import {User} from 'app/models/interface/user';
import * as App from 'app/server/server';

let sm = require('sitemap');


/**
 * @class SitemapService
 */
export class SitemapService {

  /**
   * @constant
   * @type {number}
   */
  private readonly DEFAULT_PRIORITY = 0.5;

  /**
   * create a sitemap in specified path
   * @param {string} path
   */
  public generate(path: string): Promise<void> {

    return bluebird.all([
      this.getRoutes(),
      this.getUsers()
    ])
      .then<string[]>((results: [string[]]) =>
        results.reduce((chain, items) => chain.concat(items), [])
      )
      .then<string>(urls => new Promise(resolve => {
        let sitemap = sm.createSitemap({
          hostname: App.get('domain'),
          urls: urls
        });
        let xml = sitemap.toXML();

        resolve(xml);
      }))
      .then(xml => new Promise((resolve, reject) => {
        writeFile(path, xml, err => {
          if (err) {
            return reject(err);
          }

          resolve();
        });
      }));
  }

  private getRoutes(): Promise<SitemapEntryInterface[]> {
    let index = this.getSitemapEntry(`http://${App.get('domain')}`, 0.8, 'hourly');

    return Promise.resolve([index]);
  }

  private getUsers(): Promise<SitemapEntryInterface[]> {

    return App.models.user
      .find({
        where: {type: 'website'},
        fields: ['username']
      })
      .then((users: User[]) =>
        bluebird.map(users, user =>
          this.getSitemapEntry(
            UserService.getUserUrl(App, user),
            this.DEFAULT_PRIORITY,
            'hourly'
          )
        )
      );
  }

  /**
   *
   * @param {string} url
   * @param {number} priority
   * @param {string} changefreq
   * @param {Date} [lastmod]
   */
  private getSitemapEntry(url: string,
                          priority: number,
                          changefreq: string,
                          lastmod?: Date): SitemapEntryInterface {

    return {
      url: url,
      priority: priority,
      changefreq: changefreq,
      lastmod: lastmod ? lastmod.toDateString() : undefined
    };
  }
}
