'use strict';

define(['app'], function (app) {
  app.service(
    'uploadService', [
      'Upload',
      'LoopBackResource',
      function (Upload, LoopBackResource) {
        return {
          upload: function (file, payload) {

            return Upload.upload({
              url: LoopBackResource.getUrlBase() + '/Media',
              data: _.extend({file: file}, payload)
            });
          },
          dataUrlToBlob: function (data, name) {
            return Upload.dataUrltoBlob(data, name);
          }
        };
      }
    ]);
});
