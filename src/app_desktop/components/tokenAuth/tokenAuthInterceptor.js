'use strict';

angular.module('feasyDesktop')
  .factory('tokenAuthInterceptor', function ($rootScope, $q, $window, $injector, ngToast, $sce) {
  return {
    request: function (config) {
      config.headers = config.headers || {};
      if ($window.localStorage.token) {
        config.headers.Token = $window.localStorage.token;
      }

      config.startTime = new Date().getTime();

      return config;
    },

    responseError : function(response) {
      var tokenAuth = $injector.get("tokenAuth"),
          $state = $injector.get("$state"),
          debugApi = $injector.get("debugApi");

      if(response.status == 401) {
        tokenAuth.logout();
        $state.go("noAuth.login");
      }

      if([500, 502, 404, 405].join(",").indexOf(response.status) >= 0) {
        if(debugApi.isBugDetected() == false) {
          ngToast.create({
            content: $sce.trustAsHtml('Something went wrong. Try to <a ng-click="t.refresh()">restart current page</a>.'),
            additionalClasses: 'feasy-notify danger',
            dismissOnTimeout: false,
            compileContent: true
          });

          debugApi.addBug({
            url: response.config.url,
            method: response.config.method,
            headers: response.config.headers,
            payload: angular.toJson(response.config.data),
            code: response.status,
            response: angular.toJson(response.data),
            startTime: response.config.startTime,
            endTime: new Date().getTime()
          });
        }
      }

      return $q.reject(response);
    }
  };
});
