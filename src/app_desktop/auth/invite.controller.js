'use strict';

angular.module('feasyDesktop')
  .controller('InviteCtrl', function($scope, $http, $state, tokenAuth, $stateParams, $q) {

    $http({
      url: '/api/v1/firms/inviter',
      method: 'GET',
      params: {
        invite_token: $stateParams.inviteToken
      }
    })
      .then(function(response) {
        $scope.invite = response.data;
      }, function(response) {
        $state.go("noAuth.login");
      });

    $scope.submit = function() {
      $scope.inviteForm.$setSubmitted();

      if($scope.inviteForm.$valid == false) {
        return $q.when(false);
      }

      var postData = angular.extend($scope.register, {invite_token : $stateParams.inviteToken});

      $http
        .post("/api/v1/auth/register", postData)
        .then(function(response) {
          tokenAuth
            .setToken(response.data.token)
            .then(function() {
              $state.go("main.one_column.deal_index");
            });
        });
    };
  });
