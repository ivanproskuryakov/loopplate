import * as App from 'app/server/server';
import {User} from "app/interface/user/user";

export class UserRepository {

  /**
   * @param {User} user
   * @returns {Promise<User[]>}
   */
  public create(user: User): Promise<User> {
    return App.model['user'].create(user);
  }

  /**
   * @param {User[]} users
   * @returns {Promise<User[]>}
   */
  public createMany(users: User[]): Promise<User[]> {
    return App.model['user'].create(users);
  }

  /**
   * @param {string} id
   * @param {Object} filter
   * @returns {any}
   */
  public findById(id: string, filter?: Object): Promise<User> {
    if (filter) {
      return App.model['user'].findById(id, filter);
    }

    return App.model['user'].findById(id);
  }

  /**
   * @param {Object} filter
   * @returns {any}
   */
  public findOne(filter: Object): Promise<User> {
    return App.model['user'].findOne(filter);
  }

  /**
   * @param {Object} filter
   * @returns {any}
   */
  public find(filter: Object): Promise<User[]> {
    return App.model['user'].find(filter);
  }

  /**
   * @param {User} user
   * @returns {Promise<User>}
   */
  public createForcing(user: User): Promise<User> {
    return new Promise((resolve, reject) => {
      App.model['user'].create(user, (err: Error, user: User) => {
        if (err) {
          console.log(err);
        }

        resolve(user);
      });
    });
  }
}
