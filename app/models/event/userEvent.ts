import {Promise} from 'es6-promise';
import {Server} from 'app/server/interface/server';
import {User} from 'app/models/interface/user';
import {AccessToken} from 'app/models/interface/accessToken';
import {EmailService} from 'app/service/emailService';
import {UserService} from 'app/service/userService';

export class UserEvent {

  /**
   * @param {Object} ctx
   * @returns {Promise}
   */
  public static onAccountBeforeSaved(ctx: any): Promise<void> {
    if (ctx.instance || ctx.isNewInstance) {
      ctx.instance.importedAt = new Date();
    }

    return Promise.resolve<void>();
  }

  /**
   * user model after save handler
   * send welcome email if user is newly registered
   * @param {Server} app loopback app
   * @param {Object} ctx
   * @returns {Promise}
   */
  public static onAccountAfterSaved(app: Server, ctx: any): Promise<void> {
    if (!ctx.instance || !ctx.isNewInstance) {
      return Promise.resolve<void>();
    }

    return EmailService.sendWelcomeEmail(app, ctx.instance);
  }

  /**
   * send password reset email after /api/users/reset called
   * @see https://github.com/strongloop/loopback/blob/master/common/models/user.js#L545
   * @param {Server} app loopback app
   * @param {User} user
   * @param {AccessToken} accessToken
   * @returns {Promise}
   */
  public static onResetPasswordRequest(app: Server, user: User, accessToken: AccessToken): Promise<void> {
    return EmailService.sendPasswordResetEmail(app, user, accessToken);
  }

  /**
   * @static
   * @param {Server} app
   * @param {Object} ctx
   * @returns {Promise}
   */
  public static onRemoteFindOne(app: Server, ctx: any): Promise<void> {

    return this.userInjections(app, ctx.result)
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

    return this.userInjections(app, ctx.result)
      .then<void>(result => {
        ctx.result = result;
      });
  }

  /**
   * @static
   * @param {Server} app
   * @param {User} user
   * @returns {Promise<User>}
   */
  private static userInjections(app: Server, user: User): Promise<User> {
    if (!user) {
      return Promise.resolve(null);
    }
    let userJson = user.toJSON();

    return UserService.injectFollowersCount(app, userJson)
      .then(() => userJson);
  }
}
