const functions = require('firebase-functions');
const admin = require('firebase-admin');


var searchingPeople = [];
var searchingPeopleCount = 0;

admin.initializeApp(functions.config().firebase);


exports.searchingListner = functions.database.ref('/users/{user}/searching')
.onWrite(event => {
  const user = event.params.user;
  var searchingMale;
  var isMale;
  var mail;

    return admin.database().ref('/users/' + user)
      .once('value').then(snapshot => {
        searchingMale = snapshot.child("searchMale").val();
        isMale = snapshot.child("isMale").val();
        mail = snapshot.child("mail").val();

        return admin.database().ref('/users/').orderByChild("searching").equalTo(true).once("value", function(snapshot) {
          snapshot.forEach(function(snapshot) {
            if (snapshot.child("mail").val() !== mail)
              if (searchingMale === snapshot.child("isMale").val() && isMale === snapshot.child("searchMale").val()) {
                console.log("it's a match " + mail);
                var chatroom = snapshot.key + user;
                admin.database().ref('/users/' + snapshot.key).update({'searching' : false});
                admin.database().ref('/users/' + user).update({'searching' : false});
                admin.database().ref('/users/' + snapshot.key).update({'currentChat' : chatroom});
                admin.database().ref('/users/' + user).update({'currentChat' : chatroom});
                admin.database().ref('/chats/' + chatroom).update({'firstMember' : snapshot.key});
                admin.database().ref('/chats/' + chatroom).update({'secondMember' : user});
                admin.database().ref('/chats/' + chatroom).update({'count' : 0});
                admin.database().ref('/chats/' + chatroom).update({'name' : chatroom});
              }
          });
        });
    });
});
