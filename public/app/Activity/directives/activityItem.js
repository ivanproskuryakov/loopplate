'use strict';

define(['app'], function (app) {
  app.directive('activityItem', [
    '$rootScope',
    '$filter',
    function ($rootScope, $filter) {
      return {
        restrict: 'EA',
        replace: 'true',
        scope: {
          activity: '='
        },
        templateUrl: '/app/Activity/views/directives/activity-item.html',
        link: function ($scope, element, attrs) {

          var htmlToPlaintext = function (text) {
            return text ? String(text).replace(/<[^>]+>/gm, '') : '';
          };
          var short = $filter('limitTo')(
            htmlToPlaintext($scope.activity.description),
            250,
            0
          );

          $scope.activity.shortDescription = short + ' ...';
          $scope.activityImagePath = $rootScope.activityImagePath;

          if (attrs.mode) {
            $scope.mode = attrs.mode;
          } else {
            $scope.mode = 'stream';
          }
        }
      };
    }]);
});
