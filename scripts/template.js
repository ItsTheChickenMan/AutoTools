// TODO: tabbed incorrectly (with spaces) because of repl

const fs = require("fs");

// template class
class Template {
  /**
   * @brief array of config tags (in blocks $()) and their positions in the file as objects {}
   * 
   * Format is (ex $(TagName)):
   * {
   *  tag: "TagName", // name of tag in block
   *  start: 56, // start is the $
   *  end: 65, // end is the final parenthesis of the block )
   *  data: "" // the data to replace the tag with
   * }
   */
  tags;

  /**
   * @brief String of byte data in the loaded template file
   */
  data;

  constructor(path){
    this.tags = {};
    
    // load template
    let f = this.loadFileSync(path);

    if(f.length == 0){
      console.error("Template file is either empty or does not exist");
      return;
    } else {
      this.data = f;
    }

    this.parseDataIntoTags();
  }

	loadFileSync(path){
		return fs.readFileSync(path).toString();
	}
	
  /**
		* @brief Parses this.data into tags
  */
	// FIXME: rewrite this entire method using RegEx, I have no idea why it's this bad
  parseDataIntoTags(){
    let currentTag = "";
    let currentStart = 0;
    let currentEnd = 0;
		let data = ""; // default data, if defined
    let parsing = false;

    // loop through each byte
    for(let i = 0; i < this.data.length; i++){
      let currentByte = this.data[i];
      let lastByte = this.data[Math.max(0, i-1)];

      // parse tag
      if(parsing){
        // check if block is over
        if( (currentByte == ')' || currentByte == ']') && lastByte != '\\'){
          currentEnd = i;

          // push tag
          this.tags[currentTag] = {
            tag: currentTag,
            start: currentStart,
            end: currentEnd,
            data: data,
						original: this.data.substring(currentStart, currentEnd+1),
						enclosures: currentByte == ")" ? ["(", ")"] : ["[", "]"]
          };
					
          parsing = false;
        } else if(data.length == 0 && currentByte != ',' && currentByte != '\\' && ( (currentByte != '(' && currentByte != '[') || ( (currentByte == '(' || currentByte == '[') && lastByte == '\\') ) ){
          currentTag += currentByte;
        } else if(data.length > 0 || currentByte == ','){ // start collecting data for default
					if(data.length == 0) i++; // skip comma and start data collection
					
					data += this.data[i];
				}
      } else if(currentByte == '$' && lastByte != '\\'){
        currentStart = i;
        currentTag = "";
        parsing = true;
      }
    }
  }

  /**
   * @brief Replace the contents of a tag block with data
   * 
   * @param tag the tag to replace
   * @param data the data to replace the tag block with
   */
  replaceTag(tag, data){
    if(this.tags[tag] == undefined){
      console.error("tag \"" + tag + "\" isn't in template");
			return;
    }

    this.tags[tag].data = data;
  }
	
	/**
		* @brief Add on to the contents of a tag block with additional data
		*
		* @param tag the tag to replace
		* @param data the data to add to the tag block
	*/
	addToTag(tag, data){
		if(this.tags[tag] == undefined){
			console.error("tag \"" + tag + "\" isn't in template");
			return;
		}
		
		this.tags[tag].data += data;
	}
	
  /** 
   * @brief Replace all tag blocks with their data and return the output as a string
   * 
   * @param eofString string to append to the very end of the file
  */
  writeOutput(eofString){
    // clone data
    let datacopy = this.data.slice();

    // replace tags with data
    for(let i of Object.keys(this.tags)){
      let tag = this.tags[i];
			
			// if tag contains any parenthesis or dollar signs, be sure to include those with slashes so the real tag is found
			tag.tag = tag.tag.replace(/\(/g, "\\(");
			tag.tag = tag.tag.replace(/\)/g, "\\)");
			tag.tag = tag.tag.replace(/\$/g, "\\$");
			tag.tag = tag.tag.replace(/\[/g, "\\[");
			tag.tag = tag.tag.replace(/\]/g, "\\]");
			
      datacopy = datacopy.replace(tag.original, tag.data);
    }

    datacopy += eofString || "";

    return datacopy;
  }

  /**
   * @brief Replace all tag blocks with their data and return the output as a blob
   * 
   * @param eofString string to append to the very end of the file
   */
  writeOutputAsBlob(eofString){
    let dataString = this.writeOutput(eofString);

    return new Blob([dataString], {
      type: 'text/plain'
    });
  }
}

module.exports = Template;