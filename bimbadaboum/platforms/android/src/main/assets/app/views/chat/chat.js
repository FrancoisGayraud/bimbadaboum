var ChatView = require("nativescript-chatview");
var firebase = require("nativescript-plugin-firebase");
 
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

exports.onNavigatingTo = function(args) {
    var page = args.object;
    var chatView = new ChatView.ChatView();
    var count = 0;

    var onQueryEvent = function(result) {
        if (!result.error) {
            console.log("Event type: " + result.type);
            console.log("Key: " + result.key);
            console.log("Value: " + JSON.stringify(result.value));
            count = result.value[userID].count;
            console.log(count);
        }
        else {
            firebase.update(
            '/chat/' + userID,
            {   
                'count': 0,
                'member': userID
            })
        }
    };

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
  
        chatView.appendMessages({            
        date: getTime(),
        isRight: false,
        image: null,
        message: "Hello !",    
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
            'from': userID}
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