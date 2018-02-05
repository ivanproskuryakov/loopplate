import {Promise} from 'es6-promise';
import {User} from 'app/interface/user/user';
import {AccessToken} from 'app/interface/accessToken';
import {EmailService} from 'app/service/emailService';
import {UserService} from 'app/models/service/user/userService';

/**
 * Events related methods for User model
 */
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
   * @param {Object} ctx
   * @returns {Promise}
   */
  public static onAccountAfterSaved(ctx: any): Promise<void> {
    if (!ctx.instance || !ctx.isNewInstance) {
      return Promise.resolve<void>();
    }

    return EmailService.sendWelcomeEmail(ctx.instance);
  }

  /**
   * send password reset email after /api/users/reset called
   * @see https://github.com/strongloop/loopback/blob/master/common/models/user.js#L545
   * @param {User} user
   * @param {AccessToken} accessToken
   * @returns {Promise}
   */
  public static onResetPasswordRequest(user: User, accessToken: AccessToken): Promise<void> {
    return EmailService.sendPasswordResetEmail(user, accessToken);
  }

  /**
   * @static
   * @param {Object} ctx
   * @returns {Promise}
   */
  public static onRemoteFindOne(ctx: any): Promise<void> {

    return this.userInjections(ctx.result)
      .then<void>(result => {
        ctx.result = result;
      });
  }

  /**
   * @static
   * @param {Object} ctx
   * @returns {Promise}
   */
  public static onRemoteFindById(ctx: any): Promise<void> {

    return this.userInjections(ctx.result)
      .then<void>(result => {
        ctx.result = result;
      });
  }

  /**
   * @static
   * @param {User} user
   * @returns {Promise<User>}
   */
  private static userInjections(user: User): Promise<User> {
    if (!user) {
      return Promise.resolve(null);
    }
    let userJson = user.toJSON();

    return UserService.injectFollowersCount(userJson)
      .then(() => userJson);
  }
}
