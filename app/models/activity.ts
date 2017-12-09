// Copyright IBM Corp. 2014. All Rights Reserved.
// Node module: loopback-getting-started-intermediate
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ActivityEvent} from 'app/models/event/activityEvent';
import {RestEvent} from 'app/models/event/restEvent';
import {Attach} from 'app/models/remote/activityRemote';

export = function (Activity) {

  /**
   * Hide rest methods
   */
  [
    'upsert',
    'upsertWithWhere',
    'replaceById',
    'destroyAll',
    'updateAll',
    'count',
    'createChangeStream',
    'replaceOrCreate',
    'patchOrCreateWithWhere',
    'patchOrCreate',
    'updateOrCreate',
    'destroyById',
    'removeById',
    'create',
    'exists',
    'deleteById',

    'prototype.updateAttributes',
    'prototype.patchAttributes',
    /**
     * Activity -> User
     */
    'prototype.__get__user'
  ].forEach(method => {
    Activity.disableRemoteMethodByName(method);
  });

  Activity.validate('media', function (err) {
    let isValid = (this.media || []).findIndex(media =>
        !Activity.app.models.MediaMeta(media).isValid()
      ) === -1;

    if (!isValid) {
      err();
    }
  }, {
    message: 'Media is not valid'
  });

  Activity.observe('after save', function (ctx, next) {
    ActivityEvent.onActivitySaved(Activity.app, ctx)
      .then(() => next())
      .catch(next);
  });

  Activity.afterRemote('findById', function (ctx, result, next) {
    ActivityEvent.onRemoteFindById(Activity.app, ctx)
      .then(() => next())
      .catch(next);
  });

  Activity.beforeRemote('findOne', function (ctx, result, next) {
    ActivityEvent.onBeforeRemoteFindOne(Activity.app, ctx)
      .then(() => next())
      .catch(next);
  });

  Activity.afterRemote('findOne', function (ctx, result, next) {
    ActivityEvent.onRemoteFindOne(Activity.app, ctx)
      .then(() => next())
      .catch(next);
  });

  Activity.afterRemote('find', function (ctx, result, next) {
    ActivityEvent.onRemoteFind(Activity.app, ctx)
      .then(() => next())
      .catch(next);
  });

  Activity.afterRemote('create', function (ctx, result, next) {
    RestEvent.overrideCreateResponse(ctx);
    next();
  });

  /**
   * attach remote
   */
  Attach(Activity);
};
