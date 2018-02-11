'use strict';

define([
  'app',
  './config/activity',

  './controllers/homepage',
  './controllers/stream',
  './controllers/searchQuery',
  './controllers/searchTag',

  './controllers/latest',
  './controllers/latestCategory',

  './controllers/activityCollection',
  './controllers/activityNewModal',
  './controllers/activityDetails',


  './directives/tags',
  './directives/activityLike',
  './directives/activityNew',
  './directives/activityItem',
  './directives/related/relatedResource',

  './services/editor'
], function (app) {

});
