'use strict';

define(['app'], function (app) {
  app.directive('writeComment',
    function () {

      return {
        restrict: 'EA',
        scope: {
          activity: '=',
          onReply: '=?'
        },
        templateUrl: '/app/Comment/views/directives/write-comment.html',
        controller: WriteCommentController,
        link: function ($scope, element, attrs) {
          $scope.mode = 'default';
        }
      };
    });

  WriteCommentController.$inject = ['$scope', '$rootScope', '$state', 'Comment'];
  function WriteCommentController($scope, $rootScope, $state, Comment) {

    $scope.comment = {
      body: ''
    };

    $scope.onReply = function (replyToComment) {
      $scope.comment.replyOnId = replyToComment.id;
    };

    $scope.submit = function () {
      $rootScope.displayException = false;
      if (!$scope.comment.body || $scope.comment.body.length < 1) return;

      Comment.create({}, {
        text: $scope.comment.body,
        replyOnId: $scope.comment.replyOnId,
        activityId: $scope.activity.id
      }, function (response, headers) {
        var location = headers('location');

        $scope.comment.body = '';
        $rootScope.$broadcast('commented', {
          id: extractIdFromLocation(location),
          activityId: $scope.activity.id
        });
      }, function (error) {
        // Additional error handling (extra) ...
      });
    };

    function extractIdFromLocation(location) {
      return location.match(/\/([^/]*)$/)[1];
    }
  }
});
