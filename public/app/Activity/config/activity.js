'use strict';

define(['app'], function (app) {
  app.config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('searchQuery', {
        url: '/search/query/:query/',
        templateUrl: '/app/Activity/views/search-query.html',
        controller: 'SearchQueryCtrl'
      })
      .state('searchTag', {
        url: '/search/tag/:tag/',
        templateUrl: '/app/Activity/views/search-tag.html',
        controller: 'SearchTagCtrl'
      })

      .state('homepage', {
        url: '/',
        templateUrl: '/app/Activity/views/stream.html',
        controller: 'HomepageCtrl'
      })
      .state('stream', {
        url: '/stream/',
        templateUrl: '/app/Activity/views/stream.html',
        controller: 'StreamCtrl',
        data: {
          role: 'user'
        }
      })

      .state('latest', {
        url: '/latest/',
        templateUrl: '/app/Activity/views/latest.html',
        controller: 'LatestCtrl'
      })
      .state('latestCategory', {
        url: '/latest/:category/',
        templateUrl: '/app/Activity/views/latest.html',
        controller: 'LatestCategoryCtrl'
      })
      .state('activityCollection', {
        url: '/u/:userName/',
        templateUrl: '/app/Activity/views/user.html',
        controller: 'ActivityCtrl'
      })

      .state('activityDetails', {
        url: '/u/:userName/a/:activitySlug/',
        templateUrl: '/app/Activity/views/details/story.html',
        controller: 'ActivityDetailsCtrl'
      })
      .state('activityDetailsComments', {
        url: '/u/:userName/a/:activitySlug/comments/',
        templateUrl: '/app/Activity/views/details/comments.html',
        controller: 'ActivityDetailsCtrl'
      })
      .state('activityDetailsYouTube', {
        url: '/u/:userName/a/:activitySlug/youtube/',
        templateUrl: '/app/Activity/views/details/youtube.html',
        controller: 'ActivityDetailsCtrl'
      })
      .state('activityDetailsRelated', {
        url: '/u/:userName/a/:activitySlug/related/',
        templateUrl: '/app/Activity/views/details/related.html',
        controller: 'ActivityDetailsCtrl'
      })
  }]);

  app.run([
    '$rootScope',
    function ($rootScope) {
      $rootScope.activityImagePath = function (activity) {
        var mainImage = _.find(((activity && activity.media) || []), function (media) {
          return media.type === 'image' && media.main === true;
        });

        return (mainImage && mainImage.location) || false;
      };
    }
  ]);
});
