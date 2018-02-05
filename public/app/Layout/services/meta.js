'use strict';

define(['app'], function (app) {
  angular.module('app')
    .service('metaService', [
      '$rootScope',
      function ($rootScope) {
        var defaultTitle = 'Loopback Node.js framework boilerplate - loopplate.com';
        var defaultDescription = 'Loopback Node.js framework - loopplate.com';

        function cleanHTML(html) {
          if (!html) {
            return '';
          }

          return $('<div>' + html + '</div>').text();
        }

        return {
          reset: function () {

            $rootScope.meta = {
              title: defaultTitle,
              description: defaultDescription,
              keywords: ''
            };
          },

          setUser: function (profile) {
            $rootScope.meta = {
              title: profile.username + ' - ' + defaultTitle,
              description: profile.username + ' - ' + (profile.about || defaultDescription),
              og: {
                type: 'profile',
                image: profile.avatar ? profile.avatar.location : undefined,
                firstName: profile.firstName,
                lastName: profile.lastName,
                username: profile.username,
              }
            };
          },

          setActivity: function (activity) {
            var textDescription = cleanHTML(activity.description).substring(0, 200);

            $rootScope.meta = {
              title: activity.name + ' - ' + defaultTitle,
              description: textDescription + ' - ' + activity.user.username + ' - ' + defaultDescription,
              og: {
                type: 'article',
                image: $rootScope.activityImagePath(activity),
                publishedTime: activity.createdAt,
                author: activity.user.username,
                section: activity.category,
                tag: activity.tags
              }
            };
          },

          setSearch: function (query) {
            $rootScope.meta = {
              title: query + ' - ' + defaultTitle,
              description: defaultDescription
            };
          }
        };
      }
    ]);
});
