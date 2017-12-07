import * as moment from 'moment';
import {Cache} from 'app/models/interface/cache';
import * as App from 'app/server/server';
import {Promise} from 'es6-promise';

export class CacheService<T> {

  /**
   * @param {number} lifetime
   */
  constructor(private lifetime: number){}

  /**
   * @param {string} key
   * @returns {Promise<T>}
   */
  public get(key: string): Promise<T> {

    return App.models.Cache
      .findOne({where: {key: key}})
      .then((result: Cache<T>) => {
        if (!result) {
          return null;
        }

        if (this.lifetime === Infinity) {
          return result.value;
        }

        let minLifeDate = moment(new Date()).subtract(this.lifetime, 'minutes').toDate();

        if (moment(result.createdAt).isAfter(minLifeDate)) {
          return result.value;
        }

        return null;
      });
  }

  /**
   * @returns {Promise}
   */
  public set(key: string, value: T): Promise<void> {
    return App.models.Cache.upsertWithWhere(
      {key: key},
      {key: key, value: value, createdAt: new Date()}
    );
  }
}
