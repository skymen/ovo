function GetBehaviorSettings()
{
	return {
		"name":			"LiteTween",		// as appears in 'add behavior' dialog, can be changed as long as "id" stays the same
		"id":			"lunarray_LiteTween",		// this is used to identify this behavior and is saved to the project; never change it
		"version":		"1.7",
		"description":	"Tween an object's position, size, angle or other properties using an easing function.",
		"author":		"lunarray",
		"help url":		"",
		"category":		"General",			// Prefer to re-use existing categories, but you can set anything here
    "dependency": "",
		"flags":		0						// uncomment lines to enable flags...
					//	| bf_onlyone			// can only be added once to an object, e.g. solid
	};
};

////////////////////////////////////////
// Parameter types:
// AddNumberParam(label, description [, initial_string = "0"])			// a number
// AddStringParam(label, description [, initial_string = "\"\""])		// a string
// AddAnyTypeParam(label, description [, initial_string = "0"])			// accepts either a number or string
// AddCmpParam(label, description)										// combo with equal, not equal, less, etc.
// AddComboParamOption(text)											// (repeat before "AddComboParam" to add combo items)
// AddComboParam(label, description [, initial_selection = 0])			// a dropdown list parameter
// AddObjectParam(label, description)									// a button to click and pick an object type
// AddLayerParam(label, description)									// accepts either a layer number or name (string)
// AddLayoutParam(label, description)									// a dropdown list with all project layouts
// AddKeybParam(label, description)										// a button to click and press a key (returns a VK)
// AddAudioFileParam(label, description)								// a dropdown list with all imported project audio files

////////////////////////////////////////
// Conditions

// AddCondition(id,					// any positive integer to uniquely identify this condition
//				flags,				// (see docs) cf_none, cf_trigger, cf_fake_trigger, cf_static, cf_not_invertible,
//									// cf_deprecated, cf_incompatible_with_triggers, cf_looping
//				list_name,			// appears in event wizard list
//				category,			// category in event wizard list
//				display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>, and {my} for the current behavior icon & name
//				description,		// appears in event wizard dialog when selected
//				script_name);		// corresponding runtime function name

AddCondition(0, cf_none, "Is active", "", "{my} is active", "True if the movement is currently active.", "IsActive");

AddCmpParam("Comparison", "Select how to compare the tweening progress.");
AddNumberParam("Value", "Value to compare the progress to.");
AddCondition(1, cf_none, "Compare progress", "", "On {my} progress {0} {1}", "Compare the current progress of the tween process.", "CompareProgress");

AddCondition(2,	cf_trigger, "On tween start", "", "On {my} start", "Triggered when tween starts.", "OnStart");                 

AddCondition(4,	cf_trigger, "On tween end", "", "On {my} end", "Triggered when the tween finished and is entering cooldown state.", "OnEnd");

AddCondition(5,	cf_trigger, "On tween reverse start", "", "On {my} reverse start", "Triggered when tween start reversing.", "OnReverseStart");                 

AddCondition(6,	cf_trigger, "On tween reverse end", "", "On {my} reverse end", "Triggered when the tween end reversing.", "OnReverseEnd");

AddCondition(7, cf_none, "Is reversing", "", "{my} is reversing", "True if the tween is currently reversing.", "IsReversing");

AddCmpParam("Comparison", "Select how to compare the tweening progress.");
AddNumberParam("Value", "Value to compare the progress to.");
AddCondition(8, cf_fake_trigger, "On threshold", "", "On {my} pass threshold", "Compare the current progress of the tween process, then fire event when it pass that threshold.", "OnThreshold");

////////////////////////////////////////
// Actions

// AddAction(id,				// any positive integer to uniquely identify this action
//			 flags,				// (see docs) af_none, af_deprecated
//			 list_name,			// appears in event wizard list
//			 category,			// category in event wizard list
//			 display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//			 description,		// appears in event wizard dialog when selected
//			 script_name);		// corresponding runtime function name

//AddComboParamOption("Inactive");
//AddComboParamOption("Active");
//AddComboParam("State", "Set whether the movement is active or inactive.");
//AddAction(0, af_none, "Set active", "Parameter", "Set {my} <b>{0}</b>", "Enable or disable the movement.", "SetActive");

AddNumberParam("Duration", "The time in seconds for the duration of the tween.");
AddAction(1, af_none, "Set duration", "Parameter", "{my} Set duration to <b>{0}</b> second(s)", "Set the time in seconds for the duration of the tween.", "SetDuration");

AddComboParamOption("X");
AddComboParamOption("Y");
AddComboParamOption("Angle");
AddComboParamOption("Opacity");
AddComboParamOption("Width/Scale X");
AddComboParamOption("Height/Scale Y");
AddComboParamOption("Value");
AddComboParam("Target is", "Set target type");
AddComboParamOption("Absolute");
AddComboParamOption("Relative");
AddComboParam("Relativity", "Set if the target is relative or absolute");
AddNumberParam("Value", "Value of position, angle, or whatever to tween to.");
AddAction(3, af_none, "Set target", "Parameter", "{my} Set target {0}({1}) to <b>{2}</b>", "Set the target value of the tween.", "SetTarget");

AddComboParamOption("Position");
AddComboParamOption("Size(Pixel)");
AddComboParamOption("Width");
AddComboParamOption("Height");
AddComboParamOption("Angle");
AddComboParamOption("Opacity");
AddComboParamOption("Value");
AddComboParamOption("Horizontal");
AddComboParamOption("Vertical");
AddComboParamOption("Scale");
AddComboParam("Tweened property", "Select the tweened property to.");
AddAction(4, af_none, "Set tweened property", "Parameter", "{my} Set tweened property to <b>{0}</b>", "Set the type of tweened property.", "SetTweenedProperty");

AddComboParamOption("Linear");
AddComboParamOption("EaseInQuad");
AddComboParamOption("EaseOutQuad");
AddComboParamOption("EaseInOutQuad");
AddComboParamOption("EaseInCubic");
AddComboParamOption("EaseOutCubic");
AddComboParamOption("EaseInOutCubic");
AddComboParamOption("EaseInQuart");
AddComboParamOption("EaseOutQuart");
AddComboParamOption("EaseInOutQuart");
AddComboParamOption("EaseInQuint");
AddComboParamOption("EaseOutQuint");
AddComboParamOption("EaseInOutQuint");
AddComboParamOption("EaseInCircle");
AddComboParamOption("EaseOutCircle");
AddComboParamOption("EaseInOutCircle");
AddComboParamOption("EaseInBack");
AddComboParamOption("EaseOutBack");
AddComboParamOption("EaseInOutBack");
AddComboParamOption("EaseInElastic");
AddComboParamOption("EaseOutElastic");
AddComboParamOption("EaseInOutElastic");
AddComboParamOption("EaseInBounce");
AddComboParamOption("EaseOutBounce");
AddComboParamOption("EaseInOutBounce");
AddComboParamOption("EaseInSmoothstep");
AddComboParamOption("EaseOutSmoothstep");
AddComboParamOption("EaseInOutSmoothstep");
AddComboParam("Function", "Select the easing function to apply.");
AddAction(5, af_none, "Set easing", "Parameter", "{my} Set easing function to <b>{0}</b>", "Set the easing function used to calculate movement.", "SetEasing");

AddComboParamOption("Compromise");
AddComboParamOption("Enforce");
AddComboParam("Enforce mode", "Set to enforce or compromise tween result");
AddAction(6, af_none, "Set enforce", "Parameter", "{my} Set enforce mode to <b>{0}</b>", "Set whether to enforce tween to object or compromise results", "SetEnforce");

AddComboParamOption("Start from the beginning");
AddComboParamOption("Resume at current progress");
AddComboParamOption("Ping pong");
AddComboParamOption("Loop");
AddComboParamOption("Flip Flop");
AddComboParam("Start Mode", "Set wether to start at the beginning, or current position ");
AddComboParamOption("Start from last recorded");
AddComboParamOption("Start from current");
AddComboParam("Force use current", "Set whether to always recalculate current position/size/etc or use last recorded ones.");
AddAction(10, af_none, "Start", "Playback control", "{my} <b>{0}</b>", "Start the tween.", "Start");

AddComboParamOption("Reverse from current");
AddComboParamOption("Reverse from the end");
AddComboParam("Reverse mode", "Set wether to reverse from the tween end, or from current position ");
AddAction(11, af_none, "Reverse", "Playback control", "{my} <b>{0}</b>", "Reverse the tween.", "Reverse");

AddComboParamOption("Pause at current position");
AddComboParamOption("Stop at tween start");
AddComboParamOption("Stop at tween target");
AddComboParam("Stop Mode", "Set wether to stop at the beginning, current position or tween target.");
AddAction(14, af_none, "Stop", "Playback control", "{my} <b>{0}</b>", "Stop the tween.", "Stop");

AddNumberParam("Seek to", "Seek target, from begining (0) to end (1), regardless of duration");
AddAction(15, af_none, "Seek", "Playback control", "{my} Seek to <b>{0}</b>", "Seek the tween.", "ProgressTo");

AddNumberParam("Value", "Set the the tweened value");
AddAction(16, af_none, "Set value", "Parameter", "{my} set value to <b>{0}</b>", "Set value for tween value case.", "SetValue");

AddComboParamOption("Position");
AddComboParamOption("Size(Pixel)");
AddComboParamOption("Width");
AddComboParamOption("Height");
AddComboParamOption("Angle");
AddComboParamOption("Opacity");
AddComboParamOption("Value");
AddComboParamOption("Horizontal");
AddComboParamOption("Vertical");
AddComboParamOption("Scale");
AddComboParam("Tweened property", "Select the tweened property to.");
AddComboParamOption("Linear");
AddComboParamOption("EaseInQuad");
AddComboParamOption("EaseOutQuad");
AddComboParamOption("EaseInOutQuad");
AddComboParamOption("EaseInCubic");
AddComboParamOption("EaseOutCubic");
AddComboParamOption("EaseInOutCubic");
AddComboParamOption("EaseInQuart");
AddComboParamOption("EaseOutQuart");
AddComboParamOption("EaseInOutQuart");
AddComboParamOption("EaseInQuint");
AddComboParamOption("EaseOutQuint");
AddComboParamOption("EaseInOutQuint");
AddComboParamOption("EaseInCircle");
AddComboParamOption("EaseOutCircle");
AddComboParamOption("EaseInOutCircle");
AddComboParamOption("EaseInBack");
AddComboParamOption("EaseOutBack");
AddComboParamOption("EaseInOutBack");
AddComboParamOption("EaseInElastic");
AddComboParamOption("EaseOutElastic");
AddComboParamOption("EaseInOutElastic");
AddComboParamOption("EaseInBounce");
AddComboParamOption("EaseOutBounce");
AddComboParamOption("EaseInOutBounce");
AddComboParamOption("EaseInSmoothstep");
AddComboParamOption("EaseOutSmoothstep");
AddComboParamOption("EaseInOutSmoothstep");
AddComboParam("Function", "Select the easing function to apply.");
AddStringParam("Target", "Target value of position, angle, or whatever to tween to (for position it is x,y).");
AddNumberParam("Duration", "The time in seconds for the duration of the tween.");
AddComboParamOption("Compromise");
AddComboParamOption("Enforce");
AddComboParam("Enforce mode", "Set to enforce or compromise tween result");
AddAction(26, af_none, "Create/Initialize tween", "Tween Management", "{my} Initialize tween", "Set all parameter at once.", "SetParameter");
                                         
AddComboParamOption("Linear");
AddComboParamOption("EaseInQuad");
AddComboParamOption("EaseOutQuad");
AddComboParamOption("EaseInOutQuad");
AddComboParamOption("EaseInCubic");
AddComboParamOption("EaseOutCubic");
AddComboParamOption("EaseInOutCubic");
AddComboParamOption("EaseInQuart");
AddComboParamOption("EaseOutQuart");
AddComboParamOption("EaseInOutQuart");
AddComboParamOption("EaseInQuint");
AddComboParamOption("EaseOutQuint");
AddComboParamOption("EaseInOutQuint");
AddComboParamOption("EaseInCircle");
AddComboParamOption("EaseOutCircle");
AddComboParamOption("EaseInOutCircle");
AddComboParamOption("EaseInBack");
AddComboParamOption("EaseOutBack");
AddComboParamOption("EaseInOutBack");
AddComboParamOption("EaseInElastic");
AddComboParamOption("EaseOutElastic");
AddComboParamOption("EaseInOutElastic");
AddComboParamOption("EaseInBounce");
AddComboParamOption("EaseOutBounce");
AddComboParamOption("EaseInOutBounce");
AddComboParamOption("EaseInSmoothstep");
AddComboParamOption("EaseOutSmoothstep");
AddComboParamOption("EaseInOutSmoothstep");
AddComboParam("Function", "Select the easing function to apply.");
AddNumberParam("Arguments a", "The a parameter");
AddNumberParam("Arguments p", "The p parameter");
AddNumberParam("Arguments t", "The t parameter");
AddNumberParam("Arguments s", "The s parameter");
AddAction(27, af_none, "Set easing parameter", "Parameter", "{my} Set easing parameter", "Set easing parameter to tweak the wobbles etc.", "SetEasingParam");

AddAction(28, af_none, "Reset easing parameter", "Parameter", "{my} Reset easing parameter", "Reset easing parameter to default value", "ResetEasingParam");


////////////////////////////////////////
// Expressions

// AddExpression(id,			// any positive integer to uniquely identify this expression
//				 flags,			// (see docs) ef_none, ef_deprecated, ef_return_number, ef_return_string,
//								// ef_return_any, ef_variadic_parameters (one return flag must be specified)
//				 list_name,		// currently ignored, but set as if appeared in event wizard
//				 category,		// category in expressions panel
//				 exp_name,		// the expression name after the dot, e.g. "foo" for "myobject.foo" - also the runtime function name
//				 description);	// description in expressions panel
//new cr.Property(ept_text,		"Initial",				"current",		"Initialize to position, angle, size, etc. Set to 'current' to use current object position, angle, etc."),

AddExpression(0, ef_return_number, "Get progress",				"", "Progress",			"Return the current progress of the tween as a number from 0 to 1.");
AddExpression(1, ef_return_number, "Get value",				"", "Value",			"Return the current tweened value for the tween value case.");
AddExpression(2, ef_return_number, "Get target",				"", "Target",			"Return the current target value for the tween.");
AddExpression(3, ef_return_number, "Get duration",				"", "Duration",			"Return the duration for the tween.");
AddExpression(4, ef_return_string, "Get state",				"", "State",			"Return the duration for the tween.");
AddNumberParam("A", "The lower bound value for tween");
AddNumberParam("B", "The upper bound value for tween");
AddNumberParam("X", "The factor value");
AddNumberParam("Type", "The tween type");
AddExpression(5, ef_return_number, "Get tween",				"", "Tween",			"Return tween as in lerp.");

////////////////////////////////////////
ACESDone();

////////////////////////////////////////
// Array of property grid properties for this plugin
// new cr.Property(ept_integer,		name,	initial_value,	description)		// an integer value
// new cr.Property(ept_float,		name,	initial_value,	description)		// a float value
// new cr.Property(ept_text,		name,	initial_value,	description)		// a string
// new cr.Property(ept_combo,		name,	"Item 1",		description, "Item 1|Item 2|Item 3")	// a dropdown list (initial_value is string of initially selected item)

var property_list = [
	new cr.Property(ept_combo, 		"Active on start",		"Yes",			"Enable the behavior at the beginning of the layout.", "No|Yes|Ping Pong|Loop|Flip Flop"),
	new cr.Property(ept_combo,		"Tweened Property",		"Position", 	"Select what property of the object to modify.", "Position|Size|Width|Height|Angle|Opacity|Value|Horizontal|Vertical|Scale"),
	new cr.Property(ept_combo,		"Function",				"EaseOutBounce","Select the kind of easing function used to calculate the movement.", "Linear|EaseInQuad|EaseOutQuad|EaseInOutQuad|EaseInCubic|EaseOutCubic|EaseInOutCubic|EaseInQuart|EaseOutQuart|EaseInOutQuart|EaseInQuint|EaseOutQuint|EaseInOutQuint|EaseInCircle|EaseOutCircle|EaseInOutCircle|EaseInBack|EaseOutBack|EaseInOutBack|EaseInElastic|EaseOutElastic|EaseInOutElastic|EaseInBounce|EaseOutBounce|EaseInOutBounce|EaseInSmoothstep|EaseOutSmoothstep|EaseInOutSmoothstep"),
	new cr.Property(ept_text,		  "Target",				"100,100",		"Tween target position, angle, size, etc"),
	new cr.Property(ept_combo,		"Target Mode",		"Absolute",		"Tween target mode, absolute or relative", "Absolute|Relative"),
	new cr.Property(ept_float,		"Duration",				2.5,			"Duration of tween in seconds."),
	new cr.Property(ept_combo,		"Enforce mode",				"Enforce",		"Enforce or compromise the resulting coordinate/size etc, if something other changed the object's tweened property (i.e: other tween, behavior, etc)", "Compromise|Enforce")
	];
	
// Called by IDE when a new behavior type is to be created
function CreateIDEBehaviorType()
{
	return new IDEBehaviorType();
}

// Class representing a behavior type in the IDE
function IDEBehaviorType()
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
}

// Called by IDE when a new behavior instance of this type is to be created
IDEBehaviorType.prototype.CreateInstance = function(instance)
{                                                                                 
	return new IDEInstance(instance, this);
}

// Class representing an individual instance of the behavior in the IDE
function IDEInstance(instance, type)
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
	
	// Save the constructor parameters
	this.instance = instance;
	this.type = type;
	
	// Set the default property values from the property table
	this.properties = {};
	
	for (var i = 0; i < property_list.length; i++)
		this.properties[property_list[i].name] = property_list[i].initial_value;
		
	// any other properties here, e.g...
	// this.myValue = 0;
}

// Called by the IDE after all initialization on this instance has been completed
IDEInstance.prototype.OnCreate = function()
{
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}
