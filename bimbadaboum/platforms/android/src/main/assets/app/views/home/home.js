var UserViewModel = require("../../shared/view-models/user-view-model");
var firebase = require("nativescript-plugin-firebase");
var frameModule = require("ui/frame");
var user = new UserViewModel();
var view = require("ui/core/view");
var page;

exports.loaded = function (args) {
	var userMail;
	page = args.object;
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
		 	console.log(JSON.stringify(result[keyNames]));
			page.bindingContext = { name: result.value[keyNames].firstName };
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
   			})
	});
}

exports.logout = function () {
	user.logout();
}

exports.editProfil = function () {
	frameModule.topmost().navigate("views/profil/profil");
}

exports.submitFirstName = function () {
	var first = view.getViewById(page, "first");
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
						      {'firstName': first.text}
							);
	    				
	    			})
		});


	console.log(first.text);
}

exports.queryThing = function() {

    var onQueryEvent = function(result) {
        if (!result.error) {
      	  console.log(JSON.stringify(result));
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
           value: "jetest@gmail.com"
        },
    });
  
}