// simple script for managing logged events
// intended to be a replacement for the many alerts used to log events
// TODO: fully implement, I planned on implementing this now and then I remembered more important things to do

/**
	*	@brief Class for managing a <p> element for logging events
*/
class LogElement {
	// just used for creating default ids when one isn't provided
	static totalLogElements = 0;
	
	/**
		*	@brief Constructs a LogElement
	*/
	constructor(id){
		this.id = id ?? "log-element-" + (totalLogElements+1);
	}
};