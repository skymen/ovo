function GetBehaviorSettings()
{
	return {
		"name":			"Dialog",
		"id":			"aekiro_dialog",
		"version":		"1.0",
		"description":	"Makes a sprite/9patch object behave like a dialog.",
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

AddCondition(0,	cf_trigger, "On Dialog Opened", "", "On {my} Opened", "Triggered when the dialog is opened.", "onDialogOpened");
AddCondition(1,	cf_trigger, "On Dialog Closed", "", "On {my} Closed", "Triggered when the dialog is closed.", "onDialogClosed");
AddCondition(2,	0, "Is Dialog Opened", "", "Is {my} Opened", "True if the dialog is opened.", "isOpened");


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

AddNumberParam("Target X","Target X of the dialog. Ignored if center = yes.");
AddNumberParam("Target Y","Target Y of the dialog. Ignored if center = yes.");
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Center","Automatically center in the viewport. TargetX/Y will be ignored.",1);

AddAction(0, 0, "Open", "", "Open {my}", "Open the dialog", "Open");
AddAction(1, 0, "Close", "", "Close {my}", "Close the dialog", "Close");

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
//new cr.Property(ept_combo,"showOverlay","No","show an overlay beneath the dialog", "Yes|No")
//new cr.Property(ept_combo,"Overlay Animation","None","Animation of the overlay", "None|Smooth"),
var property_list = [
	new cr.Property(ept_combo,"Open Animation","None","Animation to play when opened", "None|SlideDown|SlideUp|SlideLeft|SlideRight|ScaleDown|ScaleUp"),
	new cr.Property(ept_combo,"Open Animation Tweenning","Quadratic Out","Tweening function of the opening animation.", "Linear|Quadratic Out|Quartic Out|Exponential Out|Circular Out|Back Out|Elastic Out|Bounce Out"),
	new cr.Property(ept_text,"Open Sound","","Sound to play when the dialog opens."),
	new cr.Property(ept_integer,"Open Animation Duration",300,"The duration of the open animation."),
	new cr.Property(ept_combo,"Close Animation","None","Animation to play when opened", "None|Reverse|SlideDown|SlideUp|SlideLeft|SlideRight|ScaleDown|ScaleUp"),
	new cr.Property(ept_combo,"Close Animation Tweenning","Quadratic Out","Tweening function of the closing animation.", "Linear|Quadratic Out|Quartic Out|Exponential Out|Circular Out|Back Out|Elastic Out|Bounce Out"),
	new cr.Property(ept_text,"Close Sound","","Sound to play when the dialog closes."),
	new cr.Property(ept_integer,"Close Animation Duration",300,"The duration of the close animation."),
	new cr.Property(ept_text,"Overlay Tag","","The Tag of the dialog's overlay. Won't be shown if 0"),
	new cr.Property(ept_combo,"Pause On Open","No","Pause the game when opened.", "No|Yes"),
	new cr.Property(ept_text,"Close Button Tag","","The Tag of the close button"),
	new cr.Property(ept_combo,"Is Modal","No","If modal, no other dialog can be opened when this is opened.", "No|Yes"),
	new cr.Property(ept_combo,"Is Layer Container","Yes","Treat all the layer objects as children.", "No|Yes")
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

