'use strict';

define(['app',
  './config/user',
  './directives/userProfile',
  './directives/userAuth',
  './directives/userFollowing',
  './controllers/user',
  './controllers/modalAuth',
  './controllers/social',
  './controllers/userDashboard',
  './services/user'
], function (app) {

  app.run(['$http', '$rootScope', '$state', 'userService', '$mdToast',
    function ($http, $rootScope, $state, userService, $mdToast) {

      $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
        if (typeof toState.data !== 'undefined') {
          console.log('Role needed: ' + toState.data.role);
          var role = toState.data.role;

          if (role === 'user') {
            if ($rootScope.user === undefined) {
              userService.getUserInformation()
                .then(function (data) {
                  if (data.email) {
                    $rootScope.user = data;
                  } else {
                    $rootScope.user = false;
                    event.preventDefault();
                    $state.transitionTo('userLogin');
                  }
                })
                .catch(function (err) {
                  $rootScope.user = false;
                  event.preventDefault();
                  $state.transitionTo('userLogin');
                });
            } else if ($rootScope.user == false) {
              event.preventDefault();
              $state.transitionTo('userLogin');

              $mdToast.show(
                $mdToast.simple()
                  .textContent('Please login or create a new account')
              );
            }
          } else if (role === 'guest') {
            // do not allow to routes where only guests are allowed
            if ($rootScope.user) {
              // if logged in
              event.preventDefault();
              $state.transitionTo('homepage');
            }
          }
        }
      });
    }
  ])
});
