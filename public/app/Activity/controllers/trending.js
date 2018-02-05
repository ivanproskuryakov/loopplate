'use strict';

define(['app'], function (app) {
  app.controller(
    'TrendingCtrl', [
      '$location',
      '$scope',
      '$stateParams',
      '$rootScope',
      'Activity',
      function ($location,
                $scope,
                $stateParams,
                $rootScope,
                Activity) {

        $scope.type = 'hot';

      }
    ]);
});
