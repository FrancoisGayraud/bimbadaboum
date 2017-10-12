var UserViewModel = require("../../shared/view-models/user-view-model");
var dialogsModule = require("ui/dialogs");
var user = new UserViewModel({
    email : "epitech@epitech.eu",
    password : "epitech",
});

var frameModule = require("ui/frame");
var page;
var email;

exports.loaded = function(args) {
    page = args.object;
    page.bindingContext = user;
    user.init();
};

exports.signIn = function() {
    user.login()
    frameModule.topmost().navigate("views/home/home");
};

exports.register = function() {
    var topmost = frameModule.topmost();
    topmost.navigate("views/register/register");
};