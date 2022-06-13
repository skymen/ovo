// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
//          vvvvvvvv
cr.plugins_.skymen_minifunctioncallback = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	/////////////////////////////////////
	// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
	//                            vvvvvvvv
	var pluginProto = cr.plugins_.skymen_minifunctioncallback.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;

	// called on startup for each object type
	typeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		
		// any other properties you need, e.g...
		// this.myValue = 0;
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	// called whenever an instance is created
	instanceProto.onCreate = function()
	{
		// note the object is sealed after this call; ensure any properties you'll ever need are set on the object
		// e.g...
		// this.myValue = 0;
	};
	
	// only called if a layout object - draw to a canvas 2D context
	instanceProto.draw = function(ctx)
	{
	};
	
	// only called if a layout object in WebGL mode - draw to the WebGL context
	// 'glw' is not a WebGL context, it's a wrapper - you can find its methods in GLWrap.js in the install
	// directory or just copy what other plugins do.
	instanceProto.drawGL = function (glw)
	{
	};

	instanceProto.getArgs = function (args, divider, types)
	{
		if(args == ""){
			return [];
		}

		if(types == ""){
			types = "a";
		}
		var argArray = args.split(divider);
		var typeArray = types.split(divider);
		var difference = 0;

		//If the arrays are not the same size, correct by adding "any" types. 
		if(argArray.length > typeArray.length){
			difference = argArray.length - typeArray.length;
			for (var i = 0; i < difference; i++) {
				typeArray.push('a');
			}
		}

		//Useless deletion as the additionnal elements are never used anyway.
		/*else if(argArray.length < typeArray.length){
			difference = typeArray.length - argArray.length;
			for (var i = 0; i < difference; i++) {
				typeArray.pop();
			}
		}*/

		for (var i = 0; i < argArray.length; i++) {
			//argArray[i] = argArray[i].trim();
			var char = typeArray[i].trim().charAt(0).toLowerCase();
			if(char != 's' && char != 'a' && char != 'n'){
				console.warn("The type of the given number doesn't exist. Please use Number, String or Any. Note that the type only needs to start with n, a or s, and is not case sensitive, so using a single letter is ok.");
			}
			if(char == 'n'){
				argArray[i] = parseFloat(argArray[i].trim());
			}
		}

		return argArray;
	};

	//////////////////////////////////////
	// Conditions
	function Cnds() {};

	// the example condition
	
	// ... other conditions here ...
	
	pluginProto.cnds = new Cnds();
	
	//////////////////////////////////////
	// Actions
	function Acts() {};

	// the example action
	Acts.prototype.Callback = function (name, div, params, types)
	{
		var args = this.getArgs(params, div, types);
		if (c2_callFunction){
	    	c2_callFunction(name, args);
	    }
	};
	// ... other actions here ...
	
	pluginProto.acts = new Acts();
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	
	// the example expression
	Exps.prototype.Callback = function (ret, name_, div, params, types)	// 'ret' must always be the first parameter - always return the expression's result through it!
	{
		var fs = pushFuncStack();
		fs.name = name_.toLowerCase();
		fs.retVal = 0;
		
		// Copy rest of parameters from arguments
		cr.clearArray(fs.params);
		fs.params = this.getArgs(params, div, types);
		
		// Note: executing fast trigger path based on fs.name
		var ran = this.runtime.trigger(cr.plugins_.Function.prototype.cnds.OnFunction, this, fs.name);
		
		// In preview mode, log to the console if nothing was triggered
		if (isInPreview && !ran)
		{
			console.warn("[Construct 2] Function object: expression Function.Call('" + name_ + "' ...) was used, but no event was triggered. Is the function call spelt incorrectly or no longer used?");
		}
		
		popFuncStack();

		ret.set_any(fs.retVal);
	};
	
	// ... other expressions here ...
	
	pluginProto.exps = new Exps();

}());