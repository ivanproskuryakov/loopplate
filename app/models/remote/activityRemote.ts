import {ActivityService} from 'app/service/activityService';
import {Server} from 'app/server/interface/server';
import {UserService} from 'app/service/userService';

export function Attach(Activity) {

  /**
   * register 'post' as api method as route: / - POST
   */
  Activity.remoteMethod('post', {
    description: 'post activity',
    accepts: [
      {arg: 'payload', type: 'object', required: true, description: 'payload', http: {source: 'body'}},
      {arg: 'req', type: 'object', http: {source: 'req'}},
      {arg: 'res', type: 'object', http: {source: 'res'}}
    ],
    returns: {
      type: 'object', root: true
    },
    http: {verb: 'post', path: '/', status: 201}
  });

  /**
   * post an activity
   * @param {object} payload
   * @param {object} req express's request object
   * @param {object} res express's response object
   * @param {function} next callback
   */
  Activity.post = function (payload: any,
                            req: any,
                            res: any,
                            next: (err?: Error) => void) {
    const app: Server = Activity.app;

    UserService.getUserFromRequest(app, req)
      .then(user => ActivityService.post(app, user, payload))
      .then(result => {
        res.set('Location', ActivityService.getLocationUrl(req, result.id));
        next();
      })
      .catch(next);
  };

  /**
   * register 'getRelatedResource' as api method as route: /{id}/related/{resource} - GET
   */
  Activity.remoteMethod('getRelatedResource', {
    description: 'get related resources',
    accepts: [
      {arg: 'id', type: 'string', required: true, description: 'activity id', http: {source: 'path'}},
      {
        arg: 'resource',
        type: 'string',
        required: true,
        description: '[youtube, twitter, gplus, getty, giphy]',
        http: {source: 'path'}
      },
      {arg: 'quantity', type: 'number', required: false, http: {source: 'query'}},
      {arg: 'req', type: 'object', http: {source: 'req'}}
    ],
    returns: {
      type: 'array', root: true
    },
    http: {verb: 'get', path: '/:id/related/:resource'}
  });

}
