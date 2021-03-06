var page;
var switchModule = require("tns-core-modules/ui/switch");
var firebase = require("nativescript-plugin-firebase");
var observableModule = require("data/observable");
var view = require("ui/core/view");
var dropDown = require("nativescript-drop-down");
var gender = 0;
var frameModule = require("ui/frame");
var view = require("ui/core/view");
var camera = require("nativescript-camera");
var imageModule = require("ui/image");
var fs = require("file-system");

var observableArray = require("data/observable-array");

var viewModel = new observableModule.Observable;

var observable = require('data/observable');

var imagepicker = require("nativescript-imagepicker");
var dialogs = require("ui/dialogs");
var context = imagepicker.create({ mode: "single" }); // use "multiple" for multiple selection
var appPath = fs.knownFolders.currentApp().path;
var profilPic;
var LoadingIndicator = require("nativescript-loading-indicator").LoadingIndicator;
var loader = new LoadingIndicator();
var options = {
  message: 'Nous y sommes presque...',
  progress: 0.65,
  android: {
    indeterminate: true,
    cancelable: true,
    cancelListener: function(dialog) { console.log("Loading cancelled") },
    max: 100,
    progressNumberFormat: "%1d/%2d",
    progressPercentFormat: 0.53,
    progressStyle: 2,
    secondaryProgress: 1
  }
};
var matchLoader = new LoadingIndicator();
var optionsMatch = {
  message: 'Recherche...',
  progress: 0.65,
  android: {
    indeterminate: true,
    cancelable: true,
    cancelListener: function(dialog) { console.log("Loading cancelled") },
    max: 100,
    progressNumberFormat: "%1d/%2d",
    progressPercentFormat: 0.53,
    progressStyle: 2,
    secondaryProgress: 1
  }

};



exports.loaded = function (args) {
	loader.show(options);
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
          profilPic = result.value[userID].picsUrl;
          viewModel.set("profilPic", profilPic);
          viewModel.set("firstName", result.value[userID].firstName);
          viewModel.set("lastName", result.value[userID].lastName);
          viewModel.set("city", result.value[userID].city);
          page.bindingContext = viewModel;
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
        }).then(function() {
          if (page.bindingContext)
          loader.hide();
        });
      })
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



	firebase.update(
		'/users/' + userID,
		{
		'searchMale': gen,
		'city': city.text}
	).then(function() {
    dialogs.alert({
      title: "",
      message: "Informations enregistrées !",
      okButtonText: "Ok"
    }).then(function () {
      console.log("Dialog closed!");
    });
  })
}

exports.selectImage = function () {
  var date = new Date();
  date = date.toString().replace(/\s+/g, '');
  var URL;

  context.authorize()
  .then(function() {
    return context.present();
  }).then(function(selection) {
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
        }).then(
        function() {
          firebase.getDownloadUrl({
            bucket: 'gs://bimbadaboum-2e847.appspot.com/',
            remoteFullPath: 'uploads/images/' + userMail + '/profilPics/' + date
          }).then(
            function (url) {
              console.log("Remote URL: " + url);
              URL = url.toString();
              profilPic = URL;
              viewModel.set("profilPic", profilPic);
              page.bindingContext = viewModel;
              console.log("URL : " + URL);
            },
            function (error) {
              console.log("Error: " + error);
            }).then(
            function () {
              firebase.update(
                '/users/' + userID,
                {'picsUrl' : URL}
              );
            });
          })
        });
      });
}

exports.editPhoto = function () 
{
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

function navigatingTo(args) {
  var page = args.object;
  var items = new observableArray.ObservableArray();
  items.push({ imageUrl: "https://www.google.fr/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&cad=rja&uact=8&ved=2ahUKEwjlq4Cu7O7bAhUB1xQKHd7oADYQjRx6BAgBEAU&url=https%3A%2F%2Fwww.pexels.com%2Fsearch%2Frose%2F&psig=AOvVaw2ZkZFKR-H8VS4A1Ea8k7rt&ust=1530017196231879" });
  items.push({ imageUrl: "https://firebasestorage.googleapis.com/v0/b/bimbadaboum-2e847.appspot.com/o/uploads%2Fimages%2Fmonpetitloup%40larelance.fr%2FprofilPics%2FThuJun21201814%3A18%3A51GMT%2B0000(GMT)?alt=media&token=7ed16f60-b4ac-4796-8a59-40318e185dc6" });
  items.push({ imageUrl: "http://something.com/picture3.jpg" });
  items.push({ imageUrl: "http://something.com/picture4.jpg" });
  items.push({ imageUrl: "http://something.com/picture5.jpg" });
  viewModel = new observableModule.Observable();
  viewModel.set("items", items);
  viewModel.set("pageNumber", 3);
  page.bindingContext = viewModel;
}
exports.navigatingTo = navigatingTo;
function pageChanged(e) {
  console.log("Page changed to " + e.page + ".");
}
exports.pageChanged = pageChanged;


