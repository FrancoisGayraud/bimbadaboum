var firebase = require('firebase');

exports.loaded = function (args) {
	firebase.auth().onAuthStateChanged(function(user) {
	  if (user) {
		alert(user.email);
	  } else {
    // No user is signed in.
  		}
	});
}