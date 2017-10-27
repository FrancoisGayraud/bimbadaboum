var UserViewModel = require("../../shared/view-models/user-view-model");
var firebase = require("nativescript-plugin-firebase");
var user = new UserViewModel();

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

exports.logout = function () {
	user.logout();
}