'use strict';

angular.module('feasyDesktop')
  .directive('dealContacts', function(contactApi, $tooltip, ngToast, $modal, contactFields) {
    return {
      restrict: 'E',
      'scope': {
        dealPromise: '='
      },
      templateUrl: function(elem, attrs) {
        return 'app_desktop/deal/deal.contacts.html'
      },
      link: function(scope, elem, attrs) {
        scope.deal = null;
        scope.nullContact = null;
        scope.dealPromise.then(function (data) {
          scope.deal = data.deal;

          scope.contactFields = contactFields;

          var getContacts = function() {
            contactApi.getListByPartner(scope.deal.partner_id)
              .then(function(data) {
                angular.forEach(data, function(contact) {
                  contact.expand = false;
                });

                scope.contacts = data;
              });
          };

          scope.showContactForm = false;
          scope.expandContact = function(contact) {
            var expandedField = elem.find("#contact_expanded_" + contact.id);
            if(expandedField.hasClass("active")) {
              expandedField.hide().removeClass("active").parent().removeClass("active");
              $("#expanded_icon_" + contact.id).removeClass("fa-chevron-up").addClass("fa-chevron-down");
            } else {
              expandedField.show().addClass("active").parent().addClass("active");
              $("#expanded_icon_" + contact.id).removeClass("fa-chevron-down").addClass("fa-chevron-up");
            }

          };

          scope.chevronClass = function(expand) {
            if(!expand) {
              return 'fa-chevron-right';
            }

            return 'fa-chevron-down';
          };

          scope.createCallback = function() {
            getContacts();
          };

          getContacts();
        });
      }
    };
  });
