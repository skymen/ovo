function GetPluginSettings()
{
    return {
        "name":            "GameAnalytics",                // as appears in 'insert object' dialog, can be changed as long as "id" stays the same
        "id":            "GameAnalytics",                // this is used to identify this plugin and is saved to the project; never change it
        "version":        "1.1.1",
        "description":    "GameAnalytics is a free analytics platform that helps game developers understand their players' behaviour by delivering relevant insights.",
        "author":        "GameAnalytics",
        "help url":        ">https://gameanalytics.com/docs/construct-sdk",
        "category":        "Analytics",                // Prefer to re-use existing categories, but you can set anything here
        "type":            "object",                // either "world" (appears in layout and is drawn), else "object"
        "rotatable":    false,                    // only used when "type" is "world".  Enables an angle property on the object.
        "flags":        pf_singleglobal,            // uncomment lines to enable flags...
                    //    | pf_singleglobal        // exists project-wide, e.g. mouse, keyboard.  "type" must be "object".
                    //    | pf_texture            // object has a single texture (e.g. tiled background)
                    //    | pf_position_aces        // compare/set/get x, y...
                    //    | pf_size_aces            // compare/set/get width, height...
                    //    | pf_angle_aces            // compare/set/get angle (recommended that "rotatable" be set to true)
                    //    | pf_appearance_aces    // compare/set/get visible, opacity...
                    //    | pf_tiling                // adjusts image editor features to better suit tiled images (e.g. tiled background)
                    //    | pf_animations            // enables the animations system.  See 'Sprite' for usage
                    //    | pf_zorder_aces        // move to top, bottom, layer...
                    //  | pf_nosize                // prevent resizing in the editor
                    //    | pf_effects            // allow WebGL shader effects to be added
                    //  | pf_predraw            // set for any plugin which draws and is not a sprite (i.e. does not simply draw
                                                // a single non-tiling image the size of the object) - required for effects to work properly
        "dependency":    "GameAnalytics.js"
    };
};

////////////////////////////////////////
// Parameter types:
// AddNumberParam(label, description [, initial_string = "0"])            // a number
// AddStringParam(label, description [, initial_string = "\"\""])        // a string
// AddAnyTypeParam(label, description [, initial_string = "0"])            // accepts either a number or string
// AddCmpParam(label, description)                                        // combo with equal, not equal, less, etc.
// AddComboParamOption(text)                                            // (repeat before "AddComboParam" to add combo items)
// AddComboParam(label, description [, initial_selection = 0])            // a dropdown list parameter
// AddObjectParam(label, description)                                    // a button to click and pick an object type
// AddLayerParam(label, description)                                    // accepts either a layer number or name (string)
// AddLayoutParam(label, description)                                    // a dropdown list with all project layouts
// AddKeybParam(label, description)                                        // a button to click and press a key (returns a VK)
// AddAnimationParam(label, description)                                // a string intended to specify an animation name
// AddAudioFileParam(label, description)                                // a dropdown list with all imported project audio files

////////////////////////////////////////
// Conditions

// AddCondition(id,                    // any positive integer to uniquely identify this condition
//                flags,                // (see docs) cf_none, cf_trigger, cf_fake_trigger, cf_static, cf_not_invertible,
//                                    // cf_deprecated, cf_incompatible_with_triggers, cf_looping
//                list_name,            // appears in event wizard list
//                category,            // category in event wizard list
//                display_str,        // as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//                description,        // appears in event wizard dialog when selected
//                script_name);        // corresponding runtime function name

////////////////////////////////////////
// Actions

// AddAction(id,                // any positive integer to uniquely identify this action
//             flags,                // (see docs) af_none, af_deprecated
//             list_name,            // appears in event wizard list
//             category,            // category in event wizard list
//             display_str,        // as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//             description,        // appears in event wizard dialog when selected
//             script_name);        // corresponding runtime function name

AddStringParam("Dimension", "Enter dimension to add to available custom 01 dimensions.");
AddAction(0, af_none, "Add dimension to available custom 01 dimensions", "GameAnalytics", "Add {0} to available custom 01 dimensions", "Add dimension to available custom 01 dimensions. Must be called before initializing SDK.", "addAvailableCustomDimension01");

AddStringParam("Dimension", "Enter dimension to add to available custom 02 dimensions.");
AddAction(1, af_none, "Add dimension to available custom 02 dimensions", "GameAnalytics", "Add {0} to available custom 02 dimensions", "Add dimension to available custom 02 dimensions. Must be called before initializing SDK.", "addAvailableCustomDimension02");

AddStringParam("Dimension", "Enter dimension to add to available custom 03 dimensions.");
AddAction(2, af_none, "Add dimension to available custom 03 dimensions", "GameAnalytics", "Add {0} to available custom 03 dimensions", "Add dimension to available custom 03 dimensions. Must be called before initializing SDK.", "addAvailableCustomDimension03");

AddStringParam("Currency", "Enter currency to add to available resource currencies.");
AddAction(3, af_none, "Add currency to available resource currencies", "GameAnalytics", "Add {0} to available resource currencies", "Add currency to available resource currencies. Must be called before initializing SDK.", "addAvailableResourceCurrency");

AddStringParam("Item type", "Enter item type to add to available resource item types.");
AddAction(4, af_none, "Add item type to available resource item types", "GameAnalytics", "Add {0} to available resource item types", "Add item type to available resource item types. Must be called before initializing SDK.", "addAvailableResourceItemType");

AddAction(5, af_none, "Initialize SDK", "GameAnalytics", "Initialize GA SDK", "Initialize GA SDK.", "initialize");

AddStringParam("Currency", "Enter currency.");
AddNumberParam("Amount", "Enter amount in cents.");
AddStringParam("Item type", "Enter item type.");
AddStringParam("Item id", "Enter item id.");
AddStringParam("Cart type", "Enter cart type (this specifies where the purchase took place for example in-game or in shop).");
AddAction(6, af_none, "Add business event", "GameAnalytics", "Add business event {0}:{1}:{2}:{3}:{4}", "Add business event. Must first be called after initializing SDK.", "addBusinessEvent");

AddComboParamOption("Undefined");
AddComboParamOption("Source");
AddComboParamOption("Sink");
AddComboParam("Flow type", "Enter flow type. Source is 'add' and Sink is 'substract'.");
AddStringParam("Currency", "Enter resource currency (must be one from list of available resource currencies defined).");
AddNumberParam("Amount", "Enter amount.");
AddStringParam("Item type", "Enter item type (must be one from list of available resource item types).");
AddStringParam("Item id", "Enter item id.");
AddAction(7, af_none, "Add resource event", "GameAnalytics", "Add resource event {0}:{1}:{2}:{3}:{4}", "Add resource event. Must first be called after initializing SDK.", "addResourceEvent");

AddComboParamOption("Undefined");
AddComboParamOption("Start");
AddComboParamOption("Complete");
AddComboParamOption("Fail");
AddComboParam("Progression status", "Enter progression status.");
AddStringParam("Progression 01", "Enter progression 01.");
AddStringParam("Progression 02", "Enter progression 02 (leave empty if not required).");
AddStringParam("Progression 03", "Enter progression 03 (leave empty if not required).");
AddAction(8, af_none, "Add progression event", "GameAnalytics", "Add progression event {0}:{1}:{2}:{3}", "Add progression event. Must first be called after initializing SDK.", "addProgressionEvent");

AddComboParamOption("Undefined");
AddComboParamOption("Start");
AddComboParamOption("Complete");
AddComboParamOption("Fail");
AddComboParam("Progression status", "Enter progression status.");
AddStringParam("Progression 01", "Enter progression 01.");
AddStringParam("Progression 02", "Enter progression 02 (leave empty if not required).");
AddStringParam("Progression 03", "Enter progression 03 (leave empty if not required).");
AddNumberParam("Score", "Enter score (only works with Complete or Fail progression status).");
AddAction(9, af_none, "Add progression event with score", "GameAnalytics", "Add progression event {0}:{1}:{2}:{3}:{4}", "Add progression event with score. Must first be called after initializing SDK.", "addProgressionEventWithScore");

AddStringParam("Event ID", "Enter event ID.");
AddAction(10, af_none, "Add design event", "GameAnalytics", "Add design event {0}", "Add design event. Must first be called after initializing SDK.", "addDesignEvent");

AddStringParam("Event ID", "Enter event ID.");
AddNumberParam("Value", "Enter value.");
AddAction(11, af_none, "Add design event with value", "GameAnalytics", "Add design event with value {0}:{1}", "Add design event with value. Must first be called after initializing SDK.", "addDesignEventWithValue");

AddComboParamOption("Undefined");
AddComboParamOption("Debug");
AddComboParamOption("Info");
AddComboParamOption("Warning");
AddComboParamOption("Error");
AddComboParamOption("Critical");
AddComboParam("Severity", "Enter error severity.");
AddStringParam("Message", "Enter error message.");
AddAction(12, af_none, "Add error event", "GameAnalytics", "Add error event {0}:{1}", "Add error event. Must first be called after initializing SDK.", "addErrorEvent");

AddComboParamOption("False");
AddComboParamOption("True");
AddComboParam("Flag", "Enter True to enable and False to disable.");
AddAction(15, af_none, "Enable/disable manual session handling", "GameAnalytics", "Manual session handling enabled set to {0}", "Enable/disable manual session handling.", "setEnabledManualSessionHandling");

AddStringParam("Dimension", "Enter 01 dimension (must be one from list of available 01 dimensions defined). Set it to empty to reset to none.");
AddAction(16, af_none, "Set current 01 dimension", "GameAnalytics", "Set current 01 dimension to {0}", "Set current 01 dimension. Set to empty string to remove it.", "setCustomDimension01");

AddStringParam("Dimension", "Enter 02 dimension (must be one from list of available 02 dimensions defined). Set it to empty to reset to none.");
AddAction(17, af_none, "Set current 02 dimension", "GameAnalytics", "Set current 02 dimension to {0}", "Set current 02 dimension. Set to empty string to remove it.", "setCustomDimension02");

AddStringParam("Dimension", "Enter 03 dimension (must be one from list of available 03 dimensions defined). Set it to empty to reset to none.");
AddAction(18, af_none, "Set current 03 dimension", "GameAnalytics", "Set current 03 dimension to {0}", "Set current 03 dimension. Set to empty string to remove it.", "setCustomDimension03");

AddStringParam("Facebook ID", "Enter Facebook ID");
AddAction(19, af_none, "Set Facebook ID", "GameAnalytics", "Set Facebook ID to {0}", "Set Facebook ID.", "setFacebookId");

AddComboParamOption("Undefined");
AddComboParamOption("Male");
AddComboParamOption("Female");
AddComboParam("Gender", "Enter gender");
AddAction(20, af_none, "Set gender", "GameAnalytics", "Set gender to {0}", "Set gender.", "setGender");

AddNumberParam("Birth year", "Enter birth year");
AddAction(21, af_none, "Set birth year", "GameAnalytics", "Set birth year to {0}", "Set birth year.", "setBirthYear");

AddAction(22, af_none, "Start new session", "GameAnalytics", "Start new session", "Start new session (only works if manual session handling is enabled).", "startSession");

AddAction(23, af_none, "End session", "GameAnalytics", "End session", "End session (only works if manual session handling is enabled).", "endSession");

////////////////////////////////////////
// Expressions

// AddExpression(id,            // any positive integer to uniquely identify this expression
//                 flags,            // (see docs) ef_none, ef_deprecated, ef_return_number, ef_return_string,
//                                // ef_return_any, ef_variadic_parameters (one return flag must be specified)
//                 list_name,        // currently ignored, but set as if appeared in event wizard
//                 category,        // category in expressions panel
//                 exp_name,        // the expression name after the dot, e.g. "foo" for "myobject.foo" - also the runtime function name
//                 description);    // description in expressions panel

////////////////////////////////////////
ACESDone();

////////////////////////////////////////
// Array of property grid properties for this plugin
// new cr.Property(ept_integer,        name,    initial_value,    description)        // an integer value
// new cr.Property(ept_float,        name,    initial_value,    description)        // a float value
// new cr.Property(ept_text,        name,    initial_value,    description)        // a string
// new cr.Property(ept_color,        name,    initial_value,    description)        // a color dropdown
// new cr.Property(ept_font,        name,    "Arial,-16",     description)        // a font with the given face name and size
// new cr.Property(ept_combo,        name,    "Item 1",        description, "Item 1|Item 2|Item 3")    // a dropdown list (initial_value is string of initially selected item)
// new cr.Property(ept_link,        name,    link_text,        description, "firstonly")        // has no associated value; simply calls "OnPropertyChanged" on click

var property_list = [
    new cr.Property(ept_text, "Build", "0.1", "Build version of the game."),
    new cr.Property(ept_text, "Custom user ID", "", "Custom user ID. Leave empty if not used."),
    new cr.Property(ept_combo, "Enable manual session handling", "False", "Enable/disable manual session handling", "False|True"),
    new cr.Property(ept_combo, "Enable info log", "True", "Enable/disable info log", "False|True"),
    new cr.Property(ept_combo, "Enable verbose log", "False", "Enable/disable verbose log", "False|True"),
    new cr.Property(ept_text, "Game key (browser)", "", "Game key of the game for browser platform. It can found when you log in with your account credentials on https://go.gameanalytics.com."),
    new cr.Property(ept_text, "Secret key (browser)", "", "Secret key of the game for browser platform. It can found when you log in with your account credentials on https://go.gameanalytics.com."),
    new cr.Property(ept_text, "Game key (android)", "", "Game key of the game for Android platform. It can found when you log in with your account credentials on https://go.gameanalytics.com."),
    new cr.Property(ept_text, "Secret key (android)", "", "Secret key of the game for Android platform. It can found when you log in with your account credentials on https://go.gameanalytics.com."),
    new cr.Property(ept_text, "Game key (ios)", "", "Game key of the game for iOS platform. It can found when you log in with your account credentials on https://go.gameanalytics.com."),
    new cr.Property(ept_text, "Secret key (ios)", "", "Secret key of the game for iOS platform. It can found when you log in with your account credentials on https://go.gameanalytics.com.")
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
