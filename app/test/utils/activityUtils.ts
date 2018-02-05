import * as bluebird from 'bluebird';
import * as _ from 'lodash';

import * as App from 'app/server/server';
import {Activity} from 'app/interface/activity/activity';
import {User} from 'app/interface/user/user';
import * as commentsMock from 'app/test/fixtures/models/comment';
import * as usersMock from 'app/test/fixtures/models/user';

export class ActivityUtils {

  /**
   * @static
   * @param {Activity} activity
   * @param {number} count
   * @param {string} [userId=null]
   * @returns {Promise<User>} done
   */
  static createComments(activity: Activity, count: number, userId?: string): Promise<User> {

    return bluebird.promisify(App.models.Comment.create)
      .call(App.models.Comment, commentsMock.get(count, userId, activity.id));
  }

  /**
   * @static
   * @param {Activity} activity
   * @param {number} count
   * @returns {Promise<User>} done
   */
  static createLikes(activity: Activity, count: number): Promise<User> {

    return bluebird.promisify(App.models.user.create)
      .call(App.models.user, usersMock.get(count))
      .then(likes => {

        return App.models.Activity.update(
          {id: activity.id},
          {likedUserIds: likes.map(f => f.id)}
        );
      });
  }


  /**
   * @static
   * @param {Activity} activity
   * @param {number} count
   * @returns {Promise<User>} done
   */
  static createViews(activity: Activity, count: number): Promise<User> {
    let views = _.range(0, count)
      .map(() => ({ip: '127.0.0.1'}));

    return App.models.Activity.update(
      {id: activity.id},
      {views: views}
    );
  }
}
