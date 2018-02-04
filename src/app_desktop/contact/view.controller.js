'use strict';

angular.module('feasyDesktop')
  .controller('ContactViewCtrl', function($scope, contactApi, $stateParams, contactFields, $state, _) {
    $scope.isDataLoaded = false;
    $scope.contactFields = contactFields;
    $scope.current.id = $stateParams.id;
    $scope.viewDeal = function(id) {
      $state.go("main.two_column.deal_view", {id: id});
    };

    $scope.updateCallback = function() {
      $scope.current.item.name = $scope.contact.name;
    };

    contactApi.getContact($stateParams.id)
      .then(function(data) {
        $scope.contact = data.contact;
        $scope.deals = data.deals;
        $scope.isDataLoaded = true;
      });
  });
