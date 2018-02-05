import {Promise} from 'es6-promise';
import * as bluebird from 'bluebird';
import {ServerError} from 'app/error/serverError';
import {TimelineService} from 'app/models/service/user/timelineService';
import {ActivityService} from 'app/models/service/activity/activityService';
import {Activity} from 'app/interface/activity/activity';
import * as App from 'app/server/server';

/**
 * Events related methods for Activity model
 */
export class ActivityEvent {

  /**
   * activity model after save handler
   * add to timeline
   * @param {Object} ctx
   * @returns {Promise}
   */
  public static onActivitySaved(ctx: any): Promise<void> {
    if (!ctx.instance || !ctx.isNewInstance) {
      return Promise.resolve<void>();
    }

    return new TimelineService().add(ctx.instance);
  }

  /**
   * @static
   * @param {Object} ctx
   * @returns {Promise}
   */
  public static onBeforeRemoteFindOne(ctx: any): Promise<void> {
    // fix filter if `username` filter is applied
    let where = (ctx.args.filter || {}).where;
    if (!where || !where.username) {
      return Promise.resolve<void>();
    }

    return App.models.user
      .findOne({where: {username: where.username}})
      .then(user => {
        if (!user) {

          return Promise.reject(new ServerError('User not found', 404));
        }

        delete where.username;
        where.userId = user.id;
      });
  }

  /**
   * @static
   * @param {Object} ctx
   * @returns {Promise}
   */
  public static onRemoteFindOne(ctx: any): bluebird<void|Activity> {
    return ActivityService
      .activityDetailsInjections(ctx.result, ctx.req.user)
      .then(activity => ctx.result = activity)
      .then(() => ActivityService.updateActivityViews(ctx.result, ctx.req));
  }

  /**
   * @static
   * @param {Object} ctx
   * @returns {Promise}
   */
  public static onRemoteFindById(ctx: any): bluebird<void|Activity> {

    return ActivityService
      .activityDetailsInjections(ctx.result, ctx.req.user)
      .then(activity => ctx.result = activity)
      .then(() => ActivityService.updateActivityViews(ctx.result, ctx.req));
  }

  /**
   * @static
   * @param {Object} ctx
   * @returns {Promise}
   */
  public static onRemoteFind(ctx: any): Promise<void> {

    return bluebird.map(
      ctx.result,
      (activity: Activity) => ActivityService.activityCollectionInjections(activity, ctx.req.user),
      {concurrency: 3}
    )
      .then<void>(result => {
        ctx.result = result;
      });
  }


}
