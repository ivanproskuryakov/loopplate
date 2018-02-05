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
          if (!$scope.loader) {
            $scope.loader = ModelPageLoader.create(
              User.stream,
              null
            );
          }

          return $scope.loader.nextPage();
        };

      }
    ]);
});
