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

// all directories
const directories = {
	// root directory of client files
	clientDir: "./client/",
	
	get clientRootDir(){
		return path.join(__dirname, this.clientDir);
	},
	
	get staticDir(){
		return path.join(this.clientRootDir, "static");
	},
	
	// directory for action indexes
	javaActionIndexDir: "./java/actions/",
	
	// directory for java source output
	javaOutDir: "./java/out/",
	
	// directory for parts
	partFileDir: "./parts/",
	
	// directory where saves go
	savesDir: "./saves/"
};

// express application
const app = express();

// NON STATIC GLOBAL VARS

// port for the client window, see settings.txt to change
let port = 8080;

// all loaded action indexes
let actionIndexes = [];
let availableMethods = [];

// team name
let teamName = "(No Team Specified)";

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
loadActionIndex(path.join(directories.javaActionIndexDir + "MecanumDefaultActionIndex.java"));

// load default part file
let configTemplate = prt2config(path.join(directories.partFileDir, "defaultparts.prt"));

// SETTINGS

// parse settings
let settings = parseListFile("./settings.txt", '#', /\r?\n/, '=', "key-val");

// store settings into appropriate values
teamName = settings.teamName;
port = settings.port;
directories.javaActionIndexDir = settings.javaActionIndexDir;
directories.javaOutDir = settings.javaOutDir;
directories.partFileDir = settings.partFileDir;
directories.savesDir = settings.savesDir;

// EXPRESS SETUP (done last)

// set static directory (makes serving scripts/stylesheets/etc. easier)
app.use("/static", express.static(directories.staticDir));

// default path, responds with full client interface
app.get("/", (req, res) => {
	res.sendFile("index.html", {
		root: directories.clientRootDir
	});
});

// favicon
app.get("/favicon.ico", (req, res) => {
	res.sendFile("favicon.ico", {
		root: "./assets/images/"
	});
});

// return a list of all current available actions from ActionIndexs
app.get("/validActions", (req, res) => {
	// send available methods to user...that's it
	//res.send(JSON.stringify(availableMethods)).end();
	res.send(JSON.stringify(actionIndexes)).end();
});

// return all global variables
app.get("/globalVariables", (req, res) => {
	// send the globalVariableManager
	res.send(JSON.stringify(globalVariableManager)).end();
});

// return the directories object
app.get("/directories", (req, res) => {
	res.send(JSON.stringify(directories)).end();
});

app.use(express.json());

// post requests to export with the node path as the data will parse the path into a .java opmode and save it to the main directory 
app.post("/export", (req, res) => {
	// update global variables
	globalVariableManager = req.body.variables;
	
	// get only the action indexes we need
	let a = getRequiredActionIndexes(req.body.actionIndexNames);
	
	path2java(req.body, directories.javaOutDir + req.body.name + "/", req.body.name, a, configTemplate, globalVariableManager, teamName);
	
	// send back the folder the source is being exported into
	res.send(directories.javaOutDir).end();
});

// load a new action index from a file when instructed by the client
app.post("/newActionIndex", (req, res) => {
	let status = loadActionIndex(path.join(directories.javaActionIndexDir, req.body.name));
	
	// let the client know that it's taken care of
	res.send(status).end();
});

// load a new part file from a file when instructed by the client
app.post("/newPartFile", (req, res) => {
	configTemplate = prt2config(path.join(directories.partFileDir, req.body.name));
	
	// let the client know that it's taken care of
	res.send("Done").end();
});

// save the user's path
app.post("/save", (req, res) => {
	savePath(req.body)
	.then(dir => {
		res.send("Saved to " + dir).end();
	})
	.catch(console.error)
});

app.post("/getSave", (req, res) => {
	let savePath = path.join(directories.savesDir, req.body.name);
	
	fs.readFile(savePath, {}, (err, data) => {
		if(err){
			console.error(err);
			return;
		}
		
		res.send(data).end();
	});
});

// start listening
app.listen(port, function(){
	console.log("Server is listening, interface is available at localhost:" + port);
});

// UTILS

// load an action index from path and returns a string representing the status
function loadActionIndex(_path){
	// check if action index has already been loaded
	if(actionIndexLoaded(_path)){
		return "Action index already loaded";
	}
	
	// load file
	let file = fs.readFileSync(_path).toString();
	
	// get all methods
	let methods = javautils.getClassMethods(file, ["protected", "private"]); // ignore protected or private methods
	
	let cni = javautils.getClassNameAndInheritance(file);
	
	let index = {
		classname: cni[0],
		superclassname: cni[1],
		path: _path,
		methods: methods
	};
	
	// push to action indexes
	actionIndexes.push(index);
	availableMethods.push(...methods);
	
	// load global variables
	let variables = javautils.getClassProperties(file, ["protected", "private"]); // ignore protected or private methods
	
	globalVariableManager[_path] = variables;
	
	return "Done";
}

async function savePath(_path){
	// start by creating a new directory if it doesn't exist
	if(!fs.existsSync(directories.savesDir)){
		fs.mkdirSync(directories.savesDir);
	}
	
	let name = _path.name;
	
	_path = JSON.stringify(_path);
	
	// then save the path to a json file
	fs.writeFileSync(path.join(directories.savesDir, name + ".json"), _path);
	
	return directories.savesDir;
}

function actionIndexLoaded(_path){
	// loop through each action index and check for path
	return actionIndexes.some(actionIndex => actionIndex.path == _path);
}

function getRequiredActionIndexes(actionIndexNames){
	return actionIndexes.filter(actionIndex => actionIndexNames.includes(actionIndex.classname));
}