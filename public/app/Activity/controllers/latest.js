'use strict';

define(['app'], function (app) {
  app.controller(
    'LatestCtrl', [
      '$location',
      '$scope',
      'Activity',
      'ModelPageLoader',
      '$rootScope',
      function ($location,
                $scope,
                Activity,
                ModelPageLoader,
                $rootScope) {

        $scope.type = 'latest';

        var filter = {
          filter: {
            order: 'createdAt DESC'
          },
        };

        $scope.load = function () {
          if (!$scope.loader) {
            $scope.loader = ModelPageLoader.create(
              Activity.find,
              filter
            );
          }

          return $scope.loader.nextPage();
        };

      }
    ]);
});
