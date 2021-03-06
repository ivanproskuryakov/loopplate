import * as App from 'app/server/server';
import * as bluebird from 'bluebird';

export class DataSources {

  /**
   * @returns {Promise}
   */
  public update(): Promise<any[]> {
    return bluebird.each((<any>App).models(), (model: any) => {
      if (model.dataSource) {
        let autoupdate = bluebird.promisify(model.dataSource.autoupdate);
        if (autoupdate) {
          return autoupdate.call(model.dataSource, model.modelName);
        }
      }
    });
  }
}
