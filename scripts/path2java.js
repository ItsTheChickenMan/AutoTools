// path2java
// converts a path produced by the client GUI into java source code
// AKA the meat and potatoes of the project (I guess the GUI is the real cool part but whatever)

// PACKAGE IMPORTS
const Template = require("./template.js");
const fs = require("fs");

// string appended to end of generated auto
const eofString = "\n\n/* Generated by AutoTools.  Do not remove this line, please :) */";

// various amounts of tabbing
// FIXME: this is dumb
const TABBING = ["", "\t", "\t\t", "\t\t\t", "\t\t\t\t"];

// default movement action used to move between nodes
const defaultMovementAction = "goTo";

// format global variables into a string of class properties
// NOTE: currently shouldn't be used
function formatGlobalVars(globalVars){
	// global var string (output of function)
	let globalString = "";
	
	// loop through each global variables
	for(let globalVar of globalVars){
		// definition line of this variable
		// NOTE: all definitions are public so that they are accessible by all action indexes
		let definition = "\n\tpublic " + globalVar.type + " " + globalVar.name;
		
		// add initial value, if it has one
		if(globalVar.value.length > 0){
			definition += " = " + globalVar.value;
		}
		
		// semicolon + newline
		definition += ";";
		
		// add definition to globalString
		globalString += definition;
	}
	
	return globalString;
}

// capitalize the first letter in a string
function capitalizeFirstLetter(string){
	return string.charAt(0).toUpperCase() + string.substring(1);
}

// converts a node path into java
// the nodepath provided is what will be converted
// it will write all necessary files into the path provided by outpath
// the name of the auto itself will be the parameter name
// actionIndexes is all actionIndexes in use by the auto
// configTemplate is the template where config info is currently stored
// globalVariableManager is the global variable manager; a table indexed by file paths
// teamName is the name of the team to use in copyright statements
function path2java(nodepath, outpath, name, actionIndexes, configTemplate, globalVariableManager, teamName){
	// clear outpath entirely before progressing
	fs.rmSync(outpath, {force: true, recursive: true});
	
	// capitalize first letter of name
	name = capitalizeFirstLetter(name);
	
	// compile action indexes
	// TODO: sort action indexes
	
	// load templates
	let autoTemplate = new Template("./java/templates/Auto.template");
	
	// make action index directory
	let actionsIndexOutpath = outpath + "actions/";
		
	fs.mkdir(actionsIndexOutpath, {recursive: true}, err => {
		if(err){
			console.error("Couldn't make output directory for actions");
			return;
		}
		
		// first write out config file
		let configString = configTemplate.writeOutput();
		
		fs.writeFile(actionsIndexOutpath + "Config.java", configString, err => {
			if(err) console.error("Couldn't create Config.java");
			return;
		});
		
		// loop through each index replacing the superclass template block with the appropriate superclass and writing to outpath
		for(let i = 0; i < actionIndexes.length; i++){
			let a = actionIndexes[i];
			
			// load action index into a template
			let actionIndexTemplate = new Template(a.path);
			let superIndexString = i == 0 ? "Config" : actionIndexes[i-1].classname;
			
			// add superclass 
			if(a.superclassname.includes("superclass")) actionIndexTemplate.replaceTag("superclass", superIndexString);
			
			// add globals
			let globals = globalVariableManager[a.path];
			let globalString = formatGlobalVars(globals);
			
			actionIndexTemplate.replaceTag("globals", globalString);
			
			// write actionIndex to outpath
			let actionIndexString = actionIndexTemplate.writeOutput("");
			
			fs.writeFile(actionsIndexOutpath + a.classname + ".java", actionIndexString, err => {
				if(err) console.error("Couldn't create actionIndex " + a.name);
				return;
			});
		}
	});
	
	// figure out what year it is
	let year = new Date().getFullYear();
	
	// throw year and team name into copyright notice
	configTemplate.replaceTag("year", year);
	configTemplate.replaceTag("teamName", teamName);
	
	autoTemplate.replaceTag("year", year);
	autoTemplate.replaceTag("teamName", teamName);
	
	// replace auto name with name
	autoTemplate.replaceTag("name", name);
	
	// for now, the last action index in the list is the one that the auto inherits
	autoTemplate.replaceTag("actionIndex", actionIndexes[actionIndexes.length-1].classname);
	
	// INITONCE
	let tab = 2; // number of tabs to indent each line, changes depending on block
	
	let initOnce = "setPosition(" + nodepath.nodes[0].position[0] + ", " + nodepath.nodes[0].position[1] + "); // set initial position of bot";;
	
	autoTemplate.replaceTag("initOnce", initOnce);
	
	// INIT
	tab = 3;
	let init = "telemetry.addData(\"Status\", \"Initialized\");\n" + TABBING[tab] + "telemetry.update();";
	
	autoTemplate.replaceTag("init", init);
	
	// MAIN
	tab = 2;
	let main = "\n";
	
	// loop through nodes and add lines for each action
	for(let i = 0; i < nodepath.nodes.length; i++){
		let node = nodepath.nodes[i];
		
		// add a comment
		main += TABBING[tab] + "// node " + (i+1) + "\n";
		
		// push the movement node to node.actions
		if(i < nodepath.nodes.length-1){
			let nextNode = nodepath.nodes[i+1];
			
			node.actions.push(["goTo", {x: nextNode.position[0], y: nextNode.position[1]}]);
		}
		
		// add any node actions
		for(let j = 0; j < node.actions.length; j++){
			let action = node.actions[j];
			let actionName = action[0];
			let parameters = action[1];
			
			// format into line of java
			let line = actionName + "(";
			let comment = " //"; // comment which follows the line to document the parameters
			
			for(let p in parameters){
				line += parameters[p] + ", ";
				comment += p + "=" + parameters[p] + ", ";
			}
			
			// remove extra comma
			line = line.slice(0, -2);
			comment = comment.slice(0, -2);
			
			line += ");"
			
			// add comment to line
			line += comment;
			
			// insert line into main
			main += TABBING[tab] + line + "\n";
		}
		
		main += "\n";
	}
	
	autoTemplate.replaceTag("main", main);
	
	// FINAL
	tab = 3;
	let _final = "telemetry.addData(\"Status\", \"Done\");\n" + TABBING[tab] + "telemetry.update();";
	
	autoTemplate.replaceTag("final", _final);
	
	// asynchronously write auto file to output
	let autoFile = autoTemplate.writeOutput(eofString);
	
	fs.mkdir(outpath, {recursive: true}, err => {
		if(err){
			console.error("couldn't create directory for output files");
			return;
		}
		
		// write auto file to out
		fs.writeFileSync(outpath + name + ".java", autoFile);
	});
}

module.exports = path2java;