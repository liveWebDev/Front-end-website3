'use strict';

angular.module('feasyDesktop')
  .controller('CompanyMembersCtrl', function($scope, $rootScope, firmApi, $state, tokenAuth, $modal, ngToast) {
    $scope.company = tokenAuth.getUserData().currentCompany;
    var getCompanyUsers = function() {
      $scope.isDataLoaded = false;
      $scope.roles = {
        1 : 'Founder',
        2 : 'Moderator',
        3 : 'User'
      };

      firmApi.getMembers(tokenAuth.getCurrentCompanyId())
        .then(function(data) {
          $scope.isDataLoaded = true;
          $scope.users = data;
        });
    };

    $scope.excludeUser = function() {
      getCompanyUsers();
    };

    $scope.user = tokenAuth.getUserData();
    $scope.userRole = $scope.user.currentCompany.role;
    $scope.isCompanyLoaded = false;
    firmApi.getFirm(tokenAuth.getCurrentCompanyId())
      .then(function(data) {
        $scope.isCompanyLoaded = true;
        $scope.company = data;

        companyFormModal.$scope.item = {
          title: $scope.company.title,
          description: $scope.company.description
        };
      });

    // User invite modal
    var companyFormModal = $modal({
      "title": "Company form",
      "template": "app_desktop/company/modal.companyForm.html",
      "show": false,
      "animation": "am-fade-and-scale"
    });

    companyFormModal.$scope.submitForm = function(scope) {
      if(scope.companyForm.$valid == true) {
        firmApi
          .update(tokenAuth.getCurrentCompanyId(), companyFormModal.$scope.item)
          .then(function (data) {
            companyFormModal.hide();
            ngToast.create({
              content: 'Company info was changed'
            });

            $scope.company.title = companyFormModal.$scope.item.title;
            $scope.company.description = companyFormModal.$scope.item.description;
            $scope.user.currentCompany.title = companyFormModal.$scope.item.title;
          });
      }
    };

    $scope.updateCompany = function() {
      companyFormModal.$promise.then(companyFormModal.show);
    };

    getCompanyUsers();

  })
  .directive("changeRole", function(tokenAuth, firmApi, $popover, ngToast) {
    return {
      restrict: 'E',
      scope: {
        'companyUser' : '=companyUser',
        'removeCallback' : '=removeCallback'
      },
      templateUrl: function(elem, attrs) {
        return 'app_desktop/company/changeRole.directive.html'
      },
      link: function(scope, elem, attrs) {
        var row = elem.find(".options-link").closest("tr");
        var roleTooltip = $popover(elem.find(".options-link"), {
          template: "app_desktop/company/changeRole.tooltip.html",
          placement: "bottom-right",
          trigger: "click",
          autoClose: true
        });

        roleTooltip.$scope.companyUser = scope.companyUser;
        roleTooltip.$scope.$watch(function() {
          return roleTooltip.$isShown;
        }, function(newValue, oldValue) {
          if(newValue == false) {
            row.removeClass("active");
          } else {
            row.addClass("active");
          }
        });

        roleTooltip.$scope.changeRole = function(newRole) {
          firmApi.changeRole(tokenAuth.getCurrentCompanyId(), scope.companyUser.user_id, newRole)
            .then(function(data) {
              roleTooltip.hide();
              scope.companyUser.role = newRole;
              ngToast.create({
                content: 'User status was changed'
              });
            });
        };

        roleTooltip.$scope.kickAss = function(companyUser) {
          firmApi.kickMember(tokenAuth.getCurrentCompanyId(), companyUser.user_id)
            .then(function(data) {
              roleTooltip.hide();
              ngToast.create({
                content: companyUser.username + ' was kicked from company'
              });

              scope.removeCallback();
            });
        };

      }
    }
  });
