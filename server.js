// server-side code for AutoTools, mainly manages communication between client interface and the server.
// if you are wondering why I chose this awkward setup, it's mostly because html is the only front end language I somewhat know how to use (or at least know enough to set up a quick front end for the application).  It is therefore required that the server be run using nodejs (command = node server.js), and the client opened through a web browser by navigating to localhost:port (port 8080 by default).  Sorry for the inconvenience, if I ever have the time I'll rewrite this in C.  At least with this setup there's no cross-compatibility issues, right?

// PACKAGE IMPORTS
const express = require("express"); // express for hosting
const path = require("path");

// GLOBAL VARS (generally static variables)

// port for the client window, 8080 by default for now.
const port = 8080;

// root directory of client files
const clientDir = "./client/";
const clientRootDir = path.join(__dirname, clientDir);
const staticDir = path.join(clientRootDir, "static");

// express application
const app = express();

// EXPRESS SETUP

// set static directory (makes serving scripts/stylesheets/etc. easier)
app.use("/static", express.static(staticDir));

// default path, responds with full client interface
app.get("/", (req, res) => {
	res.sendFile("index.html", {
		root: clientRootDir
	});
});

app.use(express.json());

// post requests to export with the node path as the data will parse the path into a .java opmode and save it to the main directory 
app.post("/export/", (req, res) => {
	console.log(req.body);
	
	res.status(200).send("You did it").end();
});

// start listening
app.listen(port, function(){
	console.log("Server is listening, interface is available at localhost:" + port);
});
