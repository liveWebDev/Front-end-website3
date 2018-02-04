'use strict';

angular.module('feasyDesktop')
  .directive('contactUpdater', function(contactApi, $modal, contactFields, ngToast, $q, tokenAuth, partnerApi) {
    return {
      restrict: 'A',
      scope: {
        item: '=',
        partnerId: '=',
        callback: '='
      },
      link: {
        pre: function(scope, elem, attrs) {
        },
        post: function(scope, elem, attrs) {
          // Пустой объект контакта
          var nullNewContact = function() {
            scope.item = {
              partner_id: scope.partnerId,
              name: '',
              fields: {}
            };

            angular.forEach(contactFields, function(value, name) {
              scope.item.fields[name] = [{value:null}];
            });
          };

          // Преобразовывает айтем в формат API
          var prepareItem = function(oldItem) {
            var rootFields = ["partner_id", "name", "partner_name", "firm_id", "position"];
            var item = {};

            angular.forEach(rootFields, function(field) {
              if(!angular.isUndefined(oldItem[field])) {
                item[field] = oldItem[field];
              }
            });

            item.fields = [];
            angular.forEach(oldItem.fields, function(values, type) {
              angular.forEach(values, function(contactValue) {
                if(contactValue.value) {
                  item.fields.push(angular.extend(contactValue, {name: type}));
                }
              });
            });

            return item;
          };


          // Настройки модального окна для формы
          var updateFormModal = $modal({
            "title": "Invite user",
            "template": "app_desktop/contact/modal.form.html",
            "show": false,
            "animation": "am-fade-and-scale"
          });

          var isNew = false;
          if(!scope.item) {
            if(!scope.partnerId) {
              updateFormModal.$scope.noPartner = true;
              updateFormModal.$scope.searchPartner = function(char) {
                return partnerApi.search(tokenAuth.getCurrentCompanyId(), char)
                  .then(function(data) {
                    return data;
                  });
              };
            }

            isNew = true;
            nullNewContact();
          } else {
            updateFormModal.$scope.noPartner = false;
            var originalItem = scope.item;
            console.log(scope.item)
          }

          updateFormModal.$scope.formTitle = (isNew ? "Create" : "Update") + " contact";
          updateFormModal.$scope.emptyContacts = false;
          updateFormModal.$scope.errorData = {
            name: {
              required: "Please enter a contact's name"
            },
            partner: {
              required: "Please link contact with partner"
            }
          };

          updateFormModal.$scope.increment = function(field) {
            field.push({value: null});
          };

          updateFormModal.$scope.form = {};

          updateFormModal.$scope.button = {};
          updateFormModal.$scope.button.callback = function() {
            updateFormModal.$scope.form.contactForm.$setSubmitted();

            if(updateFormModal.$scope.form.contactForm.$valid == false) {
              return $q.when(false);
            }

            var allContactsIsNull = true;
            angular.forEach(contactFields, function(contactName, contactField) {
              if(updateFormModal.$scope.item.fields[contactField]) {
                angular.forEach(updateFormModal.$scope.item.fields[contactField], function(field) {
                  if(field.value) {
                    allContactsIsNull = false;
                  }
                });
              }
            });

            updateFormModal.$scope.emptyContacts = allContactsIsNull;

            if(allContactsIsNull === true) {
              return $q.when(false);
            }

            if(updateFormModal.$scope.noPartner) {
              if(angular.isString(updateFormModal.$scope.item.partner)) {
                updateFormModal.$scope.item.partner_name = updateFormModal.$scope.item.partner;
              } else {
                updateFormModal.$scope.item.partner_id = updateFormModal.$scope.item.partner.id;
              }
            }
            updateFormModal.$scope.item.firm_id = tokenAuth.getCurrentCompanyId();

            var preparedItem = prepareItem(updateFormModal.$scope.item);

            if(isNew === true) {
              return contactApi.create(preparedItem)
                .then(function(data) {
                  ngToast.create({
                    content: 'Contact was successfully added'
                  });

                  updateFormModal.hide();
                  updateFormModal.$scope.form.contactForm.$setPristine();
                  updateFormModal.$scope.form.contactForm.$setUntouched();

                  nullNewContact();

                  if(scope.callback) {
                    scope.callback();
                  }
                });
            } else {
              return contactApi.update(updateFormModal.$scope.item.id, preparedItem)
                .then(function (data) {
                  ngToast.create({
                    content: 'Contact was successfully updated'
                  });

                  updateFormModal.hide();
                  updateFormModal.$scope.form.contactForm.$setPristine();
                  updateFormModal.$scope.form.contactForm.$setUntouched();

                  if(scope.callback) {
                    scope.callback();
                  }
                });
            }
          };

          elem.on("click", function(e) {
            e.preventDefault();

            updateFormModal.$scope.item = scope.item;
            updateFormModal.$promise.then(updateFormModal.show);

            e.stopPropagation();
          });
        }
      }
    };
  });
