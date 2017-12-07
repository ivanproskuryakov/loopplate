'use strict';

define(['app'], function (app) {
  app.controller('UserCtrl', [
    '$scope',
    '$rootScope',
    '$state',
    '$location',
    'userService',
    '$mdToast',
    'LoopBackResource',
    function (
      $scope,
      $rootScope,
      $state,
      $location,
      userService,
      $mdToast,
      LoopBackResource
    ) {

      // Set the default value of inputType
      $scope.inputType = 'password';

      // Hide & show password function
      $scope.hideShowPassword = function () {
        if ($scope.inputType == 'password') {
          $scope.inputType = 'text';
        } else {
          $scope.inputType = 'password';
        }
      };

      // User Registration
      $scope.submitRegistration = function (form) {
        if (form.$valid) {
          var username = form.username.$modelValue;
          var email = form.email.$modelValue;
          var password = form.password.$modelValue;

          $rootScope.displayException = false;

          userService
            .register(username, email, password)
            .then(function (response) {
              $scope.login(email, password);

              $mdToast.show(
                $mdToast.simple()
                  .textContent('Thank you for registering')
              );
            })
            .catch(function (response) {
              var message = 'error';

              if (response.status === 422) {
                // validation failed
                message = 'User with this ';
                var variables = [];

                if (response.data.error.details.messages.email) {
                  variables.push('E-Mail');
                }
                if (response.data.error.details.messages.username) {
                  variables.push('Username');
                }

                message += variables.join(' & ') + ' already exists!';
              }

              $mdToast.show(
                $mdToast.simple()
                  .textContent(message)
              );
            });
        }
      };

      // User Password Forgot
      $scope.submitPasswordForgot = function (form) {
        if (form.$valid) {
          $rootScope.displayException = false;

          userService
            .passwordforgot(form)
            .then(function (response) {
              $state.transitionTo('userLogin');
              $mdToast.show(
                $mdToast.simple()
                  .textContent('E-mail has been sent to your inbox with further instructions')
              );
            })
            .catch(function (response) {
              $mdToast.show(
                $mdToast.simple()
                  .textContent('User with this email not exists')
              );
            });
        }
      };

      // User Password reset
      $scope.submitPasswordReset = function (form) {
        if (form.$valid) {
          $rootScope.displayException = false;

          userService
            .changePassword(
              form.confirmation.$modelValue,
              form.password.$modelValue,
              $location.search().token
            )
            .then(function (response) {
              $state.transitionTo('userLogin');
              $mdToast.show(
                $mdToast.simple()
                  .textContent('Your password has been changed!')
              );
            })
            .catch(function (response) {
              $mdToast.show(
                $mdToast.simple()
                  .textContent(response.data.error.message)
              );
            });
        }
      };

      // User Sign In/Out
      $rootScope.signOut = function () {
        userService.signout()
          .then(function () {
            $rootScope.user = undefined;
            $state.transitionTo('homepage');
          });
      };

      $scope.login = function (email, password) {
        $rootScope.displayException = false;

        userService.login(email, password)
          .then(function (response) {
            $rootScope.user = response.user;
            $state.transitionTo('homepage');
          })
          .catch(function (err) {
            $mdToast.show(
              $mdToast.simple()
                .textContent('E-mail or Password is not correct')
            );
          });
      };

      $scope.oauthRedirect = function (provider) {
        window.location = LoopBackResource.getUrlBase().replace('/api', '') + '/auth/' + provider;
      };
    }
  ]);
});
