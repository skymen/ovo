// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
// *** CHANGE THE BEHAVIOR ID HERE *** - must match the "id" property in edittime.js
//           vvvvvvvvvv
cr.behaviors.SkymenSkin = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	// *** CHANGE THE BEHAVIOR ID HERE *** - must match the "id" property in edittime.js
	//                               vvvvvvvvvv
	var behaviorProto = cr.behaviors.SkymenSkin.prototype;

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
		this.skinBaseTag = this.properties[0];
		
		// object is sealed after this call, so make sure any properties you'll ever need are created, e.g.
		if(cr.SkymenSkinCore == undefined){
			alert("Skin base plugin needed, please create it.");
		}
		else if(cr.SkymenSkinCore[this.skinBaseTag] == undefined){
			alert("Skin base with tag " + this.skinBaseTag + " cannot be found.");
		}
		else{
			this.skinBase = cr.SkymenSkinCore[this.skinBaseTag];
			this.skinBase.addInstance(this);
		}

		//Properties ======
		this.skinTag = this.properties[1];
		this.subSkinTag = this.properties[2];
		this.oldSkinTag = this.properties[1];
		this.oldSubSkinTag = this.properties[2];
		this.syncWithAnim = this.properties[3] === 0 ||this.properties[3] === 2;
		this.syncWithFrame = this.properties[3] === 1 ||this.properties[3] === 2;
		this.default = this.properties[4] === 0; //0 = Yes, 1 = No
		this.hideDefault = this.properties[5] === 0; //0 = Yes, 1 = No
		this.imagePoint = this.properties[6];
		this.syncZOrder = this.properties[7] === 0; //0 = Yes, 1 = No
		this.syncSize = this.properties[8] === 1;
		this.syncScale = this.properties[8] === 2;
		this.firstFrame = true;
		this.widthRatio = 1;
		this.heightRatio = 1;
		this.lastLayout = this.runtime.running_layout


		//Object
		this.object = null;
		if(!this.inst.behaviorSkins){
			this.inst.behaviorSkins = [];
		}
		var found = false

		for (let index = 0; index < this.inst.behaviorSkins.length; index++) {
			const behavior = this.inst.behaviorSkins[index];
			if (this === behavior) {
				found = true
				this.behaviorId = index
			}
		}

		if (!found){
			this.behaviorId = this.inst.behaviorSkins.length;
			this.inst.behaviorSkins.push(this);
		}
		

		//Init
		if(this.skinBase.init){
			this.updateSkin();
		}
	};

	behinstProto.onDestroy = function () {
		this.destroy();
	};

	// called when saving the full state of the game
	behinstProto.saveToJSON = function () {
		// return a Javascript object containing information about your behavior's state
		// note you MUST use double-quote syntax (e.g. "property": value) to prevent
		// Closure Compiler renaming and breaking the save format
		return {
			"skinTag": this.skinTag,
			"subSkinTag": this.subSkinTag,
			"oldSkinTag": this.oldSkinTag,
			"oldSubSkinTag": this.oldSubSkinTag,
			"syncWithAnim": this.syncWithAnim,
			"syncWithFrame": this.syncWithFrame,
			"default": this.default,
			"hideDefault": this.hideDefault,
			"imagePoint": this.imagePoint,
			"syncZOrder": this.syncZOrder,
			"syncSize": this.syncSize,
			"syncScale": this.syncScale,
			"firstFrame": this.firstFrame,
			"skinBaseTag": this.skinBaseTag,
			"behaviorId": this.behaviorId
		};
	};

	// called when loading the full state of the game
	behinstProto.loadFromJSON = function (o) {
		// load from the state previously saved by saveToJSON
		// 'o' provides the same object that you saved, e.g.
		// this.myValue = o["myValue"];
		this.skinTag = o["skinTag"];
		this.subSkinTag = o["subSkinTag"];
		this.oldSkinTag = o["oldSkinTag"];
		this.oldSubSkinTag = o["oldSubSkinTag"];
		this.syncWithAnim = o["syncWithAnim"];
		this.syncWithFrame = o["syncWithFrame"];
		this.default = o["default"];
		this.hideDefault = o["hideDefault"];
		this.imagePoint = o["imagePoint"];
		this.syncZOrder = o["syncZOrder"];
		this.firstFrame = o["firstFrame"];
		this.skinBaseTag = o["skinBaseTag"];
		this.behaviorId = o["behaviorId"];
		this.syncSize = o["syncSize"];
		this.syncScale = o["syncScale"];

		/* if (o["object"] === "null"){
			this.object = null
		}
		else{

		} */
	};

	behinstProto.tick = function ()
	{
		if(this.firstFrame){
			if(this.syncWithAnim){
				this.subSkinTag = this.inst.cur_animation.name;
				this.oldsubSkinTag = this.inst.cur_animation.name;
			}
			this.firstFrame = false;
		}

		// Behavior doesn't work well with global objects. This code attempted to fix it but it ended up making more stuff broken.
		/* if (this.object != null && this.lastLayout !== this.runtime.running_layout) {
			this.lastLayout = this.runtime.running_layout
			this.runtime.DestroyInstance(this.object)
			this.object = this.inst.runtime.createInstance(this.object.type, this.inst.layer)
			this.updateSkin()
		}
		if (this.lastLayout !== this.runtime.running_layout) {
			this.lastLayout = this.runtime.running_layout
		} */ 
		//Code is set in tick2 to fix pin lag
	}

	behinstProto.tick2 = function ()
	{
		if(this.object == null) return;
		
		var newx = this.inst.getImagePoint(this.imagePoint, true);
		var newy = this.inst.getImagePoint(this.imagePoint, false);
		var angle = this.inst.angle;

		var anim = this.inst.cur_animation.name;
		

		if (this.syncSize || this.syncScale) {

			if (this.object.width != this.inst.width * this.widthRatio) {
				this.object.width = this.inst.width * this.widthRatio
			}

			if (this.object.height != this.inst.height * this.heightRatio) {
				this.object.height = this.inst.height * this.heightRatio
			}
		} else {
			var mirrorred = (this.inst.width < 0);
			var selfMirrorred = (this.object.width < 0);
			var flipped = (this.inst.height < 0);
			var selfFlipped = (this.object.height < 0);

			if(mirrorred != selfMirrorred){
				this.object.width = cr.abs(this.object.width) * (mirrorred ? -1 : 1);
			}
	
			if(flipped != selfFlipped){
				this.object.height = cr.abs(this.object.height) * (flipped? -1 : 1);
			}
		}


		

		var other = this.inst;
		if (this.behaviorId != 0) {
			var i = this.behaviorId - 1;
			while (i >= 0 && this.inst.behaviorSkins[i].object == null) {
				i--;
			}
			if (i >= 0) {
				other = this.inst.behaviorSkins[i].object;
			}
		}

		if (this.syncZOrder && this.object.get_zindex() !== other.get_zindex() + 1) {
			this.setZorder();
		}

		if(this.object.x != newx){
			this.object.x = newx;
		}

		if(this.object.y != newy){
			this.object.y = newy;
		}

		if(this.object.angle != angle){
			this.object.angle = angle;
		}

		this.object.set_bbox_changed();

		if(this.syncWithAnim && this.subSkinTag != anim){
			this.subSkinTag = anim;
		}

		if(this.syncWithFrame && this.inst.cur_frame != this.object.cur_frame){
			cr.plugins_.Sprite.prototype.acts.SetAnimFrame.call(this.object, this.inst.cur_frame);
		}

		if(this.skinTag != this.oldSkinTag || this.subSkinTag != this.oldSubSkinTag){
			this.oldSkinTag = this.skinTag;
			this.oldSubSkinTag = this.subSkinTag;
			this.updateSkin();
		}
	};

	behinstProto.updateSkin = function()
	{
		if(this.default){
			if(this.object != null){
				this.destroy();
			}
			if(this.hideDefault && !this.inst.visible){
				this.inst.visible = true;
				this.runtime.redraw = true;
			}
			return;
		}
		else{
			if(this.hideDefault && this.inst.visible){
				this.inst.visible = false;
				this.runtime.redraw = true;
			}
		}

		if(this.object == null){
			if(this.inst && this.inst.cur_animation){
				var anim = this.inst.cur_animation.name;
				if (this.syncWithAnim && this.subSkinTag != anim) {
					this.subSkinTag = anim;
				}
			}
			var type = this.getType(this.skinTag, this.subSkinTag);
			if(type == null){
				console.warn("Cannot assign subskin " + this.subSkinTag + " of skin " + this.skinTag + " because it doesn't exist. Reverting back to default.");
				this.default = true;
				this.updateSkin();
				return
			}
			if(this.syncWithAnim){
				this.subSkinTag = this.inst.cur_animation.name;
			}
			this.object = this.inst.runtime.createInstance(type, this.inst.layer)
			var anim = this.getAnim(this.skinTag, this.subSkinTag);
			cr.plugins_.Sprite.prototype.acts.SetAnim.call(this.object, anim, 0);
			if(this.syncWithFrame){
				cr.plugins_.Sprite.prototype.acts.SetAnimSpeed.call(this.object, 0);
			}
			this.setZorder();
			cr.plugins_.Sprite.prototype.acts.SetCollisions.call(this.object, 0);
			if (this.syncScale) {
				let defaultAnim = this.object.type.animations.find(x => x.name === this.object.type.default_instance[5][4])
				defaultAnim = defaultAnim || this.object.type.animations[0];
				this.widthRatio = this.inst.width / Math.abs(this.inst.width) 						//Sign in case object is mirrorred
					* this.object.type.default_instance[0][3] / defaultAnim.frames[0].width //Ratio of image size to default size
					* this.object.cur_animation.frames[0].width / this.inst.width; 					//Ratio of frame size to object size
				this.heightRatio = this.inst.height / Math.abs(this.inst.height)
					* this.object.type.default_instance[0][4] / defaultAnim.frames[0].height
					* this.object.cur_animation.frames[0].height / this.inst.height;
			} else if (this.syncSize) {
				this.widthRatio = 1;
				this.heightRatio = 1;
				this.object.width = this.inst.width;
				this.object.height = this.inst.height;
			}
		}
		else{
			if(this.object.type == this.getType(this.skinTag, this.subSkinTag)){
				if(this.syncWithAnim){
					this.subSkinTag = this.inst.cur_animation.name;
				}
				anim = this.getAnim(this.skinTag, this.subSkinTag);
				cr.plugins_.Sprite.prototype.acts.SetAnim.call(this.object, anim, 0);
				if(this.syncWithFrame){
					cr.plugins_.Sprite.prototype.acts.SetAnimSpeed.call(this.object, 0);
				}
				if(this.syncZOrder) this.setZorder();
				cr.plugins_.Sprite.prototype.acts.SetCollisions.call(this.object, 0);

			}
			else{
				this.destroy();
				this.updateSkin();
				return
			}
		}
	};

	behinstProto.destroy = function () {
		if(this.object === null)return;
		if(this.object.behaviorSkins){
			for (var i = 0; i < this.object.behaviorSkins.length; i++) {
				this.object.behaviorSkins[i].destroy();
			}
		}
		this.runtime.DestroyInstance(this.object);
		this.object = null;

	}
	behinstProto.setZorder = function () {
		var other = this.inst;
		if(this.behaviorId != 0){
			var i = this.behaviorId-1;
			while(i >= 0 && this.inst.behaviorSkins[i].object == null){
				i--;
			}
			if(i >= 0){
				other = this.inst.behaviorSkins[i].object;
			}
		}
		
		// First move to same layer as other object if different
		if (this.object.layer.index !== other.layer.index)
		{
			this.object.layer.removeFromInstanceList(this.object, true);
			
			this.object.layer = other.layer;
			other.layer.appendToInstanceList(this.object, true);
		}
		this.object.layer.moveInstanceAdjacent(this.object, other, true);				
		this.runtime.redraw = true;
	}

	behinstProto.getType = function (skin, subSkin) 
	{
		if(this.skinBase.skins[skin] == undefined || this.skinBase.skins[skin][subSkin] == undefined){
			return null;
		}
		return this.skinBase.skins[skin][subSkin].type;
	}

	behinstProto.getAnim = function (skin, subSkin) 
	{
		if(this.skinBase.skins[skin] == undefined || this.skinBase.skins[skin][subSkin] == undefined){
			return null;
		}
		return this.skinBase.skins[skin][subSkin].anim;
	}

	//////////////////////////////////////
	// Conditions
	function Cnds() {};

	// the example condition
	Cnds.prototype.IsDefault = function ()
	{
		return this.default;
	};

	Cnds.prototype.IsSkin = function (skin)
	{
		return this.skinTag == skin;
	};

	Cnds.prototype.IsSubSkin = function (subSkin)
	{
		return this.subSkinTag == subSkin;
	};

	Cnds.prototype.IsDefaultHidden = function ()
	{
		return this.hideDefault;
	};
	
	// ... other conditions here ...
	
	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};

	// the example action
	Acts.prototype.SetSkin = function (skin)
	{
		if(this.default){
			this.default = false;
		}
		this.skinTag = skin;
		this.updateSkin();
	};

	Acts.prototype.SetSubSkin = function (subSkin)
	{
		this.subSkinTag = subSkin;
		this.updateSkin();
	};

	Acts.prototype.Setup = function (skin, subSkin)
	{
		this.default = false;
		this.skinTag = skin;
		this.subSkinTag = subSkin;
		this.updateSkin();
	};

	Acts.prototype.UseDefault = function ()
	{
		this.default = true;
		this.updateSkin();
	};

	Acts.prototype.HideDefault = function (hide)
	{
		this.hideDefault = hide === 1; //0 = No, 1 = Yes
		this.updateSkin();
	};
	
	Acts.prototype.SetImagePoint = function (ip)
	{
		this.imagePoint = ip;
	};

	Acts.prototype.SyncMode = function (mode) {
		this.syncWithAnim = mode === 0 || mode === 2;
		this.syncWithFrame = mode === 1 || mode === 2;
		if (this.syncWithAnim) {
			this.subSkinTag = this.inst.cur_animation.name;
		}
	};

	Acts.prototype.SyncZOrder = function (mode) {
		this.syncZOrder = mode === 0;
	};

	Acts.prototype.UpdateZOrder = function () {
		if(this.object){
			this.setZorder();
		}
		
	};

	// ... other actions here ...
	
	behaviorProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};

	// the example expression
	Exps.prototype.Skin = function (ret)
	{
		ret.set_string(this.skinTag);
	};

	Exps.prototype.SubSkin = function (ret)
	{
		ret.set_string(this.subSkinTag);
	};

	Exps.prototype.SkinBaseTag = function (ret)
	{
		ret.set_string(this.skinBaseTag);
	};
	
	// ... other expressions here ...
	
	behaviorProto.exps = new Exps();
	
}());