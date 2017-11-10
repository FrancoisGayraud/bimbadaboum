var dialogsModule = require("ui/dialogs");
var frameModule = require("ui/frame");
var UserViewModel = require("../../shared/view-models/user-view-model");
var user = new UserViewModel();
var firebase = require("nativescript-plugin-firebase");
var view = require("ui/core/view"); 
var page;

exports.loaded = function(args) {
    page = args.object;
    page.bindingContext = user;
};

exports.register = function() {
	var firstName = view.getViewById(page, "firstName");
	user.register()
        .then(function() {
	    dialogsModule.alert({
	    	message: "Votre compte a bien été enregistré.",
	    	okButtonText: "ok"
	    })
	        .then(function() {
		   	firebase.push(
     	 '/users',
      	{
        	'firstName': firstName.text,
	        'lastName': '',
    	    'age': 0,
        	'isMale': true,
        	'city': '',
        	'mail': user.email
        }).then(function (result) {
        	console.log("created key: " + result.key);
      	});
		    frameModule.topmost().navigate("views/login/login");
		});
	}).catch(function(error) {
	    dialogsModule.alert({
			message: "Vos informations sont incorrectes. ",
			okButtonText: "ok"
	    });
	});
}
