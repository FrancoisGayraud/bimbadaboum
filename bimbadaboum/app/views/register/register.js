var dialogsModule = require("ui/dialogs");
var frameModule = require("ui/frame");
var UserViewModel = require("../../shared/view-models/user-view-model");
var user = new UserViewModel();
var firebase = require("nativescript-plugin-firebase");

exports.loaded = function(args) {
    var page = args.object;
    page.bindingContext = user;
};

exports.register = function() {
    user.register()
        .then(function() {
	    dialogsModule.alert({
	    	message: "Votre compte a bien été enregistré.",
	    	okButtonText: "ok"
	    })
	        .then(function() {
		    frameModule.topmost().navigate("views/login/login");
		   	firebase.push(
     	 '/users',
      	{
        	'firstName': '',
	        'lastName': '',
    	    'age': 0,
        	'isMale': true,
        	'city': '',
        	'mail': user.email
        }).then(function (result) {
        	console.log("created key: " + result.key);
      	});
		});
	}).catch(function(error) {
	    dialogsModule.alert({
			message: "Vos informations sont incorrectes. ",
			okButtonText: "ok"
	    });
	});
}
