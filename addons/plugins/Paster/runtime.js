// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
//          vvvvvvvv
cr.plugins_.rojoPaster = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	/////////////////////////////////////
	// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
	//                            vvvvvvvv
	var pluginProto = cr.plugins_.rojoPaster.prototype;
		
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
        //alert(this.width);
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	// called whenever an instance is created
	instanceProto.onCreate = function()
	{
        this.visible = (this.properties[0] === 0);		// 0=visible, 1=invisible
        
        this.resx = this.width;
        this.resy = this.height;
		
		this.verts = [{x:0,y:0,u:0,v:0},
					  {x:0,y:0,u:0,v:0},
					  {x:0,y:0,u:0,v:0},
					  {x:0,y:0,u:0,v:0}];
		this.points=null;
		
		this.canvas2textureNextTick = 0;
		//this.runtime.tickMe(this);
        
        var glw = this.runtime.glwrap;
        if(glw)
        {
            assert2(this.resx <= glw.maxTextureSize && this.resy <= glw.maxTextureSize, "An image was used above the maximum texture size and cannot be displayed. Ensure all images are "+glw.maxTextureSize+"x"+glw.maxTextureSize+" or smaller");
			this.texture = glw.createEmptyTexture(this.resx, this.resy, this.runtime.linearSampling, false);
			this.temp_texture = glw.createEmptyTexture(this.resx, this.resy, this.runtime.linearSampling, false);
			
			this.quadtex = glw.createEmptyTexture(1, 1, this.runtime.linearSampling, false);
            glw.setTexture(null);
            glw.setRenderingToTexture(this.quadtex);
            glw.clear(0,0,0,1);
            glw.setRenderingToTexture(null);
            this.quadblend = new Object();
            this.quadblend.srcBlend = glw.gl.ONE;
            this.quadblend.destBlend = glw.gl.ONE_MINUS_SRC_ALPHA;
        }
        else
        {
            this.canvas = document.createElement('canvas');			
            this.canvas.width=this.resx;
            this.canvas.height=this.resy;
            this.ctx = this.canvas.getContext('2d');
			
			if (!this.runtime.linearSampling)
			{
				this.ctx.mozImageSmoothingEnabled = false;
				this.ctx.webkitImageSmoothingEnabled = false;
				this.ctx.msImageSmoothingEnabled = false;
				this.ctx.imageSmoothingEnabled = false;
			}
            this.fill="black";
        }
	};
	
	// called whenever an instance is destroyed
	// note the runtime may keep the object after this call for recycling; be sure
	// to release/recycle/reset any references to other objects in this function.
	instanceProto.onDestroy = function ()
	{
        if(this.texture)
        {
            this.runtime.glwrap.deleteTexture(this.texture);
            this.runtime.glwrap.deleteTexture(this.quadtex);
            this.runtime.glwrap.deleteTexture(this.temp_texture);	
        }
		this.texture=null;
		this.quadtex=null;
		this.temp_texture=null;
		this.canvas=null;
		this.ctx=null;
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
	
	instanceProto.grabCanvas = function()
	{
		var glw = this.runtime.glwrap;
		var img = this.runtime.canvas;
		if(glw)
		{
			if (this.type.plugin.canvasflip == null)
			{
				var canvas = document.createElement('canvas');
				canvas.width = 1;
				canvas.height = 2;
				var gl = canvas.getContext("experimental-webgl");
				gl.clearColor(1, 1, 1, 1);
				gl.clear(gl.COLOR_BUFFER_BIT);

				var prog = gl.createProgram();
					
				var vss = gl.createShader(gl.VERTEX_SHADER);
				gl.shaderSource(vss, "attribute vec3 pos;void main() {gl_Position = vec4(pos, 1.0);}");
				gl.compileShader(vss);
				gl.attachShader(prog, vss);
				
				var fss = gl.createShader(gl.FRAGMENT_SHADER);
				gl.shaderSource(fss, "void main() {gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);}");
				gl.compileShader(fss);
				gl.attachShader(prog, fss);
				
				gl.linkProgram(prog);
				gl.useProgram(prog);

				gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
				gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 0, 1, -1, 0, -1, 0, 0,	1, 0, 0]), gl.STATIC_DRAW);
				var attr = gl.getAttribLocation(prog, "pos");
				gl.enableVertexAttribArray(attr);
				gl.vertexAttribPointer(attr, 3, gl.FLOAT, false, 0, 0);
				
				gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
				
				var tex_small = gl.createTexture();
				gl.bindTexture(gl.TEXTURE_2D, tex_small);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gl.canvas);
				gl.bindTexture(gl.TEXTURE_2D, null);
				
				var fbo = gl.createFramebuffer();
				gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
				gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex_small, 0);
				
				var pixels = new Uint8Array(1 * 2 * 4);
				gl.readPixels( 0, 0, 1, 2, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
				gl.bindFramebuffer(gl.FRAMEBUFFER, null);
				//alert(pixels[0]);
				this.type.plugin.canvasflip = pixels[0] == 0;
				gl.deleteTexture(tex_small);
			}
			var gl = glw.gl;
			//glw.endBatch();
			//it appears to need the canvas to have just been drawn to work...
			if(this.texture.c2width != img.width || this.texture.c2height != img.height)
			{
				glw.deleteTexture(this.texture);
				this.texture = null;
				//console.log(gl.getError());
			}
			if ( this.texture ==  null)
				this.texture = glw.createEmptyTexture(img.width, img.height, this.runtime.linearSampling, this.runtime.isMobile);
			//console.log(gl.getError());
			//gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			//gl.bindTexture(gl.TEXTURE_2D, this.texture);
			//gl.pixelStorei(gl["UNPACK_PREMULTIPLY_ALPHA_WEBGL"], true);
		
			//gl.copyTexImage2D(gl.TEXTURE_2D , 0, gl.RGBA, 0, 0, img.width, img.height, 0);
			//console.log(gl.getError());
			//gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, img.width, img.height, gl.RGBA, gl.UNSIGNED_BYTE, img);
			//gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
			//gl.bindTexture(gl.TEXTURE_2D, null);
			//glw.lastTexture0 = null;
			//glw.present();
			if(this.type.plugin.canvasflip)
			{
				glw.gl.pixelStorei(glw.gl.UNPACK_FLIP_Y_WEBGL, true);
				//console.log(gl.getError());
			}
			glw.videoToTexture(img, this.texture, this.runtime.isMobile);
			//this.texture = glw.loadTexture(img, false, this.runtime.linearSampling);
			glw.gl.pixelStorei(glw.gl.UNPACK_FLIP_Y_WEBGL, false);
			//console.log(gl.getError());
		}
		else
		{
			this.canvas.width = img.width;
			this.canvas.height = img.height;
			//this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
			this.ctx.drawImage(img, 0, 0, img.width, img.height);
		}
	};
	
/*	instanceProto.tick = function()
	{
		this.canvas2textureNextTick--;
		if(this.canvas2textureNextTick > 0)
		{
			this.canvas2textureNextTick = 0;
			this.runtime.redraw = true;
			this.grabCanvas();
		}
		//else if(this.canvas2textureNextTick == 0)
		//	this.grabCanvas();
	};
*/
	// only called if a layout object - draw to a canvas 2D context
	instanceProto.draw = function(ctx)
	{
		ctx.globalAlpha = this.opacity;
        ctx.save();
		ctx.translate(this.x, this.y);
		
		var widthfactor = this.width > 0 ? 1 : -1;
		var heightfactor = this.height > 0 ? 1 : -1;
		if (widthfactor !== 1 || heightfactor !== 1)
			ctx.scale(widthfactor, heightfactor);
			
		ctx.rotate(this.angle * widthfactor * heightfactor);
		
		ctx.drawImage(this.canvas,
						  0 - (this.hotspotX * cr.abs(this.width)),
						  0 - (this.hotspotY * cr.abs(this.height)),
						  cr.abs(this.width),
						  cr.abs(this.height));
		
		ctx.restore();
	};
	
	// only called if a layout object in WebGL mode - draw to the WebGL context
	// 'glw' is not a WebGL context, it's a wrapper - you can find its methods in GLWrap.js in the install
	// directory or just copy what other plugins do.
	instanceProto.drawGL = function (glw)
	{
        glw.setTexture(this.texture);
		glw.setOpacity(this.opacity);
				
		var q = this.bquad;
		//glw.point(q.tlx, q.tly, 1, 1);
		glw.quad(q.tlx, q.tly, q.trx, q.try_, q.brx, q.bry, q.blx, q.bly);
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
/*	Cnds.prototype.MyCondition = function (myparam)
	{
		// return true if number is positive
		return myparam >= 0;
	};*/
	
	// ... other conditions here ...
	
	pluginProto.cnds = new Cnds();
	
	//////////////////////////////////////
	// Actions
	function Acts() {};

	// the example action
//	Acts.prototype.MyAction = function (myparam)
//	{
//		// alert the message
//		alert(myparam);
//	};
    
    Acts.prototype.SetEffect = function (effect)
	{	
		this.compositeOp = cr.effectToCompositeOp(effect);
		cr.setGLBlend(this, effect, this.runtime.gl);
		this.runtime.redraw = true;
	};
    
    Acts.prototype.PasteObject = function (object)
	{
        // get instances
		var sol = object.getCurrentSol();
		var instances;
		if (sol.select_all)
			instances = sol.type.instances;
		else
			instances = sol.instances;
        
        this.update_bbox();
        var inst, i, len;
        
        var glw = this.runtime.glwrap;
        if(glw) //webgl
        {
            if(!this.texture) //bad tex
                return;
			
            var old_width = glw.width;
            var old_height = glw.height;
            glw.setSize(this.resx,this.resy);
            
			// set render target
            glw.setTexture(null);
            glw.setRenderingToTexture(this.texture);
            
			// transform to paster
            glw.resetModelView();
            glw.scale(this.resx/this.width, -this.resy/this.height);
            glw.rotateZ(-this.angle);
            glw.translate((this.bbox.left + this.bbox.right) / -2, (this.bbox.top + this.bbox.bottom) / -2);
            glw.updateModelView();
            
			var shaderindex = 0, etindex = 0;
            var e, elen;
            for (i = 0, len = instances.length; i < len; i++)
            {
                inst = instances[i];
                // Skip if itself, invisible or zero sized
                if (this == inst || !inst.visible || inst.width === 0 || inst.height === 0)
                    continue;
                // Skip if not in the viewable area
                inst.update_bbox();
                if( !this.bbox.intersects_rect(inst.bbox))
                    continue;

                // Draw using shaders
                if (inst.uses_shaders)
                {
                    for(e=0, elen=inst.active_effect_types.length; e<elen; ++e)
                    //if (inst.active_effect_types.length === 1 && !glw.programUsesCrossSampling(shaderindex) &&
                    //    !glw.programExtendsBox(shaderindex) && ((!inst.angle && !inst.layer.getAngle()) || !glw.programUsesDest(shaderindex)) &&
                    //    inst.opacity === 1 && !inst.type.plugin.must_predraw
                    {
                        // set target to temp
						glw.setTexture(null);
						glw.setRenderingToTexture(this.temp_texture);
						glw.clear(0,0,0,0);
						
						shaderindex = inst.active_effect_types[e].shaderindex;
                        etindex = inst.active_effect_types[e].index;
                        glw.switchProgram(shaderindex);
                        glw.setBlend(inst.srcBlend, inst.destBlend);
                        
                        glw.setProgramParameters(this.temp_texture, 	// backTex
												 1.0 / inst.width,		// pixelWidth
												 1.0 / inst.height,		// pixelHeight
												 0, 1, 					// destStartX, destStartY,
												 1, 0,					// destEndX, destEndY,
												 1,						// this.getScale(),
												 0,						// this.getAngle(),
												 0, 0,					// this.viewLeft, this.viewTop,
												 0.5, 0.5,				// (this.viewLeft + this.viewRight) / 2, (this.viewTop + this.viewBottom) / 2,
												 this.runtime.kahanTime.sum,
												 inst.effect_params[etindex]);
                        inst.drawGL(glw);
						
						// draw temp to
						glw.switchProgram(0); 
						glw.setTexture(null);
						glw.setRenderingToTexture(this.texture);
						glw.setTexture(this.temp_texture);
						glw.resetModelView();
						glw.scale(this.resx, -this.resy);
						//glw.translate(this.resx/2, this.resy/2);
						glw.translate(-0.5, -0.5);
						glw.updateModelView();
						glw.setOpacity(inst.opacity);
						glw.setAlphaBlend();
						//glw.setNoPremultiplyAlphaBlend();
						//glw.setBlend(inst.srcBlend, inst.destBlend);
						glw.quad(0,0, 1,0, 1,1, 0,1);
						
						// transform back to paster
						glw.resetModelView();
						glw.scale(this.resx/this.width, -this.resy/this.height);
						glw.rotateZ(-this.angle);
						glw.translate((this.bbox.left + this.bbox.right) / -2, (this.bbox.top + this.bbox.bottom) / -2);
						glw.updateModelView();
                    }
                }
                else // Draw normally without any special shaders
                {
                    glw.switchProgram(0);		// un-set any previously set shader
                    glw.setBlend(inst.srcBlend, inst.destBlend);
                    inst.drawGL(glw);
                }
            }
            glw.setRenderingToTexture(null);
            glw.setSize(old_width, old_height);
        }
        else //canvas2d
        {
            var ctx = this.ctx;
            for(i = 0, len = instances.length; i < len; i++)
            {
                inst = instances[i];
                inst.update_bbox();
                if(inst.visible==false && this.runtime.testOverlap(this, inst)== false)
                    continue;
                
                ctx.save();
                ctx.scale(this.canvas.width/this.width, this.canvas.height/this.height);
                ctx.rotate(-this.angle);
                ctx.translate(-this.bquad.tlx, -this.bquad.tly);
                ctx.globalCompositeOperation = inst.compositeOp;
                inst.draw(ctx);
                ctx.restore();
            }
        }
        
        this.runtime.redraw = true;
	};
    
    Acts.prototype.ClearColor = function (red,green,blue,alpha)
    {
        red=cr.clamp(red,0,255);
        green=cr.clamp(green,0,255);
        blue=cr.clamp(blue,0,255);
        alpha=cr.clamp(alpha,0,100);
        
        var glw = this.runtime.glwrap;
        if(glw)
        {
            glw.setTexture(null);
            glw.setRenderingToTexture(this.texture);
            glw.clear(red/255,green/255,blue/255,alpha/100);
            glw.setRenderingToTexture(null);
        }
        else
        {
            this.ctx.fillStyle = "rgba("+parseInt(red)+","+parseInt(green)+","+parseInt(blue)+","+alpha/100+")";
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);
        }
        
        this.runtime.redraw = true;
    };
    
    Acts.prototype.SetResolution = function (resx, resy)
    {        
        this.resx = resx;
        this.resy = resy;
        var glw = this.runtime.glwrap;
        if(glw)
        {
            if(this.texture)
			{
                glw.deleteTexture(this.texture);
				glw.deleteTexture(this.temp_texture);
			}
            assert2(resx <= glw.maxTextureSize && resy <= glw.maxTextureSize, "An image was used above the maximum texture size and cannot be displayed. Ensure all images are "+glw.maxTextureSize+"x"+glw.maxTextureSize+" or smaller");
            this.texture = glw.createEmptyTexture(resx, resy, this.runtime.linearSampling, false);
			this.temp_texture = glw.createEmptyTexture(resx, resy, this.runtime.linearSampling, false);
        }
        else
        {
            this.canvas.width=resx;
            this.canvas.height=resy;
        }
        
        this.runtime.redraw = true;
    };
    
    Acts.prototype.QuadColor = function (red,green,blue,alpha)
    {
        red=cr.clamp(red,0,255);
        green=cr.clamp(green,0,255);
        blue=cr.clamp(blue,0,255);
        alpha=cr.clamp(alpha,0,100);
        
        var glw = this.runtime.glwrap;
        if(glw)
        {
            glw.setTexture(null);
            glw.setRenderingToTexture(this.quadtex);
            glw.clear(red/255,green/255,blue/255,alpha/100);
            glw.setRenderingToTexture(null);
        }
        else
        {
            this.fill="rgba("+parseInt(red)+","+parseInt(green)+","+parseInt(blue)+","+alpha/100+")";
			//alert(this.fill);
        }
        
        //this.runtime.redraw = true;
    };
    
    Acts.prototype.DrawQuad = function (x1,y1,x2,y2,x3,y3,x4,y4, blend)
    {
        this.update_bbox();
        var glw = this.runtime.glwrap;
        if(glw)
        {
            glw.setTexture(null);
            glw.setRenderingToTexture(this.texture);
            
            var old_width = glw.width;
            var old_height = glw.height;
            glw.setSize(this.resx,this.resy);
            
            glw.resetModelView();
			glw.scale(this.resx/this.width, -this.resy/this.height);
            //glw.scale(this.runtime.width/this.width, -this.runtime.height/this.height);
            glw.rotateZ(-this.angle);
            glw.translate((this.bbox.left + this.bbox.right) / -2, (this.bbox.top + this.bbox.bottom) / -2);
            glw.updateModelView();
            
            glw.setTexture(this.quadtex);
            glw.setOpacity(1);
            cr.setGLBlend(this.quadblend, blend, glw.gl);
            glw.setBlend(this.quadblend.srcBlend, this.quadblend.destBlend);
            
            glw.quad(x1,y1,x2,y2,x3,y3,x4,y4);
            glw.setRenderingToTexture(null);
            glw.setSize(old_width, old_height);
        }
        else
        {
            var ctx = this.ctx;
            ctx.save();
            ctx.scale(this.canvas.width/this.width, this.canvas.height/this.height);
            ctx.rotate(-this.angle);
            ctx.translate(-this.bquad.tlx, -this.bquad.tly);
            ctx.globalCompositeOperation = cr.effectToCompositeOp(blend);//"source-over";
			ctx.globalAlpha = 1.0;
            
            ctx.fillStyle = this.fill;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2,y2);
            ctx.lineTo(x3, y3);
            ctx.lineTo(x4, y4);
            ctx.closePath();
            //ctx.stroke();
            ctx.fill();
            
            ctx.restore();
        }
        
        this.runtime.redraw = true;
    };
    
    // from http://stackoverflow.com/questions/4774172/image-manipulation-and-texture-mapping-using-html5-canvas
    function textureMap(ctx, texture, pts) 
    {
        var tris = [[0, 1, 2], [2, 3, 0]]; // Split in two triangles
        for (var t=0; t<2; t++) {
            var pp = tris[t];
            var x0 = pts[pp[0]].x, x1 = pts[pp[1]].x, x2 = pts[pp[2]].x;
            var y0 = pts[pp[0]].y, y1 = pts[pp[1]].y, y2 = pts[pp[2]].y;
            var u0 = pts[pp[0]].u, u1 = pts[pp[1]].u, u2 = pts[pp[2]].u;
            var v0 = pts[pp[0]].v, v1 = pts[pp[1]].v, v2 = pts[pp[2]].v;

            // Set clipping area so that only pixels inside the triangle will
            // be affected by the image drawing operation
            ctx.save(); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
            ctx.lineTo(x2, y2); ctx.closePath(); ctx.clip();

            // Compute matrix transform
            var delta = u0*v1 + v0*u2 + u1*v2 - v1*u2 - v0*u1 - u0*v2;
            var delta_a = x0*v1 + v0*x2 + x1*v2 - v1*x2 - v0*x1 - x0*v2;
            var delta_b = u0*x1 + x0*u2 + u1*x2 - x1*u2 - x0*u1 - u0*x2;
            var delta_c = u0*v1*x2 + v0*x1*u2 + x0*u1*v2 - x0*v1*u2
                          - v0*u1*x2 - u0*x1*v2;
            var delta_d = y0*v1 + v0*y2 + y1*v2 - v1*y2 - v0*y1 - y0*v2;
            var delta_e = u0*y1 + y0*u2 + u1*y2 - y1*u2 - y0*u1 - u0*y2;
            var delta_f = u0*v1*y2 + v0*y1*u2 + y0*u1*v2 - y0*v1*u2
                          - v0*u1*y2 - u0*y1*v2;

            // Draw the transformed image
            ctx.transform(delta_a/delta, delta_d/delta,
                          delta_b/delta, delta_e/delta,
                          delta_c/delta, delta_f/delta);
            ctx.drawImage(texture, 0, 0);
            ctx.restore();
        }
    }
    
	Acts.prototype.DrawTexQuad = function (x1,y1,x2,y2,x3,y3,x4,y4, blend, opacity, object_type)
    {
        var obj = object_type.getFirstPicked();
        if(!obj)
            return; //no obj picked
            
        var sprite = obj.curFrame;
        var texture_2d = null;
        var texture_webgl= null;
        if(!sprite)
        {   
            // canvas and paster
            if(obj.canvas)
                texture_2d = obj.canvas;
            if(obj.tex)
                texture_webgl = obj.tex;
            if(obj.texture)
                texture_webgl = obj.texture;
            //tiledbg, particles, 
            if(obj.texture_img)  
            {
                texture_2d = obj.texture_img;
                texture_webgl = obj.webGL_texture;
            }
        }
        
        this.update_bbox();
        var glw = this.runtime.glwrap;
        if(glw && (sprite || texture_webgl))
        {
            glw.setTexture(null);
            glw.setRenderingToTexture(this.texture);
            
            var old_width = glw.width;
            var old_height = glw.height;
            glw.setSize(this.resx,this.resy);
            
            glw.resetModelView();
            //glw.scale(this.runtime.width/this.width, -this.runtime.height/this.height);
			glw.scale(this.resx/this.width, -this.resy/this.height);
            glw.rotateZ(-this.angle);
            
            glw.translate((this.bbox.left + this.bbox.right) / -2, (this.bbox.top + this.bbox.bottom) / -2);
            glw.updateModelView();
            
            glw.setOpacity(opacity/100);
            cr.setGLBlend(this.quadblend, blend, glw.gl);
            glw.setBlend(this.quadblend.srcBlend, this.quadblend.destBlend);
            if(sprite)
            {
                glw.setTexture(obj.curWebGLTexture);
                if (sprite.spritesheeted)
                    glw.quadTex(x1,y1,x2,y2,x3,y3,x4,y4, sprite.sheetTex);
                else
                    glw.quad(x1,y1,x2,y2,x3,y3,x4,y4);
            }
            else
            {
                glw.setTexture(texture_webgl);
                glw.quad(x1,y1,x2,y2,x3,y3,x4,y4);
            }
            glw.setRenderingToTexture(null);
            glw.setSize(old_width, old_height);
        }
        else if (sprite || texture_2d)
        {
            var ctx = this.ctx;
            var img = null;
            ctx.save();
            ctx.scale(this.canvas.width/this.width, this.canvas.height/this.height);
            ctx.rotate(-this.angle);
            ctx.translate(-this.bquad.tlx, -this.bquad.tly);
            ctx.globalCompositeOperation = cr.effectToCompositeOp(blend);
            ctx.globalAlpha = opacity/100;
            
            if(!this.points)
            {
                this.points=[new Object(),new Object(),new Object(),new Object()];
            }
            
            if(sprite)
                img = sprite.texture_img;
            else
                img = texture_2d;
            
            if (sprite && sprite.spritesheeted)
            {
				this.points[0].x=x1;
				this.points[0].y=y1;
				this.points[0].u=sprite.offx;
				this.points[0].v=sprite.offy;
				this.points[1].x=x2;
				this.points[1].y=y2;
				this.points[1].u=sprite.offx + sprite.width;
				this.points[1].v=sprite.offy;
				this.points[2].x=x3;
				this.points[2].y=y3;
				this.points[2].u=sprite.offx + sprite.width;
				this.points[2].v=sprite.offy + sprite.height;
				this.points[3].x=x4;
				this.points[3].y=y4;
				this.points[3].u=sprite.offx;
				this.points[3].v=sprite.offy + sprite.height;
            }
            else
            {
                this.points[0].x=x1;
                this.points[0].y=y1;
                this.points[0].u=0;
                this.points[0].v=0;
                this.points[1].x=x2;
                this.points[1].y=y2;
                this.points[1].u=img.width;
                this.points[1].v=0;
                this.points[2].x=x3;
                this.points[2].y=y3;
                this.points[2].u=img.width;
                this.points[2].v=img.height;
                this.points[3].x=x4;
                this.points[3].y=y4;
                this.points[3].u=0;
                this.points[3].v=img.height;
            }
            
            textureMap(ctx, img, this.points)
            
            ctx.restore();
        }
        
        this.runtime.redraw = true;
    };
	
	Acts.prototype.setVertice = function(index, x,y,u,v)
	{
		index |=0; //make int
		if(index<0 || index>3)
			return;
			
		this.verts[index].x = x;
		this.verts[index].y = y;
		this.verts[index].u = u;
		this.verts[index].v = v;
	};
	
	Acts.prototype.DrawSubTexQuad = function (blend, opacity, object_type)
    {
        var obj = object_type.getFirstPicked();
        if(!obj)
            return; //no obj picked
        
		var x1 = this.verts[0].x;
		var y1 = this.verts[0].y;
		var u1 = this.verts[0].u;
		var v1 = this.verts[0].v;
		var x2 = this.verts[1].x;
		var y2 = this.verts[1].y;
		var u2 = this.verts[1].u;
		var v2 = this.verts[1].v;
		var x3 = this.verts[2].x;
		var y3 = this.verts[2].y;
		var u3 = this.verts[2].u;
		var v3 = this.verts[2].v;
		var x4 = this.verts[3].x;
		var y4 = this.verts[3].y;
		var u4 = this.verts[3].u;
		var v4 = this.verts[3].v;

        var sprite = obj.curFrame;
        var texture_2d = null;
        var texture_webgl= null;
        if(!sprite)
        {   
            // canvas and paster
            if(obj.canvas)
                texture_2d = obj.canvas;
            if(obj.tex)
                texture_webgl = obj.tex;
            if(obj.texture)
                texture_webgl = obj.texture;
            //tiledbg, particles, 
            if(obj.texture_img)  
            {
                texture_2d = obj.texture_img;
                texture_webgl = obj.webGL_texture;
            }
        }
        
        this.update_bbox();
        var glw = this.runtime.glwrap;
        if(glw && (sprite || texture_webgl))
        {
            glw.setTexture(null);
            glw.setRenderingToTexture(this.texture);
            
            var old_width = glw.width;
            var old_height = glw.height;
            glw.setSize(this.resx,this.resy);
            
            glw.resetModelView();
            //glw.scale(this.runtime.width/this.width, -this.runtime.height/this.height);
			glw.scale(this.resx/this.width, -this.resy/this.height);
            glw.rotateZ(-this.angle);
            
            glw.translate((this.bbox.left + this.bbox.right) / -2, (this.bbox.top + this.bbox.bottom) / -2);
            glw.updateModelView();
            
            glw.setOpacity(opacity/100);
            cr.setGLBlend(this.quadblend, blend, glw.gl);
            glw.setBlend(this.quadblend.srcBlend, this.quadblend.destBlend);
            if(sprite)
            {
                glw.setTexture(obj.curWebGLTexture);
                if (sprite.spritesheeted)
				{
                    //glw.quadTex(x1,y1,x2,y2,x3,y3,x4,y4, sprite.sheetTex);
					//TODO
					var bbox = sprite.sheetTex;
					bbox.width = bbox.right - bbox.left;
					bbox.height = bbox.bottom - bbox.top; 
					glw.quadTexUV(x1,y1,x2,y2,x3,y3,x4,y4,
						bbox.left + u1*bbox.width,
						bbox.top +  v1*bbox.height,
						bbox.left + u2*bbox.width,
						bbox.top +  v2*bbox.height,
						bbox.left + u3*bbox.width,
						bbox.top +  v3*bbox.height,
						bbox.left + u4*bbox.width,
						bbox.top +  v4*bbox.height);
				}
                else
				{
					glw.quadTexUV(x1,y1,x2,y2,x3,y3,x4,y4,u1,v1,u2,v2,u3,v3,u4,v4);
                    //glw.quad(x1,y1,x2,y2,x3,y3,x4,y4);
				}
            }
            else
            {
                glw.setTexture(texture_webgl);
                //glw.quad(x1,y1,x2,y2,x3,y3,x4,y4);
				glw.quadTexUV(x1,y1,x2,y2,x3,y3,x4,y4,u1,v1,u2,v2,u3,v3,u4,v4);
            }
            glw.setRenderingToTexture(null);
            glw.setSize(old_width, old_height);
        }
        else if (sprite || texture_2d)
        {
            var ctx = this.ctx;
            var img = null;
            ctx.save();
            ctx.scale(this.canvas.width/this.width, this.canvas.height/this.height);
            ctx.rotate(-this.angle);
            ctx.translate(-this.bquad.tlx, -this.bquad.tly);
            ctx.globalCompositeOperation = cr.effectToCompositeOp(blend);
            ctx.globalAlpha = opacity/100;
            
            if(!this.points)
            {
                this.points=[new Object(),new Object(),new Object(),new Object()];
            }
            
            if(sprite)
                img = sprite.texture_img;
            else
                img = texture_2d;
            
            if (sprite && sprite.spritesheeted)
            {
				this.points[0].x=x1;
				this.points[0].y=y1;
				this.points[0].u=sprite.offx + u1*sprite.width;
				this.points[0].v=sprite.offy + v1*sprite.height;
				this.points[1].x=x2;
				this.points[1].y=y2;
				this.points[1].u=sprite.offx + u2*sprite.width;
				this.points[1].v=sprite.offy + v2*sprite.height;
				this.points[2].x=x3;
				this.points[2].y=y3;
				this.points[2].u=sprite.offx + u3*sprite.width;
				this.points[2].v=sprite.offy + v3*sprite.height;
				this.points[3].x=x4;
				this.points[3].y=y4;
				this.points[3].u=sprite.offx + u4*sprite.width;
				this.points[3].v=sprite.offy + v4*sprite.height;
            }
            else
            {
                this.points[0].x=x1;
                this.points[0].y=y1;
                this.points[0].u=u1*img.width;
                this.points[0].v=v1*img.height;
                this.points[1].x=x2;
                this.points[1].y=y2;
                this.points[1].u=u2*img.width;
                this.points[1].v=v2*img.height;
                this.points[2].x=x3;
                this.points[2].y=y3;
                this.points[2].u=u3*img.width;
                this.points[2].v=v3*img.height;
                this.points[3].x=x4;
                this.points[3].y=y4;
                this.points[3].u=u4*img.width;
                this.points[3].v=v4*img.height;
            }
            
            textureMap(ctx, img, this.points)
            
            ctx.restore();
        }
        
        this.runtime.redraw = true;
    };
    
    Acts.prototype.LoadImage = function (url_, resize_)
    {
        var self = this;
        var img = new Image();
        
        img.onload = function()
        {
            self.resx = img.width;
            self.resy = img.height;
            var glw = self.runtime.glwrap;
            if(glw)
            {
                //if(self.texture)
                glw.deleteTexture(this.texture);
				//if(self.texture)
				//	alert(self.texture.c2refcount);
				glw.deleteTexture(this.temp_texture);
                self.texture = glw.loadTexture(img, false, self.runtime.linearSampling);                
            }
            else
            {
                self.canvas.width = img.width;
                self.canvas.height = img.height;
                //self.ctx.clearRect(0,0,self.canvas.width, self.canvas.height);
                self.ctx.drawImage(img, 0, 0, img.width, img.height);
            }
            
            if (resize_ === 0)		// resize to image size
			{
				self.width = img.width;
				self.height = img.height;
				self.set_bbox_changed();
			}
            self.runtime.redraw = true;
        }
        if (url_.substr(0, 5) !== "data:")
            img.crossOrigin = 'anonymous';
        img.src = url_;
    };
	
	Acts.prototype.LoadCanvas = function ()
	{
		//this.canvas2textureNextTick = 8;
		
		this.grabCanvas();
		this.runtime.redraw = true;
	};
	
	pluginProto.acts = new Acts();
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};

	Exps.prototype.imageUrl = function (ret)
	{
        var glw = this.runtime.glwrap;
        if(glw)
        {
            var gl = glw.gl;
            var width = this.resx;
            var height = this.resy;
            
            //fininsh all drawing
            glw.present();
            
            // Create a framebuffer backed by the texture
            var framebuffer = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
			//gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            // Read the contents of the framebuffer
			var dsize=width * height * 4;
            var data = new Uint8Array(dsize);
            gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);
			for(var i=0, r,g,b,a; i<dsize; i+=4)
			{	
				r=data[i]/255;
				g=data[i+1]/255;
				b=data[i+2]/255;
				a=data[i+3]/255;
				//remove premultiply
				data[i]=r/a*255;
				data[i+1]=g/a*255;
				data[i+2]=b/a*255;
			}

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.deleteFramebuffer(framebuffer);

            // Create a 2D canvas to store the result 
            var canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            var context = canvas.getContext('2d');

            // Copy the pixels to a 2D canvas
            var imageData = context.createImageData(width, height);
            imageData.data.set(data);
            context.putImageData(imageData, 0, 0);
            
            ret.set_string(canvas.toDataURL());
        }
        else
        {
            ret.set_string(this.canvas.toDataURL());
        }
	};
    
    Exps.prototype.getresx = function (ret)
    {
		ret.set_float(this.resx);
    };
    Exps.prototype.getresy = function (ret)
    {
		ret.set_float(this.resy);
    };
	pluginProto.exps = new Exps();

}());