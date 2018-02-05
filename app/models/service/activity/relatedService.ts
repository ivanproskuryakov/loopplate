import {Promise} from 'es6-promise';
const moment = require('moment');
import * as _ from 'lodash';
import * as bluebird from 'bluebird';

import * as App from 'app/server/server';
import {ServerError} from 'app/error/serverError';
import {HttpHelper} from 'app/helper/httpHelper';
import {ActivityService} from 'app/models/service/activity/activityService';
import {Activity} from 'app/interface/activity/activity';
import {Tag} from 'app/interface/activity/tag';
import {User} from 'app/interface/user/user';

let Twitter = require('twitter');

export class RelatedService {
  /**
   * @constant
   * @type {string}
   */
  private readonly GIPHY_SEARCH_ENDPOINT = 'http://api.giphy.com/v1/gifs/search';
  /**
   * @constant
   * @type {string}
   */
  private readonly GETTY_IMAGES_SEARCH_ENDPOINT = 'https://api.gettyimages.com/v3/search/images';
  /**
   * @constant
   * @type {string}
   */
  private readonly GOOGLE_PLUS_ACTIVITIES_ENDPOINT = 'https://www.googleapis.com/plus/v1/activities';
  /**
   * @constant
   * @type {string}
   */
  private readonly YOUTUBE_SEARCH_ENDPOINT = 'https://www.googleapis.com/youtube/v3/search';
  /**
   * @constant
   * @type {number}
   */
  private readonly MAX_ITEMS_COUNT = 50;
  /**
   * @constant
   * @type {number}
   */
  private readonly RELATED_ITEMS_COUNT = 20;
  /**
   * @constant
   * @type {number}
   */
  private readonly SEARCH_DAY_FILTER_RANGE = 14;

  /**
   * @constructor
   * @param {User} [currentUser]
   */
  constructor(private currentUser?: User) {
  }

  /**
   * @param {Activity} activity
   * @param {string} resource types: youtube, twitter, gplus, getty, giphy
   * @param {number} [quantity]
   * @returns {object[]}
   */
  public getRelatedResource(activity: Activity, resource: string, quantity?: number): Promise<any[]> {
    quantity = Math.min(quantity || this.RELATED_ITEMS_COUNT, this.MAX_ITEMS_COUNT);

    switch (resource) {
      case 'youtube':
        return this.getYoutube(activity, quantity);
      case 'twitter':
        return this.getTwitter(activity, quantity);
      case 'gplus':
        return this.getGooglePlus(activity, quantity);
      case 'getty':
        return this.getGetty(activity, quantity);
      case 'giphy':
        return this.getGiphy(activity, quantity);
      case 'activity':
        return this.getActivities(activity, quantity);
      default:
        return Promise.reject(new ServerError('Invalid Resource Name', 400));
    }
  }

  /**
   * @param {string} id
   * @param {string} resource types: youtube, twitter, gplus, getty, giphy
   * @param {number} [quantity]
   * @returns {object[]}
   */
  public getRelatedResourceById(id: string, resource: string, quantity?: number): Promise<any[]> {

    return App.models.Activity
      .findById(id)
      .then(activity => {
        if (!activity) {
          return Promise.reject(new ServerError('Not Found', 404));
        }

        return this.getRelatedResource(activity, resource, quantity);
      });
  }

  /**
   * @param {Activity} activity
   * @param {number} quantity
   * @returns {Promise<object[]>}
   */
  private getYoutube(activity: Activity, quantity: number): Promise<any[]> {
    let tags = this.getValidTags(activity);

    let key = App.get('google').key;
    let part = 'snippet';
    let q = this.extractWords(tags.map(x => x.value)).join('|');
    let maxResults = quantity;
    let type = 'video';
    let order = 'date';
    let publishedAfter = moment(activity.createdAt).subtract(this.SEARCH_DAY_FILTER_RANGE, 'days').toISOString();

    return HttpHelper
      .download(
        this.YOUTUBE_SEARCH_ENDPOINT,
        true,
        {
          qs: {
            q,
            part,
            maxResults,
            type,
            key,
            order,
            publishedAfter
          }
        }
      )
      .then(response => HttpHelper.readResponse(response))
      .then(json => JSON.parse(json).items);
  }

  /**
   * @param {Activity} activity
   * @param {number} quantity
   * @returns {Promise<object[]>}
   */
  private getTwitter(activity: Activity, quantity: number): Promise<any[]> {

    return new Promise((resolve, reject) => {
      let tags = this.getValidTags(activity);
      if (tags.length === 0) {
        return resolve([]);
      }

      let options = App.get('twitter');
      let client = new Twitter({
        consumer_key: options.key,
        consumer_secret: options.secret,
        access_token_key: options.accessToken,
        access_token_secret: options.accessTokenSecret
      });
      let q = this.extractWords(tags.map(x => x.value)).join('+AND+') + ' filter:safe -filter:retweets';
      let result_type = 'popular';
      let count = quantity;
      let include_entities = false;
      let since = moment(activity.createdAt).subtract(this.SEARCH_DAY_FILTER_RANGE, 'days').format('YYYY-MM-DD');
      let until = moment(activity.createdAt).add(this.SEARCH_DAY_FILTER_RANGE, 'days').format('YYYY-MM-DD');

      client.get('search/tweets', {
        q,
        result_type,
        count,
        include_entities,
        since,
        until
      }, (err: Error, tweets) => {
        if (err) {
          if (err[0]) {

            return reject(new Error(err[0].message));
          } else {

            return reject(err);
          }
        }

        resolve(tweets.statuses);
      });
    });
  }

  /**
   * @param {Activity} activity
   * @param {number} quantity
   * @returns {Promise<object[]>}
   */
  private getGooglePlus(activity: Activity, quantity: number): Promise<any[]> {
    let tags = this.getValidTags(activity);
    if (tags.length === 0) {
      return Promise.resolve([]);
    }

    let key = App.get('google').key;
    let query = tags.map(x => x.value).join(' ');
    let maxResults = quantity;
    let orderBy = 'recent';

    return HttpHelper
      .download(
        this.GOOGLE_PLUS_ACTIVITIES_ENDPOINT,
        true,
        {
          qs: {
            query,
            maxResults,
            key,
            orderBy,
          }
        }
      )
      .then(response => HttpHelper.readResponse(response))
      .then(json => JSON.parse(json).items);
  }

  /**
   * @param {Activity} activity
   * @param {number} quantity
   * @returns {Promise<object[]>}
   */
  private getGetty(activity: Activity, quantity: number): Promise<any[]> {
    let tags = this.getValidTags(activity);
    if (tags.length === 0) {
      return Promise.resolve([]);
    }

    let key = App.get('gettyimages').key;
    let phrase = tags.map(x => x.value).join(' or ');
    let page_size = quantity;
    let sort_order = 'newest';
    let minimum_size = 'medium';
    let fields = 'detail_set';

    return HttpHelper
      .download(
        this.GETTY_IMAGES_SEARCH_ENDPOINT,
        true,
        {
          qs: {
            phrase,
            page_size,
            sort_order,
            minimum_size,
            fields
          },
          headers: {
            'Api-Key': key
          }
        }
      )
      .then(response => HttpHelper.readResponse(response))
      .then(json => JSON.parse(json).images);
  }

  /**
   * @param {Activity} activity
   * @param {number} quantity
   * @returns {Promise<object[]>}
   */
  private getGiphy(activity: Activity, quantity: number): Promise<any[]> {
    let tags = this.getValidTags(activity);
    if (tags.length === 0) {
      return Promise.resolve([]);
    }

    let api_key = App.get('giphy').key;
    let q = this.extractWords(tags.map(x => x.value)).join(' ');
    let limit = quantity;

    return HttpHelper
      .download(
        this.GIPHY_SEARCH_ENDPOINT,
        true,
        {
          qs: {
            api_key,
            q,
            limit
          }
        }
      )
      .then(response => HttpHelper.readResponse(response))
      .then(json => JSON.parse(json).data);
  }

  /**
   * @param {Activity} activity
   * @param {number} quantity
   * @returns {Promise<Activity[]>}
   */
  private getActivities(activity: Activity, quantity: number): Promise<Activity[]> {
    let tags = _.take(this.getValidTags(activity), 1);

    if (tags.length === 0) {
      return Promise.resolve([]);
    }

    let query: any = {
      where: {
        and: [
          {
            createdAt: {gte: moment(activity.createdAt).subtract(this.SEARCH_DAY_FILTER_RANGE, 'days').toDate()}
          }, {
            createdAt: {lte: moment(activity.createdAt).add(this.SEARCH_DAY_FILTER_RANGE, 'days').toDate()}
          },
          {category: activity.category},
          {id: {ne: activity.id}}
        ]
      },
      limit: quantity
    };

    return App.models.Activity
      .find(query)
      .then(activities => bluebird.map(
        activities,
        (activity: Activity) => ActivityService.activityDetailsInjections(activity, this.currentUser),
        {concurrency: 10}
      ));
  }

  /**
   * filter tags with black list
   * @param {Activity} activity
   * @returns {Tag[]}
   */
  private getValidTags(activity: Activity): Tag[] {
    const MAX_TAGS = 3;

    return _.take(
      activity.tags,
      MAX_TAGS
    );
  }

  /**
   *
   * @param {string} tags
   */
  private extractWords(tags: string[]): string[] {
    return tags.map(tag => _.words(tag).join(' '));
  }
}
