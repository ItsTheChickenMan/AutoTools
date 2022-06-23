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
// note: feels very weird putting a class definition right in the middle of the file, but I can't think of a better place for this...
class Node {
	NODE_SIZE = 15;
	NODE_COLOR = "rgba(50, 168, 82, 255)";
	
	// construct a new node
	constructor(x, y, bot){
		this.nodeColor = color(this.NODE_COLOR);
		
		this.x = x || mouseX;
		this.y = y || mouseY;
		
		this.bot = bot;
		
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
		return createVector(this.x/this.bot.fieldScale.x, this.y/this.bot.fieldScale.y);
	}
	
	toPayload(){
		let rc = this.getRealCoordinates();
		
		return {
			position: [rc.x, rc.y]
		};
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
				this.nodes.push(new Node(mouseX, mouseY, this.bot));
				this.activeNode++;
			}
		}
	}
	
	stopConstructing(){
		this.activeNode = -1;
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
};