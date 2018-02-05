import {Promise} from 'es6-promise';
import {join} from 'path';
import {Request} from 'express';
import * as bluebird from 'bluebird';
import * as _ from 'lodash';

import {ServerError} from 'app/error/serverError';
import {User} from 'app/interface/user/user';
import {Activity} from 'app/interface/activity/activity';
import {ActivityRepository} from 'app/models/repository/activityRepository';
import {CommentRepository} from 'app/models/repository/commentRepository';
import {ActivityType} from 'app/interface/activity/activityType';
import {MediaType} from 'app/interface/media/media';
import {UserService} from 'app/models/service/user/userService';
import {CommentService} from 'app/models/service/commentService';
import {TagsAnalyzer} from 'app/models/service/activity/tagsAnalyzer';
import {MetaExtractor} from 'app/import/extractor/metaExtractor';
import * as App from 'app/server/server';

const moment = require('moment');
let isbot = require('isbot');

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
   * @param {User} user
   * @param {Object} payload
   * @returns {Promise<Activity>}
   */
  public static post(user: User, payload: any): Promise<Activity> {
    const activityRepository = new ActivityRepository();

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
          new TagsAnalyzer().analyzeAndUpdateActivityTags(activity, payload.tags);
        }

        if (<ActivityType>payload.type !== 'link') {
          return Promise.resolve(activity);
        }

        // run extractor
        let extractor = new MetaExtractor();

        return extractor
          .setSource(activity.source)
          .extractActivity(user, activity.category, activity.type)
          .then(result => new TagsAnalyzer().setActivityTags(result, extractor.getHTML()))
          .then(result => {
            activity.name = activity.name || result.name;
            activity.description = activity.description || result.description;
            activity.tags = _.isEmpty(activity.tags) ? result.tags : activity.tags;
            activity.media = activity.media || result.media;

            return activity;
          });
      })
      .then(activity => activityRepository.create(activity))
      .then(activity => activity.toJSON());
  }

  /**
   * @param {User} user
   * @param {string} id
   * @returns {Promise<User>}
   */
  public static like(user: User, id: string): Promise<User> {
    let activityRepository = new ActivityRepository();

    return activityRepository.findById(id)
      .then(activity => {

        if (!activity) {
          return Promise.reject(
            new ServerError('activity not found', 404)
          );
        }

        return activity.likes.add(user.id);
      });
  }

  /**
   * @param {User} user
   * @param {string} id
   * @returns {Promise<User>}
   */
  public static dislike(user: User, id: string): Promise<User> {
    const activityRepository = new ActivityRepository();

    return activityRepository.findById(id)
      .then(activity => {
        if (!activity) {
          return Promise.reject(
            new ServerError('activity not found', 404)
          );
        }

        return activity.likes.exists(user.id)
          .then(exists => {
            if (!exists) {
              return Promise.reject(
                new ServerError('Conflict', 409)
              );
            }

            return activity.likes.remove(user.id);
          });
      });
  }

  /**
   * @static
   * @param {Object} filter
   * @param {User} currentUser
   * @returns {Promise<Activity[]>}
   */
  public static getActivities(filter: any, currentUser: User): Promise<(void | Activity)[]> {
    const activityRepository = new ActivityRepository();

    return activityRepository
      .findByFilter(filter)
      .then(activities => bluebird.map(activities,
        (activity: Activity) => ActivityService.activityDetailsInjections(activity, currentUser),
        {concurrency: 10}
      ));
  }

  /**
   * saves view object on {@link activity}, with unique ip's only
   * @static
   * @param {Activity} activity
   * @param {Request} req
   * @returns {Promise}
   */
  public static updateActivityViews(activity: Activity, req: any): Promise<void | Activity> {
    const activityRepository = new ActivityRepository();

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

    return activityRepository.update(
      {id: activity.id, 'views.ip': {ne: ip}},
      {$push: {views: view}},
      {allowExtendedOperators: true}
    );
  }

  /**
   * @static
   * @param {Activity} activity
   * @param {User} currentUser
   * @returns {Promise<Activity>}
   */
  public static activityDetailsInjections(activity: Activity, currentUser: User): bluebird<Activity | void> {
    if (!activity) {
      return bluebird.resolve();
    }

    let activityJson: any = activity.toJSON ? activity.toJSON() : activity;

    return bluebird
      .all([
        ActivityService.injectProperties(activityJson, currentUser),
        UserService.injectUserProfile(activityJson, currentUser),
        CommentService.injectComments(activityJson, currentUser)
      ])
      .then(() => activityJson);
  }

  /**
   * @static
   * @param {Activity} activity
   * @param {User} currentUser
   * @returns {Promise<Activity>}
   */
  public static activityCollectionInjections(activity: Activity, currentUser: User): bluebird<Activity | void> {
    if (!activity) {
      return bluebird.resolve();
    }

    let activityJson: any = activity.toJSON ? activity.toJSON() : activity;

    return bluebird
      .all([
        ActivityService.injectProperties(activityJson, currentUser),
        UserService.injectUser(activityJson)
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
    activity.likesCount = activity.likedUserIds.length;
    activity.viewsCount = (activity.views && activity.views.length) || 0;
    activity.isLiked = false;

    if (user) {
      activity.isLiked = activity.likedUserIds.filter(item => item.toString() === user.id.toString()).length > 0;
    }

    return Promise.resolve(activity);
  }


  /**
   * returns main media location
   * @param {Activity} activity
   * @param {MediaType} mediaType
   * @returns {string}
   */
  public static getMainMediaUrl(activity: Activity, mediaType: MediaType): string {
    let media = activity.media
      .filter(m => m.type === mediaType && m.main);

    if (media.length === 0) {
      return null;
    } else {
      return media[0].location;
    }
  }

  /**
   * returns full url to activity
   * @param {Activity} activity
   * @returns {string}
   */
  public static getActivityUrl(activity: Activity): string {
    return `http://${App.get('domain')}/u/${activity.user.username}/a/${activity.slug}`;
  }

  /**
   * returns full url to activity's related resources
   * @param {Activity} activity
   * @param {string} resource
   * @returns {string}
   */
  public static getActivityRelatedUrl(activity: Activity, resource: string): string {
    return `http://${App.get('domain')}/u/${activity.user.username}/a/${activity.slug}/${resource}`;
  }

  /**
   * @returns {Promise<number>}
   */
  public static removeUnusedRssActivities(): Promise<number> {
    const activityRepository = new ActivityRepository();
    const commentRepository = new CommentRepository();

    let minDate = moment().subtract(30, 'days').endOf('day').toDate();
    let activityQuery = {
      where: {
        type: 'rss',
        createdAt: {lte: minDate},
        'achievements.0': {exists: false},
        'likedUserIds.0': {exists: false}
      },
      fields: ['id']
    };

    return activityRepository.findByFilter(activityQuery)
      .then(activities => {
        let activityIds = activities.map(x => x.id);
        let commentQuery = {
          where: {
            activityId: {in: activityIds}
          },
          fields: ['activityId']
        };

        return commentRepository.findByFilter(commentQuery)
          .then(comments => {
            let commentActivityIds = comments.map(x => x.activityId);

            return _.differenceBy(activityIds, commentActivityIds, x => x.toString());
          });
      })
      .then(ids => activityRepository.destroyByIds(ids))
      .then(result => result.count);
  }

  /**
   * @returns {string[]}
   */
  public static getCategories(): string[] {
    let path = join(__dirname, '../../../../data/categories.json');
    let json = require(path);

    return json.map(x => x.name);
  }

  /**
   * @param payload
   * @returns {Promise<void>}
   */
  private static validateActivity(payload: any): Promise<void> {
    let error = null;

    if (!payload) {
      return Promise.reject(new ServerError('payload is required', 422));
    }

    let type = <ActivityType>payload.type || '';
    let isNameSet = type === 'text' && !payload.name;
    let isSourceNeeded = type === 'link' && !payload.source;
    let isMediaNeeded = type === 'image' && (payload.media || []).length === 0;

    if (!type) {
      return Promise.reject(new ServerError('type is required', 422));
    }

    if (isNameSet) {
      return Promise.reject(new ServerError('title is required', 422)); // for \'text\' type activity
    }

    if (isSourceNeeded) {
      return Promise.reject(new ServerError('link source is required', 422)); // for \'link\' type activity
    }

    if (isMediaNeeded) {
      return Promise.reject(new ServerError('media is required', 422)); // for \'image\' type activity
    }

    if (error) {
      return Promise.reject(error);
    }

    return Promise.resolve();
  }
}
