import {join} from 'path';

export function Attach(Common) {


  /**
   * override Log post route: /countries - GET
   */
  Common.remoteMethod('countries', {
    description: 'returns available countries',
    accepts: [],
    returns: {type: 'array', root: true},
    http: {verb: 'get', path: '/countries'}
  });

  /**
   * @param {function} next callback
   */
  Common.countries = function (next: (err: Error, result?: string[]) => void) {
    let countries = require(join(__dirname, '../../../data/countries.json'));

    next(null, countries);
  };

}
