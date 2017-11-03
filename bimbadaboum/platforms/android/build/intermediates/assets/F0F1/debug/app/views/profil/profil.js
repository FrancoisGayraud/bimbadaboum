var page;
var switchModule = require("tns-core-modules/ui/switch");
var observableModule = require("data/observable");
var view = require("ui/core/view");
var switchData = new observableModule.Observable({
    ss: { // switchers status
        's1': false,
        's2': false,
    }
});

exports.loaded = function (args) {
	page = args.object;
	page.bindingContext = switchData;
}

exports.testswitch = function () {
	console.log(JSON.stringify(switchData));
	console.log("qsdfsqfsqfsqdf");
}