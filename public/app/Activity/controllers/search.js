'use strict';

define(['app'], function (app) {
  app.controller(
    'SearchCtrl', [
      '$location',
      '$scope',
      '$rootScope',
      '$stateParams',
      'metaService',
      function ($location,
                $scope,
                $rootScope,
                $stateParams,
                metaService) {

        $scope.query = $stateParams.q;
        $rootScope.searchQuery = $stateParams.q;

        metaService.setSearch($scope.query);
      }
    ]);
});
