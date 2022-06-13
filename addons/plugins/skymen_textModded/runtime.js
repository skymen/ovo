// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.TextModded = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.TextModded.prototype;

	pluginProto.onCreate = function ()
	{
		// Override the 'set width' action
		pluginProto.acts.SetWidth = function (w)
		{
			if (this.width !== w)
			{
				this.width = w;
				this.text_changed = true;	// also recalculate text wrapping
				this.set_bbox_changed();
			}
		};
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
	};
	
	typeProto.onLostWebGLContext = function ()
	{
		if (this.is_family)
			return;
			
		var i, len, inst;
		for (i = 0, len = this.instances.length; i < len; i++)
		{
			inst = this.instances[i];
			inst.mycanvas = null;
			inst.myctx = null;
			inst.mytex = null;
		}
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		
		if (this.recycled)
			cr.clearArray(this.lines);
		else
			this.lines = [];		// for word wrapping
		
		this.text_changed = true;
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	var requestedWebFonts = {};		// already requested web fonts have an entry here
	
	instanceProto.onCreate = function()
	{
		this.text = this.properties[0];
		this.visible = (this.properties[1] === 0);		// 0=visible, 1=invisible
		
		// "[bold|italic] 12pt Arial"
		this.font = this.properties[2];
		
		this.color = this.properties[3];
		this.clamp = this.properties[4]===0;
		if(this.clamp){
			this.halign = cr.clamp(this.properties[5], 0, 100);				// 0=left, 1=center, 2=right
			this.valign = cr.clamp(this.properties[6], 0, 100);				// 0=top, 1=center, 2=bottom
		}
		else{
			this.halign = this.properties[5];				// 0=left, 1=center, 2=right
			this.valign = this.properties[6];				// 0=top, 1=center, 2=bottom
		}
		
		
		this.wrapbyword = (this.properties[8] === 0);
		this.nowrap = (this.properties[8] === 2);
		this.wrap = this.properties[8];	// 0=word, 1=character 2=none
		this.lastwidth = this.width;
		this.lastwrapwidth = this.width;
		this.lastheight = this.height;
		
		this.line_height_offset = this.properties[9];
		
		// Get the font height in pixels.
		// Look for token ending "NNpt" in font string (e.g. "bold 12pt Arial").
		this.facename = "";
		this.fontstyle = "";
		this.ptSize = 0;
		this.textWidth = 0;
		this.textHeight = 0;
		
		this.parseFont();
		
		// For WebGL rendering
		this.mycanvas = null;
		this.myctx = null;
		this.mytex = null;
		this.need_text_redraw = false;
		this.last_render_tick = this.runtime.tickcount;
		
		if (this.recycled)
			this.rcTex.set(0, 0, 1, 1);
		else
			this.rcTex = new cr.rect(0, 0, 1, 1);
			
		// In WebGL renderer tick this text object to release memory if not rendered any more
		if (this.runtime.glwrap)
			this.runtime.tickMe(this);
		
		assert2(this.pxHeight, "Could not determine font text height");
	};
	
	instanceProto.parseFont = function ()
	{
		var arr = this.font.split(" ");
		
		var i;
		for (i = 0; i < arr.length; i++)
		{
			// Ends with 'pt'
			if (arr[i].substr(arr[i].length - 2, 2) === "pt")
			{
				this.ptSize = parseInt(arr[i].substr(0, arr[i].length - 2));
				this.pxHeight = Math.ceil((this.ptSize / 72.0) * 96.0) + 4;	// assume 96dpi...
				
				if (i > 0)
					this.fontstyle = arr[i - 1];
				
				// Get the face name. Combine all the remaining tokens in case it's a space
				// separated font e.g. "Comic Sans MS"
				this.facename = arr[i + 1];
				
				for (i = i + 2; i < arr.length; i++)
					this.facename += " " + arr[i];
					
				break;
			}
		}
	};
	
	instanceProto.saveToJSON = function ()
	{
		return {
			"t": this.text,
			"f": this.font,
			"c": this.color,
			"ha": this.halign,
			"va": this.valign,
			"clamp": this.clamp,
			"wr": this.wrapbyword,
			"nw": this.nowrap,
			"wrap": this.wrap,
			"lho": this.line_height_offset,
			"fn": this.facename,
			"fs": this.fontstyle,
			"ps": this.ptSize,
			"pxh": this.pxHeight,
			"tw": this.textWidth,
			"th": this.textHeight,
			"lrt": this.last_render_tick
		};
	};
	
	instanceProto.loadFromJSON = function (o)
	{
		this.text = o["t"];
		this.font = o["f"];
		this.color = o["c"];
		this.halign = o["ha"];
		this.valign = o["va"];
		this.clamp = o["clamp"];
		this.wrapbyword = o["wr"];
		this.nowrap = o["nw"];
		this.wrap = o["wrap"];
		this.line_height_offset = o["lho"];
		this.facename = o["fn"];
		this.fontstyle = o["fs"];
		this.ptSize = o["ps"];
		this.pxHeight = o["pxh"];
		this.textWidth = o["tw"];
		this.textHeight = o["th"];
		this.last_render_tick = o["lrt"];
		
		this.text_changed = true;
		this.lastwidth = this.width;
		this.lastwrapwidth = this.width;
		this.lastheight = this.height;
	};
	
	instanceProto.tick = function ()
	{
		// In WebGL renderer, if not rendered for 300 frames (about 5 seconds), assume
		// the object has gone off-screen and won't need its textures any more.
		// This allows us to free its canvas, context and WebGL texture to save memory.
		if (this.runtime.glwrap && this.mytex && (this.runtime.tickcount - this.last_render_tick >= 300))
		{
			// Only do this if on-screen, otherwise static scenes which aren't re-rendering will release
			// text objects that are on-screen.
			var layer = this.layer;
            this.update_bbox();
            var bbox = this.bbox;

            if (bbox.right < layer.viewLeft || bbox.bottom < layer.viewTop || bbox.left > layer.viewRight || bbox.top > layer.viewBottom)
			{
				this.runtime.glwrap.deleteTexture(this.mytex);
				this.mytex = null;
				this.myctx = null;
				this.mycanvas = null;
			}
		}
	};
	
	instanceProto.onDestroy = function ()
	{
		// Remove references to allow GC to collect and save memory
		this.myctx = null;
		this.mycanvas = null;
		
		if (this.runtime.glwrap && this.mytex)
			this.runtime.glwrap.deleteTexture(this.mytex);
		
		this.mytex = null;
	};
	
	instanceProto.updateFont = function ()
	{
		this.font = this.fontstyle + " " + this.ptSize.toString() + "pt " + this.facename;
		this.text_changed = true;
		this.runtime.redraw = true;
	};

	instanceProto.draw = function(ctx, glmode)
	{
		ctx.font = this.font;
		ctx.textBaseline = "top";
		ctx.fillStyle = this.color;
		
		ctx.globalAlpha = glmode ? 1 : this.opacity;

		var myscale = 1;
		
		if (glmode)
		{
			myscale = Math.abs(this.layer.getScale());
			ctx.save();
			ctx.scale(myscale, myscale);
		}
		
		// If text has changed, run the word wrap.
		if (this.text_changed || this.width !== this.lastwrapwidth)
		{
			this.type.plugin.WordWrap(this.text, this.lines, ctx, this.width, this.wrapbyword, this.nowrap);
			this.text_changed = false;
			this.lastwrapwidth = this.width;
		}
		
		// Draw each line after word wrap
		this.update_bbox();
		var penX = glmode ? 0 : this.bquad.tlx;
		var penY = glmode ? 0 : this.bquad.tly;
		
		if (this.runtime.pixel_rounding)
		{
			penX = (penX + 0.5) | 0;
			penY = (penY + 0.5) | 0;
		}
		
		if (this.angle !== 0 && !glmode)
		{
			ctx.save();
			ctx.translate(penX, penY);
			ctx.rotate(this.angle);
			penX = 0;
			penY = 0;
		}
		
		var endY = penY + this.height;
		var line_height = this.pxHeight;
		line_height += this.line_height_offset;
		var drawX;
		var i;
		var fucker = 0
		if (this.valign > 50){
			var fucker = 2 * (this.valign - 50 )/50
		}
		penY += Math.max(this.height * this.valign/100 - (this.lines.length * line_height) * this.valign/100 - fucker, 0);

		// Adjust penY for vertical alignment
		/*
		if (this.valign === 50)		// center
			penY += Math.max(this.height / 2 - (this.lines.length * line_height) / 2, 0);
		else if (this.valign === 100)	// bottom
			penY += Math.max(this.height - (this.lines.length * line_height) - 2, 0);
		*/
		for (i = 0; i < this.lines.length; i++)
		{
			// Adjust the line draw position depending on alignment
			drawX = penX+ (this.width - this.lines[i].width) * this.halign/100;
			
			/*if (this.halign === 1)		// center
				drawX = penX + (this.width - this.lines[i].width) / 2;
			else if (this.halign === 2)	// right
				drawX = penX + (this.width - this.lines[i].width);
			*/
			ctx.fillText(this.lines[i].text, drawX, penY);
			penY += line_height;
			
			if (penY >= endY - line_height)
				break;
		}
		
		if (this.angle !== 0 || glmode)
			ctx.restore();
			
		this.last_render_tick = this.runtime.tickcount;
	};
	
	instanceProto.drawGL = function(glw)
	{
		if (this.width < 1 || this.height < 1)
			return;
		
		var need_redraw = this.text_changed || this.need_text_redraw;
		this.need_text_redraw = false;
		var layer_scale = this.layer.getScale();
		var layer_angle = this.layer.getAngle();
		var rcTex = this.rcTex;
		
		// Calculate size taking in to account scale
		var floatscaledwidth = layer_scale * this.width;
		var floatscaledheight = layer_scale * this.height;
		var scaledwidth = Math.ceil(floatscaledwidth);
		var scaledheight = Math.ceil(floatscaledheight);
		var absscaledwidth = Math.abs(scaledwidth);
		var absscaledheight = Math.abs(scaledheight);
		
		var halfw = this.runtime.draw_width / 2;
		var halfh = this.runtime.draw_height / 2;
		
		// Create 2D context for this instance if not already
		if (!this.myctx)
		{
			this.mycanvas = document.createElement("canvas");
			this.mycanvas.width = absscaledwidth;
			this.mycanvas.height = absscaledheight;
			this.lastwidth = absscaledwidth;
			this.lastheight = absscaledheight;
			need_redraw = true;
			this.myctx = this.mycanvas.getContext("2d");
		}
		
		// Update size if changed
		if (absscaledwidth !== this.lastwidth || absscaledheight !== this.lastheight)
		{
			this.mycanvas.width = absscaledwidth;
			this.mycanvas.height = absscaledheight;
			
			if (this.mytex)
			{
				glw.deleteTexture(this.mytex);
				this.mytex = null;
			}
			
			need_redraw = true;
		}
		
		// Need to update the GL texture
		if (need_redraw)
		{
			// Draw to my context
			this.myctx.clearRect(0, 0, absscaledwidth, absscaledheight);
			this.draw(this.myctx, true);
			
			// Create GL texture if none exists
			// Create 16-bit textures (RGBA4) on mobile to reduce memory usage - quality impact on desktop
			// was almost imperceptible
			if (!this.mytex)
				this.mytex = glw.createEmptyTexture(absscaledwidth, absscaledheight, this.runtime.linearSampling, this.runtime.isMobile);
				
			// Copy context to GL texture
			glw.videoToTexture(this.mycanvas, this.mytex, this.runtime.isMobile);
		}
		
		this.lastwidth = absscaledwidth;
		this.lastheight = absscaledheight;
		
		// Draw GL texture
		glw.setTexture(this.mytex);
		glw.setOpacity(this.opacity);
		
		glw.resetModelView();
		glw.translate(-halfw, -halfh);
		glw.updateModelView();
		
		var q = this.bquad;
		
		var tlx = this.layer.layerToCanvas(q.tlx, q.tly, true, true);
		var tly = this.layer.layerToCanvas(q.tlx, q.tly, false, true);
		var trx = this.layer.layerToCanvas(q.trx, q.try_, true, true);
		var try_ = this.layer.layerToCanvas(q.trx, q.try_, false, true);
		var brx = this.layer.layerToCanvas(q.brx, q.bry, true, true);
		var bry = this.layer.layerToCanvas(q.brx, q.bry, false, true);
		var blx = this.layer.layerToCanvas(q.blx, q.bly, true, true);
		var bly = this.layer.layerToCanvas(q.blx, q.bly, false, true);
		
		if (this.runtime.pixel_rounding || (this.angle === 0 && layer_angle === 0))
		{
			var ox = ((tlx + 0.5) | 0) - tlx;
			var oy = ((tly + 0.5) | 0) - tly
			
			tlx += ox;
			tly += oy;
			trx += ox;
			try_ += oy;
			brx += ox;
			bry += oy;
			blx += ox;
			bly += oy;
		}
		
		if (this.angle === 0 && layer_angle === 0)
		{
			trx = tlx + scaledwidth;
			try_ = tly;
			brx = trx;
			bry = tly + scaledheight;
			blx = tlx;
			bly = bry;
			rcTex.right = 1;
			rcTex.bottom = 1;
		}
		else
		{
			rcTex.right = floatscaledwidth / scaledwidth;
			rcTex.bottom = floatscaledheight / scaledheight;
		}
		
		glw.quadTex(tlx, tly, trx, try_, brx, bry, blx, bly, rcTex);
		
		glw.resetModelView();
		glw.scale(layer_scale, layer_scale);
		glw.rotateZ(-this.layer.getAngle());
		glw.translate((this.layer.viewLeft + this.layer.viewRight) / -2, (this.layer.viewTop + this.layer.viewBottom) / -2);
		glw.updateModelView();
		
		this.last_render_tick = this.runtime.tickcount;
	};
	
	var wordsCache = [];

	pluginProto.TokeniseWords = function (text)
	{
		cr.clearArray(wordsCache);
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
	
	var linesCache = [];
	
	function allocLine()
	{
		if (linesCache.length)
			return linesCache.pop();
		else
			return {};
	};
	
	function freeLine(l)
	{
		linesCache.push(l);
	};
	
	function freeAllLines(arr)
	{
		var i, len;
		for (i = 0, len = arr.length; i < len; i++)
		{
			freeLine(arr[i]);
		}
		
		cr.clearArray(arr);
	};

	pluginProto.WordWrap = function (text, lines, ctx, width, wrapbyword, nowrap)
	{
		if (!text || !text.length)
		{
			freeAllLines(lines);
			return;
		}
			
		if (width <= 2.0)
		{
			freeAllLines(lines);
			return;
		}
		
		// If under 100 characters (i.e. a fairly short string), try a short string optimisation: just measure the text
		// and see if it fits on one line, without going through the tokenise/wrap.
		// Text musn't contain a linebreak!
		if (text.length <= 100 && text.indexOf("\n") === -1)
		{
			var all_width = ctx.measureText(text).width;
			
			if (all_width <= width)
			{
				// fits on one line
				freeAllLines(lines);
				lines.push(allocLine());
				lines[0].text = text;
				lines[0].width = all_width;
				return;
			}
		}

		if(nowrap){
			var all_width = ctx.measureText(text).width;
			freeAllLines(lines);
			lines.push(allocLine());
			lines[0].text = text;
			lines[0].width = all_width;
		}
		else{
			this.WrapText(text, lines, ctx, width, wrapbyword);
		}
	};
	
	function trimSingleSpaceRight(str)
	{
		if (!str.length || str.charAt(str.length - 1) !== " ")
			return str;
		
		return str.substring(0, str.length - 1);
	};

	pluginProto.WrapText = function (text, lines, ctx, width, wrapbyword)
	{
		var wordArray;
		
		if (wrapbyword)
		{
			this.TokeniseWords(text);	// writes to wordsCache
			wordArray = wordsCache;
		}
		else
			wordArray = text;
			
		var cur_line = "";
		var prev_line;
		var line_width;
		var i;
		var lineIndex = 0;
		var line;
		
		for (i = 0; i < wordArray.length; i++)
		{
			// Look for newline
			if (wordArray[i] === "\n")
			{
				// Flush line.  Recycle a line if possible
				if (lineIndex >= lines.length)
					lines.push(allocLine());
				
				cur_line = trimSingleSpaceRight(cur_line);		// for correct center/right alignment
				line = lines[lineIndex];
				line.text = cur_line;
				line.width = ctx.measureText(cur_line).width;
					
				lineIndex++;
				cur_line = "";
				continue;
			}
			
			// Otherwise add to line
			prev_line = cur_line;
			cur_line += wordArray[i];
			
			// Measure line
			line_width = ctx.measureText(cur_line).width;
			
			// Line too long: wrap the line before this word was added
			if (line_width >= width)
			{
				// Append the last line's width to the string object
				if (lineIndex >= lines.length)
					lines.push(allocLine());
				
				prev_line = trimSingleSpaceRight(prev_line);
				line = lines[lineIndex];
				line.text = prev_line;
				line.width = ctx.measureText(prev_line).width;
					
				lineIndex++;
				cur_line = wordArray[i];
				
				// Wrapping by character: avoid lines starting with spaces
				if (!wrapbyword && cur_line === " ")
					cur_line = "";
			}
		}
		
		// Add any leftover line
		if (cur_line.length)
		{
			if (lineIndex >= lines.length)
				lines.push(allocLine());
			
			cur_line = trimSingleSpaceRight(cur_line);
			line = lines[lineIndex];
			line.text = cur_line;
			line.width = ctx.measureText(cur_line).width;
				
			lineIndex++;
		}
		
		// truncate lines to the number that were used. recycle any spare line objects
		for (i = lineIndex; i < lines.length; i++)
			freeLine(lines[i]);
		
		lines.length = lineIndex;
	};
	
	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
		propsections.push({
			"title": "Text",
			"properties": [
				{"name": "Text", "value": this.text},
				{"name": "Font", "value": this.font},
				{"name": "Line height", "value": this.line_height_offset},
				{"name": "Horizontal Align", "value": this.halign},
				{"name": "Vertical Align", "value": this.valign},
				{"name": "Clamp", "value": this.clamp},
				{"name": "Wrapping", "value": this.wrap},
			]
		});
	};
	
	instanceProto.onDebugValueEdited = function (header, name, value)
	{
		if (name === "Text")
			this.text = value;
		else if (name === "Font")
		{
			this.font = value;
			this.parseFont();
		}
		else if (name === "Line height")
			this.line_height_offset = value;
		else if (name === "Horizontal Align"){
			this.halign = this.clamp? cr.clamp(value, 0, 100) : value;
		}
		else if (name === "Vertical Align"){
			this.valign = this.clamp? cr.clamp(value, 0, 100) : value;
		}
		else if (name === "Clamp"){
			this.clamp = value;
			this.halign = this.clamp? cr.clamp(this.halign, 0, 100) : this.halign;
			this.valign = this.clamp? cr.clamp(this.valign, 0, 100) : this.valign;
		}
		else if (name === "Wrapping"){
			this.wrap = cr.clamp(Math.floor(value),0,2);
			this.nowrap = this.wrap === 2;
			this.wrapbyword = this.wrap === 0;
		}
		this.text_changed = true;
			
	};
	/**END-PREVIEWONLY**/

	//////////////////////////////////////
	// Conditions
	function Cnds() {};

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
	function Acts() {};

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
	
	Acts.prototype.SetFontFace = function (face_, style_)
	{
		var newstyle = "";
		
		switch (style_) {
		case 1: newstyle = "bold"; break;
		case 2: newstyle = "italic"; break;
		case 3: newstyle = "bold italic"; break;
		}
		
		if (face_ === this.facename && newstyle === this.fontstyle)
			return;		// no change
			
		this.facename = face_;
		this.fontstyle = newstyle;
		this.updateFont();
	};
	
	Acts.prototype.SetFontSize = function (size_)
	{
		if (this.ptSize === size_)
			return;

		this.ptSize = size_;
		this.pxHeight = Math.ceil((this.ptSize / 72.0) * 96.0) + 4;	// assume 96dpi...
		this.updateFont();
	};
	
	Acts.prototype.SetFontColor = function (rgb)
	{
		var newcolor = "rgb(" + cr.GetRValue(rgb).toString() + "," + cr.GetGValue(rgb).toString() + "," + cr.GetBValue(rgb).toString() + ")";
		
		if (newcolor === this.color)
			return;

		this.color = newcolor;
		this.need_text_redraw = true;
		this.runtime.redraw = true;
	};

	Acts.prototype.SetHorAl = function (val)
	{
		this.halign = this.clamp? cr.clamp(val, 0, 100) : val;
		this.need_text_redraw = true;
		this.runtime.redraw = true;
	};

	Acts.prototype.SetVerAl = function (val)
	{
		this.valign = this.clamp? cr.clamp(val, 0, 100) : val;
		this.need_text_redraw = true;
		this.runtime.redraw = true;
	};

	Acts.prototype.SetAl = function (hval, vval)
	{
		this.halign = this.clamp? cr.clamp(hval, 0, 100) : hval;
		this.valign = this.clamp? cr.clamp(vval, 0, 100) : vval;
		this.need_text_redraw = true;
		this.runtime.redraw = true;
	};

	Acts.prototype.SetWrap = function (wrap)
	{
		this.wrapbyword = (wrap === 0);
		this.nowrap = (wrap === 2);
		this.need_text_redraw = true;
		this.runtime.redraw = true;
		this.text_changed = true;
	};

	Acts.prototype.SetClamp = function (clamp)
	{
		this.clamp = clamp === 0
		this.halign = this.clamp? cr.clamp(this.halign, 0, 100) : this.halign;
		this.valign = this.clamp? cr.clamp(this.valign, 0, 100) : this.valign;
		this.need_text_redraw = true;
		this.runtime.redraw = true;
		this.text_changed = true;
	};

	Acts.prototype.SetHotspot = function (hs)
	{
		this.SetHotspot(GetHotspot(hs));
	};
	
	Acts.prototype.SetWebFont = function (familyname_, cssurl_)
	{
		if (this.runtime.isDomFree)
		{
			cr.logexport("[Construct 2] Text plugin: 'Set web font' not supported on this platform - the action has been ignored");
			return;		// DC todo
		}
		
		var self = this;
		var refreshFunc = (function () {
							self.runtime.redraw = true;
							self.text_changed = true;
						});

		// Already requested this web font?
		if (requestedWebFonts.hasOwnProperty(cssurl_))
		{
			// Use it immediately without requesting again.  Whichever object
			// made the original request will refresh the canvas when it finishes
			// loading.
			var newfacename = "'" + familyname_ + "'";
			
			if (this.facename === newfacename)
				return;	// no change
				
			this.facename = newfacename;
			this.updateFont();
			
			// There doesn't seem to be a good way to test if the font has loaded,
			// so just fire a refresh every 100ms for the first 1 second, then
			// every 1 second after that up to 10 sec - hopefully will have loaded by then!
			for (var i = 1; i < 10; i++)
			{
				setTimeout(refreshFunc, i * 100);
				setTimeout(refreshFunc, i * 1000);
			}
		
			return;
		}
		
		// Otherwise start loading the web font now
		var wf = document.createElement("link");
		wf.href = cssurl_;
		wf.rel = "stylesheet";
		wf.type = "text/css";
		wf.onload = refreshFunc;
					
		document.getElementsByTagName('head')[0].appendChild(wf);
		requestedWebFonts[cssurl_] = true;
		
		this.facename = "'" + familyname_ + "'";
		this.updateFont();
					
		// Another refresh hack
		for (var i = 1; i < 10; i++)
		{
			setTimeout(refreshFunc, i * 100);
			setTimeout(refreshFunc, i * 1000);
		}
		
		log("Requesting web font '" + cssurl_ + "'... (tick " + this.runtime.tickcount.toString() + ")");
	};
	
	Acts.prototype.SetEffect = function (effect)
	{
		this.blend_mode = effect;
		this.compositeOp = cr.effectToCompositeOp(effect);
		cr.setGLBlend(this, effect, this.runtime.gl);
		this.runtime.redraw = true;
	};

	pluginProto.acts = new Acts();
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};

	Exps.prototype.Text = function(ret)
	{
		ret.set_string(this.text);
	};

	Exps.prototype.HAlign = function(ret)
	{
		ret.set_int(this.halign);
	};
	
	Exps.prototype.VAlign = function(ret)
	{
		ret.set_int(this.valign);
	};

	Exps.prototype.FaceName = function (ret)
	{
		ret.set_string(this.facename);
	};
	
	Exps.prototype.FaceSize = function (ret)
	{
		ret.set_int(this.ptSize);
	};

	Exps.prototype.LineHeight = function (ret)
	{
		ret.set_int(this.pxHeight + this.line_height_offset);
	};

	
	
	Exps.prototype.TextWidth = function (ret)
	{
		var w = 0;
		var i, len, x;
		for (i = 0, len = this.lines.length; i < len; i++)
		{
			x = this.lines[i].width;
			
			if (w < x)
				w = x;
		}
		
		ret.set_int(w);
	};
	
	Exps.prototype.TextHeight = function (ret)
	{
		ret.set_int(this.lines.length * (this.pxHeight + this.line_height_offset) - this.line_height_offset);
	};
	
	pluginProto.exps = new Exps();
		
}());