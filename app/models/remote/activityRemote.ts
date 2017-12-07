import {TrendingCacheService} from 'app/service/cache/trendingCacheService';
import {CategoryTrends} from 'app/service/analysis/categoryTrendsInterface';
import {ActivityService} from 'app/service/activityService';
import {Server} from 'app/server/interface/server';
import {UserService} from 'app/service/userService';
import {RelatedService} from 'app/service/analysis/relatedService';
import {Activity} from 'app/models/interface/activity';

export function Attach(Activity) {

  /**
   * register 'getTrendingByCategory' as api method as route: /trending/category/:category - GET
   */
  Activity.remoteMethod('getTrendingByCategory', {
    description: 'find trends by category',
    accepts: [
      {
        arg: 'category',
        type: 'string',
        required: true,
        description: 'activity category',
        http: {source: 'path'}
      },
      {
        arg: 'skip',
        type: 'number',
        required: false,
        http: {source: 'query'}
      },
      {
        arg: 'limit',
        type: 'number',
        required: false,
        http: {source: 'query'}
      },
      {arg: 'req', type: 'object', http: {source: 'req'}}
    ],
    returns: {
      type: 'array', root: true,
      description: 'trends by category'
    },
    http: {verb: 'get', path: '/trending/category/:category'}
  });

  /**
   * @param {string} category
   * @param {number} skip
   * @param {number} limit
   * @param {object} req express's request object
   * @param {function} next callback
   */
  Activity.getTrendingByCategory = function (category: string,
                                             skip: number,
                                             limit: number,
                                             req: any,
                                             next: (err?: Error, result?: Activity[]) => void) {

    new TrendingCacheService(req.user)
      .getCollection(category, skip, limit)
      .then(result => next(null, result))
      .catch(next);
  };

  /**
   * register 'getTrendingCategoryDetails' as api method as route: /trending/category/:category/details - GET
   */
  Activity.remoteMethod('getTrendingCategoryDetails', {
    description: 'trending category details',
    accepts: [
      {
        arg: 'category',
        type: 'string',
        required: true,
        description: 'activity category',
        http: {source: 'path'}
      },
      {arg: 'req', type: 'object', http: {source: 'req'}}
    ],
    returns: {
      type: 'object', root: true,
      description: 'trending category details'
    },
    http: {verb: 'get', path: '/trending/category/:category/details'}
  });

  /**
   * @param {string} category
   * @param {object} req express's request object
   * @param {function} next callback
   */
  Activity.getTrendingCategoryDetails = function (category: string,
                                                  req: any,
                                                  next: (err?: Error, result?: CategoryTrends) => void) {

    new TrendingCacheService(req.user)
      .getDetails(category)
      .then(result => next(null, result))
      .catch(next);
  };

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
    let app: Server = Activity.app;

    UserService.getUserFromRequest(app, req)
      .then(user => ActivityService.like(app, user, id))
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
    let app: Server = Activity.app;

    UserService.getUserFromRequest(app, req)
      .then(user => ActivityService.dislike(app, user, id))
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

  /**
   * get related resources
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
