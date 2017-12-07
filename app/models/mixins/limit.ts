/**
 * mixin for setting max item quantity returned by /get
 * @param {object} Model
 * @param {{max: number}} bootOptions settings for mixin
 */
export = function limitMixin(Model, bootOptions?: {max?: number}) {

  let options = {
    max: bootOptions && bootOptions.max
  };

  Model.beforeRemote('*', function (ctx, modelInstance, next) {
    if (!options.max) {
      options.max = Model.app.get('maxPageSize');
    }

    let filter = ctx.args.filter || {};
    if (!filter.limit || filter.limit > options.max) {
      filter.limit = options.max;
    }
    ctx.args.filter = filter;

    return next();
  });
};
