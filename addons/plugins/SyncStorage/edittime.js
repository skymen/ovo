function GetPluginSettings()
{
	return {
		"name":			"SyncStorage",
		"id":			"SyncStorage",
		"version":		"1.3",
		"description":	"Synchronous storage plugin that can work with LocalStorage library or custom/external databases.",
		"author":		"Toby R",
		"help url":		"http://neexeen.com/",
		"category":		"Data & Storage",
		"type":			"object",
		//"dependency":	"",
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

////////////////////////////////////////
// Conditions
AddCondition(0, cf_trigger, "On init succeeded", "Load data", "On init succeeded", "Triggered when storage data is initialized and is ready to use.", "OnLoaded");

AddCondition(1, cf_trigger, "On init failed", "Load data", "On init failed", "Triggered when initialization process failed for any reason.", "OnLoadError");

AddCondition(2, 0, "Is ready", "Load data", "Is ready", "True if storage is initialized and ready to use.", "IsLoaded");

AddStringParam("Item", "Item index in storage.");
AddCondition(3, 0, "Has item", "General", "Has <i>{0}</i>", "True any data is stored under given index.", "HasData");

AddStringParam("Item", "Item index in storage.");
AddCmpParam("Comparison", "How to compare the data.");
AddAnyTypeParam("Value", "The value to compare against.");
AddCondition(4, cf_none, "Compare item", "General", "If <i>{0}</i> {1} {2}", "Compare the value of an item in storage.", "CompareData");

AddCondition(5, cf_trigger, "On save requested", "Save data", "On save requested", "Triggered after \"Save data\" action is invoked.", "OnSave");

AddCondition(6, cf_trigger, "On init empty", "Load data", "On init empty", "Triggered if there was nothing to load during initialization process. Usually it's the very first time the app runs on the device.", "OnDataMissing");

////////////////////////////////////////
// Actions
AddStringParam("Item", "Item index in storage.");
AddAnyTypeParam("Value", "Value to be stored.");
AddAction(0, 0, "Set", "Set data", "Set <i>{0}</i> to <i>{1}</i>", "Sets data to the SyncStorage under given index.", "SetData");

AddAction(1, 0, "Save", "Set data", "Save data", "Triggers \"On save requested\" condition and save SyncStorage (memory) data to the LocalStorage if \"LocalStorage IDX\" property is not empty.", "SaveData");

AddAction(2, 0, "Initialize (LocalStorage)", "Load data", "Initialize (LocalStorage)", "Load app storage state from the LocalStorage slot to the SyncStorage (memory) or prepare storage if nothing found.", "LoadData");

AddAction(3, 0, "Clear", "Remove data", "Clear", "Clear all items.", "ClearData");

AddStringParam("Item", "Item index in storage.");
AddAction(4, 0, "Remove item", "Remove data", "Remove <i>{0}</i>", "Delete item from SyncStorage.", "RemoveData");

AddStringParam("JSON/String", "Encoded or not string data exported previously with AsJSON or AsString expressions.");
AddAction(5, 0, "Initialize (JSON/String)", "Load data", "Initialize <i>{0}</i>", "Load data from the encoded or not string exported previously with AsJSON or AsString expressions or prepare storage if nothing found.", "LoadString");

AddStringParam("Item", "Item index in storage.");
AddNumberParam("Value", "Value to be added.");
AddAction(6, 0, "Add", "Set data (numeric)", "Add <i>{1}</i> to <i>{0}</i>", "Add value to the item. Note this action works only with numeric values and will have no effect on text items. Empty item is considered as 0.", "AddValue");

AddStringParam("Item", "Item index in storage.");
AddNumberParam("Value", "Value to be subtracted.");
AddAction(7, 0, "Subtract", "Set data (numeric)", "Subtract <i>{1}</i> from <i>{0}</i>", "Subtract value from the item. Note this action works only with numeric values and will have no effect on text items. Empty item is considered as 0.", "SubtractValue");

AddStringParam("Item", "Item index in storage.");
AddStringParam("Value", "Value to be appended.");
AddAction(8, 0, "Append", "Set data (string)", "Append <i>{1}</i> to <i>{0}</i>", "Append text to the item. Note this action works only with text values and will have no effect on numeric items. Empty item is considered as empty string.", "AppendValue");

AddStringParam("Item", "Item index in storage.");
AddStringParam("Value", "Value to be prepended.");
AddAction(9, 0, "Prepend", "Set data (string)", "Prepend <i>{1}</i> to <i>{0}</i>", "Prepend text to the item. Note this action works only with text values and will have no effect on numeric items. Empty item is considered as empty string.", "PrependValue");

////////////////////////////////////////
// Expressions
//AddExpression(0, ef_return_string | ef_deprecated, "General", "General", "GetReport", "Return the Report string.");
//ef_none, ef_deprecated, ef_return_number, ef_return_string, ef_return_any, ef_variadic_parameters

AddStringParam("\"index\"", "String index of the data in storage.");
AddExpression(0, ef_return_any | ef_deprecated, "Storage", "Storage", "GetData", "Return the data from the storage.");

AddExpression(1, ef_return_string, "Storage", "Storage", "StorageIndex", "Return the storage index set in plugin properties.");

AddStringParam("\"index\"", "String index of the data in storage.");
AddExpression(2, ef_return_number | ef_deprecated, "Storage", "Storage", "HasData", "Return 1 if item found or 0 if item does not exist.");

AddExpression(3, ef_return_string, "Storage", "Storage", "AsJSON", "Return the storage data as JSON.");

AddExpression(4, ef_return_string, "Storage", "Storage", "AsString", "Return the storage data as encoded string if encoding is enabled or JSON if encoding is disabled.");

AddExpression(5, ef_return_string, "Storage", "Storage", "ErrorMsg", "Return the error message of \"On init failed\" condition.");

AddStringParam("\"index\"", "String index of the data in storage.");
AddExpression(6, ef_return_any, "Storage", "Storage", "Get", "Return the data from the storage.");

AddStringParam("\"index\"", "String index of the data in storage.");
AddExpression(7, ef_return_number, "Storage", "Storage", "Has", "Return 1 if item found or 0 if item does not exist.");

////////////////////////////////////////
ACESDone();

////////////////////////////////////////
// Properties
var property_list = [
        new cr.Property(ept_text, "Version: 1.3", "", "", "", true),
        new cr.Property(ept_text, "LocalStorage IDX", "", "Unique index of LocalStorage slot to save/load data. Leave empty if you don't work with LocalStorage.", ""),
        new cr.Property(ept_text, "Encoding settings", "", "", "", true),
        new cr.Property(ept_combo, "Encoding", "Disabled", "Choose whether to save data as encoded or plain.", "Enabled|Disabled"),
	    new cr.Property(ept_integer, "Head salt", 5, "Head salt value for encoding algorithm. Best to be in range of 5-20 and different than Tail salt."),
	    new cr.Property(ept_integer, "Tail salt", 8, "Tail salt value for encoding algorithm. Best to be in range of 5-20 and different than Head salt.")
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