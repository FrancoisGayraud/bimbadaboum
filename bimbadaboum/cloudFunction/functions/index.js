const functions = require('firebase-functions');
const admin = require('firebase-admin');

var searchingPeople = [];
var searchingPeopleCount = 0;

admin.initializeApp(functions.config().firebase);

function matchingAlgorithm() {
    if (searchingPeople.length > 1)
	for (var i = 0; i < searchingPeople.length; i+= 2) {
	    var chatroom = searchingPeople[i] + searchingPeople[i + 1];
	    admin.database().ref('/users/' + searchingPeople[i]).update({'searching' : false});
	    admin.database().ref('/users/' + searchingPeople[i + 1]).update({'searching' : false});
	    admin.database().ref('/users/' + searchingPeople[i]).update({'currentChat' : chatroom});
	    admin.database().ref('/users/' + searchingPeople[i + 1]).update({'currentChat' : chatroom});
	    admin.database().ref('/chats/' + chatroom).update({'firstMember' : searchingPeople[i]});
	    admin.database().ref('/chats/' + chatroom).update({'secondMember' : searchingPeople[i + 1]});
	    admin.database().ref('/chats/' + chatroom).update({'name' : chatroom});
	    for (var u = i; u < searchingPeople.length - 1; u++) {
		searchingPeople[u] = searchingPeople[u + 2];
	    }
	    searchingPeopleCount-= 2;
	    searchingPeople.length-= 2;
	}
}

exports.watchSearching = functions.database.ref('/users/{user}/searching')
    .onWrite(event => {
	console.log(JSON.stringify(event));
	const original = event.data.val();
	const user = event.params.user;
	console.log('test -> ', event.params.user, original);
	if (original == true) {
	    console.log("going to add in searching tab...");
	    searchingPeople[searchingPeopleCount] = event.params.user;
	    searchingPeopleCount+= 1;
	}
	else if (original == false && searchingPeople.indexOf(user) != -1) {
	    var pos = searchingPeople.indexOf(user);
	    for (var i = pos; i < searchingPeople.length; i++) {
		searchingPeople[pos] = searchingPeople[pos + 1];
	    }
	    searchingPeople.length-= 1;
	    searchingPeopleCount-= 1;
	}
	for (var i = 0; i <= searchingPeople.length; i++) {
	    console.log("in tab -> ", searchingPeople[i]);
	}
	matchingAlgorithm();
	return event.data.ref.parent.child('uppercase').set('test');
	// return event.data.ref.parent.child('searchingPeople').set(searchingPeopleCount);
	// You must return a Promise when performing asynchronous tasks inside a Functions such as
	// writing to the Firebase Realtime Database.
	// Setting an "uppercase" sibling in the Realtime Database returns a Promise.

    });
