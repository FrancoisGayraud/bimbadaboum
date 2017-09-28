var UserViewModel = require("../../shared/view-models/user-view-model");
var dialogsModule = require("ui/dialogs");
var user = new UserViewModel({
    email : "name@domain.com",
    password : "password",
});

var Border = require ("tns-core-modules/ui/border");
var frameModule = require("ui/frame");
var page;
var email;

exports.loaded = function(args) {
    page = args.object;
    page.bindingContext = user;
    user.init();
}

exports.signIn = function() {
    user.login()
    frameModule.topmost().navigate("views/login/login");
};

exports.register = function() {
    var topmost = frameModule.topmost();
    topmost.navigate("views/register/register");
}
