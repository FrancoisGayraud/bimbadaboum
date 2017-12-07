import ChatView = require("nativescript-chatview");
 
function getTime() : string {
    var now = new Date();
    
    var hours = now.getHours();
    return numberToString(hours == 12 ? 12 : (hours % 12)) + ":" + numberToString(now.getMinutes()) + " " + 
           (hours < 13 ? "AM" : "PM");
}
 
export function onNavigatingTo(args) {
    var page = args.object;
 
    // create view
    var chatView = new ChatView.ChatView();
    
    // register event when user taps
    // on SEND button
    chatView.notifyOnSendMessageTap((eventData: ChatView.SendMessageTappedEventData) => {
        // add a chat message
        eventData.object.appendMessages({            
            date: getTime(),
            isRight: true,
            image: "~/img/avatar.jpg",
            message: eventData.message,    
        });
    });
    
    // focus text field
    chatView.focusMessageField();
    
    page.content = chatView;
}