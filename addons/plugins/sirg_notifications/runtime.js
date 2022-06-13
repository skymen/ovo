// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.sirg_notifications = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.sirg_notifications.prototype;
		
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

	function indexToParamPosition(i){
		switch (i) {
			case 0:	return 'top-right';
			case 1:	return 'top-left';
			case 2:	return 'bottom-left';
			case 3:	return 'bottom-right';
		}
		return 'bottom-right';
	};

	function indexToParamFadeInSpeed(i){
		switch (i) {
			case 0:	return 'slow';
			case 1:	return 'medium';
			case 2:	return 'fast';
		}
		return 'slow';
	};

	function indexToParamFadeOutSpeed(i){
		switch (i) {
			case 0:	return 'slow';
			case 1:	return 'medium';
			case 2:	return 'fast';
		}
		return 'slow';
	};

	function indexToParamStyle(i){
		switch (i) {
			case 0:	return '';
			case 1:	return 'gritter-light';
			case 2:	return 'gritter-success';
			case 3:	return 'gritter-info';
			case 4:	return 'gritter-warning';
			case 5:	return 'gritter-error';
			case 6:	return 'gritter-red';
			case 7:	return 'gritter-yellow';
			case 8:	return 'gritter-blue';
			case 9:	return 'gritter-green';
		}
		return '';
	};

	// called whenever an instance is created
	instanceProto.onCreate = function()
	{
		this.position = indexToParamPosition(this.properties[0]);
		this.fade_in_speed = indexToParamFadeInSpeed(this.properties[1]);
		this.fade_out_speed = indexToParamFadeInSpeed(this.properties[2]);
		this.time = this.properties[3];
		this.max_number = this.properties[4];

		this.param_sticky = (this.properties[5]===0) ? true : false;
		this.param_style = this.properties[6];
		this.curr_tag = "";

		jQuery.extend(jQuery["gritter"].options, {
			//class_name: 'gritter-light', // for light notifications (can be added directly to $.gritter.add too)
			"position": this.position, // possibilities: bottom-left, bottom-right, top-left, top-right
			"fade_in_speed": this.fade_in_speed, // how fast notifications fade in (string or int)
			"fade_out_speed": this.fade_out_speed, // how fast the notices fade out
			"time": this.time, // hang on the screen for...
			"max_to_display": this.max_number // 
		});
	};
	
	// called whenever an instance is destroyed
	// note the runtime may keep the object after this call for recycling; be sure
	// to release/recycle/reset any references to other objects in this function.
	instanceProto.onDestroy = function ()
	{
	};
	
	// called when saving the full state of the game
	instanceProto.saveToJSON = function ()
	{
		// return a Javascript object containing information about your object's state
		// note you MUST use double-quote syntax (e.g. "property": value) to prevent
		// Closure Compiler renaming and breaking the save format
		return {
			// e.g.
			//"myValue": this.myValue
		};
	};
	
	// called when loading the full state of the game
	instanceProto.loadFromJSON = function (o)
	{
		// load from the state previously saved by saveToJSON
		// 'o' provides the same object that you saved, e.g.
		// this.myValue = o["myValue"];
		// note you MUST use double-quote syntax (e.g. o["property"]) to prevent
		// Closure Compiler renaming and breaking the save format
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

	//////////////////////////////////////
	// Conditions
	function Cnds() {};

	Cnds.prototype.OnNotificationClicked = function (tag)
	{
		return cr.equals_nocase(tag, this.curr_tag);
		//return true;
	};
	
	pluginProto.cnds = new Cnds();
	//////////////////////////////////////
	// Actions
	function Acts() {};

	Acts.prototype.AddNotification = function (title,text,image,sticky,style,timeout)
	{
		jQuery["gritter"].add({
			// (string | mandatory) the heading of the notification
			"title": title,
			// (string | mandatory) the text inside the notification
			"text": text,
			// (string | optional) the image to display on the left
			"image": image,
			// (bool | optional) if you want it to fade out on its own or just sit there
			"sticky": sticky, 
			"time": timeout, // hang on the screen for...
			"class_name": indexToParamStyle(style)
		});
	}

	Acts.prototype.DeleteAllNotifications = function ()
	{
		jQuery["gritter"].removeAll();
	};

	Acts.prototype.AddSimpleNotification = function (title,text,image)
	{
		var self = this;
		jQuery["gritter"].add({
			// (string | mandatory) the heading of the notification
			"title": title,
			// (string | mandatory) the text inside the notification
			"text": text,
			// (string | optional) the image to display on the left
			"image": image,
			// (bool | optional) if you want it to fade out on its own or just sit there
			"sticky": self.param_sticky, 
			"class_name": indexToParamStyle(self.param_style)
		});
	}

	Acts.prototype.AddNotificationClickable = function (id,title,text,image,sticky,style,timeout,closeonclick)
	{
		var self = this;
		self.curr_tag = id;
		jQuery["gritter"].add({
			// (string | mandatory) the heading of the notification
			"title": title,
			// (string | mandatory) the text inside the notification
			"text": text,
			// (string | optional) the image to display on the left
			"image": image,
			// (bool | optional) if you want it to fade out on its own or just sit there
			"sticky": sticky, 
			"time": timeout, // hang on the screen for...
			"class_name": "gritter-clickable gritter-id-" + id + " " + indexToParamStyle(style),
			//"on_click": self.runtime.trigger(cr.plugins_.sirg_notifications.prototype.cnds.OnNotificationClicked, self),
			"close_on_click": closeonclick
		});
		jQuery(".gritter-id-" + id).click(function(){
			self.runtime.trigger(cr.plugins_.sirg_notifications.prototype.cnds.OnNotificationClicked, self);
			return false;
		});
	}

	Acts.prototype.SetPosition = function (pos) {
		this.position = indexToParamPosition(pos);
		jQuery["gritter"].options["position"] = this.position
	};

	pluginProto.acts = new Acts();
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	
	pluginProto.exps = new Exps();

}());
