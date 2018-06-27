var ChatView = require("nativescript-chatview");
var firebase = require("nativescript-plugin-firebase");
var keyboard = require( "nativescript-keyboardshowing" );
var count = 0;
var currentChat;

function getTime() {
    var now = new Date();

    var hours = now.getHours();
    var minutes = now.getMinutes();
    var day = now.getDate();
    var month = now.getMonth();

    if (hours == 0)
        hours = '00';
    if (minutes <= 9)
        minutes = '0' + minutes;

    return ("A " + hours + ":" + minutes + " le " + day + "/" +  (month + 1));

 }

function displayOldConversation (oldMessages, count, chatView) {
    var i = 0;

    while (i < count)
    {
        var tmp = "msg" + i;
        var currentMessage = oldMessages[tmp];
        var position;

        if (currentMessage.from == userID)
            position = true;
        else
            position = false;
        console.log("old message " + oldMessages[tmp].message);

        chatView.appendMessages({
            date: currentMessage.date,
            isRight: position,
            message: currentMessage.message,
            image: null
        });
        i++;
    }
}

exports.onNavigatingTo = function(args) {
    var chatView = new ChatView.ChatView();
    var page = args.object;
    var oldMessageQuery = false;
    var initQuery = false;


    var onQueryEvent = function(result) {
        if (!result.error) {
         currentChat = result.value[userID].currentChat;
        }
    };

    var retrieveOldMessages = function(result) {
        if (!result.error) {
          if (!oldMessageQuery) {
            oldMessageQuery = true;
            count = result.value[currentChat].count;
            console.log(currentChat)
            console.log(currentChat)
            console.log(currentChat)
            console.log("OLD MESSAGE QUERRYYYYYYy" + JSON.stringify(result.value[currentChat].messages))
            displayOldConversation(result.value[currentChat].messages, result.value[currentChat].count, chatView);
          }
        }
    }
    if (!initQuery) {
      initQuery = true;
      firebase.query(
          onQueryEvent,
          "/users/",
          {
            singleEvent: true,
            orderBy: {
              type: firebase.QueryOrderByType.CHILD,
              value: "mail"
            },
            range: {
              type: firebase.QueryRangeType.EQUAL_TO,
              value: userMail
            },
          }).then(function () {
            firebase.query(
              retrieveOldMessages,
              "/chats/",
              {
                singleEvent: true,
                orderBy: {
                  type: firebase.QueryOrderByType.CHILD,
                  value: "name"
                },
                range: {
                  type: firebase.QueryRangeType.EQUAL_TO,
                  value: currentChat
                },
              });
            });
          }

    var onChildEvent = function (result) {
      console.log("ONCHILDEVENT KQLJSLQSMD");
      console.log(JSON.stringify(result));
      chatView.appendMessages({
        date: "27/06/2018",
        isRight: false,
        message: result.value.message,
        image: null
      });
    };

    firebase.addChildEventListener(onChildEvent, "/chats/" + currentChat + "/messages").then(
        function (result) {
          that._userListenerWrapper = result;
          console.log("firebase.addChildEventListener added");
        },
        function (error) {
          console.log("firebase.addChildEventListener error: " + error);
        });


      chatView.notifyOnSendMessageTap(function(eventData) {
          eventData.object.appendMessages({
            date: getTime(),
            isRight: true,
            message: eventData.message,
            image: null
        });

        let entry = 'msg' + count;

        firebase.update(
         '/chats/' + currentChat + '/messages/' + entry,
            {message: eventData.message,
            'from': userID,
            'date': getTime()}
        );
        count++;
        firebase.update(
            '/chats/' + currentChat,
            {'count': count}
        );
        eventData.resetMessage();
        eventData.scrollToBottom();
        eventData.focusTextField();
    });

//    chatView.focusMessageField();

    page.content = chatView;

};
