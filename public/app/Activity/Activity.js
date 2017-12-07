'use strict';

define([
  'app',
  './config/activity',

  './controllers/homepage',
  './controllers/trending',
  './controllers/stream',
  './controllers/category',

  './controllers/search',
  './controllers/activity',
  './controllers/activityNew',
  './controllers/activityByTag',
  './controllers/activityDetails',

  './directives/tags',
  './directives/activityLike',
  './directives/activityCard',
  './directives/trendingActivities',
  './directives/categoryActivities',
  './directives/queryActivities',
  './directives/userActivities',
  './directives/userStream',

  './services/related/twitterWidgetService',
  './services/related/gplusWidgetService',

  './directives/related/relatedResource',
  './directives/related/twitterWidget',
  './directives/related/gplusWidget',

  './services/editor'
], function (app) {
});
