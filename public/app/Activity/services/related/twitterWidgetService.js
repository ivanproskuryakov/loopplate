'use strict';

/**
 * @see https://github.com/arusahni/ngtweet
 */
define(['app'], function (app) {
  app.factory('TwitterWidgetFactory', [
    '$document',
    '$q',
    '$window',
    function ($document, $q, $window) {
      var twitterWidgetURL = 'https://platform.twitter.com/widgets.js';
      var deferred;

      function startScriptLoad() {
        $window.twttr = (function (d, s, id) {
          var js, fjs = d.getElementsByTagName(s)[0],
            t = $window.twttr || {};
          if (d.getElementById(id)) {
            return;
          }
          js = d.createElement(s);
          js.id = id;
          js.src = twitterWidgetURL;
          fjs.parentNode.insertBefore(js, fjs);

          t._e = [];
          t.ready = function (f) {
            t._e.push(f);
          };

          return t;
        }($document[0], 'script', 'twitter-wjs'));
      }

      function loadScript() {
        if (!angular.isUndefined(deferred)) {
          return deferred.promise;
        }
        deferred = $q.defer();
        startScriptLoad();
        $window.twttr.ready(function onLoadTwitterScript(twttr) {
          deferred.resolve(twttr);
        });
        return deferred.promise;
      }

      function createTweet(id, element, options) {
        return loadScript().then(function success(twttr) {
          return $q.when(twttr.widgets.createTweet(id, element, options));
        });
      }

      function wrapElement(element) {
        loadScript().then(function success(twttr) {
          twttr.widgets.load(element);
        }).catch(function errorWrapping(message) {
        });
      }

      return {
        createTweet: createTweet,
        initialize: loadScript,
        load: wrapElement
      };
    }]);
});
