'use strict';

define([
  'require',
  'angular',
  'app'
], function (require, angular) {
  require(['domReady!'], function (document) {
    angular.bootstrap(document, ['app']);
  });
});
