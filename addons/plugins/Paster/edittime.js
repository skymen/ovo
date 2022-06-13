function GetPluginSettings()
{
	return {
		"name":			"Paster",				// as appears in 'insert object' dialog, can be changed as long as "id" stays the same
		"id":			"rojoPaster",				// this is used to identify this plugin and is saved to the project; never change it
		"version":		"0.5",					// (float in x.y format) Plugin version - C2 shows compatibility warnings based on this
		"description":	"A object you can render (or paste) to.",
		"author":		"R0J0hound",
		"help url":		"<your website or a manual entry on Scirra.com>",
		"category":		"Graphics",				// Prefer to re-use existing categories, but you can set anything here
		"type":			"world",				// either "world" (appears in layout and is drawn), else "object"
		"rotatable":	true,					// only used when "type" is "world".  Enables an angle property on the object.
		"flags":		0						// uncomment lines to enable flags...
					//	| pf_singleglobal		// exists project-wide, e.g. mouse, keyboard.  "type" must be "object".
					//	| pf_texture			// object has a single texture (e.g. tiled background)
						| pf_position_aces		// compare/set/get x, y...
						| pf_size_aces			// compare/set/get width, height...
						| pf_angle_aces			// compare/set/get angle (recommended that "rotatable" be set to true)
						| pf_appearance_aces	// compare/set/get visible, opacity...
					//	| pf_tiling				// adjusts image editor features to better suit tiled images (e.g. tiled background)
					//	| pf_animations			// enables the animations system.  See 'Sprite' for usage
						| pf_zorder_aces		// move to top, bottom, layer...
					//  | pf_nosize				// prevent resizing in the editor
						| pf_effects			// allow WebGL shader effects to be added
                        | pf_predraw			// set for any plugin which draws and is not a sprite (i.e. does not simply draw
												// a single non-tiling image the size of the object) - required for effects to work properly
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
				
// example				
//AddNumberParam("Number", "Enter a number to test if positive.");
//AddCondition(0, cf_none, "Is number positive", "My category", "{0} is positive", "Description for my condition!", "MyCondition");

////////////////////////////////////////
// Actions

// AddAction(id,				// any positive integer to uniquely identify this action
//			 flags,				// (see docs) af_none, af_deprecated
//			 list_name,			// appears in event wizard list
//			 category,			// category in event wizard list
//			 display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//			 description,		// appears in event wizard dialog when selected
//			 script_name);		// corresponding runtime function name

// example
//AddStringParam("Message", "Enter a string to alert.");
//AddAction(0, af_none, "Alert", "My category", "Alert {0}", "Description for my action!", "MyAction");
AddObjectParam("Object", "Object to paste.");
AddAction(0, af_none, "Paste Object", "Canvas", "Paste Object {0} into canvas", "Pastes objects into the canvas.", "PasteObject");

AddNumberParam("red", "red 0-255", 0);
AddNumberParam("green", "green 0-255", 0);
AddNumberParam("blue", "blue 0-255", 0);
AddNumberParam("alpha", "alpha 0-100", 100);
AddAction(1, af_none, "Clear to color", "Canvas", "Clear to rgba({0},{1},{2},{3})", "Clears to a color.", "ClearColor");

AddNumberParam("resx", "X resolution", 0);
AddNumberParam("resy", "Y resolution", 0);
AddAction(2, af_none, "Set resolution", "Canvas", "Set resolution to ({0},{1})", "Set texture resolution.", "SetResolution");

AddNumberParam("red", "red 0-255", 0);
AddNumberParam("green", "green 0-255", 0);
AddNumberParam("blue", "blue 0-255", 0);
AddNumberParam("alpha", "alpha 0-100", 100);
AddAction(3, af_none, "Set quad color", "Quad", "Set quad color to rgba({0},{1},{2},{3})", "Sets color for \"Draw quad\".", "QuadColor");

AddNumberParam("x1", "Point x", 0);
AddNumberParam("y1", "Point y", 0);
AddNumberParam("x2", "Point x", 0);
AddNumberParam("y2", "Point y", 0);
AddNumberParam("x3", "Point x", 0);
AddNumberParam("y3", "Point y", 0);
AddNumberParam("x4", "Point x", 0);
AddNumberParam("y4", "Point y", 0);
AddComboParamOption("Normal");
AddComboParamOption("Additive");
AddComboParamOption("XOR");
AddComboParamOption("Copy");
AddComboParamOption("Destination over");
AddComboParamOption("Source in");
AddComboParamOption("Destination in");
AddComboParamOption("Source out");
AddComboParamOption("Destination out");
AddComboParamOption("Source atop");
AddComboParamOption("Destination atop");
AddComboParam("blend", "Choose the blend for this quad.");
AddAction(4, af_none, "Draw Quad", "Quad", "Draw Quad (({0},{1}),({2},{3}),({4},{5}),({6},{7})) with blend {8}", "Draw Quad.", "DrawQuad");

AddComboParamOption("Normal");
AddComboParamOption("Additive");
AddComboParamOption("XOR");
AddComboParamOption("Copy");
AddComboParamOption("Destination over");
AddComboParamOption("Source in");
AddComboParamOption("Destination in");
AddComboParamOption("Source out");
AddComboParamOption("Destination out");
AddComboParamOption("Source atop");
AddComboParamOption("Destination atop");
AddComboParam("Blend mode", "Choose the new blend mode for this object.");
AddAction(5, af_none, "Set blend mode", "Appearance", "Set blend mode to <i>{0}</i>", "Set the background blend mode for this object.", "SetEffect");

AddNumberParam("x1", "Point x", 0);
AddNumberParam("y1", "Point y", 0);
AddNumberParam("x2", "Point x", 0);
AddNumberParam("y2", "Point y", 0);
AddNumberParam("x3", "Point x", 0);
AddNumberParam("y3", "Point y", 0);
AddNumberParam("x4", "Point x", 0);
AddNumberParam("y4", "Point y", 0);
AddComboParamOption("Normal");
AddComboParamOption("Additive");
AddComboParamOption("XOR");
AddComboParamOption("Copy");
AddComboParamOption("Destination over");
AddComboParamOption("Source in");
AddComboParamOption("Destination in");
AddComboParamOption("Source out");
AddComboParamOption("Destination out");
AddComboParamOption("Source atop");
AddComboParamOption("Destination atop");
AddComboParam("blend", "Choose the blend for this quad.");
AddNumberParam("opacity", "opacity 0-100", 100);
AddObjectParam("object", "Use the texture of the first picked object.");
AddAction(6, af_none, "Draw Textured Quad", "Quad", "Draw Textured Quad (({0},{1}),({2},{3}),({4},{5}),({6},{7})) with blend {8}, opactity, {9}, and texture from {10}", "Draw Textured Quad.", "DrawTexQuad");

AddNumberParam("index", "vertice number (0,1,2 or 3)", 0);
AddNumberParam("x", "vertice x", 0);
AddNumberParam("y", "vertice y", 0);
AddNumberParam("u", "vertice u (0-1)", 0);
AddNumberParam("v", "vertice v (0,1)", 0);
AddAction(11, af_none, "Set vertice", "Quad", "Set vertice {0} to xy({1},{2}) and uv({3},{4})", "Set vertice.", "setVertice");

AddComboParamOption("Normal");
AddComboParamOption("Additive");
AddComboParamOption("XOR");
AddComboParamOption("Copy");
AddComboParamOption("Destination over");
AddComboParamOption("Source in");
AddComboParamOption("Destination in");
AddComboParamOption("Source out");
AddComboParamOption("Destination out");
AddComboParamOption("Source atop");
AddComboParamOption("Destination atop");
AddComboParam("blend", "Choose the blend for this quad.");
AddNumberParam("opacity", "opacity 0-100", 100);
AddObjectParam("object", "Use the texture of the first picked object.");
AddAction(10, af_none, "Draw Textured Quad with uv", "Quad", "Draw Textured Quad with uv using, blend {0}, opactity, {1}, and texture from {2}", "Draw Textured Quad with uv.", "DrawSubTexQuad");

//AddStringParam("imageUrl", "Image to load", "");
//AddAction(7, cf_deprecated, "Load quad image", "Quad", "Load quad image {0}", "Sets the texture for \"Draw textured quad\".", "LoadQuadImage");

AddStringParam("URI", "Enter the URL on the web, or data URI, of an image to load.", "\"http://\"");
AddComboParamOption("Resize to image size");
AddComboParamOption("Keep current size");
AddComboParam("Size", "Whether to resize the object to the size of the loaded image, or stretch it to the current size.");
AddAction(8, af_none, "Load image", "Canvas", "Load image from <i>{0}</i> ({1})", "Loads image into the canvas", "LoadImage");

AddAction(9, af_none, "Load texture from canvas", "Canvas", "Load texture from canvas", "Load texture from  the whole canvas.", "LoadCanvas");


////////////////////////////////////////
// Expressions

// AddExpression(id,			// any positive integer to uniquely identify this expression
//				 flags,			// (see docs) ef_none, ef_deprecated, ef_return_number, ef_return_string,
//								// ef_return_any, ef_variadic_parameters (one return flag must be specified)
//				 list_name,		// currently ignored, but set as if appeared in event wizard
//				 category,		// category in expressions panel
//				 exp_name,		// the expression name after the dot, e.g. "foo" for "myobject.foo" - also the runtime function name
//				 description);	// description in expressions panel

// example
//AddExpression(0, ef_return_number, "Leet expression", "My category", "MyExpression", "Return the number 1337.");
AddExpression(0, ef_return_string, "get image url", "canvas", "imageUrl", "This returns a temporary url to the image on the canvas.  It is a rather slow operation.");


////////////////////////////////////////
ACESDone();

////////////////////////////////////////
// Array of property grid properties for this plugin
// new cr.Property(ept_integer,		name,	initial_value,	description)		// an integer value
// new cr.Property(ept_float,		name,	initial_value,	description)		// a float value
// new cr.Property(ept_text,		name,	initial_value,	description)		// a string
// new cr.Property(ept_color,		name,	initial_value,	description)		// a color dropdown
// new cr.Property(ept_font,		name,	"Arial,-16", 	description)		// a font with the given face name and size
// new cr.Property(ept_combo,		name,	"Item 1",		description, "Item 1|Item 2|Item 3")	// a dropdown list (initial_value is string of initially selected item)
// new cr.Property(ept_link,		name,	link_text,		description, "firstonly")		// has no associated value; simply calls "OnPropertyChanged" on click

var property_list = [
	new cr.Property(ept_combo,	"Initial visibility",	"Visible",	"Choose whether the object is visible when the layout starts.", "Visible|Invisible"),
	new cr.Property(ept_combo,	"Hotspot",				"Top-left",	"Choose the location of the hot spot in the object.", "Top-left|Top|Top-right|Left|Center|Right|Bottom-left|Bottom|Bottom-right")
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

IDEInstance.prototype.OnCreate = function()
{

	switch (this.properties["Hotspot"])
	{
    case "Top-left" :
      this.instance.SetHotspot(new cr.vector2(0, 0));
      break;
    case "Top" :
      this.instance.SetHotspot(new cr.vector2(0.5, 0));
      break;
    case "Top-right" :
      this.instance.SetHotspot(new cr.vector2(1, 0));
      break;
    case "Left" :
      this.instance.SetHotspot(new cr.vector2(0, 0.5));
      break;
    case "Center" :
      this.instance.SetHotspot(new cr.vector2(0.5, 0.5));
      break;
    case "Right" :
      this.instance.SetHotspot(new cr.vector2(1, 0.5));
      break;
    case "Bottom-left" :
      this.instance.SetHotspot(new cr.vector2(0, 1));
      break;
    case "Bottom" :
      this.instance.SetHotspot(new cr.vector2(0.5, 1));
      break;
    case "Bottom-right" :
		  this.instance.SetHotspot(new cr.vector2(1, 1));
      break;
	}
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
    if (property_name === "Hotspot")
	{
        switch (this.properties["Hotspot"])
        {
          case "Top-left" :
            this.instance.SetHotspot(new cr.vector2(0, 0));
          break;
          case "Top" :
            this.instance.SetHotspot(new cr.vector2(0.5, 0));
          break;
          case "Top-right" :
            this.instance.SetHotspot(new cr.vector2(1, 0));
          break;
          case "Left" :
            this.instance.SetHotspot(new cr.vector2(0, 0.5));
          break;
          case "Center" :
            this.instance.SetHotspot(new cr.vector2(0.5, 0.5));
          break;
          case "Right" :
            this.instance.SetHotspot(new cr.vector2(1, 0.5));
          break;
          case "Bottom-left" :
            this.instance.SetHotspot(new cr.vector2(0, 1));
          break;
          case "Bottom" :
            this.instance.SetHotspot(new cr.vector2(0.5, 1));
          break;
          case "Bottom-right" :
            this.instance.SetHotspot(new cr.vector2(1, 1));
          break;
        }
    }
}

// For rendered objects to load fonts or textures
IDEInstance.prototype.OnRendererInit = function(renderer)
{
}

// Called to draw self in the editor if a layout object
IDEInstance.prototype.Draw = function(renderer)
{
    var q=this.instance.GetBoundingQuad();
	renderer.Fill(q, cr.RGB(255,255,255));
	renderer.Outline(q, cr.RGB(0,0,0));
}

// For rendered objects to release fonts or textures
IDEInstance.prototype.OnRendererReleased = function(renderer)
{
}