// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.aekiro_checkbox = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.aekiro_checkbox.prototype;
		
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
		}

		if(!this.behavior.isHooked){
			cr.proui.HookMe(this.behavior,["touch"]);
			this.behavior.isHooked = true;
		}
	};
	
	var behinstProto = behaviorProto.Instance.prototype;


	var NORMAL = 0, HOVER = 1, CLICKED = 2;

	behinstProto.onCreate = function()
	{
		this.proui = cr.proui;
		this.proui.isTypeValid(this.inst,[cr.plugins_.Sprite],"Pro UI: Checkbox behavior is only applicable to Sprite objects.");
		//properties
		this.isEnabled = this.properties[0];
		this.value  = this.properties[1];
		this.frames_normal = this.properties[2];
		this.frames_hover = this.properties[3];
		this.frames_disabled = this.properties[4];
		this.clickSound = this.properties[5];
		this.clickAnimation = this.properties[6];
		this.hoverSound = this.properties[7];
		this.hoverAnimation = this.properties[8];
		this.callbackName = this.properties[9];
		this.callbackParams = this.properties[10];
		//*********************************
		this.firstFrame = true;
		this.uiType = "checkbox";
		this.inst.uiType = "checkbox";
		this.inst._proui = this;
		this.firstSetValue = false;
		//*********************************
		this.state = NORMAL;
		this.onTouchStarted = false;
		this.onMouseEnterFlag = false;
		/*If this elements is part of a composed ui element like a gridview, then upon creation of this element, the parent (gridview) will set this value to itself, 
		and it is passed in options.except (cf behinstProto.setValue ) to notifyBehaviorModels of themodel so that it wont notify the gridview
		*/
		this.compParent = this;
		//*********************************

		//*********************************
		this.onCreateInit();
	};
	
	behinstProto.onCreateInit = function (){
		this.setFrames();
		this.setClickAnimations();
		this.setHoverAnimations();
	};

	behinstProto.setFrames = function (){
		var normalFrames = this.frames_normal.split(',');
		this.frame_normal_uncheck = isNaN(parseInt(normalFrames[0]))?-1:parseInt(normalFrames[0]);
		this.frame_normal_check = isNaN(parseInt(normalFrames[1]))?-1:parseInt(normalFrames[1]);

		var hoverFrames = this.frames_hover.split(',');
		this.frame_hover_uncheck = isNaN(parseInt(hoverFrames[0]))?-1:parseInt(hoverFrames[0]);
		this.frame_hover_check = isNaN(parseInt(hoverFrames[1]))?-1:parseInt(hoverFrames[1]);
		var disabledFrames = this.frames_disabled.split(',');
		this.frame_disabled_uncheck = isNaN(parseInt(disabledFrames[0]))?-1:parseInt(disabledFrames[0]);
		this.frame_disabled_check = isNaN(parseInt(disabledFrames[1]))?-1:parseInt(disabledFrames[1]);
	};


	behinstProto.setClickAnimations = function (){
		//None|Scale Quadratic|Scale Elastic|Down|Up|Left|Right
		this.tween = new TWEEN["Tween"](this.inst);
		if(this.clickAnimation == 1){
			this.tween["easing"](TWEEN["Easing"]["Quadratic"]["Out"])["to"]({ width: this.inst.width*1.2, height:this.inst.height*1.2 }, 200);
		}else if(this.clickAnimation == 2){
			this.tween["easing"](TWEEN["Easing"]["Elastic"]["Out"])["to"]({ width: this.inst.width*1.2, height:this.inst.height*1.2 }, 500);
		}else if(this.clickAnimation == 3){
			this.tween["easing"](TWEEN["Easing"]["Quadratic"]["Out"])["to"]({ y:this.inst.y+this.inst.height/10 }, 100);
		}else if(this.clickAnimation == 4){
			this.tween["easing"](TWEEN["Easing"]["Quadratic"]["Out"])["to"]({ y:this.inst.y-this.inst.height/10 }, 100);
		}else if(this.clickAnimation == 5){
			this.tween["easing"](TWEEN["Easing"]["Quadratic"]["Out"])["to"]({ x:this.inst.x-this.inst.width/10 }, 100);
		}else if(this.clickAnimation == 6){
			this.tween["easing"](TWEEN["Easing"]["Quadratic"]["Out"])["to"]({ x:this.inst.x+this.inst.width/10 }, 100);
		}
	};

	behinstProto.setHoverAnimations = function (){
		//None|Scale Quadratic|Scale Elastic|Down|Up|Left|Right
		this.tween_hover = new TWEEN["Tween"](this.inst);
		if(this.hoverAnimation == 1){
			this.tween_hover["easing"](TWEEN["Easing"]["Quadratic"]["Out"])["to"]({ width: this.inst.width*1.1, height:this.inst.height*1.1 }, 200);
		}else if(this.hoverAnimation == 2){
			this.tween_hover["easing"](TWEEN["Easing"]["Elastic"]["Out"])["to"]({ width: this.inst.width*1.1, height:this.inst.height*1.1 }, 500);
		}else if(this.hoverAnimation == 3){
			this.tween_hover["easing"](TWEEN["Easing"]["Quadratic"]["Out"])["to"]({ y:this.inst.y+this.inst.height/10 }, 100);
		}else if(this.hoverAnimation == 4){
			this.tween_hover["easing"](TWEEN["Easing"]["Quadratic"]["Out"])["to"]({ y:this.inst.y-this.inst.height/10 }, 100);
		}else if(this.hoverAnimation == 5){//Left
			this.tween_hover["easing"](TWEEN["Easing"]["Quadratic"]["Out"])["to"]({ x:this.inst.x-this.inst.width/13 }, 100);
		}else if(this.hoverAnimation == 6){//Right
			this.tween_hover["easing"](TWEEN["Easing"]["Quadratic"]["Out"])["to"]({ x:this.inst.x+this.inst.width/13 }, 100);
		}
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


	behinstProto._setValue = function (value){
		//console.log("%cProUI-Checkbox uid=%s : Set value to %d","color:blue", this.inst.uid, value);
		if(value == null){
			return false;
		}

		value = this.proui.validateSimpleValue(value,0);
		value = cr.clamp(value,0,1);
		if(this.value!=value){
			this.value = value;
			this.updateView();
			return true;
		}else{
			return false;
		}
	};



	behinstProto.updateFromModel = function (){
		//console.log("%cProUI-Checkbox uid=%s : updateFromModel to %d","color:blue", this.inst.uid, value);
		var modelB = this.inst.proui_model;
		if(modelB){
			var value = modelB.getFromModel();
			if(value == null){
				return;
			}
			
			value = this.proui.validateSimpleValue(value,0);
			value = cr.clamp(value,0,1);
			if(this.value!=value){
				this.value = value;
			}
		}
	};


	behinstProto.updateView = function (){
		//console.log("%cProUI-Checkbox uid=%s : update view","color:blue", this.inst.uid);
		if(this.value){
			cr.plugins_.Sprite.prototype.acts.SetAnimFrame.apply(this.inst, [this.frame_normal_check]);
			if(this.isEnabled){
				if(this.state == HOVER && this.frame_hover_check>=0){
					cr.plugins_.Sprite.prototype.acts.SetAnimFrame.apply(this.inst, [this.frame_hover_check]);
				}
			}else{
				if(this.frame_disabled_check>=0)
					cr.plugins_.Sprite.prototype.acts.SetAnimFrame.apply(this.inst, [this.frame_disabled_check]);
			}
			
		}else{
			cr.plugins_.Sprite.prototype.acts.SetAnimFrame.apply(this.inst, [this.frame_normal_uncheck]);
			if(this.isEnabled){	
				if(this.state == HOVER && this.frame_hover_uncheck>=0){
					cr.plugins_.Sprite.prototype.acts.SetAnimFrame.apply(this.inst, [this.frame_hover_uncheck]);
				}
			}else{
				if(this.frame_disabled_uncheck>=0)
					cr.plugins_.Sprite.prototype.acts.SetAnimFrame.apply(this.inst, [this.frame_disabled_uncheck]);
			}
		}
	};


	behinstProto.setEnabled = function (isEnabled)
	{
		this.isEnabled = isEnabled;
		this.updateView();
	}


	behinstProto.OnTouchStart = function ()
	{
		if(!this.isClickable() || !this.isInsideScrollView() || this.onTouchStarted)return;


		//Make it so buttons can't be clicked if the scrollview is scrolling
		var scrollView = this.proui.scrollViews["l"+this.inst.layer.index];
		if(scrollView && Math.sqrt(Math.pow(scrollView.scroll.dx, 2) + Math.pow(scrollView.scroll.dy, 2)) > 5) return;


		this.onTouchStarted = true;

		//Change the view and model of the checkbox;
		//this.setValue(1-this.value);


		//Play the onclick Animation
		if(this.state != CLICKED && this.clickAnimation>0){
			this.tween["start"]();
		}

		this.state = CLICKED;

		//Play Sound
		if(this.clickSound){
			this.proui.playAudio(this.clickSound);
		}
		
	};


	behinstProto.OnAnyTouchEnd = function (touchX, touchY)
	{
		if(this.onTouchStarted){
			this.OnTouchEnd(touchX, touchY);
		}
		this.onTouchStarted = false;
	};

	
	behinstProto.OnTouchEnd = function (touchX, touchY)
	{
		this.inst.update_bbox();
		if(this.inst.contains_pt(touchX,touchY)){
			if(this.runtime.isMobile){
				this.state = NORMAL;
			}else{
				this.state = HOVER;
			}
			
			//this is moved here instead of .OnTouchStart() because it gets called on a scrolling scrollview
			this.setValue(1-this.value);

			this.updateView();

			this.proui.runCallback(this.callbackName,this.callbackParams);

			this.runtime.trigger(cr.behaviors.aekiro_checkbox.prototype.cnds.OnClicked, this.inst);
		}else{
			this.state = NORMAL;
			this.updateView();
		}

		if(this.clickAnimation>0){
			this.tween["reverse"]();
		}

	};

	behinstProto.isMouseOver = function ()
	{
		//Make it so buttons can't be clicked if the scrollview is scrolling
		if(this.onTouchStarted){
			var scrollView = this.proui.scrollViews["l"+this.inst.layer.index];
			if(scrollView && Math.sqrt(Math.pow(scrollView.scroll.dx, 2) + Math.pow(scrollView.scroll.dy, 2)) > 5) {
				//console.log("Yep";
				this.onTouchStarted = false;
				this.state = NORMAL;
				this.updateView();
				if(this.clickAnimation>0){
					this.tween["reverse"]();
				}
			};
		}

		var mouse_x = this.proui.CursorX(this.inst.layer.index);
		var mouse_y = this.proui.CursorY(this.inst.layer.index);
		this.inst.update_bbox();  
		return this.inst.contains_pt(mouse_x, mouse_y);
	};

	behinstProto.OnMouseEnter = function ()
	{
		if(!this.isClickable())return;

		this.state = HOVER;
		this.updateView();

		//Play the onhover Animation
		if(this.hoverAnimation>0){
			this.tween_hover["start"]();
		}
		//Play Sound
		if(this.hoverSound){
			this.proui.playAudio(this.hoverSound);
		}

		this.runtime.trigger(cr.behaviors.aekiro_checkbox.prototype.cnds.OnMouseEnter, this.inst);
	};

	behinstProto.OnMouseLeave = function ()
	{
		this.state = NORMAL;
		this.updateView();

		if(this.hoverAnimation>0){
			this.tween_hover["reverse"]();
		}

		this.runtime.trigger(cr.behaviors.aekiro_checkbox.prototype.cnds.OnMouseLeave, this.inst);
	};

	behinstProto.isInTouch = function ()
	{
		var touch_x = this.proui.X(this.inst.layer.index);
		var touch_y = this.proui.Y(this.inst.layer.index);
		this.inst.update_bbox();
		return this.inst.contains_pt(touch_x, touch_y);
	};


	//*********Helpers
	behinstProto.isInsideScrollView = function(){
		var insideScrollView = true;
		var scrollView = this.proui.scrollViews["l"+this.inst.layer.index];
		if(scrollView){
			var touch_x, touch_y;
			if(this.runtime.isMobile){
				touch_x = this.proui.X(this.inst.layer.index);
				touch_y = this.proui.Y(this.inst.layer.index);
			}
			else{
				touch_x = this.proui.CursorX(this.inst.layer.index);
				touch_y = this.proui.CursorY(this.inst.layer.index);
			}

			scrollView.inst.update_bbox();
			insideScrollView = scrollView.inst.contains_pt(touch_x, touch_y);
		}

		return insideScrollView;
	};

	behinstProto.isClickable = function()
	{
		var isVisible = (this.inst.layer.visible && this.inst.visible);
		var isUnder = false;
		for (var i = 0,l=this.proui.currentDialogs.length; i < l; i++) {
			if(this.inst.layer.index<this.proui.currentDialogs[i].inst.layer.index){
				isUnder = true;
				break;
			}
		}
		return isVisible && this.isEnabled && !isUnder;
	};

	
	//************************


	behinstProto.tick = function ()
	{
		if(this.firstFrame){ 
			this.firstFrame = false;
			this.inst.cur_anim_speed = 0;	
			//***************************************
			if(!this.firstSetValue){
				this.updateFromModel();
			}
			
			//***************************************
			this.updateView();
			//*********************
			this.lastY = this.proui.CursorY(this.inst.layer.index);
			this.lastX = this.proui.CursorX(this.inst.layer.index);
		}

		var dt;
		if(this.tween["isPlaying"]){
			dt = this.runtime.getDt(this.inst)*1000
			this.tween["update"](dt);
			this.inst.set_bbox_changed();
		}

		if(this.tween_hover["isPlaying"]){
			dt = this.runtime.getDt(this.inst)*1000
			this.tween_hover["update"](dt);
			this.inst.set_bbox_changed();
		}


		/*if(this.onTouchStarted){
			if(this.isInTouch()){
				console.log("isTouching"+this.inst.uid);
			}
		}*/
		
		
		if(this.isClickable()){
			if(this.isMouseOver() && this.isInsideScrollView()){
				if(!this.onMouseEnterFlag && (Math.abs(this.lastY-this.proui.CursorY(this.inst.layer.index))>10 || Math.abs(this.lastX-this.proui.CursorX(this.inst.layer.index))>10 ) ){
					this.onMouseEnterFlag = true;
					this.OnMouseEnter();
					this.lastY = this.proui.CursorY(this.inst.layer.index);
					this.lastX = this.proui.CursorX(this.inst.layer.index);
				}

			}else{
				if(this.onMouseEnterFlag && (!this.isInsideScrollView() || Math.abs(this.lastY-this.proui.CursorY(this.inst.layer.index))>10 || Math.abs(this.lastX-this.proui.CursorX(this.inst.layer.index))>10 ) ){
					this.onMouseEnterFlag = false;
					this.OnMouseLeave();
					this.lastY = this.proui.CursorY(this.inst.layer.index);
					this.lastX = this.proui.CursorX(this.inst.layer.index);
				}
			}
		}


	};




	behinstProto.onDestroy = function ()
	{
	};
	
	// called when saving the full state of the game
	behinstProto.saveToJSON = function ()
	{
		return {
			"isEnabled" : this.isEnabled,
			"clickSound" : this.clickSound,
			"clickAnimation" : this.clickAnimation,
			"hoverSound":this.hoverSound,
			"hoverAnimation":this.hoverAnimation,
			"callbackName" : this.callbackName,
			"callbackParams" : this.callbackParams,
			"frames_normal" : this.frames_normal,
			"frames_hover" :  this.frames_hover,
			"disabledFrames" : this.frames_disabled,
			"value" : this.value
		};
	};
	
	// called when loading the full state of the game
	behinstProto.loadFromJSON = function (o)
	{

		this.isEnabled = o["isEnabled"];
		this.clickSound = o["clickSound"];
		this.clickAnimation = o["clickAnimation"];
		this.hoverSound = o["hoverSound"];
		this.hoverAnimation = o["hoverAnimation"];
		this.callbackName = o["callbackName"];
		this.callbackParams = o["callbackParams"];
		this.frames_normal = o["frames_normal"];
		this.frames_hover = o["frames_hover"];
		this.frames_disabled = o["disabledFrames"];
		this.value = o["value"];

		this.onCreateInit();
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
				{"name": "value", "value": this.value}
			]
		});
	};
	
	behinstProto.onDebugValueEdited = function (header, name, value)
	{
	};
	/**END-PREVIEWONLY**/

	//////////////////////////////////////
	// Conditions
	function Cnds() {};

	Cnds.prototype.OnMouseEnter = function (){
		return true;
	};
	
	Cnds.prototype.OnMouseLeave = function (){
		return true;
	};

	Cnds.prototype.IsEnabled = function (){
		return this.isEnabled;
	};

	Cnds.prototype.OnClicked = function (){
		return true;
	};

	Cnds.prototype.IsChecked = function (){
		return this.value;
	};

	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};
	

   	Acts.prototype.setEnabled = function (isEnabled){
   		this.setEnabled(isEnabled);
   		
	};

	Acts.prototype.setValue = function (value){
		this.setValue(value);
	};

	behaviorProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};

	Exps.prototype.value = function (ret)
	{
		ret.set_int(this.value);
	};
	

	behaviorProto.exps = new Exps();
	
}());