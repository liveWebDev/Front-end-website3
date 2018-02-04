'use strict';

angular.module('feasyDesktop')
  .controller('AppController', function($scope, $window, updateChecker) {
    $scope.updateState = updateChecker;

    $scope.closeHelper = function() {
      $scope.updateState.hasUpdates = false;
    };

    $scope.refreshApp = function() {
      $window.location.reload();
    };

    $scope.t = {
      refresh : function() {
        $window.location.reload();
      }
    }

  })
  .factory("updateChecker", function() {
    var state = {
      hasUpdates: false
    };

    return state;
  });
