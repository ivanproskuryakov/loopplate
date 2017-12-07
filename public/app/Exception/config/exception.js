'use strict';

define(['app'], function (app) {
  app.config([
    '$stateProvider',
    '$httpProvider',
    function ($stateProvider, $httpProvider) {
      $stateProvider
        .state('exception', {
          url: '/exception/:errorCode/',
          templateUrl: '/app/Exception/views/exception.html',
          controller: 'ExceptionCtrl'
        })
        .state('exceptionDefault', {
          url: '/exception/',
          templateUrl: '/app/Exception/views/exception.html',
          controller: 'ExceptionCtrl'
        });

      $httpProvider.interceptors.push('errorInterceptor');
    }
  ]);
});
