'use strict';

angular.module('feasyDesktop')
  .controller('RestorePasswordCtrl', function($scope, $http, $state, tokenAuth, $stateParams, $q) {

    $scope.button = {};
    $scope.button.callback = function() {
      if(!$scope.restoreForm.$valid) {
        return $q.when(false);
      }

      return $http
        .put("/api/v1/auth/recover", {
          password: $scope.password,
          confirm: $scope.confirm,
          token: $stateParams.restoreToken
        })
        .then(function(response) {
          return tokenAuth.setToken(response.data.token).then(function(res) {
            $state.go("main.one_column.deal_index");
          });
        });

    };
  });
