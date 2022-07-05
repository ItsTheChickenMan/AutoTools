// list file parser
// parses simple list files

// package imports
const fs = require("fs");

/**
	*	@brief Parses a file as a "list"
	*
	*	A list is generally any file which has items separated by a separator and then sub-items separated by a sub-separator, as well as a comment character
	*	
	*	Lists can be without a sub separator (blank char '' or any falsey value) and the return value will be an array of values
	*	
	*	ex (separator comma, sub-separator equals sign):
	*	Type=DcMotor,Name=leftMotor,Another Value=Something Else
	*	
	*	A list can be in two modes: "key-val" or "multiple"
	* key-val will treat the first item in the sub-separator as the key to the following value by returning a table with the corresponding values
	*	multiple will treat all items separated by the sub-separator as a sub-list of relevant values by returning an array with subarrays
	*
	*	@param path the path to the list file
	*	@param separator the initial separator
	*	@param subSeparator the sub-separator for the sub-values
	*	@param mode the mode, either "key-val" or "multiple" (defaults to "multiple") for the parser.  This value doesn't matter if no sub-separator is specified(see above)
	*	@return either a table (key-val) or an array (multiple) depending on mode
*/
function parseListFile(path, commentChar, separator, subSeparator, mode="multiple"){
	// load contents of file
	// TODO: make this async, would do now but I don't feel like changing the functionality of every function which is going to use this
	let contents = fs.readFileSync(path).toString();
	
	// split by main separator
	items = contents.split(separator);
	
	// table of items
	let list = mode == "key-val" ? {} : [];
	
	// loop through items and create table of items from subSeparator
	for(let item of items){
		// if item starts with commentChar, ignore
		if(!item || item.length == 0 || item[0] == commentChar) continue;
		
		if(!subSeparator || subSeparator == ''){
			list.push(item);
		} else {
			let vals = item.split(subSeparator);
		
			if(mode == "key-val"){
				let key = vals[0];
				let value = vals[1];
				
				list[key] = value;
			} else {
				list.push(vals);
			}
		}
	}
	
	return list;
}

module.exports = parseListFile;