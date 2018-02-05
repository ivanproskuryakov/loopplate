'use strict';

define(['app'], function (app) {
  app.controller(
    'SearchTagCtrl', [
      '$location',
      '$scope',
      '$rootScope',
      'Activity',
      'ModelPageLoader',
      '$stateParams',
      function ($location,
                $scope,
                $rootScope,
                Activity,
                ModelPageLoader,
                $stateParams) {

        $scope.tag = $stateParams.tag;

        var filter = {
          filter: {
            order: 'createdAt DESC'
          }
        };
        filter.filter.where = {
          'tags.value': {
            all: [$scope.tag]
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
