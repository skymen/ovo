// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.aekiro_modelB = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.aekiro_modelB.prototype;
		
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

		//properties
		this.modelUID = this.properties[0];
		this.modelKey = this.properties[1];

		//*********************************
		this.model = this.proui.tags[this.modelUID];
		this.model = (!!this.model && this.model.uiType == "model")?this.model:null;
		//*********************************
		this.firstFrame = true;
		this.inst.proui_model = this;
		//this.inst._proui = this;
		//this.compParent = this;
		//*********************************

		//*********************************
		if(this.model && this.modelKey){
			this.model.registerBehavior(this);
		}

		//*********************************
	};
	


	behinstProto.setModelValue = function (value,options){
		if(this.model && this.modelKey){
			//Updating the model to which this component is linked
			cr.plugins_.aekiro_model.prototype.acts.SetValueByKeyString.call(this.model,this.modelKey,value,options);
		}
	};

	behinstProto.setElementValue = function (value,options){
		var inst = this.inst;
		if(inst._proui && inst._proui._setValue){
			inst._proui._setValue(value,options);
		}
	};


	//used in updateFromModel 
	behinstProto.getFromModel = function (){
		var value = null;
		if(this.model && this.modelKey){
			value = this.model.getValue(this.modelKey);
		}
		return value;
	};




	//*********Helpers

	//************************


	behinstProto.tick = function ()
	{
		/*if(this.firstFrame){
			this.firstFrame = false;
			
		}*/
	};



	behinstProto.onDestroy = function ()
	{
		if(this.model){
			this.model.unregisterBehavior(this);
		}
		
		//***************************
		this.modelUID = 0;
		this.modelKey = "";
		this.model = null;
	};
	
	// called when saving the full state of the game
	behinstProto.saveToJSON = function ()
	{
	};
	
	// called when loading the full state of the game
	behinstProto.loadFromJSON = function (o)
	{

	};

	
	// The comments around these functions ensure they are removed when exporting, since the
	// debugger code is no longer relevant after publishing.
	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function (propsections)
	{
		propsections.push({
			"title": this.type.name,
			"properties": []
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

	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};
	
	Acts.prototype.Reset = function ()
	{
		if(this.model){
			this.model.unregisterBehavior(this);
		}

		this.modelUID = "";
		this.modelKey = "";
		this.model = null;
	};
	behaviorProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};

	behaviorProto.exps = new Exps();
	
}());