'use strict';

define(['app'], function (app) {
  app.directive('queryActivities', [
    'ModelPageLoader',
    'Activity',
    function (ModelPageLoader, Activity) {

      return {
        restrict: 'EA',
        replace: 'true',
        scope: {
          query: '=',
          tag: '=',
        },
        templateUrl: '/app/Activity/views/directives/activity-stream.html',
        link: function ($scope, element, attrs) {

          var filter = {
            filter: {
              order: 'createdAt DESC'
            }
          };

          if ($scope.query) {
            filter.filter.where = {
              name: {
                like: $scope.query
              }
            };
          }

          if ($scope.tag) {
            filter.filter.where = {
              'tags.value': {
                all: [$scope.tag]
              }
            };
          }

          console.log(filter);

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
