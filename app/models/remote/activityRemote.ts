import {ActivityService} from 'app/models/service/activity/activityService';
import {UserService} from 'app/models/service/user/userService';
import {RelatedService} from 'app/models/service/activity/relatedService';

export function Attach(Activity) {

  /**
   * register 'like' as api method as route: /{id}/likes/like - POST
   */
  Activity.remoteMethod('like', {
    description: 'like activity',
    accepts: [
      {arg: 'id', type: 'string', required: true, description: 'activity id', http: {source: 'path'}},
      {arg: 'req', type: 'object', http: {source: 'req'}}
    ],
    returns: {
      type: 'object', root: true
    },
    http: {verb: 'post', path: '/:id/likes/like'}
  });

  /**
   * like an activity
   * @param {string} id
   * @param {object} req express's request object
   * @param {function} next callback
   */
  Activity.like = function (id: string, req: any, next: (err?: Error) => void) {
    UserService.getUserFromRequest(req)
      .then(user => ActivityService.like(user, id))
      .then(() => next())
      .catch(next);
  };

  /**
   * register 'dislike' as api method as route: /{id}/likes/like - DELETE
   */
  Activity.remoteMethod('dislike', {
    description: 'dislike activity',
    accepts: [
      {arg: 'id', type: 'string', required: true, description: 'activity id', http: {source: 'path'}},
      {arg: 'req', type: 'object', http: {source: 'req'}}
    ],
    returns: {
      type: 'object', root: true
    },
    http: {verb: 'delete', path: '/:id/likes/like'}
  });

  /**
   * dislike an activity
   * @param {string} id
   * @param {object} req express's request object
   * @param {function} next callback
   */
  Activity.dislike = function (id: string, req: any, next: (err?: Error, result?: any) => void) {
    UserService.getUserFromRequest(req)
      .then(user => ActivityService.dislike(user, id))
      .then(() => next())
      .catch(next);
  };

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
    UserService.getUserFromRequest(req)
      .then(user => ActivityService.post(user, payload))
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

  /**
   * @param {string} id
   * @param {string} resource
   * @param {number} quantity
   * @param {object} req express's request object
   * @param {function} next callback
   */
  Activity.getRelatedResource = function (id: string,
                                          resource: string,
                                          quantity: number,
                                          req: any,
                                          next: (err?: Error, result?: any) => void) {
    new RelatedService(req.user)
      .getRelatedResourceById(id, resource, quantity)
      .then(result => next(null, result))
      .catch(next);
  };

  /**
   * register 'getCategories' as api method as route: /categories - GET
   */
  Activity.remoteMethod('getCategories', {
    description: 'get all categories',
    returns: {
      type: 'array', root: true
    },
    http: {verb: 'get', path: '/categories'}
  });

  /**
   * @param {function} next callback
   */
  Activity.getCategories = function (next: (err?: Error, result?: string[]) => void) {
    let result = ActivityService.getCategories();

    next(null, result);
  };
}
