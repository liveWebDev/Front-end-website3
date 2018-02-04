'use strict';

angular.module('feasyDesktop')
  .factory('leaveConfirmation', function($modal, $state, $timeout) {
    var confirmed = true;
    var shown = false;
    
    return {
      get: function() {
        return confirmed;
      },

      set: function(value) {
        confirmed = value;
      },

      isShown: function() {
        return shown;
      },
      
      showModal: function(eventTarget) {
        shown = true;
        
        var modal = $modal({
          title: 'Confirmation',
          show: true,
          templateUrl: "components_desktop/leaveConfirmation/modal.tpl.html",
          animation: "am-fade-and-scale"
        });

        modal.$scope.leave = function() {
          confirmed = true;
          modal.hide();
          $timeout(function() {
              angular.element(eventTarget).trigger('click');
          }, 0);          
        };

        modal.$scope.keep = function() {
          modal.hide();
        };

        modal.$scope.$on('modal.hide',function(){
          shown = false;
        });        
      }
    }
  });
