// ECMAScript 5 strict mode
/* global cr,log,assert2 */
/* jshint globalstrict: true */
/* jshint strict: true */
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

var jText = '';

/////////////////////////////////////
// Plugin class
cr.plugins_.SkymenSFPlusPLus = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.SkymenSFPlusPLus.prototype;

	pluginProto.onCreate = function ()
	{
	};

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
		if (this.is_family)
			return;

		// Create the texture
		this.texture_img = new Image();
		this.texture_img["idtkLoadDisposed"] = true;
		this.texture_img.src = this.texture_file;

		// Tell runtime to wait for this to load
		this.runtime.wait_for_textures.push(this.texture_img);

		this.webGL_texture = null;
	};

	typeProto.onLostWebGLContext = function ()
	{
		if (this.is_family)
			return;

		this.webGL_texture = null;
	};

	typeProto.onRestoreWebGLContext = function ()
	{
		// No need to create textures if no instances exist, will create on demand
		if (this.is_family || !this.instances.length)
			return;

		if (!this.webGL_texture)
		{
			this.webGL_texture = this.runtime.glwrap.loadTexture(this.texture_img, false, this.runtime.linearSampling, this.texture_pixelformat);
		}

		var i, len;
		for (i = 0, len = this.instances.length; i < len; i++)
			this.instances[i].webGL_texture = this.webGL_texture;
	};

	typeProto.unloadTextures = function ()
	{
		// Don't release textures if any instances still exist, they are probably using them
		if (this.is_family || this.instances.length || !this.webGL_texture)
			return;

		this.runtime.glwrap.deleteTexture(this.webGL_texture);
		this.webGL_texture = null;
	};

	typeProto.preloadCanvas2D = function (ctx)
	{
		// draw to preload, browser should lazy load the texture
		try {
			ctx.drawImage(this.texture_img, 0, 0);
		} catch (error) {
			this.texture_img.onload = function () {
				ctx.drawImage(this.texture_img, 0, 0);
			}
		}
		
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};

	var instanceProto = pluginProto.Instance.prototype;

	instanceProto.onDestroy = function()
	{
		// recycle the instance's objects
		freeAllLines (this.lines);
		freeAllClip  (this.clipList);
		freeAllClipUV(this.clipUV);
		cr.wipe(this.characterWidthList);
	};

	instanceProto.onCreate = function()
	{
		this.texture_img      = this.type.texture_img;
		this.characterWidth   = this.properties[0];
		this.characterHeight  = this.properties[1];
		this.characterSet     = this.properties[2];
		this.text             = this.properties[3];
		this.characterScale   = this.properties[4];
		this.visible          = (this.properties[5] === 0);	// 0=visible, 1=invisible
		this.clamp			  		= (this.properties[14] === 0); //0=Yes, 1=No
		this.halign           = this.clamp? cr.clamp(this.properties[6],0,100)/100 : this.properties[6]/100; // 0=left, 1=center, 2=right
		this.valign           = this.clamp? cr.clamp(this.properties[7],0,100)/100 : this.properties[7]/100; // 0=top, 1=center, 2=bottom
		this.wrapbyword       = (this.properties[9] === 0);	// 0=word, 1=character, 2 = None
		this.nowrap			  		= (this.properties[9] === 2); // 0=word, 1=character, 2 = None
		this.characterSpacing = this.properties[10];
		this.lineHeight       = this.properties[11];
		this.textWidth  			= 0;
		this.textHeight 			= 0;
		this.charWidthJSON = this.properties[12];
		this.spaceWidth 	  	= this.properties[13];
		this.charPos 		  		= {"data":[0]};
		this.charPosProcessed = [[[0]]];
		this.lastValue		  	= 0;
		// this.animOffset 		= 1;
		// this.defaultMagnitude = 0;
		//console.log(this.charWidthJSON);

		jText = this.charWidthJSON;

		// Use recycled properties to avoid garbage
		if (this.recycled)
		{
			this.lines.length = 0;
			cr.wipe(this.clipList);
			cr.wipe(this.clipUV);
			cr.wipe(this.characterWidthList);
		}
		else
		{
			this.lines = [];
			this.clipList = {};
			this.clipUV = {};
			this.characterWidthList = {};
		}
		
		//Calculate characterWidthList from JSON
		try{
			if(this.charWidthJSON){
				if(this.charWidthJSON.indexOf('""c2array""') !== -1) {
					var jStr = jQuery.parseJSON(this.charWidthJSON.replace(/""/g,'"'));
					var l = jStr.size[1];
					for(var s = 0; s < l; s++) {
						var cs = jStr.data[1][s][0];
						var w = jStr.data[0][s][0];
						for(var c = 0; c < cs.length; c++) {
							this.characterWidthList[cs.charAt(c)] = w
						}
					}
				} else {
					var jStr = jQuery.parseJSON(this.charWidthJSON);
					var l = jStr.length;
					for(var s = 0; s < l; s++) {
						var cs = jStr[s][1];
						var w = jStr[s][0];
						for(var c = 0; c < cs.length; c++) {
							this.characterWidthList[cs.charAt(c)] = w
						}
					}
				}
			}
			if(this.spaceWidth !== -1) {
				this.characterWidthList[' '] = this.spaceWidth;
			}
		}
		catch(e){
			if(window.console && window.console.log) {
				window.console.log('SpriteFont+ Failure: ' + e);
			}
		}
		
		// only update text if it changes
		this.text_changed = true;
		
		// only update line calculations if this change
		this.lastwrapwidth = this.width;

		if (this.runtime.glwrap)
		{
			// Create WebGL texture if type doesn't have it yet
			if (!this.type.webGL_texture)
			{
				this.type.webGL_texture = this.runtime.glwrap.loadTexture(this.type.texture_img, false, this.runtime.linearSampling, this.type.texture_pixelformat);
			}

			this.webGL_texture = this.type.webGL_texture;
		}

		this.SplitSheet();
	};

	instanceProto.saveToJSON = function ()
	{
		var save = {
			"t": this.text,
			"csc": this.characterScale,
			"csp": this.characterSpacing,
			"lh": this.lineHeight,
			"tw": this.textWidth,
			"th": this.textHeight,
			"lrt": this.last_render_tick,
			"ha": this.halign,
			"va": this.valign,
			"clamp": this.clamp,
			"wbw": this.wrapbyword,
			"nw": this.nowrap,
			"charpos": this.charPos,
			"charpospro": this.charPosProcessed,
			"lastvalue": this.lastValue,
			"cw": {}
		};

		for (var ch in this.characterWidthList)
			save["cw"][ch] = this.characterWidthList[ch];

		return save;
	};

	instanceProto.loadFromJSON = function (o)
	{
		this.text = o["t"];
		this.characterScale = o["csc"];
		this.characterSpacing = o["csp"];
		this.lineHeight = o["lh"];
		this.textWidth = o["tw"];
		this.textHeight = o["th"];
		this.halign = o["ha"];
		this.valign = o["va"];
		this.clamp = o["clamp"];
		this.nowrap = o["nw"];
		this.wrapbyword = o["wbw"];
		this.charPos = o["charpos"];
		this.charPosProcessed = o["charpospro"];
		this.lastValue = o["lastvalue"]

		for(var ch in o["cw"])
			this.characterWidthList[ch] = o["cw"][ch];

		this.text_changed = true;
		this.lastwrapwidth = this.width;
	};


	function trimRight(text)
	{
		return text.replace(/\s\s*$/, '');
		// return text
	}

	// return what's in the cache
	// if the cache is empty, return a new object 
	// based on the given Constructor
	var MAX_CACHE_SIZE = 1000;
	function alloc(cache,Constructor)
	{
		if (cache.length)
			return cache.pop();
		else
			return new Constructor();
	}

	// store the data in the cache
	function free(cache,data)
	{
		if (cache.length < MAX_CACHE_SIZE)
		{
			cache.push(data);
		}
	}

	// store all the data from dataList in the cache
	// and wipe dataList
	function freeAll(cache,dataList,isArray)
	{
		if (isArray) {
			var i, len;
			for (i = 0, len = dataList.length; i < len; i++)
			{
				free(cache,dataList[i]);
			}
			dataList.length = 0;
		} else {
			var prop;
			for(prop in dataList) {
				if(Object.prototype.hasOwnProperty.call(dataList,prop)) {
					free(cache,dataList[prop]);
					delete dataList[prop];
				}
			}
		}
	}

	function addLine(inst,lineIndex,cur_line) {
		var lines = inst.lines;
		var line;
		cur_line = trimRight(cur_line);
		// Recycle a line if possible
		if (lineIndex >= lines.length)
			lines.push(allocLine());

		line = lines[lineIndex];
		line.text = cur_line;
		line.width = inst.measureWidth(cur_line);
		inst.textWidth = cr.max(inst.textWidth,line.width);
	}

	var linesCache = [];
	function allocLine()       { return alloc(linesCache,Object); }
	function freeLine(l)       { free(linesCache,l); }
	function freeAllLines(arr) { freeAll(linesCache,arr,true); }


	function addClip(obj,property,x,y,w,h) {
		if (obj[property] === undefined) {
			obj[property] = alloc(clipCache,Object);
		}

		obj[property].x = x;
		obj[property].y = y;
		obj[property].w = w;
		obj[property].h = h;
	}
	var clipCache = [];
	function allocClip()      { return alloc(clipCache,Object); }
	function freeAllClip(obj) { freeAll(clipCache,obj,false);}

	function addClipUV(obj,property,left,top,right,bottom) {
		if (obj[property] === undefined) {
			obj[property] = alloc(clipUVCache,cr.rect);
		}

		obj[property].left   = left;
		obj[property].top    = top;
		obj[property].right  = right;
		obj[property].bottom = bottom;
	}
	var clipUVCache = [];
	function allocClipUV()      { return alloc(clipUVCache,cr.rect);}
	function freeAllClipUV(obj) { freeAll(clipUVCache,obj,false);}


	instanceProto.SplitSheet = function() {
		// Create Clipping regions for each letters of the spritefont sheet
		var texture      = this.texture_img;
		var texWidth     = texture.width;
		var texHeight    = texture.height;
		var charWidth    = this.characterWidth;
		var charHeight   = this.characterHeight;
		var charU        = charWidth /texWidth;
		var charV        = charHeight/texHeight;
		var charSet      = this.characterSet ;

		var cols = Math.floor(texWidth/charWidth);
		var rows = Math.floor(texHeight/charHeight);

		for ( var c = 0; c < charSet.length; c++) {
			// not enough texture space
			if  (c >= cols * rows) break;

			// create clipping coordinates for each characters
			var x = c%cols;
			var y = Math.floor(c/cols);
			var letter = charSet.charAt(c);
			if (this.runtime.glwrap) {
				addClipUV(
					this.clipUV, letter,
					x * charU ,
					y * charV ,
					(x+1) * charU ,
					(y+1) * charV
				);
			} else {
				addClip(
					this.clipList, letter,
					x * charWidth,
					y * charHeight,
					charWidth,
					charHeight
				);
			}
		}
	};

	/*
     *	Word-Wrapping
     */

	var wordsCache = [];
	pluginProto.TokeniseWords = function (text)
	{
		wordsCache.length = 0;
		var cur_word = "";
		var ch;

		// Loop every char
		var i = 0;

		while (i < text.length)
		{
			ch = text.charAt(i);

			if (ch === "\n")
			{
				// Dump current word if any
				if (cur_word.length)
				{
					wordsCache.push(cur_word);
					cur_word = "";
				}

				// Add newline word
				wordsCache.push("\n");

				++i;
			}
			// Whitespace or hyphen: swallow rest of whitespace and include in word
			else if (ch === " " || ch === "\t" || ch === "-")
			{
				do {
					cur_word += text.charAt(i);
					i++;
				}
				while (i < text.length && (text.charAt(i) === " " || text.charAt(i) === "\t"));

				wordsCache.push(cur_word);
				cur_word = "";
			}
			else if (i < text.length)
			{
				cur_word += ch;
				i++;
			}
		}

		// Append leftover word if any
		if (cur_word.length)
			wordsCache.push(cur_word);
	};


	pluginProto.WordWrap = function (inst)
	{
		var text = inst.text;
		var lines = inst.lines;

		if (!text || !text.length)
		{
			freeAllLines(lines);
			return;
		}

		var width = inst.width;
		if (width <= 2.0)
		{
			freeAllLines(lines);
			return;
		}


		// If under 100 characters (i.e. a fairly short string), try a short string optimisation: just measure the text
		// and see if it fits on one line, without going through the tokenise/wrap.
		// Text musn't contain a linebreak!
		var charWidth = inst.characterWidth;
		var charScale = inst.characterScale;
		var charSpacing = inst.characterSpacing;
		if ( (text.length * (charWidth * charScale + charSpacing) - charSpacing) <= width && text.indexOf("\n") === -1)
		{
			var all_width = inst.measureWidth(text);

			if (all_width <= width)
			{
				// fits on one line
				freeAllLines(lines);
				lines.push(allocLine());
				lines[0].text = text;
				lines[0].width = all_width;
				inst.textWidth  = all_width;
				inst.textHeight = inst.characterHeight * charScale + inst.lineHeight;
				return;
			}
		}

		var wrapbyword = inst.wrapbyword;

		this.WrapText(inst);
		inst.textHeight = lines.length * (inst.characterHeight * charScale + inst.lineHeight);
	};

	pluginProto.WrapText = function (inst)
	{
		var wrapbyword = inst.wrapbyword;
		var nowrap	   = inst.nowrap;
		var text       = inst.text;
		var lines      = inst.lines;
		var width      = inst.width;

		var wordArray;
		if (wrapbyword) {
			this.TokeniseWords(text);	// writes to wordsCache
			wordArray = wordsCache;
		} 
		else if(nowrap){
			wordArray = [text];
		}
		else {
			wordArray = text;
		}
		var cur_line = "";
		var prev_line;
		var line_width;
		var i;
		var lineIndex = 0;
		var line;
		var ignore_newline = false;

		for (i = 0; i < wordArray.length; i++)
		{
			/*console.log('New Word ' + i)
			console.log(wordArray)
			console.log(wordArray[i])*/
			// Look for newline
			if (wordArray[i] === "\n")
			{
				if (ignore_newline === true) {
					// if a newline as been added by the wrapping
					// we ignore any happening just after
					ignore_newline = false;
				} else {
					// Flush line.  
					addLine(inst,lineIndex,cur_line);
					lineIndex++;
				}
				cur_line = "";
				continue;
			}
			ignore_newline = false;

			// Otherwise add to line
			prev_line = cur_line;
			cur_line += wordArray[i];

			// Measure line
			line_width = inst.measureWidth(trimRight(cur_line));
			/*console.log(prev_line);
			console.log(cur_line);
			console.log(line_width);
			console.log(width);
			console.log(line_width > width);*/

			// Line too long: wrap the line before this word was added
			if (line_width > width)
			{
				if (prev_line === "") {
					// if it's the first word, we push it on the line
					// to avoid an unnecessary blank line
					// and since we are wrapping, we ignore the next newline if any
					if(wrapbyword){
						while(inst.measureWidth(trimRight(cur_line)) > width){
							var wordP1 = cur_line;
							var wordP2 = "";
							while(inst.measureWidth(trimRight(wordP1)) >= width){
								wordP2 = wordP1[wordP1.length-1] + wordP2;
								wordP1 = wordP1.slice(0, -1);
							}
							addLine(inst,lineIndex,wordP1);
							cur_line = wordP2;
							lineIndex++;
						}
						lineIndex--;
					}
					else{
						addLine(inst,lineIndex,cur_line);
						cur_line = "";
						ignore_newline = true;
					}
					
				} else {
					// else we push the previous line
					addLine(inst,lineIndex,prev_line);
					cur_line = wordArray[i];
					prev_line = "";
					while(inst.measureWidth(trimRight(cur_line)) > width){
						lineIndex++;
						var wordP1 = cur_line;
						var wordP2 = "";
						while(inst.measureWidth(trimRight(wordP1)) >= width){
							wordP2 = wordP1[wordP1.length-1] + wordP2;
							wordP1 = wordP1.slice(0, -1);
						}
						addLine(inst,lineIndex,wordP1);
						cur_line = wordP2;
					}
				}

				lineIndex++;

				// Wrapping by character: avoid lines starting with spaces
				/*if (!wrapbyword && cur_line === " ")
					cur_line = "";*/
			}
		}

		// Add any leftover line
		if (trimRight(cur_line).length)
		{
			addLine(inst,lineIndex,cur_line);

			lineIndex++;
		}

		// truncate lines to the number that were used. recycle any spare line objects
		for (i = lineIndex; i < lines.length; i++)
			freeLine(lines[i]);

		lines.length = lineIndex;
	};

	instanceProto.measureWidth = function(text) {
		var spacing = this.characterSpacing;
		var len     = text.length;
		var width   = 0;
		for (var i = 0; i < len; i++) {
			width += this.getCharacterWidth(text.charAt(i)) * this.characterScale + spacing;
		}
		// we remove the trailing spacing
		width -= (width > 0) ? spacing : 0;
		return width;
	};

	/***/


	instanceProto.getCharacterWidth = function(character) {
		var widthList = this.characterWidthList;
		if (widthList[character] !== undefined) {
			// special width
			return widthList[character];
		} else {
			// common width
			return this.characterWidth;
		}
	};

	instanceProto.rebuildText = function() {
		// If text has changed, run the word wrap.
		if (this.text_changed || this.width !== this.lastwrapwidth) {
			this.textWidth = 0;
			this.textHeight = 0;
			this.type.plugin.WordWrap(this);
			this.text_changed = false;
			this.lastwrapwidth = this.width;
		}
	};
    
    // to handle floating point imprecision
	var EPSILON = 0.00001;
	instanceProto.draw = function(ctx, glmode)
	{
		var texture = this.texture_img;
		if (this.text !== "" && texture != null) {

			//console.log("draw");

			this.rebuildText();

			// textWidth and textHeight needs to be calculated here
			// since we can early exit if bounding box is too tiny to draw anything
			// be we would still like to know the dimension of the text according to current width
			if (this.height < this.characterHeight*this.characterScale + this.lineHeight) {
				return;
			}

			ctx.globalAlpha = this.opacity;


			var myx = this.x;
			var myy = this.y;

			if (this.runtime.pixel_rounding)
			{
				myx = (myx + 0.5) | 0;
				myy = (myy + 0.5) | 0;
			}

			ctx.save();
			ctx.translate(myx, myy);
			ctx.rotate(this.angle);

			// convert alignement properties to some usable values
			// useful parameters
			var angle = this.angle;
			var ha         = this.halign;
			var va         = this.valign;
			var scale      = this.characterScale;
			var charHeight = this.characterHeight * scale;
			var lineHeight = this.lineHeight;
			var charSpace  = this.characterSpacing;
			var lines = this.lines;
			var textHeight = this.textHeight;
			var charPos = this.charPosProcessed;
			var useCP = false;
			if (charPos && typeof charPos[0][2] !== "undefined") {
				useCP = true;
			}

			var cosa, sina;
			if (angle !== 0) {
				cosa = Math.cos(angle);
				sina = Math.sin(angle);
			}

			// we compute the offsets for vertical alignement in object-space
			// but it can't be negative, else it would underflow the boundingbox
			// horizontal alignement is evaluated for each line
			var halign;
			var valign = va * cr.max(0,(this.height - textHeight));

			// we get the position of the top left corner of the bounding box
			var offx = -(this.hotspotX * this.width);
			var offy = -(this.hotspotY * this.height);
			// we add to that any extra offset 
			// for vertical alignement
			offy += valign;

			var drawX ;
			var drawY = offy;
			var angle = this.angle;
			var arrI = 0
			var drX=0;
			var drY=0;
			var charAngle;
			var charCosa=0;
			var charSina=0;
			var anglOffsetX=0;
			var anglOffsetY=0;
			var lcount = 0;
			var charOpacity = 1;

			for(var i = 0; i < lines.length; i++) {
				// for horizontal alignement, we need to work line by line
				var line = lines[i].text;
				var len  = lines[i].width;

				// compute horizontal empty space
				// offset drawX according to horizontal alignement
				// indentation could be negative if long word in wrapbyword mode
				halign = ha * cr.max(0,this.width - len);		
				drawX = offx + halign;

				// we round to avoid pixel blurring
				drawY += lineHeight;
				for(var j = 0; j < line.length; j++) {

					var letter = line.charAt(j);
					// we skip unrecognized characters (creates a space)
					var clip = this.clipList[letter];

					// check if next letter fits in bounding box
					if ( drawX + this.getCharacterWidth(letter) * scale > this.width + EPSILON ) {
						break;
					}

					if (clip !== undefined) {
						if(useCP){
							if (typeof charPos[arrI] === "undefined"){
								drX = 0;
								drY = 0;
								charAngle = angle;

							}
							else{
								drX = charPos[arrI][0] * Math.cos(angle) - charPos[arrI][1] * Math.sin(angle) || 0;
								drY = charPos[arrI][1] * Math.cos(angle) - charPos[arrI][0] * Math.sin(angle) || 0;
								charAngle = cr.to_radians(charPos[arrI][2]) || 0;
								charOpacity = charPos[arrI][3]/100 || 1;
							}
							/*if(charAngle !== 0)
							{
								charCosa = Math.cos(charAngle);
								charSina = Math.sin(charAngle);
							}*/
						}

						var X = 0;
						var Y = 0;
						ctx.globalAlpha = this.opacity * charOpacity;

						var charCanvas = getColoredTexture(this, this.texture_img, (charPos[arrI] === undefined ? 'None' : charPos[arrI][4]), clip, scale, letter)

						if (useCP && charAngle !== 0) {
							var dx = drawX + this.getCharacterWidth(letter) * scale / 2;
							var dy = drawY + charHeight;
							var oa = Math.atan2(dy, dx) + Math.PI - charAngle;
							var dist = Math.sqrt(Math.pow(-dx, 2) + Math.pow(-dy, 2));
							var X = -dx - Math.cos(oa) * dist;
							var Y = -dy - Math.sin(oa) * dist;
							ctx.save();
							ctx.rotate(charAngle);
							ctx.translate(Math.round(drawX + drX + X), Math.round(drawY + drY + Y));
							if (charCanvas === this.texture_img) {
								ctx.drawImage(this.texture_img,
									clip.x, clip.y, clip.w, clip.h,
									0, 0, clip.w * scale, clip.h * scale);
							} 
							else {
								ctx.drawImage(charCanvas, 0, 0);
							}
							ctx.restore();
						}
						else {
							if (charCanvas === this.texture_img) {
								ctx.drawImage(this.texture_img,
									clip.x, clip.y, clip.w, clip.h,
									Math.round(drawX + drX + X), Math.round(drawY + drY + Y), clip.w * scale, clip.h * scale);
							}
							else {
								ctx.drawImage(charCanvas, Math.round(drawX + drX + X), Math.round(drawY + drY + Y));
							}
						}
					}
					drawX  += this.getCharacterWidth(letter) * scale + charSpace;
					if(useCP){
						arrI ++;
					}
					lcount++

				}
				drawY += charHeight;
				// check if next row fits in bounding box
				if ( drawY + charHeight + lineHeight > this.height) {
					break;
				}
			}
			ctx.restore();
		}
	};

	// drawingQuad
	var dQuad = new cr.quad();

	function createCanvas(width, height) {
	    var canvas = document.createElement('canvas');
	    canvas.width = width;
	    canvas.height = height;
	    return canvas
	}

	function getColoredTexture(inst, image, color, clip, scale, letter) {
		if(!color || color === 'None') {
			return image
		}
		if (inst.cachedImages !== undefined && inst.cachedImages[letter] !== undefined && inst.cachedImages[letter][color] !== undefined) {
			return inst.cachedImages[letter][color];
		}
		// Create new canvas
		var charCanvas = createCanvas(clip.w * scale, clip.h * scale)
		var charContext = charCanvas.getContext("2d");
		// Draw letter on it
		charContext.fillStyle = 'black';
		charContext.fillRect(0, 0, charCanvas.width, charCanvas.height);
		charContext.drawImage(image,
			clip.x, clip.y, clip.w, clip.h,
			0, 0, clip.w * scale, clip.h * scale);
		// Apply color
		charContext.globalCompositeOperation = 'multiply';
		charContext.fillStyle = color;
		charContext.fillRect(0, 0, clip.w * scale, clip.h * scale);
		// Restore the transparency
		charContext.globalCompositeOperation = 'destination-in';
		charContext.drawImage(image,
			clip.x, clip.y, clip.w, clip.h,
			0, 0, clip.w * scale, clip.h * scale);
		// Restore composite operation
		charContext.globalCompositeOperation = 'source-over';
		if (inst.cachedImages === undefined) {
			inst.cachedImages = {}
		}
		if (inst.cachedImages[letter] === undefined) {
			inst.cachedImages[letter] = {}
		}
		inst.cachedImages[letter][color] = charCanvas
		return charCanvas
	}

	function rotateQuad(quad,cosa,sina) {
		var x_temp;

		x_temp   = (quad.tlx * cosa) - (quad.tly * sina);
		quad.tly = (quad.tly * cosa) + (quad.tlx * sina);
		quad.tlx = x_temp;

		x_temp    = (quad.trx * cosa) - (quad.try_ * sina);
		quad.try_ = (quad.try_ * cosa) + (quad.trx * sina);
		quad.trx  = x_temp;

		x_temp   = (quad.blx * cosa) - (quad.bly * sina);
		quad.bly = (quad.bly * cosa) + (quad.blx * sina);
		quad.blx = x_temp;

		x_temp    = (quad.brx * cosa) - (quad.bry * sina);
		quad.bry = (quad.bry * cosa) + (quad.brx * sina);
		quad.brx  = x_temp;

	}

	instanceProto.drawGL = function(glw)
	{
		if (this.text !== "") {

			// If text has changed, run the word wrap.
			//console.log("rebuildText called")
			this.rebuildText();

			// textWidth and textHeight needs to be calculated here
			// since we can early exit if bounding box is too tiny to draw anything
			// be we would still like to know the dimension of the text according to current width
			if (this.height < this.characterHeight*this.characterScale + this.lineHeight) {
				return;
			}

			this.update_bbox();
			var q = this.bquad;
			var ox = 0;
			var oy = 0;
			if (this.runtime.pixel_rounding)
			{
				ox = ((this.x + 0.5) | 0) - this.x;
				oy = ((this.y + 0.5) | 0) - this.y;
			}


			// convert alignement properties to some usable values
			// useful parameters
			var angle      = this.angle;
			var ha         = this.halign;
			var va         = this.valign;
			var scale      = this.characterScale;
			var charHeight = this.characterHeight * scale;   // to precalculate in onCreate or on change
			var lineHeight = this.lineHeight;
			var charSpace  = this.characterSpacing;
			var lines = this.lines;
			var textHeight = this.textHeight;
			var charPos = this.charPosProcessed;
			//console.log(this.charPos.data);
			var useCP = false;
			if (charPos && typeof charPos[0][2] !== "undefined") {
				useCP = true;
			}

			var cosa,sina;
			if (angle !== 0) 
			{
				cosa = Math.cos(angle);
				sina = Math.sin(angle);
			}

			// we compute the offsets for vertical alignement in object-space
			// but it can't be negative, else it would underflow the boundingbox
			var halign;
			var valign = va * cr.max(0,(this.height - textHeight));

			// we get the position of the top left corner of the bounding box
			var offx = q.tlx + ox;
			var offy = q.tly + oy;


			var drawX ;
			var drawY = valign;
			var arrI = 0;
			var charAngle;
			var drX = 0;
			var drY = 0;
			var charCosa = 0;
			var charSina = 0;
			var anglOffsetX = 0;
			var anglOffsetY = 0;
			var charOpacity = 1;
			//console.log(this.text)
			//console.log(charPos)
			var lcount = 0

			for(var i = 0; i < lines.length; i++) {
				// for horizontal alignement, we need to work line by line
				var line       = lines[i].text;
				var lineWidth  = lines[i].width;

				// compute horizontal empty space
				// offset drawX according to horizontal alignement
				// indentation could be negative if long word in wrapbyword mode
				halign = ha * cr.max(0,this.width - lineWidth);
				//halign = Math.floor(ha * cr.max(0,this.width - lineWidth));
				drawX = halign;

				// we round to avoid pixel blurring
				drawY += lineHeight;
				for(var j = 0; j < line.length; j++) {

					var letter = line.charAt(j);
					var clipUV = this.clipUV[letter];

					if (clipUV !== undefined) {
						var clip = {
							x: clipUV.left * this.texture_img.width,
							y: clipUV.top * this.texture_img.height,
							w: clipUV.right * this.texture_img.width - clipUV.left * this.texture_img.width,
							h: clipUV.bottom * this.texture_img.height - clipUV.top * this.texture_img.height
						}
						var color = (charPos[arrI] === undefined ? 'None' : charPos[arrI][4]);
						if (color !== 'None' && this.cachedTextures !== undefined && this.cachedTextures[letter] !== undefined && this.cachedTextures[letter][color] !== undefined) {
							glw.setTexture(this.cachedTextures[letter][color]);
							clipUV = {
								top: 0,
								left: 0,
								right: 1,
								bottom: 1
							}
						}
						else if (color !== 'None') {
							var letterImg = getColoredTexture(this, this.texture_img, color, clip, 1, letter)

							if (letterImg != this.texture_img) {
								var letterTexture = this.runtime.glwrap.loadTexture(letterImg, false, this.runtime.linearSampling, this.type.texture_pixelformat);
								if (this.cachedTextures === undefined) {
									this.cachedTextures = {}
								}
								if (this.cachedTextures[letter] === undefined) {
									this.cachedTextures[letter] = {}
								}
								this.cachedTextures[letter][color] = letterTexture
								glw.setTexture(letterTexture);
								clipUV = {
									top: 0,
									left: 0,
									right: 1,
									bottom: 1
								}
							}
							else {
								glw.setTexture(this.webGL_texture);
							}
						}
						else {
							glw.setTexture(this.webGL_texture);
						}
					}

					// check if next letter fits in bounding box
					if ( drawX + this.getCharacterWidth(letter) * scale  > this.width + EPSILON) {
						break;
					}

					if(useCP){
						if(typeof charPos[arrI] === "undefined"){
							drX = 0;
							drY = 0;
							charAngle = angle;

						}
						else{
							drX = charPos[arrI][0] * Math.cos(angle) - charPos[arrI][1] * Math.sin(angle) || 0;
							drY = charPos[arrI][1] * Math.cos(angle) - charPos[arrI][0] * Math.sin(angle) || 0;
							charAngle = cr.to_radians(charPos[arrI][2]) || 0;
							charOpacity = charPos[arrI][3] !== undefined && charPos[arrI][3] !== null ? charPos[arrI][3] / 100 : 1;

							//console.log(this.lines)

						}
						if(charAngle !== 0)
						{
							charCosa = Math.cos(charAngle);
							charSina = Math.sin(charAngle);
						}
					}

					// we skip unrecognized characters (creates a space)
					if (clipUV !== undefined) {
						var clipWidth  = this.characterWidth*scale;
						var clipHeight = this.characterHeight*scale;

						// we build the quad
						dQuad.tlx  = drawX;
						dQuad.tly  = drawY;
						dQuad.trx  = drawX + clipWidth;
						dQuad.try_ = drawY;
						dQuad.blx  = drawX;
						dQuad.bly  = drawY + clipHeight;
						dQuad.brx  = drawX + clipWidth;
						dQuad.bry  = drawY + clipHeight;

						// we then rotate the quad around 0,0
						// if necessary
						if(useCP && charAngle !== 0)
						{
							var dx = drawX + this.getCharacterWidth(letter) * scale/2;
							var dy = drawY + charHeight;
							var oa = Math.atan2(dy,dx) + Math.PI - charAngle;
							var dist = Math.sqrt(Math.pow(-dx,2) + Math.pow(-dy,2));
							var X =  -dx - Math.cos(oa) * dist;
							var Y =  -dy - Math.sin(oa) * dist;
							dQuad.offset(X,Y);
							rotateQuad(dQuad,charCosa,charSina);
						}

						if(angle !== 0)
						{
							rotateQuad(dQuad,cosa,sina);
						}
						// we then apply the world space offset
						dQuad.offset(offx,offy);
						if(useCP){
							dQuad.offset(drX,drY);
						}

						glw.setOpacity(this.opacity * charOpacity);
						// and render
						glw.quadTex(
							dQuad.tlx, dQuad.tly,
							dQuad.trx, dQuad.try_,
							dQuad.brx, dQuad.bry,
							dQuad.blx, dQuad.bly,
							clipUV
						);
					}

					drawX  += this.getCharacterWidth(letter) * scale + charSpace;

					if(useCP){
						arrI ++;
					}
					lcount++


				}				
				
				drawY += charHeight;
				// check if next row fits in bounding box
				if ( drawY + charHeight + lineHeight > this.height) {
					break;
				}
			}
		}
	};

	instanceProto.update = function(){
		this.runtime.redraw = true;
		//this.text_changed = true;
		this.lastValue += Math.abs(60 * this.runtime.getDt(this));
		this.charPosProcessed = this.computeWholeArray(this.charPos.data);
	}

	instanceProto.computeWholeArray = function(array)
	{
		var result = [];
		if (this.typewriterParams !== undefined && this.typewriterActive && !this.firstFrame) {
			for (var i = 0; i < array.length; i++) {
				var cur = array[i]
				/* console.log(this.text)
				console.log(array)
				console.log(this.typeProgress)
				console.log(i) */
				var progress = this.typeProgress[i][0];
				var curX = this.typewriterParams["value"]["x"] === null ? this.compute(cur[0], i) : cr.lerp(this.typewriterParams["value"]["x"], this.compute(cur[0], i), progress)
				var curY = this.typewriterParams["value"]["y"] === null ? this.compute(cur[1], i) : cr.lerp(this.typewriterParams["value"]["y"], this.compute(cur[1], i), progress)
				var curA = this.typewriterParams["value"]["a"] === null ? this.compute(cur[2], i) : cr.lerp(this.typewriterParams["value"]["a"], this.compute(cur[2], i), progress)
				var curO = this.typewriterParams["value"]["o"] === null ? this.compute(cur[3], i, true) : cr.lerp(this.typewriterParams["value"]["o"], this.compute(cur[3], i, true), progress)
				result.push([curX, curY, curA, curO, cur[4]])
			}
		}
		else {
			for (var i = 0; i < array.length; i++) {
				var cur = array[i]
				result.push([this.compute(cur[0], i), this.compute(cur[1], i), this.compute(cur[2], i), this.compute(cur[3], i, true), cur[4]])
			}
		}
		return result
	}

	instanceProto.compute = function (value, offset, isOpacity) 
	{
		isOpacity = typeof isOpacity !== 'undefined' ? isOpacity : false;

		if (!this.hasBehavior() && this.animOffset === undefined) {
			this.animOffset = 1;
			this.defaultMagnitude = 0;
			this.defaultSpeed = 100;
		}

		if(typeof value === "number"){
			return value;
		}
		else if(typeof value === "object" && value.length == 1){
			return this.compute(value[0], offset);
		}
		else if(typeof value !== "string"){
			return 0;
		}
		var valueA = value.split(' ');
		var command = valueA[0].trim().toLowerCase();
		var param = 0;
		var param2 = this.defaultSpeed;
		var param3 = 0;
		if(typeof valueA[1] === "undefined" || valueA[1].trim() == "" || isNaN(parseInt(valueA[1].trim())))
			param = isOpacity ? 100 : (this.defaultMagnitude === 0 ? this.characterHeight : this.defaultMagnitude) / (command.startsWith("angle") ? 1 : 4)
		else
			param = parseInt(valueA[1].trim());

		if(typeof valueA[2] === "undefined" || valueA[2].trim() == ""|| isNaN(parseInt(valueA[2].trim())))
			param2 = this.defaultSpeed;
		else
			param2 = this.defaultSpeed * parseInt(valueA[2].trim()) / 100;

		if(typeof valueA[3] === "undefined" || valueA[3].trim() == ""|| isNaN(parseInt(valueA[3].trim())))
			param3 = 0;
		else
			param3 = parseInt(valueA[3].trim());

		switch (command){
			case "wave":
				return Math.sin(cr.to_radians(this.lastValue * param2/100)*10+offset * this.animOffset) * param + param3
				break;
			case "swing":
				return Math.cos(cr.to_radians(this.lastValue * param2/100)*10+offset * this.animOffset * (isOpacity? -1: 1)) * param + param3
				break;
			case "angle":
				return Math.sin(cr.to_radians(this.lastValue * param2/100)*10+offset * this.animOffset) * param + param3
				break;
			case "angle2":
				return Math.cos(cr.to_radians(this.lastValue * param2/100)*10+offset * this.animOffset) * param + param3
				break;
			case "shake":
				return (Math.random()-0.5 ) * param + param3
				break;
			default:
				var commandInt = parseInt(command)
				return isNaN(commandInt) ? (isOpacity? 100 : 0) : commandInt
		}
	}

	instanceProto.hasBehavior = function () {
		if (this.sfdxbehavior !== undefined) {
			return this.sfdxbehavior
		}
		else {
			this.sfdxbehavior = false
			var self = this;
			this.behavior_insts.forEach(function(inst) {
				if (cr.behaviors.SkymenSFPPP && inst.behavior instanceof cr.behaviors.SkymenSFPPP) {
					self.sfdxbehavior = true
				}
			})
			return this.sfdxbehavior
		}
	}
	
	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
		propsections.push({
			"title": "SpriteFont+",
			"properties": [
				{"name": "Text", "value": this.text},
				{"name": "Character width", "value": this.characterWidth},
				{"name": "Character height", "value": this.characterHeight},
				{"name": "Character scale", "value": this.characterScale},
				{"name": "Character spacing", "value": this.characterSpacing},
				{"name": "Line height", "value": this.lineHeight},
				{"name": "Horizontal alignement", "value": this.halign},
				{"name": "Vertical alignement", "value": this.valign},
				{"name": "Vertical alignement", "value": this.valign},
			]
		});
	};
	
	instanceProto.onDebugValueEdited = function (header, name, value)
	{
		switch (name) {
		case "Text":
			this.text = value;
			break;
		case "Character width":
			this.characterWidth = value;
			break;
		case "Character height":
			this.characterHeight = value;
			break;
		case "Character scale":
			this.characterScale = value;
			break;
		case "Character spacing":
			this.characterSpacing = value;
			break;
		case "Line height":
			this.lineHeight = value;
			break;
		case "Horizontal alignement":
			this.halign = value;
			break;
		case "Vertical alignement":
			this.valign = value;
			break;
		}
		
		this.text_changed = true;
	};
	/**END-PREVIEWONLY**/

	//////////////////////////////////////
	// Conditions
	function Cnds() {}

	Cnds.prototype.CompareText = function(text_to_compare, case_sensitive)
	{
		if (case_sensitive)
			return this.text == text_to_compare;
		else
			return cr.equals_nocase(this.text, text_to_compare);
	};

	pluginProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {}

	Acts.prototype.SetText = function(param)
	{
		if (cr.is_number(param) && param < 1e9)
			param = Math.round(param * 1e10) / 1e10;	// round to nearest ten billionth - hides floating point errors

		var text_to_set = param.toString();

		if (this.text !== text_to_set)
		{
			this.text = text_to_set;
			this.text_changed = true;
			this.runtime.redraw = true;
		}
	};

	Acts.prototype.AppendText = function(param)
	{
		if (cr.is_number(param))
			param = Math.round(param * 1e10) / 1e10;	// round to nearest ten billionth - hides floating point errors

		var text_to_append = param.toString();

		if (text_to_append)	// not empty
		{
			this.text += text_to_append;
			this.text_changed = true;
			this.runtime.redraw = true;
		}
	};

	Acts.prototype.SetScale = function(param)
	{
		if (param !== this.characterScale) {
			this.characterScale = param;
			this.text_changed = true;
			this.runtime.redraw = true;
		}
	};

	Acts.prototype.SetCharacterSpacing = function(param)
	{
		if (param !== this.CharacterSpacing) {
			this.characterSpacing = param;
			this.text_changed = true;
			this.runtime.redraw = true;
		}
	};

	Acts.prototype.SetLineHeight = function(param)
	{
		if (param !== this.lineHeight) {
			this.lineHeight = param;
			this.text_changed = true;
			this.runtime.redraw = true;
		}
	};

	instanceProto.SetCharWidth = function(character,width) {
		var w = parseInt(width,10);
		if (this.characterWidthList[character] !== w) {
			this.characterWidthList[character] = w;
			this.text_changed = true;
			this.runtime.redraw = true;
		}
	};

	Acts.prototype.SetCharacterWidth = function(characterSet,width)
	{
		if (characterSet !== "") {
			for(var c = 0; c < characterSet.length; c++) {
				this.SetCharWidth(characterSet.charAt(c),width);
			}
		}
	};
	
	Acts.prototype.SetEffect = function (effect)
	{
		this.compositeOp = cr.effectToCompositeOp(effect);
		cr.setGLBlend(this, effect, this.runtime.gl);
		this.runtime.redraw = true;
	};

	Acts.prototype.SetVerAl = function (val)
	{
		if(this.clamp){
			this.valign = cr.clamp(val,0,100)/100;
		}
		else{
			this.valign = val/100;
		}
		this.text_changed = true;
		this.runtime.redraw = true;	
	};


	Acts.prototype.SetHorAl = function (val)
	{
		if(this.clamp){
			this.halign = cr.clamp(val,0,100)/100;
		}
		else{
			this.halign = val/100;
		}
		this.text_changed = true;
		this.runtime.redraw = true;	
	};

	Acts.prototype.SetAl = function (val,val2)
	{
		if(this.clamp){
			this.halign = cr.clamp(val,0,100)/100;
			this.valign = cr.clamp(val2,0,100)/100;
		}
		else{
			this.halign = val/100;
			this.valign = val2/100;
		}

		this.text_changed = true;
		this.runtime.redraw = true;	
	};

	Acts.prototype.SetWrap = function (val)
	{
		this.wrapbyword = (val === 0);	// 0=word, 1=character, 2 = None
		this.nowrap = (val === 2); // 0=word, 1=character, 2 = None
		this.text_changed = true;
		this.runtime.redraw = true;	
	};

	Acts.prototype.SetClamp = function (val)
	{
		this.clamp = (val === 0); //0=Yes, 1=No
		if(this.clamp){
			this.halign = cr.clamp(this.halign,0,1);
			this.valign = cr.clamp(this.valign,0,1);
		}
		else{
			this.halign = this.halign;
			this.valign = this.valign;
		}
		this.text_changed = true;
		this.runtime.redraw = true;
	};

	Acts.prototype.SetCharPos = function (val)
	{
		if(this.charPos !== JSON.parse(val)){
			this.charPos  		= JSON.parse(val);
			this.text_changed 	= true;
			this.runtime.redraw = true;
		}
		
	};

	Acts.prototype.Redraw = function ()
	{
		this.update();
	};

	Acts.prototype.LoadURL = function (url_, crossOrigin_, cw, ch)
	{
		var img = new Image();
		var self = this;
		this.characterWidth   = cw > 0? cw : this.characterWidth;
		this.characterHeight  = ch > 0? ch : this.characterHeight;
		
		
		
		img.onload = function ()
		{
			self.texture_img = img;
			
			// WebGL renderer
			if (self.runtime.glwrap)
			{
				// Delete any previous own texture
				if (self.has_own_texture && self.webGL_texture)
					self.runtime.glwrap.deleteTexture(self.webGL_texture);
					
				self.webGL_texture = self.runtime.glwrap.loadTexture(img, true, self.runtime.linearSampling);
			}
			// Canvas2D renderer
			else
			{
				self.pattern = self.runtime.ctx.createPattern(img, "repeat");
			}
			
			self.has_own_texture = true;
			self.runtime.redraw = true;
			self.runtime.trigger(cr.plugins_.SkymenSFPlusPLus.prototype.cnds.OnURLLoaded, self);
		};
		
		if (url_.substr(0, 5) !== "data:" && crossOrigin_ === 0)
			img.crossOrigin = "anonymous";
		
		// use runtime function to work around WKWebView permissions
		this.runtime.setImageSrc(img, url_);
	};

	pluginProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {}

	Exps.prototype.CharacterWidth = function(ret,character)
	{
		ret.set_int(this.getCharacterWidth(character));
	};

	Exps.prototype.CharacterHeight = function(ret)
	{
		ret.set_int(this.characterHeight);
	};

	Exps.prototype.CharacterScale = function(ret)
	{
		ret.set_float(this.characterScale);
	};

	Exps.prototype.CharacterSpacing = function(ret)
	{
		ret.set_int(this.characterSpacing);
	};

	Exps.prototype.LineHeight = function(ret)
	{
		ret.set_int(this.lineHeight);
	};

	Exps.prototype.Text = function(ret)
	{
		ret.set_string(this.text);
	};
	Exps.prototype.TextWidth = function (ret)
	{
		this.rebuildText();
		ret.set_float(this.textWidth);
	};

	Exps.prototype.TextHeight = function (ret)
	{
		this.rebuildText();
		ret.set_float(this.textHeight);
	};

	Exps.prototype.FullTextWidth = function (ret)
	{
		ret.set_float(this.measureWidth(this.text));
	};

	Exps.prototype.HAlign = function (ret)
	{
		ret.set_float(this.halign);
	};

	Exps.prototype.VAlign = function (ret)
	{
		ret.set_float(this.valign);
	};

	Exps.prototype.CharPos = function(ret)
	{
		ret.set_string(this.charPos);
	};

	pluginProto.exps = new Exps();

}());