'use strict';

angular.module('feasyDesktop')
  .directive('internalComment', function($tooltip, $q, $http) {
    return {
      restrict: 'E',
      templateUrl: function(elem, attrs) {
        return 'app_desktop/deal/internalComment.html';
      },
      link: function(scope, elem, attrs) {
        var field = elem.find("#internal-comment-content");

        field.keydown(function(e) {

          if (e.ctrlKey && e.keyCode == 13) {
            elem.find("#submit-internal").click();
          }

          if(e.metaKey && e.keyCode == 13) {
            elem.find("#submit-internal").click();
          }

        })
      }
    };
  });
