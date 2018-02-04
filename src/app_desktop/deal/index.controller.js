'use strict';

angular.module('feasyDesktop')
  .controller('DealListCtrl', function($scope, dealApi, firmApi, $window, tokenAuth, $state, $q, $modal, ngToast, routeHistory, dealselectedTabState) {
    if(!tokenAuth.getCurrentCompanyId()) {
      $state.go("main.one_column.company_create");
    }

    var userData = tokenAuth.getUserData();
    $scope.user = userData;

    var tabs = {
      active : 1,
      postponed : 2,
      closed : 3
    };

    var getDeals = function(status) {

      $scope.isDataLoaded = false;
      $scope.isNoDeals = false;

      dealApi.getList(tokenAuth.getCurrentCompanyId(), $scope.selectedUser.user_id, status)
        .then(function(data) {
          $scope.isDataLoaded = true;
          $scope.deals = data;

          if(data.length == 0) {
            $scope.isNoDeals = true;
          } else {
            var dayMs = 1000 * 60 * 60 * 24;
            angular.forEach($scope.deals, function(deal, index) {
              if(deal.timer) {
                var timerDuration = Math.floor((new Date(deal.timer) - new Date(deal.start_timer)) / dayMs);
                $scope.deals[index].dayToActive = Math.floor((new Date(deal.timer) - new Date()) / dayMs);
                $scope.deals[index].timerProgress = Math.round(100 - ($scope.deals[index].dayToActive / timerDuration * 100));
              }
            })
          }
        });
    };

    $scope.addDealCallback = function() {
      return $scope.changeTab("active");
    };
    $scope.slimConfig = {
      placeholder : 'Create a new deal, just start type here',
      btnTitle : 'Create a new deal'
    };

    tokenAuth.companyPromise().then(function(response) {
      $scope.currentCompany = userData.currentCompany;
    });

    $scope.selectedTabState = dealselectedTabState;
    $scope.changeTab = function(tabName) {
      if(tabs[tabName]) {
        $scope.selectedTabState.current = tabName;
        return getDeals(tabs[$scope.selectedTabState.current]);
      }
    };

    $scope.viewDeal = function(id) {
      $state.go("main.two_column.deal_view", {id: id});
    };

    $scope.showProfile = function(user) {
      routeHistory.go("main.one_column.user_profile", {id: user.user_id});
    };

    $scope.clickPopover = function() {
      $scope.userPopoverClick = true;
    };

    $scope.filterByUser = function(user) {
      if($scope.userPopoverClick == true) {
        $scope.userPopoverClick = false;
        return;
      }

      $window.localStorage.filterUser = user.user_id;
      $scope.selectedUser = user;
      $scope.userId = $scope.selectedUser.user_id;

      getDeals(tabs[$scope.selectedTabState.current]);
    };

    // User invite modal
    var userInviteModal = $modal({
      "title": "Invite user",
      "template": "app_desktop/company/modal.inviteUser.html",
      "show": false,
      "animation": "am-fade-and-scale"
    });
    userInviteModal.$scope.inviteEmail = "";
    userInviteModal.$scope.inviteUser = function() {
      if(userInviteModal.$scope.inviteForm.$valid == true) {
        return firmApi.invite(tokenAuth.getCurrentCompanyId(), userInviteModal.$scope.inviteEmail)
          .then(function (data) {
            userInviteModal.hide();
            ngToast.create({
              content: 'Member ' + userInviteModal.$scope.inviteEmail + ' was invited'
            });

            userInviteModal.$scope.inviteEmail = "";
            userInviteModal.$scope.inviteForm.$setPristine();
            userInviteModal.$scope.inviteForm.$setUntouched();
          });
      }
    };

    $scope.showInviteUserModal = function() {
      userInviteModal.$promise.then(userInviteModal.show);
    };

    $scope.allUser = {
      user_id: null,
      stats: {
        active: 0,
        postponed: 0,
        closed: 0,
        hot: 0
      }
    };
    tokenAuth
      .getCompanyUsers()
      .then(function(data) {
        $scope.filterUsers = tokenAuth.getUserData().companyUsers;

        // Считаем общую статистику по компании
        angular.forEach($scope.filterUsers, function(user) {
          angular.forEach(user.stats, function(value, key) {
            $scope.allUser.stats[key] += value;
          });
        });

        if(angular.isUndefined($window.localStorage.filterUser)) {
          $window.localStorage.filterUser = userData.id;
        }

        $scope.selectedUser = null;
        if($window.localStorage.filterUser != "null") {
          angular.forEach($scope.filterUsers, function(user) {
            if(user.user_id == $window.localStorage.filterUser) {
              $scope.selectedUser = user;
            }
          });

          if(!$scope.selectedUser) {
            $window.localStorage.filterUser = userData.id;
            angular.forEach($scope.filterUsers, function(user) {
              if(user.user_id == $window.localStorage.filterUser) {
                $scope.selectedUser = user;
              }
            });
          }
        } else {
          $scope.selectedUser = $scope.allUser;
        }


        $scope.userId = $scope.selectedUser.user_id;

        getDeals(tabs[$scope.selectedTabState.current]);
      });

  });
