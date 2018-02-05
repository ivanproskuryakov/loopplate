import {Promise} from 'es6-promise';

let stream = require('getstream');
import {ObjectID} from 'mongodb';
import {ServerError} from 'app/error/serverError';
import {User} from 'app/interface/user/user';
import {Activity} from 'app/interface/activity/activity';
import {ActivityService} from 'app/models/service/activity/activityService';
import * as App from "app/server/server";

/**
 * @classdesc getstream.io client
 */
export class TimelineService {
  /**
   * @const
   */
  private static readonly DEFAULT_PAGE_SIZE = 25;
  /**
   * @const
   */
  private static readonly TIMELINE_NAME = 'timeline';

  /**
   * get user's timeline feed
   * @see https://getstream.io/docs/#retrieve
   * @param {User} user
   * @param {number} [limit] defaults to TimelineService.DefaultPageSize
   * @param {number} [offset=0]
   * @returns {Promise<Activity[]>}
   */
  public getTimeline(user: User, limit?: number, offset?: number): Promise<Activity[]> {
    let client = this.getClient();
    let feed = client.feed(TimelineService.TIMELINE_NAME, user.id);
    let filter = {
      limit: limit || TimelineService.DEFAULT_PAGE_SIZE,
      offset: offset || 0
    };

    return feed.get(filter)
      .then(data => data.results.map(item => new ObjectID(item.timelineId)))
      .then(ids => ActivityService.getActivities({
        where: {id: {in: ids}},
        order: 'createdAt DESC'
      }, user));
  }

  /**
   * add activity to getstream.io
   * @see https://getstream.io/docs/#adding-activities
   * @param {Activity} activity
   * @returns {Promise}
   */
  public add(activity: Activity): Promise<void> {
    let client = this.getClient();
    let feed = client.feed('user', activity.userId);

    return feed.addActivity({
      actor: activity.userId,
      verb: 'add',
      object: activity,
      timelineId: activity.id,
      time: activity.createdAt,
      // custom tags
      tags: activity.tags,
      name: activity.name,
      description: activity.description,
      category: activity.category
    })
      .then(result => App.models.Activity.update(
        {id: activity.id},
        {timelineId: result.id})
      );
  }

  /**
   * follow other user's activities with timeline feed
   * @see https://getstream.io/docs/#following
   * @param {string} userId
   * @param {string} followerId
   * @returns {Promise}
   */
  public follow(userId: string, followerId: string): Promise<void> {
    if (userId.toString() === followerId.toString()) {

      return Promise.reject(new ServerError('Conflict', 409));
    }

    let client = this.getClient();
    let timeline = client.feed(TimelineService.TIMELINE_NAME, userId);

    return timeline.follow('user', followerId)
      .then(() => App.models.user.findById(followerId))
      .then(follower => follower.followers.add(userId));
  }

  /**
   * unfollow other user's activities with timeline feed
   * @see https://getstream.io/docs/#unfollowing
   * @param {string} userId
   * @param {string} followerId
   * @param {boolean} [keepHistory]
   * @returns {Promise}
   */
  public unfollow(userId: string, followerId: string, keepHistory?: boolean): Promise<void> {
    let client = this.getClient();
    let timeline = client.feed(TimelineService.TIMELINE_NAME, userId);

    return timeline.unfollow('user', followerId, keepHistory || false)
      .then(() => App.models.user.findById(followerId))
      .then(follower => {

        return follower.followers.exists(userId)
          .then(exists => {
            if (!exists) {

              return Promise.reject(new ServerError('Conflict', 409));
            }

            return follower.followers.remove(userId);
          });
      });
  }

  /**
   * @private
   * @returns {Object}
   */
  private getClient(): any {
    // if disabled then return dummy object
    if (App.get('getstream').disable) {

      return this.mockClient();
    } else {
      // Instantiate a new client (server side)
      return stream.connect(App.get('getstream').apiKey,
        App.get('getstream').apiSecret,
        App.get('getstream').appId);
    }
  }

  /**
   * returns mock client of getstream.io
   * @returns {Object}
   */
  private mockClient() {

    return {
      feed: (name: string, id: string) => {

        return {
          get: (filter: any) => Promise.resolve([]),
          addActivity: (activity: any) => Promise.resolve({id: 'mock id'}),
          follow: (name: string, target: string) => Promise.resolve(),
          unfollow: (name: string, target: string, keepHistory?: boolean) => Promise.resolve(),
        };
      }
    };
  }
}
