'use strict';

define([
    'angular',
    'jQuery',
    'underscore',
    'angular-google-analytics',
    'angular-resource',
    'angular-cookies',
    'angular-sanitize',
    'ui-validate',
    'angular-ui-router',
    'ngMessages',
    'ngAria',
    'ngAnimate',
    'angular-loading-bar',
    'angular-moment',
    'ngMaterial',
    'infinite-scroll',
    'ngFileUpload',
    'ngTagsInput',
    'uiCropper'
  ],
  function (angular) {

    var app = angular.module('app', [
      'angular-google-analytics',
      'ngMaterial',
      'ngCookies',
      'ngResource',
      'ngSanitize',
      'ui.router',
      'ui.validate',
      'ngMessages',
      'ngAria',
      'ngAnimate',
      'angular-loading-bar',
      'angularMoment',
      'LoopbackServices',
      'infinite-scroll',
      'ngFileUpload',
      'ngTagsInput',
      'uiCropper',
    ]);

    if (window.location.hostname === 'loopplate.com') {
      app.requires.push('templates');
      app.config(['AnalyticsProvider', function (AnalyticsProvider) {
        AnalyticsProvider.setAccount('UA-80233352-1');
      }]);
    }

    app
      .config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeSpinner = false;
        cfpLoadingBarProvider.includeBar = true;
      }])
      .config(function ($provide, $locationProvider, $httpProvider) {
        $httpProvider.defaults.withCredentials = true;
        $locationProvider.html5Mode(true);
      })
      .config(['$qProvider', function ($qProvider) {
        $qProvider.errorOnUnhandledRejections(false);
      }])
      .run(['$http', '$rootScope', 'initService', 'Analytics',
        function ($http, $rootScope, initService, Analytics) {
          document.getElementById('page-is-loading').remove();
          initService.launch();
        }
      ]);

    return app;
  });
