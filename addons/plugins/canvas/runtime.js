// ECMAScript 5 strict mode
"use strict";

/**
 * flood fill algorithm 
 * image_data is an array with pixel information as provided in canvas_context.data
 * (x, y) is starting point and color is the color used to replace old color
 */
function flood_fill(image_data, canvas_width, canvas_height, x, y, _color) {
	if (x<0 || x>canvas_width){		return;}
	if (y<0 || y>canvas_height){	return;}
		
	//convert color
	var color = $('<div></div>').css('background-color', _color).css('background-color');
	//alert(color);
    if(color == "transparent")
        color="rgb(0,0,0)";
    color=color.slice(4,-1).split(",");
    var components = 4; //rgba

    // unpack values
    var  fillColorR = color[0];
    var  fillColorG = color[1];
    var  fillColorB = color[2];

    // get start point
    var pixel_pos = (y*canvas_width + x) * components;
    var startR = image_data[pixel_pos];
    var startG = image_data[pixel_pos + 1];
    var startB = image_data[pixel_pos + 2];
    
    if(fillColorR==startR && fillColorG==startG && fillColorB==startB)
        return;  //prevent inf loop.

    function matchStartColor(pixel_pos) {
      return startR == image_data[pixel_pos] && 
             startG == image_data[pixel_pos+1] &&
             startB == image_data[pixel_pos+2];
    }

    function colorPixel(pixel_pos) {
      image_data[pixel_pos] = fillColorR;
      image_data[pixel_pos+1] = fillColorG;
      image_data[pixel_pos+2] = fillColorB;
      image_data[pixel_pos+3] = 255;
    }
    
    function trace(dir) {
        if(matchStartColor(pixel_pos + dir*components)) {
          if(!sides[dir]) {
            pixelStack.push([x + dir, y]);
            sides[dir]= true;
          }
        }
        else if(sides[dir]) {
          sides[dir]= false;
        }
    }

    var pixelStack = [[x, y]];

    while(pixelStack.length)
    {
      var newPos, x, y, pixel_pos, reachLeft, reachRight;
      newPos = pixelStack.pop();
      x = newPos[0];
      y = newPos[1];
      
      pixel_pos = (y*canvas_width + x) * components;
      while(y-- >= 0 && matchStartColor(pixel_pos))
      {
        pixel_pos -= canvas_width * components;
      }
      pixel_pos += canvas_width * components;
      ++y;

      var sides = [];
      sides[-1] = false;
      sides[1] = false;

      while(y++ < canvas_height-1 && matchStartColor(pixel_pos)) {
        colorPixel(pixel_pos);

        // left side
        if(x > 0) {
            trace(-1);
        }

        // right side
        if(x < canvas_width-1) { 
            trace(1);
        }
        pixel_pos += canvas_width * components;

      }
    }
}

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.c2canvas = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.c2canvas.prototype;
		
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
		this.texture_img.src = this.texture_file;
		this.texture_img.cr_filesize = this.texture_filesize;
		
		// Tell runtime to wait for this to load
		this.runtime.wait_for_textures.push(this.texture_img);
		
		//this.pattern = null;
		//this.webGL_texture = null;
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	var fxNames = [ "lighter",
					"xor",
					"copy",
					"destination-over",
					"source-in",
					"destination-in",
					"source-out",
					"destination-out",
					"source-atop",
					"destination-atop"];

	instanceProto.effectToCompositeOp = function(effect)
	{
		// (none) = source-over
		if (effect <= 0 || effect >= 11)
			return "source-over";
			
		// (none)|Additive|XOR|Copy|Destination over|Source in|Destination in|Source out|Destination out|Source atop|Destination atop
		return fxNames[effect - 1];	// not including "none" so offset by 1
	};
	
	instanceProto.updateBlend = function(effect)
	{
		var gl = this.runtime.gl;
		
		if (!gl)
			return;
			
		// default alpha blend
		this.srcBlend = gl.ONE;
		this.destBlend = gl.ONE_MINUS_SRC_ALPHA;
		
		switch (effect) {
		case 1:		// lighter (additive)
			this.srcBlend = gl.ONE;
			this.destBlend = gl.ONE;
			break;
		case 2:		// xor
			break;	// todo
		case 3:		// copy
			this.srcBlend = gl.ONE;
			this.destBlend = gl.ZERO;
			break;
		case 4:		// destination-over
			this.srcBlend = gl.ONE_MINUS_DST_ALPHA;
			this.destBlend = gl.ONE;
			break;
		case 5:		// source-in
			this.srcBlend = gl.DST_ALPHA;
			this.destBlend = gl.ZERO;
			break;
		case 6:		// destination-in
			this.srcBlend = gl.ZERO;
			this.destBlend = gl.SRC_ALPHA;
			break;
		case 7:		// source-out
			this.srcBlend = gl.ONE_MINUS_DST_ALPHA;
			this.destBlend = gl.ZERO;
			break;
		case 8:		// destination-out
			this.srcBlend = gl.ZERO;
			this.destBlend = gl.ONE_MINUS_SRC_ALPHA;
			break;
		case 9:		// source-atop
			this.srcBlend = gl.DST_ALPHA;
			this.destBlend = gl.ONE_MINUS_SRC_ALPHA;
			break;
		case 10:	// destination-atop
			this.srcBlend = gl.ONE_MINUS_DST_ALPHA;
			this.destBlend = gl.SRC_ALPHA;
			break;
		}	
	};

	instanceProto.onCreate = function()
	{
		this.visible = (this.properties[0] === 0);							// 0=visible, 1=invisible
		this.compositeOp = this.effectToCompositeOp(this.properties[1]);
		this.updateBlend(this.properties[1]);
		this.canvas = document.createElement('canvas');
		this.canvas.width=this.width;
		this.canvas.height=this.height;
		this.ctx = this.canvas.getContext('2d');
		this.ctx.drawImage(this.type.texture_img,0,0,this.width,this.height);
		
		//temporary canvas for layer pasting
		this.tCanvas = document.createElement('canvas');
		this.tCtx = this.tCanvas.getContext('2d');		
		
        this.update_tex = true;
		this.rcTex = new cr.rect(0, 0, 0, 0);
		//if (this.runtime.gl && !this.type.webGL_texture)
		//	this.type.webGL_texture = this.runtime.glwrap.loadTexture(this.type.texture_img, true, this.runtime.linearSampling);
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
            "canvas_w":this.canvas.width,
            "canvas_h":this.canvas.height,
            "image":this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height).data
			// e.g.
			//"myValue": this.myValue
		};
	};
	
	// called when loading the full state of the game
	instanceProto.loadFromJSON = function (o)
	{
        var canvasWidth = this.canvas.width = o["canvas_w"];
        var canvasHeight = this.canvas.height = o["canvas_h"];
        var data = this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height).data;
        for (var y = 0; y < canvasHeight; ++y) {
            for (var x = 0; x < canvasWidth; ++x) {
                var index = (y * canvasWidth + x)*4;
                for (var c = 0; c < 4; ++c)
                data[index+c] = o["image"][index+c];
            }
        }
		// load from the state previously saved by saveToJSON
		// 'o' provides the same object that you saved, e.g.
		// this.myValue = o["myValue"];
		// note you MUST use double-quote syntax (e.g. o["property"]) to prevent
		// Closure Compiler renaming and breaking the save format
	};
	
	//helper function
	instanceProto.draw_instances = function (instances, ctx)
    {
        for(var x in instances)
        {
            if(instances[x].visible==false && this.runtime.testOverlap(this, instances[x])== false)
                continue;
            
            ctx.save();
            ctx.scale(this.canvas.width/this.width, this.canvas.height/this.height);
            ctx.rotate(-this.angle);
            ctx.translate(-this.bquad.tlx, -this.bquad.tly);
            ctx.globalCompositeOperation = instances[x].compositeOp;//rojo

			//alert(x);
            if (instances[x].type.pattern !== undefined && instances[x].type.texture_img !== undefined) {
                instances[x].pattern = ctx.createPattern(instances[x].type.texture_img, "repeat");                
            }

            instances[x].draw(ctx);
            ctx.restore();
        }
    };
	
	instanceProto.draw = function(ctx)
	{	
		ctx.save();
		
		ctx.globalAlpha = this.opacity;
		ctx.globalCompositeOperation = this.compositeOp;
		
		var myx = this.x;
		var myy = this.y;
		
		if (this.runtime.pixel_rounding)
		{
			myx = Math.round(myx);
			myy = Math.round(myy);
		}
		
		ctx.translate(myx, myy);
		ctx.rotate(this.angle);
				
		ctx.drawImage(this.canvas,
						  0 - (this.hotspotX * this.width),
						  0 - (this.hotspotY * this.height),
						  this.width,
						  this.height);
		
		ctx.restore();
	};

	instanceProto.drawGL = function(glw)
	{
		glw.setBlend(this.srcBlend, this.destBlend);
        if (this.update_tex)
        {
            if (this.tex)
                glw.deleteTexture(this.tex);
            this.tex=glw.loadTexture(this.canvas, false, this.runtime.linearSampling);
            this.update_tex = false;
        }
		glw.setTexture(this.tex);
		glw.setOpacity(this.opacity);

		var q = this.bquad;
		
		if (this.runtime.pixel_rounding)
		{
			var ox = Math.round(this.x) - this.x;
			var oy = Math.round(this.y) - this.y;
			
			glw.quad(q.tlx + ox, q.tly + oy, q.trx + ox, q.try_ + oy, q.brx + ox, q.bry + oy, q.blx + ox, q.bly + oy);
		}
		else
			glw.quad(q.tlx, q.tly, q.trx, q.try_, q.brx, q.bry, q.blx, q.bly);
	};




	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;
	
	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;

	acts.SetEffect = function (effect)
	{	
		this.compositeOp = this.effectToCompositeOp(effect);
		this.runtime.redraw = true;
        this.update_tex = true;
	};
	
	acts.DrawPoint = function (x,y, color)
	{	
		var ctx=this.ctx;
		ctx.fillStyle = color;
		ctx.fillRect(x,y,1,1);
		this.runtime.redraw = true;
        this.update_tex = true;
	};
	
	acts.ResizeCanvas = function (width, height)
	{
		this.canvas.width=width;
		this.canvas.height=height;
		this.runtime.redraw = true;
        this.update_tex = true;
	};
	
	acts.PasteObject = function (object)
	{
		var ctx=this.ctx;
		this.update_bbox();
		
		var sol = object.getCurrentSol();
		var instances;
		if (sol.select_all)
			instances = sol.type.instances;
		else
			instances = sol.instances;
		
		this.draw_instances(instances, ctx);
		
		this.runtime.redraw = true;
        this.update_tex = true;
	};
	
	acts.PasteLayer = function (layer)
	{
		if (!layer || !layer.visible)
			return false;
    
		var ctx=this.ctx;
		this.update_bbox();
    
		//resize the temporary canvas to fit the size of the object
		this.tCanvas.width=this.canvas.width;
		this.tCanvas.height=this.canvas.height;
 
 		var t=this.tCtx;
    
		//clear the temporary canvas
		t.clearRect(0,0,this.tCanvas.width, this.tCanvas.height);
	
		this.draw_instances(layer.instances, t);
		
		//paste the temporary canvas into the real one
		ctx.drawImage(this.tCanvas,0,0,this.width,this.height);
			
		this.runtime.redraw = true;
        this.update_tex = true;
	};
	
	acts.DrawBox = function (x, y, width, height, color)
	{
		this.ctx.fillStyle = color;
		this.ctx.fillRect(x,y,width,height);
		this.runtime.redraw = true;
        this.update_tex = true;
	};
	
	acts.DrawLine = function (x1, y1, x2, y2, color, line_width)
	{
		var ctx = this.ctx;
		ctx.strokeStyle = color;
		ctx.lineWidth = line_width;
		ctx.beginPath();  
		ctx.moveTo(x1,y1);
		ctx.lineTo(x2, y2); 
		ctx.stroke();
		this.runtime.redraw = true;
        this.update_tex = true;
	};
	
	acts.ClearCanvas = function ()
	{
		this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
		this.runtime.redraw = true;
        this.update_tex = true;
	};
	
	acts.FillColor = function (color)
	{
		this.ctx.fillStyle = color;
		this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);
		this.runtime.redraw = true;
        this.update_tex = true;
	};
	
	acts.fillGradient = function (gradient_style, color1, color2)
	{
		var ctx = this.ctx;
		var w =this.canvas.width;
		var h=this.canvas.height;
		var gradient;
		
		switch(gradient_style)
		{
		case 0: //horizontal
			gradient = ctx.createLinearGradient(0,0,w,0);
			break;
		case 1: //vertical
			gradient = ctx.createLinearGradient(0,0,0,h);
			break;
		case 2: //diagonal_down_right
			gradient = ctx.createLinearGradient(0,0,w,h);
			break;
		case 3: //diagonal_down_left
			gradient = ctx.createLinearGradient(w,0,0,h);
			break;
		case 4: //radial
			gradient = ctx.createRadialGradient(w/2,h/2,0,w/2,h/2, Math.sqrt(w*w+h*h)/2);
			break;
		}
        try{
            gradient.addColorStop(0, color1);
        }catch(e){
            gradient.addColorStop(0, "black");
        }
        try{
            gradient.addColorStop(1, color2);
        }catch(e){
            gradient.addColorStop(1, "black");
        }
		this.ctx.fillStyle = gradient;
		
		this.ctx.fillRect(0, 0, w, h);
		this.runtime.redraw = true;
        this.update_tex = true;
	};
	
	acts.beginPath = function ()
	{
		this.ctx.beginPath();
	};
	
	acts.drawPath = function (color, line_width)
	{
		var ctx = this.ctx;
		ctx.strokeStyle = color;
		ctx.lineWidth = line_width;
		ctx.stroke();
		this.runtime.redraw = true;
        this.update_tex = true;
	};
	
	acts.setLineSettings = function (line_cap, line_joint)
	{
		var ctx = this.ctx;
		ctx.lineCap = ["butt","round","square"][line_cap];
		ctx.lineJoin = ["round","bevel","milet"][line_joint];
	};
	
	acts.fillPath = function (color)
	{
		this.ctx.fillStyle = color;
		this.ctx.fill();
		this.runtime.redraw = true;
        this.update_tex = true;
	};
	
	acts.moveTo = function (x, y)
	{
		this.ctx.moveTo(x, y);
	};
	
	acts.lineTo = function (x, y)
	{
		this.ctx.lineTo(x, y);
	};
	
	acts.arc = function (x, y, radius, start_angle, end_angle, arc_direction)
	{
		this.ctx.arc(x, y, radius, cr.to_radians(start_angle), cr.to_radians(end_angle), arc_direction==1);
	};
	
	acts.drawCircle = function (x, y, radius, color, line_width)
	{
		var ctx = this.ctx;
		ctx.strokeStyle = color;
		ctx.lineWidth = line_width;
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, cr.to_radians(360), true);  
		ctx.stroke();
		this.runtime.redraw = true;
        this.update_tex = true;
	};
	
	acts.bezierCurveTo = function (cp1x, cp1y, cp2x, cp2y, x, y)
	{
		this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
	};
	
	acts.quadraticCurveTo = function (cpx, cpy, x, y)
	{
		this.ctx.quadraticCurveTo(cpx, cpy, x, y);
	};
	
	acts.rectPath = function (x, y, width, height)
	{
		this.ctx.rect(x,y,width,height);
	};
	
	acts.FloodFill= function (x,y,color)
	{
		var ctx = this.ctx;
		var I = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
		
		//flood_fill(I.data, this.canvas.width, this.canvas.height, x, y, [255, 0, 0]);
		//instanceProto.flood_fill(I.data, this.canvas.width, this.canvas.height, x, y, color);
		flood_fill(I.data, this.canvas.width, this.canvas.height, x, y, color);
		ctx.putImageData(I,0,0);
		
		this.runtime.redraw = true;
        this.update_tex = true;
	};
	
	acts.setLineDash = function (dash_width, space_width)
	{
		var dashArr = [dash_width, space_width];
		this.ctx.setLineDash(dashArr);
	};
	
	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;
	
	exps.rgbaAt = function (ret, x, y)
	{
		var imageData= this.ctx.getImageData(x,y,1,1);
		var data= imageData.data;
		ret.set_string("rgba(" + data[0] + "," + data[1] + "," + data[2] + "," + data[3]/255 + ")");
	};
    
    exps.redAt = function (ret, x, y)
	{
		var imageData= this.ctx.getImageData(x,y,1,1);
		var data= imageData.data;
		ret.set_int(data[0]);
	};
    exps.greenAt = function (ret, x, y)
	{
		var imageData= this.ctx.getImageData(x,y,1,1);
		var data= imageData.data;
		ret.set_int(data[1]);
	};
    exps.blueAt = function (ret, x, y)
	{
		var imageData= this.ctx.getImageData(x,y,1,1);
		var data= imageData.data;
		ret.set_int(data[2]);
	};
    exps.alphaAt = function (ret, x, y)
	{
		var imageData= this.ctx.getImageData(x,y,1,1);
		var data= imageData.data;
		ret.set_int(data[3]*100/255);
	};
	
	exps.imageUrl = function (ret)
	{
		ret.set_string(this.canvas.toDataURL());
	};
    
    exps.AsJSON = function(ret)
    {
        ret.set_string( JSON.stringify({
			"c2array": true,
			"size": [1, 1, this.canvas.width * this.canvas.height * 4],
			"data": [[this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data]]
		}));
    };

}());