function GetPluginSettings() {
  return {
    name: "HowlerJS",
    id: "skymenhowlerjs",
    version: "1.0",
    description: "An audio plugin.",
    author: "Skymen",
    "help url": "",
    category: "Media",
    type: "object", // not in layout
    rotatable: false,
    flags: pf_singleglobal,
    dependency: "howler.js",
  };
}

////////////////////////////////////////
// Parameter types:
// AddNumberParam(label, description [, initial_string = "0"])			// a number
// AddStringParam(label, description [, initial_string = "\"\""])		// a string
// AddAnyTypeParam(label, description [, initial_string = "0"])			// accepts either a number or string
// AddCmpParam(label, description)										// combo with equal, not equal, less, etc.
// AddComboParamOption(text)											// (repeat before "AddComboParam" to add combo items)
// AddComboParam(label, description [, initial_selection = 0])			// a dropdown list parameter
// AddObjectParam(label, description)									// a howlerjs to click and pick an object type
// AddLayerParam(label, description)									// accepts either a layer number or name (string)
// AddLayoutParam(label, description)									// a dropdown list with all project layouts
// AddKeybParam(label, description)										// a howlerjs to click and press a key (returns a VK)
// AddAnimationParam(label, description)								// a string intended to specify an animation name
// AddAudioFileParam(label, description)								// a dropdown list with all imported project audio files

////////////////////////////////////////
// Conditions

// AddCondition(id,					// any positive integer to uniquely identify this condition
//				flags,				// (see docs) cf_none, cf_trigger, cf_fake_trigger, cf_static, cf_not_invertible,
//									// cf_deprecated, cf_incompatible_with_triggers, cf_looping
//				list_name,			// appears in event wizard list
//				category,			// category in event wizard list
//				display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//				description,		// appears in event wizard dialog when selected
//				script_name);		// corresponding runtime function name

// AddCondition(0, cf_trigger, "On load", "HowlerJS", "On load", "Fires when the sound is loaded.", "OnLoad");
// AddCondition(1, cf_trigger, "On load error", "HowlerJS", "On load error", "Fires when the sound is unable to load.", "OnLoadError");
// AddCondition(2, cf_trigger, "On play", "HowlerJS", "On play", "Fires when the sound begins playing.", "OnPlay");
// AddCondition(3, cf_trigger, "On end", "HowlerJS", "On end", "Fires when the sound finishes playing (if it is looping, it'll fire at the end of each loop).", "OnEnd");
// AddCondition(4, cf_trigger, "On pause", "HowlerJS", "On pause", "Fires when the sound has been paused.", "OnPause");
// AddCondition(5, cf_trigger, "On stop", "HowlerJS", "On stop", "Fires when the sound has been stopped.", "OnStop");
// AddCondition(6, cf_trigger, "On mute", "HowlerJS", "On mute", "Fires when the sound has been muted/unmuted.", "OnMute");
// AddCondition(7, cf_trigger, "On volume change", "HowlerJS", "On volume change", "Fires when the sound's volume has changed.", "OnVolume");
// AddCondition(8, cf_trigger, "On rate change", "HowlerJS", "On rate change", "Fires when the sound's playback rate has changed.", "OnRate");
// AddCondition(9, cf_trigger, "On seek", "HowlerJS", "On seek", "Fires when the sound has been seeked.", "OnSeek");
// AddCondition(10, cf_trigger, "On fade", "HowlerJS", "On fade", "Fires when the current sound finishes fading in/out.", "OnFade");

AddStringParam("Group", "", "");
AddCondition(
  11,
  cf_none,
  "Is playing",
  "HowlerJS",
  "Is <b>{0}</b> playing",
  "",
  "IsPlaying"
);
////////////////////////////////////////
// Actions

// AddAction(id,				// any positive integer to uniquely identify this action
//			 flags,				// (see docs) af_none, af_deprecated
//			 list_name,			// appears in event wizard list
//			 category,			// category in event wizard list
//			 display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//			 description,		// appears in event wizard dialog when selected
//			 script_name);		// corresponding runtime function name

////////////////////////////////////////

AddAudioFileParam("Audio", "");
AddStringParam("Group", "", "");
AddAction(
  0,
  0,
  "Play",
  "HowlerJS",
  "Play <b>{0}</b> (group <i>{1}</i>)",
  "",
  "Play"
);

AddStringParam("Audio", "", "");
AddStringParam("Group", "", "");
AddAction(
  1,
  0,
  "Play (by name)",
  "HowlerJS",
  "Play <b>{0}</b> (group <i>{1}</i>)",
  "",
  "PlayByName"
);

AddStringParam("Group", "", "");
AddAction(2, 0, "Stop", "HowlerJS", "Stop <b>{0}</b>", "", "Stop");

AddStringParam("Group", "", "");
AddAction(3, 0, "Mute", "HowlerJS", "Mute <b>{0}</b>", "", "Mute");

AddStringParam("Group", "", "");
AddAction(4, 0, "Unmute", "HowlerJS", "Unmute <b>{0}</b>", "", "Unmute");

// AddNumberParam("From", "", 1);
// AddNumberParam("To", "", 0);
// AddNumberParam("Duration", "", 600);
// AddAction(5, 0, "Fade", "HowlerJS", "Fade sound volume from {0} to {1} for {2} ms", "", "Fade");

AddNumberParam("Volume", "", "0");
AddStringParam("Group", "", "");
AddAction(
  6,
  0,
  "Set volume",
  "HowlerJS",
  "Set volume of <i>{1}</i> to <b>{0}</b>",
  "",
  "Volume"
);

AddNumberParam("Volume", "", "0");
AddStringParam("Group", "", "");
AddAction(
  7,
  0,
  "Set linear volume",
  "HowlerJS",
  "Set linear volume of <i>{1}</i> to <b>{0}</b>",
  "",
  "LinearVolume"
);
// AddNumberParam("Rate", "", 1);
// AddAction(7, 0, "Set rate", "HowlerJS", "Set rate to {0}", "", "Rate");

// AddNumberParam("Playback position", "", 1);
// AddAction(8, 0, "Seek", "HowlerJS", "Seek position {0}s", "", "Seek");

// AddComboParamOption("Enabled");
// AddComboParamOption("Disabled");
// AddComboParam("State", "Disabled");
// AddAction(9, 0, "Set loop", "HowlerJS", "Set loop state to {0}", "", "Loop");

AddAudioFileParam("Audio", "");
AddStringParam("Group", "", "");
AddAction(
  10,
  0,
  "Load",
  "HowlerJS",
  "Load <b>{0}</b> in group <i>{1}</i>",
  "",
  "Load"
);

AddAudioFileParam("Audio", "");
AddStringParam("Group", "", "");
AddAction(
  11,
  0,
  "Unload",
  "HowlerJS",
  "Unload <b>{0}</b> from group <i>{1}</i>",
  "",
  "Unload"
);

AddStringParam("Audio", "");
AddStringParam("Group", "", "");
AddAction(
  12,
  0,
  "Load (by name)",
  "HowlerJS",
  "Load <b>{0}</b> in group <i>{1}</i>",
  "",
  "LoadByName"
);

AddStringParam("Audio", "");
AddStringParam("Group", "", "");
AddAction(
  13,
  0,
  "Unload (by name)",
  "HowlerJS",
  "Unload <b>{0}</b> from group <i>{1}</i>",
  "",
  "UnloadByName"
);

// AddNumberParam("Stereo", "", 1);
// AddAction(12, 0, "Set stereo ", "HowlerJS", "Set stereo to {0}.", "", "Stereo");

// AddObjectParam("Player","");
// AddAction(13, 0, "Enable spatial ", "HowlerJS", "Enable spatial mode, set player to {0}.", "", "EnableSpacial");

// AddAction(14, 0, "Disable spatial ", "HowlerJS", "Disable spatial.", "", "DisableSpatial");

// AddStringParam("Sprite", "", "\"laser\"");
// AddAction(15, 0, "Play sprite ", "HowlerJS", "Play sprite {0}.", "", "PlaySprite");

// Expressions

// AddExpression(id,			// any positive integer to uniquely identify this expression
//				 flags,			// (see docs) ef_none, ef_deprecated, ef_return_number, ef_return_string,
//								// ef_return_any, ef_variadic_parameters (one return flag must be specified)
//				 list_name,		// currently ignored, but set as if appeared in event wizard
//				 category,		// category in expressions panel
//				 exp_name,		// the expression name after the dot, e.g. "foo" for "myobject.foo" - also the runtime function name
//				 description);	// description in expressions panel
// AddExpression(0, ef_return_string, "Get state", "HowlerJS", "GetState", "");
// AddExpression(1, ef_return_number, "Get duration", "HowlerJS", "GetDuration", "");
AddStringParam("Group", "", "");
AddExpression(2, ef_return_number, "Volume", "HowlerJS", "Volume", "");
AddExpression(
  3,
  ef_return_number,
  "MasterVolume",
  "HowlerJS",
  "MasterVolume",
  ""
);

AddStringParam("Group", "", "");
AddExpression(
  2,
  ef_return_number,
  "LinearVolume",
  "HowlerJS",
  "LinearVolume",
  ""
);
AddExpression(
  3,
  ef_return_number,
  "LinearMasterVolume",
  "HowlerJS",
  "LinearMasterVolume",
  ""
);

ACESDone();

// Property grid properties for this plugin
var property_list = [];

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
  return new IDEInstance(instance);
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

  // Plugin-specific variables
}

IDEInstance.prototype.OnCreate = function () {};

IDEInstance.prototype.OnInserted = function () {};

IDEInstance.prototype.OnDoubleClicked = function () {};

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function (property_name) {};

IDEInstance.prototype.OnRendererInit = function (renderer) {};

// Called to draw self in the editor
IDEInstance.prototype.Draw = function (renderer) {};

IDEInstance.prototype.OnRendererReleased = function (renderer) {};
