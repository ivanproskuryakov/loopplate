'use strict';

define(['app'], function (app) {
  app.controller(
    'ActivityDetailsCtrl', [
      '$location',
      '$scope',
      '$anchorScroll',
      '$rootScope',
      '$stateParams',
      '$state',
      'metaService',
      'Activity',
      function ($location,
                $scope,
                $anchorScroll,
                $rootScope,
                $stateParams,
                $state,
                metaService,
                Activity) {

        $anchorScroll();

        $scope.showActivityPage = function (page) {
          $state.transitionTo('activityDetails'+page, {
            userName: $scope.activity.user.username,
            activitySlug: $stateParams.activitySlug
          });
        };


        var displayLikesCount = 10;
        $scope.activeTab = 'activity';

        loadActivity()
          .then(function () {
            loadActivityLikes($scope.activity.id);
          });


        function loadActivity() {
          return Activity.findOne({
            filter: {
              where: {
                slug: $stateParams.activitySlug,
                username: $stateParams.userName
              }
            }
          })
            .$promise
            .then(function (response) {
              $scope.activity = response;

              metaService.setActivity($scope.activity);
            });
        }

        function loadActivityLikes(id) {
          return Activity.likes({
            id: id,
            filter: {
              limit: displayLikesCount
            }
          }).$promise
            .then(function (response) {
              $scope.likes = response;
            });
        }

        $scope.$on('like', function (ev, data) {
          if (data.activityId !== $scope.activity.id) {
            return;
          }

          if ($scope.likes.length < displayLikesCount) {
            $scope.likes.push($rootScope.user);
          }
        });

        $scope.$on('dislike', function (ev, data) {
          if (data.activityId !== $scope.activity.id) {
            return;
          }

          var index = $scope.likes.findIndex(function (item) {
            return item.username === $rootScope.user.username;
          });
          if (index !== -1) {
            $scope.likes.splice(index, 1);
          }
        });

        $scope.close = function () {
          $state.transitionTo('activityCollection', {
            userName: $scope.activity.user.username
          });
        };

      }
    ]);
});
