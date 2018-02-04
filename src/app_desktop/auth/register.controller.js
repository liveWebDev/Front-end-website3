'use strict';

angular.module('feasyDesktop')
  .controller('RegisterCtrl', function($scope, $http, $state, tokenAuth, $q, $document) {
    $scope.authFailed = false;
    $scope.common.title = "Get started, step 1";
    $scope.register = {};
    $scope.company = {};

    $scope.step = 1;
    $scope.submitFirstStep = function(form) {
      if(form.$valid == false) {
        return;
      }

      $scope.step = 2;
      $scope.common.title = "Get started, step 2";
    };

    $document.find("#form-step1 input").keydown(function(e) {
      if (e.keyCode == 13) {
        $scope.submitFirstStep();
      }
    });

    $document.find("#form-step2 input").keydown(function(e) {
      if (e.keyCode == 13) {
        $scope.submitSecondStep();
      }
    });

    $scope.finalButton = {};
    $scope.finalButton.callback = function() {
      if($scope.secondStepForm.$valid == false) {
        return $q.when(false);
      }

      return $http
        .post("/api/v1/auth/register", $scope.register)
        .then(function(response) {
          return tokenAuth.setToken(response.data.token);
        })
        .then(function(response) {
          if(!$scope.company.title) {
            return response;
          }

          return $http.post("/api/v1/firms/new", {
              title: $scope.company.title,
              description: ""
            })
            .then(function(response) {
              return tokenAuth.updateCompanyList();
            }).then(function(response) {
              $state.go("main.one_column.deal_index");
            });
        });
    };
  });
