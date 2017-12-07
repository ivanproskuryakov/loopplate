'use strict';

define(['app'], function (app) {
  app.directive('comments',
    function () {

      return {
        restrict: 'EA',
        replace: 'true',
        scope: {
          activity: '='
        },
        templateUrl: '/app/Comment/views/directives/comments.html',
        controller: CommentsController,
        link: function ($scope, element, attrs) {
          $scope.mode = 'details';

          if (attrs.mode) {
            $scope.mode = attrs.mode;
          }
        }
      };
    });

  CommentsController.$inject = ['$scope', 'TreeBuilder', 'Comment'];
  function CommentsController($scope, TreeBuilder, Comment) {
    $scope.commentsCount = 0;
    $scope.comments = $scope.activity.comments || [];

    var treeBuilder = TreeBuilder.create('id', 'replyOnId', 'replies');

    buildTree($scope.comments);

    $scope.$on('commented', function (ev, data) {
      if (data.activityId !== $scope.activity.id) {
        return;
      }

      Comment.findById({
        id: data.id
      })
        .$promise
        .then(addToTree);
    });

    function buildTree(comments) {
      // build tree
      $scope.comments = treeBuilder.build(comments);
      // upate count
      $scope.commentsCount = comments.length;
    }

    function addToTree(comment) {
      $scope.comments = treeBuilder.join($scope.comments, [comment]);
      // upate count
      $scope.commentsCount++;
    }
  }
});
