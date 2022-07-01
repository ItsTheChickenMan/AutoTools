// prt2config
// actively manages the Config class based on the parts found in prt files.
// the Config 

// PACKAGE IMPORTS
const Template = require("./template.js");
const fs = require("fs");
const fetch = require("node-fetch");

// the config template, manages all part imports and definitions
const configTemplate = new Template("./java/templates/Config.template");

// don't use this for anything yet
// TODO: fix this
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
			
			let classname = line.shift();
			
			partImports[classname] = line;
		}
	});
}

// TODO: make not dumb
// find the necessary import(s?) for a part type (class)
function getImports(classname){
	return ["com.qualcomm.robotcore.hardware." + classname];
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
	
	// parts
	let parts = [];
	
	for(let line of lines){
		// line starts with #?  ignore
		if(line.charAt(0) == '#') continue;
		
		// line empty?  ignore
		if(line.length == 0) continue;
		
		// separate line by any whitespace
		let words = line.match(/\S+/g);
		
		// more or less than 2 words? ignore
		if(!words || words.length != 2) continue;
		
		let part = {
			type: words[0],
			name: words[1]
		};
		
		parts.push(part);
	}
	
	return parts;
}

// loads parts into config from prt files
// the config template is permanently cached by this file and can be updated at any time for use in exporting
// returns the config templater
function prt2config(prtFilePath, outpath){
	// load part file
	let parts = loadPartFile(prtFilePath);
	
	// all types whose imports have been gotten (to avoid duplicate imports)
	let importedTypes = [];
	
	// initial newlines in some places for proper tabbing
	// TODO: automatic tabbing by template.js
	configTemplate.addToTag("declarations", "\n");
	configTemplate.addToTag("load", "\n");
	
	// for each part, add to config template as necessary
	for(let part of parts){
		// add imports
		if(!importedTypes.includes(part.type)){
			let imports = getImports(part.type);
			
			for(let i of imports){
				configTemplate.addToTag("imports", "import " + i + ";\n");
			}
			
			importedTypes.push(part.type);
		}
		
		// add to declarations
		let declaration = "\tprivate " + part.type + " " + part.name + ";\n";
		
		configTemplate.addToTag("declarations", declaration);
		
		// add to load method
		// NOTE: should type cast be here?  good for neatness but not totally necessary
		let load = "\t\t" + part.name + " = " + "(" + part.type + ")" + "hardwareMap.get(" + part.type + ".class, \"" + part.name + "\");\n";
		
		configTemplate.addToTag("load", load);
	}
	
	return configTemplate;
}

// MAIN
module.exports = prt2config;