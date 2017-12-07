'use strict';

define(['app'], function (app) {

  app.factory('$exceptionHandler', [
    '$log',
    'logger',
    function ($log, logger) {
      return function (exception, cause) {
        logger.log(exception.message, exception.stack, {
          cause: cause
        });

        $log.warn(exception, cause);
      };
    }
  ]);
});
