/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/

/*
NativeScript adheres to the CommonJS specification for dealing with
JavaScript modules. The CommonJS require() function is how you import
JavaScript modules defined in other files.
*/
var frameModule = require("ui/frame");
var HomeViewModel = require("./home-view-model");
var fs = require("file-system");
var loki = require("./node_module/lokijs/src/lokijs.js");

// Setup Loki
var path = fs.path.join(fs.knownFolders.currentApp().path, "database.db");
var db = new Loki(path, {
    adapter: new LokiNativeScriptAdapter()
});

// Save some movies
var movies = db.addCollection("movies");
movies.insert({ title: "Ghost Busters", year: 1984 });
movies.insert({ title: "Ghost Busters II", year: 1989 });
movies.insert({ title: "Ghost Busters", year: 2016 });
console.log(movies.data);
db.saveDatabase();

// Load and find some movies
db.loadDatabase({}, function() {
    var movies = db.getCollection("movies");
    console.log(movies.find({ title: "Ghost Busters" }));
});

var homeViewModel = new HomeViewModel();

function onNavigatingTo(args) {
    /*
    This gets a reference this page’s <Page> UI component. You can
    view the API reference of the Page to see what’s available at
    https://docs.nativescript.org/api-reference/classes/_ui_page_.page.html
    */
    var page = args.object;

    /*
    A page’s bindingContext is an object that should be used to perform
    data binding between XML markup and JavaScript code. Properties
    on the bindingContext can be accessed using the {{ }} syntax in XML.
    In this example, the {{ message }} and {{ onTap }} bindings are resolved
    against the object returned by createViewModel().

    You can learn more about data binding in NativeScript at
    https://docs.nativescript.org/core-concepts/data-binding.
    */
    page.bindingContext = homeViewModel;
}

/*
Exporting a function in a NativeScript code-behind file makes it accessible
to the file’s corresponding XML file. In this case, exporting the onNavigatingTo
function here makes the navigatingTo="onNavigatingTo" binding in this page’s XML
file work.
*/
exports.onNavigatingTo = onNavigatingTo;
