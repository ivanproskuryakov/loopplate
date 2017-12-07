import {Request, Response} from 'express';
import {Server} from 'app/server/interface/server';
import {User} from 'app/models/interface/user';
import {Activity} from 'app/models/interface/activity';
import {UserService} from 'app/service/userService';
import {EmailService} from 'app/service/emailService';

export function Attach(User) {

  /**
   * register 'passwordResetConfirm' as api method as route: /password - PUT
   */
  User.remoteMethod('passwordResetConfirm', {
    description: 'Set user\'s new password, requested by user',
    accepts: [
      {arg: 'token', type: 'string', required: true, description: 'token received via email'},
      {arg: 'password', type: 'string', required: true, description: 'new password'},
      {arg: 'confirmation', type: 'string', required: true, description: 'new password\'s confirmation'}
    ],
    http: {verb: 'put', path: '/password'}
  });

  /**
   * Set user's new password, requested by user
   * @param {string} token password reset token sent via email
   * @param {string} password new password
   * @param {string} confirmation new password confirmation
   * @param {function} next callback
   */
  User.passwordResetConfirm = function (token: string,
                                        password: string,
                                        confirmation: string,
                                        next: (err?: Error) => void) {
    UserService.resetPassword(User.app, token, password, confirmation)
      .then(() => next())
      .catch(next);
  };


  /**
   * register 'requestWebsiteUserReset' as api method as route: /website/reset - POST
   */
  User.remoteMethod('requestWebsiteUserReset', {
    description: 'Reset password for a user[type=website] with email.',
    accepts: [
      {arg: 'email', type: 'string', required: true, description: 'email'},
    ],
    http: {verb: 'post', path: '/website/reset'}
  });

  /**
   * request password reset by user[type=website]
   * @param {string} email
   * @param {function} next callback
   */
  User.requestWebsiteUserReset = function (email: string, next: (err?: Error) => void) {
    UserService.requestWebsiteUserReset(User.app, email)
      .then(() => next())
      .catch(next);
  };


  /**
   * register user's public profile as api method as route: /:username/public - GET
   */
  User.remoteMethod('publicProfile', {
    description: 'get user\'s public profile',
    accepts: [
      {arg: 'req', type: 'object', http: {source: 'req'}},
      {arg: 'username', type: 'string', required: true, description: 'user\'s username', http: {source: 'path'}}
    ],
    returns: {arg: 'profile', type: 'object', root: true, description: 'user\'s public profile'},
    http: {verb: 'get', path: '/:username/profile'}
  });

  /**
   * get user's public profile
   * @param {Request} req express's request object
   * @param {string} username
   * @param {function} next callback
   */
  User.publicProfile = function (req: any,
                                 username: string,
                                 next: (err?: Error, data?: User) => void) {
    let app = User.app;

    UserService.getUserProfile(app, username, null, req.user)
      .then(profile => next(null, profile))
      .catch(next);
  };


  /**
   * register user's activities as api method as route: /:username/activities - GET
   */
  User.remoteMethod('activities', {
    description: 'get activities created / imported by user',
    accepts: [
      {arg: 'username', type: 'string', required: true, description: 'user\'s username', http: {source: 'path'}},
      {arg: 'filter', type: 'object', http: {source: 'query'}},
      {arg: 'req', type: 'object', http: {source: 'req'}}
    ],
    returns: {arg: 'activities', type: 'array', root: true, description: 'user\'s activities'},
    http: {verb: 'get', path: '/:username/activities'}
  });

  /**
   * get user's activities
   * @param {string} username
   * @param {object} filter
   * @param {Request} req express's request object
   * @param {function} next callback
   */
  User.activities = function (username: string,
                              filter: any,
                              req: any,
                              next: (err?: Error, result?: Activity[]) => void) {
    UserService.getUserActivities(User.app, username, filter, req.user)
      .then(activities => next(null, activities))
      .catch(next);
  };


  /**
   * register user's delete request as api method as route: /:id - DELETE
   */
  User.remoteMethod('requestAccountDelete', {
    description: 'user account delete request',
    accepts: [
      {arg: 'id', type: 'string', required: true, description: 'user\'s id', http: {source: 'path'}}
    ],
    returns: {type: 'string', root: true},
    http: {verb: 'delete', path: '/:id', status: 200}
  });

  /**
   * delete request for user's account
   * @param {string} id
   * @param {function} next callback
   */
  User.requestAccountDelete = function (id: string,
                                        next: (err?: Error) => void) {
    EmailService.sendAccountDeleteEmail(User.app, id)
      .then(() => next())
      .catch(next);
  };


  /**
   * register user's delete confirmation as api method as route: /delete - GET
   */
  User.remoteMethod('deleteAccount', {
    description: 'delete confirmation for user\'s account',
    accepts: [
      {arg: 'token', type: 'string', required: true, description: 'token received via email'},
      {arg: 'res', type: 'object', http: {source: 'res'}}
    ],
    http: {verb: 'get', path: '/delete'}
  });

  /**
   * delete confirmation for user's account
   * @param {string} token
   * @param {object} res express's response object
   * @param {function} next callback
   */
  User.deleteAccount = function (token: string,
                                 res: any,
                                 next: (err?: Error) => void) {
    const app: Server = User.app;

    UserService
      .deleteAccount(app, token)
      .then(() => {
        // redirect to frontend
        return res.redirect(
          `http://${app.get('domain')}:${app.get('port')}`
        );
      })
      .catch(next);
  };

}
