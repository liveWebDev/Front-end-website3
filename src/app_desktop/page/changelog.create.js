'use strict';

angular.module('feasyDesktop')
  .controller('PageChangelogCreateCtrl', function($scope, $http, $q, ngToast) {
    $scope.item = {};

    $scope.button = {};
    $scope.button.callback = function() {
      if(!$scope.changelogForm.$valid) {
        return $q.when(false);
      }

      return $http.post("/api/v1/about/add", $scope.item)
        .then(function(data) {
          $scope.item = {};
          $scope.changelogForm.$setPristine();
          $scope.changelogForm.$setUntouched();

          ngToast.create({
            content: "Log entry was added"
          })
        });
    }
  });
