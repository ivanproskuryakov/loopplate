'use strict';

define(['app'], function (app) {
  app.directive('activityNew', [
    '$rootScope',
    '$mdDialog',
    function ($rootScope, $mdDialog) {
      return {
        restrict: 'EA',
        replace: 'true',
        templateUrl: '/app/Activity/views/directives/activity-new.html',
        link: function ($scope, element, attrs) {
          $scope.open = function () {
            $mdDialog
              .show({
                controller: 'ActivityNewModalCtrl',
                templateUrl: '/app/Activity/views/new/modal-write-dialog.html',
                clickOutsideToClose: true,
                fullscreen: false,
              });
          };
        }
      };
    }
  ]);
});
