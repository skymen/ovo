// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Globals = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Globals.prototype;
		
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
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	// called whenever an instance is created
	instanceProto.onCreate = function()
	{
        this.defaultVarsValues = JSON.stringify(this.instance_vars);
	};

	instanceProto.saveToJSON = function ()
	{
        return {
			"v": JSON.stringify(this.instance_vars)
		};
	};

	instanceProto.loadFromJSON = function (o)
	{
        this.instance_vars = JSON.parse(o["v"]);
	};


	//////////////////////////////////////
	// Conditions
	function Cnds() {};


	pluginProto.cnds = new Cnds();
	
	//////////////////////////////////////
	// Actions
	function Acts() {};

    Acts.prototype.ResetVariables = function()
    {
        this.instance_vars = JSON.parse(this.defaultVarsValues);
    };

	Acts.prototype.LoadVariables = function(varsJSON_)
	{
        this.instance_vars = JSON.parse(varsJSON_);
	};

	pluginProto.acts = new Acts();
	
	//////////////////////////////////////
	// Expressions
	// ret.set_float, ret.set_string, ret.set_any
	function Exps() {};

    Exps.prototype.GetVariablesAsJSON = function(ret)
    {
        ret.set_string(JSON.stringify(this.instance_vars));
    };

	pluginProto.exps = new Exps();

}());