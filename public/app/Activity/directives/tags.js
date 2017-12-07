'use strict';

define(['app'], function (app) {
  app.directive('tags', function () {
    return {
      restrict: 'EA',
      replace: 'true',
      scope: {
        data: '=',
        max: '=?'
      },
      templateUrl: '/app/Activity/views/directives/tags.html',
      link: function ($scope, element, attrs) {
        $scope.max = $scope.max || 3;
      }
    };
  });
});
