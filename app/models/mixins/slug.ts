import * as slug from 'slug';
import * as moment from 'moment';

/**
 * mixin for setting slug on model
 * @param {object} Model
 * @param {{source: string, field?: string, unique?: boolean}} bootOptions settings for mixin
 */
export = function slugMixin(Model, bootOptions?: {source?: string, field?: string, unique?: boolean}) {

  let options = {
    source: bootOptions && bootOptions.source,
    field: (bootOptions && bootOptions.field) || 'slug',
    unique: (bootOptions && bootOptions.unique) || false
  };

  const slugOptions = {
    remove: null
  };

  Model.observe('before save', function (ctx, next) {
    // when updating existing instance then data is in ctx.data
    // when creating a new instance then data is in ctx.instance
    let instance = ctx.data || ctx.instance;
    if (!instance || !instance[options.source]) {

      return next();
    }

    instance[options.field] = slug(instance[options.source], slugOptions);

    if (!options.unique) {

      return next();
    }

    let query = {};
    query[options.field] = instance[options.field];
    Model
      .count(query)
      .then(count => {
        if (count > 0) {
          instance[options.field] += '-' + moment(instance.createdAt).format('HHDDMMYYYY');
        }
      })
      .then(() => next())
      .catch(next);
  });
};
