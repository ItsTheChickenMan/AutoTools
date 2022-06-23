// there's a lot of stuff that the mouse can click on (in the canvas).  to prevent objects from arguing over what the mouse is clicking on, I'm implementing this mouse manager.  Every single click on the canvas should be managed from here

// general idea is to have bounding boxes in the clickable space and different context menus for each
// prioritize clicks from smallest bounding box to largest bounding box(?)
// the background can also be clicked (default context menu) but has lowest priority

// all clickable bounding boxes on the canvas, excluding the background
let clickables = [];

// when null, won't show anything on background click
let defaultMenu = null;

class Clickable {
	constructor(obj, menu){
		// assign linked object
		this.obj = obj;
		
		// set initial position and size
		this.update();
		
		// set context menu
		this.menu = menu;
		
		// push to all clickables
		clickables.push(this);
	}
	
	// update position and size
	update(){
		this.position = this.obj.getClickablePosition(); // {x: x, y: y}
		this.size = this.obj.getClickableSize();  // {w: w, h: h}
	}
	
	// do coordinates lie within this bounding box?
	contains(x, y){
		return (
			x >= this.position.x-this.size.w/2 &&
			x <= this.position.x+this.size.w/2 &&
			y >= this.position.y-this.size.h/2 &&
			y <= this.position.y+this.size.h/2
		);
	}
};

// the default menu, which appears when a context menu is requested and no bounding box is being clicked on
function setDefaultMenu(menu){
	defaultMenu = menu;
}

// update the positions and bounding boxes of clickable objects
function updateClickables(){
	for(let i = 0; i < clickables.length; i++){
		let c = clickables[i];
		
		c.update();
	}
}

// initialize clickables
function initClickables(canvas){
	// whenever mouse is clicked, determine which context menu to show
	canvas.addEventListener("contextmenu", e => {
		// prevent normal context menu
		e.preventDefault();
		
		// search for clickable which contains mouse coordinates
		let x = e.clientX;
		let y = e.clientY;
		
		for(let i = 0; i < clickables.length; i++){
			let c = clickables[i];
			
			// if clickable contains mouse coordinates
			if(c.contains(x, y)){
				// show menu
				c.menu.show(x, y);
				
				// end function
				return;
			}
		}
		
		// clickable not found, show default if available
		if(defaultMenu) defaultMenu.show(x, y);
		
		// NOTE: menus take care of hiding themselves
	});
}
