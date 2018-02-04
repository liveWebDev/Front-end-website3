'use strict';

angular.module('feasyDesktop')
  .directive('userSwitcher', function($popover, tokenAuth) {
    return {
      restrict: 'E',
      'scope': {
        callback: '=callback',
        currentUser: '=currentUser'
      },
      templateUrl: function(elem, attrs) {
        return 'components_desktop/userSwitcher/default.html'
      },
      link: function(scope, elem, attrs) {

        var switchPopover = $popover(elem.find("#user-switcher-link"), {
          placement: "bottom-right",
          template: "components_desktop/userSwitcher/popover.tpl.html",
          autoClose: true
        });

        var setCurrentUser = function(user) {
          switchPopover.$scope.chosenUser = {
            id: user.user_id,
            username: user.username
          };

          scope.whoisDeals = switchPopover.$scope.chosenUser.username + " deals";
          console.log(scope.whoisDeals);
        };

        var setUsers = function(users) {
          switchPopover.$scope.users = [];
          angular.forEach(users, function(user) {
            if(user.user_id != tokenAuth.getUserData().id) {
              switchPopover.$scope.users.push(user);
            }
          });

          var isChecked = false;

          if(switchPopover.$scope.chosenUser.id == null && users.length > 1) {
            isChecked = true;
          } else {
            angular.forEach(users, function (user) {
              if (user.user_id == switchPopover.$scope.chosenUser.id) {
                isChecked = true;
              }
            });
          }

          if(isChecked == false) {
            setCurrentUser(switchPopover.$scope.currentUser);
          }
        };

        switchPopover.$scope.currentUser = {
          user_id: tokenAuth.getUserData().id,
          username: "Your"
        };

        setCurrentUser({
          user_id: scope.currentUser.id,
          username: scope.currentUser.username
        });


        if(tokenAuth.isCompanyUsersLoaded() == true) {
          setUsers(tokenAuth.getUserData().companyUsers);
        } else {
          switchPopover.$scope.users = [];
          tokenAuth
            .companyUsersPromise()
            .then(function(data) {
              setUsers(tokenAuth.getUserData().companyUsers);
            });
        }

        switchPopover.$scope.switchUser = function(user) {
          if(!user) {
            user = {
              user_id: null,
              username: "All"
            }
          }

          setCurrentUser(user);
          switchPopover.hide();

          scope.callback(switchPopover.$scope.chosenUser);
        };

        tokenAuth.addCompanyUserListener(function(users) {
          setUsers(users);
        });
      }
    };
  });
