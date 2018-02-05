import {Promise} from 'es6-promise';
import * as bluebird from 'bluebird';
import * as App from 'app/server/server';
import {User} from 'app/interface/user/user';
import {AccessToken} from 'app/interface/accessToken';
import * as usersMock from 'app/test/fixtures/models/user';

export class UserUtils {

  /**
   * @param {User} user
   * @returns {Promise<User>} done
   */
  static createUser(user?: User): Promise<User> {
    if (!user) {
      user = usersMock.get(1)[0];
    }

    return App.models.user.create(user);
  }

  /**
   * @param {User} user
   * @returns {Promise<void>} done
   */
  static deleteUser(user: User): Promise<void> {
    const filter = {
      email: user.email
    };

    return App.models.user
      .destroyAll(filter)
      .then((err, info) => {
        return Promise.resolve<void>();
      });
  }

  /**
   * helper function to find user by email
   * @param {string} email
   * @returns {Promise<User>} done
   */
  static findUserByEmail(email: string): Promise<User> {
    return App.models.user.findOne({where: {email: email}});
  }

  /**
   * helper function to generate access token for verified user
   * @param {User} user
   * @returns {Promise<AccessToken>} done
   */
  static generateLoginToken(user: User): Promise<AccessToken> {
    return App.models.accessToken.create({userId: user.id});
  }

  /**
   * helper function to register user, verified, logged in
   * @param {User} user
   * @returns {Promise<{user: User, token: AccessToken}>} done
   */
  static registerUser(user?: User): Promise<{user: User, token: AccessToken}> {
    if (!user) {
      user = usersMock.get(1)[0];
    }
    let result = {user: null, token: null};

    return UserUtils.createUser(user)
      .then(regUser => {
        // store newly registered user
        result.user = regUser;
        return Promise.resolve(regUser);
      })
      .then(user => UserUtils.generateLoginToken(user))
      .then(token => {
        // store access token
        result.token = token;
        // return result
        return Promise.resolve(result);
      });
  }

  /**
   * find latest token generated for user
   * @param {User} user
   */
  static findUserLatestToken(user: User): Promise<AccessToken> {
    return App.models.accessToken.findOne({
      where: {userId: user.id},
      order: 'created DESC'
    });
  }

  /**
   * create followers
   * @param {User} user
   * @param {number} count
   * @returns {Promise<User>}
   */
  static createFollowers(user: User, count: number): Promise<User> {

    return bluebird.promisify(App.models.user.create)
      .call(App.models.user, usersMock.get(count))
      .then(followers => {

        return App.models.user.update(
          {id: user.id},
          {followersIds: followers.map(f => f.id)}
        );
      })
      .then(() => App.models.user.findById(user.id));
  }
}
