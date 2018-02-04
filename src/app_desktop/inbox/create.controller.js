'use strict';

angular.module('feasyDesktop')
  .controller('InboxCreateCtrl', function($scope, $http, $stateParams, $state, ngToast) {
    $scope.current.action = "create";
    $scope.item = {
      email: $stateParams.email
    };
    $scope.options = {
      confirmBlank: true
    }
  });
