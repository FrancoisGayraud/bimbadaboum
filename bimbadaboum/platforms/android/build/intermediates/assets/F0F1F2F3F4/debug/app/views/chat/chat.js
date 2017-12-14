var ChatView = require("nativescript-chatview");
var firebase = require("nativescript-plugin-firebase");
var keyboard = require( "nativescript-keyboardshowing" );
  
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

// userID va devoir changer, chaque chat aura pour id la concatenation des 2 uuid des users qui matchent

exports.onNavigatingTo = function(args) {
    var chatView = new ChatView.ChatView();
    var page = args.object;
    var count = 0;

    var onQueryEvent = function(result) {
        if (!result.error) {
            count = result.value[userID].count;
            displayOldConversation(result.value[userID].messages, count, chatView)
        }
        else {
            firebase.update(
            '/chat/' + userID,
            {   
                'count': 1,
                'member': userID
            })
        }
    };

    var onChildEvent = function (result) {
      console.log(JSON.stringify(result));
      if (result.value.from != userID)
      {
        chatView.appendMessages({            
            date: result.value.date,
            isRight: false,
            message: result.value.message,
            image: null
        });
      }
      else
        console.log("its already your message");
    };

    firebase.addChildEventListener(onChildEvent, "/chat/" + userID + "/messages").then(
        function (result) {
          that._userListenerWrapper = result;
          console.log("firebase.addChildEventListener added");
        },
        function (error) {
          console.log("firebase.addChildEventListener error: " + error);
        });

    firebase.query(
        onQueryEvent,
        "/chat/",
        {
          singleEvent: true,
          orderBy: {
          type: firebase.QueryOrderByType.CHILD,
          value: "member"
        },
          range: {
          type: firebase.QueryRangeType.EQUAL_TO,
          value: userID
        },
    });
   
      chatView.notifyOnSendMessageTap(function(eventData) {
          eventData.object.appendMessages({            
            date: getTime(),
            isRight: true,
            message: eventData.message,
            image: null
        });
        entry = 'msg' + count.toString();
        firebase.update(
         '/chat/' + userID + '/messages/' + entry,
            {message: eventData.message,
            'from': userID,
            'date': getTime()}
        );
        count++;
        firebase.update(
            '/chat/' + userID,
            {'count': count}
        );
        eventData.resetMessage();
        eventData.scrollToBottom();
        eventData.focusTextField();
    });
    
    chatView.focusMessageField();
    
    page.content = chatView;
    
}