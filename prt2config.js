// prt2config
// actively manages the Config class based on the parts found in prt files.
// the Config 

// PACKAGE IMPORTS
const Template = require("./template.js");
const fs = require("fs");
const fetch = require("node-fetch");

let partImports = {
	
};

// the config template, manages all part imports and definitions
const configTemplate = new Template("./java/templates/Config.template");

// load all imports from PART_IMPORTS.dat (called when the module is loaded, and that's it)
function loadImports(){
	// load file
	fs.readFile("./parts/PART_IMPORTS.dat", {}, (err, data) => {
		if(err){
			console.error(err);
			return;
		}
		
		// split by newlines
		data = data.toString();
		let lines = data.split("\n");
		
		// loop through each line for imports
		for(let i = 0; i < lines.length; i++){
			let line = lines[i];
			
			// if line starts with a hashtag, ignore
			if(line.charAt(0) == '#') continue;
			
			// otherwise split line by spaces and add to partImports
			line = line.split(" ");
			
			partImports[line[0]] = line[1];
		}
	});
}

// find the necessary import(s?) for a part type (class)
function getImports(classname){
	return partImports[classname];
}

// load each part of a prt file
// format of returned array:
/*
[
	{ type: "Type", name: "nameInConfig" }
]
*/
function loadPartFile(path){
	// load the contents of the part file
	let contents = fs.readFileSync(path).toString();
	
	// split contents by newlines
	let lines = contents.split("\n");
	
	let parts = [];
	
	// for each line, load a new part if applicable
	for(let i = 0; i < lines.length; i++){
		let line = lines[i];
		
		// line starts with #?  ignore
		if(line.charAt(0) == '#') continue;
		
		// line empty?  ignore
		if(line.length == 0) continue;
		
		// separate line by any whitespace
		let words = line.match(/\S+/g);
		
		// more or less than 2 words? ignore
		if(!words || words.length != 2) continue;
		
		// add new imports
		let im = getImports(words[0]) + "\n";
		
		configTemplate.addToTag("imports", im);
	}
	
	console.log(configTemplate.writeOutput());
}

// loads parts into config from prt files
// the config template is permanently cached by this file and can be updated at any time for use in exporting
function prt2config(prtFilePath){
	// part imports
	let partImports = "";
	
	// part declarations
	let partDeclarations = "";
	
	// part definitions
	let partDefinitions = "";
	
	// load part file
	loadPartFile(prtFilePath);
}

// MAIN
loadImports();

module.exports = prt2config;