'use strict';

define(['app'], function (app) {
  angular.module('app')
    .service('initService', [
      '$http',
      '$rootScope',
      'userService',
      'Activity',
      function ($http,
                $rootScope,
                userService,
                Activity) {

        return {
          launch: function () {


            $rootScope.loadUser = function () {
              userService.getUserInformation()
                .then(function (data) {
                  $rootScope.user = data;
                });
            };

            $rootScope.domain = 'resport.today';
            $rootScope.searchQuery = '';
            $rootScope.currentTags = [];

            Activity
              .getCategories()
              .$promise
              .then(function (response) {
                $rootScope.categories = response;
              });


            // refresh user
            $rootScope.loadUser();

            console.log('----------- Sport Report Loaded! -----------');
          }
        };
      }
    ]);
});
