'use strict';

angular.module('feasyDesktop')
  .controller('ForgetPasswordCtrl', function($scope, $http, $document) {
    $scope.sended = false;

    $document.find("#form input").keydown(function(e) {
      if (e.keyCode == 13) {
        $scope.submit();
      }
    });

    $scope.submit = function() {
      $scope.forgetForm.email.$error.wrong = false;

      if($scope.forgetForm.$valid) {

        $http({
          url: "/api/v1/auth/recover",
          method: "GET",
          params: {
            email: $scope.email
          }
        })
          .then(function(response) {
            $scope.sended = true;
          }, function(response) {
            if(response.status == 400) {
              $scope.forgetForm.email.$error.wrong = true;
            }
          });
      }
    };
  });
