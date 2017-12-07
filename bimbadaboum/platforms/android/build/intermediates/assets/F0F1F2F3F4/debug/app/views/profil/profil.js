var page;
var switchModule = require("tns-core-modules/ui/switch");
var firebase = require("nativescript-plugin-firebase");
var observableModule = require("data/observable");
var view = require("ui/core/view");
var dropDown = require("nativescript-drop-down");
var observableArray = require("data/observable-array");
var viewModel = new observableModule.Observable;
var gender = 0;

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