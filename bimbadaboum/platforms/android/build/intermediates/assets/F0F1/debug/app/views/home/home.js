var firebase = require("nativescript-plugin-firebase");

exports.loaded = function (args) {
	  firebase.getCurrentUser().then(
    function (result) {
     	alert(JSON.stringify(result));
    },
    function (errorMessage) {
      console.log(errorMessage);
    }
  );
}