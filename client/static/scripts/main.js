// main script for client interface

// MENUBAR TESTING //

let m = new Menubar("menu-bar", {
	direction: "horizontal",
	items: [
		{
			name: "File",
			itemNames: ["New", "Save"],
			itemActions: [
				function(){
					console.log("New");
				},
				function(){
					console.log("Save");
				}
			]
		},
		{
			name: "Edit",
			itemNames: ["Undo", "Redo"],
			itemActions: [
				function(){
					console.log("Undo");
				},
				function(){
					console.log("Redo");
				}
			]
		}
	]
});