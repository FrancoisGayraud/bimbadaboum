var UserViewModel = require("../../shared/view-models/user-view-model");
var firebase = require("nativescript-plugin-firebase");
var user = new UserViewModel();
var view = require("ui/core/view");
var page;

exports.loaded = function (args) {
	page = args.object;	
	firebase.getCurrentUser().then(
    function (result) {
    	page.bindingContext = { name: result.email };
    },
    function (errorMessage) {
      console.log(errorMessage);
    }
  );
}

exports.logout = function () {
	user.logout();
}

exports.submitFirstName = function() {
	//	console.log("mail get = " + userMail);
	var first = view.getViewById(page, "first");
	var userId;
	var userMail;
	firebase.getCurrentUser().then(
		function (result) {
			userMail = result.email;
			console.log("ici : " + userMail);
		},
		function (errorMessage) {
			console.log(errorMessage);
		}).then(function () {
		 var onQueryEvent = function(result) {
		        if (!result.error) {
		        	//recup ici l'id "-KxxQYJefMwcYKvNUz2a", qui est dans result.value
		      	  console.log(JSON.stringify(result.value));
		      	}
		    };
			userId = firebase.query(
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

	console.log("userId" + userId);

	console.log(first.text);
	 firebase.update(
      '/users/-KxxQYJefMwcYKvNUz2a',
      {'firstName': first.text}
  );
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