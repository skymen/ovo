function GetBehaviorSettings()
{
	return {
		"name":			"Polar Coordinates",			// as appears in 'add behavior' dialog, can be changed as long as "id" stays the same
		"id":			"SkymenPolarCoordinates",			// this is used to identify this behavior and is saved to the project; never change it
		"version":		"1.0",					// (float in x.y format) Behavior version - C2 shows compatibility warnings based on this
		"description":	"Switch the object's orthogonal positionning to a polar one.",
		"author":		"Skymen",
		"help url":		"",
		"category":		"Attributes",				// Prefer to re-use existing categories, but you can set anything here
		"flags":		0						// uncomment lines to enable flags...
						| bf_onlyone			// can only be added once to an object, e.g. solid
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
AddCondition(0, cf_none, "Is Enabled", "General", "{my} is enabled", "Is true if the behavior is enabled", "IsEnabled");

AddCmpParam("Comparison", "How to compare Radius")
AddNumberParam("Value", "Number to compare Radius" , "0")
AddCondition(1, cf_none, "Compare Radius", "General", "{my} : Radius {0} {1}", "Compare Radius", "CompareRadius");

AddCmpParam("Comparison", "How to compare Angle")
AddNumberParam("Value", "Number to compare Angle" , "0")
AddCondition(2, cf_none, "Compare Angle", "General", "{my} : Angle {0} {1}", "Compare Angle", "CompareAngle");


AddCmpParam("Comparison", "How to compare Origin X")
AddNumberParam("Value", "Number to compare Origin X" , "0")
AddCondition(3, cf_none, "Compare Origin X", "General", "{my} : Origin X {0} {1}", "Compare Origin X", "CompareOriginX");

AddCmpParam("Comparison", "How to compare Origin Y")
AddNumberParam("Value", "Number to compare Origin Y" , "0")
AddCondition(4, cf_none, "Compare Origin Y", "General", "{my} : Origin Y {0} {1}", "Compare Origin Y", "CompareOriginY");
////////////////////////////////////////
// Actions

// AddAction(id,				// any positive integer to uniquely identify this action
//			 flags,				// (see docs) af_none, af_deprecated
//			 list_name,			// appears in event wizard list
//			 category,			// category in event wizard list
//			 display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//			 description,		// appears in event wizard dialog when selected
//			 script_name);		// corresponding runtime function name

// example
AddComboParamOption("Enabled")
AddComboParamOption("Disabled")
AddComboParam("", "Enable or disable the behavior", "Disabled")										// combo with equal, not equal, less, etc.
AddAction(0, af_none, "Set enabled", "General", "{my} : Set {0}", "Enable or disable the behavior", "SetEnabled");

AddNumberParam("Radius", "Set Radius, aka the distance from the origin" , "0")
AddAction(1, af_none, "Set Radius", "General", "{my} : Set Radius to {0}", "Set Radius", "SetRadius");

AddNumberParam("Angle", "Set Angle, aka the angle from the origin" , "0")
AddAction(2, af_none, "Set Angle", "General", "{my} : Set Angle to {0}", "Set Angle", "SetAngle");

AddNumberParam("Radius", "Set Radius, aka the distance from the origin" , "0")
AddNumberParam("Angle", "Set Angle, aka the angle from the origin" , "0")
AddAction(3, af_none, "Set Delta Position", "General", "{my} : Set Delta Pos to ({0},{1})", "Set the position using polar Coordinates", "SetDeltaPos");

AddNumberParam("Origin X", "Set Origin X, in regular coordinates" , "0")
AddAction(4, af_none, "Set OriginX", "General", "{my} : Set Origin X to {0}", "Set Origin X, aka the distance from the origin", "SetOriginX");

AddNumberParam("Origin Y", "Set Origin Y, in regular coordinates" , "0")
AddAction(5, af_none, "Set OriginY", "General", "{my} : Set Origin Y to {0}", "Set Origin Y, aka the distance from the origin", "SetOriginY");

AddNumberParam("Origin X", "Set Origin X, in regular coordinates" , "0")
AddNumberParam("Origin Y", "Set Origin Y, in regular coordinates" , "0")
AddAction(6, af_none, "Set Origin Position", "General", "{my} : Set Origin Pos to ({0},{1})", "Set the position using polar Coordinates", "SetOriginPos");

AddComboParamOption("Use current X/Y")
AddComboParamOption("Use behavior's Radius/Y")
AddComboParam("Update Method", "Use current X/Y", "Use current X/Y position as polar coordinates")
AddAction(7, af_none, "Update", "General", "{my} : Update Position", "Only call if you set X/Y position and would like to set it back to polar coordinates", "Update");

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
AddExpression(0, ef_return_number, "Radius", "General", "Radius", "Return the Radius.");

AddExpression(1, ef_return_number, "Angle", "General", "Angle", "Return Angle");

AddExpression(2, ef_return_number, "Origin X", "General", "OriginX", "Return the Origin X.");

AddExpression(3, ef_return_number, "Origin Y", "General", "OriginY", "Return the Origin Y.");

AddExpression(4, ef_return_string, "Status", "General", "Status", "Return the status (Enabled or Disabled)");

AddExpression(5, ef_return_number|ef_deprecated, "DeltaX", "General", "DeltaX", "Return the Radius.");

AddExpression(6, ef_return_number|ef_deprecated, "DeltaY", "General", "DeltaY", "Return Angle");

AddNumberParam("X", "X, in regular coordinates" , "0")
AddNumberParam("Y", "Y, in regular coordinates" , "0")
AddNumberParam("Origin X", "Origin X, in regular coordinates" , "0")
AddNumberParam("Origin Y", "Origin Y, in regular coordinates" , "0")
AddExpression(7, ef_return_number, "CarToPolRad", "Conversion", "CarToPolRad", "Converts Carthesian coordinates to Polar coordinates");

AddNumberParam("X", "X, in regular coordinates" , "0")
AddNumberParam("Y", "Y, in regular coordinates" , "0")
AddNumberParam("Origin X", "Origin X, in regular coordinates" , "0")
AddNumberParam("Origin Y", "Origin Y, in regular coordinates" , "0")
AddExpression(8, ef_return_number, "CarToPolAngle", "Conversion", "CarToPolAngle", "Converts Carthesian coordinates to Polar coordinates");

AddNumberParam("Radius", "The distance to the origin" , "0")
AddNumberParam("Angle", "The angle to the origin" , "0")
AddNumberParam("Origin X", "Origin X, in regular coordinates" , "0")
AddExpression(9, ef_return_number, "PolToCarX", "Conversion", "PolToCarX", "Converts Polar coordinates to Carthesian coordinates");

AddNumberParam("Radius", "The distance to the origin" , "0")
AddNumberParam("Angle", "The angle to the origin" , "0")
AddNumberParam("Origin Y", "Origin Y, in regular coordinates" , "0")
AddExpression(10, ef_return_number, "PolToCarY", "Conversion", "PolToCarY", "Converts Polar coordinates to Carthesian coordinates");
////////////////////////////////////////
ACESDone();

////////////////////////////////////////
// Array of property grid properties for this plugin
// new cr.Property(ept_integer,		name,	initial_value,	description)		// an integer value
// new cr.Property(ept_float,		name,	initial_value,	description)		// a float value
// new cr.Property(ept_text,		name,	initial_value,	description)		// a string
// new cr.Property(ept_combo,		name,	"Item 1",		description, "Item 1|Item 2|Item 3")	// a dropdown list (initial_value is string of initially selected item)

var property_list = [
	new cr.Property(ept_float, 	"OriginX",		0,			"Set the X coordinate of the origin"),
	new cr.Property(ept_float, 	"OriginY",		0,			"Set the Y coordinate of the origin"),
	new cr.Property(ept_float, 	"Radius",			0,			"Set the Radius coordinate of the object"),
	new cr.Property(ept_float, 	"Angle",			0,			"Set the Angle coordinate of the object"),
	new cr.Property(ept_combo, 		"Status",		"Enabled",	"Set enabled or disabled", "Enabled|Disabled")
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
	/*
	if(property_name === "Radius" || property_name === "Angle" || property_name === "OriginY" || property_name === "OriginX" ){
		this.inst.x = this.properties["OriginX"] + Math.cos(this.properties["Angle"]) * this.properties["Radius"];
		this.inst.y = this.properties["OriginY"] + Math.sin(this.properties["Angle"]) * this.properties["Radius"];
	}
	*/
}
