'use strict';

define(['app'], function (app) {
  app.controller(
    'ActivityNewModalCtrl', [
      '$scope',
      '$rootScope',
      '$mdDialog',
      '$state',
      '$q',
      '$mdToast',
      'uploadService',
      'editorService',
      'Activity',
      function ($scope,
                $rootScope,
                $mdDialog,
                $state,
                $q,
                $mdToast,
                uploadService,
                editorService,
                Activity) {

        $scope.close = function () {
          $mdDialog.hide();
        };

        $scope.save = function () {
          var newActivity = {
            type: 'text',
            name: $scope.activityBody
          };

          console.log(newActivity);

          if (newActivity.name !== "") {
            Activity
              .post(newActivity)
              .$promise
              .then(function () {
                $state.transitionTo('activityCollection', {
                  userName: $rootScope.user.username
                });
                $mdToast.show(
                  $mdToast.simple()
                    .textContent('Update was added.')
                );
                $mdDialog.hide();
              })
              .catch(function (err) {
                $mdToast.show(
                  $mdToast.simple()
                    .textContent(err.data.error.message)
                );
              });
          } else {
            $mdToast.show(
              $mdToast
                .simple()
                .textContent('Text body is missing')
            );
          }
        };

      }
    ]);
});
