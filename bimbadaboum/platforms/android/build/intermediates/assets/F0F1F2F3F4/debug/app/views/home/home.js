var UserViewModel = require("../../shared/view-models/user-view-model");
var firebase = require("nativescript-plugin-firebase");
var frameModule = require("ui/frame");
var user = new UserViewModel();
var view = require("ui/core/view");
var camera = require("nativescript-camera");
var imageModule = require("ui/image");
var fs = require("file-system");
var observable = require('data/observable');
var imagepicker = require("nativescript-imagepicker");
var context = imagepicker.create({ mode: "single" }); // use "multiple" for multiple selection
var appPath = fs.knownFolders.currentApp().path;
var page;
var viewModel = new observable.Observable();
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
          viewModel.set("name", result.value[userID].firstName);
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

}

exports.logout = function () {
  user.logout();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function matchWithSomeone(result) {

}

exports.searchMatch = async function () {
  var find = false;
  firebase.update("/users/" + userID,
  {
    'searching' : true
  });
  loader.show(optionsMatch);
  while (!find)
  {
    var onQueryEvent = function(result) {
      if (!result.error) {
        console.log(JSON.stringify(result))
        if (result.value[userID].searching == false) {
          loader.hide();
          frameModule.topmost().navigate("views/chat/chat");
        }
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
      console.log("LOOPING");
      await sleep(4000);
    }
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

exports.editProfil = function () {
  frameModule.topmost().navigate("views/profil/profil");
}
