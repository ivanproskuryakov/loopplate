'use strict';

define(['app'], function (app) {
  app.directive('activityCard', [
    '$rootScope',
    '$filter',
    function ($rootScope, $filter) {
      return {
        restrict: 'EA',
        replace: 'true',
        scope: {
          activity: '='
        },
        templateUrl: '/app/Activity/views/directives/activity-card.html',
        link: function ($scope, element, attrs) {

          var htmlToPlaintext = function (text) {
            return text ? String(text).replace(/<[^>]+>/gm, '') : '';
          };
          var short = $filter('limitTo')(
            htmlToPlaintext($scope.activity.description),
            100,
            0
          );

          $scope.activity.shortDescription = short+' ...';
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
