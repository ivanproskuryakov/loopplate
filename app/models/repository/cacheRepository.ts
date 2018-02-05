import {Cache} from 'app/interface/cache';
import * as App from 'app/server/server';

export class CacheRepository {

  /**
   * @param {string} key
   * @returns {Promise<any>}
   */
  public get(key: string): Promise<any> {
    return App.models.Cache
      .findOne({where: {key: key}})
      .then((result: Cache<any>) => {
        if (!result) {
          return null;
        }

        return result.value;
      });
  }

  /**
   * @returns {Promise}
   */
  public set(key: string, value: any): Promise<any[]> {
    return App.models.Cache.upsertWithWhere(
      {key: key},
      {key: key, value: value, createdAt: new Date()}
    );
  }
}
