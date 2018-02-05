'use strict';

define(['app'], function (app) {
  app.controller('NavigationCtrl', [
    '$scope',
    '$mdSidenav',
    function ($scope, $mdSidenav) {
      var originatorEv;

      $scope.toggleSidenav = function () {
        $mdSidenav('left').toggle();
      };

      $scope.showUserDropdown = function($mdMenu, ev) {
        originatorEv = ev;
        $mdMenu.open(ev);
      };
    }
  ]);
});
