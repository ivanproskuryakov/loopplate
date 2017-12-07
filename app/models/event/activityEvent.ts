import {Promise} from 'es6-promise';
import * as bluebird from 'bluebird';
import {Server} from 'app/server/interface/server';
import {ServerError} from 'app/error/serverError';
import {ActivityService} from 'app/service/activityService';
import {Activity} from 'app/models/interface/activity';

/**
 * Events related methods for Activity model
 * @class ActivityEvent
 */
export class ActivityEvent {

  /**
   * @param {Server} app
   * @param {Object} ctx
   * @returns {Promise}
   */
  public static onActivitySaved(app: Server, ctx: any): Promise<void> {
    if (!ctx.instance || !ctx.isNewInstance) {
      return Promise.resolve<void>();
    }
  }

  /**
   * @static
   * @param {Server} app
   * @param {Object} ctx
   * @returns {Promise}
   */
  public static onBeforeRemoteFindOne(app: Server, ctx: any): Promise<void> {
    // fix filter if `username` filter is applied
    let where = (ctx.args.filter || {}).where;
    if (!where || !where.username) {
      return Promise.resolve<void>();
    }

    return app.models.user
      .findOne({where: {username: where.username}})
      .then(user => {
        if (!user) {

          return Promise.reject(ServerError('User not found', 404));
        }

        delete where.username;
        where.userId = user.id;
      });
  }

  /**
   * @static
   * @param {Server} app
   * @param {Object} ctx
   * @returns {Promise}
   */
  public static onRemoteFindOne(app: Server, ctx: any): Promise<void> {

    return ActivityService.activityDetailsInjections(app, ctx.result, ctx.req.user)
      .then(activity => ctx.result = activity)
      .then(() => ActivityService.updateActivityViews(app, ctx.result, ctx.req));
  }

  /**
   * @static
   * @param {Server} app
   * @param {Object} ctx
   * @returns {Promise}
   */
  public static onRemoteFindById(app: Server, ctx: any): Promise<void> {

    return ActivityService.activityDetailsInjections(app, ctx.result, ctx.req.user)
      .then(activity => ctx.result = activity)
      .then(() => ActivityService.updateActivityViews(app, ctx.result, ctx.req));
  }

  /**
   * @static
   * @param {Server} app
   * @param {Object} ctx
   * @returns {Promise}
   */
  public static onRemoteFind(app: Server, ctx: any): Promise<void> {

    return bluebird.map(
      ctx.result,
      (activity: Activity) => ActivityService.activityCollectionInjections(app, activity, ctx.req.user),
      {concurrency: 3}
    )
      .then<void>(result => {
        ctx.result = result;
      });
  }


}
