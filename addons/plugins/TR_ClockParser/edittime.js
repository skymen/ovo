var VERSION = "1.1";

function GetPluginSettings()
{
	return {
		"name":			"TR_ClockParser",
		"id":			"TR_ClockParser",
		"version":		VERSION,
		"description":	"Plugin that parses seconds to clock string.",
		"author":		"Toby R",
		"help url":		"http://www.neexeen.com/",
		"category":		"Time",
		"type":			"object",
		//"dependency":	"",
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

////////////////////////////////////////
// Conditions

////////////////////////////////////////
// Actions

////////////////////////////////////////
// Expressions
//AddExpression(0, ef_return_string | ef_deprecated, "General", "General", "GetReport", "Return the Report string.");
//ef_none, ef_deprecated, ef_return_number, ef_return_string, ef_return_any, ef_variadic_parameters


AddNumberParam("0", "Number of seconds to parse.");
AddExpression(0, ef_return_string, "Time", "Time", "Minimal", "Return the smallest possible clock string. Ex: Minimal(30) -> \"30\", Minimal(90) -> \"01:30\", Minimal(4830) -> \"01:20:30\"");

AddNumberParam("0", "Number of seconds to parse.");
AddExpression(1, ef_return_string, "Time", "Time", "MMSS", "Return the \"MM:SS\" clock string. Ex: MMSS(30) -> \"00:30\", MMSS(90) -> \"01:30\", MMSS(4830) -> \"80:30\"");

AddNumberParam("0", "Number of seconds to parse.");
AddExpression(2, ef_return_string, "Time", "Time", "HHMMSS", "Return the \"HH:MM:SS\" clock string. Ex: HHMMSS(30) -> \"00:00:30\", HHMMSS(90) -> \"00:01:30\", HHMMSS(4830) -> \"01:20:30\"");

////////////////////////////////////////
ACESDone();

////////////////////////////////////////
// Properties
var property_list = [
        new cr.Property(ept_text, "TR_ClockParser version: " + VERSION, "", "", "", true)
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