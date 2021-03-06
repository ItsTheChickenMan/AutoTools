/**
  * @brief Index of all actions that can be performed in autonomous by default, using a 4 wheel mecanum drive.  More actions can be added through custom action indexes.
  *
  * The mecanum default action index assumes there exists four DcMotorEx motors, each named frontLeft, frontRight, backLeft, and backRight.  The absence of any of these will cause a compilation error.  It requires nothing else, and other parts can safely exist in Config without causing conflict.
  *
  * Custom action indexes can be created by creating classes which extend this one, and action indexes can be created by extending other custom action indexes as long as the top-most superclass extends Config.  For this reason, other action indexes should probably be a template with their superclass being a block called "superclass".  This would ensure that the program can figure out on its own who inherits from who without the user having to deal with it.
*/

/*
Copyright 2022 Phoenix Dalla Costa

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial
portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

package org.firstinspires.ftc.teamcode.actions;

import com.qualcomm.robotcore.util.ElapsedTime;
import com.qualcomm.robotcore.hardware.DcMotor;

// NOTE: be sure to use bracket notation for templates in the superclass template block
public class MecanumDefaultActionIndex extends $[superclass] {
	// global vars
	
	$(globals,
	public double motorTpr = 0; // no default
	
	public DcMotor.Direction frontLeftMotorDirection    =   DcMotor.Direction.FORWARD;
	public DcMotor.Direction frontRightMotorDirection   =   DcMotor.Direction.FORWARD;
	public DcMotor.Direction backLeftMotorDirection     =   DcMotor.Direction.FORWARD;
	public DcMotor.Direction backRightMotorDirection    =   DcMotor.Direction.FORWARD;
	)
	
  /**
    * @brief Global timer for timing actions
  */
  private ElapsedTime globalTimer;

  /**
    * @brief Set all motors to one power
    *
    * @param power power to set motors to
  */
  public void setMotorPowers(double power){
    this.frontLeft.setPower(power);
    this.frontRight.setPower(power);
    this.backLeft.setPower(power);
    this.backRight.setPower(power);
  }

  /**
    * @brief Set each individual motor's power
    *
    * Parameters are in frontLeft, frontRight, backLeft, backRight order (or "book" order)
    *
    * @param fl frontLeft power
    * @param fr frontRight power
    * @param bl backLeft power
    * @param br backRight power
  */
  public void setMotorPowers(double fl, double fr, double bl, double br)
  {
    this.frontLeft.setPower(fl);
    this.frontRight.setPower(fr);
    this.backLeft.setPower(bl);
    this.backRight.setPower(br);
  }
	
	/**
		*	@brief Go to a particular position on the field
		*
		*	This is the default movement method used by path2java.  All nodes have this implicitly included as the node's final action, except for the final node
		* 
		* To change it, create a new action index and override this method
		*	
		*	@todo don't expose as valid action
	*/
	public void goTo(double x, double y, double velocity){
		double xDisplacement = x-xPosition;
		double yDisplacement = y-yPosition;
		
		this.compoundMoveStraight(yDisplacement, xDisplacement, velocity);
	}
	
	/**
		*	@brief Move some distance forward and sideways, in a straight line
	*/
	public void compoundMoveStraight(double forward, double strafe, double velocity){
		// insert code here
	}
	
	/**
		*	@brief pivot
		*
		*	@param degrees amount, in degrees, to pivot
	*/
	public void pivot(double degrees, double speed){
		// insert code here
	}
}