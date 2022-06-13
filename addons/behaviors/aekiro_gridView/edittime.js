function GetBehaviorSettings()
{
	return {
		"name":			"Grid View",
		"id":			"aekiro_gridView",
		"version":		"1.0",
		"description":	"Layout items in a grid.",
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

AddCondition(0, cf_trigger,"On Render","","On Render","Triggered when the render is done.","OnRender");
////////////////////////////////////////
// Actions


////////////////////////////////////////
// Expressions



////////////////////////////////////////
ACESDone();

////////////////////////////////////////
// Array of property grid properties for this plugin
// new cr.Property(ept_integer,		name,	initial_value,	description)		// an integer value
// new cr.Property(ept_float,		name,	initial_value,	description)		// a float value
// new cr.Property(ept_text,		name,	initial_value,	description)		// a string
// new cr.Property(ept_combo,		name,	"Item 1",		description, "Item 1|Item 2|Item 3")	// a dropdown list (initial_value is string of initially selected item)

var property_list = [
	new cr.Property(ept_text,"Item Tag","","The Tag of the grid item."),
	new cr.Property(ept_integer,"Max Columns",0,"Max number of columns. -1 if unlimited."),
	new cr.Property(ept_integer,"Max Rows",0,"Max number of rows. -1 if unlimited."),
	new cr.Property(ept_integer,"Vertical spacing",0,"Space between the columns."),
	new cr.Property(ept_integer,"Horizontal spacing",0,"Space between the rows."),
	new cr.Property(ept_integer,"Vertical padding",0,"Space after and before the right and left edges of the grid."),
	new cr.Property(ept_integer,"Horizontal padding",0,"Space after and before the top and bottom edges of the grid."),
	new cr.Property(ept_text,"Dialog Tag","","Tag of the dialog this gridview is on.")
];


	//new cr.Property(ept_text,"Callback Name","","The function name to be called when clicked."),
	//new cr.Property(ept_text, "Callback Parameters", "","The function parameters.")

/*
	new cr.Property(ept_text,"Model Tag",0,"The Tag of the model."),
	new cr.Property(ept_text,"Model Key","","The key in the model to which this checkbox is mapped to. Put root if the data maped is at the root of the model."),
*/


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
