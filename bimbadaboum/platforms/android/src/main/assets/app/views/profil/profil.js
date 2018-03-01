var page;
var switchModule = require("tns-core-modules/ui/switch");
var firebase = require("nativescript-plugin-firebase");
var observableModule = require("data/observable");
var view = require("ui/core/view");
var dropDown = require("nativescript-drop-down");
var observableArray = require("data/observable-array");
var viewModel = new observableModule.Observable;
var gender = 0;
var view = require("ui/core/view");
var camera = require("nativescript-camera");
var imageModule = require("ui/image");
var fs = require("file-system");
var observable = require('data/observable');
var imagepicker = require("nativescript-imagepicker");
var context = imagepicker.create({ mode: "single" }); // use "multiple" for multiple selection
var appPath = fs.knownFolders.currentApp().path;

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
	var city = view.getViewById(page, "city");
	var gen;

	if (gender == 0)
	gen = true;
	else
	gen = false;

	console.log("values : " + firstName.text + " " + lastName.text + " " + city.text);

	firebase.update(
		'/users/' + userID,
		{'firstName': firstName.text,
		'lastName': lastName.text,
		'isMale': gen,
		'city': city.text}
	);
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
              URL = url.toString();
              console.log("URL : " + URL);
            },
            function (error) {
              console.log("Error: " + error);
            }
          ).then(
            function () {
              firebase.update(
                '/users/' + userID,
                {'picsUrl' : URL}
              );
            });
          })
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
