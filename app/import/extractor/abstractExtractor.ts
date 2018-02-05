import {Promise} from 'es6-promise';
import * as cheerio from 'cheerio';
import CheerioStatic from 'cheerio';
const moment = require('moment');

import {Activity} from 'app/interface/activity/activity';
import {ActivityType} from 'app/interface/activity/activityType';
import {User} from 'app/interface/user/user';
import {HttpHelper} from 'app/helper/httpHelper';
import {TagsAnalyzer} from 'app/models/service/activity/tagsAnalyzer';
import {TagsBlackList} from 'app/blackList/tagsBlacklist';

export abstract class AbstractExtractor {

  protected name: string[] = [];
  protected description: string[] = [];
  protected tags: string[] = [];
  protected image: string[] = [];
  protected video: string[] = [];
  protected createdAt: string[] = [];

  protected html: string;
  protected user: User;
  protected category: string;
  protected type: ActivityType;
  protected source: string;

  /**
   * @param {User} user
   * @param {string} category
   * @param {ActivityType} type
   * @returns {Promise<Activity>}
   */
  public extractActivity(user, category, type): Promise<Activity> {
    this.user = user;
    this.category = category;
    this.type = type;

    return HttpHelper
      .download(this.source, true, {jar: true} /* enable cookies */)
      .then(response => HttpHelper.readResponse(response))
      .then(html => this.collect(html))
      .then(() => this.buildActivity());
  }

  /**
   * @returns {AbstractExtractor}
   */
  public setSource(source): AbstractExtractor {
    this.source = source;

    return this;
  }

  /**
   * @returns {string}
   */
  public getHTML(): string {
    return this.html;
  }

  /**
   * @protected
   * @abstract
   * @param {Cheerio} $
   */
  protected abstract setName($: CheerioStatic): void;

  /**
   * @protected
   * @abstract
   * @param {Cheerio} $
   */
  protected abstract setDescription($: CheerioStatic): void;

  /**
   * @protected
   * @abstract
   * @param {Cheerio} $
   */
  protected abstract setImage($: CheerioStatic): void;


  /**
   * @protected
   * @abstract
   * @param {Cheerio} $
   */
  protected abstract setVideo($: CheerioStatic): void;

  /**
   * @protected
   * @abstract
   * @param {Cheerio} $
   */
  protected abstract setCreatedAt($: CheerioStatic): void;

  /**
   * @protected
   * @abstract
   * @param {Cheerio} $
   */
  protected abstract setTags($: CheerioStatic): void;

  /**
   * @returns {string}
   */
  private getName(): string {
    let result = this
      .filterValidItems(this.name)
      .sort((a, b) => a.length - b.length);

    return result.length > 0 ? result[0] : undefined;
  }

  /**
   * @returns {string}
   */
  private getDescription(): string {
    let result = this
      .filterValidItems(this.description)
      .sort((a, b) => b.length - a.length);

    return result.length > 0 ? result[0] : undefined;
  }

  /**
   * @returns {string}
   */
  private getImage(): string {
    return this.firstOrDefault(this.image, undefined);
  }

  /**
   * @returns {string}
   */
  private getVideo(): string {
    return this.firstOrDefault(this.video, undefined);
  }

  /**
   * @returns {Date}
   */
  private getCreatedAt(): Date {
    return this.toDate(
        this.firstOrDefault(this.createdAt, null)
      ) || new Date();
  }

  /**
   *
   * @returns {string[]}
   */
  private getTags(): string[] {
    return this.tags;
  }

  /**
   * filter array from false(y) values
   * return first or default
   * @param {Object[]} args
   * @param {Object} defaultValue
   * @returns {Object}
   */
  private firstOrDefault(args: any[], defaultValue: any): any {
    let result = this.filterValidItems(args);

    return result.length > 0 ? result[0] : defaultValue;
  }

  /**
   * filter array from false(y) values
   * @param {Object[]} args
   * @returns {Object[]}
   */
  private filterValidItems(args: any[]): any[] {
    return args.filter(x => !!x);
  }

  /**
   * converts text to Date
   * returns null if date is in future or not valid date
   * @protected
   * @param {string | Date} text
   * @returns {Date}
   */
  private toDate(text: string | Date): Date {
    let date = moment(text);

    // check if date is in the future
    if (date.isAfter()) {
      return null;
    } else if (date.isValid()) {
      return date.toDate();
    } else {
      return null;
    }
  }

  /**
   * Collect data by calling setters
   * @param {string} html
   * @returns {Promise}
   */
  private collect(html): Promise<void> {

    return new Promise<void>(resolve => {
      // load html into cheerio object
      let $ = cheerio.load(html);
      this.html = $.html();

      // call setters
      this.setName($);
      this.setDescription($);
      this.setImage($);
      this.setVideo($);
      this.setCreatedAt($);
      this.setTags($);

      resolve();
    });
  }

  /**
   * create activity
   * @returns {Promise<Activity>}
   */
  private buildActivity(): Promise<Activity> {
    return new Promise<Activity>(resolve => {
      let activity: Activity = {
        name: this.getName(),
        description: this.getDescription(),
        tags: [],
        createdAt: this.getCreatedAt(),
        media: [],
        // from constructor
        userId: this.user.id,
        type: this.type,
        source: this.source,
        category: this.category
      };
      new TagsAnalyzer().analyzeAndUpdateActivityTags(activity, this.getTags(), new TagsBlackList());

      let image = this.getImage();
      if (image) {
        activity.media.push({
          location: image,
          main: true,
          type: 'image'
        });
      }

      let video = this.getVideo();
      if (video) {
        activity.media.push({
          location: video,
          type: 'video'
        });
      }

      resolve(activity);
    });
  }

}
