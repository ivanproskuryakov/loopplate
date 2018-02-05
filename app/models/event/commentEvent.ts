import {Promise} from 'es6-promise';
import * as bluebird from 'bluebird';
import {Server} from 'app/server/interface/server';
import {CommentService} from 'app/models/service/commentService';
import {UserService} from 'app/models/service/user/userService';
import {Comment} from 'app/interface/comment';

/**
 * Events related methods for Comment model
 * @see https://docs.mongodb.com/ecosystem/use-cases/storing-comments/#one-document-per-comment
 */
export class CommentEvent {

  /**
   * set slug value on inserted comment, consider parent thread
   * @static
   * @param {Server} app
   * @param {Object} ctx
   * @returns {Promise}
   */
  public static onCommentSaving(app: Server, ctx: any): Promise<void> {
    if (!ctx.instance || !ctx.isNewInstance) {

      return Promise.resolve<void>();
    }

    return CommentService.getSlugs(ctx.instance)
      .then((result) => {
        // set slugs to comment instance
        ctx.instance.slug = result.slug;
        ctx.instance.fullSlug = result.fullSlug;
      });
  }

  /**
   * @static
   * @param {Server} app
   * @param {Object} ctx
   * @returns {Promise}
   */
  public static onRemoteFindOne(app: Server, ctx: any): Promise<void> {
    return this.commentInjections(app, ctx.req, ctx.result)
      .then<void>(result => {
        ctx.result = result;
      });
  }

  /**
   * @static
   * @param {Server} app
   * @param {Object} ctx
   * @returns {Promise}
   */
  public static onRemoteFindById(app: Server, ctx: any): Promise<void> {

    return this.commentInjections(app, ctx.req, ctx.result)
      .then<void>(result => {
        ctx.result = result;
      });
  }

  /**
   * @static
   * @param {Server} app
   * @param {Object} ctx
   * @returns {Promise}
   */
  public static onRemoteFindOrCreate(app: Server, ctx: any): Promise<void> {

    return this.commentInjections(app, ctx.req, ctx.result)
      .then<void>(result => {
        ctx.result = result;
      });
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
      (comment: Comment) => this.commentInjections(app, ctx.req, comment),
      {concurrency: 10}
    )
      .then<void>(result => {
        ctx.result = result;
      });
  }

  /**
   * @static
   * @param {Server} app
   * @param {Object} req
   * @param {Comment} comment
   * @returns {Promise<Comment>}
   */
  private static commentInjections(app: Server, req: any, comment: Comment): Promise<Comment> {
    if (!comment) {
      return Promise.resolve(null);
    }
    let commentJson = comment.toJSON();

    return bluebird.all([
      CommentService.injectReplyToUser(commentJson, req.user),
      UserService.injectUserProfile(commentJson, req.user)
    ])
      .then(() => commentJson);
  }
}
