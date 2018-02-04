'use strict';

angular.module('feasyDesktop')
  .directive('tooltipValidate', function($tooltip, $timeout) {
    return {
      restrict: 'A',
      'scope': {
        options: '=',
        errorData: '='
      },
      require: ['ngModel', '^form'],
      link: function(scope, elem, attrs, ctrls) {
        if(ctrls.length != 2) {
          return;
        }
        var ngModel = ctrls[0];
        var form = ctrls[1];

        var defaults = {
          placement: 'bottom'
        };

        var config = angular.extend(defaults, scope.options || {});
        var tooltip = $tooltip(elem, {
          placement: config.placement,
          trigger: 'manual',
          title: "errors",
          template : 'components_desktop/tooltipValidate/default.tpl.html',
          delay: { show: 700, hide: 100 }
        });

        tooltip.$scope.errors = [];
        var validate = function(model) {

          if(model.$valid == false) {
            tooltip.$scope.errors = [];

            angular.forEach(model.$error, function(value, field) {
              console.log(scope.errorData)
              if(angular.isUndefined(scope.errorData[field]) == false) {
                tooltip.$scope.errors.push(scope.errorData[field]);
              }
            });

            tooltip.$promise.then(function() {
              tooltip.show();

              $timeout(function() {
                setTooltipMargin();

                // Ибо с первого раза размер определяется неверно TODO: сделать более адекватное решение
                setTooltipMargin();
              }, 0);
            });
          } else {
            tooltip.$promise.then(function() {
              tooltip.hide();
            });
          }
        };

        var setTooltipMargin = function() {
          console.log(tooltip.$element.width() );
          var margin = tooltip.$element.width() / 2;
          tooltip.$element.css("margin-left", "-" + margin + "px");
        };


        scope.$watch(function() {
          return form.$submitted;
        }, function(newValue) {
          if(newValue == true) {
            validate(ngModel);
          }
        });

        elem.on("focus", function() {
          form.$submitted = false;

          tooltip.$promise.then(function() {
            tooltip.hide();
          });
        });
      }
    };
  });
