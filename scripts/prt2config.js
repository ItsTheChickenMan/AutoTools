// prt2config
// actively manages the Config class based on the parts found in prt files.
// the Config 

// PACKAGE IMPORTS
const Template = require("./template.js");
const fs = require("fs");
const path = require("path");
const parseListFile = require("./parseListFile.js");

// GLOBALS //

// root dir
const rootDir = process.cwd();

// the config template, manages all part imports and definitions
const configTemplate = new Template(path.join(rootDir, "./java/templates/Config.template"));

// parseListFile constants
let parserCommentChar = '#';
let parserSeparator = /\r?\n/;
let parserSubSeparator = ' ';

// don't use this for anything yet
// FIXME: this would work if this whole module had the proper structure for it, and in the future should be used for special case imports
// load all imports from PART_IMPORTS.dat (called when the module is loaded, and that's it)
function loadImports(){
	// load file
	fs.readFile(path.join(rootDir, "./parts/PART_IMPORTS.dat"), {}, (err, data) => {
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

// FIXME: see loadImports FIXME
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
	// load contents as a list
	let list = parseListFile(path, parserCommentChar, parserSeparator, parserSubSeparator);
	
	// convert to parts
	let parts = [];
	
	for(let item of list){
		let part = {
			type: item[0],
			name: item[1]
		};
		
		parts.push(part);
	}
	
	return parts;
}

// loads parts into config from prt files
// the config template is permanently cached by this file and can be updated at any time for use in exporting
// returns the config template
function prt2config(prtFilePath){
	// load part file
	let parts = loadPartFile(prtFilePath);
	
	// all types whose imports have been gotten (to avoid duplicate imports)
	let importedTypes = [];
	
	// initial newlines in some places for proper tabbing + comments indicating which part file this is
	// TODO: automatic tabbing by template.js
	configTemplate.addToTag("declarations", "\n\t//" + prtFilePath + "\n");
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