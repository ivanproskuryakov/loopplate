'use strict';

define(['app'], function (app) {
  app.service(
    'userService', [
      '$http',
      'User',
      function ($http, User) {

        return {
          register: function (username, email, password) {
            return User.create({
              username: username,
              email: email,
              password: password
            }).$promise;
          },
          passwordforgot: function (form) {
            var email = form.email.$modelValue;
            return User.resetPassword({email: email}).$promise;
          },
          signout: function () {
            return User.logout().$promise;
          },
          login: function (email, password) {
            return User.login({email: email, password: password}).$promise;
          },
          getUserInformation: function () {
            return User.getCurrent().$promise;
          },
          updateAccount: function (account) {
            // remove id from account before submit
            var copyOf = angular.copy(account);
            delete copyOf.id;
            return User.prototype$patchAttributes({id: account.id}, copyOf).$promise;
          },
          changePassword: function (password, confirmation, token) {
            return User.passwordResetConfirm({
              confirmation: confirmation,
              password: password,
              token: token
            }).$promise;
          },
          deleteAccount: function (id) {
            return User.requestAccountDelete({id: id}).$promise;
          }
        };
      }]);
});
