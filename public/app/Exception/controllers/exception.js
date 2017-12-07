'use strict';

define(['app'], function (app) {
  app.controller('ExceptionCtrl', [
    '$state',
    '$scope',
    '$rootScope',
    '$stateParams',
    function ($state, $scope, $rootScope, $stateParams) {
      $scope.errorTitle = 'Oops, something went wrong...';

      if ($stateParams.errorCode === 404) {
        $scope.errorTitle = '404, page not found...';
      }
    }
  ]);
});
