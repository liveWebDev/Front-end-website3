'use strict';

angular.module('feasyDesktop')
  .controller('PageAboutCtrl', function($scope, aboutApi) {
    aboutApi.getLog()
      .then(function(data) {
        $scope.changelogItems = data;
      });
  });
