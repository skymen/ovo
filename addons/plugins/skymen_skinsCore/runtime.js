// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
//          vvvvvvvv
cr.plugins_.skymen_skinsCore = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	/////////////////////////////////////
	// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
	//                            vvvvvvvv
	var pluginProto = cr.plugins_.skymen_skinsCore.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;

	// called on startup for each object type
	typeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		
		// any other properties you need, e.g...
		// this.myValue = 0;
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	// called whenever an instance is created
	instanceProto.onCreate = function()
	{
		// note the object is sealed after this call; ensure any properties you'll ever need are set on the object
		// e.g...

		this.skins = {};
		this.lastSkin;
		this.lastSubSkin;
		this.curSkin;
		this.curSubSkin;
		this.tag = this.properties[0];
		this.instances = [];
		this.init = false;
		if(cr.SkymenSkinCore == undefined){
			cr.SkymenSkinCore = {}
		}
		cr.SkymenSkinCore[this.tag] = this;
	};
	
	// only called if a layout object - draw to a canvas 2D context
	instanceProto.draw = function(ctx)
	{
	};
	
	// only called if a layout object in WebGL mode - draw to the WebGL context
	// 'glw' is not a WebGL context, it's a wrapper - you can find its methods in GLWrap.js in the install
	// directory or just copy what other plugins do.
	instanceProto.drawGL = function (glw)
	{
	};

	instanceProto.addInstance = function (inst) 
	{
		this.instances.push(inst);
	}

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	Cnds.prototype.IsEmpty = function ()
	{
		return Object.keys(this.skins).length === 0 && this.skins.constructor === Object;
	};

	Cnds.prototype.HasSkin = function (skin)
	{
		return this.skins[skin] != undefined;
	};
	
	Cnds.prototype.HasSubSkin = function (skin, subskin)
	{
		return this.skins[skin] != undefined && this.skins[skin][subskin] != undefined;
	};

	Cnds.prototype.OnSkin = function (skin)
	{
		return skin == this.lastSkin;
	};

	Cnds.prototype.OnSubSkin = function (skin, subskin)
	{
		return skin == this.lastSkin && subskin == this.lastSubskin;
	};

	Cnds.prototype.OnAnySkin = function ()
	{
		return true;
	};

	Cnds.prototype.OnAnySubSkin = function (skin)
	{
		return skin == this.lastSkin;
	};

	Cnds.prototype.OnAnySubAnySkin = function ()
	{
		return true;
	};

	instanceProto.doForEachTrigger = function (current_event)
	{
		this.runtime.pushCopySol(current_event.solModifiers);
		current_event.retrigger();
		this.runtime.popSol(current_event.solModifiers);
	};

	Cnds.prototype.ForEachSkin = function ()
	{
		var current_event = this.runtime.getCurrentEventStack().current_event;
		self = this;
		Object.keys(this.skins).forEach(function (k) {
			self.curSkin = k;
			self.doForEachTrigger(current_event);
		})
		return false;
	};

	Cnds.prototype.ForEachSubSkin = function (skin)
	{
		var current_event = this.runtime.getCurrentEventStack().current_event;
		self = this;

		if(this.skins[skin] == undefined) return false;

		Object.keys(this.skins[skin]).forEach(function (k) {
			self.curSubSkin = k;
			self.doForEachTrigger(current_event);
		})
		return false;
	};

	// ... other conditions here ...
	
	pluginProto.cnds = new Cnds();
	
	//////////////////////////////////////
	// Actions
	function Acts() {};

	Acts.prototype.AddSkin = function (obj, skin, mode, anim, subskin)
	{
		if(this.skins[skin] == undefined){
			this.skins[skin] = {};
		}
		if(mode == 0){
			for (var i = 0; i < obj.animations.length; i++) {

				var anim = obj.animations[i].name;

				this.skins[skin][anim] = {
					"type": obj,
					"anim": anim
				}
			}
		}
		else{
			this.skins[skin][subskin] = {
				"type": obj,
				"anim": anim
			}
		}
	};

	Acts.prototype.AddSubSkin = function (obj, skin, subskin, anim)
	{
		if(this.skins[skin] == undefined){
			this.skins[skin] = {};
		}

		this.skins[skin][subskin] = {
			"type": obj,
			"anim": anim
		}
	};

	Acts.prototype.RemoveSkin = function (skin)
	{
		if (this.skins[skin] != undefined) {
			delete this.skins[skin];
		}
	};

	Acts.prototype.RemoveSubSkin = function (skin, subskin)
	{
		if (this.skins[skin] != undefined && this.skins[skin][subskin] != undefined) {
			delete this.skins[skin][subskin];
		}
	};

	Acts.prototype.Init = function ()
	{
		if(this.init) return;
		
		for (var i = 0; i < this.instances.length; i++) {
			this.instances[i].updateSkin();
		}
		this.init = true;
	};

	// ... other actions here ...
	
	pluginProto.acts = new Acts();
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	
	Exps.prototype.CurSkin = function (ret)
	{
		ret.set_string(this.curSkin);
	};
	
	Exps.prototype.CurSubSkin = function (ret)
	{
		ret.set_string(this.curSubSkin);
	};

	Exps.prototype.LastSkin = function (ret)
	{
		ret.set_string(this.lastSkin);
	};
	
	Exps.prototype.LastSubSkin = function (ret)
	{
		ret.set_string(this.lastSubSkin);
	};

	Exps.prototype.RandomSkin = function (ret)
	{
		var keys = Object.keys(this.skins)
		var res = keys[ keys.length * Math.random() << 0];
		if(typeof res == "string")
			ret.set_string(res);
		else
			ret.set_string("");
	};

	Exps.prototype.RandomSubSkin = function (ret,skin)
	{
		if(this.skins[skin]){
			var keys = Object.keys(this.skins[skin])
			var res = keys[ keys.length * Math.random() << 0];
			if (typeof res == "string")
				ret.set_string(res);
			else
				ret.set_string("");
		}
		else{
			console.warn("The skin " + skin + " doesn't exist")
			ret.set_string("")
		}
	};
	
	// ... other expressions here ...
	
	pluginProto.exps = new Exps();

}());