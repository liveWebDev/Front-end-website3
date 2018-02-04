'use strict';

angular.module('feasyDesktop')
  .factory('routeHistory', function($state, $stateParams) {
    var prev = {
      state: null,
      params: {}
    };

    var updatePrevState = function(state, params) {
      prev.state = state;
      prev.params = params;
    };

    return {
      go: function(state, params) {
        var oldParams = angular.extend({}, $stateParams);
        updatePrevState($state.current.name, oldParams);

        $state.go(state, params);
      },

      back: function() {

        if(this.canBack() == false) {
          return;
        }

        var oldState = $state.current.name;
        var oldParams = angular.extend({}, $stateParams);

        $state.go(prev.state, prev.params);

        updatePrevState(oldState, oldParams);
      },

      canBack: function() {
        if(!prev.state) {
          return false;
        }

        return true;
      }
    }
  });
