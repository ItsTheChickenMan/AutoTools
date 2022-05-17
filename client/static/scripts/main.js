// main script for client interface

// MENUBAR TESTING //

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