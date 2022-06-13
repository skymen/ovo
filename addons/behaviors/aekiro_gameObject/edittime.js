function GetBehaviorSettings()
{
	return {
		"name":			"Game Object",
		"id":			"aekiro_gameobject2",
		"version":		"1.0",
		"description":	"later.",
		"author":		"AekiroStudio",
		"help url":		"https://later.com",
		"category":		"Pro UI",
		"flags":		bf_onlyone
	};
};

////////////////////////////////////////
// Conditions

AddStringParam("Name","Name");		// a string
AddCondition(0, cf_none, "Compare Name", "", "Name = {0}", "Compare the name.", "IsName");	

AddStringParam("Parent Name","Parent Name");		// a string
AddCondition(1, cf_none, "Compare Parent", "", "Parent = {0}", "Compare parent.", "IsParent");

AddCondition(2,	cf_trigger, "On Cloned", "", "On {my} Cloned", "Triggered when the game object is cloned.", "OnCloned");
////////////////////////////////////////
// Actions
AddLayerParam("Layer", "The layer name or number to create the instance on.");
AddNumberParam("X", "X", 0);
AddNumberParam("Y", "Y", 0);
AddAction(0, 0, "Clone", "", "Clone on layer <b>{0}</b> at (x = <b>{1}</b> , y = <b>{2}</b>)", "Clone.", "Clone");

AddComboParamOption("False");
AddComboParamOption("True");
AddComboParam("isVisible","isVisible");
AddAction(1, 0, "Set Visible", "", "{my} Set Visible to <b>{0}</b>", "Set Visible.", "SetVisible");

AddLayerParam("Layer", "The layer name.");
AddAction(2, 0, "Add Children From Layer", "Add", "Add children from layer <b>{0}</b>", "AddChildrenFromLayer.", "AddChildrenFromLayer");

AddObjectParam("Type", "Choose the object type to add.");
AddAction(3, 0, "Add Children From type", "Add", "{my} Add children from type <b>{0}</b>", "AddChildrenFromType.", "AddChildrenFromType");

AddStringParam("Name","Name");
AddAction(10, 0, "Add Child By Name", "Add", "{my} Add child of name <b>{0}</b>", "AddChildByName", "AddChildByName");

AddNumberParam("X", "X", 0);
AddNumberParam("Y", "Y", 0);
AddAction(4, 0, "Set Local Position", "", "{my} Set local position to ({0}, {1})", "SetLocalPosition", "SetLocalPosition");


AddComboParamOption("X");
AddComboParamOption("Y");
AddComboParamOption("Angle");
AddComboParam("property","property");
AddNumberParam("value", "value", 0);
AddAction(9, 0, "Set Local property", "", "{my} Set local {0} to {1}", "SetLocal", "SetLocal");



AddStringParam("Name","Name");
AddAction(5, 0, "Remove Child By Name", "Remove", "Remove child of name <b>{0}</b>", "RemoveChildByName", "RemoveChildByName");

AddObjectParam("Type", "Choose the object type to remove.");
AddAction(6, 0, "Remove Child By Type", "Remove", "Remove children of type <b>{0}</b>", "RemoveChildByType.", "RemoveChildByType");

AddAction(7, 0, "Remove From Parent", "Remove", "Remove from parent", "RemoveFromParent.", "RemoveFromParent");

AddNumberParam("Opacity", "Opacity, from 0 to 100.", 100);
AddAction(8, 0, "Set Opacity", "", "{my} Set Opacity to <b>{0}</b>", "Set Opacity.", "SetOpacity");
////////////////////////////////////////
// Expressions

AddExpression(0, ef_return_string, "Name", "", "name", "Get the name.");
AddExpression(1, ef_return_string, "Parent Name", "", "parent", "Get the parent name.");

AddStringParam("Property Name","Name");
AddExpression(2, ef_return_number, "Local property", "", "local", "Get a local property.");

AddStringParam("Property Name","Name");
AddExpression(3, ef_return_number, "Global property", "", "global", "Get a global property.");
//AddExpression(3, ef_return_number, "Local y", "", "local_y", "Get the y coordinate in the parent space.");
////////////////////////////////////////
ACESDone();

////////////////////////////////////////
// Array of property grid properties for this plugin
var property_list = [
	new cr.Property(ept_text, "Name", "","A unique string that identify the object."),
	new cr.Property(ept_text, "Parent Name", "","The parent's name.")
	//new cr.Property(ept_combo,"Children from same layer","No","Add all objects on same layer as children.", "No|Yes")
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
	
	//property_list[0].initial_value = Math.random().toString(36).substring(2,5);

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
