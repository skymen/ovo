// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.aekiro_sliderbar = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.aekiro_sliderbar.prototype;
		
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

		if(!this.behavior.isHooked){
			cr.proui.HookMe(this.behavior,["touch"]);
			this.behavior.isHooked = true;
		}
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
		this.proui = cr.proui;
		this.proui.isTypeValid(this.inst,[cr.plugins_.Sprite,cr.plugins_.NinePatch],"Pro UI: SliderBar behavior is only applicable to Sprite Or 9-patch objects.");
		//properties
		this.isEnabled = this.properties[0];
		this.value  = this.properties[1];
		this.sliderButtonUID = this.properties[2];
		this.minValue = this.properties[3];
		this.maxValue = this.properties[4];
		this.step  = this.properties[5];
		//*********************************
		this.firstFrame = true;
		this.inst.uiType = "sliderbar";
		this.uiType = "sliderbar";
		this.inst._proui = this;
		this.firstSetValue = false;
		this.compParent = this;
		this.isInit = false;
		this.dpos = {};
		//*********************************

		this.onSliderTouchStarted = false;
		this.onValueChanged = false;
		this.value  = this.validateValue(this.value); //needs to be after step

		//*********************************

	};




	behinstProto.getTemplate = function (){
		//this.sliderButton = this.runtime.getObjectByUID(this.sliderButtonUID);
		this.sliderButton = this.proui.tags[this.sliderButtonUID];
		if(!this.sliderButton){
			console.error("SLIDERBAR %d : Slider button not found",this.inst.uid);
			return;
		}

		var template = {
			sliderTag:this.sliderButtonUID,
			type: this.sliderButton.type,
			json: JSON.stringify(this.runtime.saveInstanceToJSON(this.sliderButton, true))
		};
		
		return template;
	};


	behinstProto.clone = function (template){
		if(!template){
			//console.error("SLIDERBAR %d : Slider button not found",this.inst.uid);
			return;
		}
		var sliderButton = this.runtime.createInstance(template.type, this.inst.layer);
		sliderButton.type.plugin.acts.LoadFromJsonString.call(sliderButton,template.json);
		
		var sliderTag = template.sliderTag + this.proui.getIter();
		sliderButton.aekiro_tag.tag = sliderTag;

		var prevRegister = this.runtime.extra.notRegister;
		this.runtime.extra.notRegister = false;
		
		this.proui.addTag(sliderTag,sliderButton);
		this.runtime.extra.notRegister = prevRegister;


		this.sliderButtonUID = sliderTag;
		this.init();
	};



	behinstProto.setValue = function (value){
		this.firstSetValue = true;
		if(this._setValue(value)){
			var modelB = this.inst.proui_model;
			if(modelB){
				modelB.setModelValue(value,{except:this.compParent});	
			}

			if(this.inst.proui_bind){
				this.inst.proui_bind.updateGridViewModel(value,{except:this.compParent});
			}
		}
	};



	behinstProto.validateValue = function (value){
		value = this.proui.validateSimpleValue(value,0);
		value = Math.round(value/this.step)*this.step;
		value = cr.clamp(value,this.minValue,this.maxValue);
		//console.log(value);
		return value;
	};


	behinstProto._setValue = function (value){
		//console.log("%c SLIDERBAR %d : Set value to %d","color:blue", this.inst.uid, value);

		if(value == null){
			return false;
		}
		value = this.validateValue(value);
		
		//if(this.value!=value){
			this.value = value;
			this.updateView();
			return true;
		/*}else{
			return false;
		}*/
	};


	behinstProto.updateFromModel = function (){
		var modelB = this.inst.proui_model;
		if(modelB){
			var value = modelB.getFromModel();
			if(value == null){
				return;
			}

			value = this.validateValue(value);
			this.value = value;
			//console.log("%cCHECKBOX %d : updateFromModel to %d","color:blue", this.inst.uid, value);
		}
	};


	behinstProto.OnAnyTouchStart = function ()
	{
		if(this.sliderButton && this.isInTouch(this.sliderButton) && this.isEnabled){
			this.OnSliderTouchStart();
			this.onSliderTouchStarted = true;
			this.onValueChanged = true;
		}
	};
	
	behinstProto.OnTouchStart = function (){
		if( (this.sliderButton && this.isInTouch(this.sliderButton)) || !this.isEnabled){
			return;
		}
		this.onX(this.proui.X(this.inst.layer.index));
		this.onValueChanged = true;
	};

	behinstProto.OnSliderTouchStart = function (){

	};


	behinstProto.OnAnyTouchEnd = function (touchX, touchY)
	{
		if(this.onSliderTouchStarted){
			this.OnTouchEnd(touchX, touchY);
		}
		this.onSliderTouchStarted = false;
		this.onValueChanged = false;
	};


	behinstProto.OnTouchEnd = function (touchX, touchY){
		this.setValue(this.value);
	};


	behinstProto.updateView = function (){
		if(!this.isInit){
			return;
		}

		this.inst.update_bbox();
		this.sliderButton.x = cr.clamp(this.inst.bbox.left+((this.value-this.minValue)/this.step)*this.widthStep,this.inst.bbox.left,this.inst.bbox.right);
		this.sliderButton.y = (this.inst.bbox.bottom+this.inst.bbox.top)/2;
		this.sliderButton.set_bbox_changed();

		this.lastStop = this.sliderButton.x;
	};


	behinstProto.setEnabled = function (isEnabled)
	{
		this.isEnabled = isEnabled;
	}

	behinstProto.init = function (){
		if(this.isInit){
			return;
		}

		//this.sliderButton = this.runtime.getObjectByUID(this.sliderButtonUID);
		this.sliderButton = this.proui.tags[this.sliderButtonUID];

		if(!this.sliderButton){
			console.error("SLIDERBAR %d : Slider button not found",this.inst.uid);
			return;
		}

		this.sliderButton.uiType = "sliderbutton";
		//placing the sliderbutton at the left-center of the bar
		this.inst.update_bbox();
		this.sliderButton.x = this.inst.bbox.left;
		this.sliderButton.y = (this.inst.bbox.bottom+this.inst.bbox.top)/2;
		this.sliderButton.set_bbox_changed();	
		this.sliderButton.isSubComp = true;

		this.widthStep = (this.step/(this.maxValue-this.minValue))* this.inst.width;
		this.thres = this.step/(this.maxValue-this.minValue);
		this.lastStop = this.inst.bbox.left;

		//**********************
		this.dpos.prev_x = this.inst.x;
		this.dpos.prev_y = this.inst.y;
		this.dpos.dx = 0;
		this.dpos.dy = 0;
		//**********************
		this.isInit = true;

	};


	behinstProto.onX = function (touchX){
		this.inst.update_bbox();
		var diff = touchX-this.lastStop;
		if(this.thres>0.04){
			if(this.sign(diff)>0 && (this.maxValue-this.value < this.step) ){
				//console.log("azaz");
				return;
			}
			if( (Math.abs(diff) > this.widthStep*2/3)){
				this.lastStop = this.lastStop + this.sign(diff)*this.widthStep;
				this.sliderButton.x = cr.clamp(this.lastStop,this.inst.bbox.left,this.inst.bbox.right);
				this.sliderButton.set_bbox_changed();
				this.value = this.value + this.sign(diff)*this.step;
				this.value = cr.clamp(this.value,this.minValue,this.maxValue);
			}				
		}else{
			this.sliderButton.x = cr.clamp(touchX,this.inst.bbox.left,this.inst.bbox.right);
			this.sliderButton.set_bbox_changed();
			this.value = ((this.sliderButton.x-this.inst.bbox.left)/this.inst.width)*(this.maxValue-this.minValue);
			this.value = this.minValue+Math.round(this.value/this.step)*this.step;
			this.value = cr.clamp(this.value,this.minValue,this.maxValue);
			//console.log(this.value);

		}
	};


	//*********Helpers
	behinstProto.isInTouch = function (inst)
	{
		var touch_x = this.proui.X(this.inst.layer.index);
		var touch_y = this.proui.Y(this.inst.layer.index);
		//console.log(touch_x+"**"+touch_y);
		inst.update_bbox();
		return inst.contains_pt(touch_x, touch_y);
	};

	behinstProto.sign = function(value_){
        if (isNaN(parseFloat(value_))) return NaN;

        if (value_ === 0) return 0;

        if (value_ === -0) return -0;

        return value_ > 0 ? 1 : -1;
    };

	//***************************



	behinstProto.tick = function ()
	{
		if(this.firstFrame){
			this.firstFrame = false;
			this.init();
			//***************************************
			if(!this.firstSetValue){
				this.updateFromModel();
			}
			this.updateView();
		}

		if(this.onSliderTouchStarted){
			this.onX(this.proui.X(this.inst.layer.index)); 
		}

	};


	behinstProto.updateChildren = function ()
	{
		if(!this.sliderButton){
			return;
		}

		if(isNaN(this.dpos.prev_x)){
			this.dpos.prev_x = this.inst.x;
			this.dpos.prev_y = this.inst.y;
		}

		this.dpos.dx = this.inst.x - this.dpos.prev_x;
		this.dpos.dy = this.inst.y - this.dpos.prev_y;
		this.dpos.prev_x = this.inst.x;
		this.dpos.prev_y = this.inst.y;

		var inst = this.sliderButton;
		if( (this.dpos.dx != 0) || (this.dpos.dy != 0) ){
			inst.x += this.dpos.dx;
			inst.y += this.dpos.dy;
			inst.set_bbox_changed();
		}
	};


	behinstProto.tick2 = function ()
	{
		this.updateChildren();
	};




	behinstProto.onDestroy = function ()
	{
		//On layout change, instances are destroyed by the engine, so no point to delete them manually
		if(this.runtime.changelayout){
			return;
		}

		this.proui.toBeDestroyed.push(this.sliderButton);

		var proui = this.proui;
		setTimeout(function(){ proui.clearDestroyList(); }, 0);
	};
	
	// called when saving the full state of the game
	behinstProto.saveToJSON = function ()
	{
		return {
			"isEnabled" : this.isEnabled,
			"value": this.value,
			"minValue": this.minValue,
			"maxValue": this.maxValue,
			"step": this.step
		};
	};
	
	// called when loading the full state of the game
	behinstProto.loadFromJSON = function (o)
	{
		this.isEnabled = o["isEnabled"];
		this.value  = o["value"];
		this.minValue = o["minValue"];
		this.maxValue = o["maxValue"];
		this.step  = o["step"];
	};

	
	// The comments around these functions ensure they are removed when exporting, since the
	// debugger code is no longer relevant after publishing.
	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function (propsections)
	{
		propsections.push({
			"title": this.type.name,
			"properties": [
				{"name": "value", "value": this.value}
			]
		});
	};
	
	behinstProto.onDebugValueEdited = function (header, name, value)
	{
		if (name === "My property")
			this.myProperty = value;
	};
	/**END-PREVIEWONLY**/

	//http://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key
	var getValueByKeyString = function(o, s) {
	    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
	    s = s.replace(/^\./, '');           // strip a leading dot
	    var a = s.split('.');
	    for (var i = 0, n = a.length; i < n; ++i) {
	        var k = a[i];
	        if (k in o) {
	            o = o[k];
	        } else {
	            return;
	        }
	    }
	    return o;
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	
	behaviorProto.cnds = new Cnds();

	Cnds.prototype.IsSliding = function (){
		return this.onValueChanged;
	};

	//////////////////////////////////////
	// Actions
	function Acts() {};
	
	Acts.prototype.setValue = function (value){
		this.setValue(value);
	};
	behaviorProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	
	Exps.prototype.value = function (ret)
	{
		ret.set_float(this.value);
	};

	behaviorProto.exps = new Exps();
	
}());