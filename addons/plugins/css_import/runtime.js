// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

var lastCSS = "";
var importList = [];

//Import CSS function
function importcssfile(filename){
	if (importList.indexOf(filename)==-1){ //Only imports if file of same name not already imported
		var fileref=document.createElement("link")
		fileref.setAttribute("rel", "stylesheet")
		fileref.setAttribute("type", "text/css")
		fileref.setAttribute("href", filename)
		document.getElementsByTagName("head")[0].appendChild(fileref)
		importList.push(filename)
	}
};

//Remove CSS function
if(!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(what, i) {
        i = i || 0;
        var L = this.length;
        while (i < L) {
            if(this[i] === what) return i;
            ++i;
        }
        return -1;
    };
};

function removecssfile(filename){
	var removeList=document.getElementsByTagName("link")
	for (var i=removeList.length; i>=0; i--){ //search backwards within nodelist for matching elements to remove
		if (removeList[i] && removeList[i].getAttribute("href")!=null && removeList[i].getAttribute("href").indexOf(filename)!=-1)
		removeList[i].parentNode.removeChild(removeList[i]) //remove element by calling parentNode.removeChild()
	}
	importList.splice(importList.indexOf(filename), 1);
};

/////////////////////////////////////
// Plugin class
cr.plugins_.CSS_import = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	/////////////////////////////////////
	var pluginProto = cr.plugins_.CSS_import.prototype;

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
		if (this.properties[0] != ""){
			importcssfile(this.properties[0]);
			lastCSS = this.properties[0];
		}
	};

	instanceProto.onDestroy = function ()
	{
	};

	// only called if a layout object
	instanceProto.draw = function(ctx)
	{
	};

	instanceProto.drawGL = function(glw)
	{
	};

	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;

	cnds.CompareCSS = function (text, case_)
	{
			return this.properties[0] === text;
	};

	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;
	
	acts.SetCSS = function (setName)
	{
		importcssfile(setName);
		lastCSS = setName;
	};

	acts.RemCSS = function (remName)
	{
		removecssfile(remName);
	};

	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;

	exps.GetCSS = function (ret)
	{
		if (lastCSS != ""){
			ret.set_string(lastCSS);
		} else if (this.properties[0] != ""){
			ret.set_string(this.properties[0]);
		} else {
			ret.set_string("");
		}
	};

}());