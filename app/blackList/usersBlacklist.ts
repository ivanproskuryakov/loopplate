import {join} from 'path';
import * as _ from 'lodash';
import {BlacklistInterface} from 'app/interface/blacklistInterface';
import {User} from 'app/interface/user/user';

export class UsersBlackList implements BlacklistInterface<User> {
  /**
   * @const
   */
  private readonly DEFAULT_USERS_PATH = join(__dirname, '../../data/blacklist/users.json');
  /**
   * @property
   */
  private blacklist: string[] = [];

  /**
   * @constructor
   * @param {string[]} usernames
   */
  constructor(usernames?: string[]) {
    this.blacklist = usernames || this.getDefaultUsers();
  }

  /**
   * @param {User[]} source
   * @returns {User[]}
   */
  public filter(source: User[]): User[] {
    return source.filter(user =>
      _.find(this.blacklist, x => x.toLowerCase() === user.username.toLowerCase()) === undefined
    );
  }

  /**
   * @param {User[]} source
   * @param {User} [replacement]
   * @returns {User[]}
   */
  public replace(source: User[], replacement?: User): User[] {
    return source;
  }

  /**
   * returns default blacklist users
   */
  private getDefaultUsers(): string[] {
    return require(this.DEFAULT_USERS_PATH);
  }
}
