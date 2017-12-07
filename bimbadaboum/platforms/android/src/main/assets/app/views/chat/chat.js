define(["require", "exports", "nativescript-chatview"], function (require, exports, ChatView) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function getTime() {
        var now = new Date();
        var hours = now.getHours();
        return numberToString(hours == 12 ? 12 : (hours % 12)) + ":" + numberToString(now.getMinutes()) + " " +
            (hours < 13 ? "AM" : "PM");
    }
    function onNavigatingTo(args) {
        var page = args.object;
        // create view
        var chatView = new ChatView.ChatView();
        // register event when user taps
        // on SEND button
        chatView.notifyOnSendMessageTap(function (eventData) {
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
        appendMessages();
    }
    exports.onNavigatingTo = onNavigatingTo;
});
