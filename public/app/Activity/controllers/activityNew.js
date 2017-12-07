'use strict';

define(['app'], function (app) {
  app.controller(
    'ActivityNewCtrl', [
      '$scope',
      '$rootScope',
      '$state',
      '$q',
      '$mdToast',
      'uploadService',
      'editorService',
      'Activity',
      function ($scope,
                $rootScope,
                $state,
                $q,
                $mdToast,
                uploadService,
                editorService,
                Activity) {

        $scope.activity = [];

        $scope.connectEditor = function () {
          editorService.init();
        };

        $scope.save = function () {
          var newActivity = {
            type: 'text',
            name: editorService.getHTML().trim()
          };

          console.log(newActivity);

          if (newActivity.name !== "") {
            Activity
              .post(newActivity)
              .$promise
              .then(function () {
                // redirect to user's stream
                $state.transitionTo('activityCollection', {
                  userName: $rootScope.user.username
                });
                $mdToast.show(
                  $mdToast.simple()
                    .textContent('Update was added.')
                );
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

        $scope.upload = function (file) {
          if (!file) {
            return;
          }

          uploadService
            .upload(file, {relation: 'activity'})
            .then(function (response) {
              $scope.activity.imageUrl = response.data.location;
            })
            .catch(function (response) {
              console.log(response);
              $mdToast.show(
                $mdToast.simple()
                  .textContent(response.data.error.message)
              );
            });
        };

      }
    ]);
});
