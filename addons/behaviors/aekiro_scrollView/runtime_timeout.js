// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
cr.behaviors.aekiro_scrollView = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.aekiro_scrollView.prototype;
		
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
			cr.proui.HookMe(this.behavior,["touch","wheel"]);
			this.behavior.isHooked = true;
		}
	};
	
	var behinstProto = behaviorProto.Instance.prototype;


	behinstProto.onCreate = function()
	{
		this.proui = cr.proui;
		this.proui.isTypeValid(this.inst,[cr.plugins_.Sprite,cr.plugins_.NinePatch,cr.plugins_.TiledBg],"Pro UI: ScrollView behavior is only applicable to Sprite Or 9-patch objects.");
		//properties
		this.scrolling = this.properties[0];
		this.isSwipeScroll = this.properties[1];
		this.isMouseScroll = this.properties[2];

		this.contentUID = this.properties[3];
		this.vSliderUID = this.properties[4];
		this.vScrollBarUID = this.properties[5];
		this.hSliderUID = this.properties[6];
		this.hScrollBarUID = this.properties[7];

		this.inertia = this.properties[8];
		this.movement = this.properties[9]; //0:clamped; 1:elastic
		this.dialogUID = this.properties[10];

		if(!this.inertia){ //If there's no inertia, then the movement can't be elastic.
			this.movement = 0;
		}

		this.elasticF = 1;
		if(this.movement){
			this.elasticF = 0.4;
		}

		//*********************************
		this.firstFrame = true;
		this.uiType = "scrollView";
		this.inst.uiType = "scrollView";
		this.inst._proui = this;
		this.dpos = {};
		//*********************************
		this.proui.scrollViews["l"+this.inst.layer.index] = this;
		//console.log(this.proui.scrollViews);
		//*********************************

		this.onTouchStarted = false;
		this.onSliderTouchStarted = false;
		this.onvSliderTouchStarted = false;
		this.onhSliderTouchStarted = false;

		this.content = null;
		this.vSlider = null;
		this.vScrollBar = null;
		this.hSlider = null;
		this.hScrollBar = null;

		this.contentPrevWidth = 0;
		this.contentPrevHeight = 0;
		this.contentDpos = {};
		this.isInit = false;

		this.isContentGridView = false;

		this.scroll = {
			isEnabled:false,
			toDisable:false,
			stopInertiaTimeout:null,
			prevTouchX : 0,
			dx:0,
			prevTouchY : 0,
			dy:0,
			scrollRatio:0,
			vScrolling: (this.scrolling == 0) || (this.scrolling == 2),
			hScrolling: (this.scrolling == 1) || (this.scrolling == 2),
			isSwipeScroll: this.isSwipeScroll,
			isMouseScroll:this.isMouseScroll,
			vSliderDy:0,
			hSliderDx:0,
			scrollToTargetY:null,
			scrollToTargetX:null,
			scrollToX:false,
			scrollToY:false,
			scrollToSmooth : 0.3
		};
		
	};
	





	behinstProto.scrollTo = function (targetX,targetY,targetType,smooth){
		this.inst.update_bbox();
		this.content.update_bbox();
		this.scroll.scrollToSmooth = smooth;
		
		this.scroll.scrollToTargetY = null;
		this.scroll.scrollToTargetX = null;
		this.scroll.scrollToX = false;
		this.scroll.scrollToY = false;
		this.onScrollToStarted = false;
		
		if(targetY>=0 && this.scroll.vScrolling ){
			var viewportCenterY = (this.inst.bbox.top+this.inst.bbox.bottom)/2;
			if(targetType){//Percentage
				targetY = cr.clamp(targetY,0,1);
				targetY = this.content.bbox.top + targetY*this.content.height;
			}else{
				targetY = this.content.bbox.top + targetY;
			}
			this.scroll.scrollToTargetY = this.content.y + (viewportCenterY-targetY);
			this.scroll.scrollToY = true;
			this.scroll.isEnabled = true;
			this.onScrollToStarted = true;
			
		}

		
		if(targetX>=0 && this.scroll.hScrolling){
			var viewportCenterX = (this.inst.bbox.left+this.inst.bbox.right)/2;
			if(targetType){//Percentage
				targetX = cr.clamp(targetX,0,1);
				targetX = this.content.bbox.left + targetX*this.content.width;
			}else{
				targetX = this.content.bbox.left + targetX;
			}
			this.scroll.scrollToTargetX = this.content.x + (viewportCenterX-targetX);
			this.scroll.scrollToX = true;
			this.scroll.isEnabled = true;
			this.onScrollToStarted = true;
		}
		
		this.content.set_bbox_changed();
	};


	behinstProto.OnWheel = function (dir){
		
		if(!this.isInteractible()){
			return;
		}

		if(this.scroll.isMouseScroll && this.scroll.vScrolling && this.isMouseOver()){
			this.scroll.scrollToX = false;
			this.scroll.scrollToY = false;
			this.scroll.isEnabled = true;
			this.onWheelStarted = true;
			dir = (dir == 0 ? -1 : 1);
			//this.scroll.dy = dir*20;
			this.scroll.dy = dir*0.026*this.content.height;
		}
	};


	behinstProto.OnAnyTouchStart = function ()
	{
		if(this.vSlider && this.isInTouch(this.vSlider) && this.scroll.vScrolling){
			this.OnSliderTouchStart();
			this.onvSliderTouchStarted = true;
		}

		if(this.hSlider && this.isInTouch(this.hSlider) && this.scroll.hScrolling){
			this.OnSliderTouchStart();
			this.onhSliderTouchStarted = true;
		}
	};

	behinstProto.isInteractible = function ()
	{	
		var isInteractible = true;

		for (var i = 0,l=this.proui.currentDialogs.length; i < l; i++) {
			if(this.inst.layer.index<this.proui.currentDialogs[i].inst.layer.index){
				isInteractible = false;
				return isInteractible;
			}
		}


		var layers = this.runtime.running_layout.layers;
		var scrollView;
		for (var i = this.inst.layer.index+1,l=layers.length; i < l; i++) {
			scrollView = this.proui.scrollViews["l"+i];
			if(scrollView){
				scrollView.inst.update_bbox();
				if(
					scrollView.inst.contains_pt(this.proui.X(scrollView.inst.layer.index),this.proui.Y(scrollView.inst.layer.index)) ||
					scrollView.inst.contains_pt(this.proui.CursorX(scrollView.inst.layer.index),this.proui.CursorY(scrollView.inst.layer.index)) 
					){
					isInteractible = false;
					break;		
				}
			}
		}
		return isInteractible;
	};


	behinstProto.OnTouchStart = function (touchX,touchY)
	{
		if(!this.isInteractible()){
			return;
		}
		
		this.onTouchStarted = true;
		clearTimeout(this.scroll.stopInertiaTimeout);

		if(this.scroll.vScrolling){
			this.scroll.prevTouchY = touchY;
			this.scroll.dy = 0;
			this.scroll.isEnabled = true;
			this.scroll.scrollToX = false;
			this.scroll.scrollToY = false;
		}
		if(this.scroll.hScrolling){
			this.scroll.prevTouchX = touchX +0.2;
			this.scroll.dx = 0;
			this.scroll.isEnabled = true;
			this.scroll.scrollToX = false;
			this.scroll.scrollToY = false;
		}

		//console.log(Math.abs(this.contentDpos.dx));
		
	};


	behinstProto.OnTouchMove = function (touchX,touchY)
	{
		//console.log("az");
		if(this.scroll.isSwipeScroll && !this.onSliderTouchStarted && this.onTouchStarted){
			//console.log(this.GetTouchX()+"**"+this.GetTouchY());
			//console.log("isTouching"+this.inst.uid);
			if(this.scroll.vScrolling){
				this.scroll.dy = touchY-this.scroll.prevTouchY; //the 0.2 fixes a bug i cant udnerstand
				this.scroll.prevTouchY = touchY;
				//console.log("bbb  "+ this.scroll.dy);
			}

			if(this.scroll.hScrolling){
				this.scroll.dx = touchX-this.scroll.prevTouchX;
				this.scroll.prevTouchX = touchX;
			}
		}

	};


	behinstProto.OnAnyTouchEnd = function (touchX, touchY)
	{
		if(this.onTouchStarted){
			this.OnTouchEnd(touchX, touchY);
		}
		this.onTouchStarted = false;
		this.onSliderTouchStarted = false;
		this.onvSliderTouchStarted = false;
		this.onhSliderTouchStarted = false;

		//In case of NO inertia, disable the core loop when scrolling (swipe or slider) finishes
		if(!this.inertia &&!this.scroll.scrollToX && !this.scroll.scrollToY){
			this.scroll.isEnabled = false;
			//console.log("Scroll disabled");
		}
		
		//console.log("Any touch end");

	};

	behinstProto.OnTouchEnd = function (touchX, touchY)
	{
		console.log("On touch end");
		this.scroll.toDisable = true;
		var self = this;
		this.scroll.stopInertiaTimeout = setTimeout(self.stopInertia, 2000);

	};

	behinstProto.OnSliderTouchStart = function (){
		this.scroll.prevTouchY = this.proui.Y(this.inst.layer.index);
		this.scroll.prevTouchX = this.proui.X(this.inst.layer.index);
		this.scroll.dy = 0;
		this.scroll.dx = 0;
		this.scroll.vSliderDy = 0;
		this.scroll.hSliderDx = 0;

		this.onSliderTouchStarted = true;
		this.scroll.isEnabled = true;
		this.scroll.scrollToX = false;
		this.scroll.scrollToY = false;
	};
	


	behinstProto.isMouseOver = function ()
	{
		var mouse_x = this.proui.CursorX(this.inst.layer.index);
		var mouse_y = this.proui.CursorY(this.inst.layer.index);
		this.inst.update_bbox();  
		return this.inst.contains_pt(mouse_x, mouse_y);
	};

	/*behinstProto.onMouseEnter = function ()
	{
	};

	behinstProto.onMouseLeave = function ()
	{
	};*/


	behinstProto.isInTouch = function (inst)
	{
		var touch_x = this.proui.X(this.inst.layer.index);
		var touch_y = this.proui.Y(this.inst.layer.index);
		//console.log(touch_x+"**"+touch_y);
		inst.update_bbox();
		return inst.contains_pt(touch_x, touch_y);
	};


	behinstProto.boundSlider = function (slider){
		if(slider == "v" && this.vSlider && this.vScrollBar){
			this.inst.update_bbox();
			this.content.update_bbox();
			this.vScrollBar.update_bbox();
			this.vSlider.update_bbox();
			var sy = this.vScrollBar.bbox.top+(this.vSlider.y-this.vSlider.bbox.top)+(this.vScrollBar.height-this.vSlider.height)*((this.content.bbox.top-this.inst.bbox.top)/(this.inst.height-this.content.height));
			this.vSlider.y = cr.clamp(sy,this.vScrollBar.bbox.top+(this.vSlider.y-this.vSlider.bbox.top), this.vScrollBar.bbox.bottom-(this.vSlider.bbox.bottom - this.vSlider.y));
			this.vSlider.set_bbox_changed();
		}
		if(slider == "h" && this.hSlider && this.hScrollBar){
			this.inst.update_bbox();
			this.content.update_bbox();
			this.hScrollBar.update_bbox();
			this.hSlider.update_bbox();
			var sx = this.hScrollBar.bbox.left+(this.hSlider.x-this.hSlider.bbox.left)+(this.hScrollBar.width-this.hSlider.width)*((this.content.bbox.left-this.inst.bbox.left)/(this.inst.width-this.content.width));
			this.hSlider.x = cr.clamp(sx,this.hScrollBar.bbox.left+(this.hSlider.x-this.hSlider.bbox.left), this.hScrollBar.bbox.right-(this.hSlider.bbox.right - this.hSlider.x));
			this.hSlider.set_bbox_changed();
		}
	};

	behinstProto.postGridviewUpdate = function (){
		var parts = [this.vScrollBar,this.vSlider,this.hScrollBar,this.hSlider];

		for (var i = 0, l= parts.length; i < l; i++) {
			if(parts[i]){
				parts[i].type.plugin.acts.MoveToTop.call(parts[i]);	
			}
		}
	};


	behinstProto.init = function (){
		if(this.isInit){
			return;
		}

		if(this.vSliderUID){
			this.vSlider = this.proui.tags[this.vSliderUID];
			if(this.vSlider){
				this.proui.isTypeValid(this.vSlider,[cr.plugins_.Sprite,cr.plugins_.NinePatch],"ProUI-ScrollView: The vertical slider can only be a Sprite Or 9-patch object.");
				this.vSlider.uiType = "slider";

			}else{
				console.error("ProUI-ScrollView %d : Vertical slider not found",this.inst.uid);
			}
		}


		if(this.vScrollBarUID){
			this.vScrollBar = this.proui.tags[this.vScrollBarUID];
			if(this.vScrollBar){
				this.proui.isTypeValid(this.vScrollBar,[cr.plugins_.Sprite,cr.plugins_.NinePatch],"ProUI-ScrollView: The vertical scrollbar can only be a Sprite Or 9-patch object.");
				this.vScrollBar.uiType = "scrollBar";
			}else{
				console.error("ProUI-ScrollView %d : Vertical scrollbar not found",this.inst.uid);
			}
		}

		
		if(this.hSliderUID){
			this.hSlider = this.proui.tags[this.hSliderUID];
			if(this.hSlider){
				this.proui.isTypeValid(this.hSlider,[cr.plugins_.Sprite,cr.plugins_.NinePatch],"ProUI-ScrollView: The horizontal slider can only be a Sprite Or 9-patch object.");
				this.hSlider.uiType = "slider";
			}else{
				console.error("ProUI-ScrollView %d : Horizontal slider not found",this.inst.uid);
			}			
		}
		

		if(this.hScrollBarUID){
			this.hScrollBar = this.proui.tags[this.hScrollBarUID];
			if(this.hScrollBar){
				this.proui.isTypeValid(this.hScrollBar,[cr.plugins_.Sprite,cr.plugins_.NinePatch],"ProUI-ScrollView: The horizontal scrollbar can only be a Sprite Or 9-patch object.");
				this.hScrollBar.uiType = "scrollBar";
			}else{
				console.error("ProUI-ScrollView %d : Horizontal scrollbar not found",this.inst.uid);
			}			
		}


		
		this.content = this.proui.tags[this.contentUID];
		if(this.content){
			this.proui.isTypeValid(this.content,[cr.plugins_.Sprite,cr.plugins_.NinePatch,cr.plugins_.TiledBg],"ProUI-ScrollView: The content of the scrollView can only be a Sprite Or 9-patch object.");

			//If the content is a gridview, we prevent it to move its children, because the scrollview is already doing it
			if(this.content.uiType == "gridView"){
				this.isContentGridView = true;
				this.content._proui.scrollView = this; //make sure that gridview knows that it is on a scrollview
			}
			//Scrolling is deactivated if the content is too small to scroll
			if(this.content.height<=this.inst.height){
				this.scroll.vScrolling = false;
			}

			if(this.content.width<=this.inst.width){
				this.scroll.hScrolling = false;
			}

			//Saving initial content's width and height
			this.contentPrevHeight = this.content.height;
			this.contentPrevWidth = this.content.width;

			//
			this.contentDpos.prev_x = this.content.x;
			this.contentDpos.prev_y = this.content.y;
			this.contentDpos.dx = 0;
			this.contentDpos.dy = 0;

			//snap the content to the top-left of the scrollview
			this.inst.update_bbox();
			this.content.update_bbox();
			this.content.x = this.inst.bbox.left + (this.content.x - this.content.bbox.left);
			this.content.y = this.inst.bbox.top  + (this.content.y - this.content.bbox.top);
			this.content.set_bbox_changed();

			//this.updateContentChildren();
		}else{
			throw new Error("ProUI-ScrollView: Content not found, please check the content tag");
		}


		//snap the hSlider to the left of the hScrollBar (user is left to manually place hslider verticaly)
		if(this.hSlider && this.hScrollBar){
			this.hSlider.update_bbox();
			this.hScrollBar.update_bbox();
			this.hSlider.x = this.hScrollBar.bbox.left+(this.hSlider.x-this.hSlider.bbox.left);
			this.hSlider.set_bbox_changed();

			this.hScrollBar.type.plugin.acts.MoveToTop.call(this.hScrollBar);
			this.hSlider.type.plugin.acts.MoveToTop.call(this.hSlider);
		}

		//snap the vSlider to the left of the vScrollBar (user is left to manually place vslider horizontaly)
		if(this.vSlider && this.vScrollBar){
			this.vSlider.update_bbox();
			this.vScrollBar.update_bbox();
			this.vSlider.y = this.vScrollBar.bbox.top+(this.vSlider.y-this.vSlider.bbox.top);
			this.vSlider.set_bbox_changed();

			this.vScrollBar.type.plugin.acts.MoveToTop.call(this.vScrollBar);
			this.vSlider.type.plugin.acts.MoveToTop.call(this.vSlider);
		}

		//********************************************************
		//Masking the content
		cr.system_object.prototype.acts.SetLayerForceOwnTexture.call(this.runtime.system,this.inst.layer,true);

		var inst;
		for (var i = 0, l= this.inst.layer.instances.length; i < l; i++) {
			inst = this.inst.layer.instances[i];
			if(!inst)continue;
			if ( inst == this.inst || inst.uiType == "dialog" || inst.uiType == "scrollBar" || inst.uiType == "slider")
				continue;
			//set blendmode to source atop
			if(inst.type.plugin.acts.SetEffect){
				inst.type.plugin.acts.SetEffect.call(inst,9);	
			}
			
		}

		this.isInit = true;

		//********************************************************
		//If the scrollview is on a dialog, then we add its reference to the dialog so that the dialog move it
		var dialog = this.proui.tags[this.dialogUID];
		if(dialog && (dialog.uiType == "dialog") && dialog._proui){
			if(!dialog._proui.outLayerChildren[this.inst.layer.name]){
				dialog._proui.outLayerChildren[this.inst.layer.name] = [];
			}
			dialog._proui.outLayerChildren[this.inst.layer.name].push(this.inst);

			if(!dialog._proui.isOpen){
				cr.system_object.prototype.acts.SetLayerVisible.call(this.runtime.system,this.inst.layer,false);
			}
		}


	};


	behinstProto.tick = function ()
	{
		if(this.firstFrame){
			this.firstFrame = false;
			this.prevSelfLayerVisible = this.inst.layer.visible;
			this.init();
			//**********************
			this.dpos.prev_x = this.inst.x;
			this.dpos.prev_y = this.inst.y;
			this.dpos.dx = 0;
			this.dpos.dy = 0;
			//*************************
		}

		if(!this.content){
			return;
		}
		

		//****************************************
		this.contentDpos.dx = this.content.x - this.contentDpos.prev_x;
		this.contentDpos.dy = this.content.y - this.contentDpos.prev_y;
		this.contentDpos.prev_x = this.content.x;
		this.contentDpos.prev_y = this.content.y;

		//****************************************
		var isSelfLayerVisible  = this.inst.layer.visible;
		if(isSelfLayerVisible != this.prevSelfLayerVisible){
			this.prevSelfLayerVisible = this.inst.layer.visible;
			cr.system_object.prototype.acts.SetLayerForceOwnTexture.call(this.runtime.system,this.inst.layer, isSelfLayerVisible);
			//console.log("SCROLLVIEW %d : Force Own Texture turned %s.",this.inst.uid,isSelfLayerVisible?"on":"off");
		}

		//Listening for the content size change
		//****************************************
		if(this.contentPrevHeight != this.content.height){
			//console.log("%cSCROLLVIEW %d : Content height change","color:blue", this.inst.uid);
			this.inst.update_bbox();
			this.content.update_bbox();

			if(this.content.height<=this.inst.height){ //the content is snapped to the top
				this.content.y = this.inst.bbox.top+(this.content.y-this.content.bbox.top);
				this.scroll.vScrolling = false;
			}else{
				this.content.y = cr.clamp(this.content.y,this.inst.bbox.bottom-(this.content.bbox.bottom-this.content.y),this.inst.bbox.top+(this.content.y-this.content.bbox.top));
				if( (this.scrolling == 0) || (this.scrolling == 2))//We re-activate the vScrolling only if the user has originaly enabled it.
					this.scroll.vScrolling = true;
			}
			this.content.set_bbox_changed();
			this.boundSlider("v");
			this.contentPrevHeight = this.content.height;
		}


		if(this.contentPrevWidth != this.content.width){
			//console.log("%cSCROLLVIEW %d : Content width change","color:blue", this.inst.uid);
			this.inst.update_bbox();
			this.content.update_bbox();

			if(this.content.width<=this.inst.width){//the content is snapped to the left
				this.content.x = this.inst.bbox.left + (this.content.x - this.content.bbox.left);
				this.scroll.hScrolling = false;
			}else{
				this.content.x = cr.clamp(this.content.x,this.inst.bbox.right-(this.content.bbox.right-this.content.x),this.inst.bbox.left +(this.content.x - this.content.bbox.left));
				if((this.scrolling == 1) || (this.scrolling == 2))
					this.scroll.hScrolling = true;
			}

			this.content.set_bbox_changed();
			this.boundSlider("h");
			this.contentPrevWidth = this.content.width;
		}
		//****************************************

		if(!this.scroll.isEnabled)
			return;

		//****************************************
		//VERTICAL SLIDER SCROLLING
		if(this.onvSliderTouchStarted && this.scroll.vScrolling)
		{
			this.scroll.vSliderDy = this.proui.Y(this.inst.layer.index)-this.scroll.prevTouchY;
			this.scroll.prevTouchY = this.proui.Y(this.inst.layer.index);
			var sy = this.vSlider.y + this.scroll.vSliderDy;
			this.vSlider.update_bbox();
			this.vScrollBar.update_bbox();
			this.vSlider.y = cr.clamp(sy,this.vScrollBar.bbox.top+(this.vSlider.y-this.vSlider.bbox.top), this.vScrollBar.bbox.bottom-(this.vSlider.bbox.bottom - this.vSlider.y));
			this.vSlider.set_bbox_changed();
			

			//scrolling
			this.vSlider.update_bbox();
			this.inst.update_bbox();
			this.content.update_bbox();
			this.content.y = this.inst.bbox.top+(this.content.y-this.content.bbox.top)-((this.vSlider.bbox.top-this.vScrollBar.bbox.top)/(this.vScrollBar.height-this.vSlider.height))*(this.content.height-this.inst.height);
			this.content.set_bbox_changed();
		}


		//HORIZONTAL SLIDER SCROLLING
		if(this.onhSliderTouchStarted && this.scroll.hScrolling)
		{
			this.scroll.hSliderDx = this.proui.X(this.inst.layer.index)-this.scroll.prevTouchX;
			this.scroll.prevTouchX = this.proui.X(this.inst.layer.index);
			var sx = this.hSlider.x + this.scroll.hSliderDx;
			this.hSlider.update_bbox();
			this.hScrollBar.update_bbox();
			this.hSlider.x = cr.clamp(sx,this.hScrollBar.bbox.left+(this.hSlider.x-this.hSlider.bbox.left) , this.hScrollBar.bbox.right-(this.hSlider.bbox.right-this.hSlider.x));
			this.hSlider.set_bbox_changed();

			//scrolling
			this.hSlider.update_bbox();
			this.inst.update_bbox();
			this.content.update_bbox();
			this.content.x = this.inst.bbox.left+(this.content.x-this.content.bbox.left)-((this.hSlider.bbox.left-this.hScrollBar.bbox.left)/(this.hScrollBar.width-this.hSlider.width))*(this.content.width-this.inst.width);
			this.content.set_bbox_changed();
		}


		//SWIPE SCROLLING
		/*if(this.scroll.isSwipeScroll && this.isInTouch(this.inst) && !this.onSliderTouchStarted && this.onTouchStarted){
			//console.log(this.GetTouchX()+"**"+this.GetTouchY());
			//console.log("isTouching"+this.inst.uid);
			if(this.scroll.vScrolling){
				this.scroll.dy = this.proui.Y(this.inst.layer.index)-this.scroll.prevTouchY; //the 0.2 fixes a bug i cant udnerstand
				this.scroll.prevTouchY = this.proui.Y(this.inst.layer.index);
				console.log("bbb  "+ this.scroll.dy);
			}

			if(this.scroll.hScrolling){
				this.scroll.dx = this.proui.X(this.inst.layer.index)-this.scroll.prevTouchX;
				this.scroll.prevTouchX = this.proui.X(this.inst.layer.index);
			}
		}*/


		//ACTUAL SCROLLING (when scrolling by swiping or mousewheel)
		if(this.scroll.vScrolling && !this.onSliderTouchStarted){
			if(!this.scroll.scrollToY){//non-programatic scrolling
				this.content.y = cr.lerp(this.content.y,this.content.y+this.scroll.dy,0.7);
			}else if(this.scroll.scrollToTargetY!=null){//programatic scrolling using the ScrollTo action
				this.content.y = cr.lerp(this.content.y,this.scroll.scrollToTargetY,this.scroll.scrollToSmooth);
				if(Math.abs(this.content.y-this.scroll.scrollToTargetY)<5){
					this.content.y = this.scroll.scrollToTargetY;
					this.scroll.scrollToY = false;
				}
			}
			
			this.content.set_bbox_changed();
			//console.log("bbb"+Math.abs(this.scroll.dy));
			if(this.inertia){
				this.scroll.dy = (14/15)*this.scroll.dy;
			}else{
				this.scroll.dy = 0;	
			}

			//we position the vertical slider according to the content scrollRatio
			this.boundSlider("v");
		}

		if(this.scroll.hScrolling && !this.onSliderTouchStarted ){

			if(!this.scroll.scrollToX){//non-programatic scrolling
				this.content.x = cr.lerp(this.content.x,this.content.x+this.scroll.dx,0.7);
			}else if(this.scroll.scrollToTargetX!=null){//programatic scrolling using the ScrollTo action
				this.content.x = cr.lerp(this.content.x,this.scroll.scrollToTargetX,this.scroll.scrollToSmooth);
				if(Math.abs(this.content.x-this.scroll.scrollToTargetX)<5){
					this.content.x = this.scroll.scrollToTargetX;
					this.scroll.scrollToX = false;
				}
			}

			this.content.set_bbox_changed();
			if(this.inertia){
				this.scroll.dx = (14/15)*this.scroll.dx;
			}else{
				this.scroll.dx = 0;	
			}
			

			//we position the vertical slider according to the content scrollRatio
			this.boundSlider("h");
		}


		//BOUNDING THE CONTENT (when scrolling by swiping or mousewheel)
		if(!this.onSliderTouchStarted){
			this.inst.update_bbox();
			this.content.update_bbox();

			var diff_topY = 0, diff_bottomY = 0, diff_rightX =0,diff_leftX=0;
			if(this.scroll.vScrolling){
				//checking the vertical boundaries of the content
				diff_topY = this.content.bbox.top-this.inst.bbox.top;
				diff_bottomY = this.inst.bbox.bottom-this.content.bbox.bottom;
				
				if(diff_topY>0 || diff_bottomY>0){
					//when the scrollTo makes the content out of the viewport
					if(this.scroll.scrollToY){
						this.content.y = cr.clamp(this.content.y,this.content.y+diff_bottomY,this.content.y - diff_topY);
						this.scroll.scrollToTargetY = this.content.y;
						this.scroll.scrollToY = false;
					}else{
						this.content.y = cr.clamp(this.content.y,cr.lerp(this.content.y,this.content.y+diff_bottomY,this.elasticF),cr.lerp(this.content.y,this.content.y - diff_topY,this.elasticF));
					}
				}


				this.content.set_bbox_changed();
			}

		
			if(this.scroll.hScrolling){
				//checking the horizontal boundaries of the content
				diff_rightX = this.inst.bbox.right-this.content.bbox.right;
				diff_leftX = this.content.bbox.left-this.inst.bbox.left;

				if(diff_rightX>0 || diff_leftX>0){
					if(this.scroll.scrollToX){
						this.content.x = cr.clamp(this.content.x,this.content.x + diff_rightX,this.content.x - diff_leftX);
						this.scroll.scrollToTargetX = this.content.x;
						this.scroll.scrollToX = false;
					}else{
						this.content.x = cr.clamp(this.content.x,cr.lerp(this.content.x,this.content.x + diff_rightX,this.elasticF),cr.lerp(this.content.x,this.content.x - diff_leftX,this.elasticF));
					}
				}


				this.content.set_bbox_changed();
			}

			//In case of NO inertia, disable the core loop when wheel scrolling finishes
			if(!this.inertia && this.onWheelStarted){
				this.scroll.isEnabled = false;
				this.onWheelStarted = false;
			}

			//console.log("az");

			//Disable the core loop when scrollTo finishes (whether inertia on or off)
			if(this.onScrollToStarted && !this.scroll.scrollToX && !this.scroll.scrollToY){
				this.scroll.isEnabled = false;
				this.onScrollToStarted = false;
				//console.log("Scroll TO disabled");
			}

			
			//In case of inertia, disable the core loop when scrolling (swipe or wheel or slider) finishes
			/*if( this.scroll.toDisable && this.inertia && Math.abs(this.scroll.dx)<0.1 && Math.abs(this.scroll.dy)<0.1 && !this.scroll.scrollToX && !this.scroll.scrollToY ){
				this.scroll.isEnabled = false;
				this.scroll.toDisable = false;
				
				console.log("Scroll disabled *** " + Math.abs(this.scroll.dy));
			}*/
		}


	};

	behinstProto.stopInertia = function (){
		this.scroll.isEnabled = false;
		this.scroll.toDisable = false;
		console.log("Scroll disabled *** " + Math.abs(this.scroll.dy));

	};

	behinstProto.updateContentChildren = function ()
	{
		if(!this.content)return;
		/*this.contentDpos.dx = this.content.x - this.contentDpos.prev_x;
		this.contentDpos.dy = this.content.y - this.contentDpos.prev_y;
		this.contentDpos.prev_x = this.content.x;
		this.contentDpos.prev_y = this.content.y;*/
		
		var inst;
		if( (this.contentDpos.dx != 0) || (this.contentDpos.dy != 0) ){
			for (var i = 0, l= this.inst.layer.instances.length; i < l; i++) {
				inst = this.inst.layer.instances[i];
				if(!inst)continue;
				if ( inst==this.content || inst.isSubComp===true || inst.uiType == "dialog" || inst.uiType == "scrollView" || inst.uiType == "scrollBar" || inst.uiType == "slider")
					continue;
				inst.x += this.contentDpos.dx;
				inst.y += this.contentDpos.dy;
				inst.set_bbox_changed();
			}
		}
	};

	behinstProto.updateChildren = function ()
	{
		if(isNaN(this.dpos.prev_x)){
			this.dpos.prev_x = this.inst.x;
			this.dpos.prev_y = this.inst.y;
		}

		this.dpos.dx = this.inst.x - this.dpos.prev_x;
		this.dpos.dy = this.inst.y - this.dpos.prev_y;
		this.dpos.prev_x = this.inst.x;
		this.dpos.prev_y = this.inst.y;

		var parts = [this.content, this.vScrollBar,this.vSlider,this.hScrollBar,this.hSlider];
		var inst;
		if( (this.dpos.dx != 0) || (this.dpos.dy != 0) ){
			for (var i = 0, l= parts.length; i < l; i++) {
				inst = parts[i];
				if(inst){
					inst.x += this.dpos.dx;
					inst.y += this.dpos.dy;
					inst.set_bbox_changed();
				}
			}
		}
	};

	behinstProto.tick2 = function ()
	{
		//if(this.scroll.isEnabled && !this.isContentGridView){
		if(!this.isContentGridView){
			this.updateContentChildren();
		}

		this.updateChildren();
	};




	behinstProto.onDestroy = function ()
	{
		this.proui.scrollViews["l"+this.inst.layer.index] = null;
	};
	
	// called when saving the full state of the game
	behinstProto.saveToJSON = function ()
	{
		return {
			// e.g.
			//"myValue": this.myValue
		};
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
	
	Acts.prototype.ScrollTo = function (targetX,targetY,targetType,smooth)
	{
		this.scrollTo(targetX,targetY,targetType,smooth);
	}

	behaviorProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	

	behaviorProto.exps = new Exps();
	
}());