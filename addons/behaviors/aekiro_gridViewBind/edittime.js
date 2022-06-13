function GetBehaviorSettings()
{
	return {
		"name":			"GridView Data Bind",
		"id":			"aekiro_bind",
		"version":		"1.0",
		"description":	"Map a GridView subitem to a key in JSON data.",
		"author":		"AekiroStudio",
		"help url":		"https://later.com",
		"category":		"Pro UI",
		"flags":		bf_onlyone
	};
};

////////////////////////////////////////
////////////////////////////////////////
// Conditions
			
AddNumberParam("Index","Index");		// a string
AddCondition(0, cf_none, "Compare Index", "", "Index = {0}", "Compare the Index.", "IsIndex");	
////////////////////////////////////////
// Actions


////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number, "Index", "", "index", "Get the index of the item on which this element is on.");
////////////////////////////////////////
ACESDone();

////////////////////////////////////////
var property_list = [
	new cr.Property(ept_text,"Binding Key","","The key in the JSON array's item to which this sub-item is mapped to."),
	new cr.Property(ept_combo,"Binding Property","Value","Set which property of the sub-item is mapped to the value at the binding key.", "Value|Text|Frame|Animation|URL")
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
