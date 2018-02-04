'use strict';

angular.module('feasyDesktop')
  .directive('customScroll', function() {
    return {
      restrict: 'A',
      link: function(scope, elem, attrs) {
        elem.mCustomScrollbar({
          live: "on",
          scrollInertia: 500,
          mouseWheelPixels: 10,
          autoHideScrollbar: true
        });
      }
    };
  });
