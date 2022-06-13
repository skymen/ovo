function GetPluginSettings()
{
	return {
		"name":			"Notifications",				// as appears in 'insert object' dialog, can be changed as long as "id" stays the same
		"id":			"sirg_notifications",				// this is used to identify this plugin and is saved to the project; never change it
		"version":		"1.3",					// (float in x.y format) Plugin version - C2 shows compatibility warnings based on this
		"description":	"Add notification message.",
		"author":		"SirG",
		"help url":		"https://www.scirra.com/forum/plugin-notifications_t85061",
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
,
        "dependency":	"jquery.gritter.js;jquery.gritter.css"
	};
};

////////////////////////////////////////
// Conditions
AddStringParam("ID", "Notification ID", "\"\"");
AddCondition(0, cf_trigger, "On notification clicked", "Notification", "On notification {0} clicked", "Triggered when on notification clicked.", "OnNotificationClicked");
////////////////////////////////////////
// Actions
AddAnyTypeParam("Title", "Notification title.", "\"\"");
AddAnyTypeParam("Text", "Notification text.", "\"\"");
AddAnyTypeParam("Image", "(optional) Enter the URL of an image on the web", "\"\"");

AddComboParamOption("false");
AddComboParamOption("true");
AddComboParam("Sticky", "If you want it to fade out on its own or just sit there.");

AddComboParamOption("Dark");
AddComboParamOption("Light");
AddComboParamOption("Success");
AddComboParamOption("Info");
AddComboParamOption("Warning");
AddComboParamOption("Error");
AddComboParamOption("Red");
AddComboParamOption("Yellow");
AddComboParamOption("Blue");
AddComboParamOption("Green");
AddComboParam("Notification style", "Notification style");

AddNumberParam("Time", "The time you want it to be alive for before fading out (milliseconds).","5000");
AddAction(0, af_none, "Add advanced notification", "Notification", "Add advanced notification {0}", "Add notification to layout", "AddNotification");

AddAction(1, af_none, "Delete all notifications", "Notification", "Delete all notifications", "Delete all notifications from layout", "DeleteAllNotifications");

AddAnyTypeParam("Title", "Notification title.", "\"\"");
AddAnyTypeParam("Text", "Notification text.", "\"\"");
AddAnyTypeParam("Image", "(optional) Enter the URL of an image on the web", "\"\"");
AddAction(2, af_none, "Add simple notification", "Notification", "Add notification {0}", "Add simple notification with default options to layout", "AddSimpleNotification");

AddAnyTypeParam("ID", "Enter notification ID.", "\"\"");
AddAnyTypeParam("Title", "Notification title.", "\"\"");
AddAnyTypeParam("Text", "Notification text.", "\"\"");
AddAnyTypeParam("Image", "(optional) Enter the URL of an image on the web", "\"\"");

AddComboParamOption("false");
AddComboParamOption("true");
AddComboParam("Sticky", "If you want it to fade out on its own or just sit there.");

AddComboParamOption("Dark");
AddComboParamOption("Light");
AddComboParamOption("Success");
AddComboParamOption("Info");
AddComboParamOption("Warning");
AddComboParamOption("Error");
AddComboParamOption("Red");
AddComboParamOption("Yellow");
AddComboParamOption("Blue");
AddComboParamOption("Green");
AddComboParam("Notification style", "Notification style");

AddNumberParam("Time", "The time you want it to be alive for before fading out (milliseconds).","5000");

AddComboParamOption("false");
AddComboParamOption("true");
AddComboParam("Close on click", "Close on click?");

AddAction(3, af_none, "Add clickable notification", "Notification", "Add clickable notification {0}", "Add notification to layout", "AddNotificationClickable");

AddComboParamOption("top-right");
AddComboParamOption("top-left");
AddComboParamOption("bottom-left");
AddComboParamOption("bottom-right");
AddComboParam("Position", "Notification position");
AddAction(4, af_none, "Set position", "Notification", "Set position to {0}", "Set positiona", "SetPosition");
////////////////////////////////////////
// Expressions
////////////////////////////////////////
ACESDone();

////////////////////////////////////////
// Array of property grid properties for this plugin
var property_list = [
	new cr.Property(ept_combo, "Position","bottom-right","Notification position.","top-right|top-left|bottom-left|bottom-right"),
	new cr.Property(ept_combo, "Fade in speed","medium","Notification fade in speed.","slow|medium|fast"),
	new cr.Property(ept_combo, "Fade out speed","medium","Notification fade out speed.","slow|medium|fast"),
	new cr.Property(ept_integer, "Time",5000,"The time you want it to be alive for before fading out (milliseconds)."),
	new cr.Property(ept_integer, "Max number",0,"Maximum number of notifications. If not 0, only show this many notifications at once and queue others."),

	new cr.Property(ept_section, "Default options", "",	"Default options for simple notification."),
	new cr.Property(ept_combo, "Sticky","true","If you want it to fade out on its own or just sit there.","true|false"),
	new cr.Property(ept_combo, "Style","Dark","Notification style.","Dark|Light|Success|Info|Warning|Error|Red|Yellow|Blue|Green"),
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
