// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.aekiro_button = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.aekiro_button.prototype;
		
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
		this.proui.isTypeValid(this.inst,[cr.plugins_.Sprite,cr.plugins_.NinePatch,cr.plugins_.TiledBg],"Pro UI: Button behavior is only applicable to Sprite, 9-patch or tiled backgrounds objects.");
		this.isInstanceOfSprite = cr.plugins_.Sprite?(this.inst.type.plugin instanceof cr.plugins_.Sprite):false;
		//properties
		this.isEnabled = this.properties[0];
		this.frame_hover = isNaN(parseInt(this.properties[1]))?-1:parseInt(this.properties[1]);
		this.frame_clicked = isNaN(parseInt(this.properties[2]))?-1:parseInt(this.properties[2]);
		this.frame_disabled = isNaN(parseInt(this.properties[3]))?-1:parseInt(this.properties[3]);		
		this.clickSound = this.properties[4];
		this.clickAnimation = this.properties[5];
		this.hoverSound = this.properties[6];
		this.hoverAnimation = this.properties[7];
		this.callbackName = this.properties[8];
		this.callbackParams = this.properties[9];

		//*********************************
		this.firstFrame = true;
		this.uiType = "button";
		this.inst.uiType = "button";
		this.inst._proui = this;
		//*********************************
		this.state = NORMAL;
		this.onTouchStarted = false;
		this.onMouseEnterFlag = false;
		this.callbacks = [];
		//*********************************
		this.onCreateInit();

		

	};


	behinstProto.onCreateInit = function (){

		this.setClickAnimations();
		this.setHoverAnimations();
		this.useStates = true;
		if(this.frame_hover<0 && this.frame_clicked<0 && this.frame_disabled<0){
			this.useStates = false;
		}

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


	behinstProto.updateView = function (){

		if(!this.useStates){
			return;
		}
		if(!this.isInstanceOfSprite){
			return;
		}
		if(this.isEnabled){
			if(this.state == CLICKED && this.frame_clicked >= 0){
				cr.plugins_.Sprite.prototype.acts.SetAnimFrame.call(this.inst, this.frame_clicked);
			}
			else if(this.state == HOVER && this.frame_hover >= 0){
				cr.plugins_.Sprite.prototype.acts.SetAnimFrame.call(this.inst, this.frame_hover);
			}
			else if(this.state == NORMAL && this.frame_normal >= 0){
				cr.plugins_.Sprite.prototype.acts.SetAnimFrame.call(this.inst, this.frame_normal);
			}
		}
		else if(this.frame_disabled >= 0){
			cr.plugins_.Sprite.prototype.acts.SetAnimFrame.call(this.inst, this.frame_disabled);
		}
		else if(!this.isInsideScrollView){
			cr.plugins_.Sprite.prototype.acts.SetAnimFrame.call(this.inst, this.frame_normal);
		}
	};


	/*Does not get called if:
	- instance is invisible
	- instance layer is 
	- under an opened dialog
	cf dispatchTouchStart in proui plugin
	*/
	behinstProto.OnTouchStart = function ()
	{
		
		//Ignore if the button is already being clicked, or shouldn't be clicked
		if(!this.isClickable() || !this.isInsideScrollView() || this.onTouchStarted)return;

		//if the button is touched on a scrolling scrollview, then we dont execute the onTouchStart callback
		/*var scrollView = this.proui.scrollViews["l"+this.inst.layer.index];
		if(scrollView && (Math.abs(scrollView.contentDpos.dy)>1 || Math.abs(scrollView.contentDpos.dx)>1 )  ){
			return;
		}*/

		//Make it so buttons can't be clicked if the scrollview is scrolling
		var scrollView = this.proui.scrollViews["l"+this.inst.layer.index];
		if(scrollView && Math.sqrt(Math.pow(scrollView.scroll.dx, 2) + Math.pow(scrollView.scroll.dy, 2)) > 5) return;

		//console.log("ProUI-Button uid=%s: On Touch Start",this.inst.uid);
		this.onTouchStarted = true;

		//Play the onclick Animation
		if(this.state != CLICKED && this.clickAnimation>0){
			//console.log("Click !")
			this.tween["start"]();
		}

		//Change the current frame
		this.state = CLICKED;
		this.updateView();

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
			this.updateView();

			//console.log("ProUI-Button uid=%s: On Tap",this.inst.uid);
			this.proui.runCallback(this.callbackName,this.callbackParams);

			//execute programatically affected callbacks
			for (var i = 0, l= this.callbacks.length; i < l; i++) {
				this.callbacks[i]();
			}

			this.runtime.trigger(cr.behaviors.aekiro_button.prototype.cnds.OnClicked, this.inst);
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

		this.runtime.trigger(cr.behaviors.aekiro_button.prototype.cnds.OnMouseEnter, this.inst);

		//console.log("ProUI-Button uid=%s: On Mouse Enter",this.inst.uid);
	};

	behinstProto.OnMouseLeave = function ()
	{
		this.state = NORMAL;
		this.updateView();

		if(this.hoverAnimation>0){
			this.tween_hover["reverse"]();
		}

		this.runtime.trigger(cr.behaviors.aekiro_button.prototype.cnds.OnMouseLeave, this.inst);
		
		//console.log("ProUI-Button uid=%s: On Mouse Leave",this.inst.uid);
	};

	behinstProto.isInTouch = function ()
	{
		var touch_x = this.proui.X(this.inst.layer.index);
		var touch_y = this.proui.Y(this.inst.layer.index);
		this.inst.update_bbox();
		return this.inst.contains_pt(touch_x, touch_y);
	};

	behinstProto.setEnabled = function (isEnabled)
	{
		this.isEnabled = isEnabled;
		this.updateView();
	}
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
		/***************/
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
			if(this.useStates){
				this.inst.cur_anim_speed = 0;	
			}
			
			this.frame_normal = this.inst.cur_frame;
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
				//console.log("ProUI-Button uid=%s: Is Touching",this.inst.uid);
			}
		}*/
		

		if(this.isClickable()){
			if(this.isMouseOver() && this.isInsideScrollView()){
				if(!this.onMouseEnterFlag && (Math.abs(this.lastY-this.proui.CursorY(this.inst.layer.index))>10 || Math.abs(this.lastX-this.proui.CursorX(this.inst.layer.index))>10 ) ){
					this.onMouseEnterFlag = true;
					//console.log("Mouse Enter on UID :" + this.inst.uid);
					this.OnMouseEnter();
					this.lastY = this.proui.CursorY(this.inst.layer.index);
					this.lastX = this.proui.CursorX(this.inst.layer.index);
				}

			}else{
				if(this.onMouseEnterFlag && (!this.isInsideScrollView() || Math.abs(this.lastY-this.proui.CursorY(this.inst.layer.index))>10 || Math.abs(this.lastX-this.proui.CursorX(this.inst.layer.index))>10)) {
					this.onMouseEnterFlag = false;
					//console.log("Mouse Leave on UID :" + this.inst.uid);
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
		// return a Javascript object containing information about your behavior's state
		// note you MUST use double-quote syntax (e.g. "property": value) to prevent
		// Closure Compiler renaming and breaking the save format
		return {
			"isEnabled" : this.isEnabled,
			"clickSound" : this.clickSound,
			"clickAnimation" : this.clickAnimation,
			"hoverSound":this.hoverSound,
			"hoverAnimation":this.hoverAnimation,
			"callbackName" : this.callbackName,
			"callbackParams" : this.callbackParams,
			"frame_hover" : this.frame_hover,
			"frame_clicked" :  this.frame_clicked,
			"frame_disabled" : this.frame_disabled
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
		this.frame_hover = o["frame_hover"];
		this.frame_clicked = o["frame_clicked"];
		this.frame_disabled = o["frame_disabled"];



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
			"properties": []
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

	Cnds.prototype.OnClicked = function (){
		return true;
	};

	Cnds.prototype.IsEnabled = function (){
		return this.isEnabled;
	};

	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};
	

   	Acts.prototype.setEnabled = function (isEnabled){
   		this.setEnabled(isEnabled);
	};

	behaviorProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	
	behaviorProto.exps = new Exps();
	
}());