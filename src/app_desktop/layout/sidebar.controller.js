'use strict';

angular.module('feasyDesktop')
  .controller('SidebarCtrl', function($scope, tokenAuth, $state, filterFilter, $http, $modal, ngToast, $location, $window, overlayState, contactFields, navState, dealselectedTabState) {
    var getInviteList = function() {
      return $http({
        url: "/api/v1/firms/invite_list",
        method: "GET"
      }).then(function(response) {
        $scope.invites = response.data;
        inviteListModal.$scope.invites = $scope.invites;

        $scope.invites.counter_title = "+1 invite";
        if($scope.invites.length > 1) {
          $scope.invites.counter_title = "+" + $scope.invites.length + " invites";
        }

        return response.data;
      });
    };

    $scope.user = tokenAuth.getUserData();
    $scope.currentCompanyId = tokenAuth.getCurrentCompanyId();
    console.log(navState);
    $scope.navState = navState;

    $scope.switchCompany = function(companyId) {
      overlayState.set(false);
      $scope.currentCompanyId = companyId;
      tokenAuth.setCurrentCompanyId(companyId);
      delete $window.localStorage.filterUser;

      $scope.navState.isEmailSection = false;
      $scope.navState.isPageSection = false;
      $scope.navState.isSearch = false;

      dealselectedTabState.current = "active";

      tokenAuth.companyPromise().then(function(response) {
        $state.go("main.one_column.deal_index", {}, {reload : true});

        return response;
      });
    };


    $scope.switchInbox = function(inbox) {
      overlayState.set(false);
      navState.isEmailSection = true;
      navState.isPageSection = false;
      navState.isSearch = false;

      $state.go("main.inbox.list.create", {email: inbox, bucket: 'inbox'});
    };

    $scope.switchPage = function(page) {
      $scope.navState.isPageSection = true;

      $state.go(page);
    };

    var activeRoles = [1, 2, 3];
    $scope.filterActiveCompanies = function(company) {
      return (activeRoles.indexOf(company.role) !== -1);
    };

    tokenAuth.addCompanyListener(function(companies) {
      $scope.user.companies = companies;
    });

    tokenAuth.getCommonPromise().$userEmails.then(function(emails) {
      $scope.emails = emails;
    });


    getInviteList();

    // Invite modal
    var inviteListModal = $modal({
      "title": "Invite user",
      "template": "app_desktop/layout/modal.inviteList.html",
      "show": false,
      "animation": "am-fade-and-scale"
    });
    inviteListModal.$scope.declineInvite = function(invite) {
      $http({
        url: "/api/v1/firms/reject",
        method: "DELETE",
        params: {
          firm_id: invite.firm_id
        }
      })
        .then(function(response) {
          getInviteList()
            .then(function(data) {
              if(data.length == 0) {
                inviteListModal.hide();
              }

              ngToast.create({
                content: 'You declined invitation from ' + invite.title
              });
            });
        });
    };

    inviteListModal.$scope.acceptInvite = function(invite) {
      $http({
        url: "/api/v1/firms/join",
        method: "PUT",
        params: {
          firm_id: invite.firm_id
        }
      })
        .then(function(response) {
          tokenAuth
            .updateCompanyList()
            .then(function(data) {
              return getInviteList();
            })
            .then(function(data) {
              if(data.length == 0) {
                tokenAuth.setCurrentCompanyId(invite.firm_id);
                inviteListModal.hide();
                $state.go("main.one_column.deal_index", {}, {reload: true});
              }

              ngToast.create({
                content: 'You was successfully joined to ' + invite.title
              });
            });

        });
    };

    $scope.openInviteList = function() {
      inviteListModal.$promise.then(inviteListModal.show);
    };

    var pathParts = $location.path().split("/");
    if(pathParts.length < 3 || pathParts[1] != "inbox") {
      $scope.navState.isEmailSection = false;
    } else {
      $scope.navState.isEmailSection = true;
    }

    $scope.activeEmailClass = function(email) {
      var pathParts = $location.path().split("/");

      if(pathParts.length < 3 || pathParts[1] != "inbox" || pathParts[2] != email) {
        //$scope.navState.isEmailSection = false;
        return "";
      }

      //$scope.navState.isEmailSection = true;
      return "active";
    };

    $scope.activeCompanyClass = function(id) {
      //console.log($scope.navState)
      //console.log(id)
      if($scope.navState.isEmailSection || $scope.navState.isPageSection || id != $scope.currentCompanyId) {
        return "";
      }

      return "active";
    };

    $scope.activePageClass = function(page) {
      if(!$scope.navState.isPageSection || $state.current.name != page) {
        return "";
      }

      return "active";
    };

    // Search
    $scope.searchItem = {

    };
    $scope.navState.isSearch = false;
    $scope.isSearchHistory = true;
    $scope.searchProgress = false;
    $scope.nothing = false;
    $scope.contactFields = contactFields;
    $scope.searchCount = 0;

    var saveSearch = function(searchText) {
      if(searchText == $scope.searchItem.query) {
        console.log("save");
        $http.post("/api/v1/firms/" + tokenAuth.getCurrentCompanyId() + "/history", {history: searchText});
      }
    };

    var runSearch = function(searchText) {
      $http({
        url: "/api/v1/firms/search",
        method: "GET",
        params: {
          firm_id: tokenAuth.getCurrentCompanyId(),
          query: searchText
        }
      }).then(function(response) {
        var selectedTab = null;
        var filledSections = 0;
        var searchCount = 0;
        angular.forEach($scope.searchTabs, function(name, section) {
          $scope.searchResults.counters[section] = response.data[section].length;
          $scope.searchResults[section] = response.data[section];

          if($scope.searchResults.counters[section] > 0) {
            filledSections++;

            if(!selectedTab) {
              selectedTab = section;
            }
          }

          searchCount += $scope.searchResults.counters[section];
        });

        $scope.searchCount = searchCount;

        if(!selectedTab) {
          $scope.nothing = true;
        } else {
          $scope.searchTab = selectedTab;
          $scope.nothing = false;
        }

        $scope.searchProgress = false;

        setTimeout(saveSearch(searchText), 3000);
      });
    };

    $scope.searchFocus = function() {
      overlayState.set(true);
      $scope.navState.isSearch = true;

      $http({
        url: "/api/v1/firms/" + tokenAuth.getCurrentCompanyId() + "/history",
        method: "GET"
      }).then(function(response) {
        $scope.searchItem.history = response.data;
      });
    };

    $scope.restoreSearch = function(query) {
      $scope.searchItem.query = query;
      $scope.nothing = false;
      $scope.globalSearch();
    };

    $scope.globalSearch = function() {
      if(!$scope.searchItem.query) {
        $scope.isSearchHistory = true;
        return;
      }

      $scope.isSearchHistory = false;
      var searchText = $scope.searchItem.query;

      setTimeout(function() {
        if(searchText == $scope.searchItem.query) {
          runSearch(searchText);
        }
      }, 400);

      $scope.searchProgress = true;

    };

    $scope.hideSearch = function() {
      overlayState.set(false);
      $scope.navState.isSearch = false;
    };

    $scope.searchTabs = {
      deals: "Deals",
      contacts: "Contacts",
      letters: "Emails"
    };

    $scope.searchResults = {
      counters: {}
    };

    angular.forEach($scope.searchTabs, function(name, section) {
      $scope.searchResults.counters[section] = 0;
    });

    $scope.searchTab = "deals";
    $scope.changeSearchTab = function(tab) {
      $scope.searchTab = tab;
    };

    $scope.showSearchResult = function(item, section) {

      switch(section) {
        case "deals":
          $state.go("main.two_column.deal_view", {id: item.id});
        break;
        case "letters":
          $state.go("main.inbox.list.view", {email: item.email, bucket: "inbox", id: item.thread_id});
        break;
        case "contacts":
          $state.go("main.inbox.contact.view", {companyId: tokenAuth.getCurrentCompanyId(), id: item.contact_id});
        break;
      }

      $scope.hideSearch();
    };

  })
  .directive('inviteCounter', function($popover, $http, tokenAuth, $state) {
    return {
      restrict: 'A',
      link: function(scope, elem, attrs) {

        var invitePopover = $popover(elem, {
          placement: "bottom",
          template: "app_desktop/layout/acceptInvite.popover.html",
          autoClose: true
        });

        invitePopover.$scope.user = scope.user;
        invitePopover.$scope.declineInvite = function(companyId) {
          $http({
            url: "/api/v1/firms/reject",
            method: "DELETE",
            params: {
              firm_id: companyId
            }
          })
            .then(function(response) {
              tokenAuth.updateCompanyList()
                .then(function(data) {
                  if(scope.inviteCount == 0) {
                    invitePopover.hide();
                  }
                });
            });
        };

        invitePopover.$scope.acceptInvite = function(companyId) {
          $http({
            url: "/api/v1/firms/join",
            method: "PUT",
            params: {
              firm_id: companyId
            }
          })
            .then(function(response) {
              tokenAuth.setCurrentCompanyId(companyId);
              tokenAuth.updateCompanyList()
                .then(function(data) {
                  invitePopover.hide();
                  $state.go("main.one_column.deal_index", {}, {reload : true});
                });
            });
        };

      }
    }
  });
