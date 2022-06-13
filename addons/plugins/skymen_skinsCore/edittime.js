function GetPluginSettings()
{
	return {
		"name":			"Skin Group",				// as appears in 'insert object' dialog, can be changed as long as "id" stays the same
		"id":			"skymen_skinsCore",				// this is used to identify this plugin and is saved to the project; never change it
		"version":      "1.1",					// (float in x.y format) Plugin version - C2 shows compatibility warnings based on this
		"description":	"Allows you to setup and sync skins.",
		"author":		"skymen",
		"help url":		" ",
		"category":		"General",				// Prefer to re-use existing categories, but you can set anything here
		"type":			"object",				// either "world" (appears in layout and is drawn), else "object"
		"rotatable":	false,					// only used when "type" is "world".  Enables an angle property on the object.
		"flags":		0						// uncomment lines to enable flags...
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
AddCondition(0, cf_none, "Is empty", "General", "Is empty", "Checks if no skin has been added.", "IsEmpty");

AddStringParam("Skin tag", "The skin to check.");
AddCondition(1, cf_none, "Has Skin", "General", "Skin {0} exists", "Checks if a given skin has been added.", "HasSkin");

AddStringParam("Skin tag", "The skin to check.");
AddStringParam("Sub skin tag", "The sub skin to check.");
AddCondition(2, cf_none, "Has Sub Skin", "General", "Sub skin {1} exists in skin {0}", "Checks if a given skin has a given subskin.", "HasSubSkin");

AddStringParam("Skin tag", "The skin to check.");
AddCondition(3, cf_trigger, "On Skin Added", "Triggers", "On skin {0} added", "Checks if a given skin has been added.", "OnSkin");

AddStringParam("Skin tag", "The skin to check.");
AddStringParam("Sub skin tag", "The sub skin to check.");
AddCondition(4, cf_trigger, "On Sub Skin Added", "Triggers", "On sub skin {1} added in skin {0}", "Checks if a given sub skin has been added to a given skin.", "OnSubSkin");

AddCondition(5, cf_trigger, "On Any Skin Added", "Triggers", "On any skin", "Checks if any skin has been added.", "OnAnySkin");

AddStringParam("Skin tag", "The skin to check.");
AddCondition(6, cf_trigger, "On Any Sub Skin Added", "Triggers", "On any sub skin added to skin {0}", "Checks if any sub skin has been added to a given skin.", "OnAnySubSkin");

AddCondition(7, cf_trigger, "On Any Sub Skin Added In Any Skin", "Triggers", "On any sub skin added to any skin", "Checks if any sub skin has been added to any skin.", "OnAnySubAnySkin");

AddCondition(8, cf_looping, "For each skin", "Loops", "For each skin", "Repeat the event for each skin.", "ForEachSkin");

AddStringParam("Skin tag", "The skin to check.");
AddCondition(9, cf_looping, "For each sub skin", "Loops", "For each sub skin", "Repeat the event for each sub skin.", "ForEachSubSkin");

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
AddObjectParam("Object", "The object to use as a skin");
AddStringParam("Skin tag", "The skin to set.");
AddComboParamOption("Add all animations as sub skins");
AddComboParamOption("Add specific animation as sub skin");
AddComboParam("Mode", "If set to all animations, then all the sprite's animations will be added as subskins.", 0);
AddStringParam("Animation name", "Ignored if set to all animations mode.");
AddStringParam("Sub Skin tag", "Ignored if set to all animations mode.");
AddAction(0, af_none, "Add skin", "General", "Add {0} as skin {1} with mode {2}", "Add a skin.", "AddSkin");

AddObjectParam("Object", "The object to use as a skin");
AddStringParam("Skin tag", "The skin to set.");
AddStringParam("Sub Skin tag", "The sub skin to set.");
AddStringParam("Animation name", "The animation to set as subskin. Leave empty for default animation.");
AddAction(1, af_none, "Add sub skin", "General", "Add animation {3} of {0} as sub skin {2} of skin {1}", "Add a sub skin.", "AddSubSkin");

AddStringParam("Skin tag", "The skin to set.");
AddAction(2, af_none, "Remove skin", "General", "Remove skin {0}", "Remove a skin.", "RemoveSkin");

AddStringParam("Skin tag", "The skin to remove.");
AddStringParam("Sub Skin tag", "The sub skin to remove.");
AddAction(3, af_none, "Remove skin", "General", "Remove sub skin {1} from skin {0}", "Remove a sub skin.", "RemoveSubSkin");

AddAction(4, af_none, "Initial skin setup", "General", "Initial skins are setup.", "This action needs to be called after the initial skins have been setup.", "Init");

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
AddExpression(0, ef_return_string, "CurSkin", "Loops", "CurSkin", "Returns the tag of the current skin.");

AddExpression(1, ef_return_string, "CurSubSkin", "Loops", "CurSubSkin", "Returns the tag of the current sub skin.");

AddExpression(2, ef_return_string, "LastSkin", "Triggers", "LastSkin", "Returns the tag of the last skin.");

AddExpression(3, ef_return_string, "LastSubSkin", "Triggers", "LastSubSkin", "Returns the tag of the last sub skin.");

AddExpression(4, ef_return_string, "RandomSkin", "General", "RandomSkin", "Returns a random skin.");

AddStringParam("Skin tag", "The skin to check.");
AddExpression(5, ef_return_string, "RandomSubSkin", "General", "RandomSubSkin", "Returns a random sub skin of a given skin.");

////////////////////////////////////////
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
	new cr.Property(ept_text,		"tag",	"",	"The tag of that skin group")		// a string
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