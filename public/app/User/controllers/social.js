'use strict';

define(['app'], function (app) {
  app.controller('UserSocialCtrl', [
    '$scope',
    '$rootScope',
    '$state',
    '$location',
    'LoopBackAuth',
    'userService',
    function ($scope,
              $rootScope,
              $state,
              $location,
              LoopBackAuth,
              userService) {

      var authToken = $location.search().access_token;
      var user = $location.search().user;

      // save user
      LoopBackAuth.setUser(authToken, user, {});
      LoopBackAuth.rememberMe = true;
      LoopBackAuth.save();

      // load user
      userService.getUserInformation()
        .then(function (response) {
          $rootScope.user = response;

          $state.transitionTo('stream');
        });
    }]);
});
