// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////mmss
// Behavior class
cr.behaviors.aekiro_gridView = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.aekiro_gridView.prototype;
		
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
		this.proui.isTypeValid(this.inst,[cr.plugins_.Sprite,cr.plugins_.NinePatch,cr.plugins_.TiledBg],"ProUI-GRIDVIEW: GridView behavior is only applicable to Sprite Or 9-patch objects.");
		//properties
		this.itemUID = this.properties[0];
		this.columns = this.properties[1];
		this.rows = this.properties[2];
		this.vspace = this.properties[3];
		this.hspace = this.properties[4];
		this.VPadding  = this.properties[5];
		this.HPadding = this.properties[6];
		this.dialogUID = this.properties[7];
		//*********************************
		this.firstFrame = true;
		this.inst.uiType = "gridView";
		this.uiType = "gridView";
		this.inst._proui = this;
		this.dpos = {};

		//*********************************
		this.template = {};
		this.isTemplateSet = false;

		this.value = [];
		this.items = [];
		this.isViewBuilt = false;
		this.it_column = 0; //column iterator
		this.it_row = 0; //row iterator
		this.firstUpdateView = false;

		//reference to a scrollview when the gridview is on a scrollview
		this.scrollView = null;
		this.isScrollViewInit = false;

		//*********************************
		this.triggerRenderTickCt = 0;
		this.triggerRenderTickMax = 4;

	};


	behinstProto.updateFromModel = function (){
		var modelB = this.inst.proui_model;
		if(modelB){
			var value = modelB.getFromModel();
			if(value == null){
				return;
			}
			
			if(!isArray(value)){
				console.error("ProUI-GRIDVIEW: The value at the key %s of the model of uid= %s, is not an array !",modelB.modelKey,modelB.modelUID);
				return;
			}

			this.value = value;
		}
	};


	behinstProto._setValue = function (value, options){
		//console.log("%cGRIDVIEW %d : Set value to %O","color:blue", this.inst.uid, this.value);
		if(value == null){
			value = [];
		}
		if(!isArray(value)){
			var modelB = this.inst.proui_model;
			console.error("ProUI-GRIDVIEW: The value at the key %s of the model of uid= %s, is not an array !",modelB.modelKey,modelB.modelUID);
			return;
		}
		this.value = value;
		this.updateView(options);
	};


	behinstProto.setItemTemplate = function (){

		if(this.isTemplateSet){
			return;
		}
		this.setTemplateVisible(true);

		//**************************************
		var item = this.proui.tags[this.itemUID];
		if(!item){
			throw new Error("ProUI-GRIDVIEW: Grid item not found, please check gridItem uid");
			return;
		}

		this.proui.isTypeValid(item,[cr.plugins_.Sprite,cr.plugins_.NinePatch,cr.plugins_.TiledBg],"ProUI-GRIDVIEW: Grid item can only be a Sprite Or 9-patch object.");
		//**************************************

		item.uiType = "gridItem";
		item.update_bbox();
		this.template.item = {};
		this.template.item.type = item.type;
		this.template.item.width = item.width;
		this.template.item.height = item.height;
		this.template.item.uiType = "gridItem";
		this.template.item.offsetX  = item.x - item.bbox.left;
		this.template.item.offsetY = item.y - item.bbox.top;
		this.template.item.json = JSON.stringify(this.runtime.saveInstanceToJSON(item, true));
		
		this.template.subs = []; //subitems
		var inst, inst_template;

		/* on firstframe the gridview update its view. the issue is that setTemplate might happens before the sliderbar set the slider button
		with isSubComp == true and then get saved in the template.
		*/
		for (var i = 0, l= this.inst.layer.instances.length; i < l; i++) {
			inst = this.inst.layer.instances[i];
			if (inst.uiType == "discreteProgress" || inst.uiType == "sliderbar" || inst.uiType == "progress" || inst.uiType == "scrollView"){
				inst._proui.init();
			}
		}

		for (var i = 0, l= this.inst.layer.instances.length; i < l; i++) {
			inst = this.inst.layer.instances[i];
			if ( inst.uiType == "gridView" || inst.uiType == "gridItem" || inst.uiType == "dialog" || inst.uiType == "scrollView" || inst.uiType == "radiobutton" || inst.uiType == "scrollBar" || inst.uiType == "slider")
				continue;

			//sub components are not part of the template
			if(inst.isSubComp === true){
				continue;
			}

			//*********If the subitem is a composed object
			inst_template = null;
			if(inst.uiType == "radiogroup" || inst.uiType == "discreteProgress" || inst.uiType == "sliderbar"){
				inst_template = inst._proui.getTemplate();
				//console.log(inst_template );
			}


			//*************************************

			this.template.subs.push({
				type : inst.type,
				relX: inst.x - item.bbox.left,
				relY: inst.y - item.bbox.top,
				json: JSON.stringify(this.runtime.saveInstanceToJSON(inst, true)),
				bindkey: inst.proui_bind?inst.proui_bind.bind_key:"",
				template: inst_template
			});


		}
		//console.log(this.template);

		this.isTemplateSet = true;

		//************************************
		for (var i = 0, l= this.inst.layer.instances.length; i < l; i++) {
			inst = this.inst.layer.instances[i];
			if ( inst.uiType == "gridView" || inst.uiType == "dialog" || inst.uiType == "scrollView" || inst.uiType == "radiobutton" || inst.uiType == "scrollBar" || inst.uiType == "slider" || inst.isSubComp === true)
				continue;
			this.runtime.DestroyInstance(inst);
		}

	};



	behinstProto.initScrollView = function (){
		if(this.isScrollViewInit){
			return;
		}
		var inst;
		for (var i = 0, l= this.inst.layer.instances.length; i < l; i++) {
			inst = this.inst.layer.instances[i];
			if ( inst.uiType == "scrollView"){
				inst._proui.init();
				this.isScrollViewInit = true;
				return;
			}
		}
		
	};


	behinstProto.updateView = function (options){
		if(this.rows<=0 && this.columns<=0){
			console.error("ProUI-GRIDVIEW: max rows and max columns can't be both -1 or 0");
			return;
		}

		

		//when the gridview is on a scrollview, we makesure the scrollview is initialised first otherwise bugs
		this.initScrollView();

		this.setItemTemplate();

		//save current position
		this.inst.update_bbox();
		this.initBboxTop = this.inst.bbox.top;
		this.initBboxLeft = this.inst.bbox.left;
		

		if(this.value.length == 0){
			this.clear();
		}else if(options.op == 2){ //load
			this.build();
		}else if(options.op == 1){//push
			//Since we fill the grid row by row, we can't add anymore once we reach the max row
			if(this.rows>0 && this.columns>0 && this.it_row==this.rows){
				return;
			}
			this.add(this.value.length-1);
			this.nextRowColumn();
			this.resize();
		}else if(options.op == -1){ //remove
			this.remove(options.idx);
		}else if(options.op == 3){ //insert
			this.build();
		}else if(options.op == 4){ //edit
			this.edit(options.key,options.value);
		}

		this.dpos.prev_x = this.inst.x;
		this.dpos.prev_y = this.inst.y;
		this.dpos.dx = 0;
		this.dpos.dy = 0;

		//*************************
		if(this.scrollView){
			//after each view update, and if the gridview is on a scrollview, the scrollbars and sliders need to be on top
			this.scrollView.postGridviewUpdate();
		}
		
		if(this.firstUpdateView){
			//this.triggerRenderTickCt = 1;
			this.runtime.trigger(cr.behaviors.aekiro_gridView.prototype.cnds.OnRender, this.inst);	
		}
		this.firstUpdateView = true;
		
	};


	behinstProto.edit = function (key,value){
		//eg: key = coinlist.2.coinValue
		var modelB = this.inst.proui_model;
		var modelKey = modelB.modelKey;
		var itemIndex = 0;
		var subKey;

		if(key.slice(0, modelKey.length+1) == (modelKey+".") ){ //make sure that key is a subkey of this.modelKey and not the opposite
			var keys = key.slice(modelKey.length+1);//extract the part after the modelkey (0.coinValue)
			var keysArray = keys.split(".");
			if(keysArray.length>1){
				itemIndex = keysArray[0];
				subKey = keys.slice(itemIndex.length+1);				

				//console.log(itemIndex+"***"+subItemKey+"****"+value);
				var item = this.items[itemIndex];
				if(!item){
					return;
				}

				for (var j = 0,m=item.subs.length; j < m; j++) {
					var subItem = item.subs[j];
					if(subItem.proui_bind && subItem.proui_bind.bind_key == subKey){
						subItem.proui_bind.setValue(value);
					}
				}
			}
			
		}

	};


	behinstProto.clear = function (){
		//console.log("%cGRIDVIEW %d : Clear","color:blue", this.inst.uid);
		for (var i = 0,l=this.items.length; i < l; i++) {
			this.runtime.DestroyInstance(this.items[i].parent);
			for (var j = 0,m=this.items[i].subs.length; j < m; j++) {
				this.runtime.DestroyInstance(this.items[i].subs[j]);
			}
		}
		this.items.length = 0;
		this.it_column = 0; //column iterator
		this.it_row = 0; //row iterator

		//Resizing and repositioning
		this.inst.width = 5;
		this.inst.height = 5;
		this.inst.set_bbox_changed();
		this.inst.update_bbox();
		this.inst.x = this.initBboxLeft + (this.inst.x-this.inst.bbox.left);
		this.inst.y = this.initBboxTop + (this.inst.y-this.inst.bbox.top);
		this.inst.set_bbox_changed();
	};
	


	behinstProto.resize = function (){
		//console.log("%cGRIDVIEW %d : Content Resize","color:blue", this.inst.uid);
		var row = Math.ceil(this.value.length/this.columns);
		var column = Math.ceil(this.value.length/this.rows);
		
		if(this.rows<0){
			column = this.columns;
			if(this.value.length<this.columns){
				column = this.value.length;
			}
		}else if(this.columns<0){
			row = this.rows;
			if(this.value.length<this.rows){
				row = this.value.length;
			}
		}else{
			column = this.columns;
			row = this.rows;
		}

		//save current position
		this.inst.update_bbox();
		var prevBboxTop = this.inst.bbox.top;
		var prevBboxLeft = this.inst.bbox.left;

		//Resizing and repositioning
		this.inst.width = this.template.item.width*column+this.vspace*(column-1)+2*this.HPadding;
		this.inst.height = this.template.item.height*row+this.hspace*(row-1)+2*this.VPadding;

		
		this.inst.set_bbox_changed();
		this.inst.update_bbox();
		this.inst.x = prevBboxLeft + (this.inst.x-this.inst.bbox.left);
		this.inst.y = prevBboxTop + (this.inst.y-this.inst.bbox.top);
		this.inst.set_bbox_changed();
		//prevent the scrollview to update the children in tick2() because position have changed
		if(this.scrollView){
			this.scrollView.contentDpos.prev_x = this.inst.x;
			this.scrollView.contentDpos.prev_y = this.inst.y;
		}
	};


	behinstProto.build = function (){

		//grid has been built before and items count havent change, so no need to rebuilt but only remap data.
		if(this.items.length!=0 && this.value.length == this.items.length){
			//console.log("%cGRIDVIEW %d : Already built, only mapping data.","color:blue", this.inst.uid);
			for (var itemIndex = 0; itemIndex < this.value.length; itemIndex++) {
				this.mapData(itemIndex);
			}
		}else{
			this.clear();
			//console.log("%cGRIDVIEW %d : Build","color:blue", this.inst.uid);
			
			for (var itemIndex = 0; itemIndex < this.value.length; itemIndex++) {
				this.add(itemIndex);
				if(!this.nextRowColumn()){
					break;
				}
			}
			this.resize();		
		}


	};

	behinstProto.mapData = function (itemIndex){
		//console.log("%cGRIDVIEW %d : Add item %d","color:blue", this.inst.uid,itemIndex);
		//Creating the item
		var item = this.items[itemIndex];
		
		//Creating sub-items
		var subItem, temp_subItem;
		for (var k = 0,l=item.subs.length; k < l; k++) {
			temp_subItem = this.template.subs[k];
			subItem = item.subs[k];

			//******************************************************
			if(subItem.proui_bind && isObject(this.value[itemIndex])){
				var temp_subItemKey = temp_subItem.bindkey;
				
				if(temp_subItemKey){
					//Assigning a value to the subitem
					var subItemValue = getValueByKeyString(this.value[itemIndex],temp_subItemKey);
					if(subItemValue!= undefined){
						//console.log(subItemValue+"***"+temp_subItemKey);
						subItem.proui_bind.setValue(subItemValue);
					}
				}
			}

		}
	};



	behinstProto.add = function (itemIndex){
		//console.log("%cGRIDVIEW %d : Add item %d","color:blue", this.inst.uid,itemIndex);
		var item;
		var modelB = this.inst.proui_model;

		this.inst.update_bbox();


		//Pro ui behaviors get registred to their respective models on creation, we don't want that for grid items.
		this.runtime.extra.notRegister = true;
		
		//Creating the item
		item = this.runtime.createInstance(this.template.item.type, this.inst.layer);
		this.template.item.type.plugin.acts.LoadFromJsonString.call(item,this.template.item.json);
		item.x = this.inst.bbox.left + this.template.item.offsetX + (this.vspace+item.width)*this.it_column + this.HPadding;
		item.y = this.inst.bbox.top + this.template.item.offsetY + (this.hspace+item.height)*this.it_row + this.VPadding;
		item.set_bbox_changed();
		item.update_bbox();		
		this.items.push({parent:item,subs:[]});

		if(item.proui_bind){
			//assigning an index, that is retrieved via an expression
			item.proui_bind.index = itemIndex;
		}
		
		//Creating sub-items
		var subItem, temp_subItem;
		for (var k = 0,l=this.template.subs.length; k < l; k++) {
			temp_subItem = this.template.subs[k];
			
			subItem = this.runtime.createInstance(temp_subItem.type, this.inst.layer);
			temp_subItem.type.plugin.acts.LoadFromJsonString.call(subItem,temp_subItem.json);

			subItem.x = item.bbox.left + temp_subItem.relX;
			subItem.y = item.bbox.top + temp_subItem.relY;
			subItem.set_bbox_changed();

			if(subItem.type.plugin.acts.SetEffect){
				subItem.type.plugin.acts.SetEffect.call(subItem,9);	
			}
			
			if(subItem.proui_model){
				subItem.proui_model.modelUID = null;
				subItem.proui_model.modelKey = null;
			}


			if(subItem._proui){
				//subItem._proui.modelUID = 0;
				//subItem._proui.model = null;
				subItem._proui.isValidModel = false;
				
				if(subItem._proui.compParent != undefined){
					subItem._proui.compParent = this; //cf checkbox	
				}
			}
			
			this.items[itemIndex].subs.push(subItem);
			//******************************************************

			//when subitems are composed objects
			if(subItem.uiType == "radiogroup" || subItem.uiType == "discreteProgress" || subItem.uiType == "sliderbar"){
				subItem._proui.clone(temp_subItem.template);
			}

			//******************************************************
			//mapping subitem with data
			var temp_subItemKey, subItemValue;
			if(subItem.proui_bind && isObject(this.value[itemIndex])){
				temp_subItemKey = temp_subItem.bindkey;
				
				if(temp_subItemKey){
					//For input elements
					if(subItem.uiType == "checkbox" || subItem.uiType == "radiogroup" || subItem.uiType == "sliderbar"){
						//console.log(subItem._proui.modelKey);
						subItem.proui_bind.deepKey = modelB.modelKey+"."+itemIndex+"."+temp_subItemKey;
						subItem.proui_bind.model = modelB.model;
					}

					//Assigning a value to the subitem
					subItemValue = getValueByKeyString(this.value[itemIndex],temp_subItemKey);
					if(subItemValue!= undefined){
						//console.log(subItemValue+"***"+temp_subItemKey);
						subItem.proui_bind.setValue(subItemValue);
					}
				}

				//assigning an index, that is retrieved via an expression
				subItem.proui_bind.index = itemIndex;
				
			}
			//******************************************************
		}

		this.runtime.extra.notRegister = false;
	};

	behinstProto.nextRowColumn = function (){
		if(this.rows<0){
			this.it_column++;
			if(this.it_column == this.columns){
				this.it_column = 0;
				this.it_row++;
			}
		}else if(this.columns<0){
			this.it_row++;
			if(this.it_row == this.rows){
				this.it_row = 0;
				this.it_column++;
			}
		}else{
			this.it_column++;
			if(this.it_column == this.columns){
				this.it_column = 0;
				this.it_row++;
			}
			if(this.it_row  == this.rows)
				return false;
		}

		return true;
	};

	behinstProto.previousRowColumn = function (){
		if(this.rows<0){
			this.it_column--;
			if(this.it_column < 0){
				this.it_column = this.columns-1;
				this.it_row--;
			}
		}else if(this.columns<0){
			this.it_row--;
			if(this.it_row < 0){
				this.it_row = this.rows-1;
				this.it_column--;
			}
		}else{
			this.it_column--;
			if(this.it_column < 0){
				this.it_column = this.columns-1;
				this.it_row--;
			}
			if(this.it_row == 0)
				return false;
		}

		return true;
	};

	behinstProto.remove = function (itemIndex){
		//console.log("%cGRIDVIEW %d : Remove item %d","color:blue", this.inst.uid,itemIndex);
		
		var prev_x, prev_y, temp_x, temp_y, subItem, temp_subItem,temp_subItemKey, parent;
		var modelB = this.inst.proui_model;

		for (var i = itemIndex, l=this.items.length; i < l; i++) {
			parent = this.items[i].parent;
			//Destroying the item itemIndex
			if(i == itemIndex){
				prev_x = parent.x;
				prev_y = parent.y;
				this.runtime.DestroyInstance(parent);
				for (var j = 0,m=this.items[i].subs.length; j < m; j++) {
					this.runtime.DestroyInstance(this.items[i].subs[j]);
				}

			}else{
				//reposition following items
				temp_x = parent.x;
				temp_y = parent.y;
				parent.x = prev_x;
				parent.y = prev_y;
				prev_x = temp_x;
				prev_y = temp_y;
				parent.set_bbox_changed();
				parent.update_bbox();

				for (var j = 0,m=this.items[i].subs.length; j < m; j++) {
					temp_subItem = this.template.subs[j];
					subItem = this.items[i].subs[j];
					subItem.x = parent.bbox.left + temp_subItem.relX;
					subItem.y = parent.bbox.top + temp_subItem.relY;
					subItem.set_bbox_changed();

					//************************************************

					
					if( subItem.proui_bind && isObject(this.value[itemIndex])){
						//Reindexing
						//subItem._proui.index--;
						subItem.proui_bind.index--;

						temp_subItemKey = temp_subItem.bindkey;
						if(temp_subItemKey){
							//used at edit()
							//subItem._proui.subKey = temp_subItemKey; 

							if(subItem.uiType == "checkbox" || subItem.uiType == "radiogroup" || subItem.uiType == "sliderbar"){
								//Re-keying
								//subItem._proui.modelKey = this.modelKey+"."+subItem._proui.index+"."+temp_subItemKey;
								subItem.proui_bind.deepKey = modelB.modelKey+"."+subItem.proui_bind.index+"."+temp_subItemKey;
							}
						}
					}

					//************************************************


				}
			}

		}

		this.items.splice(itemIndex, 1);
		this.previousRowColumn();
		this.resize();


		
		if(this.rows>0 && this.columns>0){
			var itemsCount = this.rows * this.columns;
			if(this.value.length>=itemsCount){
				this.add(itemsCount-1);
				this.nextRowColumn();
				this.resize();
			}
		}


	};

	behinstProto.setTemplateVisible = function (isVisible){
		if(this.isTemplateSet)
			return;

		
		var inst;
		/* on firstframe the gridview update its view. the issue is that setTemplate might happens before the sliderbar set the slider button
		with isSubComp == true and then get saved in the template.
		*/
		for (var i = 0, l= this.inst.layer.instances.length; i < l; i++) {
			inst = this.inst.layer.instances[i];
			if (inst.uiType == "discreteProgress" || inst.uiType == "sliderbar" || inst.uiType == "progress" || inst.uiType == "scrollView"){
				inst._proui.init();
			}
		}

		
		/*for (var i = 0, l= this.inst.layer.instances.length; i < l; i++) {
			inst = this.inst.layer.instances[i];
			if ( inst && (inst.uiType == "gridView" || inst.uiType == "dialog" || inst.uiType == "scrollView" || inst.uiType == "scrollBar" || inst.uiType == "slider") )
				continue;
			inst.visible = isVisible;
		}*/
		
	};


	behinstProto.tick = function ()
	{
		if(this.firstFrame){
			this.firstFrame = false;
			this.setTemplateVisible(false);

			//If the scrollview is on a dialog, then we add its reference to the dialog so that the dialog move it
			var dialog = this.proui.tags[this.dialogUID];
			if(dialog && (dialog.uiType == "dialog") && dialog._proui){

				if(!dialog._proui.outLayerChildren[this.inst.layer.name]){
					dialog._proui.outLayerChildren[this.inst.layer.name] = [];
				}
				dialog._proui.outLayerChildren[this.inst.layer.name].push(this.inst);
			}

			//**********************
			this.dpos.prev_x = this.inst.x;
			this.dpos.prev_y = this.inst.y;
			this.dpos.dx = 0;
			this.dpos.dy = 0;
			//****************************
			//if(!this.firstSetValue){
				this.updateFromModel();	
			//}

			//****************************
			if(!this.firstUpdateView){
				this.updateView({op:2});	
			}
			//****************************

				
		}


		/*if(this.triggerRenderTickCt != 0){
			this.triggerRenderTickCt++;
			if(this.triggerRenderTickCt == this.triggerRenderTickMax){
				this.triggerRenderTickCt = 0;
				this.runtime.trigger(cr.behaviors.aekiro_gridView.prototype.cnds.OnRender, this.inst);
				console.log("trigger render");
			}
				
		}*/

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


		var inst;
		if( (this.dpos.dx != 0) || (this.dpos.dy != 0) ){
			for (var i = 0, l= this.inst.layer.instances.length; i < l; i++) {
				inst = this.inst.layer.instances[i];
				if ( inst.isSubComp===true || (inst.uiType == "gridView") || (inst.uiType == "dialog") || (inst.uiType == "scrollView") || (inst.uiType == "scrollBar") || (inst.uiType == "slider"))
					continue;
				inst.x += this.dpos.dx;
				inst.y += this.dpos.dy;
				inst.set_bbox_changed();
			}
		}
	};


	behinstProto.tick2 = function ()
	{
		this.updateChildren();
	};




	behinstProto.onDestroy = function ()
	{
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
			"properties": [
				{"name": "My property", "value": this.myProperty}
			]
		});
	};
	
	behinstProto.onDebugValueEdited = function (header, name, value)
	{
		if (name === "My property")
			this.myProperty = value;
	};
	/**END-PREVIEWONLY**/


	//Utilities

	var isObject = function(a) {
    	return (!!a) && (a.constructor === Object);
	};

	var isArray = function(a) {
    	return (!!a) && (a.constructor === Array);
	};

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

	Cnds.prototype.OnRender = function (){
		return true;
	};
	
	
	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};
	
	behaviorProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	

	behaviorProto.exps = new Exps();
	
}());