// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
// *** CHANGE THE BEHAVIOR ID HERE *** - must match the "id" property in edittime.js
//           vvvvvvvvvv
cr.behaviors.SkymenPolarCoordinates = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	// *** CHANGE THE BEHAVIOR ID HERE *** - must match the "id" property in edittime.js
	//                               vvvvvvvvvv
	var behaviorProto = cr.behaviors.SkymenPolarCoordinates.prototype;

	/////////////////////////////////////
	// Behavior type class
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};

	var behtypeProto = behaviorProto.Type.prototype;

	behtypeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};

	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
		// Load properties
		this.Enabled = this.properties[4] == 0;
		this.Radius = this.properties[2];
		this.Angle = this.properties[3];
		this.OriginX = this.properties[0];
		this.OriginY = this.properties[1];
		this.ud = false
		if(this.Enabled){
			this.update();
		}

		// object is sealed after this call, so make sure any properties you'll ever need are created, e.g.
		// this.myValue = 0;
	};

	behinstProto.onDestroy = function ()
	{
		// called when associated object is being destroyed
		// note runtime may keep the object and behavior alive after this call for recycling;
		// release, recycle or reset any references here as necessary
	};

	// called when saving the full state of the game
	behinstProto.saveToJSON = function ()
	{
		// return a Javascript object containing information about your behavior's state
		// note you MUST use double-quote syntax (e.g. "property": value) to prevent
		// Closure Compiler renaming and breaking the save format
		return {
			"DX": this.Radius,
			"DY": this.Angle,
			"OX": this.OriginX,
			"OY": this.OriginY,
			"Enabled": this.Enabled
		};
	};

	// called when loading the full state of the game
	behinstProto.loadFromJSON = function (o)
	{
		this.Radius = o["DX"];
		this.Angle = o["DY"];
		this.OriginX = o["OX"];
		this.OriginY = o["OY"];
		this.Enabled = o["Enabled"]
		this.update();

		// load from the state previously saved by saveToJSON
		// 'o' provides the same object that you saved, e.g.
		// this.myValue = o["myValue"];
		// note you MUST use double-quote syntax (e.g. o["property"]) to prevent
		// Closure Compiler renaming and breaking the save format
	};

	behinstProto.update = function(mode = 1) {
		if(mode === 0){
			this.Radius = this.inst.x;
			this.Angle = this.inst.y;
		}
		this.ud = true;
	}

	behinstProto.tick = function ()
	{
		if(this.Angle > 359){
			this.Angle = this.Angle%360
		}
		if(this.ud){
			this.inst.x = this.OriginX + Math.cos(this.Angle * Math.PI / 180) * this.Radius;
			this.inst.y = this.OriginY + Math.sin(this.Angle * Math.PI / 180) * this.Radius;
			this.inst.set_bbox_changed();
			this.ud = false;
		}
	};

	behinstProto.tick2 = function ()
	{

	};

	// The comments around these functions ensure they are removed when exporting, since the
	// debugger code is no longer relevant after publishing.
	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function (propsections)
	{
		// Append to propsections any debugger sections you want to appear.
		// Each section is an object with two members: "title" and "properties".
		// "properties" is an array of individual debugger properties to display
		// with their name and value, and some other optional settings.
		propsections.push({
			"title": this.type.name,
			"properties": [
				// Each property entry can use the following values:
				// "name" (required): name of the property (must be unique within this section)
				// "value" (required): a boolean, number or string for the value
				// "html" (optional, default false): set to true to interpret the name and value
				//									 as HTML strings rather than simple plain text
				// "readonly" (optional, default false): set to true to disable editing the property
				{"name": "Radius", "value": this.Radius},
				{"name": "Angle", "value": this.Angle},
				{"name": "Origin X", "value": this.OriginX},
				{"name": "Origin Y", "value": this.OriginY},
				{"name": "Enabled", "value": this.Enabled}
			]
		});
	};

	behinstProto.onDebugValueEdited = function (header, name, value)
	{
		// Called when a non-readonly property has been edited in the debugger. Usually you only
		// will need 'name' (the property name) and 'value', but you can also use 'header' (the
		// header title for the section) to distinguish properties with the same name.
		if (name === "Enabled")
			this.Enabled = value;
		if (name === "Radius")
			this.Radius = value;
		if (name === "Angle")
			this.Angle = value;
		if (name === "Origin X")
			this.OriginX = value;
		if (name === "Origin Y")
			this.OriginY = value;
		if (this.Enabled)
			this.update();
	};
	/**END-PREVIEWONLY**/

	//////////////////////////////////////
	// Conditions
	function Cnds() {};

	// the example condition
	Cnds.prototype.IsEnabled = function ()
	{
		// ... see other behaviors for example implementations ...
		return this.Enabled;
	};

	Cnds.prototype.CompareRadius = function (cmp, v)
	{
		return cr.do_cmp(this.Radius, cmp, v);
	};

	Cnds.prototype.CompareAngle = function (cmp, v)
	{
		return cr.do_cmp(this.Angle, cmp, v);
	};

	Cnds.prototype.CompareOriginX = function (cmp, v)
	{
		return cr.do_cmp(this.OriginX, cmp, v);
	};

	Cnds.prototype.CompareOriginY = function (cmp, v)
	{
		return cr.do_cmp(this.OriginY, cmp, v);
	};

	// ... other conditions here ...

	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};

	// the example action
	Acts.prototype.SetEnabled = function (value)
	{
		if(value === 0){
			this.Enabled = true;
			this.update();
		}
		else
			this.Enabled = false;
	};

	Acts.prototype.SetRadius = function (value)
	{
		var en = this.Enabled;
		if(en){
			this.Radius = value;
			this.update();
		}
	};

	Acts.prototype.SetAngle = function (value)
	{
		var en = this.Enabled;
		if(en){
			this.Angle = value;
			this.update();
		}
	};

	Acts.prototype.SetDeltaPos = function (v1,v2)
	{
		var en = this.Enabled;
		if(en){
			this.Radius = v1;
			this.Angle = v2;
			this.update();
		}
	};

	Acts.prototype.SetOriginX = function (value)
	{
		var en = this.Enabled;
		if(en){
			this.OriginX = value;
			this.update();
		}
	};

	Acts.prototype.SetOriginY = function (value)
	{
		var en = this.Enabled;
		if(en){
			this.OriginY = value;
			this.update();
		}
	};

	Acts.prototype.SetOriginPos = function (v1,v2)
	{
		var en = this.Enabled;
		if(en){
			this.OriginX = v1;
			this.OriginY = v2;
			this.update();
		}
	};

	Acts.prototype.Update = function (mode)
	{
		this.update(mode);
	};
	// ... other actions here ...

	behaviorProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};

	// the example expression
	Exps.prototype.Radius = function (ret)	// 'ret' must always be the first parameter - always return the expression's result through it!
	{
		ret.set_float(this.Radius);
	};

	Exps.prototype.Angle = function (ret)	// 'ret' must always be the first parameter - always return the expression's result through it!
	{
		ret.set_float(this.Angle);
	};

	Exps.prototype.DeltaX = function (ret)	// 'ret' must always be the first parameter - always return the expression's result through it!
	{
		ret.set_float(this.Radius);
	};

	Exps.prototype.DeltaY = function (ret)	// 'ret' must always be the first parameter - always return the expression's result through it!
	{
		ret.set_float(this.Angle);
	};

	Exps.prototype.OriginX = function (ret)	// 'ret' must always be the first parameter - always return the expression's result through it!
	{
		ret.set_float(this.OriginX);
	};

	Exps.prototype.OriginY = function (ret)	// 'ret' must always be the first parameter - always return the expression's result through it!
	{
		ret.set_float(this.OriginY);
	};

	Exps.prototype.CarToPolRad = function (ret,X,Y,OX,OY)	// 'ret' must always be the first parameter - always return the expression's result through it!
	{
		X = X - OX;
		Y = Y - OY;
		var Dist = Math.sqrt(Math.pow(X,2) + Math.pow(Y,2));
		ret.set_float(Dist);
	};

	Exps.prototype.CarToPolAngle = function (ret,X,Y,OX,OY)	// 'ret' must always be the first parameter - always return the expression's result through it!
	{
		X = X - OX;
		Y = Y - OY;
		var Angle = Math.atan2(Y,X)*180/Math.PI;
		ret.set_float(Angle);
	};

	Exps.prototype.PolToCarX = function (ret,Dist,Angle,OX)	// 'ret' must always be the first parameter - always return the expression's result through it!
	{
		var X =  OX + Math.cos(Angle * Math.PI / 180) * Dist;
		var X = Math.floor(X * 1000)/1000;
		ret.set_float(X);
	};

	Exps.prototype.PolToCarY = function (ret,Dist,Angle,OY)	// 'ret' must always be the first parameter - always return the expression's result through it!
	{
		var Y =  OY + Math.sin(Angle * Math.PI / 180) * Dist;
		var Y = Math.floor(Y * 1000)/1000;
		ret.set_float(Y);
	};

	Exps.prototype.Status = function (ret)	// 'ret' must always be the first parameter - always return the expression's result through it!
	{
		if(this.Enabled)
			ret.set_string("Enabled");
		else
			ret.set_string("Disabled");
	};

	// ... other expressions here ...

	behaviorProto.exps = new Exps();

}());
