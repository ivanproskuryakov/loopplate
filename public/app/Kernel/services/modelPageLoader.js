'use strict';

define(['app'], function (app) {
  angular.module('app')
    .factory('ModelPageLoader', [
      '$q',
      '$rootScope',
      function ($q, $rootScope) {
        function ModelPageLoader(query, params) {
          if (!query) {
            throw new Error('Query parameter is required');
          }

          this.data = [];
          this.query = query;
          this.params = params || {};
          this.params.filter = this.params.filter || {};
          this.isBusy = false;
          this.isEmpty = false;
          this.reachedBottom = false;
          this.currentPage = 0;

          this.nextPage = function () {
            if (this.isBusy || this.reachedBottom) {
              return $q.reject();
            }

            this.pageSize = 15;

            if (!$rootScope.user) {
              if (this.currentPage === 0) {
                this.pageSize = 14;
              }
              if (this.currentPage === 1) {
                this.pageSize = 16;
              }
            }

            // set page & page size
            this.isBusy = true;
            this.params.filter.skip = this.currentPage * this.pageSize;
            this.params.filter.limit = this.pageSize;


            // run api call
            return this
              .query(this.params)
              .$promise
              .then(angular.bind(this, function (response) {

                this.data.push.apply(this.data, response);
                this.reachedBottom = response.length === 0;
                this.currentPage++;

                // return data
                return response;
              }));

          }.bind(this);
        }

        return {
          /**
           * model page loader
           * @param {function} query loopback model query
           * @param {object} params filter parameters for query
           * @returns {ModelPageLoader}
           */
          create: function (query, params) {
            return new ModelPageLoader(query, params);
          }
        };
      }
    ]);
});
