'use strict';

define(['app'], function (app) {
  app.service('contactService', [
    '$http',
    'Contact',
    '$mdToast',
    function ($http, Contact, $mdToast) {
      return {
        send: function (form) {
          var data = {
            name: form.name.$modelValue,
            email: form.email.$modelValue,
            phone: form.name.$modelValue,
            message: form.message.$modelValue
          };

          function hangleSuccess(response) {
            $mdToast.show(
              $mdToast.simple()
                .textContent('Thank you! We\'ll get back to you soon!')
            );
          }

          return Contact.create(data).$promise
            .then(hangleSuccess);
        }
      };
    }
  ]);
});
