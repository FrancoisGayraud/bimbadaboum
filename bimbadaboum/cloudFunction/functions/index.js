const functions = require('firebase-functions');
const admin = require('firebase-admin');


var searchingPeople = [];
var searchingPeopleCount = 0;

admin.initializeApp(functions.config().firebase);

function matchingAlgorithm(user, searchingGender, gender) {

  var find = false;
  console.log("User in matchingAlgorithm() : " + user + " and there is " + searchingPeople.length + " people in searchingPeople tab");
  for (var i = 0; i < searchingPeople.length; i += 1) {
    console.log("loop number " + i);
    if (searchingPeople[i][1] == gender)
      if (searchingGender == searchingPeople[i][2]) {
        console.log("it's a match");
        var chatroom = searchingPeople[i][0] + user;
        admin.database().ref('/users/' + searchingPeople[i][0]).update({'searching' : false});
        admin.database().ref('/users/' + user).update({'searching' : false});
        admin.database().ref('/users/' + searchingPeople[i][0]).update({'currentChat' : chatroom});
        admin.database().ref('/users/' + user).update({'currentChat' : chatroom});
        admin.database().ref('/chats/' + chatroom).update({'firstMember' : searchingPeople[i][0]});
        admin.database().ref('/chats/' + chatroom).update({'secondMember' : user});
        admin.database().ref('/chats/' + chatroom).update({'name' : chatroom});
        searchingPeople.splice(i, 1);
        find = true;
      }
  }
  if (find == false) {
    console.log("Nobody match yet, adding user to the searching people...")
    searchingPeople[searchingPeopleCount] = new Array(3);
    searchingPeople[searchingPeopleCount][0] = user;
    searchingPeople[searchingPeopleCount][1] = searchingGender;
    searchingPeople[searchingPeopleCount][2] = gender;
    searchingPeopleCount += 1;
  }
}

exports.searchingListner = functions.database.ref('/users/{user}/searching')
.onWrite(event => {
  const original = event.data.val();
  const user = event.params.user;
  var searchingGender;
  var gender;

  console.log("user : " + user + " - original : ", original);
    return admin.database().ref('/users/' + user)
      .once('value').then(snapshot => {
        if (original == true) {
          admin.database().ref('/users/').orderByChild("searching").equalTo(true).on("child_added", function(snapshot) {
            console.log(snapshot.key + " " + snapshot.val().searching);
            console.log("QUERY");
          });
          console.log("searchMale ? -> " + snapshot.child("searchMale").val());
          console.log("isMale ? -> " + snapshot.child("isMale").val());
          searchingGender = snapshot.child("searchMale").val();
          gender = snapshot.child("isMale").val();
        //  matchingAlgorithm(user, searchingGender, gender);
        }
      /*  else if (original == false) {
          var pos;
          for (var i = 0; i < searchingPeople.length; i += 1) {
            if (searchingPeople[i][0] == user)
            pos = i;
          }
          console.log("Going to remove " + searchingPeople[i][0]);
          searchingPeople.splice(i, 1);
        }
        console.log("there is " + searchingPeople.length + " people in searching tab before printing");
        for (var i = 0; i < searchingPeople.length; i++) {
            console.log("in tab -> ", searchingPeople[i][0]);
        }*/
    });
});
