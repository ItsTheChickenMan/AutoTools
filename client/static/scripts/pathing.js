// manages all of the pathing interactions with the canvas

// only one path at a time (?)
let mainPath;

// all currently loaded actions
let loadedActions = []; // actions in full table form

// CLASSES

// context menu for a node right click
let nodeContextMenu = new Menu({
	itemNames: ["Log to Console (Dev)", "See Node Actions", "Insert Node Before", "Insert Node After", "Change Node Position", "Delete Node"],
	itemActions: [
		function(e, n){ // add node action
			console.log(n);
		},
		function(e, n){
			// temporary fix for nodeActionMenu not showing up
			n.nodeActionMenu.suppressHide = true;
			
			n.nodeActionMenu.show(e.clientX, e.clientY, [n]);
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
let nodeActionListMenu = new Menu({
	itemNames: [],
	itemActions: []
});

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
	
	constructor(bot){
		// bot we're pathing for
		this.bot = bot;
		
		// actual path
		this.nodes = [new Node(0, 0, this.bot)];
		
		// "active" node index
		this.activeNode = 0;
		
		// is path constructing
		this.constructing = true;
	}
	
	draw(){
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
	createServerPayload(name){
		let payload = {
			name: name,
			nodes: []
		};
		
		for(let i = 0; i < this.nodes.length; i++){
			payload.nodes.push(this.nodes[i].toPayload());
		}
		
		return payload;
	}
	
	export(name){
		let payload = this.createServerPayload(name);
		
		payload.name = name;
		
		console.log(payload);
		
		payload = JSON.stringify(payload);
		
		fetch(window.location.origin + this.PATH_EXPORT_URL, {
			method: "POST",
			headers: new Headers({'Content-Type': 'application/json'}),
			body: payload
		})
		.then(res => { if(res.status == 200) return res.text() })
		.then(outDir => {
			alert("Exporting to " + outDir + name);
		})
		.catch(console.error);
	}
	
	// kills all associated nodes so that clickables are deleted
	destroy(){
		for(let i = 0; i < this.nodes.length; i++){
			this.nodes[i].kill();
		}
	}
};

// UTILS

// fetch available actions from server
// TODO: messy, fix up a bit
function fetchActionsSync(){
	let request = new XMLHttpRequest();
	request.open('GET', '/validActions', false); // `false` makes the request synchronous
	request.send(null);

	if (request.status === 200) {
		// load contents into json object
		loadedActions = JSON.parse(request.responseText);
	
		// format for node action list
		let formattedActionNames = [];
		
		let itemActions = [];
		
		for(let a of loadedActions){
			formattedActionNames.push(a.name + " (" + a.params.length + " params)");
			let closeButtonName = "close-button-" + a.name + "-" + a.params.length + "-parameter-prompt";
			
			itemActions.push(
				function(e, n){
					// prompt for parameters
					new Prompt({
						// one time prompt, delete when hidden
						// this is just in case the user cancels the prompt, which would leave the html in the page
						onHide: function(){
							this.kill();
						},
						args: [a, n],
						htmlContent: "<button id=\"" + closeButtonName + "\">Done</button>", // rest is created dynamically by js
						js: function(a, n){
							this.itemContainer.style["background-color"] = "white";
							
							let closeButton = document.getElementById(closeButtonName);
							
							let completedParams = {};
							
							let idText = "-input";
							
							closeButton.addEventListener("click", e => {
								let paramString = "(";
								
								for(let i = 0; i < a.params.length; i++){
									let param = a.params[i];
									
									let input = document.getElementById(param.name + idText);
									
									completedParams[param.name] = input.value;
									
									paramString += param.name + "=" + input.value + ", ";
								}
								
								// remove that pesky comma
								paramString = paramString.slice(0, -2);
								
								paramString += ")";
								
								// push action to node
								n.nodeActions.push([a.name, completedParams]);
								n.nodeActionMenu.addItems([a.name + " " + paramString]);
								
								this.kill();
							});
		
							// for each parameter, create a label and an input box
							for(let i = 0; i < a.params.length; i++){
								let param = a.params[i];
								
								let label = document.createElement("label");
								let input = document.createElement("input");
								let br = document.createElement("br");
								
								// control input based on parameter type
								// first switch: input type switch
								// TODO: array/object support?
								switch(param.type){
									case "byte":
									case "short":
									case "int":
									case "long":
									case "boolean":
										// can't store floating point values
										// type is also a number
										input.type = "number";
										input.oninput=function(){
											// TODO: make this better	
											let has = this.value.match(/\..*/g);
											
											if(has){
												// NOTE: for some reason, .replace properly detects the decimal as it's typed, but .match doesn't...
												this.value = this.value.replace(/\..*/g, "");
											
												// unfocus to prevent the cursor from going wonky
											
												this.blur();
											}
										}
										break;
									case "float":
									case "double":
										// type is a number
										input.type = "number";
										break;
									// otherwise default to text
									default:
										input.type = "text";
										break;
								}
								
								// special case stuff, mainly limits
								// TODO: limits don't work ATM, ignoring for now bc it doesn't really matter but it should be fixed eventually
								switch(param.type){
									case "byte":
										input.min = "-128";
										input.max = "127";
										break;
									case "short":
										input.min = "-32768";
										input.max = "32767";
										break;
									case "int":
										input.min = "-2147483648";
										input.max = "2147483647";
										break;
									case "long":
										input.min = "-9223372036854775808"
										input.max = "9223372036854775807";
										break;
									case "boolean":
										input.min = "0";
										input.max = "1";
										break;
									case "char":
										input.maxLength = "1";
										break;
								}
								
								let id = param.name + idText;
								
								input.id = id;
								label.for = id;
								label.textContent = param.name + ":";
								
								// TODO: creating "br" each time is probably slow somehow
								this.itemContainer.insertBefore(br, closeButton);
								this.itemContainer.insertBefore(input, br);
								this.itemContainer.insertBefore(label, input);
							}
						}
					}).show(e.clientX, e.clientY);
				}
			);
		}
		
		nodeActionListMenu = new Menu({
			// function names tend to be longer, so override default width
			width: "250px",
			itemNames: formattedActionNames,
			itemActions: itemActions
		});
	}
}