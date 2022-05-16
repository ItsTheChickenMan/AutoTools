// manages all of the pathing interactions with the canvas

// CLASSES

// NODE CLASS
// note: feels very weird putting a class definition right in the middle of the file, but I can't think of a better place for this...
class Node {
	NODE_SIZE = 15;
	NODE_COLOR = "rgba(50, 168, 82, 255)";
	
	// construct a new node
	constructor(x, y){
		this.nodeColor = color(this.NODE_COLOR);
		
		this.x = x || mouseX;
		this.y = y || mouseY;
	}
	
	setCoords(x, y){
		this.x = x;
		this.y = y;
	}
	
	draw(){
		fill(this.nodeColor);
		ellipse(this.x, this.y, this.NODE_SIZE/5, this.NODE_SIZE/5);
		
		console.log(this.nodeColor);
		
		stroke(this.nodeColor);
		fill(255, 0);
		rect(this.x - this.NODE_SIZE/2, this.y-this.NODE_SIZE/2, this.NODE_SIZE, this.NODE_SIZE);
	}
	
	getRealCoordinates(scale){
		
	}
};

// PATH CLASS

class Path {
	constructor(){
		// actual path
		this.nodes = [new Node(0, 0)];
		
		// "active" node index
		this.activeNode = 0;
	}
	
	// draw+update this path
	drawAndUpdate(){
		let pnode;
		
		for(let i = 0; i < this.nodes.length; i++){
			let node = this.nodes[i];
			
			// update active node if in construction
			if(this.activeNode > 0 && i == this.activeNode){
				node.setCoords(mouseX, mouseY);
				
				// create new node
				if(mouseIsPressed){
					this.nodes.push(new Node(mouseX, mouseY));
					this.activeNode++;
				}
			}
			
			// draw node
			node.draw();
			
			// draw line between
			if(pnode){
				stroke(node.nodeColor);
				line(pnode.x, pnode.y, node.x, node.y);
			}
			
			pnode = node;
		}
	}
	
	stopConstructing(){
		this.activeNode = -1;
	}
};

// GLOBALS

// field width + height in inches
let fieldWidth = 144;
let fieldHeight = 144;

// path to field image
let fieldImagePath = "/static/images/FreightFrenzyField.webp"; // defaults to freight frenzy field

// only one path at a time (?)
let mainPath;

// p5js dependent globals
let fieldImage, fieldScale;


// FIELD FUNCTIONS

// draw the field
function drawField(){
	image(fieldImage, 0, 0, width, height);
}

// EXTERNAL PATH FUNCTIONS

// draw path if it exists
function drawAndUpdatePath(){
	if(mainPath) mainPath.drawAndUpdate();
}

function endPath(){
	if(mainPath) mainPath.stopConstructing();
}

function deletePath(){
	mainPath = null;
}

// UTILS

// initialize p5js dependent globals
function initPathingGlobals(){
	fieldScale = createVector(width/fieldWidth, height/fieldHeight);
	
	fieldImage = loadImage(fieldImagePath);
}