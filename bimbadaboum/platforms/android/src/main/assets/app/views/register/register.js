var dialogsModule = require("ui/dialogs");
var frameModule = require("ui/frame");
var UserViewModel = require("../../shared/view-models/user-view-model");
var user = new UserViewModel();
var firebase = require("nativescript-plugin-firebase");
var view = require("ui/core/view"); 
var observableArray = require("data/observable-array");
var observableModule = require("data/observable");
var viewModel = new observableModule.Observable;
var page;

exports.loaded = function(args) {
    page = args.object;
    var items = new observableArray.ObservableArray();
    items.push("Homme");
    items.push("Femme");

  	viewModel.set("items", items);
    viewModel.set("selectedIndex", 0);

   // page.bindingContext = viewModel;
    page.bindingContext = user;
};

exports.dropDownSelectedIndexChanged = function(args) {
	gender = args.newIndex;
    console.log(`Drop Down selected index changed from ${args.oldIndex} to ${args.newIndex}`);
}

exports.register = function() {
	var firstName = view.getViewById(page, "firstName");
	var yearBirth = page.getViewById("birthDate").year;
	var monthBirth = page.getViewById("birthDate").month;
	var dayBirth = page.getViewById("birthDate").day;
	console.log(user.email + " " + user.password);
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
    	    'birthDate': dayBirth + '/' + monthBirth + '/' + yearBirth,
        	'isMale': true,
        	'city': '',
        	'mail': user.email,
        	'picsUrl': ''
    	    }).then(function (result) {
        		console.log("created key: " + result.key);
       		//	frameModule.topmost().navigate("views/login/login");
      		}); 
		});
	}).catch(function(error) {
	    dialogsModule.alert({
			message: "Vos informations sont incorrectes. " + error,
			okButtonText: "ok"
	    });
	});
}
