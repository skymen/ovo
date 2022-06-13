// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.aekiro_bind = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.aekiro_bind.prototype;
		
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
		this.inst = inst;
		this.runtime = type.runtime;

		if(!cr.proui){
			throw new Error("ProUI Plugin not found. Please add it to the project.");
			return;
		}
	};
	
	var behinstProto = behaviorProto.Instance.prototype;


	behinstProto.onCreate = function()
	{
		this.proui = cr.proui;
		//this.proui.isTypeValid(this.inst,[cr.plugins_.Text,cr.plugins_.Spritefont2],"Pro UI: Label behavior is only applicable to Text Or Spritefont objects.");
		this.isInstanceOfText = cr.plugins_.Text ? (this.inst.type.plugin instanceof cr.plugins_.Text) : false;
		this.isInstanceOfSpriteFont = cr.plugins_.Spritefont2 ? (this.inst.type.plugin instanceof cr.plugins_.Spritefont2) : false;
		this.isInstanceOfSpriteFontPlus = cr.plugins_.SkymenSFPlusPLus ? (this.inst.type.plugin instanceof cr.plugins_.SkymenSFPlusPLus) : false;
		this.isInstanceOfSprite = cr.plugins_.Sprite?(this.inst.type.plugin instanceof cr.plugins_.Sprite):false;
		this.isInstanceOfPaster = cr.plugins_.rojoPaster?(this.inst.type.plugin instanceof cr.plugins_.rojoPaster):false;
		
		//properties
		this.bind_key = this.properties[0];
		this.bind_property = this.properties[1];
		//*********************************
		this.firstFrame = true;
		this.inst.proui_bind = this;
		this.index = -1 ; //index of the item this sub-item belong to
		this.deepKey = "";
		this.model = null;

		//*********************************

	};
	

	behinstProto.updateGridViewModel = function (value,options){
		if(this.model && this.deepKey){
			console.log(this.deepKey+"***"+value);
			cr.plugins_.aekiro_model.prototype.acts.SetValueByKeyString.call(this.model,this.deepKey,value,options);	
		}
		
	};


	behinstProto.setValue = function (value){
		//console.log("%cLABEL %d : Set value to %s","color:blue", this.inst.uid, value);
		
		if(!this.bind_key){
			return;
		}
		
		//console.log(this.bind_key+"***"+this.bind_property+"***"+value);
		if(this.bind_property==0 && this.inst._proui && this.inst._proui._setValue){//Value
			this.inst._proui._setValue(value);
		}else if(this.bind_property==1 && (this.isInstanceOfText || this.isInstanceOfSpriteFont || this.isInstanceOfSpriteFontPlus) ){ //Text
			this.inst.type.plugin.acts.SetText.call(this.inst,value);
			
		}else if(this.bind_property==2 && this.isInstanceOfSprite){//Frame
			var frame = 0;
			if (!isNaN(value)){
				frame = parseInt(value);
			}
			this.inst.type.plugin.acts.SetAnimFrame.apply(this.inst, [frame]);
		}else if(this.bind_property==3 && this.isInstanceOfSprite){//Animation
			var anim = String(value);
			this.inst.type.plugin.acts.SetAnim.apply(this.inst, [anim]);
		}else if(this.bind_property==4 && (this.isInstanceOfSprite || this.isInstanceOfPaster) ){//URL
			this.inst.type.plugin.acts.LoadImage.call(this.inst,value, 1);
		}
	};



	//*********Helpers

	//************************


	behinstProto.tick = function ()
	{

	};

	behinstProto.onDestroy = function ()
	{
	};
	

	// called when saving the full state of the game
	behinstProto.saveToJSON = function ()
	{
		return {
			"bind_key" : this.bind_key,
			"bind_property" : this.bind_property
		}
	};
	
	// called when loading the full state of the game
	behinstProto.loadFromJSON = function (o)
	{
		this.bind_key = o["bind_key"];
		this.bind_property = o["bind_property"];

	};

	
	// The comments around these functions ensure they are removed when exporting, since the
	// debugger code is no longer relevant after publishing.
	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function (propsections)
	{
		propsections.push({
			"title": this.type.name,
			"properties": [
				{"name": "index", "value": this.index}
			]
		});
	};
	
	behinstProto.onDebugValueEdited = function (header, name, value)
	{
		// Called when a non-readonly property has been edited in the debugger. Usually you only
		// will need 'name' (the property name) and 'value', but you can also use 'header' (the
		// header title for the section) to distinguish properties with the same name.
		if (name === "My property")
			this.myProperty = value;
	};
	/**END-PREVIEWONLY**/

	//////////////////////////////////////
	// Conditions
	function Cnds() {};

	Cnds.prototype.IsIndex = function (index){
		return (index == this.index);
	};

	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};
	

	behaviorProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};

	Exps.prototype.index = function (ret)
	{
		ret.set_int(this.index);
	};

	behaviorProto.exps = new Exps();
	
}());