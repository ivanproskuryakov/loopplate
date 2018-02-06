import {Promise} from 'es6-promise';
import * as _ from 'lodash';
import * as cheerio from 'cheerio';

let Boilerpipe = require('boilerpipe');

import {Activity} from 'app/interface/activity/activity';
import {Tag} from 'app/interface/activity/tag';
import {YahooClient} from 'app/client/yahooClient';
import {BlacklistInterface} from 'app/interface/blacklistInterface';
import {TagsBlackList} from 'app/blackList/tagsBlacklist';

export class TagsAnalyzer {

  /**
   * extract keywords by analyzing activity's description
   * @param activity
   * @param {string} [page]
   */
  public setActivityTags(activity: Activity, page: string): Promise<Activity> {
    return this
      .fixHtml(page)
      .then(html => this.getArticleText(html))
      .then(text => {

        return new YahooClient()
          .analyzeText(activity.name + '. ' + (text || activity.description))
          .then(keywords => {
            this.analyzeAndUpdateActivityTags(activity, keywords, new TagsBlackList());

            return Promise.resolve(activity);
          });
      });
  }

  /**
   * @param {Activity} activity
   * @param {string[]} tags
   * @param {BlacklistInterface} blacklist
   * @returns {void}
   */
  public analyzeAndUpdateActivityTags(activity: Activity, tags: string[], blacklist?: BlacklistInterface<string>): void {
    let validTags = _.uniq(
      tags
        .map(tag => _.startCase(tag))                                             // make words camelcase
        .map(tag => this.extractChars(tag))                                       // remove non word chars
        .map(tag => blacklist ? blacklist.replace([tag])[0] : tag)                // remove blacklist words
        .filter(tag => !!tag)                                                     // remove empty items
        .filter(tag => _.words(tag).length > 1)                                   // remove one word tags
        .filter(tag => tag.length < 30)                                           // remove "sentence" tags
    );

    // assign tags sorted by rank desc
    activity.tags = _.uniqBy(
      this.rankTags(activity, validTags).concat(activity.tags || []),
      tag => tag.value.toLowerCase()
    )
      .sort((a, b) => b.rank - a.rank);
  }

  /**
   * appeared in title = +2,
   * appeared in description = +1
   * @param {Activity} activity
   * @param {Tag[]} tags
   */
  private rankTags(activity: Activity, tags: string[]): Tag[] {
    const name = this.extractChars(activity.name).toLowerCase();
    const description = this.extractChars(activity.description).toLowerCase();

    return tags.map(tag => {
      let rank = 0;

      if (name.indexOf(tag.toLowerCase()) !== -1) {
        rank += 2;
      }

      if (description.indexOf(tag.toLowerCase()) !== -1) {
        rank += 1;
      }

      return {value: tag, rank};
    });
  }

  private extractChars(text: string): string {
    if (!text) {
      return '';
    }

    return (text.match(/([^\x00-\x7F]|[a-zA-Z0-9])/g) || []).join('');
  }

  /**
   * extracts article tag from html
   * @param {string} html
   */
  private getArticleText(html: string): Promise<string> {
    return this
      .fixHtml(html)
      .then(fixedHtml => {
        return new Promise<string>((resolve, reject) => {
          let boilerpipe = new Boilerpipe({
            extractor: Boilerpipe.Extractor.Article,
            html: fixedHtml
          }, () => boilerpipe.getText((err, text) => {
            if (err) {
              return reject(err);
            }

            resolve(text);
          }));
        });
      });
  }

  /**
   * removes anchor tags within anchor tags
   * @param {string} html
   */
  private fixHtml(html: string): Promise<string> {
    return new Promise<string>(resolve => {
      let $ = cheerio.load(html);
      $('a a').each(function () {
        $(this).remove();
      });

      resolve($.html());
    });
  }

}

