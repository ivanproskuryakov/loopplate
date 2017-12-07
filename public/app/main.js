'use strict';

require.config({
  paths: {
    'jQuery': '../bower_components/jquery/jquery.min',
    'underscore': '../bower_components/underscore/underscore-min',
    'domReady': '../bower_components/domReady/domReady',
    'medium-editor': '../bower_components/medium-editor/dist/js/medium-editor.min',
    'angular': '../bower_components/angular/angular.min',
    'angular-resource': '../bower_components/angular-resource/angular-resource.min',
    'angular-cookies': '../bower_components/angular-cookies/angular-cookies.min',
    'angular-sanitize': '../bower_components/angular-sanitize/angular-sanitize.min',
    'angular-loading-bar': '../bower_components/angular-loading-bar/build/loading-bar.min',
    'angular-google-analytics': '../bower_components/angular-google-analytics/dist/angular-google-analytics.min',
    'ui-validate': '../bower_components/angular-ui-validate/dist/validate.min',
    'angular-ui-router': '../bower_components/angular-ui-router/release/angular-ui-router.min',
    'moment': '../bower_components/moment/min/moment.min',
    'angular-moment': '../bower_components/angular-moment/angular-moment.min',
    'infinite-scroll': '../bower_components/ngInfiniteScroll/build/ng-infinite-scroll.min',
    'ngFileUpload': '../bower_components/ng-file-upload/ng-file-upload-all.min',
    'ngTagsInput': '../bower_components/ng-tags-input/ng-tags-input.min',
    'ngAria': '../bower_components/angular-aria/angular-aria.min',
    'ngAnimate': '../bower_components/angular-animate/angular-animate.min',
    'ngMessages': '../bower_components/angular-messages/angular-messages.min',
    'ngMaterial': '../bower_components/angular-material/angular-material.min',
    'uiCropper': '../libraries/ui-cropper/ui-cropper',
  },
  shim: {
    'jQuery': {
      'exports': 'jQuery'
    },
    'angular': {
      'exports': 'angular',
      deps: ['jQuery']
    },
    'medium-editor': ['angular'],
    'ngAria': ['angular'],
    'ngAnimate': ['angular'],
    'ngMessages': ['angular'],
    'ngMaterial': {
      deps: ['ngAria', 'ngAnimate', 'ngMessages']
    },
    'angular-google-analytics': ['angular'],
    'angular-i18n': ['angular'],
    'angular-loading-bar': ['angular'],
    'angular-ui-router': ['angular'],
    'domReady': ['angular'],
    'angular-resource': ['angular'],
    'angular-cookies': ['angular'],
    'angular-sanitize': ['angular'],
    'ui-validate': ['angular'],
    'md5': ['angular'],
    'angular-moment': ['angular', 'moment'],
    'infinite-scroll': ['angular', 'jQuery'],
    'ngFileUpload': ['angular', 'jQuery'],
    'uiCropper': ['angular', 'jQuery'],
    'headroom': ['jQuery'],
    'ngHeadroom': ['angular', 'headroom'],
    'ngTagsInput': ['angular']
  },
  deps: [
    './templates',
    './loopback-services',
    './Kernel/Kernel',
    './Exception/Exception',
    './User/User',
    './Activity/Activity',
    './Media/Media',
    'bootstrap'
  ],
  priority: [
    'angular'
  ],
  waitSeconds: 0
});
