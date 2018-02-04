'use strict';

angular.module('feasyDesktop')
  .directive('overlay', function(overlayState) {
    return {
      restrict: 'E',
      templateUrl: function(elem, attrs) {
        return 'app_desktop/layout/overlay.html';
      },
      link: function(scope, elem, attrs) {
        scope.stateValue = false;
        overlayState.addCallback(function(value) {
          if(value == true) {
            elem.find(".overlay").show();
          } else {
            elem.find(".overlay").hide();
          }
        })
      }
    };
  })
  .factory("overlayState", function() {
    var view = false;
    var callback = null;

    return {
      get: function() {
        return view;
      },

      set: function(value) {
        if(callback) {
           callback(value);
        }

        view = value;
      },

      addCallback: function(func) {
        callback = func;
      }
    }
  });
