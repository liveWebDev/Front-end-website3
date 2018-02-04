'use strict';

angular.module('feasyDesktop')
  .controller('LoginCtrl', function($scope, authApi, $window, $state, tokenAuth, $q, $document) {
    $scope.common.title = "Welcome back!";
    $scope.authFailed = false;

    $document.find("#form input").keydown(function(e) {
      var form_container = $(this).parents('.form');
      if (e.keyCode == 13) {
        form_container.find('button').trigger('click');
      }
    });

    $scope.button = {};
    $scope.button.callback = function() {

      if($scope.loginForm.$valid == false) {
        return $q.when(false);
      }

      return authApi.login($scope.login)
        .then(function(data) {
          return tokenAuth.setToken(data.token).then(function(response) {
            $state.go("main.one_column.deal_index");
          });
        }, function(response) {
          $scope.authFailed = true;
        });
    }
  });
