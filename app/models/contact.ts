// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: loopback-getting-started-intermediate
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ContactEvent} from 'app/models/event/contactEvent';
import {RestEvent} from 'app/models/event/restEvent';

export = function (Contact) {

  /**
   * Hide rest methods
   */
  [
    'upsert',
    'updateAll',
    'find',
    'findById',
    'findOne',
    'deleteById',
    'confirm',
    'count',
    'exists',
    'createChangeStream',
    'createMany',
    'replaceOrCreate',
    'upsertWithWhere',
    'replaceById',

    'prototype.updateAttributes'
  ].forEach(method => {
    Contact.disableRemoteMethodByName(method);
  });

  /**
   * send email after create
   */
  Contact.observe('after save', function (ctx, next) {
    ContactEvent.onSaved(Contact.app, ctx)
      .then(() => next())
      .catch(next);
  });

  /**
   * Set common Events
   */
  Contact.afterRemote('create', function (ctx, result, next) {
    RestEvent.overrideCreateResponse(ctx);
    next();
  });
};
