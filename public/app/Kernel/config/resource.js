'use strict';

define(['app'], function (app) {

  app.config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('about', {
        url: '/page/about-and-contacts/',
        templateUrl: '/app/Kernel/views/about-and-contacts.html',
        controller: 'StaticCtrl'
      })
      .state('terms', {
        url: '/page/terms-of-service/',
        templateUrl: '/app/Kernel/views/terms.html',
        controller: 'StaticCtrl'
      })
      .state('privacy', {
        url: '/page/privacy/',
        templateUrl: '/app/Kernel/views/privacy.html',
        controller: 'StaticCtrl'
      });
  }]);

  app.run([
    '$http',
    '$window',
    '$location',
    '$rootScope',
    'metaService',
    function ($http,
              $window,
              $location,
              $rootScope,
              metaService) {
      $rootScope.$on('$stateChangeStart', function (event, toState) {
        $rootScope.appState = toState.name;

        metaService.reset();
      });
    }
  ]);
});
