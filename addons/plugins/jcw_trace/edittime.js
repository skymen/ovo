function GetPluginSettings()
{
	return {
		"name":			"Trace",
		"id":			"jcw_trace",
		"version":		"0.4",
		"description":	"Use line and box traces to make your objects more aware of their surroundings.",
		"author":		"Jcw87",
		"help url":		"",
		"category":		"Math",
		"type":			"object",
		"flags":		0
	};
}

////////////////////////////////////////
// Conditions

AddCondition(0, cf_none, "Hit something", "Trace", "{my} hit something", "Test if the last trace performed hit something.", "Hit");

//////////////////////////////////////////////////////////////
// Actions
AddObjectParam("Obstacle", "Choose an object to add as an obstacle, obstructing traces.");
AddAction(0, af_none, "Add obstacle", "Obstacles", "Add {my} obstacle {0}", "Add a custom object as an obstacle to traces.", "AddObstacle");

AddAction(1, af_none, "Clear obstacles", "Obstacles", "Clear {my} obstacles", "Remove all added obstacle objects.", "ClearObstacles");

AddNumberParam("Start X", "X coordinate of the start of the trace.", "0");
AddNumberParam("Start Y", "Y coordinate of the start of the trace.", "0");
AddNumberParam("End X", "X coordinate of the end of the trace.", "0");
AddNumberParam("End Y", "Y coordinate of the end of the trace.", "0");
AddAction(2, af_none, "Trace Line", "Trace", "Trace line from (<i>{0}</i>, <i>{1}</i>) to (<i>{2}</i>, <i>{3}</i>)", "Performs a line trace, storing the results.", "TraceLine");

/*
AddNumberParam("Start X", "X coordinate of the start of the trace.", "0");
AddNumberParam("Start Y", "Y coordinate of the start of the trace.", "0");
AddNumberParam("End X", "X coordinate of the end of the trace.", "0");
AddNumberParam("End Y", "Y coordinate of the end of the trace.", "0");
AddNumberParam("Box Width", "Width of the box trace.", "0");
AddNumberParam("Box Height", "Height of the box trace.", "0");
AddAction(3, af_none, "Trace Box", "Trace", "Trace box of size (<i>{4}</i>, <i>{5}</i>) from (<i>{0}</i>, <i>{1}</i>) to (<i>{2}</i>, <i>{3}</i>)", "Performs a box trace, storing the results.", "TraceBox");
*/

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number, "Get hit object UID", "Trace Results", "HitUID", "Gets the UID of the object hit by the last trace. Returns -1 if none.");
AddExpression(1, ef_return_number, "Get hit X", "Trace Results", "HitX", "Gets the X coordinate of the first intersection.");
AddExpression(2, ef_return_number, "Get hit Y", "Trace Results", "HitY", "Gets the Y coordinate of the first intersection.");
AddExpression(3, ef_return_number, "Get normal angle", "Trace Results", "NormalAngle", "Gets the perpendicular angle of the first intersecting line.");
AddExpression(4, ef_return_number, "Get reflect angle", "Trace Results", "ReflectAngle", "Gets the new angle of the ray afting being reflected by the first intersecting line.");
AddExpression(5, ef_return_number, "Get hit fraction", "Trace Results", "HitFrac", "Gets the fractional distance to where the hit occured, with the start point being 0, and the end point being 1.");

ACESDone();

var property_list = [
	new cr.Property(ept_combo, "Obstacles", "Solids", "Choose whether solids obstruct traces or if to use custom objects added by events.", "Solids|Custom"),
	new cr.Property(ept_combo, "Use collision cells", "Yes", "Usually improves performance, but can be slower over very long distances.", "No|Yes"),
	new cr.Property(ept_float, "Padding", 0.1, "Padding amount to insert between the hit object and the returned hit position. Clamped between 0 and 1.")
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
};

// Class representing an individual instance of an object in the IDE
function IDEInstance(instance, type)
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");

	// Save the constructor parameters
	this.instance = instance;
	this.type = type;

	// Set the default property values from the property table
	this.properties = {};
	
	for (var i = 0; i < property_list.length; i++) this.properties[property_list[i].name] = property_list[i].initial_value;

	// Plugin-specific variables
	// this.myValue = 0...
}

// Called when inserted via Insert Object Dialog for the first time
IDEInstance.prototype.OnInserted = function()
{
};

// Called when double clicked in layout
IDEInstance.prototype.OnDoubleClicked = function()
{
};

// Called after a property has been changed in the properties bar
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
};
