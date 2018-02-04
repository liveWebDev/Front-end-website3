'use strict';

angular.module('feasyDesktop')
  .directive('userInviter', function($http, $modal, ngToast, tokenAuth, $document) {
    return {
      restrict: 'E',
      templateUrl: function(elem, attrs) {
        if(!attrs.template)
          return 'components_desktop/userInviter/link.tpl.html'

        return 'components_desktop/userInviter/' + attrs.template + '.tpl.html';
      },
      link: function(scope, elem, attrs) {
        var userInviteModal = $modal({
          "title": "Invite user",
          "template": "app_desktop/company/modal.inviteUser.html",
          "show": false,
          "animation": "am-fade-and-scale"
        });

        userInviteModal.$scope.form = {
          inviteEmail: ''
        };

        userInviteModal.$scope.errorData = {
          email: {
            required: "Please put email here",
            email: "Please enter correct email"
          }
        };

        userInviteModal.$scope.inviteUser = function() {
          if(userInviteModal.$scope.form.inviteForm.$valid == true) {
            return $http.post("/api/v1/firms/invite", {
              email: userInviteModal.$scope.form.inviteEmail,
              firm_id: tokenAuth.getCurrentCompanyId()
            }).then(function (response) {
              userInviteModal.hide();
              ngToast.create({
                content: 'Member ' + userInviteModal.$scope.form.inviteEmail + ' was invited'
              });

              userInviteModal.$scope.form.inviteEmail = "";
              userInviteModal.$scope.form.inviteForm.$setPristine();
              userInviteModal.$scope.form.inviteForm.$setUntouched();
            });
          }
        };

        scope.showInviteUserModal = function() {
          userInviteModal.$promise.then(function() {
            userInviteModal.show();

            $document.find("#invite-form input").keydown(function(e) {
              if (e.keyCode == 13) {
                console.log('eee')
              }
            });
          });
        };
      }
    };
  });
