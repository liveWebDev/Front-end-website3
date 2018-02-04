'use strict';

angular.module('feasyDesktop')
  .directive('dealLinker', function($http, $modal, $popover, ngToast, tokenAuth, $q) {
    return {
      restrict: 'E',
      scope: {
        deal: '=',
        threadId: '=',
        promise: '='
      },
      templateUrl: function(elem, attrs) {
        if(!attrs.template)
          return 'components_desktop/dealLinker/small.tpl.html';

        return 'components_desktop/dealLinker/' + attrs.template + '.tpl.html';
      },
      link: {
        pre: function (scope, elem, attrs) {

        },
        post: function (scope, elem, attrs) {
          var modal = null,
            popover = null;

          var options = {
            placement: 'bottom-right'
          };

          angular.forEach(options, function(value, key) {
            if(angular.isDefined(attrs[key])) {
              options[key] = attrs[key];
            }
          });

          var linkDeal = function(dealId) {
            return $http.post(
              "/api/v1/gmail/thread/" + scope.threadId + "/link/" + dealId);
          };

          var initModal = function() {
            modal = $modal({
              "title": "Link the deal",
              "template": "components_desktop/dealLinker/modal.html",
              "show": false,
              "animation": "am-fade-and-scale"
            });

            var appendDeal = function(id, deal) {
              scope.deal.id = id;
              scope.deal.title = deal.title;
              scope.deal.partner_name = deal.partner_name;

              modal.hide();
              modal = null;

              ngToast.create({
                content: "Thread was successfully linked with deal"
              });
            };

            modal.$scope.hideModal = function() {
              modal.$scope.item.selected = null;
              modal.hide();
            };

            modal.$scope.form = {};
            modal.$scope.companies = tokenAuth.getUserData().companies;
            modal.$scope.currentCompany = tokenAuth.getUserData().currentCompany;
            modal.$scope.companyPromise = $q.when(true);
            modal.$scope.errorData = {
              deal: {
                required: "Please select the deal",
                isObject: "Please choice existed deal"
              }
            };

            modal.$scope.linkDeal = function (id, title) {
              linkDeal(id)
                .then(function(response) {
                  appendDeal(id, {title: title});
                });
            };

            modal.$scope.isCreateDeal = true;
            modal.$scope.slimConfig = {
              placeholder: 'Create a new deal, just start type here',
              btnTitle: 'Create and link'
            };

            modal.$scope.addDealCallback = function (dealId, deal) {
              return linkDeal(dealId)
                .then(function(response) {
                  appendDeal(dealId, deal);
                });
            };

            modal.$scope.changeOption = function (isCreateDeal) {
              modal.$scope.isCreateDeal = isCreateDeal;
            };

            modal.$scope.changeCompanyCallback = function(item) {
              modal.$scope.currentCompany = item;

              return $q.when(item);
            };

            // Выбор существующей сделки
            modal.$scope.item = {
              selected: null
            }

            modal.$scope.searchDeal = function(char) {
              if(char.length < 2)
                return;

              return $http({
                url: "/api/v1/deals/search",
                method: "GET",
                params: {
                  firm_id: modal.$scope.currentCompany.firm_id,
                  query: char
                }
              })
                .then(function(response) {
                  var items = response.data;
                  angular.forEach(items, function(item) {
                    item.fullName = item.partner_name + ' | ' + item.title;
                  });

                  return items;
                });
            };

            modal.$scope.$watch('item.selected', function(newValue,oldValue) {
              if (newValue !== oldValue && angular.isString(newValue) && angular.isObject(oldValue))
                modal.$scope.item.selected = oldValue;
            });

            modal.$scope.selectDealButton = {};
            modal.$scope.selectDealButton.callback = function() {
              console.log(modal.$scope.dealSelectForm)
              modal.$scope.form.selectDeal.$setSubmitted();

              if(!modal.$scope.item.selected || angular.isString(modal.$scope.item.selected)) {
                return $q.when(false);
              }

              return linkDeal(modal.$scope.item.selected.id)
                .then(function(response) {
                  appendDeal(modal.$scope.item.selected.id, modal.$scope.item.selected);
                });
            };
          };

          var initPopover = function() {
            popover = $popover(elem.find(".link-button"), {
              placement: options.placement,
              template: "components_desktop/dealLinker/popover.html",
              autoClose: true,
              trigger: 'manual'
            });

            popover.$scope.dealId = scope.deal.id;
            popover.$scope.unlinkDeal = function() {
              linkDeal(scope.deal.id)
                .then(function(response) {
                  scope.deal.id = null;
                  scope.deal.title = "Link the deal";
                  scope.deal.partner_name = null;

                  popover.hide();
                  popover = null;

                  ngToast.create({
                    content: "Thread was successfully unlinked"
                  });
                });
            };
          };
          if (!scope.deal) {
            scope.deal = {
              id: null,
              title: "Link the deal",
              partner_name: null
            };
          }
          scope.promise.then(function(response) {

            scope.openAction = function(e) {
              e.stopPropagation();

              if (!scope.deal.id) {
                if(!modal) {
                  initModal();
                }

                modal.$promise.then(modal.show);
              } else {
                if(!popover) {
                  initPopover();
                }

                popover.$promise.then(popover.show);
              }
            };
          });
        }
      }
    };
  });
