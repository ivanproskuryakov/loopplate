import {Promise} from 'es6-promise';
import {promisify} from 'bluebird';
import {ServerError} from 'app/error/serverError';
import {Server} from 'app/server/interface/server';
import {User} from 'app/models/interface/user';
import {Activity} from 'app/models/interface/activity';
import {EmailService} from 'app/service/emailService';
import {ActivityService} from 'app/service/activityService';
import {MediaService} from 'app/service/media/mediaService';
import {user} from "../test/fixtures/models/user";

export class UserService {
  /**
   * @const
   * @type {string}
   */
  public static readonly DELETED_USERNAME = 'Deleted User';
  /**
   * @const
   * @type {string}
   */
  public static readonly WEBSITE_USER_DEFAULT_USERNAME = 'username';
  /**
   * @const
   * @type {string}
   */
  public static readonly WEBSITE_USER_TYPE = 'website';
  /**
   * @const
   * @type {string}
   */
  public static readonly WEBSITE_USER_DEFAULT_PASSWORD = 'password';

  /**
   * returns user object for non existing user
   * @returns {User} user info
   */
  public static getDeletedUser(): User {
    return {
      username: UserService.DELETED_USERNAME,
      password: undefined,
      email: undefined,
      type: undefined
    };
  }

  /**
   * Set user's new password, requested by user
   * @param {Server} app loopback app
   * @param {string} token password reset token sent via email
   * @param {string} password new password
   * @param {string} confirmation new password confirmation
   * @returns {Promise<User>}
   */
  public static resetPassword(app: Server,
                              token: string,
                              password: string,
                              confirmation: string): Promise<User> {
    if (password !== confirmation) {

      return Promise.reject(new ServerError('Passwords do not match', 400));
    }

    return app.models.accessToken.findById(token)
      .then(token => {
        if (!token) {

          return Promise.reject(new ServerError('Token not found', 404));
        }

        return app.models.user.findById(token.userId);
      })
      .then(user => {
        if (!user) {

          return Promise.reject(new ServerError('User not found', 404));
        }

        return user.updateAttribute('password', password);
      });
  }

  /**
   * requests user[type=website] password change by email
   * @param {Server} app loopback app
   * @param {string} email
   * @returns {Promise}
   */
  public static requestWebsiteUserReset(app: Server, email: string): Promise<void> {
    let emailDomain = email.split('@')[1];

    return app.models.user.findOne({
      where: {
        email: `${UserService.WEBSITE_USER_DEFAULT_USERNAME}@${emailDomain}`,
        type: 'website'
      }
    })
      .then(user => {
        if (!user) {

          return Promise.reject(new ServerError('User not found', 404));
        }

        return app.models.accessToken.create({
          userId: user.id,
          ttl: 15 * 60 /* 15 minutes */
        });
      })
      .then(token => EmailService.sendPasswordResetEmail(app, {email: email}, token));
  }

  /**
   * get user's public profile
   * @param {Server} app loopback app
   * @param {string} username
   * @param {string} userId
   * @param {User} currentUser
   * @returns {Promise<User>}
   */
  public static getUserProfile(app: Server, username: string, userId: string, currentUser: User): Promise<User> {
    return this
      .getUser(app, username, userId)
      .then((user: User) => {

        if (user.id) {
          // return public prop's only
          /**
           * @see https://github.com/strongloop/loopback-datasource-juggler/blob/72200ce935367cffc7c7df3b6cffc625acb8192a/lib/model.js#L558
           */
          let profile: User = user.toJSON();
          profile.followersCount = user.followersIds.length;

          if (currentUser) {
            profile.isFollowing = user.followersIds.filter(item => item.toString() === currentUser.id.toString()).length > 0;
          } else {
            profile.isFollowing = false;
          }

          return Promise.all([
            UserService.getUserFollowings(app, user),
            UserService.getUserActivityCount(app, user)
          ]).then(results => {
            profile.followingsCount = results[0].length;
            profile.activitiesCount = results[1];

            return Promise.resolve(profile);
          });
        }

        return Promise.resolve(user);
      });
  }

  /**
   * get user's public profile
   * @param {Server} app loopback app
   * @param {string} username
   * @param {string} userId
   * @returns {Promise<User>}
   */
  public static getUser(app: Server, username: string, userId: string): Promise<User> {
    if (!username && !userId) {
      return Promise.resolve(UserService.getDeletedUser());
    }

    let filter: any = {where: {}};

    if (username) {
      filter.where.username = username;
    }
    if (userId) {
      filter.where.id = userId;
    }

    return app.models.user.findOne(filter)
      .then((user: User) => {
        if (!user) {
          return Promise.reject(new ServerError('User not found', 404));
        }

        return Promise.resolve(user);
      });
  }

  /**
   * get user's activities
   * solves problem with loopback ORM, no second level filters
   * @link https://github.com/strongloop/loopback/issues/517
   * @param {Server} app loopback app
   * @param {string} username
   * @param {Object} filter
   * @param {User} currentUser
   * @returns {Promise<Activity[]>}
   */
  public static getUserActivities(app: Server,
                                  username: string,
                                  filter: any,
                                  currentUser: User): Promise<Activity[]> {

    return app.models.user.findOne({where: {username: username}})
      .then(user => {
        if (!user) {

          return Promise.reject(new ServerError('User not found', 404));
        }

        filter = filter || {};
        filter.where = filter.where || {};
        filter.where.userId = user.id;

        return ActivityService.getActivities(app, filter, currentUser);
      });
  }

  /**
   * extract user from request
   * @param {Server} app loopback
   * @param {object} req request
   * @returns {User}
   */
  public static getUserFromRequest(app: Server, req: any): Promise<User> {
    let findForRequestAsync = promisify(app.models.accessToken.findForRequest);

    return findForRequestAsync.call(app.models.accessToken, req, {})
      .then(token => {
        if (!token) {

          return Promise.reject(new ServerError('User not found', 404));
        }

        return app.models.user.findById(token.userId);
      });
  }

  /**
   * returns user by token
   * @param {Server} app loopback
   * @param {string} token
   * @returns {User}
   */
  public static getUserByToken(app: Server, token: string): Promise<User> {

    return app.models.accessToken.findById(token)
      .then(accessToken => {
        if (!accessToken) {
          return Promise.reject(new ServerError('Token not found', 404));
        }

        return app.models.user.findById(accessToken.userId);
      })
      .then(user => {
        if (!user) {
          return Promise.reject(new ServerError('User not found', 404));
        }

        return user;
      });
  }

  /**
   * generic method to set userId from request to instance {@link field} field
   * @param {Server} app loopback
   * @param {Object} req
   * @param {Object} instance
   * @param {string} field
   * @param {boolean} [replace=false]
   * @returns {Promise}
   */
  public static setUserFromRequest(app: Server,
                                   req: any,
                                   instance: any,
                                   field: string,
                                   replace = false): Promise<void> {
    if (instance[field] && !replace) {
      return Promise.resolve<void>();
    }

    return UserService.getUserFromRequest(app, req)
      .then(user => {
        instance[field] = user.id;
      });
  }


  /**
   * get count of activities published by {@link user}
   * @param {Server} app loopback
   * @param {number} user
   */
  public static getUserActivityCount(app: Server, user: User): Promise<number> {

    return app.models.Activity.count({userId: user.id});
  }

  /**
   * @static
   * @param {Server} app
   * @param {Activity} instance
   * @returns {Promise}
   */
  public static injectUser(app: Server, instance: Activity): Promise<void> {

    return UserService.getUser(app, null, instance.userId)
      .then<void>((profile: User) => {
        instance.user = profile;
      });
  }

  /**
   * Injects user's public profile
   * it returns activity as json, so it should be called last
   * @static
   * @param {Server} app
   * @param {Activity} instance
   * @param {User} currentUser
   * @returns {Promise}
   */
  public static injectUserProfile<T extends Activity>(app: Server, instance: T, currentUser: User): Promise<void> {

    return UserService.getUserProfile(
      app,
      null,
      instance.userId,
      currentUser
    ).then<void>((profile: User) => {
      instance.user = profile;
    });
  }

  /**
   * delete user's account
   * @param {Server} app loopback app
   * @param {string} token
   * @returns {Promise}
   */
  public static deleteAccount(app: Server, token: string): Promise<void> {

    return UserService.getUserByToken(app, token)
      .then(user => {

        return app.models.Activity.destroyAll({userId: user.id})
          .then(() => new MediaService(app).deleteUserMedia(user))
          .then(() => app.models.userIdentity.destroyAll({userId: user.id}))
          .then(() => app.models.accessToken.destroyAll({userId: user.id}))
          .then(() => app.models.user.destroyById(user.id))
          // send email in last step
          .then(() => EmailService.sendAccountDeleteConfirmationEmail(app, user));
      });
  }

  /**
   * returns full url to user profile
   * @param {Server} app
   * @param {User} user
   * @returns {string}
   */
  public static getUserUrl(app: Server, user: User): string {

    return `http://${app.get('domain')}/u/${user.username}`;
  }
}
