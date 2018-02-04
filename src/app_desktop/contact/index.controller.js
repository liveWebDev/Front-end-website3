'use strict';

angular.module('feasyDesktop')
  .controller('ContactIndexCtrl', function($scope, contactApi, partnerApi, $stateParams, tokenAuth, $state, contactFields, $modal, ngToast) {
    $scope.company = tokenAuth.getUserData().currentCompany;
    $scope.contactFields = contactFields;
    $scope.contactList = {};
    $scope.partners = {};
    $scope.isDataLoaded = false;
    $scope.current = {
      id: null,
      item: null
    };

    $scope.viewContact = function(contact) {
      $scope.current.id = contact.id;
      $scope.current.item = contact;
      $state.go("main.inbox.contact.view", {id: contact.id});
    };

    var getContacts = function() {
      var promise = contactApi.getList($stateParams.companyId)
        .then(function (data) {
          $scope.contactList = data.contactList;
          $scope.partners = data.partners;

          $scope.isDataLoaded = true;

          // Если была открыта страница с выбранным контактом, то выбираем списка выбранный
          if($scope.current.id) {
            angular.forEach($scope.contactList, function(contacts) {
              angular.forEach(contacts, function(contact) {
                if(contact.id == $scope.current.id) {
                  $scope.current.item = contact;
                }
              });
            });
          }

        });

      return promise;
    };

    $scope.nullContact = null;
    $scope.createCallback = function() {
      getContacts();
    };

    getContacts();
  });
