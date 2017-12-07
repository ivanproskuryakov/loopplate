'use strict';

define(['app'], function (app) {
  app.controller(
    'ActivityCtrl', [
      '$location',
      '$scope',
      '$rootScope',
      '$stateParams',
      'metaService',
      'User',
      function ($location,
                $scope,
                $rootScope,
                $stateParams,
                metaService,
                User) {

        $scope.canUpdateProfile = false;


        $rootScope.$on('profilePhotoChangedEvent', function (ev, data) {
          var request = {
            avatar: {
              location: data.location,
              type: data.type
            }
          };

          User.prototype$patchAttributes({id: $scope.profile.id}, request)
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
              $scope.profile = response;

              if ($rootScope.user && $scope.profile && $rootScope.user.id === $scope.profile.id) {
                $scope.canUpdateProfile = true;
              }

              metaService.setUser($scope.profile);
            });
        }
      }
    ]);
});
