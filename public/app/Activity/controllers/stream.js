'use strict';

define(['app'], function (app) {
  app.controller(
    'StreamCtrl', [
      '$location',
      '$scope',
      'User',
      'ModelPageLoader',
      function ($location,
                $scope,
                User,
                ModelPageLoader) {
        $scope.type = 'stream';

        $scope.load = function () {
        };

      }
    ]);
});
