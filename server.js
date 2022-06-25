// server-side code for AutoTools, mainly manages communication between client interface and the server.
// if you are wondering why I chose this awkward setup, it's mostly because html is the only front end language I somewhat know how to use (or at least know enough to set up a quick front end for the application).  It is therefore required that the server be run using nodejs (command = node server.js), and the client opened through a web browser by navigating to localhost:port (port 8080 by default).  Sorry for the inconvenience, if I ever have the time I'll rewrite this in C.  At least with this setup there's no cross-compatibility issues, right?

// PACKAGE IMPORTS
const express = require("express"); // express for hosting
const path = require("path");
const fs = require("fs");
const Template = require("./template.js");
const javautils = require("./javautils.js");

// STATIC GLOBAL VARS

// port for the client window, 8080 by default for now.
const port = 8080;

// root directory of client files
const clientDir = "./client/";
const clientRootDir = path.join(__dirname, clientDir);
const staticDir = path.join(clientRootDir, "static");

// root directory of java source output
const javaOutDir = "./java/";

// express application
const app = express();

// NON STATIC GLOBAL VARS

// all loaded action indexes
let actionIndexes = [];

// PATH TO JAVA SETUP
loadActionIndex("./java/actions/DefaultActionIndex.java");

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
	res.send(JSON.stringify(actionIndexes)).end();
});

app.use(express.json());

// post requests to export with the node path as the data will parse the path into a .java opmode and save it to the main directory 
app.post("/export", (req, res) => {
	console.log(req.body);
	
	// send back the folder the source is being exported into
	res.send(javaOutDir).end();
});

// load a new action index from a file when instructed by the client
app.post("/newActionIndex", (req, res) => {
	
});

// start listening
app.listen(port, function(){
	console.log("Server is listening, interface is available at localhost:" + port);
});

// UTILS

// load an action index from path 
function loadActionIndex(path){
	// load file
	let file = fs.readFileSync(path).toString();
	
	// get all methods
	let methods = javautils.getJavaMethods(file);
	
	// push to action indexes
	actionIndexes.push(...methods);
}
