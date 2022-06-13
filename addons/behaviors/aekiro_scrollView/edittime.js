function GetBehaviorSettings()
{
	return {
		"name":			"Scroll View",
		"id":			"aekiro_scrollView",
		"version":		"1.0",
		"description":	"Makes a sprite object behave like a button.",
		"author":		"AekiroStudio",
		"help url":		"https://later.com",
		"category":		"Pro UI",
		"flags":		bf_onlyone
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
				
// example				


////////////////////////////////////////
// Actions

// AddAction(id,				// any positive integer to uniquely identify this action
//			 flags,				// (see docs) af_none, af_deprecated
//			 list_name,			// appears in event wizard list
//			 category,			// category in event wizard list
//			 display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//			 description,		// appears in event wizard dialog when selected
//			 script_name);		// corresponding runtime function name

AddNumberParam("x", "The distance from the left of the content to scroll to.");
AddNumberParam("y", "The distance from the top of the content to scroll to.");
AddComboParamOption("Absolute");
AddComboParamOption("Percentage");
AddComboParam("Target type", "Absolute: x/y should be the absolute distances from the top/left boundaries of. Percentage: x/y are percentages of the width/height of the content.",0);
AddNumberParam("Smooth scroll factor", "Between 1(instant scroll) and 0. ",0.3);
AddAction(0, af_none, "Scroll to", "", "Scroll to x={0} and y={1}", "Scroll and center(if possible) the scrollView viewport to the target (x,y).", "ScrollTo");



////////////////////////////////////////
// Expressions

// AddExpression(id,			// any positive integer to uniquely identify this expression
//				 flags,			// (see docs) ef_none, ef_deprecated, ef_return_number, ef_return_string,
//								// ef_return_any, ef_variadic_parameters (one return flag must be specified)
//				 list_name,		// currently ignored, but set as if appeared in event wizard
//				 category,		// category in expressions panel
//				 exp_name,		// the expression name after the dot, e.g. "foo" for "myobject.foo" - also the runtime function name
//				 description);	// description in expressions panel

// example


////////////////////////////////////////
ACESDone();

////////////////////////////////////////
// Array of property grid properties for this plugin
// new cr.Property(ept_integer,		name,	initial_value,	description)		// an integer value
// new cr.Property(ept_float,		name,	initial_value,	description)		// a float value
// new cr.Property(ept_text,		name,	initial_value,	description)		// a string
// new cr.Property(ept_combo,		name,	"Item 1",		description, "Item 1|Item 2|Item 3")	// a dropdown list (initial_value is string of initially selected item)

var property_list = [
	new cr.Property(ept_combo,"Scrolling","Vertical","Scrolling direction.", "Vertical|Horizontal|Both"),
	new cr.Property(ept_combo,"Swipe Scroll","Enabled","Swipe scrolling.", "Disabled|Enabled"),
	new cr.Property(ept_combo,"MouseWheel Scroll","Enabled","MouseWheel scrolling.", "Disabled|Enabled"),
	new cr.Property(ept_text,"Content Tag","","Tag of the content"),
	new cr.Property(ept_text,"Vertical Slider Tag","","Tag of the vertical slider"),
	new cr.Property(ept_text,"Vertical ScrollBar Tag","","Tag of the vertical scrollBar"),
	new cr.Property(ept_text,"Horizontal Slider Tag","","Tag of the horizontal slider"),
	new cr.Property(ept_text,"Horizontal ScrollBar Tag","","Tag of the vertical scrollBar"),
	new cr.Property(ept_combo,"Inertia","Enabled","Swipe scrolling.", "Disabled|Enabled"),
	new cr.Property(ept_combo,"Movement type","Elastic","Swipe scrolling.", "Clamped|Elastic"),
	new cr.Property(ept_text,"Dialog Tag","","Tag of the dialog, this scrollview is on."),
];

//new cr.Property(ept_combo,"Horizontal scrolling direction","ltr","Swipe scrolling.", "ltr|rtl")

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
}

// Called by the IDE after all initialization on this instance has been completed
IDEInstance.prototype.OnCreate = function()
{
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}
