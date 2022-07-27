// main, does everything
// uses p5js, probably a bit limited but easy to use

// GLOBALS

// misc //
let directories = {};

// canvas globals //
// main canvas used in the interface
let mainCanvas = null; // default value is null so it's known that the canvas hasn't been created yet

let initialWidth = 500;
let initialHeight = 500;
let borderWidth = 2;

// mouse globals
let mouseJustDown = false;
let wasReleased = false;

// field + pathing globals //

// field width + height in inches
let fieldWidth = 144;
let fieldHeight = 144;

// path to field image
let fieldImagePath = "/static/images/FreightFrenzyField.webp"; // defaults to freight frenzy field

// p5js dependent globals
let fieldImage, fieldScale, bot;

// p5js dependent globals
let borderColor, backgroundColor;

// menubars + menus
let resizeBotPrompt = new Prompt({
	htmlContent: `
		<label for="width-input">Width (inches):</label>
		<input id="width-input" type="number"></input><br>
		<label for="length-input">Length (inches):</label>
		<input id="length-input" type="number"></input><br>
		<button id="close-button-resize-bot-prompt">Done</button>
	`,
	js: function(){
		this.itemContainer.style["background-color"] = "white";
		
		let b = document.getElementById("close-button-resize-bot-prompt");
		let wi = document.getElementById("width-input");
		let li = document.getElementById("length-input");
		
		b.addEventListener("click", e => {
			// update width + height
			bot.setWidth(wi.value);
			bot.setLength(li.value);
			
			this.hide();
		});
	}
});

// menubar at the top
// main script for client interface
let m = new Menubar("menu-bar", {
	direction: "horizontal",
	items: [
		{
			name: "File",
			itemNames: ["Save", "Save As", "Export"],
			itemActions: [
				function(){
					savePath(mainPath.name);
				},
				function(){
					savePath(mainPath.name);
				},
				function(){
					if(mainPath){ 
						mainPath.export("Test");
					} else {
						alert("No path, nothing to export");
					}
				}
			]
		},
		{
			name: "Path",
			itemNames: ["Add Action Index", "Add Part File", "See Global Variables"],
			itemActions: [
				function(mouseEvent){
					// prompt user (TODO: decide on standards between making a permanent prompt and using parameters vs. making a temporary prompt?)
					let actionIndexPrompt = new Prompt({
						// delete when hidden
						onHide: function(){ this.kill(); },
						htmlContent: "<p>NOTE: Action indexes MUST be in ./java/actions/</p><input id=\"action-index-input\" type=\"file\" accept=\".java\" multiple=\"false\"><br/><button id=\"done-button\">Done</button>",
						js: function(){
							this.itemContainer.style["background-color"] = "white";
							
							let inputElement = document.getElementById("action-index-input");
							let doneButton = document.getElementById("done-button");
							let selectedActionIndex = null;
							
							inputElement.addEventListener("change", e => {
								selectedActionIndex = inputElement.files[0].name;
							});
							
							doneButton.addEventListener("click", e => {
								if(selectedActionIndex){
									// tell server to add this action index
									fetch("/newActionIndex", {
										method: "POST",
										headers: new Headers({'Content-Type': 'application/json'}),
										body: JSON.stringify({
											name: selectedActionIndex
										})
									})
									.then(res => res.text())
									.then(alert)
									.then(e => {
										// re-fetch methods
										fetchActionsSync();
									})
									.catch(alert);
								}
								
								this.hide();
							});
						}
					});
					
					actionIndexPrompt.show(mouseEvent.clientX, mouseEvent.clientY);
				},
				function(mouseEvent){
					// prompt user
					let partFilePrompt = new Prompt({
						// delete when hidden
						onHide: function(){ this.kill(); },
						htmlContent: "<p>NOTE: Part files MUST be in ./parts/</p><input id=\"part-file-input\" type=\"file\" accept=\".prt\" multiple=\"false\"><br/><button id=\"done-button\">Done</button>",
						js: function(){
							this.itemContainer.style["background-color"] = "white";
							
							let inputElement = document.getElementById("part-file-input");
							let doneButton = document.getElementById("done-button");
							let selectedPartFile = null;
							
							inputElement.addEventListener("change", e => {
								selectedPartFile = inputElement.files[0].name;
							});
							
							doneButton.addEventListener("click", e => {
								if(selectedPartFile){
									// tell server to add this action index
									fetch("/newPartFile", {
										method: "POST",
										headers: new Headers({'Content-Type': 'application/json'}),
										body: JSON.stringify({
											name: selectedPartFile
										})
									})
									.then(res => res.text())
									.then(alert)
									.catch(alert);
								}
								
								this.hide();
							});
						}
					});
					
					partFilePrompt.show(mouseEvent.clientX, mouseEvent.clientY);
				},
				function(mouseEvent){
					// TODO: make show() automatically call suppressHide?  only not doing now bc I'm not sure what the consequences of doing so would be
					// I'm just assuming right now that I MUST'VE had a good reason to create suppressHide but I really don't know what it was
					globalListMenu.suppressHide = true;
					globalListMenu.show(mouseEvent.clientX, mouseEvent.clientY);
				}
			]
		},
		{
			name: "Bot",
			itemNames: ["Resize"],
			itemActions: [
				function(e){
					resizeBotPrompt.show(e.clientX, e.clientY);
				}
			]
		}
	]
});

// context menu which appears when the user right clicks on the canvas
let contextMenu = new Menu({
	itemNames: ["Start Pathing", "End Pathing", "Reset Path"],
	itemActions: [
		function(){
			if(mainPath) mainPath.init();
		},
		function(){
			if(mainPath) mainPath.stopConstructing();
		},
		function(){
			if(mainPath) mainPath.reset();
		}
	]
});

// EVENT LISTENERS

// setup function for p5js
function setup(){
	// create main canvas and keep it in global
	mainCanvas = createCanvas(initialWidth, initialHeight);
	
	// initialize p5js dependent globals
	initGlobals();
	
	// add border
	mainCanvas.canvas.style["border"] = "solid";
	mainCanvas.canvas.style["border-width"] = borderWidth + "px";
	mainCanvas.canvas.style["border-color"] = borderColor.toString();
	
	// set default clickable menu
	setDefaultMenu(contextMenu);
	
	// initialize clickables
	initClickables(mainCanvas.canvas);
	
	// synchronously fetch the currently available default actions
	// TODO: it doesn't really make sense to use async in this case, but synchronous XHR is deprecated so probably switch to fetch() at some point
	fetchActionsSync();
	
	// menu logic
	/*mainCanvas.canvas.addEventListener("contextmenu", e => {
		// prevent right click
		e.preventDefault();
		
		// open menu
		contextMenu.show(e.clientX, e.clientY);
	});*/
}

function draw(){
	// mouse update
	updateMouseClicked();
	
	// render //
	
	// draw background
	drawBg();
	
	// draw field
	drawField();
	
	// render actions for main path
	if(mainPath){
		mainPath.draw();
	}
	
	// actions won't take place unless user is not in a menu
	// NOTE: no render calls should take place in here or they won't render in a menu
	if(!activeMenu){
		// draw existing path
		if(mainPath) mainPath.update();
	}
	
	updateClickables();
}

// UTILS

// initialize all global values (should be called in setup)
// this needs to be called after setup because p5js won't let you use p5 functions without calling setup first
function initGlobals(){
	borderColor = color(145);
	backgroundColor = color(255);
	
	fieldScale = createVector(width/fieldWidth, height/fieldHeight);
	
	fieldImage = loadImage(fieldImagePath);
	
	bot = new Bot({
		scale: fieldScale
	});
	
	mainPath = new Path(bot, null, true);
}

// draws background
// this might seem stupid to throw into a function, but it's handy if I ever want to throw anything else on the bg
function drawBg(){
	// set background color
	background(backgroundColor);
}

// check if the mouse was just down (for events which only run when mouse is clicked)
function updateMouseClicked(){
	mouseJustDown = mouseIsPressed && wasReleased;
	wasReleased = !mouseIsPressed;
}

// draw the field
function drawField(){
	image(fieldImage, 0, 0, width, height);
}

// action for when the Save or Save As button is clicked in the menu
function savePath(name){
	// if name isn't there, prompt for it
	if(!name){
		name = prompt("Enter a unique name for the path:");
		mainPath.name = name;
	}
	
	let jsonPath = mainPath.createServerPayload();
	
	fetch("/save", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: jsonPath
	}).then(res => {
		alert("Saved");
	});
}

// fetch directories and store them into the directories object
async function fetchDirectories(){
	// fetch
	let f = await fetch("/directories");
	let o = await f.json();
	
	// store
	directories = o;
}