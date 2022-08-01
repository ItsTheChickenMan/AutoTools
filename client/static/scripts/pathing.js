// manages all of the pathing interactions with the canvas

// only one path at a time (?)
let mainPath;

// all currently loaded action indexes
let loadedActionIndexes = {};

// all currently available methods
let loadedActions = [];

// MENUS

// context menu for a node right click
let nodeContextMenu = new Menu({
	itemNames: ["Log to Console (Dev)", "See Node Actions", "Insert Node Before", "Insert Node After", "Change Node Position", "Delete Node"],
	itemActions: [
		// log node to console for debugging information
		function(e, n){
			console.log(n);
		},
		// show all node actions
		function(e, n){
			// temporary fix for nodeActionMenu not showing up
			n.nodeActionMenu.suppressHide = true;
			
			n.nodeActionMenu.show(e.clientX, e.clientY, [n, mainPath]);
		},
		function(e, n){ // insert before
			// insert a new node before n and set mainPath's active node to it
			let newIndex = mainPath.nodes.indexOf(n);
			
			let newNode = new Node(mouseX, mouseY, n.bot);
			
			new Clickable(newNode, nodeContextMenu);
			
			mainPath.nodes.splice(newIndex, 0, newNode);
			mainPath.activeNode = newIndex;
		},
		function(e, n){ // insert after
			// insert a new node before n and set mainPath's active node to it
			let newIndex = mainPath.nodes.indexOf(n)+1;
			
			let newNode = new Node(mouseX, mouseY, n.bot);
			
			new Clickable(newNode, nodeContextMenu);
			
			mainPath.nodes.splice(newIndex, 0, newNode);
			mainPath.activeNode = newIndex;
		},
		function(e, n){ // change position
			mainPath.activeNode = mainPath.nodes.indexOf(n);
		},
		function(e, n){ // delete
			n.kill();
			
			mainPath.nodes.splice(mainPath.nodes.indexOf(n), 1);
		}
	]
});

// gets changed by the program as actions are loaded
let nodeActionListMenu = null; // leaving null for now to avoid confusion

let globalVariables = {};

// menu for showing global variables
let defaultGlobalListString = "(none)";

let globalListMenu = new Menu({
	itemNames: [defaultGlobalListString],
	itemActions: [
		// add a global variable
		/*
		function(e){	
			// create and show the prompt
			new Prompt({
				killOnHide: true,
				htmlContent: `
				<label for="global-name-input">Name:</label>
				<input id="global-name-input"></input><br>
				<label for="global-type-input">Type:</label><br>
				<input id="global-type-input"></input><br>
				<label for="global-initial-input">Initial Value:</label>
				<input id="global-initial-input"></input><br>
				<button id="global-done-button">Done</button>
				`,
				args: [this],
				js: function(globalListMenu){
					// TODO: this function could probably be neatened up a little
					
					// grab done button
					const doneButton = document.getElementById("global-done-button");
					
					// grab inputs
					const nameInput = document.getElementById("global-name-input");
					const typeInput = document.getElementById("global-type-input");
					const initialInput = document.getElementById("global-initial-input");
					
					// write global when done is clicked
					doneButton.addEventListener("click", e => {
						// if not all inputs are filled out, ignore input and quit
						if(nameInput.value.length <= 0 || typeInput.value.length <= 0){
							this.hide();
							return;
						};
						
						// check if global variable already exists
						if(globalVariables[nameInput.value]){
							// alert user that it already exists and return without closing prompt
							alert("the global " + nameInput.value + " already exists");
							return;
						}
						
						// create global variable
						let global = {
							name: nameInput.value,
							type: typeInput.value,
							value: initialInput.value
						};
						
						// politely ask server to create new global
						fetch("/pleaseMakeANewGlobalVariable", {
							method: "POST",
							headers: new Headers({'Content-Type': 'application/json'}),
							body: JSON.stringify(global)
						})
						.then(res => {
							// add global var to client's menu list
							globalListMenu.addItems([global.name], [
								function(){
									// prevent menu from being hidden when this button is clicked (primarily just to prevent user frustration)
									this.suppressHide = true;
								}
							]);
							
							// add global var to array
							globalVariables[global.name] = global;
						})
						.catch(alert); // FIXME: some better error/state reporting system than an irritating alert
						
						this.hide();
					});
				}
			}).show(e.clientX, e.clientY);
		}
		*/
	],
});


// CLASSES

// BOT CLASS
class Bot {
	/**
		*	@brief Constructs a new bot from options
		*
		*	options: {
		*		width: int, // width of bot, in inches
		*		length: int, // length of bot, in inches
		*		scale: p5.Vector, // scale of field, in pixels/inch
		*	}
	*/
	constructor(options){
		options = options || {};
		
		this.fieldScale = options.scale;
		this.diagonalFieldScale = Math.sqrt(options.scale.x*options.scale.x + options.scale.y*options.scale.y);
		
		this.diagonalLength = 0;
		this.diagonalPixelLength = 0;
		this.ia = 0;
		
		this.setWidth(options.width || 18);
		this.setLength(options.length || 18);
	}
	
	setWidth(w){
		this.width = w;
		this.pixelWidth = this.width * this.fieldScale.x;
		
		this.updateDrawValues();
	}
	
	setLength(l){
		this.length = l;
		this.pixelLength = this.length * this.fieldScale.y;
		
		this.updateDrawValues();
	}
	
	updateDrawValues(){
		this.diagonalLength = Math.sqrt((this.width/2)*(this.width/2) + (this.length/2)*(this.length/2));
		this.diagonalPixelLength = this.diagonalLength*this.diagonalFieldScale;
		
		this.ia = Math.atan(this.width/this.length);
	}
	
	draw(x, y, r){
		// TODO: make this work
		/*
		// constrain r
		r = r % Math.PI;
		
		// get pixel offset
		let wo1 = Math.sin(this.ia+r)*this.diagonalPixelLength;
		let wo2 = Math.sin(r-this.ia)*this.diagonalPixelLength;
		
		let ho1 = Math.cos(r-this.ia)*this.diagonalPixelLength;
		let ho2 = Math.cos(180-r-this.ia)*this.diagonalPixelLength;
		
		let wo = Math.max(wo1, wo2);
		let ho = Math.max(ho1, ho2);
		
		console.log(this.ia);
		
		// constrain coordinates
		x = Math.min(Math.max(x, wo), width - wo);
		y = Math.min(Math.max(y, ho), height - ho);
		*/
		
		// save draw state
		push();
		
		stroke(0);
		noFill();
		
		// translate/rotate
		translate(x, y);
		rotate(r || 0);
		
		rect(-this.pixelWidth/2, -this.pixelLength/2, this.pixelWidth, this.pixelLength);
		
		// return draw state
		pop();
	}
}

// NODE CLASS
// TODO: fix some bug where nodes will become broken "randomly", possibly due to clickables being active while nodes are being placed
class Node {
	NODE_SIZE = 15;
	NODE_COLOR = "rgba(50, 168, 82, 255)";
	NEW_ACTION_TEXT = "(add new node action)";
	
	// construct a new node
	constructor(x, y, bot){
		this.nodeColor = color(this.NODE_COLOR);
		
		this.x = x || mouseX;
		this.y = y || mouseY;
		
		this.bot = bot;
		
		// TODO: dynamic node min/max
		this.minX = bot.pixelWidth/2;
		this.maxX = width - bot.pixelWidth/2;
		
		this.minY = bot.pixelLength/2;
		this.maxY = height - bot.pixelLength/2;
		
		// node actions
		// actions performed in order on that node before the bot is moved to the next node
		this.nodeActions = [];
		
		// this needs to exist because nodes aren't deleted when they have associated clickables, which can lead to some issues with garbage collection
		// clickables check the "dead" parameter to see if they have to dissassociate with their object, and then kill it
		this.dead = false;
		
		// the + adds actions
		this.nodeActionMenu = new Menu({
			// function names tend to be longer, so override default width
			width: "250px",
			itemNames: [this.NEW_ACTION_TEXT],
			itemActions: [
				function(e, n){
					// temporary fix for nodeActionListMenu not showing up
					nodeActionListMenu.suppressHide = true;
					nodeActionListMenu.show(e.clientX, e.clientY, [n]);
				}
			]
		});
	}
	
	// add a new action
	// FIXME: deal with the inefficieny of looking for the action every single time
	addAction(action){
		let a = getAction(action[0], Object.keys(action[1]).length);
		
		if(a === null) return;
		
		let paramString = "(";
		
		for(let param of a.params){
			let value = action[1][param.name];
			
			paramString += param.name + "=" + value + ", ";
		}
		
		// remove that pesky comma
		paramString = paramString.slice(0, -2);
		
		paramString += ")";
		
		// push action to node
		this.nodeActions.push(action);
		this.nodeActionMenu.addItems([a.name + " " + paramString]);
	}
	
	// clickable functions
	getClickablePosition(){
		return {
			x: this.x,
			y: this.y
		};
	}
	
	getClickableSize(){
		// TODO: make bounding box scale a property
		return {
			w: this.NODE_SIZE*1.5,
			h: this.NODE_SIZE*1.5
		};
	}
	
	setCoords(x, y){
		this.x = Math.min(Math.max(x, this.minX), this.maxX);
		this.y = Math.min(Math.max(y, this.minY), this.maxY);
	}
	
	setRealCoords(rx, ry){
		let x = this.bot.fieldScale.x * rx;
		let y = this.bot.fieldScale.y * ry;
		
		this.setCoords(x, y);
	}
	
	draw(){
		fill(this.nodeColor);
		ellipse(this.x, this.y, this.NODE_SIZE/5, this.NODE_SIZE/5);
		
		stroke(this.nodeColor);
		fill(255, 0);
		rect(this.x - this.NODE_SIZE/2, this.y-this.NODE_SIZE/2, this.NODE_SIZE, this.NODE_SIZE);
	}
	
	getRealCoordinates(){
		return createVector(this.x/this.bot.fieldScale.x, this.y/this.bot.fieldScale.y);
	}
	
	toPayload(){
		let rc = this.getRealCoordinates();
		
		return {
			position: [rc.x, rc.y],
			actions: this.nodeActions
		};
	}
	
	kill(){
		this.nodeActionMenu.kill();
		
		this.dead = true;
	}
};

// PATH CLASS
class Path {
	// url to send post request of path over for parsing/export
	PATH_EXPORT_URL = "/export/";
	
	constructor(bot, name, noInit){
		// bot we're pathing for
		this.bot = bot;
		
		// name
		this.name = name; // name of the path when saving
		
		// nodes
		this.nodes = [];
		
		// action indexes which this path uses
		this.actionIndexNames = [];
		
		if(!noInit) this.init();
	}
	
	init(){
		// actual path
		this.nodes = [new Node(0, 0, this.bot)];
		
		// "active" node index
		this.activeNode = 0;
		
		// is path constructing
		this.constructing = true;
	}
	
	draw(){
		// check for nodes
		if(!this.nodes) return;
		
		let pnode;
		
		for(let i = 0; i < this.nodes.length; i++){
			let node = this.nodes[i];
			
			// draw node
			node.draw();
			
			// draw bot
			this.bot.draw(node.x, node.y);
			
			// draw line between
			if(pnode){
				stroke(node.nodeColor);
				line(pnode.x, pnode.y, node.x, node.y);
			}
			
			pnode = node;
		}
	}
	
	update(){
		// check for nodes
		if(!this.nodes) return;
		
		if(this.activeNode >= 0){
			let node = this.nodes[this.activeNode];
			
			node.setCoords(mouseX, mouseY);
			
			if(mouseJustDown && mouseButton == LEFT){
				if(this.constructing){
					this.nodes.push(new Node(mouseX, mouseY, this.bot));
				
					// create a new clickable for node
					new Clickable(node, nodeContextMenu);
				
					this.activeNode++;
				} else {
					this.activeNode = -1;
				}
			}
		}
	}
	
	stopConstructing(){
		// create a new clickable for final node
		new Clickable(this.nodes[this.activeNode], nodeContextMenu);
		
		this.activeNode = -1;
		this.constructing = false;
	}
	
	// abstract this path into a table of information
	createServerPayload(){
		let payload = {
			name: this.name,
			nodes: [],
			variables: globalVariables,
			actionIndexNames: this.actionIndexNames
		};
		
		for(let i = 0; i < this.nodes.length; i++){
			payload.nodes.push(this.nodes[i].toPayload());
		}
		
		return JSON.stringify(payload);
	}
	
	export(){
		// get server payload
		let payload = this.createServerPayload();
		
		// send to server
		fetch(window.location.origin + this.PATH_EXPORT_URL, {
			method: "POST",
			headers: new Headers({'Content-Type': 'application/json'}),
			body: payload
		})
		.then(res => { if(res.status == 200) return res.text() })
		.then(outDir => {
			// alert user
			alert("Exporting to " + outDir + name);
		})
		.catch(console.error);
	}
	
	// kills all associated nodes so that clickables are deleted and then deletes them
	reset(){
		if(!this.nodes) return;
		
		while(this.nodes.length > 0){
			let node = this.nodes.pop();
			
			node.kill();
		}
	}
	
	// parse the data from a save into this path
	async loadFromSave(save){
		// save action index names
		this.actionIndexNames = save.actionIndexNames;
		
		// fetch any unfetched action indexes
		let names = Object.keys(loadedActionIndexes);
		
		let unloadedNames = this.actionIndexNames.filter(name => !names.includes(name));
		
		for(let name of unloadedNames){
			await newActionIndex(name + ".java");
		}
		
		// clear node data
		this.reset();
		
		// save name
		this.name = save.name;
		
		// save variables
		globalVariables = save.variables;
		
		// save nodes
		for(let n of save.nodes){
			let node = new Node(0, 0, this.bot);
			
			// set coords and save actions
			node.setRealCoords(n.position[0], n.position[1]);
			
			for(let a of n.actions){
				node.addAction(a);
			}
			
			// create a new clickable for node
			new Clickable(node, nodeContextMenu);
			
			this.nodes.push(node);
		}
	}
	
	addActionIndex(actionIndex){
		const name = actionIndex.classname;
		
		if(!this.actionIndexNames.includes(name)) this.actionIndexNames.push(name);
	}
};

// UTILS

// fetch actions and variables
async function fetchActionsAndVariables(){
	await fetchActions();
	
	await fetchVariables();
}

// load a new action index
async function newActionIndex(name){
	if(!name) return;
	
	// tell server to add this action index
	let req = await fetch("/newActionIndex", {
		method: "POST",
		headers: new Headers({'Content-Type': 'application/json'}),
		body: JSON.stringify({
			name: name
		})
	});
	
	let res = await req.text();

	// re-fetch methods
	await fetchActions();
	
	return res;
}

// fetch available action indexes
// does so asynchronously
async function fetchActions(){
	// clear loads
	loadedActionIndexes = {};
	loadedActions = [];
	
	// initiate fetch request
	const res = await fetch("/validActions");
	
	// parse
	const actionIndexes = await res.json();
	
	// names of each action formatted to show in the pop up menu
	let formattedActionNames = [];
	
	// actions for each item in the menu (to add the node action to the node selected)
	let itemActions = [];
	
	// loop through each action index and parse actions
	for(let actionIndex of actionIndexes){
		let actions = actionIndex.methods;
		
		// add action index to loadedActionIndexes
		loadedActionIndexes[actionIndex.classname] = actionIndex;
		
		// add actions to loadedActions
		loadedActions.push(...actions);
		
		for(let action of actions){
			// format action name
			formattedActionNames.push(action.name + " (" + action.params.length + " params)");
			
			// close button id
			let closeButtonId = "close-button-" + action.name + "-" + action.params.length + "-parameter-prompt";
			
			itemActions.push(
				function(e, n){
					// prompt for parameters
					new Prompt({
						// one time prompt, delete when hidden
						// this is just in case the user cancels the prompt, which would leave the html in the page
						killOnHide: true,
						args: [action, n],
						htmlContent: "<button id=\"" + closeButtonId + "\">Done</button>", // rest is created dynamically by js
						js: function(a, n){
							this.itemContainer.style["background-color"] = "white";
							
							let closeButton = document.getElementById(closeButtonId);
							
							let completedParams = {};
							
							let idText = "-input";
							
							closeButton.addEventListener("click", e => {
								let paramString = "(";
								
								for(let param of a.params){
									let input = document.getElementById(param.name + idText);
									
									let value = input.value;
									
									// validate input
									// FIXME: should validate input a bit more thoroughly
									
									// check for blank values
									if(value.length <= 0){
										// close prompt without continuing
										this.hide();
										return;
									}
									
									// check for globals
									// FIXME: adapt to new system
									/*if(globalListMenu.itemNames.includes(value)){
										// if global type doesn't match, alert user and don't close prompt
										let global = globalVariables[value];
										
										if(param.type != global.type){
											alert(global.name + " can't be used for " + param.name + " because the types don't match");
											return;
										}
									}*/
									
									// add to completed params
									completedParams[param.name] = value;
									
									paramString += param.name + "=" + value + ", ";
								}
								
								// remove that pesky comma
								paramString = paramString.slice(0, -2);
								
								paramString += ")";
								
								// push action to node
								n.nodeActions.push([a.name, completedParams]);
								n.nodeActionMenu.addItems([a.name + " " + paramString]);
								
								// add this action index to path
								mainPath.addActionIndex(actionIndex); 

								this.hide();
							});
		
							// for each parameter, create a label and an input box
							for(let i = 0; i < a.params.length; i++){
								let param = a.params[i];
								
								let label = document.createElement("label");
								let input = document.createElement("input");
								let br = document.createElement("br");
								
								let id = param.name + idText;
								
								input.id = id;
								label.for = id;
								label.textContent = param.name + " (" + param.type + ") :";
								
								// TODO: creating "br" each time is probably bad somehow.  I'm not sure how, but I can feel it
								this.itemContainer.insertBefore(br, closeButton);
								this.itemContainer.insertBefore(input, br);
								this.itemContainer.insertBefore(label, input);
							}
						}
					}).show(e.clientX, e.clientY);
				}
			);
		}
	}
	
	nodeActionListMenu = new Menu({
		// function names tend to be longer, so override default width
		width: "300px",
		// these can get long, so add a height to enable the scrollbar
		height: "250px",
		itemNames: formattedActionNames,
		itemActions: itemActions
	});
}

// fetch available variables from server
async function fetchVariables(){
	// get variables string
	let res = await fetch("/globalVariables");
	
	// convert to json
	let json = await res.json();
	
	// create new names/new actions
	let itemNames = [];
	let itemActions = [];
	
	// clear global variables
	
	for(let path in json){
		let variables = json[path];
		
		for(let variable of variables){
			// add item name
			itemNames.push(variable.name);
			
			// create item action
			let action = mouseEvent => {
				// prompt user to modify the value of this global
				new Prompt({
					killOnHide: true,
					htmlContent: `
					<p style="display: inline;">${variable.name}:</p><br>
					<label for="global-variable-input">Value: </label>
					<input id="global-variable-input"></input><br>
					<button id="global-done-button">Done</button>
					`,
					args: [variable],
					js: function(variable){
						// grab elements
						const doneButton = document.getElementById("global-done-button");
						const variableInput = document.getElementById("global-variable-input");
						
						variableInput.value = variable.value;
						
						// done button clicked
						doneButton.addEventListener("click", e => {
							// save if input has value
							if(variableInput.value.length > 0){
								// TODO: validate input
								variable.value = variableInput.value;
							}
							
							// hide
							this.hide();
						});
					}
				}).show(mouseEvent.clientX, mouseEvent.clientY);
			}
		
			// push action
			itemActions.push(action);
		}
	
		globalVariables[path] = variables;
	}
	
	// overwrite the current global variables
	// this gets rid of the default, and doesn't cause any problems since the server should send us a complete list every time
	// the only real issue is that it's somewhat inefficient and would become a big problem if a lot of global variables were to be involved
	globalListMenu.changeItems(itemNames, itemActions, true); // destructive replacement
}

// search for an action in loadedActionIndexes and return it if it exists
function getAction(name, paramCount){
	// reverse the original array so that the furthest actions in the inheritance chain take priority over the same methods earlier in the chain (because they override earlier methods)
	let actions = loadedActions.slice().reverse();
	
	for(let action of actions){
		if(action.name === name && action.params.length === paramCount){
			return action;
		}
	}
	
	return null;
}