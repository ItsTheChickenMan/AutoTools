// server-side code for AutoTools, mainly manages communication between client interface and the server.
// if you are wondering why I chose this awkward setup, it's mostly because html is the only front end language I somewhat know how to use (or at least know enough to set up a quick front end for the application).  It is therefore required that the server be run using nodejs (command = node server.js), and the client opened through a web browser by navigating to localhost:port (port 8080 by default).  Sorry for the inconvenience, if I ever have the time I'll rewrite this in C.  At least with this setup there's no cross-compatibility issues, right?

// PACKAGE IMPORTS
const express = require("express"); // express for hosting
const path = require("path");
const fs = require("fs");
const Template = require("./scripts/template.js");
const javautils = require("./scripts/javautils.js");
const path2java = require("./scripts/path2java.js");
const prt2config = require("./scripts/prt2config.js");
const parseListFile = require("./scripts/parseListFile.js");

// STATIC GLOBAL VARS

// port for the client window, 8080 by default for now.
let port = 8080;

// root directory of client files
const clientDir = "./client/";
const clientRootDir = path.join(__dirname, clientDir);
const staticDir = path.join(clientRootDir, "static");

// express application
const app = express();

// NON STATIC GLOBAL VARS

// java dirs //
// directory for java source output
let javaOutDir = "./java/out/";

// directory for action indexes
// TODO: allow user to change (can't ATM because the server has no way of communicating the directory to the client)
let javaActionIndexDir = "./java/actions/";

// directory for parts
let partFileDir = "./parts/";

// all loaded action indexes
let actionIndexes = [];
let availableMethods = [];

/**
	*	@brief Handles global variables for a path, although it's not necessarily specific to any particular path
	*
	*	Global variables are variables stored in Config.java which can be accessed and modified at any point during the auto by any node.  They can be used as parameters to node actions, modified as a node action, or used within a node action in code.
	*	
	*	The global variable interface is mainly to manage global variables already defined in an action index for use within that action index as a "set and forget" value (mainly just settings)
	*	
	*	Creating and managing global variables:
	*	- Global variables can only be created in action indexes, as properties of the class in the public scope.
	*	- Global variables will be loaded any time an action index is loaded
	*	-	The value of global variables can be changed within the GUI but not during the autonomous itself(?)
	*	-	The global variable can be used for any parameter of an action index
	*
	*	@todo Have any parsed action indexes also keep track of any attributes which they define and check for naming conflicts whenever global variables are created.
*/
let globalVariableManager = {};

// PATH TO JAVA SETUP

// load default action index
loadActionIndex(javaActionIndexDir + "MecanumDefaultActionIndex.java");

// load default part file
let configTemplate = prt2config("./parts/defaultparts.prt");

// SETTINGS

// parse settings
let settings = parseListFile("./settings.txt", '#', /\r?\n/, '=', "key-val");

// store settings into appropriate values
let teamName = settings.teamName || "No Team Specified";
port = settings.port;
javaOutDir = settings.javaOutDir;


// EXPRESS SETUP (done last)

// set static directory (makes serving scripts/stylesheets/etc. easier)
app.use("/static", express.static(staticDir));

// default path, responds with full client interface
app.get("/", (req, res) => {
	res.sendFile("index.html", {
		root: clientRootDir
	});
});

// return a list of all current available actions from ActionIndexs
app.get("/validActions", (req, res) => {
	// send available methods to user...that's it
	res.send(JSON.stringify(availableMethods)).end();
});

app.get("/globalVariables", (req, res) => {
	console.log(globalVariableManager);
	
	// send the globalVariableManager
	res.send(JSON.stringify(globalVariableManager)).end();
});

app.use(express.json());

// post requests to export with the node path as the data will parse the path into a .java opmode and save it to the main directory 
app.post("/export", (req, res) => {
	// update global variables
	globalVariableManager = req.body.variables;
	
	path2java(req.body, javaOutDir + req.body.name + "/", req.body.name, actionIndexes, configTemplate, globalVariableManager, teamName);
	
	// send back the folder the source is being exported into
	res.send(javaOutDir).end();
});

// load a new action index from a file when instructed by the client
app.post("/newActionIndex", (req, res) => {
	loadActionIndex(javaActionIndexDir + req.body.name);
	
	// let the client know that it's taken care of
	res.send("Done").end();
});

// load a new part file from a file when instructed by the client
app.post("/newPartFile", (req, res) => {
	configTemplate = prt2config(partFileDir + req.body.name);
	
	// let the client know that it's taken care of
	res.send("Done").end();
});

// create a new global variable
// FIXME: delete or repurpose this
// NOTE: i'm changing the global variable system, so this isn't important anymore, don't use it
app.post("/pleaseMakeANewGlobalVariable", (req, res) => {
	globalVariableManager.push(req.body);
	
	res.send("ok, no problem").end();
});

// start listening
app.listen(port, function(){
	console.log("Server is listening, interface is available at localhost:" + port);
});

// UTILS

// update the values of global variables
function updateGlobalVariables(globalVariables){
	
}

// load an action index from path 
function loadActionIndex(path){
	// load file
	let file = fs.readFileSync(path).toString();
	
	// get all methods
	let methods = javautils.getClassMethods(file, ["protected", "private"]); // ignore protected or private methods
	
	let cni = javautils.getClassNameAndInheritance(file);
	
	let index = {
		classname: cni[0],
		superclassname: cni[1],
		path: path,
		methods: methods
	};
	
	// push to action indexes
	actionIndexes.push(index);
	availableMethods.push(...methods);
	
	// load global variables
	let variables = javautils.getClassProperties(file, ["protected", "private"]); // ignore protected or private methods
	
	globalVariableManager[path] = variables;
}