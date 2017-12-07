import {Logger} from 'app/helper/logHelper';
import {Log} from 'app/models/interface/log';
import * as _ from 'lodash';

export function Attach(Log) {


  /**
   * override Log post route: / - POST
   */
  Log.remoteMethod('post', {
    description: 'log',
    accepts: [
      {arg: 'error', type: 'object', required: true, http: {source: 'body'}}
    ],
    returns: {type: 'object', root: true},
    http: {verb: 'post', path: '/'}
  });

  /**
   * override log post
   * @param {object} error
   * @param {function} next callback
   */
  Log.post = function (error: Log, next: () => void) {
    new Logger().error(error.message, _.omit(error, 'message'));
    next();
  };

}
