import {UserService} from 'app/models/service/user/userService';

/**
 * Attach current user to req object
 */
export = function (app) {
  app.use(middleware);

  /**
   * @param {object} req express's request object
   * @param {object} res express's response object
   * @param {function} next callback
   */
  function middleware(req, res, next) {

    UserService.getUserFromRequest(req)
      .then(user => {
        req.user = user.toJSON();

        next();
      })
      .catch(err => next());
  }

  return middleware;
};
