'use strict';

define(['app'], function (app) {
  app.directive('userStream',
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


  UserStreamController.$inject = ['$scope', '$rootScope', 'ModelPageLoader', 'User'];
  function UserStreamController($scope, $rootScope, ModelPageLoader, User) {

    $scope.load = function () {
      $scope.type = 'stream';

      if (!$scope.loader) {
        $scope.loader = ModelPageLoader.create(
          User.stream,
          null
        );
      }

      return $scope.loader.nextPage();
    };
  }
});
