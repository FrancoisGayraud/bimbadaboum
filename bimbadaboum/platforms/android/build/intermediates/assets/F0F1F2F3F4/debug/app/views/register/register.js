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
var gender = 0;
var genderSeek = 0;

exports.loaded = function(args) {
    page = args.object;

    page.bindingContext = user;
};

exports.dropDownSelectedIndexChanged = function(args) {
	gender = args.newIndex;
  console.log(`Drop Down selected index changed from ${args.oldIndex} to ${args.newIndex}`);
}

exports.dropDownSelectedIndexChanged = function(args) {
	genderSeek = args.newIndex;
    console.log(`Drop Down selected index changed from ${args.oldIndex} to ${args.newIndex}`);
}

exports.register = function() {
	var gen = true;
	var genSeek = true;
  var lastName = view.getViewById(page, "lastName");
	var firstName = view.getViewById(page, "firstName");
	var yearBirth = page.getViewById("birthDate").year;
	var monthBirth = page.getViewById("birthDate").month;
	var dayBirth = page.getViewById("birthDate").day;
  if (gender == 0)
    gen = true;
  else
		gen = false;
		
	if (genderSeek == 0)
		genSeek = true;
	else
		genSeek = false;
	console.log(user.email + " " + user.password);
	user.register()
    .then(function() {
		   firebase.push(
     	  '/users',
      	{
        	'firstName': firstName.text,
	        'lastName': lastName.text,
    	    'birthDate': dayBirth + '/' + monthBirth + '/' + yearBirth,
					'isMale': gen,
					'genderSeek': genderSeek,
        	'city': '',
        	'mail': user.email,
        	'picsUrl': ''
    	    }).then(function (result) {
        		console.log("created key: " + result.key);
       		//	frameModule.topmost().navigate("views/login/login");
      });
	}).catch(function(error) {
	    dialogsModule.alert({
			message: "Vos informations sont incorrectes. " + error,
			okButtonText: "ok"
	    });
	});
}
