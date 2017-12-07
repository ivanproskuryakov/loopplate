'use strict';

define(['app'], function (app) {
  app.config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state("userLogin", {
        url: "/user/login/",
        templateUrl: '/app/User/views/login.html',
        controller: 'UserCtrl',
        data: {
          role: 'guest'
        }
      })
      .state("userSocialLogin", {
        url: "/user/login/social/",
        controller: 'UserSocialCtrl',
        data: {
          role: 'guest'
        }
      })
      .state("userRegister", {
        url: "/user/new/",
        templateUrl: '/app/User/views/new.html',
        controller: 'UserCtrl',
        data: {
          role: 'guest'
        }
      })
      .state("userPasswordForgot", {
        url: "/user/password/forgot/",
        templateUrl: '/app/User/views/password-forgot.html',
        controller: 'UserCtrl',
        data: {
          role: 'guest'
        }
      })
      .state("userPasswordReset", {
        url: "/user/password/reset/",
        templateUrl: '/app/User/views/password-reset.html',
        controller: 'UserCtrl',
        data: {
          role: 'guest'
        }
      })
      // Authenticated users actions
      .state("userInformation", {
        url: "/user/information/",
        templateUrl: '/app/User/views/dashboard.html',
        controller: 'UserDashboardCtrl',
        data: {
          role: 'user'
        }
      });
  }]);
});
