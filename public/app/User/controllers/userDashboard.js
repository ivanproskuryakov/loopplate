'use strict';

define(['app'], function (app) {
  app.controller(
    'UserDashboardCtrl', [
      '$scope',
      '$rootScope',
      '$state',
      '$mdToast',
      'userService',
      'Common',
      function ($scope,
                $rootScope,
                $state,
                $mdToast,
                userService,
                Common) {

        var loadAccount = function () {
          userService.getUserInformation()
            .then(function (response) {
              // convert string to date for datePicker
              if (response.dateOfBirth)
                response.dateOfBirth = new Date(response.dateOfBirth);

              $scope.account = response;
            });
        };

        var loadCountries = function () {
          Common.countries().$promise
            .then(function (response) {
              $scope.countryOptions = response;
            });
        };

        // load
        loadAccount();
        loadCountries();

        /**
         * changePassword
         */
        $scope.changePassword = function (form) {
          if (form.$valid) {

            var password = form.password.$modelValue;

            userService.updateAccount({
              id: $scope.account.id,
              password: password
            })
              .then(function (response) {
                $scope.formData = {};
              });
          }
        };

        /**
         * updateAccount
         */
        $scope.updateAccount = function (form) {
          if (form.$valid) {
            $rootScope.displayException = false;

            userService.updateAccount($scope.account)
              .catch(function (response) {
                var message = 'error';

                if (response.status === 422) {
                  // validation failed
                  if (response.data.error.details.messages.username) {
                    message = 'Username already exists';
                  }
                }

                $mdToast.show(
                  $mdToast.simple()
                    .textContent(message)
                );
              })
              .finally(function () {
                $mdToast.show(
                  $mdToast.simple()
                    .textContent('Account data updated.')
                );

                loadAccount();
              });
          }
        };

        $scope.requestAccountDelete = function () {
          userService.deleteAccount($scope.account.id)
            .then(function () {
              $mdToast.show(
                $mdToast.simple()
                  .textContent('Email was sent with further instructions')
              );
            });
        };


        // UI stuff
        $scope.formData = {};

        $scope.genderOptions = [
          {value: true, label: 'Male'},
          {value: false, label: 'Female'}
        ];

        $scope.datePickerOptions = {
          opened: false,
          format: 'dd-MMMM-yyyy'
        };

        $scope.openDatePicker = function () {
          $scope.datePickerOptions.opened = true;
        };
      }]);
});
