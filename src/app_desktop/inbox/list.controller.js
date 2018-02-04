'use strict';

angular.module('feasyDesktop')
  .controller('InboxListCtrl', function($scope, inboxApi, $stateParams, $state, $filter, $q, $interval, $rootScope) {
    var date = new Date();
    var mainMessages = [];

    var isLastPage = false;
    var pageToken = null;
    var historyId = null;
    var updatePromise = undefined;
    var destroyed;
    var updateDone = true;

    $scope.inSearch = false;

    var runUpdate = function() {
      updatePromise = $interval(function() {
	      if(destroyed || !updateDone) {
          return;
        }

        updateDone = false;

	    inboxApi.updateEmailList($stateParams.email, $scope.current.tab, historyId)
        .then(function(data) {

	        historyId = data.history_id;
          if($scope.inSearch || destroyed || !data.letters || !data.letters.length) {
            updateDone = true;
            return false;
          }

          var newThreadIds = [];
          angular.forEach(data.letters, function(letter) {
            newThreadIds.push(letter.thread_id);
          });

          $scope.threads = $scope.threads.filter(function(letter) {
            return newThreadIds.join(",").indexOf(letter.thread_id) == -1;
          });

          angular.forEach(data.letters, function(letter) {
            $scope.threads.push(letter);
          });

          updateDone = true;

          return data;
        });
      }, 3000);
    };

    var stopUpdate = function() {
      if(updatePromise) {
        $interval.cancel(updatePromise);
        //updatePromise = undefined;
      } else {
        if(!angular.isUndefined($scope.promise)) {
          $scope.promise.then(function() {
	    $interval.cancel(updatePromise);
          })
        }
      }
    };

    $scope.inboxScroller = {
      callback: function() {
        console.log("callback");

        if($scope.inSearch == true) {
          this.finish();
          return $q.when(false);
        }

        return getLetters($scope.current.tab);
      }
    };

    $scope.current = {
      id: "",
      tab: $stateParams.bucket,
      action: "",
      thread: {},
      loaded: false,
      listPromise: null
    };

    var getLetters = function(type) {
      if(destroyed) {
        return $q.when(false);
      }

      $scope.type = type;

      $scope.promise = inboxApi.emailList($stateParams.email, type, pageToken)
        .then(function(data) {
          $scope.current.loaded = true;

          pageToken = data.page_token;
          historyId = data.history_id;

          if(!pageToken) {
            isLastPage = true;
          }

          angular.forEach(data.letters, function (letter) {
            $scope.threads.push(letter);
          });

          if(!data.letters.length) {
            $scope.inboxScroller.finish();
          } else {
            $scope.inboxScroller.update();
          }

          return data;
        });


      $scope.current.listPromise = $scope.promise;

      return $scope.promise;
    };

    var searchThreads = function() {
      return inboxApi.search($stateParams.email, $scope.searchText);
    };

    $scope.today = $filter('date')(date, 'yyyy-MM-dd');
    $scope.timeZone = date.getTimezoneOffset();
    $scope.threads = [];
    $scope.email = $stateParams.email;

    $scope.searchText = $stateParams.query || "";


    $scope.showMessage = function(letter) {
      letter.unread = false;
      $scope.current.id = letter.thread_id;

      if(angular.isUndefined(letter.deal)) {
        letter.deal = {};
      }

      $scope.current.thread = letter;
      $state.go("main.inbox.list.view", {
        email: $stateParams.email,
        bucket: $scope.current.tab,
        id: letter.thread_id
      });
    };

    $scope.changeTab = function(tab) {
      if($scope.current.tab == "search") {
        $scope.searchText = "";
      }

      $scope.current.tab = tab;
      $scope.current.loaded = false;
      pageToken = null;
      $scope.threads = [];

      $scope.inboxScroller.restart();

      $state.transitionTo("main.inbox.list.create", {email: $stateParams.email, bucket: $scope.current.tab});
    };

    var leaveSearch = function() {
      if(!$scope.searchText.length) {
        if(mainMessages.length) {
          $scope.inSearch = false;
          $scope.threads = mainMessages;
          mainMessages = [];
        }

        return true;
      }

      return false;
    };

    $scope.searchInbox = function(updateState) {
      stopUpdate();

      if(leaveSearch() == true) {
        return;
      }

      $scope.current.loaded = false;
      $scope.inSearch = true;
      $scope.current.tab = "search";

      $scope.promise = searchThreads()
        .then(function(data){
          if(mainMessages.length == 0) {
            mainMessages = $scope.threads;
          }
          $scope.threads = data.letters;

          $scope.current.loaded = true;

          if(updateState == true) {
            $state.transitionTo("main.inbox.list.create", {
              email: $stateParams.email,
              bucket: "search",
              query: $scope.searchText
            });
          }

	        $scope.inboxScroller.finish();

          return data.letters;
        });
      $scope.current.listPromise = $scope.promise;
    };

    $scope.leaveSearch = function() {
      leaveSearch();
    };

    $scope.$on('$destroy',function(){
      destroyed = true;
      stopUpdate();
    });

    // Работа контроллера
    if($scope.current.tab == "search") {
      if(!$scope.searchText) {
        $scope.current.tab = "inbox";
        $state.go("main.inbox.list.create", {email: $stateParams.email, bucket: $scope.current.tab});
      } else {
        $scope.searchInbox();
      }
    } else {
      getLetters($scope.current.tab);
      if ($scope.current.tab == 'inbox') {
        runUpdate();
      }
    }
  });
