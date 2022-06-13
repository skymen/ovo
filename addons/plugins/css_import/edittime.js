function GetPluginSettings()
{
	return {
		"name":			"CSS import",
		"id":			"CSS_import",
		"version":		"1.0",
		"description":	"Import a cascade style sheet for your project",
		"author":		"McKack",
		"help url":		"http://www.w3schools.com/css/",
		"category":		"Web",
		"type":			"object",			// does not appears in layout
		"rotatable":	false,
		"flags":		0
	};
};

////////////////////////////////////////
// Conditions

AddStringParam("Text", "The text to compare the CSS filename to.");
AddCondition(0, cf_none, "Compare last CSS imported", "CSS import conditions", "Name of last CSS import is <i>{0}</i>", "Compare the name of the last CSS imported.", "CompareCSS");

////////////////////////////////////////
// Actions

AddStringParam("CSS import", "The CSS file to import (eg. style.css )");
AddAction(0, af_none, "Import CSS file", "CSS import actions", "Import CSS file {0}", "Import (initial or additional) CSS.", "SetCSS");

AddStringParam("CSS remove", "The CSS file to remove (eg. style.css )");
AddAction(1, af_none, "Remove CSS file", "CSS import actions", "Remove CSS file {0}", "Remove (already imported) CSS.", "RemCSS");

////////////////////////////////////////
// Expressions

AddExpression(0, ef_return_string, "Get CSS filename", "CSS import expressions", "GetCSS", "Get the last CSS imported.");

ACESDone();

// Property grid properties for this plugin
var property_list = [new cr.Property(ept_text, "CSS filename", "", "The name of the CSS file to import."),];

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
	//this.just_inserted = false;
	//this.font = null;
}

IDEInstance.prototype.OnCreate = function()
{
}

IDEInstance.prototype.OnInserted = function()
{
}

IDEInstance.prototype.OnDoubleClicked = function()
{
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}

IDEInstance.prototype.OnRendererInit = function(renderer)
{
}

// Called to draw self in the editor
IDEInstance.prototype.Draw = function(renderer)
{
}

IDEInstance.prototype.OnRendererReleased = function(renderer)
{
}