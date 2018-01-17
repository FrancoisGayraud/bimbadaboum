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

// userID va devoir changer, chaque chat aura pour id la concatenation des 2 uuid des users qui matchent

exports.onNavigatingTo = function(args) {
    var chatView = new ChatView.ChatView();
    var page = args.object;

    var onQueryEvent = function(result) {
        if (!result.error) {
         currentChat = result.value[userID].currentChat;
        }
    };

    var retrieveOldMessages = function(result) {
        if (!result.error) {
            // JE RECUPERE PAS LES ANCIENS MESSAGE RESULT EST VIDE
            alert(JSON.stringify(result));
//            displayOldConversation(result.value[currentChat].messages, count, chatView)
        }
    }

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
    });

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

    var onChildEvent = function (result) {
      console.log(JSON.stringify(result));
         };

    firebase.addChildEventListener(onChildEvent, "/chats/" + currentChat + "/messages").then(
        function (result) {
          that._userListenerWrapper = result;
          console.log("firebase.addChildEventListener added");
        },
        function (error) {
          console.log("firebase.addChildEventListener error: " + error);
        });


    //LES MESSAGES APPARAISSENT ET DISPARAISSENT AU BOUT DE 10 SEC OKKKK
   
      chatView.notifyOnSendMessageTap(function(eventData) {
          eventData.object.appendMessages({            
            date: getTime(),
            isRight: true,
            message: eventData.message,
            image: null
        });
        entry = 'msg' + count.toString();
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
    
    chatView.focusMessageField();
    
    page.content = chatView;
    
}