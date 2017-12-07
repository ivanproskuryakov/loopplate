'use strict';

define(['app'], function (app) {
  app.directive('trendingActivities', [
    'ModelPageLoader',
    'Activity',
    function (ModelPageLoader, Activity) {

      return {
        restrict: 'EA',
        replace: 'true',
        scope: {
          query: '=',
        },
        templateUrl: '/app/Activity/views/directives/activity-stream.html',
        link: function ($scope, element, attrs) {

          var filter = {
            filter: {
              order: 'createdAt DESC',
              where: {
                'achievements.0': {
                  exists: true
                }
              }
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
