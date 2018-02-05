'use strict';

/**
 * @see https://github.com/arusahni/ngtweet
 */
define(['app'], function (app) {
  app.directive('twitterWidget', [
    'TwitterWidgetFactory',
    function (TwitterWidgetFactory) {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
          id: '=',
          onRendered: '&',
          options: '@'
        },
        template: '<div class="twitter-wrapper" ng-transclude></div>',
        link: function (scope, element, attrs) {
          scope.$watch('id', function (newValue, oldValue) {
            var options = scope.$eval(attrs.options);
            if (oldValue !== undefined && newValue !== oldValue) { //replacing, clear node.
              angular.element(element[0]).empty();
            }
            if (!angular.isUndefined(scope.id)) {
              if (!angular.isString(scope.id)) {
                console.warn('id should probably be a string due to loss of precision.');
              }
              TwitterWidgetFactory.createTweet(scope.id, element[0], options)
                .then(function success(embed) {
                  scope.onRendered();
                }).catch(function creationError(message) {
                console.error('Could not create widget: ', message, element);
              });
            } else {
              TwitterWidgetFactory.load(element[0]);
            }
          });
        }
      };
    }]);
});
