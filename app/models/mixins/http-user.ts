import {UserService} from 'app/service/userService';

/**
 * mixin for setting user to model on api 'create' call
 * not works when calling by references like /api/activities/[activityid]/comments POST
 * @param {object} Model
 * @param {{field: string, replace: boolean}} [bootOptions={field: 'userId', replace: false}] settings for mixin
 */
export = function httpUserMixin(Model, bootOptions?: {field?: string, replace?: boolean}) {

  let options = {
    field: (bootOptions && bootOptions.field) || 'userId',
    replace: (bootOptions && bootOptions.replace) || false
  };

  Model.beforeRemote('create', function (ctx, modelInstance, next) {
    UserService.setUserFromRequest(ctx.req.app, ctx.req,
      ctx.args.data, options.field, options.replace)
      .then(() => next())
      .catch(() => next());
  });
};
