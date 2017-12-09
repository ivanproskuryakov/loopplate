import {Promise} from 'es6-promise';
import {Request} from 'express';
import * as bluebird from 'bluebird';
import * as _ from 'lodash';
let isbot = require('isbot');

import {Server} from 'app/server/interface/server';
import {User} from 'app/models/interface/user';
import {Activity} from 'app/models/interface/activity';
import {MediaType} from 'app/models/interface/media';
import {UserService} from 'app/service/userService';

/**
 * ActivityService
 */
export class ActivityService {

  /**
   * create an rest GET endpoint url point to activity
   * @param {Request} req express's request object
   * @param {string} id
   * @returns {string}
   */
  public static getLocationUrl(req: Request, id: string): string {
    return `${req.protocol}://${req.get('Host')}/api/Activities/${id}`;
  }

  /**
   *
   * @param {Server} app
   * @param {User} user
   * @param {Object} payload
   * @returns {Promise<Activity>}
   */
  public static post(app: Server, user: User, payload: any): Promise<Activity> {

    return ActivityService.validateActivity(payload)
      .then<Activity>(() => {
        return {
          name: payload.name,
          description: payload.description,
          category: payload.category,
          type: payload.type,
          source: payload.source,
          tags: [],
          media: payload.media,
          userId: user.id
        };
      })
      .then(activity => {
        if (payload.tags) {
          new TagsAnalyzer(app).analyze(activity, payload.tags);
        }

        if (<ActivityType>payload.type !== 'link') {
          return Promise.resolve(activity);
        }

        // run extractor
        let extractor = new MetaExtractor();

        return extractor
          .setSource(activity.source)
          .extractActivity(user, activity.category, activity.type)
          .then(result => new TagsAnalyzer(app).fillTags(result, extractor.getHTML()))
          .then(result => {
            activity.name = activity.name || result.name;
            activity.description = activity.description || result.description;
            activity.tags = _.isEmpty(activity.tags) ? result.tags : activity.tags;
            activity.media = activity.media || result.media;

            return activity;
          });
      })
      .then(activity => app.models.Activity.create(activity))
      .then(activity => activity.toJSON());
  }

  /**
   * returns activities by {@link filter}
   * @static
   * @param {Server} app
   * @param {Object} filter
   * @param {User} currentUser
   * @returns {Promise<Activity[]>}
   */
  public static getActivities(app: Server, filter: any, currentUser: User): Promise<Activity[]> {

    return app.models.Activity.find(filter)
      .then(activities => bluebird.map(
        activities,
        (activity: Activity) => ActivityService.activityDetailsInjections(app, activity, currentUser),
        {concurrency: 10})
      );
  }

  /**
   * saves view object on {@link activity}, with unique ip's only
   * @static
   * @param {Server} app
   * @param {Activity} activity
   * @param {Request} req
   * @returns {Promise}
   */
  public static updateActivityViews(app: Server, activity: Activity, req: any): Promise<void> {
    if (!activity) {

      return Promise.resolve<void>();
    }

    if (isbot(req.headers['user-agent'])) {
      return Promise.resolve<void>();
    }

    let ip = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    if (!ip) {
      return Promise.resolve<void>();
    }

    let view = {
      ip: ip,
      userId: req.user ? req.user.id : undefined
    };

    return app.models.Activity.update(
      {id: activity.id, 'views.ip': {ne: ip}},
      {$push: {views: view}},
      {allowExtendedOperators: true}
    );
  }

  /**
   * @static
   * @param {Server} app
   * @param {Activity} activity
   * @param {User} currentUser
   * @returns {Promise<Activity>}
   */
  public static activityDetailsInjections(app: Server, activity: Activity, currentUser: User): Promise<Activity> {
    if (!activity) {
      return Promise.resolve(null);
    }

    let activityJson: any = activity.toJSON ? activity.toJSON() : activity;

    return bluebird
      .all([
        ActivityService.injectProperties(activityJson, currentUser),
        UserService.injectUserProfile(app, activityJson, currentUser),
      ])
      .then(() => activityJson);
  }

  /**
   * @static
   * @param {Server} app
   * @param {Activity} activity
   * @param {User} currentUser
   * @returns {Promise<Activity>}
   */
  public static activityCollectionInjections(app: Server, activity: Activity, currentUser: User): Promise<Activity> {
    if (!activity) {
      return Promise.resolve(null);
    }
    let activityJson: any = activity.toJSON ? activity.toJSON() : activity;

    return bluebird
      .all([
        ActivityService.injectProperties(activityJson, currentUser),
        UserService.injectUser(app, activityJson)
      ])
      .then(() => activityJson);
  }

  /**
   * @static
   * @param {Activity} activity
   * @param {User} user
   * @returns {Promise}
   */
  public static injectProperties(activity: Activity, user: User): Promise<Activity> {
    return new Promise<Activity>((resolve, reject) => {

      activity.likesCount = activity.likedUserIds.length;
      activity.viewsCount = (activity.views && activity.views.length) || 0;
      activity.isLiked = false;

      if (user) {
        activity.isLiked = activity.likedUserIds.filter(item => item.toString() === user.id.toString()).length > 0;
      }

      resolve(activity);
    });
  }

  /**
   * @param {Server} app
   * @param {Activity} activity
   * @returns {string}
   */
  public static getActivityUrl(app: Server, activity: Activity): string {

    return `http://${app.get('domain')}/u/${activity.user.username}/a/${activity.slug}`;
  }


}
