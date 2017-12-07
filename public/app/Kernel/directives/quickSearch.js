'use strict';

define(['app'], function (app) {
  app.directive('quickSearch', function () {
    return {
      restrict: 'EA',
      replace: 'true',
      scope: {
        resultsLimit: '=?'
      },
      templateUrl: '/app/Kernel/views/directives/quick-search.html',
      controller: QuickSearchController,
      link: function ($scope, element, attrs) {
      }
    };
  });

  QuickSearchController.$inject = ['$scope', '$rootScope', '$state', 'Activity'];
  function QuickSearchController($scope, $rootScope, $state, Activity) {

    $(document).ready(function () {
      var searchBox = $('#quick-search');
      var searchBoxButton = $('#quick-search .trigger-search');
      var searchInput = $('#quick-search .quicksearch-input');

      searchBoxButton.click(function () {
        searchBox.toggleClass('mod-visible');
        searchInput.focus();
      });
    });

    $scope.triggerSearchEvent = function (keyCode) {
      if ((keyCode === 13) && ($rootScope.searchQuery.length >= 3)) {
        $state.transitionTo('searchQuery', {q: $rootScope.searchQuery});
      }
    };

  }
});
