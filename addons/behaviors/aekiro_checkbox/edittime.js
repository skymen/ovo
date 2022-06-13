function GetBehaviorSettings()
{
	return {
		"name":			"Checkbox",
		"id":			"aekiro_checkbox",
		"version":		"1.0",
		"description":	"Makes a sprite object behave like a checkbox.",
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
				
AddCondition(0, cf_trigger,"On Mouse Enter","","On Mouse Enter","Triggered when the mouse cursor enter the element.","OnMouseEnter");
AddCondition(1, cf_trigger,"On Mouse Leave","","On Mouse Leave","Triggered when the mouse cursor leave the element.","OnMouseLeave");
AddCondition(2, cf_none, "Is Enabled", "", "{my} is enabled", "True if the checkbox is currently enabled.", "IsEnabled");
AddCondition(3, cf_trigger, "On Clicked", "", "On clicked", "Triggered when the component is clicked.", "OnClicked");
AddCondition(4, cf_none, "Is Checked", "", "{my} is checked", "True if the checkbox is currently checked.", "IsChecked");
////////////////////////////////////////
// Actions

// AddAction(id,				// any positive integer to uniquely identify this action
//			 flags,				// (see docs) af_none, af_deprecated
//			 list_name,			// appears in event wizard list
//			 category,			// category in event wizard list
//			 display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//			 description,		// appears in event wizard dialog when selected
//			 script_name);		// corresponding runtime function name

AddComboParamOption("Disabled");
AddComboParamOption("Enabled");
AddComboParam("State", "The state of the button.");
AddAction(0, 0, "Set enabled", "", "Set the button <i>{0}</i>","Enable/Disable the checkbox.", "setEnabled");

AddComboParamOption("False");
AddComboParamOption("True");
AddComboParam("value", "The new value of the model");
AddAction(1, 0, "set", "", "Set to <i>{0}</i>","Set the value of the checkbox.", "setValue");





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


AddExpression(0, ef_return_number, "Get Value", "", "value", "Get the value of the checkbox.");

////////////////////////////////////////
ACESDone();

////////////////////////////////////////
// Array of property grid properties for this plugin
// new cr.Property(ept_integer,		name,	initial_value,	description)		// an integer value
// new cr.Property(ept_float,		name,	initial_value,	description)		// a float value
// new cr.Property(ept_text,		name,	initial_value,	description)		// a string
// new cr.Property(ept_combo,		name,	"Item 1",		description, "Item 1|Item 2|Item 3")	// a dropdown list (initial_value is string of initially selected item)

var property_list = [
	new cr.Property(ept_combo,"isEnabled","True","Enable/Disable the component.", "False|True"),
	new cr.Property(ept_combo,"isChecked","True","The initial value of the checkbox.", "False|True"),
	new cr.Property(ept_text, "Normal Frames", "","The normal frames in the form of a,b where a is for the unchecked state and b for the checked state."),
	new cr.Property(ept_text, "Hover Frames", "","The hover frames in the form of a,b where a is for the unchecked state and b for the checked state."),
	new cr.Property(ept_text, "Disabled Frames", "","The disabled frames in the form of a,b where a is for the unchecked state and b for the checked state."),
	new cr.Property(ept_text,"Click Sound","","Sound to be played when clicked."),
	new cr.Property(ept_combo,"Click Animation","None","Animation to play when clicked.", "None|Scale Quadratic|Scale Elastic|Down|Up|Left|Right"),
	new cr.Property(ept_text,"Hover Sound","","Sound to be played on mouse enter."),
	new cr.Property(ept_combo,"Hover Animation","None","Animation to play on mouse enter.", "None|Scale Quadratic|Scale Elastic|Down|Up|Left|Right"),
	new cr.Property(ept_text,"Callback Name","","The function name to be called when clicked."),
	new cr.Property(ept_text, "Callback Parameters", "","The function parameters.")
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
}

// Called by the IDE after all initialization on this instance has been completed
IDEInstance.prototype.OnCreate = function()
{
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}
