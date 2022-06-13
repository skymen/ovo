// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.aekiro_dialog = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.aekiro_dialog.prototype;
		
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

		this.tweenFunctions =[
			TWEEN["Easing"]["Linear"]["None"],
			TWEEN["Easing"]["Quadratic"]["Out"],
			TWEEN["Easing"]["Quartic"]["Out"],
			TWEEN["Easing"]["Exponential"]["Out"],
			TWEEN["Easing"]["Circular"]["Out"],
			TWEEN["Easing"]["Back"]["Out"],
			TWEEN["Easing"]["Elastic"]["Out"],
			TWEEN["Easing"]["Bounce"]["Out"],
		];
	};
	
	var behinstProto = behaviorProto.Instance.prototype;


	behinstProto.onCreate = function()
	{
		this.proui = cr.proui;
		this.proui.isTypeValid(this.inst,[cr.plugins_.Sprite,cr.plugins_.NinePatch,cr.plugins_.TiledBg],"Pro UI: dialog behavior is only applicable to Sprite, 9-patch or tiled backgrounds objects.");
		//properties
		this.openAnimation = this.properties[0];
		this.openAnimTweenFunction = this.tweenFunctions[this.properties[1]];
		this.openSound = this.properties[2];
		this.openAnimDuration = this.properties[3];
		this.closeAnimation = this.properties[4];
		this.closeAnimTweenFunction = this.tweenFunctions[this.properties[5]];
		this.closeSound = this.properties[6];
		this.closeAnimDuration = this.properties[7];
		this.overlayUID = this.properties[8];
		this.pauseOnOpen = this.properties[9];
		this.closeButtonUID = this.properties[10];
		this.isModal = this.properties[11];
		this.isLayerContainer = this.properties[12];

		//*****************************
		this.firstFrame = true;
		this.inst.uiType = "dialog";
		this.uiType = "dialog";
		this.inst._proui = this;
		this.dpos = {};
		this.isInit = false;
		//*****************************
		
		this.isOpen = false;
		this.outLayerChildren = {}; //list of scrollviews on the dialog



		//*****************************
		this.tween = new TWEEN["Tween"]();
		this.tween["onReverseComplete"](this.postClose,this);
		this.tween["onComplete"](this.postOpen,this);

		this.tween_close = new TWEEN["Tween"]();
		this.tween_close["onComplete"](this.postClose,this);

		this.tween_opacity = new TWEEN["Tween"](); //a separate tween for opacity: we don't want the opacity to be tweened by elastic 

		//***************************************
	};


	behinstProto.setCloseButton = function (){
		this.closeButton = this.proui.tags[this.closeButtonUID];

		if(this.closeButton){
			if(this.closeButton.uiType != "button"){
				console.error("ProUI-Dialog uid=%s: the close button needs to have a button behavior !",this.inst.uid);
				return;
			}

			var self = this;
			this.closeButton._proui.callbacks.push(function(){
				self.close();
			});
		}
	};

	behinstProto.setOverlay = function (){
		this.overlay = this.proui.tags[this.overlayUID];
		if(this.overlay){
			this.proui.isTypeValid(this.overlay,[cr.plugins_.Sprite,cr.plugins_.NinePatch,cr.plugins_.TiledBg],"ProUI-Dialog: The overlay of a dialog can only be a Sprite, 9-patch Or Tiled Background object.");
			this.overlay.uiType = "overlay";
			this.tween_overlay = new TWEEN["Tween"]();
			this.tween_overlay["easing"](TWEEN["Easing"]["Quartic"]["Out"]);

		}
	};

	behinstProto.showOverlay = function (){
		if(this.overlay){
			this.overlay.my_timescale = 1;
			this.overlay.type.plugin.acts.MoveToLayer.call(this.overlay, this.inst.layer);
			this.overlay.type.plugin.acts.MoveToBottom.call(this.overlay);
			this.overlay.width = this.inst.layer.viewRight - this.inst.layer.viewLeft;
			this.overlay.height = this.inst.layer.viewBottom - this.inst.layer.viewTop;
			this.overlay.set_bbox_changed();
			this.overlay.update_bbox();
			this.overlay.x = this.inst.layer.viewLeft + (this.overlay.x - this.overlay.bbox.left);
			this.overlay.y = this.inst.layer.viewTop + (this.overlay.y - this.overlay.bbox.top);
			this.overlay.set_bbox_changed();
			this.overlay.visible = true;
			
			this.overlay.opacity = 0;
			this.tween_overlay["setObject"](this.overlay);
			this.tween_overlay["to"]({ opacity:0.3 }, 300);
			this.tween_overlay["start"]();
		}
	};

	behinstProto.setDialogTimeScale = function (){
		var inst;
		for (var i = 0, l= this.inst.layer.instances.length; i < l; i++) {
			inst = this.inst.layer.instances[i];
			inst.my_timescale = 1;
		}
	};

	behinstProto.setOutLayerChildrenVisible = function (isVisible)
	{
		var layerInsts, self = this;
		Object.keys(this.outLayerChildren).forEach(function(key) {
			layerInsts = self.outLayerChildren[key];
			for (var i = 0, l= layerInsts.length; i < l; i++) {
				cr.system_object.prototype.acts.SetLayerVisible.call(self.runtime.system,layerInsts[i].layer,isVisible);
			}
		});
	};

	behinstProto.init = function ()
	{
		if(this.isInit)
			return;

		//******************************************
		cr.system_object.prototype.acts.SetLayerVisible.call(this.runtime.system,this.inst.layer,false);

		//hide any scrollview on the dialog
		this.setOutLayerChildrenVisible(false);
		//******************************************
		/*if(this.inst.aekiro_gameobject){
			this.inst.aekiro_gameobject.init();
		}*/

		//******************************************

		
		this.dpos.prev_x = this.inst.x;
		this.dpos.prev_y = this.inst.y;
		this.dpos.dx = 0;
		this.dpos.dy = 0;

		//this.inst.y = this.inst.layer.viewTop - (this.inst.height/2) - 100;
		this.inst.x = this.inst.layer.viewLeft - this.inst.width - 100;
		this.inst.set_bbox_changed();


		this.setOverlay();
		this.setCloseButton();
		this.isInit = true;
		//console.log("DIALOG INIT");
	};




	behinstProto.tick = function ()
	{
		if(this.firstFrame){
			this.firstFrame = false;
			this.init();
			//console.log("dialog init ******");
		}

		/*if(this.isOpen && this.runtime.timescale == 0){
			this.resetDialogTimeScale();
		}*/
		

		var dt;
		if(this.tween["isPlaying"]){
			dt = this.runtime.getDt(this.inst)*1000;
			this.tween["update"](dt);
			if(this.openAnimation == 5 || this.openAnimation == 6){ //ScaleDown|ScaleUp
				//****************
				var layerInsts, self = this;
				Object.keys(this.outLayerChildren).forEach(function(key) {
					layerInsts = self.outLayerChildren[key];
					for (var i = 0, l= layerInsts.length; i < l; i++) {
						layerInsts[i].layer.scale = self.inst.layer.scale;
					}
				});
				//****************
				
				this.runtime.redraw = true;
			}else{
				this.inst.set_bbox_changed();
			}
		}

		if(this.tween_close["isPlaying"]){
			dt = this.runtime.getDt(this.inst)*1000;
			this.tween_close["update"](dt);
			if(this.closeAnimation == 6 || this.closeAnimation == 7){ //ScaleDown|ScaleUp
				//****************
				var layerInsts, self = this;
				Object.keys(this.outLayerChildren).forEach(function(key) {
					layerInsts = self.outLayerChildren[key];
					for (var i = 0, l= layerInsts.length; i < l; i++) {
						layerInsts[i].layer.scale = self.inst.layer.scale;
					}
				});
				//****************

				this.runtime.redraw = true;
			}else{
				this.inst.set_bbox_changed();	
			}
		}

		if(this.tween_opacity["isPlaying"]){
			dt = this.runtime.getDt(this.inst)*1000;
			this.tween_opacity["update"](dt);

			//****************
			var layerInsts, self = this;
			Object.keys(this.outLayerChildren).forEach(function(key) {
				layerInsts = self.outLayerChildren[key];
				for (var i = 0, l= layerInsts.length; i < l; i++) {
					layerInsts[i].layer.opacity = self.inst.layer.opacity;
				}
			});
			//****************

			this.runtime.redraw = true;
		}

		if(this.tween_overlay && this.tween_overlay["isPlaying"]){
			dt = this.runtime.getDt(this.inst)*1000;
			this.tween_overlay["update"](dt);
			this.runtime.redraw = true;
			//console.log(this.overlay.opacity);
		}


	};



	behinstProto.updateChildren = function ()
	{
		
		if(!this.isLayerContainer){
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

		var inst;
		if( (this.dpos.dx != 0) || (this.dpos.dy != 0) ){
			for (var i = 0, l= this.inst.layer.instances.length; i < l; i++) {
				inst = this.inst.layer.instances[i];
				if ( inst.uiType == "dialog" || inst.uiType == "overlay" || inst.isSubComp===true)
					continue;

				inst.x += this.dpos.dx;
				inst.y += this.dpos.dy;
				inst.set_bbox_changed();

				//this fixes the lag
				if ( inst.uiType == "radiogroup" || inst.uiType =="discreteProgress" || inst.uiType =="sliderbar"){
					inst._proui.updateChildren();
				}

				/*if(inst.aekiro_gameobject){
					inst.aekiro_gameobject.updateChildren();
				}*/
			}
			//***************
			var layerInsts;
			var self = this;
			Object.keys(this.outLayerChildren).forEach(function(key,index) {
				layerInsts = self.outLayerChildren[key];
				for (var i = 0, l= layerInsts.length; i < l; i++) {
					inst = layerInsts[i];
					inst.x += self.dpos.dx;
					inst.y += self.dpos.dy;
					inst.set_bbox_changed();
				}
			});


			
		}
	};



	behinstProto.tick2 = function ()
	{
		this.updateChildren();
	};


	behinstProto.setInitialPosition = function (targetX,targetY,center){
		//None|SlideDown|SlideUp|SlideLeft|SlideRight|ScaleDown|ScaleUp
		var initX,initY;
		
		if(this.openAnimation == 0 || this.openAnimation == 5 || this.openAnimation == 6){ //None/ ScaleDown|ScaleUp
			initX = targetX;
			initY = targetY;
			if(center){
				initY = (this.inst.layer.viewTop+this.inst.layer.viewBottom)/2;
				initX = (this.inst.layer.viewLeft+this.inst.layer.viewRight)/2;
			}
		}else if(this.openAnimation == 1){ //SlideDown
			initY = this.inst.layer.viewTop - (this.inst.height/2) - 100;
			if(center){
				initX = (this.inst.layer.viewLeft+this.inst.layer.viewRight)/2;
			}else{
				initX = targetX;
			}
		}else if(this.openAnimation == 2){ //SlideUp
			initY = this.inst.layer.viewBottom + (this.inst.height/2) + 100;
			if(center){
				initX = (this.inst.layer.viewLeft+this.inst.layer.viewRight)/2;
			}else{
				initX = targetX;
			}
		}else if(this.openAnimation == 3){ //SlideLeft
			initX = this.inst.layer.viewRight + (this.inst.width/2) + 100;
			if(center){
				initY = (this.inst.layer.viewTop+this.inst.layer.viewBottom)/2;
			}else{
				initY = targetY;
			}
		}else if(this.openAnimation == 4){ //SlideRight
			initX = this.inst.layer.viewLeft - (this.inst.width/2) - 100;
			if(center){
				initY = (this.inst.layer.viewTop+this.inst.layer.viewBottom)/2;
			}else{
				initY = targetY;
			}
		}

		this.inst.x = initX;
		this.inst.y = initY;
		this.inst.set_bbox_changed();
		this.updateChildren();
		//console.log(initX+"******"+initY);

	};


	behinstProto.open = function (_targetX,_targetY,center)
	{
		this.init();

		//Can't be opened if: already opened or opening
		if(this.isOpen || this.tween["isPlaying"]){//|| this.tween_close["isPlaying"]
			return;
		}
		//***************************
		//Cant' be opened if a modal dialog is already opened
		if(this.proui.isModalDialogOpened()){
			console.log("ProUI-Dialog: Can not open dialog because modal dialog is already opened");
			return;
		}

		//If it's closing, we stop the closing animation
		if(this.tween_close["isPlaying"]){
			this.tween_close["isPlaying"] = false;
			this.postClose();
		}

		this.proui.addDialog(this);
		//***************************

		//console.log("%cDIALOG %d : Open","color:blue", this.inst.uid);

		this.isOpen = true;

		this.runtime.trigger(cr.behaviors.aekiro_dialog.prototype.cnds.onDialogOpened, this.inst);

		if(this.pauseOnOpen){
			this.prevTimescale = this.runtime.timescale;
			//setting the global timescale to 0 will not affect objects which timescale has been individually modified;
			cr.system_object.prototype.acts.SetTimescale.call(this.runtime.system,0);
		}

		if(this.runtime.timescale != 1){
			this.setDialogTimeScale(1);	
		}
		

		//set the start position of the dialog, which depends on the type of the open animation
		this.setInitialPosition(_targetX,_targetY,center);

		//set the dialog's layer to visible
		cr.system_object.prototype.acts.SetLayerVisible.call(this.runtime.system,this.inst.layer,true);

		//****************
		var layerInsts, self = this;
		Object.keys(this.outLayerChildren).forEach(function(key) {
			layerInsts = self.outLayerChildren[key];
			for (var i = 0, l= layerInsts.length; i < l; i++) {
				cr.system_object.prototype.acts.SetLayerVisible.call(self.runtime.system,layerInsts[i].layer,true);
			}
		});

		//*******************************************
		var targetX = _targetX;
		var targetY = _targetY;
		//target = center of viewport
		if(center){
			targetX = (this.inst.layer.viewLeft+this.inst.layer.viewRight)/2;
			targetY = (this.inst.layer.viewTop+this.inst.layer.viewBottom)/2;
		}

		if(this.openAnimDuration == 0){ //If anim duration = 0 then we set animation to "no animation", otherwise wierd bug emerge
			this.openAnimation = 0
		}

		//None|SlideDown|SlideUp|SlideLeft|SlideRight|ScaleDown|ScaleUp
		if(this.openAnimation==1 || this.openAnimation == 2){ //SlideDown|SlideUp
			this.tween["setObject"](this.inst);
			this.tween["easing"](this.openAnimTweenFunction);
			this.tween["to"]({y: targetY }, this.openAnimDuration);
		}else if(this.openAnimation == 3 || this.openAnimation == 4){ //SlideLeft|SlideRight
			this.tween["setObject"](this.inst);
			this.tween["easing"](this.openAnimTweenFunction);
			this.tween["to"]({x: targetX }, this.openAnimDuration);
		}else if(this.openAnimation == 5 || this.openAnimation == 6){ //ScaleDown|ScaleUp
			this.tween["setObject"](this.inst.layer);
			this.tween["easing"](this.openAnimTweenFunction);
			if(this.openAnimation == 5){ //ScaleDown
				this.inst.layer.scale = 2;
			}else{ //ScaleUp
				this.inst.layer.scale = 0.2;
			}
			this.inst.layer.opacity = 0;
			this.runtime.redraw = true;
			this.tween["to"]({ scale: 1 }, this.openAnimDuration);

			this.tween_opacity["setObject"](this.inst.layer);
			this.tween_opacity["to"]({ opacity: 1 }, 300);
			this.tween_opacity["easing"](TWEEN["Easing"]["Quartic"]["Out"]);
		}
		//*******************************************

		if(this.openAnimation>0){
			this.tween["start"]();
			if(this.openAnimation == 5 || this.openAnimation == 6){ //ScaleDown|ScaleUp
				this.tween_opacity["start"]();
			}
		}else{
			this.inst.x = targetX;
			this.inst.y = targetY;
			this.inst.set_bbox_changed();
			this.updateChildren();
		}

		//*******************************************
		//Play Sound
		if(this.openSound){
			this.proui.playAudio(this.openSound);
		}
	};


	behinstProto.postOpen = function (){
		this.showOverlay();
	};



	behinstProto.getCloseTargetPosition = function (){
		//None|Reverse|SlideDown|SlideUp|SlideLeft|SlideRight|ScaleDown|ScaleUp
		var X = this.inst.x;
		var Y = this.inst.y;
		
		if(this.closeAnimation == 2){ //SlideDown
			Y = this.inst.layer.viewBottom + (this.inst.height/2) + 100;
			X = this.inst.x;
		}else if(this.closeAnimation == 3){ //SlideUp
			Y = this.inst.layer.viewTop - (this.inst.height/2) - 100;
			X = this.inst.x;
		}else if(this.closeAnimation == 4){ //SlideLeft
			X = this.inst.layer.viewLeft - (this.inst.width/2) - 100;
			Y = this.inst.y;
		}else if(this.closeAnimation == 5){ //SlideRight
			X = this.inst.layer.viewRight + (this.inst.width/2) + 100;
			Y = this.inst.y;
		}

		return {x:X,y:Y};
	};


	

	behinstProto.close = function ()
	{
		//console.log("%cDIALOG %d : Close","color:blue", this.inst.uid);
		//Can't be closed if: already closed or opening or closing
		if(!this.isOpen || this.tween["isPlaying"] || this.tween_close["isPlaying"]){
			return;
		}
		
		this.isOpen = false;
		
		this.runtime.trigger(cr.behaviors.aekiro_dialog.prototype.cnds.onDialogClosed, this.inst);

		if(this.overlay){
			this.overlay.visible = false;	
		}
		
		
		//**************************************
		this.proui.removeDialog(this);

		
		//**************************************	
		//None|Reverse|SlideDown|SlideUp|SlideLeft|SlideRight|ScaleDown|ScaleUp
		//*******************************************
		var target = this.getCloseTargetPosition();
		var targetX = target.x;
		var targetY = target.y;


		if(this.closeAnimDuration == 0){ //If anim duration = 0 then we set animation to "no animation", otherwise wierd bug emerge
			this.closeAnimation = 0
		}

		if(this.closeAnimation==2 || this.closeAnimation==3){ //SlideDown|SlideUp
			this.tween_close["setObject"](this.inst);
			this.tween_close["easing"](this.closeAnimTweenFunction);
			this.tween_close["to"]({ y: targetY }, this.closeAnimDuration);
		}else if(this.closeAnimation == 4 || this.closeAnimation == 5){ //SlideLeft|SlideRight
			this.tween_close["setObject"](this.inst);
			this.tween_close["easing"](this.closeAnimTweenFunction);
			this.tween_close["to"]({ x: targetX }, this.closeAnimDuration);
		}else if(this.closeAnimation == 6 || this.closeAnimation == 7){ //ScaleDown|ScaleUp
			this.tween_close["setObject"](this.inst.layer);
			this.tween_close["easing"](this.closeAnimTweenFunction);
			if(this.closeAnimation == 6){ //ScaleDown
				this.tween_close["to"]({ scale: 0.2 }, this.closeAnimDuration);
			}else{ //ScaleUp
				this.tween_close["to"]({ scale: 2 }, this.closeAnimDuration);
			}

			this.tween_opacity["setObject"](this.inst.layer);
			this.tween_opacity["to"]({ opacity: 0 }, 300);
			this.tween_opacity["easing"](TWEEN["Easing"]["Quartic"]["Out"]);
		}
		//*******************************************


		if(this.closeAnimation==1){//Reverse
			this.tween["reverse"]();
			if(this.openAnimation == 5 || this.openAnimation == 6){ //ScaleDown|ScaleUp
				this.tween_opacity["reverse"]();
			}
		}else if(this.closeAnimation==0){//None
			this.postClose();
		}else{ //SlideDown|SlideUp|SlideLeft|SlideRight|ScaleDown|ScaleUp
			this.tween_close["start"]();
			if(this.closeAnimation == 6 || this.closeAnimation == 7){ //ScaleDown|ScaleUp
				this.tween_opacity["start"]();
			}
		}

		//*******************************************
		//Play Sound
		if(this.closeSound){
			this.proui.playAudio(this.closeSound);
		}
	};

	behinstProto.postClose = function (){
		//Hide and move the dialog to top center
		cr.system_object.prototype.acts.SetLayerVisible.call(this.runtime.system,this.inst.layer,false);

		//hide any scrollview on the dialog to turnoff the Force Own Texture
		var layerInsts, self = this;
		Object.keys(this.outLayerChildren).forEach(function(key) {
			layerInsts = self.outLayerChildren[key];
			for (var i = 0, l= layerInsts.length; i < l; i++) {
				cr.system_object.prototype.acts.SetLayerVisible.call(self.runtime.system,layerInsts[i].layer,false);
			}
		});
		
		//reset scale to 1 and opacity
		this.inst.layer.scale = 1;
		this.inst.layer.opacity = 1;
		this.runtime.redraw = true;

		var targetX = (this.inst.layer.viewLeft+this.inst.layer.viewRight)/2;
		var targetY = this.inst.layer.viewTop - (this.inst.height/2) -100;
		this.inst.x = targetX;
		this.inst.y = targetY;
		this.inst.set_bbox_changed();
		this.updateChildren();

		//******************************
		if(this.pauseOnOpen){
			cr.system_object.prototype.acts.SetTimescale.call(this.runtime.system,this.prevTimescale);
		}

		//we restore dialog timescale
		if(this.runtime.timescale != 0){
			this.setDialogTimeScale(-1); //-1 indicate game time (cf RestoreObjectTimescale  in system.js)
		}
	};

	




	behinstProto.onDestroy = function ()
	{
		this.proui.removeDialog(this);
	};
	
	// called when saving the full state of the game
	behinstProto.saveToJSON = function ()
	{
		return {
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
	

	Cnds.prototype.onDialogOpened = function ()
	{
		return true;
	};
	
	Cnds.prototype.onDialogClosed = function ()
	{
		return true;
	};

	Cnds.prototype.isOpened = function ()
	{
		return this.isOpen;
	};

	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};
	
	Acts.prototype.Open = function (targetX,targetY,center)
	{
		this.open(targetX,targetY,center);
	};

	Acts.prototype.Close = function ()
	{
		this.close();
	};

	behaviorProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	

	behaviorProto.exps = new Exps();
	
}());