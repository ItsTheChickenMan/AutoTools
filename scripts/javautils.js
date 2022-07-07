// TODO: most of this file isn't tabbed correctly (tabbed with spaces) because some of it is from repl.  thanks repl!

/**
	*	@brief Returns true if type is a primitive type, otherwise returns false
	*
	*	@param type the type to check
	*	@return true if it is primitive, false otherwise
*/
function isTypePrimitive(type){
	return ["bool", "char", "byte", "int", "short", "long", "float", "double"].includes(type);
}

/**
	* @brief Return the class name and class name of class it's inheriting of a class in a java file
	* 
	* @param file file data to pull class name from
	* @returns the class name 
*/
function getClassNameAndInheritance(file){
	// gets classname string
	const classRegex = /class .+ extends .+ {/gm;
	
	let classNameString = file.match(classRegex)[0];
	
	// split by spaces
	let classNameSplit = classNameString.split(" ");
	
	if(classNameSplit[0] == "public") classNameSplit.shift();
	
	let out = [];
	
	for(let i = 1; i < classNameSplit.length; i += 2){
		let keyword = classNameSplit[i];
		
		out.push(keyword);
	}
	
	return out;
}

/**
	*	@brief Get all the properties in a java file
	*
	*	Format of each property (an array of these is returned):
	*	{
	*		scope: "public"/"protected"/"private", // the scope of this property
	*		type: string, // type of this property
	*		name: string, // name of this property
	*		value: any/undefined, // initial value of this property, if it has one
	*	}
	*
	*	@note this method can't distinguish between different classes in one file, so it works best with one class per file.  thankfully, that's all I need it for
	*
	*	@param file the file contents to scan for class properties
	*	@param excludedScopes array of string scopes to exclude in response (others will be included)
	*	@return an array of properties (see above for format)
*/
function getClassProperties(file, excludedScopes){
	// include all scopes if excludedScopes isn't defined
	excludedScopes = excludedScopes || [];
	
	// create property regex
	const propertyRegex = /(?:public|protected|private) .+ .+\;/g;
	
	// grab all matches
	let propertyStrings = file.match(propertyRegex);
	
	let properties = [];
	
	// grab specific properties of each match
	for(let propertyString of propertyStrings){
		// split into terms
		/*REGEX:
			/\s*=\s*| |;/g
			
			\s*=\s*: matches the equals sign with any amount of whitespace around it (including 0) (this separates the value and the other terms)
			 : matches a space (which should be between the terms)
			;: matches the finishing semicolon (so it doesn't become part of the value)
		*/
		let terms = propertyString.split(/\s*=\s*| |;/g); // should give something like ["scope", "type", "name", "value", "moreOfValue", ""] (value is split by spaces, but that's only noticeable in strings) or ["scope", "type", "name", ""] if there's no value
		
		// ignore if the scope isn't included
		if(excludedScopes.includes(terms[0])) continue;
		
		// if the type is not a primitive type, specifically extract the value from regex (to avoid it being split by the spaces)
		let value = terms[3];
		
		if(!isTypePrimitive(terms[1])){
			// grab each equals sign and semicolon
			let equalsMatch = Array.from(propertyString.matchAll(/=\s*/gd)).shift(); // using shift to grab the first (to avoid equals signs in the string/thing causing problems)
			let semicolonMatch = Array.from(propertyString.matchAll(/;/g)).pop(); // using pop to grab the last (to avoid semicolons in the string/thing causing problems)
			
			// substring value between the equals sign end and the semicolon
			value = propertyString.substring(equalsMatch.indices[0][1], semicolonMatch.index);
		}
		
		// create property
		let property = {
			scope: terms[0],
			type: terms[1],
			name: terms[2],
			value: value
		};
		
		// add to properties
		properties.push(property);
	}
	
	return properties;
}

/**
	* @brief Get all methods in a java file (assuming only one class) and return an array of each of them represented as an object
	* 
	* The format of returned methods is:
	* declaration: public void example(int param)
	*
	* returns:
	* {
	*  scope: "public",
	*  static: false,
	*  name: "example",
	*  params: [
	*    {
	*      name: "param",
	*      type: "int"
	*    }
	*  ],
	*  returns: "void"
	* }
	*
	*	@note this method can't distinguish between different classes in one file, so it works best with one class per file.  thankfully, that's all I need it for
	*
	* @param file data to pull methods from
	* @param excludedScopes array of string scopes to exclude in response (others will be included)
	* @return an array of methods represented as tables
*/
function getClassMethods(file, excludedScopes){
  // get file
  //const file = loadFileSync(path);

	// if there's no array for excluded scopes, exclude none
	excludedScopes = excludedScopes || [];
	
  // search for function pattern
	// searches specifically for scope, then any amount of characters preceding a open and close paranthesis (with any amount of characters inside) and then an open bracket
	// functions should be the only instances where this pattern occurs
  const funcRegex = /(?:public|protected|private)\s+.+\(.*\)\s*{/g;

  const matches = [...file.matchAll(funcRegex)];

  let methods = [];

  // get lines of matches
	// TODO: now that the regex is improved this can be rewritten to be way better (no getLineAtChar BS required)
  for(let i = 0; i < matches.length; i++){
    let match = matches[i];

    let functionString = getLineAtChar(file, match.index);

    // split by spaces & parenthesis
    let keywords = functionString.split(/\s|\(|\)|,/);

    // strip empty chars from keywords
    for(let i = 0; i < keywords.length; i++){
      if(keywords[i].length == 0){
        keywords.splice(i, 1);
        i--;
      }
    }

    // indices or values of each keyword
    let scope = 0;
    let static = keywords[1] == "static" ? true : false;
    let returns = static ? 2 : 1;
    let name = returns+1;
		
    let method = {
      scope: keywords[scope],
      static: static,
      returns: keywords[returns],
      name: keywords[name],
      params: []
    };

		// ignore method if scope isn't included
		if(excludedScopes.includes(method.scope)){
			continue;
		}
		
    // get parameters
    keywords = keywords.slice(name+1);

    name = "";
    let type = "";

    for(let i = 0; i < keywords.length; i++){
      if(i % 2 == 0){
        type = keywords[i];
      } else {
        name = keywords[i];

        method.params.push({
          name: name,
          type: type
        });
			}
    }

		methods.push(method);
  }

  return methods;
}

// https://stackoverflow.com/a/32673641
function getLineAtChar(data, index) {
  let perLine = data.split('\n');
  let length = 0;

  for(let i = 0; i < perLine.length; i++){
    length += perLine[i].length+1;

    if(index < length){
      return perLine[i];
    }
  }
  
  return 0;
}

module.exports = {
	getClassNameAndInheritance: getClassNameAndInheritance,
	getClassProperties: getClassProperties,
	getClassMethods: getClassMethods
};