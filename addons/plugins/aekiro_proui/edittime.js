function GetPluginSettings() {
  return {
    name: "ProUI",
    id: "aekiro_proui2",
    version: "1.0",
    description: "Must be added to any project using the ProUI behaviors.",
    author: "AekiroStudio",
    "help url": "https://later.com",
    category: "Pro UI",
    type: "object", // not in layout
    rotatable: false,
    flags: pf_singleglobal,
    dependency: "Tween.js",
  };
}

//////////////////////////////////////////////////////////////
// Conditions

AddCondition(
  0,
  0,
  "Is Dialog Opened",
  "ProUI",
  "Is Dialog Opened",
  "Is Dialog Opened.",
  "IsDialogOpened"
);

//////////////////////////////////////////////////////////////
// Actions

AddComboParamOption("Disabled");
AddComboParamOption("Enabled");
AddComboParam("Input state", "The state of the inputs.");
AddAction(
  0,
  0,
  "Set input enabled",
  "ProUI",
  "Set all input to <i>{0}</i>",
  "Enable/Disable input reception.",
  "SetInputEnabled"
);

//////////////////////////////////////////////////////////////
// Expressions

AddExpression(
  0,
  ef_return_any,
  "Orientation",
  "ProUI",
  "orientation",
  "Orientation."
);

ACESDone();

// Property grid properties for this plugin
var property_list = [
  new cr.Property(
    ept_text,
    "Default Font CSS URL",
    "",
    "The name of the default css url."
  ),
  new cr.Property(
    ept_text,
    "Default Font Family",
    "",
    "The name of the font family."
  ),
  new cr.Property(
    ept_text,
    "Default Sound Tag",
    "sounds",
    "The tag on which to play the ProUI sounds by default"
  ),
  new cr.Property(
    ept_combo,
    "Use Howler",
    "No",
    "Wether to use the Howler plugin for audio",
    "Yes|No"
  ),
];

/*new cr.Property(ept_combo,"Screen Orientation","Portrait","Screen Orientation.", "Landscape|Portrait")
new cr.Property(ept_integer,"Audio UID","","UID of the audio plugin."),
*/

// Called by IDE when a new object type is to be created
function CreateIDEObjectType() {
  return new IDEObjectType();
}

// Class representing an object type in the IDE
function IDEObjectType() {
  assert2(this instanceof arguments.callee, "Constructor called as a function");
}

// Called by IDE when a new object instance of this type is to be created
IDEObjectType.prototype.CreateInstance = function (instance) {
  return new IDEInstance(instance, this);
};

// Class representing an individual instance of an object in the IDE
function IDEInstance(instance, type) {
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
IDEInstance.prototype.OnCreate = function () {};

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function (property_name) {};

// Called by the IDE to draw this instance in the editor
IDEInstance.prototype.Draw = function (renderer) {};

// Called by the IDE when the renderer has been released (ie. editor closed)
// All handles to renderer-created resources (fonts, textures etc) must be dropped.
// Don't worry about releasing them - the renderer will free them - just null out references.
IDEInstance.prototype.OnRendererReleased = function () {};
