import {Logger} from 'app/helper/logHelper';

/**
 * error logger middleware
 */
export = () => (err, req, res, next) => {
  console.log(err);

  new Logger().error(err);
  return next(err);
};
