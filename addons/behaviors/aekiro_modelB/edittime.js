function GetBehaviorSettings()
{
	return {
		"name":			"Model",
		"id":			"aekiro_modelB",
		"version":		"1.0",
		"description":	"Link a ui element to a key in a Model plugin to allow data binding.",
		"author":		"AekiroStudio",
		"help url":		"https://later.com",
		"category":		"Pro UI",
		"flags":		bf_onlyone
	};
};

////////////////////////////////////////
////////////////////////////////////////
// Conditions
			

////////////////////////////////////////
// Actions
AddAction(0, 0, "Reset", "", "Reset","Reset.", "Reset");

////////////////////////////////////////
// Expressions


////////////////////////////////////////
ACESDone();

////////////////////////////////////////
var property_list = [
	new cr.Property(ept_text,"Model Tag","","The Tag of the model."),
	new cr.Property(ept_text,"Model Key","","The key in the model to which this element is mapped to.")
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
