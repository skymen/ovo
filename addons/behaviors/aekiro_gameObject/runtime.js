// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.aekiro_gameobject2 = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.aekiro_gameobject2.prototype;
		
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

		

		if(!cr.goManager){
			var runtime = this.runtime;
			cr.goManager = {
				gos : {},
				toBeDestroyed : [],

				addGO : function(inst){
					if(!inst)return;

					if(!inst.aekiro_gameobject2.name){
						inst.aekiro_gameobject2.name = "o"+inst.uid;
					}
					/*if(!name){
						console.error("Aekiro Hierarchy: object of uid=%s has no name !",inst.uid);
						return;
					}*/
					var name = inst.aekiro_gameobject2.name;
					if(this.gos.hasOwnProperty(name)){
						console.error("Aekiro Hierarchy: GameObject already exist with name: %s !",name);
						return;
					}

					this.gos[name] = inst;
				},

				removeGO : function(name){
					delete this.gos[name];
				},

				clearDestroyList : function (){
					var toBeDestroyed = this.toBeDestroyed;
					for (var i = 0,l=toBeDestroyed.length; i < l; i++) {
						runtime.DestroyInstance(toBeDestroyed[i]);
					}
					toBeDestroyed.length = 0;
				},

				createInst : function (objtype,_layer,x,y)
				{
					var layer = (typeof _layer == "number")?this.runtime.getLayerByNumber(_layer):(typeof _layer == "string")?this.runtime.getLayerByName(_layer):_layer;
					// call system action: Create instance
					//cr.system_object.prototype.acts.CreateObject.call(runtime.system, objtype,layer,x,y);
					var inst = runtime.createInstance(objtype,layer);
					//runtime.trigger(Object.getPrototypeOf(objtype.plugin).cnds.OnCreated, inst);
					
					/*var sol = objtype.getCurrentSol();
					sol.select_all = false;
					cr.clearArray(sol.instances);
					sol.instances[0] = inst;*/
					//return objtype.getFirstPicked();
					return inst;
				},

				clone : function (t_node,parent,layer, x, y){
					cr.haltNext = true;
					var inst = this.createInst(t_node.parent.type, layer);
					cr.haltNext = false;
					
					inst.type.plugin.acts.LoadFromJsonString.call(inst,t_node.parent.json);
					inst.x = x;
					inst.y = y;
					inst.set_bbox_changed();
					inst.update_bbox();

					inst.aekiro_gameobject2.name = "";
					inst.aekiro_gameobject2.onCreateInit();

					if(parent){
						inst.aekiro_gameobject2.parentName = parent.aekiro_gameobject2.name;
					}

					for (var i = 0, l= t_node.children.length; i < l; i++) {
						this.clone(t_node.children[i], inst, layer, inst.bbox.left+t_node.children[i].parent.relX, inst.bbox.top+t_node.children[i].parent.relY);

					}

					inst.aekiro_gameobject2.init();
					return inst;
				}

			}
		}


	};
	
	var behinstProto = behaviorProto.Instance.prototype;


	behinstProto.onCreate = function()
	{
		this.goManager = cr.goManager;

		//properties
		this.name = this.properties[0];
		this.parentName = this.properties[1];
		//********************
		this.firstFrame = true;
		this.inst.aekiro_gameobject2 = this;
		this.isInit = false;
		this.areChildrenRegistred = false;
		//********************
		this.children = [];


		if(!cr.haltNext){
			this.onCreateInit();	
		}

		//********************
	};

	behinstProto.onCreateInit = function(){
		this.goManager.addGO(this.inst);
		this.local = {x:0,y:0,angle:0};
		this.inst.update_bbox();
		this.prev = {
			x : this.inst.x,
			y : this.inst.y,
			angle : this.inst.angle,
			width: this.inst.width,
			height: this.inst.height,
		};

		var set_bbox_changed_old = this.inst.set_bbox_changed;
		this.inst.set_bbox_changed_old = this.inst.set_bbox_changed;
		this.inst.set_bbox_changed = function(){
			this.aekiro_gameobject2.local_update();
			this.aekiro_gameobject2.children_update();
			set_bbox_changed_old.call(this);

			//console.log("az");
		};
	};


	behinstProto.local_update = function(){
		this.parent = this.parent_get();
		if(this.parent){
			var res = this.globalToLocal(this.inst,this.parent);
			this.local.x = res.x;
			this.local.y = res.y
			this.local.angle = res.angle;
		}
	};

	behinstProto.local_set = function(x,y,angle){
		this.parent = this.parent_get();
		if(this.parent){
			var inst = this.inst;
			//update local
			
			if(x!=undefined)this.local.x = x;
			if(y!=undefined)this.local.y = y;
			if(angle!=undefined)this.local.angle = angle;

			//update global
			inst.x = this.parent.x + this.local.x*Math.cos(this.parent.angle) - this.local.y*Math.sin(this.parent.angle);
			inst.y = this.parent.y + this.local.x*Math.sin(this.parent.angle) + this.local.y*Math.cos(this.parent.angle);	
			inst.angle = this.parent.angle + this.local.angle;	
			
			this.prev.x = inst.x;
			this.prev.y = inst.y;
			this.prev.angle = inst.angle;

			this.children_update();
			this.inst.set_bbox_changed_old();
		}
	};
	//************************

	behinstProto.children_add = function(inst){
		var name,aekiro_gameobject2;

		if (typeof inst === 'string'){ //add by child name
			name = inst;
			inst = null;
		}else{
			aekiro_gameobject2 = inst.aekiro_gameobject2;
			if(!aekiro_gameobject2){
				console.error("Aekiro GameObject: You're adding a child (uid=%s) without a gameobject behavior on it.",inst.uid);
				return;
			}
			name = inst.aekiro_gameobject2.name;
		}

		//check if gameobject is correctly registred in the gomanager
		inst = this.goManager.gos[name];
		if(!inst){
			console.error("Aekiro GameObject: Object of name : %s not found !",name);
			return;
		}

		if(name == this.parentName){
			console.error("Aekiro GameObject: Cannot add %s as a child of %s, because %s is its parent !",name,this.name,name);
			return;
		}

		if(this.children.indexOf(inst) > -1){
			console.error("Aekiro GameObject: Object %s already have a child named %s !",this.name,name);
			return;
		}

		aekiro_gameobject2 = inst.aekiro_gameobject2;
		aekiro_gameobject2.removeFromParent(); //if inst is already a child of another parent then remove it from its parent.
		aekiro_gameobject2.parentName = this.name;
		//saving local coordinate in parent space
		/*initial local.x should be computed using x of parent as it is in the editor
		we use self.prev.x instead of self.inst.x otherwise and in case of a "set x" action that happens on "on start of layout" 
		the local.x will be computed used the new value set by "set x"
		*/

		/*aekiro_gameobject2.local.x = inst.x - this.prev.x ; 
		aekiro_gameobject2.local.y = inst.y - this.prev.y ;
		aekiro_gameobject2.local.angle = inst.angle - this.prev.angle;*/
		var res = this.globalToLocal2(inst,this.prev.x,this.prev.y,this.prev.angle);
		aekiro_gameobject2.local.x = res.x;
		aekiro_gameobject2.local.y = res.y
		aekiro_gameobject2.local.angle = res.angle;
		this.children.push(inst);
	};

	behinstProto.children_remove = function(inst){
		var index = -1;
		if (typeof inst === 'string'){ //remove by child name
			for (var i = 0, l= this.children.length; i < l; i++) {
				if(this.children[i].aekiro_gameobject2.name==inst){
					index = i;
					break;
				}
			}
		}else{
			index = this.children.indexOf(inst);
		}
		
		if(index!=-1){
			this.children[index].aekiro_gameobject2.parentName = "";
			this.children[index].aekiro_gameobject2.parent = null;
			this.children.splice(index, 1);
		}
	};


	behinstProto.children_update = function ()
	{
		
		if(!this.areChildrenRegistred)
			this.registerChildren();

		this.prev.x = this.inst.x;
		this.prev.y = this.inst.y;
		this.prev.angle = this.inst.angle;

		if(!this.children.length)
			return;



		var parent_inst = this.inst;

		//computing how much the parent size have changed
		parent_inst.width = parent_inst.width==0?0.1:parent_inst.width;
		parent_inst.height = parent_inst.height==0?0.1:parent_inst.height;
		var wf = parent_inst.width/this.prev.width;
		var hf = parent_inst.height/this.prev.height;
		this.prev.width = parent_inst.width;
		this.prev.height = parent_inst.height;


		var inst, goManager = this.goManager;
		for (var i = 0, l= this.children.length; i < l; i++) {
			inst = this.children[i];
			
			if(wf!=1){
				inst.width *= wf;
				inst.aekiro_gameobject2.local.x *=wf;
				//inst.aekiro_gameobject2.prev.width = inst.width;
			}

			if(hf!=1){
				inst.height *= hf;
				inst.aekiro_gameobject2.local.y *=hf;
				//inst.aekiro_gameobject2.prev.height = inst.height;
			}
			
			//updating the child's global coordinates when the parent global coordinates changes.
			inst.x = parent_inst.x + inst.aekiro_gameobject2.local.x*Math.cos(parent_inst.angle) - inst.aekiro_gameobject2.local.y*Math.sin(parent_inst.angle);
			inst.y = parent_inst.y + inst.aekiro_gameobject2.local.x*Math.sin(parent_inst.angle) + inst.aekiro_gameobject2.local.y*Math.cos(parent_inst.angle);
			inst.angle = parent_inst.angle + inst.aekiro_gameobject2.local.angle;
			inst.aekiro_gameobject2.prev.x = inst.x;
			inst.aekiro_gameobject2.prev.y = inst.y;
			inst.aekiro_gameobject2.prev.angle = inst.angle;

			inst.set_bbox_changed_old();
			inst.aekiro_gameobject2.children_update();
		}
			
	};

	//transform local coordinates of inst in parent space to global coordinates

	behinstProto.scopeToParent = function (local,parent_inst){
		var res = {};
		res.x = parent_inst.x + local.x*Math.cos(parent_inst.angle) - local.y*Math.sin(parent_inst.angle);
		res.y = parent_inst.y + local.x*Math.sin(parent_inst.angle) + local.y*Math.cos(parent_inst.angle);
		res.angle = parent_inst.angle + local.angle;
		return res;
	};

	behinstProto.localToGlobal = function (){
		let parent = this.parent_get();
		var local = this.local;
		var res = {};
		if (!parent) {
			return {
				x: this.inst.x,
				y: this.inst.y,
				angle: this.inst.angle
			}
		}
		while (parent) {
			res.x = parent.x + local.x*Math.cos(parent.angle) - local.y*Math.sin(parent.angle);
			res.y = parent.y + local.x*Math.sin(parent.angle) + local.y*Math.cos(parent.angle);
			res.angle = parent.angle + local.angle;
			local = {
				x: res.x,
				y: res.y,
				angle: res.angle
			}
			parent = parent.aekiro_gameobject2.parent_get();
		}
		return res;
	};

	//transform global coordinates of inst to local coordinates in parent space
	behinstProto.globalToLocal = function (inst,parent_inst){
		var res = {};
		res.x = (inst.x-parent_inst.x)*Math.cos(parent_inst.angle) + (inst.y-parent_inst.y)*Math.sin(parent_inst.angle);
		res.y = -(inst.x-parent_inst.x)*Math.sin(parent_inst.angle) + (inst.y-parent_inst.y)*Math.cos(parent_inst.angle);
		res.angle = inst.angle - parent_inst.angle;
		return res;
	};

	behinstProto.globalToLocal2 = function (inst,p_x,p_y,p_angle){
		var res = {};
		res.x = (inst.x-p_x)*Math.cos(p_angle) + (inst.y-p_y)*Math.sin(p_angle);
		res.y = -(inst.x-p_x)*Math.sin(p_angle) + (inst.y-p_y)*Math.cos(p_angle);
		res.angle = inst.angle - p_angle;
		return res;
	};

	behinstProto.registerChildren = function (){
		if(this.areChildrenRegistred)
			return;

		//Finding all the children
		var gos = this.goManager.gos;
		var go;
		var self = this;
		if(this.name){
			Object.keys(gos).forEach(function(key) {
				go = gos[key];
				if(go.aekiro_gameobject2.parentName == self.name){
					self.children_add(go);
					go.aekiro_gameobject2.registerChildren();
				}
			});
		}

		this.areChildrenRegistred = true;

		//console.log(this.name);
		console.log("registerChildren");
	};

	behinstProto.init = function (){
		//console.log("init");
		if(this.isInit){
			return;
		}
		
		//**************
		this.registerChildren();
		this.children_update();
		//console.log(this.children);
		//**************
		this.isInit = true;
		this.setVisible(this.inst.visible);
	};

	behinstProto.tick = function ()
	{
		if(this.firstFrame){
			this.firstFrame = false;
			//**************	
			this.init();
		}
	};

	behinstProto.tick2 = function ()
	{
	};

	behinstProto.setVisible = function (isVisible){
		this.init();

		this.inst.type.plugin.acts.SetVisible.call(this.inst,isVisible);
		var children = this.children;
		for (var i = 0, l= children.length; i < l; i++) {
			children[i].aekiro_gameobject2.setVisible(isVisible);
		}
		//console.log(this.inst.visible);	
	};

	behinstProto.setOpacity = function (v){
		this.init();

		var SetOpacity = this.inst.type.plugin.acts.SetOpacity;
		SetOpacity.call(this.inst,v);
		var children = this.children;
		for (var i = 0, l= children.length; i < l; i++) {
			children[i].aekiro_gameobject2.setOpacity(v);
		}
		//console.log(this.inst.visible);	
	};

	
	behinstProto.getTemplate = function (node,parent,template){
		this.init();
		
		if(!node){
			node = this.inst;
		}
		
		if(!template){
			template = [];
		}

		if(parent){
			parent.update_bbox();
		}

		template.push({
			parent:{
				type: node.type,
				relX: parent?node.x - parent.bbox.left:null,
				relY: parent?node.y - parent.bbox.top:null,
				json:JSON.stringify(this.runtime.saveInstanceToJSON(node, true))
			},
			children:[]
		});
		

		var children = node.aekiro_gameobject2.children;
		for (var i = 0, l= children.length; i < l; i++) {
			this.getTemplate(children[i],node,template[template.length-1].children);
		}

		return template[0];
	};

	behinstProto.parent_get = function ()
	{
		if(!this.parent && this.parentName && this.name){
			this.parent = this.goManager.gos[this.parentName];	
		}
		return this.parent;
	};

	behinstProto.removeFromParent = function ()
	{
		this.parent = this.parent_get();
		if(this.parent){
			this.parent.aekiro_gameobject2.children_remove(this.inst);
		}
	};


	behinstProto.onDestroy = function ()
	{
		var goManager = this.goManager;
		//*****************************
		//On layout change, instances are destroyed by the engine, so no point to delete them manually
		if(!this.runtime.changelayout){
			//destroy its children
			for (var i = 0,l=this.children.length; i < l; i++) {
				goManager.toBeDestroyed.push(this.children[i]);
			}
			setTimeout(function(){ goManager.clearDestroyList(); }, 0);

			//console.log("az");
		}


		this.children.length = 0;
		goManager.removeGO(this.name);
		this.inst.set_bbox_changed = this.inst.set_bbox_changed_old;

		//remove from its parent's children list
		this.removeFromParent();
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

		var children = [];
		for (var i = 0,l=this.children.length; i < l; i++) {
			children.push(this.children[i].aekiro_gameobject2.name);
		}
		var children_str = JSON.stringify(children,null,"\t");

		var objects = [];
		Object.keys(cr.goManager.gos).forEach(function(key) {
			objects.push(key);
		});
		var objects_str = JSON.stringify(objects,null,"\t");

		propsections.push({
			"title": "Aekiro",
			"properties": [
				{
					"name":"name",
					"value": this.name,
					"readonly":true
				},
				{
					"name":"parentName",
					"value": this.parentName,
					"readonly":true
				},
				{
					"name":"children",
					"value": children_str,
					"readonly":true
				},
				{
					"name":"gameobjects",
					"value": objects_str,
					"readonly":true
				}
			]
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

	Cnds.prototype.IsName = function (name){
		return (name == this.name);
	};

	Cnds.prototype.IsParent = function (name){
		return (name == this.parentName);
	};

	Cnds.prototype.OnCloned = function ()
	{
		return true;
	};
	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};
	
	Acts.prototype.Clone = function (layer,x,y)
	{
		var template = [];
		template = this.getTemplate(this.inst);
		//console.log(template);
		var inst = this.goManager.clone(template,null,layer,x,y);
		// Pick just this instance
		this.runtime.trigger(cr.behaviors.aekiro_gameobject2.prototype.cnds.OnCloned, inst);
		/*var sol = inst.type.getCurrentSol();
		sol.select_all = false;
		cr.clearArray(sol.instances);
		sol.instances[0] = inst;*/
		
	};

	Acts.prototype.SetVisible = function (isVisible)
	{
		this.setVisible(isVisible);
	};

	Acts.prototype.SetOpacity = function (v)
	{
		this.setOpacity(v);
	};

	Acts.prototype.AddChildrenFromLayer = function (_layer)
	{
		this.init();
		var layer = (typeof _layer == "number")?this.runtime.getLayerByNumber(_layer):(typeof _layer == "string")?this.runtime.getLayerByName(_layer):_layer;
		var inst, name;
		for (var i = 0, l= layer.instances.length; i < l; i++) {
			this.children_add(layer.instances[i]);
		}
	};

	Acts.prototype.AddChildrenFromType = function (type)
	{
		if (!type)
			return;
			
		var instances = type.getCurrentSol().getObjects();
		for (var i = 0, l= instances.length; i < l; i++) {
			//console.log(instances[i]);
			this.children_add(instances[i]);
		}

	};

	Acts.prototype.AddChildByName = function (name)
	{	
		this.children_add(name);
	};

	Acts.prototype.SetLocalPosition = function (x,y)
	{
		this.local_set(x,y);
	};

	Acts.prototype.SetLocal = function (prop,value)
	{	
		if(prop==0){
			this.local_set(value);//x
		}else if(prop==1){
			this.local_set(null,value);//y
		}else if(prop==2){
			this.local_set(null,null,value);//angle
		}
	};

	Acts.prototype.RemoveChildByName = function (name)
	{
		this.children_remove(name);
	};

	Acts.prototype.RemoveChildByType = function (type)
	{
		if (!type)
			return;
			
		var instances = type.getCurrentSol().getObjects();
		for (var i = 0, l= instances.length; i < l; i++) {
			//console.log(instances[i]);
			this.children_remove(instances[i]);
		}
	};

	Acts.prototype.RemoveFromParent = function ()
	{
		this.removeFromParent();
	};



	behaviorProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};

	Exps.prototype.name = function (ret)
	{
		ret.set_string(this.name);
	};

	Exps.prototype.parent = function (ret)
	{
		ret.set_string(this.parentName);
	};

	Exps.prototype.local = function (ret,prop)
	{
		if(!this.parent_get()){
			ret.set_float(0);
		}else{
			if(prop=="x"){
				ret.set_float(this.local.x);
			}else if(prop=="y"){
				ret.set_float(this.local.y);
			}else if(prop=="angle"){
				ret.set_float(this.local.angle);
			}else{
				ret.set_float(0);	
			}
		}
	};
	Exps.prototype.global = function (ret,prop)
	{
		var parent = this.parent_get();
		if(!parent){
			if(prop === "x") {
				ret.set_float(this.inst.x);
			} else if(prop === "y") {
				ret.set_float(this.inst.y);
			} else if(prop === "angle") {
				ret.set_float(this.inst.angle);
			} else {
				ret.set_float(0);
			}
		}else{
			let global = this.localToGlobal();
			if(prop === "x") {
				ret.set_float(global.x);
			} else if(prop === "y") {
				ret.set_float(global.y);
			} else if(prop === "angle") {
				ret.set_float(global.angle);
			} else {
				ret.set_float(0);
			}
		}
	};
	behaviorProto.exps = new Exps();
}());