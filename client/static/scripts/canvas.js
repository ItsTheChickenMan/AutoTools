// canvas setup, as well as all of the interaction management
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

// context menu which appears when the user right clicks on the canvas
let contextMenu = new Menu({
	itemNames: ["Start Pathing", "End Pathing", "Delete Path"],
	itemActions: [
		function(){
			newPath();
		},
		function(){
			endPath();
		},
		function(){
			deletePath();
		}
	]
});

// p5js dependent globals
let borderColor, backgroundColor;


// EVENT LISTENERS

// setup function for p5js
function setup(){
	// initialize p5js dependent globals
	initGlobals();
	
	// create main canvas and keep it in global
	mainCanvas = createCanvas(initialWidth, initialHeight);
	
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
	
	// initialize pathing p5js dependent globals
	initPathingGlobals();
}

function draw(){
	// mouse update
	updateMouseClicked();
	
	// render //
	
	// draw background
	drawBg();
	
	// draw field
	drawField();
	
	// actions won't take place unless user is not in a menu
	// NOTE: no render calls should take place in here or they won't render in a menu
	// FIX: there's a render call in here
	if(!inMenu){
		// draw existing path
		drawAndUpdatePath();
	}
}

// UTILS

// initialize all global values (should be called in setup)
// this needs to be called after setup because p5js won't let you use p5 functions without calling setup first
function initGlobals(){
	borderColor = color(145);
	backgroundColor = color(255);
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