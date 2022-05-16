// tiny side thing for creating menus/menu buttons/menubars

/**
	*	@brief A menu similar to the right-click context menu
*/
class Menu {
	/**
		*	@brief Constructs a new Menu from the options object provided
		*
		*	options: {
		*		itemNames: ["", ""], // ordered list of the item names on the context menu
		*		itemActions: [ // ordered list of the actions taken when items are pressed
		*			function(){
		*				// item action code
		*			}
		*		]
		*	}
	*/
	constructor(options){
		this.itemContainer = document.createElement("div"); // menu list of actions
		
		// stylize item container
		this.itemContainer.classList.add("menu-item-container");
		this.hide(); // hide initially
		
		// create menu items
		for(let i = 0; i < options.itemNames.length; i++){
			// item name
			let name = options.itemNames[i];
			let action = options.itemActions[i];
			
			// create buttons for each item name
			let itemButton = document.createElement("button");
			
			itemButton.classList.add("menu-item");
			
			itemButton.textContent = name;
			itemButton.addEventListener("mouseup", e => {
				action(); // TODO: what parameters?
			});
			
			this.itemContainer.appendChild(itemButton);
		}
		
		// push item container into document
		document.body.appendChild(this.itemContainer);
		
		this.supressHide = false;
		
		// manage click events
		document.body.addEventListener("mouseup", function(e){
			// temporary override to supress the hide action
			if(this.supressHide){
				this.supressHide = false;
				return;
			}
			
			// hide the menu
			this.hide();
		}.bind(this));
	}
	
	// show the menu at the coordinates
	show(x, y){
		this.itemContainer.style["display"] = "flex";
		this.itemContainer.style["top"] = y + "px";
		this.itemContainer.style["left"] = x + "px";
		
		this.visible = true;
	}
	
	// hide the menu
	hide(){
		this.itemContainer.style["display"] = "none";
		
		this.visible = false;
	}
}

/**
	*	@brief A menu which can be displayed as a result of clicking a menu button.  Despite being called just a Menu, Menus contain both their menu items and the button which instantiates the menu.  Unlike Menubars, these don't need an element to build off of.
*/
class MenuButton {
	/**
		*	@brief Constructs a new Menu from the options
		*
		*	either:
		*	
		*	options: {
		*		name: "", // name of the button which, when clicked, shows the menu items.
		*		menu: Menu, // the menu object to bind to this button (show when button is clicked)
		*	}
		*	
		*	OR: 
		*	
		*	options: {
		*		name: "", // name of the button which, when clicked, shows the menu items.
		*		itemNames: ["", ""], // ordered list of the item names which will appear when the menu button is clicked
		*		itemActions: [ // ordered list of the functions, where the function body is the action taken when the item at the same position in itemNames is clicked
		*			function(){
		*				// item action code
		*			}
		*		],
		* }
	*/
	constructor(options){
		// store simple vars
		this.name = options.name;
		
		// create DOM objects
		this.mainButton = document.createElement("button"); // initiating menu button
		
		// stylize main button
		this.mainButton.textContent = this.name;
		this.mainButton.classList.add("menubar-item");
		
		// create/cache the menu
		this.menu = options.menu || new Menu(options);
		
		// checks to see if 
		this.justClicked = false;
		
		// menu button logic
		this.mainButton.addEventListener("mouseup", function(e){
			// enable supress hide
			this.menu.supressHide = true;
			
			// show the menu
			this.show(e.clientX, e.clientY);
		}.bind(this));
	}
	
	get visible(){
		return this.menu.visible;
	}
	
	// show the menu at the coordinates
	show(x, y){
		this.menu.show(x, y);
	}
	
	// hide the menu
	hide(){
		this.menu.hide();
	}
};

/**
	*	@brief Menubar class which acts as a collection of Menus.  
*/
class Menubar {
	/**
		*	@brief Constructs a new Menubar from an existing div element.
		*
		*	This can only use existing div elements because it's easier to write code for.
		*
		*	@param menuContainer div element (or id of div element) in which the menubar will be contained
		*	@param options table of options, described below:
		*	
		*	options: {
		*		direction: "", // either "horizontal" (default) or "vertical", which is how the menu will be displayed.  the menubar is only constructed once, so changing this value after it's been created has no effect
		*		items: [], // an array of Menu items.  these are displayed in either left-right order or top-down order depending on options.direction
		*		color: "", // a valid color for css
		*		size: 0, // behavior depends on the direction, when horizontal this is the height in pixels, when vertical this is the width in pixels.  If horizontal, the menu will default to being as tall as the button elements, but when vertical, the menu will default to be the width of the page
		*	}
	*/
	constructor(menuContainer, options){
		if(menuContainer == null){
			return console.error("Menubar can't be created without a <div> element (does not have to exist in DOM)");
		}
		
		// assign div element
		this.menuContainer = typeof menuContainer == "string" ? document.getElementById(menuContainer) : menuContainer;
		
		// parse options
		this.direction = options.direction || "horizontal";
		
		// construct menu bar //
		
		// stylize
		// styles are defined in styles/menubar/
		this.menuContainer.classList.add("menubar-" + this.direction);
		this.menuContainer.style["background-color"] = options.color || "white";
		if(options.size){
			if(this.direction == "horizontal"){
				this.menuContainer.style["height"] = options.size + "px";
			} else if(this.direction == "vertical"){
				this.menuContainer.style["width"] = options.size + "px";
			}
		}
		
		// add Menu items
		for(let i = 0; i < options.items.length; i++){
			this.addMenuButton(options.items[i]);
		}
	}
	
	/**
		*	@brief Add a new MenuButton to this Menubar
		*
		*	This method can either be called with a Menu object and no options object, or the parameters for constructing a Menu object as a table
		*
		*	@param menu either an instance of a Menu object or an object containing the parameters for the Menu constructor (in which case, a new Menu object will be constructed)
	*/
	addMenuButton(menu){
		// constructed menu item
		let item;
		
		// check if menu needs to be constructed 
		if( !(menu instanceof MenuButton) ){
			item = new MenuButton(menu);
		} else {
			item = menu;
		}
		
		// push item's dom element to menubar's div element (stylizing then covered by css)
		this.menuContainer.appendChild(item.mainButton);
	}
};