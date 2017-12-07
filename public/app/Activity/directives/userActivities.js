'use strict';

define(['app'], function (app) {
  app.directive('userActivities',
    function () {

      return {
        restrict: 'EA',
        replace: 'true',
        scope: {
          user: '='
        },
        templateUrl: '/app/Activity/views/directives/activity-stream.html',
        controller: UserStreamController,
        link: function ($scope, element, attrs) {
        }
      };
    });

  UserStreamController.$inject = ['$scope', 'ModelPageLoader', 'User'];
  function UserStreamController($scope, ModelPageLoader, User) {

    $scope.load = function () {
      $scope.type = 'stream';

      if (!$scope.loader) {
        $scope.loader = ModelPageLoader.create(
          User.activities,
          {
            username: $scope.user.username,
            filter: {
              order: 'createdAt DESC'
            }
          }
        );
      }

      return $scope.loader.nextPage();
    };
  }
});
