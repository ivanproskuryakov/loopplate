import {Attach} from 'app/models/remote/mediaRemote';

export = function (Media) {

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
    'findOne',
    'find',

    'prototype.updateAttributes',
    'prototype.patchAttributes',
    /**
     * Media -> User
     */
    'prototype.__get__user'
  ].forEach(method => {
    Media.disableRemoteMethodByName(method);
  });

  /**
   * attach remote
   */
  Attach(Media);
};
