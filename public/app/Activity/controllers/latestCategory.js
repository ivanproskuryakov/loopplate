'use strict';

define(['app'], function (app) {
  app.controller(
    'LatestCategoryCtrl', [
      '$location',
      '$scope',
      '$stateParams',
      'Activity',
      'ModelPageLoader',
      function ($location, $scope, $stateParams, Activity, ModelPageLoader) {
        $scope.category = $stateParams.category;

        var params = {
          filter: {
            order: 'createdAt DESC',
            where: {
              and: [
                {
                  category: $scope.category
                }
              ]
            }
          }
        };

        $scope.load = function () {
          if (!$scope.loader) {
            $scope.loader = ModelPageLoader.create(
              Activity.find,
              params
            );
          }

          return $scope.loader.nextPage();
        };

      }
    ]);
});
