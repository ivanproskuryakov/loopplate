'use strict';

define(['app'], function (app) {
  app.directive('activityLike', [
    '$state',
    '$rootScope',
    'Activity',
    function ($state, $rootScope, Activity) {
      return {
        restrict: 'EA',
        replace: 'true',
        scope: {
          activity: '='
        },
        templateUrl: '/app/Activity/views/directives/activity-like.html',
        link: function ($scope, element, attrs) {

          $scope.toggleLike = function () {
            if (!$scope.activity) {
              return;
            }

            if ($scope.activity.isLiked) {
              dislike();
            } else {
              like();
            }
          };

          function like() {
            Activity.like({id: $scope.activity.id})
              .$promise
              .then(function () {
                $scope.activity.isLiked = true;
                $scope.activity.likesCount++;

                $rootScope.$broadcast('like', {
                  activityId: $scope.activity.id
                });
              });
          }

          function dislike() {
            Activity.dislike({id: $scope.activity.id})
              .$promise
              .then(function () {
                $scope.activity.isLiked = false;
                $scope.activity.likesCount--;

                $rootScope.$broadcast('dislike', {
                  activityId: $scope.activity.id
                });
              });
          }

        }
      }
    }]);
});
