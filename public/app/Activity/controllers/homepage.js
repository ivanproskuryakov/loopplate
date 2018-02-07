'use strict';

define(['app'], function (app) {
  app.controller(
    'HomepageCtrl', [
      '$location',
      '$scope',
      '$state',
      '$rootScope',
      function ($location,
                $scope,
                $state,
                $rootScope) {

        if ($rootScope.user) {
          $state.transitionTo('stream');
        }

      }
    ]);
});
