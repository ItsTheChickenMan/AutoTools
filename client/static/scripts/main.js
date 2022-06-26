// main, does everything
// uses p5js, probably a bit limited but easy to use

// GLOBALS

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
			itemNames: ["New", "Save", "Export"],
			itemActions: [
				function(){
					// TODO: do
					console.log("New");
				},
				function(){
					// TODO: do
					console.log("Save");
				},
				function(){
					if(mainPath) mainPath.export("Test.java");
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
	itemNames: ["Start Pathing", "End Pathing", "Delete Path"],
	itemActions: [
		function(){
			mainPath = new Path(bot);
		},
		function(){
			if(mainPath) mainPath.stopConstructing();
		},
		function(){
			mainPath.destroy();
			mainPath = null;
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
}

// draws background
// this might seem stupid to throw into a function, but it's handy if I ever want to throw anything else on the bg
function drawBg(){
	// set background color
	background(backgroundColor);
}

// check if the mouse was just down (for events which only run when mouse is clocked)
function updateMouseClicked(){
	mouseJustDown = mouseIsPressed && wasReleased;
	wasReleased = !mouseIsPressed;
}

// draw the field
function drawField(){
	image(fieldImage, 0, 0, width, height);
}