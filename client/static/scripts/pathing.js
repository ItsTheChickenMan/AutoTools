// manages all of the pathing interactions with the canvas

// GLOBALS

// field width + height in inches
let fieldWidth = 144;
let fieldHeight = 144;

// path to field image
let fieldImagePath = "/static/images/FreightFrenzyField.webp"; // defaults to freight frenzy field

// array of nodes in path
let nodes = [];

// p5js dependent globals
let fieldImage, fieldScale;

// FIELD FUNCTIONS

// draw the field
function drawField(){
	image(fieldImage, 0, 0, width, height);
}

// UTILS

// initialize p5js dependent globals
function initPathingGlobals(){
	fieldScale = createVector(width/fieldWidth, height/fieldHeight);
	
	fieldImage = loadImage(fieldImagePath);
}