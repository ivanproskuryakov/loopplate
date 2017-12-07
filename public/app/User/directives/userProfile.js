'use strict';

define(['app'], function (app) {
  app.directive('userProfile', function () {
    return {
      restrict: 'EA',
      scope: {
        user: '='
      },
      templateUrl: '/app/User/views/directives/user-profile.html',
      controller: UserProfileController,
      link: function ($scope, element, attrs) {
        $scope.mode = 'simple';
        $scope.shape = 'mod-circle';
        // $scope.size = 'mod-default';
        $scope.imgSize = '50px';

        if (attrs.mode) {
          $scope.mode = attrs.mode;
        }

        if (attrs.shape) {
          $scope.shape = 'mod-' + attrs.shape;
        }

        if (attrs.size) {
          $scope.size = 'mod-' + attrs.size;
        }

        if (attrs.imgSize) {
          $scope.imgSize = attrs.imgSize;
        }
      }
    };
  });

  UserProfileController.$inject = ['$scope', '$rootScope', 'User'];
  function UserProfileController($scope, $rootScope, User) {

  }

});
