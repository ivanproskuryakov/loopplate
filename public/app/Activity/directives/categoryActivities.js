'use strict';

define(['app'], function (app) {
  app.directive('categoryActivities', [
    'ModelPageLoader',
    'Activity',
    function (ModelPageLoader, Activity) {

      return {
        restrict: 'EA',
        replace: 'true',
        scope: {
          category: '=',
        },
        templateUrl: '/app/Activity/views/directives/activity-stream.html',
        link: function ($scope, element, attrs) {

          var filter = {
            filter: {
              where: {
                category: $scope.category
              },
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
      };
    }]);
});
