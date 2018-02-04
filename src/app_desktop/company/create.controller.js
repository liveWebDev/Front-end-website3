'use strict';

angular.module('feasyDesktop')
  .controller('CompanyCreateCtrl', function($scope, firmApi, $state, tokenAuth) {

    $scope.submit = function() {
      if($scope.companyForm.$valid) {
        firmApi.create($scope.company).then(function(data) {
          tokenAuth.updateCompanyList()
            .then(function(data) {
              $state.go("main.one_column.deal_index");
            });
        });
      }
    }
  });
