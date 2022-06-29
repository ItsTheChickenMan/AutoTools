// prt2config
// actively manages the Config class based on the parts found in prt files.
// the Config 

// PACKAGE IMPORTS
const Template = require("./template.js");
const fs = require("fs");

// the config template, manages all part imports and definitions
const configTemplate = new Template("./java/templates/Config.template");

// load each part of a prt file
// format of returned array:
/*
[
	{ type: "Type", name: "nameInConfig" }
]
*/
function loadPartFile(path){
	// load the contents of the part file
	let contents = fs.readFileSync(path);
	
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
		if(words.length != 2) continue;
		
		// 
	}
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
	
	// load prt file
}

module.exports = prt2config;