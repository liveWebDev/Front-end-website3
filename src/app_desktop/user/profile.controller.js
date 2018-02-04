'use strict';

angular.module('feasyDesktop')
  .controller('UserProfileCtrl', function($scope, $rootScope, userApi, $state, $stateParams, $q, contactFields, tokenAuth, $modal, FileUploader, ngToast, routeHistory) {
    $scope.contactFields = contactFields;

    var getUser = function() {
      if($stateParams.id == tokenAuth.getUserData().id) {
        $scope.isMe = true;
        $scope.pageTitle = "Me";
      }

      return userApi.get(tokenAuth.getCurrentCompanyId(), $stateParams.id)
        .then(function(data) {
          $scope.user = data;
          $scope.pageTitle = $scope.user.name;

          angular.forEach($scope.user.last, function(item) {
            if(item.post_type == 0) {
              item.systemMessage = angular.fromJson(item.body);
            }
          });

          return $q.when($scope.user);
        });
    };

    $scope.promise = getUser();

    $scope.isUploadingInProcess = false;
    $scope.uploader = new FileUploader({
      url: "/api/v1/users/avatar",
      autoUpload: true,
      alias: "data",
      method: "PUT",
      headers: {
        "Token": tokenAuth.getToken()
      }
    });

    $scope.uploader.onAfterAddingFile = function(fileItem) {
      $scope.isUploadingInProcess = true;
    };

    $scope.uploader.onErrorItem = function(fileItem, response, status) {
      $scope.isUploadingInProcess = false;
    };

    $scope.uploader.onSuccessItem = function(fileItem, response, status) {
      $scope.isUploadingInProcess = false;
      ngToast.create({
        content: "Your picture was changed"
      });

      var user = tokenAuth.getUserData();
      var pictureFields = ["avatar", "ava_30", "avatarName", "ava_160"];

      angular.forEach(pictureFields, function(field) {
        user[field] = response[field];
      });

      $scope.user.ava_160 = response.ava_160;
    };


    $scope.back = function() {
      if(routeHistory.canBack() == true) {
        routeHistory.back();
      } else {
        $state.go("main.one_column.deal_index");
      }
    };

  });
