'use strict';

define(['app'], function (app) {
  app.controller(
    'CategoryCtrl', [
      '$location',
      '$scope',
      '$stateParams',
      'Activity',
      function ($location, $scope, $stateParams, Activity) {

        var loadActivities = function (details) {
          Activity
            .getTrendingByCategory({
              limit: 3,
              category: $stateParams.category
            })
            .$promise
            .then(function (response) {
              $scope.trending = details;
              $scope.trending.activities = response;
            });
        };

        Activity
          .getTrendingCategoryDetails({
            category: $stateParams.category
          })
          .$promise
          .then(function (response) {
            loadActivities(response);
          });


        $scope.category = $stateParams.category;
      }
    ]);
});
