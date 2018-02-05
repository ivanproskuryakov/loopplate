'use strict';

define(['app'], function (app) {
  app.controller('ContactCtrl', [
    '$location',
    '$scope',
    'contactService',
    function ($location, $scope, contactService) {

      $scope.config = false;

      $scope.submitContact = function (form) {
        if (form.$valid) {
          contactService.send(form);
        }
      };

    }
  ]);
});
