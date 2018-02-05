import {Promise} from 'es6-promise';
import {promisify} from 'bluebird';
import {ServerError} from 'app/error/serverError';
import {User} from 'app/interface/user/user';
import {Activity} from 'app/interface/activity/activity';
import {Comment} from 'app/interface/comment';
import {EmailService} from 'app/service/emailService';
import {ActivityService} from 'app/models/service/activity/activityService';
import {MediaService} from 'app/models/service/media/mediaService';
import {AccessTokenRepository} from "app/models/repository/accessTokenRepository";
import {UserRepository} from "app/models/repository/userRepository";
import * as App from 'app/server/server';

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
  public static readonly WEBSITE_USER_DEFAULT_USERNAME = 'loopplate';

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
   * @param {string} token password reset token sent via email
   * @param {string} password new password
   * @param {string} confirmation new password confirmation
   * @returns {Promise<User>}
   */
  public static resetPassword(token: string,
                              password: string,
                              confirmation: string): Promise<User> {
    const userRepository = new UserRepository();
    const accessTokenRepository = new AccessTokenRepository();

    if (password !== confirmation) {
      return Promise.reject(new ServerError('Passwords do not match', 400));
    }

    return accessTokenRepository.findById(token)
      .then(token => {
        if (!token) {
          return Promise.reject(new ServerError('Token not found', 404));
        }

        return userRepository.findById(token.userId);
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
   * @param {string} email
   * @returns {Promise}
   */
  public static requestWebsiteUserReset(email: string): Promise<void> {
    const accessTokenRepository = new AccessTokenRepository();
    const userRepository = new UserRepository();
    let emailDomain = email.split('@')[1];

    return userRepository.findOne({
      where: {
        email: `${UserService.WEBSITE_USER_DEFAULT_USERNAME}@${emailDomain}`,
        type: 'website'
      }
    })
      .then(user => {
        if (!user) {
          return Promise.reject(new ServerError('User not found', 404));
        }

        return accessTokenRepository.create({
          userId: user.id,
          ttl: 15 * 60 /* 15 minutes */
        });
      })
      .then(token => EmailService.sendPasswordResetEmail(
        {email: email}, token)
      );
  }

  /**
   * get user's public profile
   * @param {string} username
   * @param {string} userId
   * @param {User} currentUser
   * @returns {Promise<User>}
   */
  public static getUserProfile(username: string, userId: string, currentUser: User): Promise<User> {
    return this
      .getUser(username, userId)
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
            UserService.getUserFollowings(user),
            UserService.getUserActivityCount(user)
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
   * @param {string} username
   * @param {string} userId
   * @returns {Promise<User>}
   */
  public static getUser(username: string, userId: string): Promise<User> {
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

    const userRepository = new UserRepository();

    return userRepository.findOne(filter)
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
   * @param {string} username
   * @param {Object} filter
   * @param {User} currentUser
   * @returns {Promise<Activity[]>}
   */
  public static getUserActivities(username: string,
                                  filter: any,
                                  currentUser: User): Promise<Activity[]> {
    const userRepository = new UserRepository();

    return userRepository
      .findOne({where: {username: username}})
      .then(user => {
        if (!user) {

          return Promise.reject(new ServerError('User not found', 404));
        }

        filter = filter || {};
        filter.where = filter.where || {};
        filter.where.userId = user.id;

        return ActivityService.getActivities(filter, currentUser);
      });
  }

  /**
   * extract user from request
   * @param {object} req request
   * @returns {User}
   */
  public static getUserFromRequest(req: any): Promise<User> {
    const userRepository = new UserRepository();
    let findForRequestAsync = promisify(App.models.accessToken.findForRequest);

    return findForRequestAsync.call(App.models.accessToken, req, {})
      .then(token => {
        if (!token) {
          return Promise.reject(new ServerError('User not found', 404));
        }

        return userRepository.findById(token.userId);
      });
  }

  /**
   * returns user by token
   * @param {string} token
   * @returns {User}
   */
  public static getUserByToken(token: string): Promise<User> {
    const userRepository = new UserRepository();
    const accessTokenRepository = new AccessTokenRepository();

    return accessTokenRepository.findById(token)
      .then(accessToken => {
        if (!accessToken) {
          return Promise.reject(new ServerError('Token not found', 404));
        }

        return userRepository.findById(accessToken.userId);
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
   * @param {Object} req
   * @param {Object} instance
   * @param {string} field
   * @param {boolean} [replace=false]
   * @returns {Promise}
   */
  public static setUserFromRequest(req: any,
                                   instance: any,
                                   field: string,
                                   replace = false): Promise<void> {
    if (instance[field] && !replace) {
      return Promise.resolve<void>();
    }

    return UserService.getUserFromRequest(req)
      .then(user => {
        instance[field] = user.id;
      });
  }

  /**
   * get a list of users who is followed by {@link user}
   * @param {User} user
   */
  public static getUserFollowings(user: User): Promise<User[]> {
    const userRepository = new UserRepository();

    return userRepository.find({
      where: {
        followersIds: {
          inq: [user.id.toString()]
        }
      }
    });
  }

  /**
   * get count of activities published by {@link user}
   * @param {number} user
   */
  public static getUserActivityCount(user: User): Promise<number> {
    return App.models.Activity.count({userId: user.id});
  }

  /**
   * Injects count of followers for a single user
   * @static
   * @param {User} user
   * @returns {Promise}
   */
  public static injectFollowersCount(user: User): Promise<void> {
    const userRepository = new UserRepository();

    return userRepository
      .findById(user.id, {
        fields: ['followersIds']
      })
      .then(result => {
        user.followersCount = result.followersIds.length;
      });
  }

  /**
   * Injects user
   * it returns activity as json, so it should be called last
   * @static
   * @param {Activity | Comment} instance
   * @returns {Promise}
   */
  public static injectUser(instance: Activity | Comment): Promise<void> {
    return UserService.getUser(null, instance.userId)
      .then<void>((profile: User) => {
        instance.user = profile;
      });
  }

  /**
   * Injects user's public profile
   * it returns activity as json, so it should be called last
   * @static
   * @param {Activity | Comment} instance
   * @param {User} currentUser
   * @returns {Promise}
   */
  public static injectUserProfile<T extends Activity | Comment>(instance: T, currentUser: User): Promise<void> {
    return UserService.getUserProfile(
      null,
      instance.userId,
      currentUser
    ).then<void>((profile: User) => {
      instance.user = profile;
    });
  }

  /**
   * delete user's account
   * @param {string} token
   * @returns {Promise}
   */
  public static deleteAccount(token: string): Promise<void> {

    return UserService.getUserByToken(token)
      .then(user => {

        return App.models.Comment.updateAll({userId: user.id}, {userId: null})
          .then(() => App.models.Activity.destroyAll({userId: user.id}))
          .then(() => new MediaService().deleteUserMedia(user))
          .then(() => App.models.userIdentity.destroyAll({userId: user.id}))
          .then(() => App.models.accessToken.destroyAll({userId: user.id}))
          .then(() => App.models.user.destroyById(user.id))
          // send email in last step
          .then(() => EmailService.sendAccountDeleteConfirmationEmail(user));
      });
  }

  /**
   * returns full url to user profile
   * @param {User} user
   * @returns {string}
   */
  public static getUserUrl(user: User): string {
    return `http://${App.get('domain')}/u/${user.username}`;
  }
}
