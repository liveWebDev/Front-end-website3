'use strict';

angular.module('feasyDesktop')
  .controller('InboxSettingsCtrl', function($scope, inboxApi, $stateParams, $state, ngToast) {
    $scope.email = $stateParams.email;
    $scope.sign = "";

    var getEmailInfo = function() {
      return inboxApi.info($scope.email)
        .then(function(data) {
          $scope.stats = data;
          $scope.sign = data.sign;
        });
    };

    $scope.saveSign = function() {
      inboxApi.saveSign($scope.email, $scope.sign)
        .then(function(data) {
          ngToast.create({
            content: "Sign was saved"
          });
        });
    };

    $scope.unlinkInbox = function() {
      inboxApi.deleteEmail(email)
        .then(function(data) {
          ngToast.create({
            content: $scope.email + " was unlinked"
          });

          $state.go("main.one_column.deal_index");
        });
    };

    $scope.promise = getEmailInfo();
  });
