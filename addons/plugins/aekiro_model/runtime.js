// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.aekiro_model = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.aekiro_model.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	
	var typeProto = pluginProto.Type.prototype;

	typeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	instanceProto.onCreate = function()
	{
		//properties
		this.tag = this.properties[0];
		this.lang_root = this.properties[1];
		//*******************************
		this.hashtable = {};
		this.currentEntry = this.hashtable;//??

		//Expressions
		this.exp_CurKey = "";
		this.exp_CurValue = 0;
		this.exp_Loopindex = 0;


		//*****************
		this.uiType = "model";
		//*****************
		this.linkedBehaviors = [];
		this.linkedBehaviors_lastResetTick = 0;

		this.linkedLabels = [];
		this.linkedLabels_lastResetTick = 0;
		//*****************
		this.lang_code ="";
		this.hashtable = {};
		//************************

		if(this.tag){
			if(!cr.proui){
				throw new Error("ProUI Plugin not found. Please add it to the project.");
				return;
			}
			cr.proui.addTag(this.tag,this);
		}
		
		//************************

		this.proui = cr.proui;
		this.model_plugin = cr.plugins_.aekiro_model.prototype;
		var self = this;
		window["aekiro_model_value_set"] = function (model_tag,key,value)
		{
			var model_inst = self.proui.tags[model_tag];
			self.model_plugin.acts.SetValueByKeyString.call(model_inst, key, value);
		};

		window["aekiro_model_json_set"] = function (model_tag,key,value)
		{
			var model_inst = self.proui.tags[model_tag];
			self.model_plugin.acts.SetJSONByKeyString.call(model_inst, key, value);
		};

		window["aekiro_model"] = function (model_tag,action_name,params)
		{
			var model_inst = self.proui.tags[model_tag];
			self.model_plugin.acts[action_name].apply(model_inst,params);
		};
	};

	instanceProto.registerBehavior = function(behavior){
		if(!this.runtime.extra.notRegister){
			if(this.runtime.changelayout && this.linkedBehaviors_lastResetTick != this.runtime.tickcount){
				//console.log("*** Reseting linkedBehaviors of Model this.tag ***");
				//console.log(this.runtime.tickcount+"mmmmmmmmmmmm");
				this.linkedBehaviors.length = 0;
				this.linkedBehaviors_lastResetTick = this.runtime.tickcount;
			}
			this.linkedBehaviors.push(behavior);
		}
	};


	instanceProto.registerLabel = function(behavior){
		if(!this.runtime.extra.notRegister){
			if(this.runtime.changelayout && this.linkedLabels_lastResetTick != this.runtime.tickcount){
				//console.log("*** Reseting linkedBehaviors of Model this.tag ***");
				this.linkedLabels.length = 0;
				this.linkedLabels_lastResetTick = this.runtime.tickcount;
			}
			this.linkedLabels.push(behavior);
		}
	};

	instanceProto.unregisterBehavior = function(behavior){
		this.removeFromArray(this.linkedBehaviors,behavior);
	};

	instanceProto.unregisterLabel = function(behavior){
		this.removeFromArray(this.linkedLabels,behavior);
	};

	instanceProto.removeFromArray = function(array,e){
		for (var i = 0,l=array.length; i < l; i++) {
			if(array[i] == e){
				array.splice(i, 1);
				return;
			}
		}
	};



	instanceProto.notifyBehaviorModels = function(key, options)
	{
		//console.log("notifyBehaviorModels "+key);
		var except = null;
		if(options){
			except = options.except;
		}

		var behaviors  = this.linkedBehaviors;
		if(!behaviors.length) return;

		for (var i = 0,l = behaviors.length; i < l; i++) {
			if(behaviors[i] == except){
				console.log("except :"+except.inst.uid);
				continue;
			}

			if(key=="root" || behaviors[i].modelKey=="root" || doKeysMatch(behaviors[i].modelKey,key)){
				//console.log("%cMODEL: key %s has changed. Behavior %d linked via key %s is notified","color:blue", key, behaviors[i].inst.uid,behaviors[i].modelKey||"root");
				behaviors[i].setElementValue(this.getValue(behaviors[i].modelKey),options);
			}
		}

	};


	instanceProto.updateLabels = function(){
		var behaviors  = this.linkedLabels;
		if(!behaviors) return;
		var value;
		var prefix;

		if(!this.lang_root){
			prefix = this.lang_code;
		}else{
			prefix = this.lang_root+"."+this.lang_code;
		}

		value = this.getValue(prefix);

		if(!value){
			return;
		}

		for (var i = 0,l = behaviors.length; i < l; i++) {
			//console.log(prefix+"."+behaviors[i].modelKey);
			value = this.getValue(prefix+"."+behaviors[i].modelKey);
			//console.log("*******"+value);
			if(value!=undefined){

				behaviors[i]._setValue(value);
			}
		}
	};

	instanceProto.getLocalisedLabel = function(key){
		var value;
		var prefix;

		if(!this.lang_root){
			prefix = this.lang_code;
		}else{
			prefix = this.lang_root+"."+this.lang_code;
		}


		value = this.getValue(prefix+"."+key);

		return value;

	};


	function doKeysMatch(k1,k2){
		if( (k1==null) || (k2==null)){
			return false;
		}
		if(k1==k2){
			return true;
		}
		if(k1.slice(0, k2.length+1) == (k2+".") ){ //k2 a parent of k1
			return true;
		}
		if(k2.slice(0, k1.length+1) == (k1+".") ){
			return true;
		}
		return false;
	};
	
	instanceProto.cleanAll = function()
	{
		var key;
		for (key in this.hashtable)
			delete this.hashtable[key];
		this.currentEntry = this.hashtable;
	}; 
	

	//get the reference at the path defined by "keys"
	//If a key doesnt exist, it will create an empty object at it
	instanceProto.getEntry = function(keys, root)
	{
		var entry = root || this.hashtable;
		//when key is an empty string it means root
		if (!keys || keys === "" || keys == "root" || keys.length == 0)
		{
			return entry;
		}

		//Keys can be either a string ("k1.k2") or an array of keys
		if (typeof (keys) === "string"){
			keys = keys.split(".");
		}
		
		var key;
		for (var i=0,l=keys.length; i< l; i++)
		{
			key = keys[i];

			if(isArray(entry)){
				var index = parseInt(key);
				if(index < 0 || index >= entry.length){
					console.error("MODEL %s: setting item %s while array only have %s !",this.uid,index,entry.length);
					throw "err";
					return;
				}
			}

			/*
			if entry[key] is not array or an object (typeof(entry[key]) != "object")
			and since typeof(null)= "object" we had to add it in the condition
			*/
			if ( entry[key] == null || typeof(entry[key]) != "object"){
				entry[key] = {};
			}
			
			entry = entry[key];
		}

		
		return entry;
	};


	instanceProto.getValue = function(keys, root)
	{
		var entry = root || this.hashtable;
		
		if (!keys || keys === "" || keys == "root"|| keys.length == 0)
		{
			return entry;
		}

		if (typeof (keys) === "string"){
			keys = keys.split(".");
		}
		
		var key;
		for (var i=0,l=keys.length; i< l; i++)
		{
			key = keys[i]; 
			if (entry.hasOwnProperty(key)){
				entry = entry[key];
			}else{
				return;
			}
		}
		return entry;
	};



	/*
	keys=""
	keys is an object/array
	keys is a simple value
	keys is a.b... where b dosent exist and a is a simple value
	a.b.c

	*/

	//coinlist.3.a  item 2 and 3 do not exist
	
	instanceProto.setValue = function(keys, value, root)
	{
		//we want to set the root
		if (keys === "" || keys.length === 0)
		{
			//only objects (objects and arrays) can be set to root
			if (value !== null && typeof(value) === "object")
			{
				if (root == null){
					this.hashtable = value;
				}else{
					root = value;
				}
			}
		}
		else
		{
			if (root == null){
				root = this.hashtable;
			}

			if (typeof (keys) === "string"){
				keys = keys.split(".");
			}
			
			var lastKey = keys.pop();
			try{
				var entry = this.getEntry(keys, root);	
			}catch(error){
				throw "err";
				return;
			}
			

			if(isArray(entry)){
				var index = parseInt(lastKey);
				if(index < 0 || index >= entry.length){
					console.error("MODEL %s: setting item %s while array only have %s !",this.uid,index,entry.length);
					return;
				}
			}

			entry[lastKey] = value;
		}
	};
	

	
	instanceProto.removeKey = function (keys)
	{
		if ((keys === "") || (keys.length === 0))
		{
			this.cleanAll();
		}
		else
		{
			if (typeof (keys) === "string")
				keys = keys.split(".");
			
			var data = this.getValue(keys);
			if (data === undefined)
				return;
			
			var lastKey = keys.pop();
			var entry = this.getEntry(keys);
			
			if (!isArray(entry))
			{
				delete entry[lastKey];
			}
			else
			{
				if ((lastKey < 0) || (lastKey >= entry.length))
					return;
				else if (lastKey === (entry.length-1))
					entry.pop();
				else if (lastKey === 0)
					entry.shift();
				else
					entry.splice(lastKey, 1);
			}
		}
	};
	
	var getItemsCount = function (o)
	{
		if (o == null)// nothing
			return (-1);
		else if ((typeof o == "number") || (typeof o == "string"))// number/string
			return 0;
		else if (o.length != null)// list
			return o.length;
			
		// hash table
		var key,cnt=0;
		for (key in o)
			cnt += 1;
		return cnt;
	};
	
	var din = function (d, default_value)
	{
		var o;
		if (d === true)
			o = 1;
		else if (d === false)
			o = 0;
		else if ((d == null) || (d==undefined))
		{
			if ( (default_value != null) && (default_value != undefined) )
				o = default_value;
			else
				o = 0;
		}
		else if (typeof(d) == "object")
			o = JSON.stringify(d);
		else
			o = d;
		return o;
	};

	var isArray = function(o)
	{
		return (o instanceof Array);
	};

	var isObject = function(val) {
	    if (val === null) { return false;}
	    return ( (typeof val === 'function') || (typeof val === 'object') );
	}

	function isObjectEmpty(obj) {
	    for(var prop in obj) {
	        if(obj.hasOwnProperty(prop))
	            return false;
	    }

	    return true;
	}
	
	instanceProto.saveToJSON = function ()
	{
		return { "d": this.hashtable };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
		this.hashtable = o["d"];
	};
	

	instanceProto.onDestroy = function ()
	{
		//Todo:
		/*
		delete tag from proui
		deactivated the binding with all linked elements
		*/
	};
	// The comments around these functions ensure they are removed when exporting, since the
	// debugger code is no longer relevant after publishing.
	/**BEGIN-PREVIEWONLY**/
	function syntaxHighlight(json) {
		json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); // basic html escaping
		return json
			.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
				var cls = 'red';
				if (/^"/.test(match)) {
					if (/:$/.test(match)) {
						cls = 'blue';
					} else {
						cls = 'green';
					}
				} else if (/true|false/.test(match)) {
					cls = 'Sienna';
				} else if (/null/.test(match)) {
					cls = 'gray';
				}
				return '<span style="color:' + cls + ';">' + match + '</span>';
			})
			.replace(/\t/g,"&nbsp;&nbsp;") // to keep indentation in html
			.replace(/\n/g,"<br/>"); // to keep line break in html
	};

	instanceProto.getDebuggerValues = function (propsections)
	{
		// Append to propsections any debugger sections you want to appear.
		// Each section is an object with two members: "title" and "properties".
		// "properties" is an array of individual debugger properties to display
		// with their name and value, and some other optional settings.
		var str = JSON.stringify(this.hashtable,null,"\t");
		
		var behaviorsUIDs = [];
		for (var i = 0,l=this.linkedBehaviors.length; i < l; i++) {
			behaviorsUIDs.push(this.linkedBehaviors[i].inst.uid);
		}
		var behaviors_str = JSON.stringify(behaviorsUIDs,null,"\t");

		//****************
		var labelBehaviorsUIDs = [];
		for (var i = 0,l=this.linkedLabels.length; i < l; i++) {
			labelBehaviorsUIDs.push(this.linkedLabels[i].inst.uid);
		}
		var labels_str = JSON.stringify(labelBehaviorsUIDs,null,"\t");


		propsections.push({
			"title": "JSON",
			"properties": [
				{
					"name":"content",
					"value": "<span style=\"cursor:text;-webkit-user-select: text;-khtml-user-select:text;-moz-user-select:text;-ms-user-select:text;user-select:text;\">"+syntaxHighlight(str)+"</style>",
					"html": true,
					"readonly":true
				},
				{
					"name":"Mapped Behaviors",
					"value": "<span style=\"cursor:text;-webkit-user-select: text;-khtml-user-select:text;-moz-user-select:text;-ms-user-select:text;user-select:text;\">"+syntaxHighlight(behaviors_str)+"</style>",
					"html": true,
					"readonly":true
				},
				{
					"name":"Mapped Labels",
					"value": "<span style=\"cursor:text;-webkit-user-select: text;-khtml-user-select:text;-moz-user-select:text;-ms-user-select:text;user-select:text;\">"+syntaxHighlight(labels_str)+"</style>",
					"html": true,
					"readonly":true
				}


				// Each property entry can use the following values:
				// "name" (required): name of the property (must be unique within this section)
				// "value" (required): a boolean, number or string for the value
				// "html" (optional, default false): set to true to interpret the name and value
				//as HTML strings rather than simple plain text
				// "readonly" (optional, default false): set to true to disable editing the property
				
				// Example:
				// {"name": "My property", "value": this.myValue}
			]
		});
	};
	
	instanceProto.onDebugValueEdited = function (header, name, value)
	{
	};
	/**END-PREVIEWONLY**/ 
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();

	Cnds.prototype.ForEachItem = function (key)
	{
		var entry = this.getEntry(key);
		
		var current_frame = this.runtime.getCurrentEventStack();
		var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();

		var key, value;
		this.exp_Loopindex = -1;
		for (key in entry)
		{
			if (solModifierAfterCnds)
				this.runtime.pushCopySol(current_event.solModifiers);
			
			this.exp_CurKey = key;
			this.exp_CurValue = entry[key];	
			this.exp_Loopindex ++;
			current_event.retrigger();
		
			
			if (solModifierAfterCnds)
				this.runtime.popSol(current_event.solModifiers);
		}	

		this.exp_CurKey = "";
		this.exp_CurValue = 0;
		return false;
	}; 

	Cnds.prototype.KeyExists = function (keys)
	{
		if (keys == "")
			return false;
		var data = this.getValue(keys);		 
		return (data !== undefined);
	}; 	

	Cnds.prototype.IsEmpty = function (keys)
	{
		var entry = this.getEntry(keys);
		var cnt = getItemsCount(entry);		 
		return (cnt <= 0);
	};

	/*Cnds.prototype.OnKeySet = function (key)
	{
		return cr.equals_nocase(tag, this.curTag);
	};*/
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
	

	//HashTable Operations************************
	Acts.prototype.SetValueByKeyString = function (key, value,options)
	{
		if (key == "" || key == "root"){
			console.error("MODEL %s: You can't set the root to a simple value !",this.tag);
			return;
		}
		
		try{
			this.setValue(key, value);
		}catch(error){
			return;
		}

		if(!options){
			options = {};
		}

		//additional options for the gridview
		options.op = 4;
		options.key = key;
		options.value = value;
		this.notifyBehaviorModels(key,options);

		//this.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnComplete, this);
	};

	Acts.prototype.SetJSONByKeyString = function (key, value)
	{
		if(!isObject(value)){
			try {
				value = JSON.parse(value);	
	    	} catch(e) {
	    		console.error("MODEL %s: SetJSONByKeyString() **** The json you are trying to set is not valid !");
	        	console.error("key = %s", key);
	        	console.error("value = %s", value);
	        	console.error("********************* ");
	        	return;
	    	}			
		}

    	
    	try{
			this.setValue(key, value);
		}catch(error){
			return;
		}
		
		//console.log(this.hashtable);
		this.notifyBehaviorModels(key,{op:2}); //2 for load
	};

	Acts.prototype.AddToValueByKeyString = function (key, value,options)
	{
		if (key === "")
			return;
		
		var _key = key.split(".");
		var curValue = this.getValue(_key) || 0;

		try{
			this.setValue(_key, curValue + value);
		}catch(error){
			return;
		}

		if(!options){
			options = {};
		}

		value = this.getValue(key) || 0;

		//additional options for the gridview
		options.op = 4;
		options.key = key;
		options.value = value;
		this.notifyBehaviorModels(key,options);
	};

	//Array Operations************************

	Acts.prototype.PushValue = function (key, val)
	{
		var arr = this.getEntry(key);
		if (arr == null || isObjectEmpty(arr))//If there's nothing on key then we create a empty array
		{
			this.setValue(key, []);
			arr = this.getEntry(key);
			//console.log("null");
		}
		if (!isArray(arr)){//if there's something on keys but it's not an array, then we do nothing
			console.log("not an array");
			return;
		}

		arr.push(val);
		this.notifyBehaviorModels(key,{op:1}); //1 for push
	};
	
	Acts.prototype.PushJSON = function (keys, val)
	{
		try {
        	val = JSON.parse(val);
    	} catch(e) {
        	console.error("MODEL PLugin: The json you are trying to push is not valid !");
        	return;
    	}
		Acts.prototype.PushValue.call(this, keys, val);
	}; 

	Acts.prototype.InsertValue = function (key, val, index)
	{
		var array = this.getEntry(key);
		if (array == null || isObjectEmpty(array))
		{
			this.setValue(key, []);
			array = this.getEntry(key);
		}

		if (!isArray(array)){
			console.log(this.hashtable);
			return;
		}
		
		if(array.length<index){
			console.error("MODEL PLugin: Can't insert item at %s while array only has %s !",index,array.length);
			return;
		}

		array.splice(index, 0, val);
		this.notifyBehaviorModels(key,{op:3, idx: index});
	};

	Acts.prototype.InsertJSON = function (key, val, index)
	{
		try {
        	val = JSON.parse(val);
    	} catch(e) {
        	console.error("MODEL PLugin: The json you are trying to insert is not valid !");
        	return;
    	}
		Acts.prototype.InsertValue.call(this, key, val, index);
	};


	Acts.prototype.RemoveItemByIndex = function (key,index)
	{
		var array = this.getEntry(key);
		if (array == null || isObjectEmpty(array) || !isArray(array))
		{
			console.log("The value at key = "+key+" is empty or not an array");
			return;
		}

		if ((index < 0) || (index >= array.length)){
			return;
		}

		if (index === (array.length-1)){
			array.pop();
		}
		else if (index === 0){
			array.shift();
		}
		else{
			array.splice(index, 1);
		}

		this.notifyBehaviorModels(key,{op:-1, idx: index});
	};
	


	//Other Operations************************
	Acts.prototype.RemoveByKeyString = function (key)
	{
		this.removeKey(key);
		this.notifyBehaviorModels(key);
	};

	Acts.prototype.CleanAll = function ()
	{
		this.cleanAll();
		this.notifyBehaviorModels("root");
	};

	Acts.prototype.StringToHashTable = function (json)
	{
		if (json != ""){
			try {
	        	this.hashtable = JSON.parse(json);
	    	} catch(e) {
	        	console.error("MODEL PLugin: The json you are trying to load is not valid !",e);
	        	return;
	    	}
	    	this.notifyBehaviorModels("root",{op:2});
		}else{
			this.cleanAll(); 
		}
	};
	

	Acts.prototype.SetLanguage = function(lang)
	{
		this.lang_code = lang;
		this.updateLabels();
	}

	/*Acts.prototype.SetKeyToKey = function (key1,key2)
	{
		var value = this.getValue(key1);
		var entry = this.getEntry(key1, root);

		this.notifyBehaviorModels(key1,{op:-1, idx: index});
	};*/





	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();


	//Value ***********************************************
	Exps.prototype.at = function (ret, keys, default_value)
	{
		keys = keys.split(".");
		var val = din(this.getValue(keys), default_value);
		ret.set_any(val);
	};


	Exps.prototype.arrayValueByValue = function (ret, arrayKey,idKey,idValue,key2,default_value)
	{	
		var array = this.getValue(arrayKey);
		var val = 0;

		if (!isArray(array)){
			console.log("not an array");
			ret.set_any(val);
			return;
		}


		for (var i = 0, l=array.length; i < l; i++) {
			if(this.getValue(idKey,array[i]) == idValue){
				val = this.getValue(key2,array[i]);
				//console.log(val);
				break;
			}
		}

		val = din(val, default_value);
		ret.set_any(val);
	};

	//Loop ***********************************************
	Exps.prototype.curKey = function (ret)
	{
		ret.set_string(this.exp_CurKey);
	};
	
	Exps.prototype.curValue = function (ret, subKeys, default_value)
	{
		var val = this.getValue(subKeys, this.exp_CurValue);
		val = din(val, default_value);
		ret.set_any(val);
	};

	Exps.prototype.loopindex = function (ret)
	{
		ret.set_int(this.exp_Loopindex);
	};

	//Export ***********************************************
	Exps.prototype.asJSON = function (ret)
	{
		var json = JSON.stringify(this.hashtable);
		ret.set_string(json);
	};

	Exps.prototype.makeJSON = function (ret)
	{
		var object = {};
		if (arguments.length > 1)
		{
			var i, cnt=arguments.length; 
			for(i=1; i<cnt; i=i+2)
				object[arguments[i]]=arguments[i+1];
		}
		ret.set_string(JSON.stringify(object));
	};


	Exps.prototype.makeArray = function (ret)
	{
		var array = [];
		if (arguments.length > 1)
		{
			var i, cnt=arguments.length; 
			for(i=1; i<cnt; i++){
				array.push(arguments[i]);
			}
		}
		ret.set_string(JSON.stringify(array));
	};

	//Array ***********************************************
	Exps.prototype.pop = function (ret, keys, idx)
	{
		var arr = this.getEntry(keys);
		var val;
		if (arr == null)
			val = 0;
		else if ((idx == null) || (idx === (arr.length-1)))
			val = arr.pop();
		else
			val = arr.splice(idx, 1);
		
		ret.set_any( din(val) );
	};

	Exps.prototype.shift = function (ret, keys)
	{
		var arr = this.getEntry(keys);
		var val;
		if (arr == null)
			val = 0;
		else
			val = arr.shift();
		
		ret.set_any( din(val) );
	};
	
	//***********************************************
	Exps.prototype.itemCnt = function (ret, keys)
	{
		var cnt = getItemsCount(this.getValue(keys));
		ret.set_int(cnt);
	};


}());