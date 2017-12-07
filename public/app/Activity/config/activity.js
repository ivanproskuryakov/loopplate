'use strict';

define(['app'], function (app) {
  app.config(['$stateProvider', function ($stateProvider) {
    $stateProvider
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
      .state('category', {
        url: '/category/:category/',
        templateUrl: '/app/Activity/views/category.html',
        controller: 'CategoryCtrl'
      })
      .state('trending', {
        url: '/trending/',
        templateUrl: '/app/Activity/views/trending.html',
        controller: 'TrendingCtrl'
      })

      .state('searchQuery', {
        url: '/search/query/:q/',
        templateUrl: '/app/Activity/views/searchQuery.html',
        controller: 'SearchCtrl'
      })
      .state('searchTag', {
        url: '/search/tag/:q/',
        templateUrl: '/app/Activity/views/searchTag.html',
        controller: 'SearchCtrl'
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

      .state('activityNew', {
        url: '/update/new/',
        templateUrl: '/app/Activity/views/new/content.html',
        controller: 'ActivityNewCtrl',
        data: {
          role: 'user'
        }
      });
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
