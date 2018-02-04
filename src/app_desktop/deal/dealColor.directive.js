'use strict';

angular.module('feasyDesktop')
  .directive('dealColor', function(timeAgo, nowTime) {
    return {
      restrict: 'A',
      link: function(scope, elm, attrs, ngModel) {
        if(!attrs.dealColor) {
          return;
        }

        var days = Math.floor(attrs.dealColor);	
        if(days >= 7) {
          elm.addClass("danger");
        } else if(days >= 3) {
          elm.addClass("warning");
        }
      }
    };
  });
