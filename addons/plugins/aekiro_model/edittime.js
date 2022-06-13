function GetPluginSettings()
{
	return {
		"name":     "Model",
		"id":     "aekiro_model",
		"version":    "1.0",            
		"description":  "Represent a view model.",
		"author":   "AekiroStudio",
		"help url":   "https://later.com",
		"category":   "Data & Storage",
		"type":     "object",
		"rotatable":  false,
		"flags":    0
	};
};

//Note: This plugin was based on RexRainbow "Rex_Hash" plugin.
//////////////////////////////////////////////////////////////
// Conditions
AddStringParam("Key string", "The key string of the hash table.", '""');
AddCondition(1, cf_looping | cf_not_invertible, "For each item", "For Each", "For each item in <i>{0}</i>", "Repeat the event for each item in key.", "ForEachItem");				 

AddStringParam("Key string", "The key string of the hash table.", '""');
AddCondition(2, 0,"Key exists","Key","Key {0} exists","Return true if a key exists in hash table.","KeyExists");

AddStringParam("Key string", "The key string of the hash table.", '""');
AddCondition(3, 0,"Is empty","Entry","Entry {0} is empty","Return true if an entry is empty i.e. has no key.","IsEmpty");

/*AddStringParam("Key", "The key.", "\"\"");
AddCondition(0,	cf_trigger, "On key set", "key", "On <b>{0}</b> set", "Triggered when a key is set.", "OnKeySet");*/


//////////////////////////////////////////////////////////////
// Actions

//HashTable Operations
AddStringParam("Key string", "The key string of the hash table value to set.", '""');
AddAnyTypeParam("Value", "The value to store in the hash table.", 0);
AddAction(1, 0, "Set value", "Value", "Set key <i>{0}</i> to <i>{1}</i>","Set value by a key string.", "SetValueByKeyString");

AddStringParam("Key string", "The key string of the hash table value to set.", '""');
AddStringParam("JSON", "JSON string.", '"{}"');
AddAction(9, 0, "Set JSON", "Value", "Set key <i>{0}</i> to JSON <i>{1}</i>","Set JSON by a key string.", "SetJSONByKeyString");

AddStringParam("Key string", "The key string of the hash table value to add.", '""');
AddAnyTypeParam("Value", "The value to store in the hash table.", 0);
AddAction(10, 0, "Add to", "Value", "Add <i>{1}</i> to <i>{0}</i>","Add to the value of key.", "AddToValueByKeyString");         

//Array Operations
AddStringParam("Key", "The key string of the hash table value to set.", '""');
AddStringParam("JSON", "JSON string.", '"{}"');
AddAction(23, 0, "Push JSON", "Array - Push",  "Push JSON <i>{1}</i> into array at <i>{0}</i> ","Push JSON into array.", "PushJSON");        

AddStringParam("Key", "The key string of the hash table value to set.", '""');
AddAnyTypeParam("Value", "The value to push in the hash table.", 0);
AddAction(24, 0, "Push value", "Array - Push", "Push value <i>{1}</i> into array at <i>{0}</i> ","Push value into array.", "PushValue");   
//*******
AddStringParam("Key", "The key string of the hash table value to set.", '""');
AddStringParam("JSON", "JSON string.", '"{}"');
AddNumberParam("Index", "Index of this array to insert.", 0);
AddAction(25, 0, "Insert JSON", "Array - Insert", "Insert JSON <i>{1}</i> into array at <i>{0}</i>[<i>{2}</i>]","Insert JSON into array.", "InsertJSON");        

AddStringParam("Key", "The key string of the hash table value to set.", '""');
AddAnyTypeParam("Value", "The value to push in the hash table.", 0);
AddNumberParam("Index", "Index of this array to insert.", 0);
AddAction(26, 0, "Insert value", "Array - Insert", "Insert value <i>{1}</i> into array at <i>{0}</i>[<i>{2}</i>]","Insert value into array.", "InsertValue");            
//*******
AddStringParam("Key", "The key the array is at.", '""');
AddNumberParam("Index", "Index of the item to remove.", 0);  
AddAction(27, 0, "Remove Item by Index", "Array - Remove", "Remove item at <i>{0}</i>[<i>{1}</i>]","Remove an item by index.", "RemoveItemByIndex");

/*AddStringParam("Key", "The key the array is at.", '""');
AddAction(29, 0, "Clear", "Hash table", "{my} Clear","Clear the listmodel.", "Clear");*/

/*AddNumberParam("Index", "The index of the item to edit.", 0);
AddStringParam("Key", "The key to set.", '""');
AddAnyTypeParam("Value", "The value of the key to set.", 0);
AddAction(28, 0, "Set Item key", "Array - Edit", "Set item key <i>{1}</i> of item <i>{0}</i> to <i>{2}</i>","Set an item key by index.", "SetItemKeyByIndex");*/


//Other Operations
AddAction(4, 0, "Clear", "Hash table", "Clear table","Clear table.", "CleanAll"); 

AddStringParam("JSON string", "JSON string.", '""');
AddAction(5, 0, "Load JSON", "Load", "Load content from <i>{0}</i>","Load content from JSON string.", "StringToHashTable");

AddStringParam("Key string", "The key string of the hash table value to remove.", '""');          
AddAction(6, 0, "Remove key", "Remove", "Remove key <i>{0}</i>","Remove key.", "RemoveByKeyString");

AddStringParam("Language code", "The language code.", '""');
AddAction(8, 0, "Set Language", "Others", "Set Language to <i>{0}</i>","Set Language.", "SetLanguage");

/*AddStringParam("Key 1", "The key string.", '""');          
AddStringParam("Key 2", "The key string.", '""');
AddAction(9, 0, "Set key", "Others", "Set key <i>{0}</i> to key <i>{1}</i>","Set key.", "SetKeyToKey");*/

//AddAction(7, cf_deprecated, "Update Views", "Others", "Update Views","Update Views.", "UpdateViews");


//////////////////////////////////////////////////////////////
// Expressions

//Get value
AddStringParam("Key", "The key string of the hash to get.", '""');
AddExpression(3, ef_return_any | ef_variadic_parameters, "Get value at", "Value", "at", "Get value from the hash by key string, return JSON string if the item is an object. Add 2nd parameter to return default value when got invalid value.");

//Array
AddStringParam("Key", "The key of the hash to get.", '""');
AddExpression(21, ef_return_any | ef_variadic_parameters, "Pop from array", "Array", "pop","Pop from array.");

AddStringParam("Key", "The key of the hash to get.", '""');
AddExpression(22, ef_return_any | ef_variadic_parameters, "Shift from array", "Array", "shift","Removes the first element from an array and returns that element.");

AddStringParam("Array Key", "The key of the array.", '""');
AddStringParam("Id Key", "The key of the item to check", '""');
AddAnyTypeParam("Id Value", "The value of the item to check.", 0);
AddStringParam("Item Key", "The key to retrieve from the found item.", '""');
AddExpression(23, ef_return_any | ef_variadic_parameters, "Array Value By Value", "Array", "arrayValueByValue", "description");

//Loop
AddExpression(4, ef_return_string, "Current key", "For each", "curKey", "Get the current key in a For Each loop.");

AddExpression(5, ef_return_any | ef_variadic_parameters, "Current value", "For each", "curValue", "Get the current value in a For Each loop. Add 2nd parameter to return sub-item by keys. Add 3rd parameter to return default value when got invalid value.");

AddExpression(12, ef_return_number, "Get loop index", "For each", "loopindex","Get loop index in a for each loop.");

//Misc
AddStringParam("Key", "The key of the hash to get.", '""');
AddExpression(7, ef_return_number, "Get items count", "Items", "itemCnt", "Get item count. 0 means the item is number or string type, (-1) means the item does not exist.");              

//Export
AddExpression(9, ef_return_string | ef_variadic_parameters, "Make a simple json oject", "JSON", "makeJSON", "Create a json based on a serie of key/value passed in the parameters.");			  

AddExpression(10, ef_return_string, "Get model content as JSON string", "JSON", "asJSON", "Get the entire content of the model as JSON string.");

AddExpression(11, ef_return_string | ef_variadic_parameters, "Make a simple array", "JSON", "makeArray", "Create a json array  based on a serie of key/value passed in the parameters.");			  
		



ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_text,"Tag","","The tag of this model."),
	new cr.Property(ept_text,"Languages Data Root","","The key at which the languages data is.")
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
	return new IDEInstance(instance, this);
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

// Called by the IDE after all initialization on this instance has been completed
IDEInstance.prototype.OnCreate = function()
{
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}
	
// Called by the IDE to draw this instance in the editor
IDEInstance.prototype.Draw = function(renderer)
{
}

// Called by the IDE when the renderer has been released (ie. editor closed)
// All handles to renderer-created resources (fonts, textures etc) must be dropped.
// Don't worry about releasing them - the renderer will free them - just null out references.
IDEInstance.prototype.OnRendererReleased = function()
{
}
