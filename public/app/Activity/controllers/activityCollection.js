'use strict';

define(['app'], function (app) {
  app.controller(
    'ActivityCtrl', [
      '$location',
      '$scope',
      '$rootScope',
      '$stateParams',
      'metaService',
      'ModelPageLoader',
      'User',
      function ($location,
                $scope,
                $rootScope,
                $stateParams,
                metaService,
                ModelPageLoader,
                User) {

        $scope.type = 'user';
        $scope.canUpdateProfile = false;

        $rootScope.$on('profilePhotoChangedEvent', function (ev, data) {
          var request = {
            avatar: {
              location: data.location,
              type: data.type
            }
          };

          User.prototype$patchAttributes({id: $scope.user.id}, request)
            .$promise
            .then(function () {
              return loadUserProfile();
            })
            .then(function () {
              $rootScope.loadUser();
            });
        });

        loadUserProfile();

        function loadUserProfile() {
          return User.publicProfile({username: $stateParams.userName})
            .$promise
            .then(function (response) {
              $scope.user = response;

              if ($rootScope.user && $scope.user && $rootScope.user.id === $scope.user.id) {
                $scope.canUpdateProfile = true;
              }

              metaService.setUser($scope.user);
            });
        }


        $scope.load = function () {
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
    ]);
});
