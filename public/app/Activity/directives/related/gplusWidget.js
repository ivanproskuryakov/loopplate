'use strict';

define(['app'], function (app) {
  app.directive('gplusWidget', [
    'GplusWidgetFactory',
    function (GplusWidgetFactory) {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
          url: '='
        },
        template: '<div class="gplus-wrapper" ng-transclude></div>',
        link: function (scope, element, attrs) {
          scope.$watch('url', function (newValue, oldValue) {
            if (oldValue !== undefined && newValue !== oldValue) { //replacing, clear node.
              angular.element(element[0]).empty();
            }
            if (!angular.isUndefined(scope.url)) {
              GplusWidgetFactory.createPost(scope.url, element[0])
                .catch(function creationError(message) {
                  console.error('Could not create widget: ', message, element);
                });
            }
          });
        }
      };
    }]);
});
