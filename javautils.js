// TODO: this entire file isn't tabbed correctly (tabbed with spaces) because it's from repl.  thanks repl!

/**
 * @brief Return the class name and class name of class it's inheriting of a class in a java file
 * 
 * @param file file data to pull class name from
 * @returns the class name 
 */
function getClassNameAndInheritance(file){
	// gets classname string
	const classRegex = /class .* extends .* {/gm;
	
	let classNameString = file.match(classRegex);
	
	console.log(classNameString);
	
	return ["", ""];
}

/**
 * @brief Get all methods in a Java file and return an array of each of them represented as an object
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
 * @param file data to pull methods from
 * @return an array of methods represented as tables
 */
function getJavaMethods(file){
  // get file
  //const file = loadFileSync(path);

  // search for function pattern
  // ){ <- indicates the start of a function block
  const funcRegex = /\)\s*{|\)\s*\n\s*{/g; // I'm not good with regex, if you couldn't tell

  const matches = [...file.matchAll(funcRegex)];

  let methods = [];

  // get lines of matches
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
	getJavaMethods: getJavaMethods
};