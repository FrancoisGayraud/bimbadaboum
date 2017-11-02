var UserViewModel = require("../../shared/view-models/user-view-model");
var firebase = require("nativescript-plugin-firebase");
var user = new UserViewModel();

exports.loaded = function (args) {
	firebase.getCurrentUser().then(
    function (result) {
    },
    function (errorMessage) {
      console.log(errorMessage);
    }
  );
}

exports.logout = function () {
	user.logout();
}

exports.pushThing = function() {
	console.log("pushthing");
	 firebase.push(
     	 '/users',
      	{
        	'first': 'FRANCOIS',
	        'last': 'GAYRAUD',
    	    'birthYear': 1994,
        	'isMale': true,
        	'address': {
          	'street': 'foostreet',
          	'number': 124
        }
      }
  ).then(
      function (result) {
        console.log("created key: " + result.key);
      }
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
      	   value: 'birthYear'
    	},
    	range: {
           type: firebase.QueryRangeType.EQUAL_TO,
           value: 1994
        },
    });
  
}