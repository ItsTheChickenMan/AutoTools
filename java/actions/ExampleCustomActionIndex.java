/**
	*	@brief An example of what a custom action index looks like.  doesn't have any useful methods.
*/

// the package for all action indexes must be the teamcode package + .actions
package org.firstinspires.ftc.teamcode.actions;

// NOTE: be sure to use bracket notation for templates in the superclass template block so that the javautils parser doesn't think the class is a method
public class ExampleCustomActionIndex extends $[superclass] { // use the superclass block to allow the program to handle what the action index inherits from (either Config or a previous action index)
	// any attributes can be included, and will be exposted to the user if they are public (under Path->See Global Variables in the GUI)
	// any public attributes meant to be exposed to the user (so, all public attributes) should be wrapped by a globals template block, as shown below:
	
	// these will be exposed to the user
	$(globals, // don't forget the comma
	public String exampleGlobalVariable = "This is an example of a global variable which will be exposed to the user"; // the value will also be exposed and can be modified
	public int anotherExampleGlobalVariable; // a default value is not required
	)
	
	// these will not be exposed to the user
	protected String unexposedName;
	
	private double exampleDouble = 5.0;
	private boolean isDoingSomething = false;
	
	/**
		*	@brief A method which can do something (although this does nothing)
		*
		*	All methods meant to be exposed to the user should be public.  protected and private methods will not be.
	*/
	public void exampleMethod(double param, int anotherParam){
		// insert code here
	}
	
	/**
		*	@brief An example of a private method which can only be used within this index
		*
		*	This can't be inherited by the actual auto, so it isn't exposed to the user
	*/
	private void anotherExampleMethod(boolean aDifferentParam){
		// insert code here
	}
}