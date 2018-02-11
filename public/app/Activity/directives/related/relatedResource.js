'use strict';

define(['app'], function (app) {
  app.directive('relatedResource',
    function () {
      return {
        restrict: 'EA',
        replace: 'true',
        scope: {
          activity: '=',
          type: '='
        },
        templateUrl: '/app/Activity/views/directives/related/related-resource.html',
        controller: RelatedResourceController,
        link: function ($scope, element, attrs) {
        }
      };
    });
});

RelatedResourceController.$inject = ['$scope', '$sce', 'Activity'];
function RelatedResourceController($scope, $sce, Activity) {
  $scope.busy = false;
  $scope.data = [];
  $scope.$watch('activity', load);

  function load() {
    if ($scope.activity) {
      $scope.data = [];
      $scope.busy = true;

      Activity
        .getRelatedResource({
          id: $scope.activity.id,
          resource: $scope.type,
          quantity: 10
        })
        .$promise
        .then(function (response) {
          $scope.data = response;

          $scope.busy = false;
        });
    }
  }

  /**
   * needed to allow embedded player
   */
  $scope.getTrustedEmbedUrl = function (id) {
    return $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + id);
  };
}
