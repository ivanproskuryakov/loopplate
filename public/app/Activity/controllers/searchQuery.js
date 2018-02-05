'use strict';

define(['app'], function (app) {
  app.controller(
    'SearchQueryCtrl', [
      '$location',
      '$scope',
      '$rootScope',
      'Activity',
      'ModelPageLoader',
      '$stateParams',
      'metaService',
      function ($location,
                $scope,
                $rootScope,
                Activity,
                ModelPageLoader,
                $stateParams,
                metaService) {

        $scope.query = $stateParams.query;
        $rootScope.searchQuery = $stateParams.query;
        metaService.setSearch($scope.query);

        var filter = {
          filter: {
            order: 'createdAt DESC'
          }
        };
        filter.filter.where = {
          name: {
            like: $scope.query
          }
        };

        $scope.load = function () {
          if (!$scope.loader) {
            $scope.loader = ModelPageLoader.create(
              Activity.find,
              filter
            );
          }

          return $scope.loader.nextPage();
        };


      }
    ]);
});
