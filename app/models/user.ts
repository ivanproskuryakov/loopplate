// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: loopback-getting-started-intermediate
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {UserEvent} from 'app/models/event/userEvent';
import {Attach} from 'app/models/remote/userRemote';

export = function (User) {

  /**
   * Hide rest methods
   */
  [
    'get',
    'upsert',
    'upsertWithWhere',
    'replaceById',
    'deleteById',
    'destroyAll',
    'updateAll',
    'count',
    'createChangeStream',
    'replaceOrCreate',
    'patchOrCreateWithWhere',
    'patchOrCreate',
    'updateOrCreate',
    'exists',

    /**
     * User -> AccessToken
     */
    'prototype.__count__accessTokens',
    'prototype.__create__accessTokens',
    'prototype.__delete__accessTokens',
    'prototype.__destroyById__accessTokens',
    'prototype.__findById__accessTokens',
    'prototype.__get__accessTokens',
    'prototype.__updateById__accessTokens',
    /**
     * User -> userIdentity
     */
    'prototype.__count__identities',
    'prototype.__create__identities',
    'prototype.__delete__identities',
    'prototype.__destroyById__identities',
    'prototype.__findById__identities',
    'prototype.__get__identities',
    'prototype.__updateById__identities',
    /**
     * User -> userCredential
     */
    'prototype.__count__credentials',
    'prototype.__create__credentials',
    'prototype.__delete__credentials',
    'prototype.__destroyById__credentials',
    'prototype.__findById__credentials',
    'prototype.__get__credentials',
    'prototype.__updateById__credentials',
    /**
     * User -> Activity
     */
    'prototype.__count__activities',
    'prototype.__create__activities',
    'prototype.__delete__activities',
    'prototype.__destroyById__activities',
    'prototype.__findById__activities',
    'prototype.__get__activities',
    'prototype.__updateById__activities',
    /**
     * User -> user
     */
    'prototype.__exists__followers',
    'prototype.__create__followers',
    'prototype.__delete__followers',
    'prototype.__destroyById__followers',
    'prototype.__findById__followers',
    'prototype.__updateById__followers',
    'prototype.__link__followers',
    'prototype.__unlink__followers',
  ].forEach(method => {
    User.disableRemoteMethodByName(method);
  });

  User.validate('rss', function (err) {
    let isValid = (this.rss || []).findIndex((feed, i, arr) =>
        arr.filter(f => f.url === feed.url).length > 1
      ) === -1;

    if (!isValid) {
      err();
    }
  }, {
    message: 'rss contains dupe urls'
  });

  User.observe('after save', function (ctx, next) {
    UserEvent.onAccountAfterSaved(User.app, ctx)
      .then(() => next())
      .catch(next);
  });

  User.observe('before save', function (ctx, next) {
    UserEvent.onAccountBeforeSaved(ctx)
      .then(() => next())
      .catch(next);
  });

  User.on('resetPasswordRequest', function (result) {
    return UserEvent.onResetPasswordRequest(User.app, result.user, result.accessToken);
  });

  User.afterRemote('findById', function (ctx, result, next) {
    UserEvent.onRemoteFindById(User.app, ctx)
      .then(() => next())
      .catch(next);
  });

  User.afterRemote('findOne', function (ctx, result, next) {
    UserEvent.onRemoteFindOne(User.app, ctx)
      .then(() => next())
      .catch(next);
  });

  /**
   * attach remote
   */
  Attach(User);
};
