// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
//          vvvvvvvv
cr.plugins_.hmmg_layoutTransition_v2 = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	/////////////////////////////////////
	// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
	//                            vvvvvvvv
	var pluginProto = cr.plugins_.hmmg_layoutTransition_v2.prototype;
		
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
		
		var time = this.properties[0] || null;
		if(time != null)
			if(time >0)
				$("head").append("<style>.animated,animated.hinge,.animated.flipOutX,.animated.flipOutY,.animated.bounceIn,.animated.bounceOut,.animated.flipOutXX,.animated.flipInXX,.animated.flipInYY,.animated.flipOutYY{-webkit-animation-duration: "+time+"s !important;animation-duration: "+time+"s !important;}</style>");
	
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
	
	// The comments around these functions ensure they are removed when exporting, since the
	// debugger code is no longer relevant after publishing.
	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
		// Append to propsections any debugger sections you want to appear.
		// Each section is an object with two members: "title" and "properties".
		// "properties" is an array of individual debugger properties to display
		// with their name and value, and some other optional settings.
		propsections.push({
			"title": "My debugger section",
			"properties": [
				// Each property entry can use the following values:
				// "name" (required): name of the property (must be unique within this section)
				// "value" (required): a boolean, number or string for the value
				// "html" (optional, default false): set to true to interpret the name and value
				//									 as HTML strings rather than simple plain text
				// "readonly" (optional, default false): set to true to disable editing the property
				
				// Example:
				// {"name": "My property", "value": this.myValue}
			]
		});
	};
	
	instanceProto.onDebugValueEdited = function (header, name, value)
	{
		// Called when a non-readonly property has been edited in the debugger. Usually you only
		// will need 'name' (the property name) and 'value', but you can also use 'header' (the
		// header title for the section) to distinguish properties with the same name.
		if (name === "My property")
			this.myProperty = value;
	};
	/**END-PREVIEWONLY**/

	//////////////////////////////////////
	// Conditions
	function Cnds() {};

	// the example condition
	Cnds.prototype.isTransitionReady = function ()
	{
		return true;
	};
	Cnds.prototype.didTransitionStart = function ()
	{
		return true;
	};
	Cnds.prototype.didTransitionFinish = function ()
	{
		return true;
	};
	
	// ... other conditions here ...
	
	pluginProto.cnds = new Cnds();
	
	//////////////////////////////////////
	// Actions
	function Acts() {};

	// the example action
	Acts.prototype.prepareTransition = function ()
	{
		var tempcolor = this.properties[1];
		var R = Math.floor(tempcolor/(65536));
		var G = Math.floor(tempcolor/(256)) % 256;
		var B = tempcolor % 256;
		tempcolor = "rgb(" + R + "," + G + "," + B +")";
		var self = this ;
		function prepareCanvas(elem,callback1)
		{
			self.runtime.doCanvasSnapshot("image/jpeg", 100/100);
			setTimeout(function()
			{
				callback1(self.runtime.snapshotData);
			},50);
		}
		function isCanvasReady(callback)
		{
			prepareCanvas(self,function(returnedPic)
			{
				if($("#fakeCanvas")[0] == undefined)
				{
					var c2canvasdiv = $("#c2canvasdiv") ;
					var fakeCanvas  = $("<div id='fakeCanvas'><img src='"+returnedPic+"' height='"+c2canvasdiv.height()+"' width='"+c2canvasdiv.width()+"'/><div></div></div>");
					var fakeBody = $("<div id='fakeBody'></div>");
					var marginLeft = parseFloat(c2canvasdiv.css("margin-left"));

					fakeBody.css(
					{
						"top":c2canvasdiv.offset().top,
						"left":c2canvasdiv.offset().left,
						"width":c2canvasdiv.width(),
						"height":c2canvasdiv.height(),
						"background-color": tempcolor
					});

					c2canvasdiv.addClass("prepared").find(" > :not(canvas)").each(function()
					{
						$(this).css("left",($(this).offset().left-marginLeft)+"px");
					});
					fakeBody.appendTo(document.body).append(c2canvasdiv).append(fakeCanvas);
					if(callback)
						callback();
				}
			});
		}

		isCanvasReady(function()
		{
			self.runtime.trigger(cr.plugins_.hmmg_layoutTransition_v2.prototype.cnds.isTransitionReady, self);
		});
	};


	Acts.prototype.startTransition = function (transID)
	{
		var fakeBody = $("#fakeBody");
		var c2canvasdiv = fakeBody.find("#c2canvasdiv") ;
		var fakeCanvas  = fakeBody.find("#fakeCanvas");
		var self = this ;
		
		
		function darkTheFakeCanvas(callback)
		{
			setTimeout(function() 
			{
				fakeCanvas.find("div").addClass("darker");
				if(callback)
					callback();
			},1); 
		}

		function removeChanges()
		{
			fakeBody.remove();
			c2canvasdiv.appendTo(document.body).removeClass("prepared");
			self.runtime.trigger(cr.plugins_.hmmg_layoutTransition_v2.prototype.cnds.didTransitionFinish, self)
		}

		self.runtime.trigger(cr.plugins_.hmmg_layoutTransition_v2.prototype.cnds.didTransitionStart, self)
		
		if(transID == 14)
		{
			c2canvasdiv.addClass("hidden");
			fakeCanvas.addClass('animated rotateOut').on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function()
			{
				fakeCanvas.addClass("hidden");
			});
			c2canvasdiv.removeClass("hidden").addClass('animated rotateIn').on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function()
			{
				c2canvasdiv.removeClass("animated rotateIn");
				removeChanges();
			});
		}
		else if(transID == 13)
		{
			fakeCanvas.addClass('animated rollOut').on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function()
			{
				fakeCanvas.addClass("hidden");
			});
			c2canvasdiv.addClass('animated rollIn').on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function()
			{
				c2canvasdiv.removeClass("animated rollIn");
				removeChanges();
			});
		}
		else if(transID == 12)
		{
			fakeCanvas.addClass('animated zoomOut').on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function()
			{
				fakeCanvas.addClass("hidden");
			});
			c2canvasdiv.addClass('animated zoomIn').on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function()
			{
				c2canvasdiv.removeClass("animated zoomIn");
				removeChanges();
			});
		}
		else if(transID == 11)
		{
			c2canvasdiv.addClass("hidden");
			fakeCanvas.addClass('animated fadeOut').on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function()
			{
				fakeCanvas.addClass("hidden");
				c2canvasdiv.removeClass("hidden").addClass('animated fadeIn').on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function()
				{
					c2canvasdiv.removeClass("animated fadeIn");
					removeChanges();
				});
			});
		}
		else if(transID == 10)
		{
			c2canvasdiv.addClass("hidden");
			fakeCanvas.addClass('animated fadeOut').on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function()
			{
				fakeCanvas.addClass("hidden");
				
			});
			c2canvasdiv.removeClass("hidden").addClass('animated fadeIn').on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function()
			{
				c2canvasdiv.removeClass("animated fadeIn");
				removeChanges();
			});
		}
		else if(transID == 9)
		{
			c2canvasdiv.addClass("hidden");
			fakeCanvas.addClass('animated flipOutYY').on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function()
			{
				fakeCanvas.addClass("hidden");
				c2canvasdiv.removeClass("hidden").addClass('animated flipInYY').on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function()
				{
					c2canvasdiv.removeClass("animated flipInYY");
					removeChanges();
				});
			});
		}
		else if(transID == 8)
		{
			c2canvasdiv.addClass("hidden");
			fakeCanvas.addClass('animated flipOutXX').on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function()
			{
				fakeCanvas.addClass("hidden");
				c2canvasdiv.removeClass("hidden").addClass('animated flipInXX').on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function()
				{
					c2canvasdiv.removeClass("animated flipInXX");
					removeChanges();
				});
			});
		}
		else if(transID == 7)
		{
			c2canvasdiv.addClass('animated slideInRight').on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function()
			{
				removeChanges();
				c2canvasdiv.removeClass("animated slideInRight");
			});
		}
		else if(transID == 6)
		{
			c2canvasdiv.addClass('animated slideInLeft').on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function()
			{
				removeChanges();
				c2canvasdiv.removeClass('animated slideInLeft');
			});
		}
		else if(transID == 5)
		{
			c2canvasdiv.addClass('animated slideInDown').on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function()
			{
				removeChanges();
				c2canvasdiv.removeClass('animated slideInDown');
			});
		}
		else if(transID == 4)
		{
			c2canvasdiv.addClass('animated slideInUp').on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function()
			{
				removeChanges();
				c2canvasdiv.removeClass('animated slideInUp');
			});
		}
		else if(transID == 3)
		{
			c2canvasdiv.addClass('animated slideInRight').on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function()
			{
				removeChanges();
				c2canvasdiv.removeClass("animated slideInRight");
				fakeCanvas.removeClass('animated slideOutLeft');
			});
			fakeCanvas.addClass('animated slideOutLeft');
		}
		else if(transID == 2)
		{
			c2canvasdiv.addClass('animated slideInLeft').on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function()
			{
				removeChanges();
				fakeCanvas.removeClass("animated slideOutRight");
				c2canvasdiv.removeClass('animated slideInLeft');
			});
			fakeCanvas.addClass('animated slideOutRight');
		}
		else if(transID == 1)
		{
			c2canvasdiv.addClass('animated slideInDown').on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function()
			{
				removeChanges();
				fakeCanvas.removeClass("animated slideOutDown");
				c2canvasdiv.removeClass('animated slideInDown');
			});
			fakeCanvas.addClass('animated slideOutDown');
		}
		else if(transID == 0)
		{
			c2canvasdiv.addClass('animated slideInUp').on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function()
			{
				removeChanges();
				fakeCanvas.removeClass("animated slideOutUp");
				c2canvasdiv.removeClass('animated slideInUp');
			});
			fakeCanvas.addClass('animated slideOutUp');
		}
	};
	
	// ... other actions here ...
	
	pluginProto.acts = new Acts();
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};

	// ... other expressions here ...
	
	pluginProto.exps = new Exps();

}());