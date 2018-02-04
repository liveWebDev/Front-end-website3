'use strict';

angular.module('feasyDesktop')
  .controller('UserUpdateCtrl', function($scope, userApi, $state, tokenAuth, $q, $alert) {
    $scope.oldData = tokenAuth.getUserData();
    $scope.about = {
      username: $scope.oldData.username
    };

    $scope.credentials = {
      email: $scope.oldData.email
    };

    $scope.currentTab = "about";

    $scope.changeTab = function(tab) {
      $scope.currentTab = tab;
    };

    $scope.commonButton = {}
    $scope.commonButton.callback = function() {
      if($scope.aboutForm.$valid == false) {
        return $q.when(false);
      }

      return userApi.update($scope.about)
        .then(function(data) {

          return tokenAuth
            .init()
            .then(function(data) {
              alertDirective.show();

              return data;
            });
        })

    };

    $scope.secureButton = {};
    $scope.secureButton.callback = function() {
      $scope.credentialsForm.$setSubmitted();

      if($scope.credentialsForm.$valid == false) {
        return $q.when(false);
      }

      var submitData = {
        current_password: $scope.credentials.current_password
      };

      if($scope.credentials.email != $scope.oldData.email) {
        submitData.email = $scope.credentials.email;
      }

      if($scope.credentials.password) {
        submitData.password = $scope.credentials.password;
        submitData.confirm = $scope.credentials.confirm;
      }

      userApi.update(submitData)
        .then(function(response) {
          alertDirective.show();
          return response;
        })

    };

    var alertDirective = new $alert({
      container: "#alert-container",
      content: "Changes were successfully saved",
      type: "success",
      duration: 3,
      show: false
    });
  });
