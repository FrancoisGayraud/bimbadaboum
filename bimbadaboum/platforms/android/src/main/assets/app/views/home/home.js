var UserViewModel = require("../../shared/view-models/user-view-model");
var firebase = require("nativescript-plugin-firebase");
var frameModule = require("ui/frame");
var user = new UserViewModel();
var view = require("ui/core/view");
var camera = require("nativescript-camera");
var imageModule = require("ui/image");
var fs = require("file-system");
var imagepicker = require("nativescript-imagepicker");
var context = imagepicker.create({ mode: "single" }); // use "multiple" for multiple selection
var appPath = fs.knownFolders.currentApp().path;
var page;
var userMail;

exports.loaded = function (args) {
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
		        	console.log(JSON.stringify(result))
					var keyNames = Object.keys(result.value);
					console.log("key : " + keyNames[0]);
					userID = keyNames[0];
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
	    	});
	    })

}

exports.logout = function () {
	user.logout();
}

exports.selectImage = function () {
	var date = new Date();
	date = date.toString().replace(/\s+/g, '');
	var URL;

	context.authorize()
    .then(function() {
        return context.present();
    })
    .then(function(selection) {
        selection.forEach(function(selected) {
    		firebase.uploadFile({
    		remoteFullPath: 'uploads/images/' + userMail + '/profilPics/' + date,
		    localFullPath: selected._android,
		    onProgress: function(status) {
      		console.log("Uploaded fraction: " + status.fractionCompleted);
      		console.log("Percentage complete: " + status.percentageCompleted);
    }
  }).then(
      function (uploadedFile) {
        console.log("File uploaded: " + JSON.stringify(uploadedFile));
      },
      function (error) {
        console.log("File upload error: " + error);
      }
  	).then(
  	function() {
	firebase.getDownloadUrl({
	// IL ARRIVE PAS A RECUPERER L'URL DE L'IMAGE, IL A SUREMENT PAS ENCORE UPLOAD
	bucket: 'gs://bimbadaboum-2e847.appspot.com/',
    remoteFullPath: 'uploads/images/' + userMail + '/profilPics/' + date
  }).then(
      function (url) {
        console.log("Remote URL: " + url);
        URL = url;
      },
      function (error) {
        console.log("Error: " + error);
      }
  );
  	}).then(
  	function () {
  		firebase.update(
  			'/users/' + userID + '/picsUrl',
  			
  				{'url' : URL}
  			
  			);
  	});
 	});
        list.items = selection;
    }).catch(function (e) {
        // process error
    });


}

exports.editPhoto = function () {
	var date = new Date();
	camera.requestPermissions();
	var options = { width: 300, height: 300, keepAspectRatio: false, saveToGallery: true };
	camera.takePicture(options)
    .then(function (imageAsset) {
        var image = new imageModule.Image();
        image.src = imageAsset;
        firebase.uploadFile({
    remoteFullPath: 'uploads/images/' + userMail + '/profilPics/' + date,
    localFullPath: image.src._android,
    onProgress: function(status) {
      console.log("Uploaded fraction: " + status.fractionCompleted);
      console.log("Percentage complete: " + status.percentageCompleted);
    }
  }).then(
      function (uploadedFile) {
        console.log("File uploaded: " + JSON.stringify(uploadedFile));
      },
      function (error) {
        console.log("File upload error: " + error);
      }
  );
    }).catch(function (err) {
        console.log("Error -> " + err.message);
    });
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
	firebase.getDownloadUrl({
	// IL ARRIVE PAS A RECUPERER L'URL DE L'IMAGE, IL A SUREMENT PAS ENCORE UPLOAD
	bucket: 'gs://bimbadaboum-2e847.appspot.com',
    remoteFullPath: '/uploads/images/' + userMail + '/profilPics' + '/FriDec01201716:30:49GMT+0100(CET)'
  }).then(
      function (url) {
        console.log("Remote URL: " + url);
        URL = url;
      },
      function (error) {
        console.log("Error: " + error);
      }
  );
}