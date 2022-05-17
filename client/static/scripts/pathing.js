// manages all of the pathing interactions with the canvas

// CLASSES

// BOT CLASS
class Bot {
	/**
		*	@brief Constructs a new bot from options
		*
		*	options: {
		*		width: int, // width of bot, in inches
		*		length: int, // length of bot, in inches
		*	}
	*/
	constructor(options){
		options = options || {};
		
		this.width = options.width || 18;
		this.length = options.length || 18;
		
		this.pixelWidth = this.width * getFieldScale().x;
		this.pixelLength = this.length * getFieldScale().y;
	}
	
	draw(x, y){
		x = Math.min(Math.max(x, this.pixelWidth/2), width - this.pixelWidth/2);
		y = Math.min(Math.max(y, this.pixelLength/2), height - this.pixelLength/2);
		
		stroke(0);
		noFill();
		rect(x - this.pixelWidth/2, y - this.pixelLength/2, this.pixelWidth, this.pixelLength);
	}
}

// NODE CLASS
// note: feels very weird putting a class definition right in the middle of the file, but I can't think of a better place for this...
class Node {
	NODE_SIZE = 15;
	NODE_COLOR = "rgba(50, 168, 82, 255)";
	
	// construct a new node
	constructor(x, y, bot){
		this.nodeColor = color(this.NODE_COLOR);
		
		this.x = x || mouseX;
		this.y = y || mouseY;
		
		this.minX = bot.pixelWidth/2;
		this.maxX = width - bot.pixelWidth/2;
		
		this.minY = bot.pixelLength/2;
		this.maxY = height - bot.pixelLength/2;
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
		return createVector(this.x/getFieldScale().x, this.y/getFieldScale().y);
	}
};

// PATH CLASS

class Path {
	constructor(bot){
		// bot we're pathing for
		this.bot = bot;
		
		// actual path
		this.nodes = [new Node(0, 0, this.bot)];
		
		// "active" node index
		this.activeNode = 0;
	}
	
	// draw+update this path
	drawAndUpdate(){
		let pnode;
		
		for(let i = 0; i < this.nodes.length; i++){
			let node = this.nodes[i];
			
			// update active node if in construction
			if(this.activeNode >= 0 && i == this.activeNode){
				node.setCoords(mouseX, mouseY);
				
				// create new node
				if(mouseJustDown && mouseButton == LEFT){
					this.nodes.push(new Node(mouseX, mouseY, this.bot));
					this.activeNode++;
					
					// update on next frame
					// FIX: this is a temporary fix for the page locking after creating a new node (blocks page execution)
					break;
				}
			}
			
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
let fieldImage, fieldScale, bot;


// FIELD FUNCTIONS

// draw the field
function drawField(){
	image(fieldImage, 0, 0, width, height);
}

// EXTERNAL PATH FUNCTIONS

function newPath(){
	mainPath = new Path(bot);
}
	
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
	
	bot = new Bot();
}

function getFieldScale(){
	return fieldScale;
}