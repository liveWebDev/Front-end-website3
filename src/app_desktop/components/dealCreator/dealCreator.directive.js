'use strict';

angular.module('feasyDesktop')
  .directive('dealCreator', function($q, $http) {
    return {
      restrict: 'E',
      'scope': {
        submitCallback: '=submit',
        config: '=',
        company: '=',
        deal: '='
      },
      templateUrl: function(elem, attrs) {
        if(!attrs.template)
          return 'components_desktop/dealCreator/deal.creator.html';

        return 'components_desktop/dealCreator/' + attrs.template + '.html';
      },
      link: {
        pre: function(scope, elem, attrs) {
          scope.errorData = {
            partner: {
              required: "Please, describe partner name"
            },
            title: {
              required: "Deal name cannot be blank"
            }
          };
        },
        post: function(scope, elem, attrs) {
          if(!scope.submitCallback) {
            return;
          }

          var defaults = {
            btnTitle : 'Add a new item',
            placeholder : 'Start to type here',
            inputType : 'text'
          };

          scope.config = angular.extend(defaults, scope.config || {});

          scope.item = {
            title : '',
            partner: null
          };

          if(scope.deal) {
            if(scope.deal.id) {
              scope.item.id = scope.deal.id;
              scope.item.title = scope.deal.title;
              scope.item.partner = scope.deal.partner;
            }
          } else {
            console.log("net");
          }


          var dealTitle  = elem.find(".name-input"),
            dealPartner = elem.find(".partner-input"),
            dealButton = elem.find(".slim-button"),
            container  = elem.find(".slim-creator"),
            isActive   = false,
            errors = {
              partner: [],
              title: []
            };

          var addPartner = function() {
            if(angular.isObject(scope.item.partner) == true) {
              return $q.when(scope.item.partner);
            }

            return $http
              .post("/api/v1/partners/new", {
                firm_id: scope.company.firm_id,
                name: scope.item.partner
              })
              .then(function(response) {

                var partnerId = response.data.id;
                return {
                  id: partnerId,
                  name: scope.item.partner
                };
              });
          };

          scope.button = {};
          scope.button.callback = function() {
            scope.slimCreatorForm.$setSubmitted();

            if(scope.slimCreatorForm.$valid == false) {
              angular.forEach(errors, function(errorList, key) {
                if(scope.slimCreatorForm[key].$valid == false) {
                  errors[key].push("This field must be filled");
                }
              });

              return $q.when(false);
            }

            return addPartner()
              .then(function(partner) {
                scope.item.partner_name = partner.name;
                scope.item.partner_id = partner.id;

                if(scope.item.id) {
                  return $http.put("/api/v1/deals/" + scope.item.id, {
                    title : scope.item.title,
                    firm_id : scope.company.firm_id,
                    partner_id: partner.id
                  }).then(function(response) {
                    return scope.submitCallback(response.data, scope.item);
                  });
                } else {
                  return $http.post("/api/v1/deals/new", {
                    title : scope.item.title,
                    firm_id : scope.company.firm_id,
                    partner_id: partner.id
                  }).then(function(response) {
                    return scope.submitCallback(response.data.id, scope.item);
                  });
                }
              })
              .then(function(response) {
                scope.item.title = "";
                scope.item.partner = null;
                scope.isSubmited = false;
                scope.slimCreatorForm.$setPristine();
                scope.slimCreatorForm.$setUntouched();
                scope.slimCreatorForm.$submitted = false;

                elem.find(".partner-input").focus();
              });
          };

          scope.searchPartner = function(char) {
            return $http({
              url: "/api/v1/partners",
              method: "GET",
              params: {
                firm_id: scope.company.firm_id,
                query: char
              }
            })
              .then(function(response) {
                return response.data;
              });
          };
        }
      }
    };
  });
