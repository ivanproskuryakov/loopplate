'use strict';

define(['app'], function (app) {
  app.directive('userAuth', [
    '$rootScope',
    '$mdDialog',
    function ($rootScope, $mdDialog) {
      return {
        restrict: 'EA',
        replace: 'true',
        templateUrl: '/app/User/views/directives/user-auth.html',
        link: function ($scope, element, attrs) {
          $scope.open = function () {
            $mdDialog
              .show({
                controller: 'ModalAuthCtrl',
                templateUrl: '/app/User/views/modal-auth-dialog.html',
                clickOutsideToClose: true,
                fullscreen: false,
              });
          };
        }
      };
    }
  ]);
});
