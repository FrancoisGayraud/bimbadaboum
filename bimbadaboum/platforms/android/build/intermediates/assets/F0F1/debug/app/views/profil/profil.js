var page;
var switchModule = require("tns-core-modules/ui/switch");
var firebase = require("nativescript-plugin-firebase");
var observableModule = require("data/observable");
var view = require("ui/core/view");
var dropDown = require("nativescript-drop-down");
var observableArray = require("data/observable-array");
var viewModel = new observableModule.Observable;
var gender = 0;

exports.loaded = function (args) {
	page = args.object;
	var items = new observableArray.ObservableArray();
    items.push("Homme");
    items.push("Femme");
 
    viewModel.set("items", items);
    viewModel.set("selectedIndex", 0);
 
    page.bindingContext = viewModel;

}


exports.dropDownSelectedIndexChanged = function(args) {
	gender = args.newIndex;
    console.log(`Drop Down selected index changed from ${args.oldIndex} to ${args.newIndex}`);
}

exports.submitChanges = function () {
	var firstName = view.getViewById(page, "firstName");
	var lastName = view.getViewById(page, "lastName");
	var age = view.getViewById(page, "age");
	var city = view.getViewById(page, "city");
	var gen;

	if (gender == 0)
		gen = true;
	else
		gen = false;

	console.log("values : " + firstName.text + " " + lastName.text + " " + age.text + " " + city.text);

	var userId;
	var userMail;
	firebase.getCurrentUser().then(
		function (result) {
			userMail = result.email;
		},
		function (errorMessage) {
			console.log(errorMessage);
		}).then(function () {
		 var onQueryEvent = function(result) {
		        if (!result.error) {
					var keyNames = Object.keys(result.value);
					console.log("key : " + keyNames[0]);
					userId = keyNames[0];
		      	}
		    };
			  firebase.query(
				onQueryEvent,
	        	"/users",
    	    		{
	    	  			singleEvent: true,
    					orderBy: {
   						type: firebase.QueryOrderByType.CHILD,
      	   				value: "mail"
	    			},
	    				range: {
	           			type: firebase.QueryRangeType.EQUAL_TO,
	           			value: userMail
	        		},
	    			}).then(function (){
							firebase.update(
						      '/users/' + userId,
						      {'firstName': firstName.text,
						      'lastName': lastName.text,
						      'age': age.text,
						  	  'isMale': gen,
						  	  'city': city.text}
							);
	    				
	    			})
		});

}