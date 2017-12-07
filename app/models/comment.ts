// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: loopback-getting-started-intermediate
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {CommentEvent} from 'app/models/event/commentEvent';
import {RestEvent} from 'app/models/event/restEvent';

export = function (Comment) {
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
    'exists',
    'destroyById',
    'removeById',
    'deleteById',
    'findOne',

    'prototype.updateAttributes',
    'prototype.patchAttributes',
    /**
     * Comment -> ReplyOn
     */
    'prototype.__count__replyOn',
    'prototype.__create__replyOn',
    'prototype.__delete__replyOn',
    'prototype.__destroyById__replyOn',
    'prototype.__findById__replyOn',
    'prototype.__get__replyOn',
    'prototype.__updateById__replyOn',
    /**
     * Comment -> Activity
     */
    'prototype.__get__activity',
    /**
     * Comment -> User
     */
    'prototype.__get__user'
  ].forEach(method => {
    Comment.disableRemoteMethodByName(method);
  });


  Comment.observe('before save', function (ctx, next) {
    CommentEvent.onCommentSaving(Comment.app, ctx)
      .then(() => next())
      .catch(next);
  });

  Comment.afterRemote('findById', function(ctx, result, next) {
    CommentEvent.onRemoteFindById(Comment.app, ctx)
      .then(() => next())
      .catch(next);
  });

  Comment.afterRemote('findOne', function(ctx, result, next) {
    CommentEvent.onRemoteFindOne(Comment.app, ctx)
      .then(() => next())
      .catch(next);
  });

  Comment.afterRemote('findOrCreate', function(ctx, result, next) {
    CommentEvent.onRemoteFindOrCreate(Comment.app, ctx)
      .then(() => next())
      .catch(next);
  });

  Comment.afterRemote('find', function(ctx, result, next) {
    CommentEvent.onRemoteFind(Comment.app, ctx)
      .then(() => next())
      .catch(next);
  });

  Comment.afterRemote('create', function (ctx, result, next) {
    RestEvent.overrideCreateResponse(ctx);
    next();
  });
};
