var dialogsModule = require("ui/dialogs");
var frameModule = require("ui/frame");
var UserViewModel = require("../../shared/view-models/user-view-model");
var user = new UserViewModel();

exports.loaded = function(args) {
    var page = args.object;
    page.bindingContext = user;
};

exports.register = function() {
    user.register()
        .then(function() {
	    dialogsModule.alert({
	    	message: "Votre compte a bien été enregistré.",
	    	okButtonText: "ok"
	    })
	        .then(function() {
		    frameModule.topmost().navigate("views/login/login");
		});
	}).catch(function(error) {
	    dialogsModule.alert({
			message: "Vos informations sont incorrectes. ",
			okButtonText: "ok"
	    });
	});
}
