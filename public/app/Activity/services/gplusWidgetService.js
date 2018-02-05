'use strict';

define(['../../app'], function (app) {
  app.factory('GplusWidgetFactory', [
    '$document',
    '$q',
    '$window',
    function ($document, $q, $window) {
      var gplusWidgetURL = 'https://apis.google.com/js/platform.js';
      var deferred;

      function startScriptLoad() {
        $window.___gcfg = {
          parsetags: 'explicit'
        };

        var root = $document[0];
        var scriptId = 'gapi-js';
        var js = root.getElementById(scriptId);
        var fjs = root.getElementsByTagName('script')[0];

        if (js) {
          return js;
        }
        js = root.createElement('script');
        js.async = true;
        js.id = scriptId;
        js.src = gplusWidgetURL;
        fjs.parentNode.insertBefore(js, fjs);

        return js;
      }

      function loadScript() {
        if (!angular.isUndefined(deferred)) {
          return deferred.promise;
        }
        deferred = $q.defer();
        var script = startScriptLoad();
        script.onload = function (e) {
          console.log('gapi ready');
          deferred.resolve($window.gapi);
        };
        return deferred.promise;
      }

      function createPost(url, element) {
        return loadScript()
          .then(function success(gapi) {
            return $q.when(gapi.post.render(element, {'href': url}));
          });
      }

      return {
        createPost: createPost,
        initialize: loadScript
      };
    }]);
});
