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
  './directives/related/twitterWidget',
  './directives/related/gplusWidget',

  './services/twitterWidgetService',
  './services/gplusWidgetService',
  './services/editor'
], function (app) {

});
