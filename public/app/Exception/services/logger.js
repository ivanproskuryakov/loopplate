'use strict';

define(['app'], function (app) {

  app.factory('logger', [
    '$injector',
    function ($injector) {
      return {
        log: function (message, stackTrace, meta) {
          var log = meta || {};
          log.message = message;
          log.stackTrace = stackTrace;

          $injector
            .get('Log')
            .post(log)
            .$promise
            .catch(function (err) {
              // ignore http errors during log posting to endpoint
            });
        }
      };
    }
  ]);
});
