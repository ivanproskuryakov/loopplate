'use strict';

define(['app'], function (app) {
  app.controller('ModalAuthCtrl', [
    '$scope',
    '$mdDialog',
    'LoopBackResource',
    function ($scope,
              $mdDialog,
              LoopBackResource) {

      $scope.close = function () {
        $mdDialog.hide();
      };
      $scope.oauthRedirect = function (provider) {
        window.location = LoopBackResource.getUrlBase().replace('/api', '') + '/auth/' + provider;
      };
    }]);
});
