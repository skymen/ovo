
function GetPluginSettings()
{
	return {
		"name":			"ValerypopoffJS",				// as appears in 'insert object' dialog, can be changed as long as "id" stays the same
		"id":			"ValerypopoffJSPlugin",				// this is used to identify this plugin and is saved to the project; never change it
		"version":		"0.7.0",					// (float in x.y format) Plugin version - C2 shows compatibility warnings based on this
		"description":	"Use javascript functions, get and set object properties and call object methods. Keep event sheets for high-level logic. Implement game objects, and algorithms in javascript.",
		"author":		"Valera Popov",
		"help url":		"http://valerypopoff.ru/construct/js-plugin",
		"category":		"Data & Storage",				// Prefer to re-use existing categories, but you can set anything here
		"type":			"object",				// either "world" (appears in layout and is drawn), else "object"
		"rotatable":	true,					// only used when "type" is "world".  Enables an angle property on the object.
		"flags":		pf_singleglobal						
					// uncomment lines to enable flags...
					//	| pf_singleglobal		// exists project-wide, e.g. mouse, keyboard.  "type" must be "object".
					//	| pf_texture			// object has a single texture (e.g. tiled background)
					//	| pf_position_aces		// compare/set/get x, y...
					//	| pf_size_aces			// compare/set/get width, height...
					//	| pf_angle_aces			// compare/set/get angle (recommended that "rotatable" be set to true)
					//	| pf_appearance_aces	// compare/set/get visible, opacity...
					//	| pf_tiling				// adjusts image editor features to better suit tiled images (e.g. tiled background)
					//	| pf_animations			// enables the animations system.  See 'Sprite' for usage
					//	| pf_zorder_aces		// move to top, bottom, layer...
					//  | pf_nosize				// prevent resizing in the editor
					//	| pf_effects			// allow WebGL shader effects to be added
					//  | pf_predraw			// set for any plugin which draws and is not a sprite (i.e. does not simply draw
												// a single non-tiling image the size of the object) - required for effects to work properly
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
// AddAnimationParam(label, description)								// a string intended to specify an animation name
// AddAudioFileParam(label, description)								// a dropdown list with all imported project audio files

////////////////////////////////////////
// Conditions

// AddCondition(id,					// any positive integer to uniquely identify this condition
//				flags,				// (see docs) cf_none, cf_trigger, cf_fake_trigger, cf_static, cf_not_invertible,
//									// cf_deprecated, cf_incompatible_with_triggers, cf_looping
//				list_name,			// appears in event wizard list
//				category,			// category in event wizard list
//				display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//				description,		// appears in event wizard dialog when selected
//				script_name);		// corresponding runtime function name
				
// example				
//AddNumberParam("Number", "Enter a number to test if positive.");
//AddCondition(0, cf_none, "Is number positive", "My category", "{0} is positive", "Description for my condition!", "MyCondition");

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
//AddStringParam("Message", "Enter a string to alert.");
//AddAction(0, af_none, "Alert", "My category", "Alert {0}", "Description for my action!", "MyAction");

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
//AddExpression(0, ef_return_number, "Leet expression", "My category", "MyExpression", "Return the number 1337.");


// Actions
//-------------------------------------------------

AddStringParam("JS code", "JS string that will be executed with eval. You can include parameters into the string using #-entries like this: #0, #1, #2 ... #999. The string will be parsed and all #-entries will be replaced with respective parameter values."
, ""
);	

AddVariadicParams("Parameter {n}", "Parameter to pass to the code."
);	

AddAction(0, af_none, "Execute JS code", "Eval", "Execute code: {0} ({...})", "Execute JS code with optional parameters and store returned completion value. This action uses eval (stores return value).", "ExecuteJSWithParams");


AddStringParam("JS function name (no parentheses)", "Enter JS function name to call."
, ""
);	

AddVariadicParams("Parameter {n}", "Parameter to pass to the function."
);	

AddAction(1, af_deprecated, "Call JS function (stores return value)", "General", "Call function: {0} ({...})", "Call JS function with optional parameters and store its return value.", "CallJSfunction");


AddStringParam("Expression", "Expression to set."
, ""
);	

AddAnyTypeParam("Value", "Value to set the expression to."
, ""
);	

AddAction(5, af_none, "Set value", "General", "Set {0} to {1}", "Set value.", "SetValue");


AddStringParam("Expression", "Expression to call."
, ""
);	

AddVariadicParams("Parameter {n}", "Parameter to pass to the function."
);	

AddAction(6, af_none, "Call function", "General", "Call {0} ({...})", "Call a function with optional parameters (stores return value).", "Call");


AddStringParam("Alias name", "New alias name to create."
, ""
);	

AddStringParam("JS", "What the alias is associated with in JS."
, ""
);	

AddAction(2, af_none, "Init alias", "Aliases", "Init [{0}] with javascript {1}", "Init alias with javascript code.", "InitAlias");


AddStringParam("Alias expression", "Alias expression to set."
, ""
);	

AddAnyTypeParam("Value", "Value to set the alias expression to."
, ""
);	

AddAction(3, af_deprecated, "Set alias", "Aliases", "Set [{0}] to {1}", "Set value behind alias expression.", "SetAlias");


AddStringParam("Alias expression", "Alias expression to call."
, ""
);	

AddVariadicParams("Parameter {n}", "Parameter to pass to the function."
);	

AddAction(4, af_deprecated, "Call alias (stores return value)", "Aliases", "Call [{0}] ({...})", "Call the function behind alias expression and store its return value.", "CallAlias");


// Conditions
//-------------------------------------------------

AddAnyTypeParam("Value", "The value to compare to."
, ""
);	

AddCmpParam("Comparison", "How to compare."
);	

AddStringParam("JS function name (no parentheses)", "Enter JS function name to call."
, ""
);	

AddVariadicParams("Parameter {n}", "Parameter to pass to the function."
);	

AddCondition(0, cf_deprecated, "Compare Function Return value", "General", "{0} {1} function {2} ({...})", "Call JS function and compare its return value (does NOT store return value).", "C2CompareFunctionReturnValue");


AddAnyTypeParam("Value", "The value to compare to."
, ""
);	

AddCmpParam("Comparison", "How to compare."
);	

AddStringParam("Alias expression", "Alias expression to call."
, ""
);	

AddVariadicParams("Parameter {n}", "Parameter to pass to the function."
);	

AddCondition(5, cf_deprecated, "Compare alias Call", "Aliases", "{0} {1} [{2}] ({...})", "Call JS function behind the alias expression and compare its return value (does NOT store return value).", "C2CompareAliasCallReturnValue");


AddAnyTypeParam("Value", "The value to compare to."
, ""
);	

AddCmpParam("Comparison", "How to compare."
);	

AddStringParam("JS code", "JS string that will be executed with eval. You can include parameters into the string using #-entries like this: #0, #1, #2 ... #999. The string will be parsed and all #-entries will be replaced with respective parameter values."
, ""
);	

AddVariadicParams("Parameter {n}", "Parameter to pass to the code."
);	

AddCondition(1, cf_none, "Compare JS code Completion value", "Eval", "{0} {1} value of {2} ({...})", "Compare completion value of JS code with optional parameters (does NOT store return value). This condition uses eval.", "C2CompareExecReturnWithParams");


AddAnyTypeParam("Value", "The value to compare to."
, ""
);	

AddCmpParam("Comparison", "How to compare."
);	

AddStringParam("Expression", "Expression to compare."
, ""
);	

AddVariadicParams("Parameter {n}", "Parameter to pass to the function."
);	

AddCondition(6, cf_none, "Compare value", "Aliases", "{0} {1} {2} ({...})", "Compare expression value. If the expression is a function, compare its return value (does NOT store return value).", "C2CompareValue");


AddCmpParam("Comparison", "How to compare."
);	

AddAnyTypeParam("Value", "The value to compare to."
, ""
);	

AddCondition(2, cf_none, "Compare Stored Return value", "General", "Stored Return {0} {1}", "Compare last stored return value after actions.", "CompareStoredReturnValue");


AddCondition(3, cf_none, "All scripts loaded", "General", "All scripts loaded", "Check if all scripts are loaded.", "AllScriptsLoaded");


AddStringParam("Alias expression", "Alias expression to compare."
, ""
);	

AddCmpParam("Comparison", "How to compare."
);	

AddAnyTypeParam("Value", "The value to compare to."
, ""
);	

AddCondition(4, cf_deprecated, "Compare alias", "Aliases", "[{0}] {1} {2}", "Compare the value behind the alias expression.", "CompareAliasValue");


// Expressions
//-------------------------------------------------

AddStringParam("JS code", "This expression uses eval. Enter JS string (it will be executed with eval) and optional parameters. If you pass parameters, include them into the string using #-entries like this: #0, #1, #2 ... #999. The string will be parsed and all #-entries will be replaced with respective parameter values."
);	

AddExpression(1, ef_return_any | ef_variadic_parameters, "JSCodeValue", "Eval", "JSCodeValue", "Execute JS code with optional parameters and get its completion value right away (it will NOT store this value). This expression uses eval.");

AddExpression(0, ef_return_any, "StoredReturnValue", "General", "StoredReturnValue", "Get stored return value after actions");

AddStringParam("JS function name (no parentheses)", "Enter JS function name to call."
, ""
);	

AddExpression(4, ef_deprecated | ef_return_any | ef_variadic_parameters, "FunctionReturnValue", "General", "FunctionReturnValue", "Call JS function with optional parameters and get its return value right away (it will NOT store this value).");

AddStringParam("Expression", "Enter expression."
, ""
);	

AddExpression(5, ef_return_any | ef_variadic_parameters, "Value", "General", "Value", "Get expression value. If the expression is a function, get its return value (this value will NOT be stored).");

AddStringParam("Alias expression", "Enter alias expression."
, ""
);	

AddExpression(2, ef_deprecated | ef_return_any, "AliasValue", "Aliases", "AliasValue", "Get alias value");

AddStringParam("Alias expression", "Enter alias expression."
, ""
);	

AddExpression(3, ef_deprecated | ef_return_any | ef_variadic_parameters, "AliasCallReturnValue", "Aliases", "AliasCallReturnValue", "Call the function behind alias expression with optional parameters and get its return value right away (it will NOT store this value).");




ACESDone();

////////////////////////////////////////
// Array of property grid properties for this plugin
// new cr.Property(ept_integer,		name,	initial_value,	description)		// an integer value
// new cr.Property(ept_float,		name,	initial_value,	description)		// a float value
// new cr.Property(ept_text,		name,	initial_value,	description)		// a string
// new cr.Property(ept_color,		name,	initial_value,	description)		// a color dropdown
// new cr.Property(ept_font,		name,	"Arial,-16", 	description)		// a font with the given face name and size
// new cr.Property(ept_combo,		name,	"Item 1",		description, "Item 1|Item 2|Item 3")	// a dropdown list (initial_value is string of initially selected item)
// new cr.Property(ept_link,		name,	link_text,		description, "firstonly")		// has no associated value; simply calls "OnPropertyChanged" on click

var property_list = [
new cr.Property(ept_text, "Script files", "", "Javascript files to include to the game.")
	];
	
	
// Called by IDE when a new object type is to be created
function CreateIDEObjectType()
{
	return new IDEObjectType();
}

// Class representing an object type in the IDE
function IDEObjectType()
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
}

// Called by IDE when a new object instance of this type is to be created
IDEObjectType.prototype.CreateInstance = function(instance)
{
	return new IDEInstance(instance);
}

// Class representing an individual instance of an object in the IDE
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
		
	// Plugin-specific variables
	// this.myValue = 0...
}

// Called when inserted via Insert Object Dialog for the first time
IDEInstance.prototype.OnInserted = function()
{
}

// Called when double clicked in layout
IDEInstance.prototype.OnDoubleClicked = function()
{
}

// Called after a property has been changed in the properties bar
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}

// For rendered objects to load fonts or textures
IDEInstance.prototype.OnRendererInit = function(renderer)
{
}

// Called to draw self in the editor if a layout object
IDEInstance.prototype.Draw = function(renderer)
{
}

// For rendered objects to release fonts or textures
IDEInstance.prototype.OnRendererReleased = function(renderer)
{
}