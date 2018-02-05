import {Activity} from 'app/interface/activity/activity';
import * as App from 'app/server/server';
import * as _ from 'lodash';

const moment = require('moment');

export class ActivityRepository {

  /**
   * @param {Activity} activity
   * @returns {Promise<Activity[]>}
   */
  public create(activity: Activity): Promise<Activity> {
    return App.models.Activity.create(activity);
  }

  /**
   * @param {Activity[]} activities
   * @returns {Promise<Activity[]>}
   */
  public createMany(activities: Activity[]): Promise<Activity[]> {
    return App.models.Activity.create(activities);
  }

  /**
   * finds activities by past X hours
   * helper function
   * @param {number} hours
   * @param {string} category
   * @returns {Promise<Activity[]>}
   */
  public findActivitiesByPast(hours: number, category: string): Promise<Activity[]> {
    let from = moment().subtract(hours, 'hours').toDate();
    let to = new Date();

    return this.findActivities(from, to, category);
  }

  /**
   * finds activities by date period
   * helper function
   * @param {Date} from
   * @param {Date} to
   * @param {string} category
   * @returns {Promise<Activity[]>}
   */
  public findActivities(from: Date, to: Date, category: string): Promise<Activity[]> {
    let query: any = {
      where: {
        and: [{
          createdAt: {gte: from}
        }, {
          createdAt: {lte: to}
        }]
      }
    };

    if (category) {
      query.where.and.push({category: category});
    }

    return App.models.Activity
      .find(query)
      .then((activities: Activity[]) => _.uniqBy(activities, activity => activity.source));
  }

  /**
   * @param {string} id
   * @returns {any}
   */
  public findById(id: string): Promise<Activity> {
    return App.models.Activity.findById(id);
  }

  /**
   * @param {Object} filter
   * @returns {any}
   */
  public findByFilter(filter: Object): Promise<Activity[]> {
    return App.models.Activity.find(filter);
  }

  /**
   * @param {string[]} ids
   * @returns {any}
   */
  public destroyByIds(ids: string[]): Promise<any> {
    const filter = {
      id: {
        in: ids
      }
    };

    return App.models.Activity.destroyAll(filter);
  }

  /**
   * @param {Object} where
   * @param {Object} activity
   * @param {Object} options
   * @returns {any}
   */
  public update(where: Object, activity: Object, options: Object): Promise<Activity> {
    return App.models.Activity.update(where, activity, options);
  }

}
