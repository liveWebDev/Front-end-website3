'use strict';

angular.module('feasyDesktop')
  .controller('DealViewCtrl', function($scope, dealApi, inboxApi, tokenAuth, $stateParams, dateFilter, $state, FileUploader, $timeout, $q, routeHistory, $modal, ngToast) {
    var updateDeal = function() {
      return dealApi.refreshDeal($stateParams.id)
        .then(function(data) {
          angular.forEach(data.comments, function(comment) {
            if(comment.post_type == 0) {
              comment.systemMessage = angular.fromJson(comment.body);
            }

            $scope.comments.unshift(comment);
          });
        });
    };

    var shiftComments = 0;
    $scope.commentsLoaded = false;

    var getCommentList = function() {
      $scope.promise =
        dealApi.getComments($stateParams.id, shiftComments)
        .then(function(data) {
          if(!data.comments) {
            return false;
          }

          angular.forEach(data.comments, function(comment) {
            if(comment.post_type == 0) {
              comment.systemMessage = angular.fromJson(comment.body);
            }

            comment.hasAttaches = false;
            angular.forEach(comment.attaches, function(attach) {
              if(comment.hasAttaches == false) {
                comment.hasAttaches = true;
              }

              attach.url = "/api/v1/gmail/download?email="
                + comment.email + "&attachment_id="
                + attach.attachment_id + "&msg_id="
                + comment.msg_id + "&filename="
                + attach.name;
            });

            $scope.comments.push(comment);
          });

          shiftComments += 7;
          $scope.commentCount += data.comments.length;

          if(data.comments.length < 7) {
            $scope.commentsLoaded = true;
          } else {
            getCommentList();
          }
          return data;
        });

      return $scope.promise;
    };

    var getDeal = function() {
      return dealApi.getDeal($stateParams.id)
        .then(function(data) {
          $scope.isDataLoaded = true;
          if(!$scope.deal) {
            $scope.deal = data.deal;
            $scope.deal.partner = data.partner;
            $scope.deal.owner = data.owner;
            $scope.ownerId = data.deal.user_id;
            updateDealModal.$scope.deal = $scope.deal;
          }

          // Контракты
          $scope.contracts = [];
          $scope.isContractsUploaded = false;
          if(data.contracts) {
            $scope.isContractsUploaded = true;
            $scope.showUploads = true;
            $scope.uploadButtonText = "deal contract<br/> is uploaded";

            angular.forEach(data.contracts, function(contract) {
              $scope.contracts.push(contract);
            });
          } else {
            $scope.showUploads = false;
            $scope.uploadButtonText = "upload the<br/>deal contract";
          }

          //Треды
          $scope.threads = [];
          if(data.link) {
            angular.forEach(data.link, function(thread) {
              $scope.threads.push(thread);
            });
          }

          $scope.threads.push({
            thread_id: null,
            subject: "New conversation"
          });

          $scope.currentThread = $scope.threads[0];

          updateDeal();

          return data;
        });
    };

    $scope.commentButton = {};
    $scope.commentButton.callback = function() {

      if($scope.commentForm.internal.$valid) {
        return dealApi.addComment($scope.deal.id, $scope.newComment.body)
          .then(function (data) {
            $scope.comments = [];
            shiftComments = 0;

            return getCommentList()
              .then(function(data) {
                $scope.newComment.body = "";
                $scope.commentForm.internal.$setPristine();
              });
          });
      }
    };

    $scope.changeStatus = function(toStatusId) {
      var statusData = {
        status : toStatusId,
        timer : null
      };

      if(toStatusId == 2 && !$scope.newStatus.postponeDate) {
        return false;
      }

      statusData.timer = dateFilter($scope.newStatus.postponeDate, "dd.MM.yyyy");

      dealApi.changeStatus($scope.deal.id, statusData)
        .then(function(data) {
          $state.go("main.one_column.deal_index");
        });

      ngToast.create({
        content: "Deal was changed"
      })
    };

    $scope.newStatus = {
      postponeDate : null
    };

    $scope.user = tokenAuth.getUserData();
    $scope.isDataLoaded = false;
    $scope.mainPromise = getDeal();
    $scope.commentFormType = "internal";
    $scope.commentForm = {};
    $scope.newComment = {};
    $scope.comments = [];
    $scope.changeCommentForm = function(type) {
      $scope.commentFormType = type;
    };

    getCommentList();

    $scope.emailFormOptions = {
      withHeader: false,
      withThread: true,
      confirmBlank: true,
      buttonText: "Send message",
      formId: "deal" + $stateParams.id
    };
    $scope.emailItem = {
      email: ""
    };

    $scope.emailCallback = function(response, data) {
      if(data.operation == "send" || data.operation == "reply") {
        return updateDeal();
      }

      return $q.when(false);
    };

    // Загрузка файлов
    $scope.uploadContract = function($event) {
      if(Object.keys($scope.uploadItems).length || $scope.contracts.length) {
        $event.preventDefault();
      }
    };
    $scope.uploadItems = {};
    $scope.uploader = new FileUploader({
      url: "/api/v1/deals/" + $stateParams.id + "/files",
      autoUpload: true,
      alias: "data",
      headers: {
        "Token": tokenAuth.getToken(),
      }
    });
    var oversizeModal = $modal({
      "title": "Sorry man!",
      "content": "The file cannot exceed 25 MB. Please compress your file and try to upload again.",
      "show": false,
      "animation": "am-fade-and-scale"
    });
    $scope.uploader.filters.push({ name: 'sizeFilter', fn: function(item) {
      if (item.size > 25000000) {
        oversizeModal.$promise.then(oversizeModal.show);
        return false;
      }
      return true;
    }});

    $scope.uploader.onAfterAddingFile = function(fileItem) {
      $scope.showUploads = true;

      var newKey = Object.keys($scope.uploadItems).length + 1;
      fileItem.itemKey = newKey;

      $scope.uploadItems[newKey] = {
        name: fileItem.file.name,
        percent: 0,
        status: 0,
        url: "#"
      };

      console.info('onAfterAddingFile', fileItem);
    };

    $scope.uploader.onProgressItem = function(fileItem, percent) {
      $scope.uploadItems[fileItem.itemKey].percent = percent;
    };

    $scope.uploader.onErrorItem = function(fileItem, response, status) {
      $scope.uploadItems[fileItem.itemKey].percent = 100;
      $scope.uploadItems[fileItem.itemKey].status = 1;

      $timeout(function() {
        delete $scope.uploadItems[fileItem.itemKey];
        fileItem.remove();
      }, 5000);
    };

    $scope.uploader.onSuccessItem = function(fileItem, response, status) {
      var data = angular.fromJson(response);
      $scope.uploadItems[fileItem.itemKey].percent = 100;
      $scope.uploadItems[fileItem.itemKey].status = 2;

      $scope.uploadItems[fileItem.itemKey].url = data.url;

      if($scope.isContractsUploaded == false) {
        $scope.isContractsUploaded = true;
        $scope.uploadButtonText = "deal contract<br/> is uploaded";
      }
    };

    // Просмотр профиля пользователя
    $scope.showProfile = function(id) {
      routeHistory.go("main.one_column.user_profile", {id: id});
    };

    // Редактирование дила
    var updateDealModal = $modal({
      "title": "Invite user",
      "template": "app_desktop/deal/update.form.html",
      "show": false,
      "animation": "am-fade-and-scale"
    });

    updateDealModal.$scope.slimConfig = {
      btnTitle: "Save changes"
    };

    updateDealModal.$scope.updateDealCallback = function(response, item) {
      console.log(response);

      $scope.deal.title = item.title;
      $scope.deal.partner = {
        id: item.partner_id,
        name: item.partner_name
      };

      response.systemMessage = angular.fromJson(response.body);
      $scope.comments.unshift(response);

      updateDealModal.hide();

      ngToast.create({
        content: "Deal was changed"
      });

      return $q.when(true);
    };

    updateDealModal.$scope.currentCompany = $scope.user.currentCompany;

    $scope.openEditModal = function() {
      updateDealModal.$promise.then(updateDealModal.show);
    };

    //Reassign
    $scope.reassignButton = {};
    $scope.reassignButton.callback = function(user) {
      return dealApi.reassignDeal($scope.deal.id, user.user_id)
        .then(function(data) {
          $state.reload();
          ngToast.create({
            content: "Deal was reassigned"
          });
        });
    };

    // Минимальная дата для календаря постпоуна
    $scope.tomorrow = new Date((new Date()).getTime() + 24 * 60 * 60);

  })
  .directive("reassignDeal", function($popover, tokenAuth) {
    return {
      restrict: 'E',
      'scope': {
        callback: '=',
        ownerId: '=',
        promise: '='
      },
      templateUrl: function (elem, attrs) {
          return 'app_desktop/deal/reassign.directive.html';
      },
      link: function (scope, elem, attrs) {
        scope.isAvailable = false;

        scope.promise.then(function(data) {
          scope.ownerId = data.deal.user_id;

          tokenAuth.getCommonPromise().$companyUsers.then(function(users) {
            var companyUsers = [];

            angular.forEach(users, function(user) {
              if(user.user_id != scope.ownerId) {
                companyUsers.push(user);
              }
            });

            if(companyUsers.length == 0) {
              return;
            }

            scope.isAvailable = true;

            var popover = $popover(elem.find("#reassign-link"), {
              title: 'My Title',
              trigger: 'manual',
              template: "app_desktop/deal/popover.reassign.html",
              placement: "bottom-left",
              autoClose: true
            });

            popover.$scope.selectUser = function(user) {
              scope.callback(user);
            };

            popover.$scope.companyUsers = companyUsers;


            scope.openPopover = function() {
              popover.$promise.then(function() {
                popover.show();
              }).then(function(response) {
                popover.$element.find("#assing-user-list").mCustomScrollbar({
                  live: "on",
                  scrollInertia: 500,
                  mouseWheelPixels: 10,
                  autoHideScrollbar: true
                });
              });
            }
          });
        })
      }
    }
  });
