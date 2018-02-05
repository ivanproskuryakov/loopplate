'use strict';

define(['app'], function (app) {

  app.factory('errorInterceptor', [
    '$rootScope',
    '$q',
    '$injector',
    'logger',
    function ($rootScope,
              $q,
              $injector,
              logger) {

      return {
        request: function (config) {
          return config;
        },
        responseError: function (response) {

          if ($rootScope.displayException === false ) {
            $rootScope.displayException = true;

            return $q.reject(response);
          }

          if (
            response &&
            response.config &&
            response.config.url &&
            response.config.url.indexOf('__anonymous__') !== -1
          ) {
            // ignore this error
            // loopback angular sdk checks if current user authenticated
            return $q.reject(response);
          }

          var state = $injector.get('$state');
          var $mdToast = $injector.get('$mdToast');
          var $mdDialog = $injector.get('$mdDialog');
          var message = response.statusText;

          // authentication error
          if (response.status === 401 ||
            (response.status === 422 &&
            _.property('data.error.details.messages.userId')(response))) {

            $mdDialog
              .show({
                controller: 'ModalAuthCtrl',
                templateUrl: '/app/User/views/modal-auth-dialog.html',
                clickOutsideToClose: true,
                fullscreen: false,
              });

            message = 'Please login or create a new account';
          } else if (response.status === 422) {
            // ignore validation error
            message = null;
          } else {
            state.transitionTo(
              'exception', {
                errorCode: response.status
              });
          }

          if (message) {
            $mdToast.show(
              $mdToast.simple()
                .textContent(message)
            );
          }

          // log error
          var meta = response.data || {};
          meta.code = response.status;
          logger.log(response.statusText, null, meta);

          return $q.reject(response);
        }
      };

    }
  ]);
});
