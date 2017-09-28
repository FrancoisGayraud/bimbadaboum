/*
In NativeScript, the app.js file is the entry point to your application.
You can use this file to perform app-level initialization, but the primary
purpose of the file is to pass control to the app’s first module.
*/

require("./bundle-config");
var application = require("application");
var firebase = require("nativescript-plugin-firebase");

firebase.init({
}).then(
    function (instance) {
	console.log("firebase.init done");
    },
    function (error) {
	console.log("firebase.init error: " + error);
    }
);

application.start({ moduleName: "views/login/login" });
