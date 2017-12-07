'use strict';

define(['app'], function (app) {
  app.controller(
    'ActivityDetailsCtrl', [
      '$location',
      '$scope',
      '$rootScope',
      '$stateParams',
      '$state',
      'metaService',
      'Activity',
      '$anchorScroll',
      function ($location,
                $scope,
                $rootScope,
                $stateParams,
                $state,
                metaService,
                Activity,
                $anchorScroll) {

        $anchorScroll();

        loadActivity()
          .then(function () {
            loadRelatedActivity();
          });


        function loadRelatedActivity() {
          Activity
            .getRelatedResource({
              id: $scope.activity.id,
              resource: 'activity',
              quantity: 3
            })
            .$promise
            .then(function (response) {
              $scope.relatedActivity = _.shuffle(response)[0];
            });
        }

        function loadActivity() {
          return Activity.findOne({
            filter: {
              where: {
                slug: $stateParams.activitySlug,
                username: $stateParams.userName
              }
            }
          })
            .$promise
            .then(function (response) {
              $scope.activity = response;
              metaService.setActivity($scope.activity);
            });
        }

        $scope.$on('like', function (ev, data) {
          if (data.activityId !== $scope.activity.id) {
            return;
          }
        });
        $scope.$on('dislike', function (ev, data) {
          if (data.activityId !== $scope.activity.id) {
            return;
          }

          var index = $scope.likes.findIndex(function (item) {
            return item.username === $rootScope.user.username;
          });
          if (index !== -1) {
            $scope.likes.splice(index, 1);
          }
        });

        var fixImagesInDescription = function (source, description) {
          // todo: Important - finish with broken images
          var a = document.createElement('a');
          a.href = source;

          var hostname = a.hostname;
          var $description = $(description);

          $description.find('img').each(function () {
            var $this = $(this);
            var src = $this.attr('src');

            if (src.indexOf(hostname) === -1) {
              src = hostname + src;
            }

            $this.attr('src', src);
          });

          return description;
        };

      }
    ]);
});
