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

// only one path at a time (?)
let mainPath;

// p5js dependent globals
let fieldImage, fieldScale, bot;

// p5js dependent globals
let borderColor, backgroundColor;

// menubars + menus
let resizeBotPrompt = new Prompt({
	htmlContent: `
		<button id="close
	`
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
					console.log("New");
				},
				function(){
					console.log("Save");
				},
				function(){
					console.log("Export");
				}
			]
		},
		{
			name: "Bot",
			itemNames: ["Resize"],
			itemActions: [
				function(){
					console.log("resize bot");
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
	
	// menu logic
	mainCanvas.canvas.addEventListener("contextmenu", e => {
		// prevent right click
		e.preventDefault();
		
		// open menu
		contextMenu.show(e.clientX, e.clientY);
	});
}

function draw(){
	// mouse update
	updateMouseClicked();
	
	// render //
	
	// draw background
	drawBg();
	
	// draw field
	drawField();
	
	if(mainPath) mainPath.draw();
	
	// actions won't take place unless user is not in a menu
	// NOTE: no render calls should take place in here or they won't render in a menu
	if(!inMenu){
		// draw existing path
		if(mainPath) mainPath.update();
	}
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

// check if the mouse has been "clicked" (pressed 
function updateMouseClicked(){
	mouseJustDown = mouseIsPressed && wasReleased;
	wasReleased = !mouseIsPressed;
}

// draw the field
function drawField(){
	image(fieldImage, 0, 0, width, height);
}