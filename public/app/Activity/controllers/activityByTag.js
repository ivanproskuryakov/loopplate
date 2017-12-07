'use strict';

define(['app'], function (app) {
  app.controller(
    'ActivityByTagCtrl', [
      '$location',
      '$scope',
      '$rootScope',
      '$stateParams',
      function ($location,
                $scope,
                $rootScope,
                $stateParams
                ) {

        $scope.tag = $stateParams.tagName;
      }
    ]);
});
