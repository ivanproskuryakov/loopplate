'use strict';

define(['app'], function (app) {
  app.directive('comment',
    function () {

      return {
        restrict: 'EA',
        replace: 'true',
        scope: {
          data: '=',
          activity: '='
        },
        templateUrl: '/app/Comment/views/directives/comment.html',
        controller: CommentController,
        link: function ($scope, element, attrs) {
        }
      };
    });


  CommentController.$inject = ['$scope'];
  function CommentController($scope) {
    $scope.reply = false;

    $scope.writeReply = function () {
      $scope.options.reply = true;
      $scope.onReply($scope.data);
    };
  }
});
