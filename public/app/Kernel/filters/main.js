'use strict';

define(['app'], function (app) {
  app.filter('text', function () {
    return function (text, name) {
      return text;
    };
  });

  app.filter('mention', function () {
    return function (text, name) {
      return text ? '@' + text : '';
    };
  });

  /**
   * @see https://gist.github.com/timgit/7bc5896f5297301afb02
   */
  app.filter('megaNumber', function () {
    return function (number, fractionSize) {

      if ((number === null) || (number === 0) || (number === undefined)) {
        return 0;
      }

      if (!fractionSize || fractionSize < 0) {
        fractionSize = 1;
      }

      var abs = Math.abs(number);
      var rounder = Math.pow(10, fractionSize);
      var isNegative = number < 0;
      var key = '';
      var powers = [
        {key: 'Q', value: Math.pow(10, 15)},
        {key: 'T', value: Math.pow(10, 12)},
        {key: 'B', value: Math.pow(10, 9)},
        {key: 'M', value: Math.pow(10, 6)},
        {key: 'K', value: 1000}
      ];

      for (var i = 0; i < powers.length; i++) {

        var reduced = abs / powers[i].value;
        reduced = Math.round(reduced * rounder) / rounder;

        if (reduced >= 1) {
          abs = reduced;
          key = powers[i].key;
          break;
        }
      }

      return (isNegative ? '-' : '') + abs + key;
    };
  });
});
