var validator = require("email-validator");
var config = require("../../shared/config");
var observableModule = require("data/observable");
var firebase = require("nativescript-plugin-firebase");
var frameModule = require("ui/frame");
var dialogsModule = require("ui/dialogs");

function User(info) {
    info = info || {};

    var viewModel = new observableModule.fromObject({
        email: info.email || "",
        password: info.password || "",
    });

    viewModel.init = function(){
	firebase.init({
	    url: config.apiUrl,
	    storageBucket: 'gs://bimbadaboum-2e847.appspot.com',
	    onAuthStateChanged: function(data) { // optional but useful to immediately re-logon the user when he re-visits your app
     		console.log(data.loggedIn ? "Logged in to firebase" : "Logged out from firebase");
      	if (data.loggedIn) {
      		frameModule.topmost().navigate("views/home/home");
        	console.log("user's email address: " + (data.user.email ? data.user.email : "N/A"));
      	}
   	 }
	}).then(
	    function (instance) {
		console.log("firebase.init done");
	    },
	    function (error) {
		console.log("firebase.init error: " + error);
	    });
    };

    viewModel.login = function() {
	return firebase.login({
	    type: firebase.LoginType.PASSWORD,
	    passwordOptions: {
		email: viewModel.get("email"),
		password: viewModel.get("password")
	    }
	}).then(
	    function (result) {
			JSON.stringify(result);
			console.log("login successful");
		
	    },
	    function (errorMessage) {
	    	console.log("error in login()");
	    	dialogsModule.alert({
			message: "Vos informations sont incorrectes. ",
			okButtonText: "ok"
	    	});
	    });
    };

    viewModel.register = function() {
	return firebase.createUser({
	    email: viewModel.get("email"),
	    password: viewModel.get("password")
	}).then(
	    function (response) {
		console.log(response);
		return response;
	    });
	};

	viewModel.logout = function() {
		firebase.logout();
		frameModule.topmost().navigate("views/login/login");
	}

    viewModel.isValidEmail = function() {
	var email = this.get("email");
	return validator.validate(email);
    };
    return viewModel;
}

module.exports = User;
