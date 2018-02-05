'use strict';

define(['app'], function (app) {
  app.controller(
    'StaticCtrl', [
      '$location',
      '$scope',
      function ($location,
                $scope) {

        $scope.date = new Date();

      }
    ]);
});
