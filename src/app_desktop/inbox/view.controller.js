'use strict';

angular.module('feasyDesktop')
  .controller('InboxViewCtrl', function($scope, inboxApi, contactApi, $stateParams, $state, ngToast, $filter, _, $q, tokenAuth, $modal) {
    $scope.current.id = $stateParams.id;
    $scope.current.tab = $stateParams.bucket;
    $scope.current.action = "view";
    $scope.deal = {};
    $scope.messages = [];
    $scope.isDataLoaded = false;
    $scope.isDataUpdated = true;
    $scope.formStatus = false;
    $scope.replyLetter = {
      email: $stateParams.email,
      threadId: $stateParams.id,
      body: ""
    };
    $scope.title = "";
    $scope.email = $stateParams.email;

    var threadMessages = {};
    var setReplyLetter = function(letter) {
      $scope.replyLetter.mid = letter.msg_id;
      $scope.replyLetter.to = letter.from;
      $scope.replyLetter.subject = letter.subject;

      $("#thread_view").scrollTop(0);
    };

    var buildAttaches = function(message) {
      message.hasAttaches = false;
      angular.forEach(message.attaches, function(attach) {
        if(message.hasAttaches == false) {
          message.hasAttaches = true;
        }

        attach.url = "/api/v1/gmail/download?email="
          + $stateParams.email + "&attachment_id="
          + attach.attachment_id + "&msg_id="
          + message.msg_id + "&filename="
          + attach.name;
      });
    };

    var updateThread = function() {
      $scope.isDataUpdated = false;

      return inboxApi.updateThread($stateParams.email, $stateParams.id)
        .then(function(data) {
          angular.forEach(data.letters, function(message, id) {
            if($scope.title == "") {
              $scope.title = message.subject;
            }

            message.msg_id = id;
            message.rawFrom = $filter('catchEmail')(message.from);

            buildAttaches(message);
            $scope.messages.unshift(message);
          });

          if(data.letters.length > 0) {
            setReplyLetter($scope.messages[0]);
          }

          $scope.isDataUpdated = true;
        });
    };

    var initThread = function() {
      if($scope.current.loaded == false) {
        $scope.current.listPromise.then(function() {
          var result = _.findWhere($scope.threads, {thread_id: $stateParams.id});
          if(result) {
            $scope.current.thread = result;
          } else {
            inboxApi.$promise.threadMin.then(function() {
              $scope.current.thread.list = messages_list;
            });
          }
        });
      } else {
        $scope.current.thread = _.findWhere($scope.threads, {thread_id: $stateParams.id});
      }
    };

    var messages_list = [];
    var message_id = null;

    var getThread = function() {
      if(!angular.isUndefined($scope.current.thread.list)) {
        messages_list = $scope.current.thread.list;
        message_id = messages_list[messages_list.length-1];

        return $q.when(messages_list);
      } else {
        return inboxApi.getThreadMin($stateParams.email, $stateParams.id).then(function(data){
          messages_list = data.list;
          message_id = messages_list[messages_list.length-1];

          if(data.deal) {
            $scope.current.thread.deal = data.deal;
          }

          return messages_list;
        });
      }
    };

    $scope.replyCallback = function(response, data) {
      return updateThread();
    };

    $scope.replyOptions = {
      showSpoiler: true,
      showSubject: false,
      buttonText: "Reply",
      operation: "reply",
      externalOpen: false,
      confirmBlank: true
    };

    $scope.replyTo = function(item) {
      setReplyLetter(item);
      $scope.replyOptions.externalOpen = true;
    };

    $scope.replyToAll = function(item) {
      setReplyLetter(item);
      $scope.replyLetter.to = item.messageEmails;
      $scope.replyOptions.externalOpen = true;
    };

    // Удаление треда
    $scope.deleteLetter = function() {
      if($scope.current.thread.deal.id || $scope.current.tab == 'trash') {
        var deleteModal = $modal({
          "title": "Warning",
          "content": "Linked thread cannot be deleted",
          "show": true,
          "animation": "am-fade-and-scale"
        });

        return;
      }

      inboxApi.deleteThread($stateParams.email, $stateParams.id)
        .then(function(data) {
          ngToast.create({
            content: 'Letter was deleted'
          });

          $state.go("main.inbox.list.create", {email : $stateParams.email, bucket : $scope.current.tab}, {reload: true});
        });
    };

    // Восстановление треда
    $scope.restoreThread = function() {
      if($scope.current.tab != 'trash')
        return;

      inboxApi.restoreThread($stateParams.email, $stateParams.id)
        .then(function(data) {
          ngToast.create({
            content: 'Letter was restored'
          });

          $state.go("main.inbox.list.create", {email : $stateParams.email, bucket : "inbox"}, {reload: true});
        });
    };

    initThread();
    $scope.promise = getThread()
      .then(function(messageList){
        return $q.all(messageList.map(function(messageId) {
          return inboxApi.getMessage($stateParams.email, messageId)
            .then(function(message){
              message.rawFrom = $filter('catchEmail')(message.from);
              // Если письмо входящее, то формируем строчку для отправки ответа всем участником дискуссии
              if($stateParams.email != message.rawFrom) {
                var receivers = message.to.split(",");
                receivers.unshift(message.from);

                if(message.cc) {
                  receivers.push(message.cc);
                }

                var completedReceivers = receivers.filter(function(email) {
                  return $stateParams.email != $filter('catchEmail')(email);
                });

                if(completedReceivers.length > 1) {
                  message.messageEmails = completedReceivers.join(",");
                }
                contactApi.findByEmail(tokenAuth.getCurrentCompanyId(), message.rawFrom)
                  .then(function(contact){
                    if (contact.length > 0) {
                      message.fromContact = contact[0];
                      message.fromContact.url =
                      $state.href("main.inbox.contact.view", {
                        companyId: contact[0].company_id,
                        id: contact[0].id
                      });
		                }
                  });
              }

              message.toAll = message.to;
              if(message.cc) {
                message.toAll += ', ' + message.cc;
              }

              if(message.bcc) {
                message.toAll += ', ' + message.bcc;
              }

              message.recepients = $filter('headerEmails')(message.toAll);

              _.each(message.recepients, function(recepient, index) {
                contactApi.findByEmail(tokenAuth.getCurrentCompanyId(), recepient.address)
                  .then(function(contact) {
                    if(!_.isEmpty(contact)) {
                      message.recepients[index].contact_url =
                        $state.href("main.inbox.contact.view", {
                          companyId: contact[0].company_id,
                          id: contact[0].id
                        });
                      message.recepients[index].contact_name = contact[0].name;
                    }
                  });
              });

              buildAttaches(message);
              threadMessages[messageId] = message;

              if($scope.title == "" && $scope.messages.length == 1) {
                $scope.title = message.subject;
              }
            });
        }));
      })
      .then(function() {

        angular.forEach(messages_list, function(messageId) {
          $scope.messages.push(threadMessages[messageId]);
        });

        if($scope.messages.length > 0) {
          setReplyLetter($scope.messages[0]);
        }

        $scope.isDataLoaded = true;

        return $scope.messages;
      });
  });
