'use strict';

define(['app'], function (app) {
  app.directive('imageUploader', [
    '$rootScope',
    'uploadService',
    '$mdDialog',
    function ($rootScope, uploadService, $mdDialog) {
      return {
        restrict: 'EA',
        replace: 'true',
        templateUrl: '/app/Media/views/directives/image-uploader.html',
        link: function ($scope, element, attrs) {
          var $fileSelect = $('.select-file');

          $scope.selectFile = function () {
            $fileSelect.click();
          };

          $fileSelect.change(function (ev) {
            var file = ev.currentTarget.files[0];
            var reader = new FileReader();

            reader.onload = function (evt) {
              $mdDialog
                .show({
                  controller: DialogController,
                  templateUrl: 'modal-upload-dialog.html',
                  targetEvent: ev,
                  clickOutsideToClose: true,
                  fullscreen: false,
                  locals: {
                    file: evt.target.result
                  }
                });
            };

            reader.readAsDataURL(file);
          });
        }
      };
    }
  ]);

  function DialogController($scope,
                            $rootScope,
                            $mdDialog,
                            $mdToast,
                            file,
                            uploadService) {

    var filename = 'profile.jpg';
    $scope.file = file;

    $scope.upload = function () {
      var blob = uploadService.dataUrlToBlob($scope.fileCropped, filename);

      blob.mimetype = blob.type;
      blob.originalname = filename;

      uploadService
        .upload(blob, {relation: 'profilePhoto'})
        .then(function (response) {
          $rootScope.$broadcast('profilePhotoChangedEvent', response.data);
          $mdToast.show(
            $mdToast.simple().textContent('Profile picture was changed!')
          );
          $mdDialog.hide();
        })
        .catch(function (response) {
          var message = (response.data.error && response.data.error.message) || 'could not change avatar';

          $mdToast.show(
            $mdToast.simple().textContent(message)
          );
        });
    };

    $scope.close = function () {
      $mdDialog.hide();
    };
  }

});
