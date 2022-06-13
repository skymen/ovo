function GetPluginSettings()
{
	return {
		"name":			"MagiCam",				// as appears in 'insert object' dialog, can be changed as long as "id" stays the same
		"id":			"MagiCam",				// this is used to identify this plugin and is saved to the project; never change it
		"version":		"6.5",					// (float in x.y format) Plugin version - C2 shows compatibility warnings based on this
		"description":	"Allows for the creation of multiple camera objects that can provide advanced scrolling control.",
		"author":		"Chris Hackmann (aka linkman2004)",
		"help url":		"",
		"category":		"General",				// Prefer to re-use existing categories, but you can set anything here
		"type":			"object",				// either "world" (appears in layout and is drawn), else "object"
		"rotatable":	false,					// only used when "type" is "world".  Enables an angle property on the object.
		"flags":		0						// uncomment lines to enable flags...
						| pf_singleglobal		// exists project-wide, e.g. mouse, keyboard.  "type" must be "object".
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
				
// On transition finished
AddStringParam("Camera", "Name of the camera to use - leave blank to use the active camera.");	
AddComboParamOption("Movement");
AddComboParamOption("Zoom");
AddComboParam("Transition", "The type of transition to check for an end to.");
AddCondition(0, cf_none, "On transition finished", "Transitions", "Camera {0}: {1}transition has finished", "Triggered when a transition finishes.", "TransitionFinished");

// Transition is in progress
AddStringParam("Camera", "Name of the camera to use - leave blank to use the active camera.");	
AddComboParamOption("Movement");
AddComboParamOption("Zoom");
AddComboParam("Transition", "The type of transition to check for.");
AddCondition(1, cf_none, "Transition is in progress", "Transitions", "Camera {0}: {1}transition is in progress", "Returns true if a specified type of transition is in progress.", "TransitionIsInProgress");

////////////////////////////////////////
// Actions

// AddAction(id,				// any positive integer to uniquely identify this action
//			 flags,				// (see docs) af_none, af_deprecated
//			 list_name,			// appears in event wizard list
//			 category,			// category in event wizard list
//			 display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//			 description,		// appears in event wizard dialog when selected
//			 script_name);		// corresponding runtime function name

// Following actions (0xx)
// Follow object
AddStringParam("Camera", "Name of the camera to use - leave blank to use the active camera.");
AddObjectParam("Object", "The object to follow.");
AddNumberParam("Weight", "Weight of the object - this effects how much influence the object has on scrolling when there is more than one object being followed.", "1");
AddAnyTypeParam("Image point", "Image point on this object to follow.", "0");
AddAction(0, af_none, "Follow object", "Following", "Camera {0}: Follow {1} with weight of {2} at image point {3}", "Sets the camera to follow an object", "FollowObject");
// Set follow lag
AddStringParam("Camera", "Name of the camera to use - leave blank to use the active camera.");
AddNumberParam("Lag", "Amount of lag when following an object or group of objects expressed as a value from 0-100.", "50");
AddAction(1, af_none, "Set follow lag", "Following", "Camera {0}: Follow with lag of {1}%", "Sets the amount of lag when following a specified object.", "SetFollowLag");
// Zoom to contain
AddStringParam("Camera", "Name of the camera to use - leave blank to use the active camera.");
AddComboParamOption("Zoom");
AddComboParamOption("Do not zoom");
AddComboParam("Zoom", "Determines whether or not the camera will zoom to contain the followed objects.");
AddNumberParam("Horizontal margin", "The amount of space horizontally between the edge of the farthest object and the edge of the screen.", "50");
AddNumberParam("Vertical margin", "The amount of space vertically between the edge of the farthest object and the edge of the screen.", "50");
AddNumberParam("Upper zoom limit", "The upper zoom limit. -1 indicates no limit.", "-1");
AddNumberParam("Lower zoom limit", "The lower zoom limit. -1 indicates no limit.", "-1");
AddAction(2, af_none, "Zoom to contain", "Following", "Camera {0}: {1} to contain objects with margins of {2}, {3}, zoom bounded between {5} and {4}", "Tells the camera whether or not to zoom to contain followed objects.", "ZoomToContain");
// EnableFollowing
AddStringParam("Camera", "Name of the camera to use - leave blank to use the active camera.");
AddComboParamOption("Enable");
AddComboParamOption("Disable");
AddComboParam("Following", "Determines whether or not the camera will follow objects");
AddAction(3, af_none, "Enable following", "Following", "Camera {0}: {1} following", "Enables or disables following.", "EnableFollowing");
// Un-follow object
AddStringParam("Camera", "Name of the camera to use - leave blank to use the active camera.");
AddObjectParam("Object", "The object to un-follow.");
AddAction(4, af_none, "Un-follow object", "Following", "Camera {0}: Un-follow {1}", "Sets the camera to un-follow an object", "UnfollowObject");

// Camera management actions (1xx)
// CreateLocalCamera
AddStringParam("Name", "Name of the camera to create.");
AddNumberParam("X", "X position of the camera.");
AddNumberParam("Y", "Y position of the camera.");
AddNumberParam("Scale", "Initial scale(zoom) value of the camera.", "1");
AddComboParamOption("False");
AddComboParamOption("True");
AddComboParam("Active", "Determines whether or not the camera is active from the start.");
AddAction(100, af_none, "Create local camera", "Management", "Create local camera {0} at {1}, {2}, with scale {3}, active: {4}", "Creates a new local camera and attaches associates it with the current layout", "CreateLocalCamera");

// CreateGlobalCamera
AddStringParam("Name", "Name of the camera to create.");
AddNumberParam("X", "X position of the camera.");
AddNumberParam("Y", "Y position of the camera.");
AddNumberParam("Scale", "Initial scale(zoom) value of the camera.", "1");
AddComboParamOption("False");
AddComboParamOption("True");
AddComboParam("Active", "Determines whether or not the camera is active from the start.");
AddAction(101, af_none, "Create global camera", "Management", "Create global camera {0} at {1}, {2}, with scale {3}, active: {4}", "Creates a new global camera and attaches associates it with the current layout", "CreateGlobalCamera");

// SetActiveCamera
AddStringParam("Name", "Name of the camera to activate.");
AddAction(102, af_none, "Set active camera", "Management", "Set active camera to {0}", "Sets the active camera by name.", "SetActiveCamera");

// Camera property actions (2xx)
// SetScrollSmoothing
AddStringParam("Name", "Name of the camera to modify - leave blank to modify the active camera.");
AddAction(200, af_deprecated, "Set scroll smoothing", "Properties", "Camera {0}: Use {1} smoothing", "Sets the type of smoothing used by the specified camera.", "SetScrollSmoothing");

// SetXPosition
AddStringParam("Name", "Name of the camera to modify - leave blank to modify the active camera.");
AddNumberParam("X", "X coordinate to position at.");
AddAction(201, af_none, "Set X position", "Properties", "Camera {0}: Position X at {1}", "Sets the X coordinate of a camera.", "SetXPosition");

// SetYPosition
AddStringParam("Name", "Name of the camera to modify - leave blank to modify the active camera.");
AddNumberParam("Y", "Y coordinate to position at.");
AddAction(202, af_none, "Set Y position", "Properties", "Camera {0}: Position Y at {1}", "Sets the Y coordinate of a camera.", "SetYPosition");

// SetPosition
AddStringParam("Name", "Name of the camera to modify - leave blank to modify the active camera.");
AddNumberParam("X", "X coordinate to position at.");
AddNumberParam("Y", "Y coordinate to position at.");
AddAction(203, af_none, "Set position", "Properties", "Camera {0}: Position at {1}, {2}", "Sets the position of the camera.", "SetPosition");

// SetZoom
AddStringParam("Name", "Name of the camera to modify - leave blank to modify the active camera.");
AddNumberParam("Zoom", "Zoom level to set to - 1 is normal level, 2 is double, 0.5 is half, etc.");
AddAction(204, af_none, "Set zoom", "Properties", "Camera {0}: Zoom to {1}", "Sets the zoom level of the camera.", "SetZoom");

// Camera transition actions (3xx)
// Transition to point
AddStringParam("Name", "Name of the camera to modify - leave blank to modify the active camera.");
AddNumberParam("X", "X position to transition to.");
AddNumberParam("Y", "Y position to transition to.");
AddNumberParam("Duration", "Duration of the transition in seconds.");
AddAction(300, af_none, "Transition to point", "Transitions", "Camera {0}: Transition to {1}, {2} in {3}s", "Transitions a camera to a specific point.", "TransitionToPoint");

// Transitiion to zoom
AddStringParam("Name", "Name of the camera to modify - leave blank to modify the active camera.");
AddNumberParam("Zoom", "Zoom level to transition to - 1 is normal level, 2 is double, 0.5 is half, etc.");
AddNumberParam("Duration", "Duration of the transition in seconds.");
AddAction(301, af_none, "Transition to zoom level", "Transitions", "Camera {0}: Transition to zoom level {1} in {2}s", "Transitions a cameras zoom to a specific level.", "TransitionToZoom");

// Transitiion to camera
AddStringParam("Target camera", "Name of the camera to transition to.");
AddNumberParam("Duration", "Duration of the transition in seconds.");
AddAction(302, af_none, "Transition to camera", "Transitions", "Transition to camera {0} in {1}s", "Transitions to a specified camera.", "TransitionToCamera");

// Shake camera
AddStringParam("Name", "Name of the camera to modify - leave blank to modify the active camera.");
AddNumberParam("Strength", "The strength of the shaking as a value between 0 and 100.", "30");
AddNumberParam("Max deviation", "The maximum amount to deviate from the camera position in pixels.", "30");
AddNumberParam("Max zoom deviation", "The maximum amount to deviate from the camera zoom value as a scale factor based at 1.  A value of 0 means no zooming.", "0.25");
AddNumberParam("Build length", "The amount of time to build to max strength in seconds.", "1");
AddNumberParam("Drop time", "The point in seconds at which to begin dropping off in power.", "4");
AddNumberParam("Duration", "Duration of the shake in seconds.", "5");
AddAction(400, af_none, "Shake camera", "Misc", "Camera {0}: Shake with strength {1}, max deviation {2}, max zoom deviation {3}, build length {4}, drop time {5}, duration {6}", "Shakes the specified camera.", "ShakeCamera");

////////////////////////////////////////
// Expressions

// AddExpression(id,			// any positive integer to uniquely identify this expression
//				 flags,			// (see docs) ef_none, ef_deprecated, ef_return_number, ef_return_string,
//								// ef_return_any, ef_variadic_parameters (one return flag must be specified)
//				 list_name,		// currently ignored, but set as if appeared in event wizard
//				 category,		// category in expressions panel
//				 exp_name,		// the expression name after the dot, e.g. "foo" for "myobject.foo" - also the runtime function name
//				 description);	// description in expressions panel

// MovementTransitionProgress
AddStringParam("Name", "Name of the camera to retrieve data from.");
AddExpression(0, ef_return_number, "Movement transition progress", "Transitions", "MovementTransitionProgress", "Returns the progress of the current movement transition as a number between 0 and 1.");

// ZoomTransitionProgress
AddStringParam("Name", "Name of the camera to retrieve data from.");
AddExpression(1, ef_return_number, "Zoom transition progress", "Transitions", "ZoomTransitionProgress", "Returns the progress of the current zoom transition as a number between 0 and 1.");

// GetX
AddStringParam("Name", "Name of the camera to retrieve data from.");
AddExpression(2, ef_return_number, "Get X position", "Properties", "GetX", "Returns the X position of the specified camera.");

// GetY
AddStringParam("Name", "Name of the camera to retrieve data from.");
AddExpression(3, ef_return_number, "Get Y position", "Properties", "GetY", "Returns the Y position of the specified camera.");

// GetZoom
AddStringParam("Name", "Name of the camera to retrieve data from.");
AddExpression(4, ef_return_number, "Get zoom", "Properties", "GetZoom", "Returns the zoom level of the specified camera.");

// GetActiveCamera
AddExpression(5, ef_return_string, "Get active camera", "Management", "GetActiveCamera", "Returns the name of the currently active camera.");

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
	//new cr.Property(ept_integer, 	"My property",		77,		"An example property.")
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