'use strict';

define(['app'], function (app) {
  app.directive('userFollowing', function () {
    return {
      restrict: 'EA',
      scope: {
        user: '='
      },
      templateUrl: '/app/User/views/directives/user-following.html',
      controller: UserFollowingController,
      link: function ($scope, element, attrs) {
      }
    };
  });

  UserFollowingController.$inject = ['$scope', '$rootScope', 'User'];
  function UserFollowingController($scope, $rootScope, User) {

    $scope.canFollow = function () {
      if (!$scope.user) {
        return false;
      }
      if (!$rootScope.user) {
        return true;
      }

      return $scope.user.id !== $rootScope.user.id;
    };

    $scope.follow = function () {
      User.follow({id: $scope.user.id})
        .$promise
        .then(function () {
          // throw event
          $rootScope.$broadcast('following', {
            id: $scope.user.id,
            status: true
          });
        });
    };

    $scope.unfollow = function () {
      User.unfollow({id: $scope.user.id})
        .$promise
        .then(function () {
          // throw event
          $rootScope.$broadcast('following', {
            id: $scope.user.id,
            status: false
          });
        });
    };

    $scope.$on('following', function (ev, data) {
      if ($scope.user.id !== data.id) {
        return;
      }

      $scope.user.isFollowing = data.status;
      $scope.user.followersCount += data.status ? 1 : -1;
    });
  }

});
