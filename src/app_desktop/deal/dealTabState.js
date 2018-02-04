'use strict';

angular.module('feasyDesktop')
  .factory('dealselectedTabState', function() {
    var state = {
      current: "active"
    };

    return state;
  });
