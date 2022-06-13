// ECMAScript 5 strict mode
"use strict";

if( window === undefined )
{
	var window = ("undefined" == typeof window) ? 
					("undefined" == typeof global) ? 
						("undefined" == typeof self) ? 
						this
						:self
					:global
				:window;
}

var __CONSTRUCT2_RUNTIME2__ = true;
var __CONSTRUCT3_RUNTIME2__ = false;
var __CONSTRUCT3_RUNTIME3__ = false;
var __DEBUG__ = false;


assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.ValerypopoffJSPlugin = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.ValerypopoffJSPlugin.prototype;
		
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

	instanceProto.onCreate = function()
	{
				this.returnValue = undefined;

		this.sciptsToLoad = 0;
		this.Aliases = {};
		this.construct_compare_function_prefix = "ConstructCompare_";

		this.AliasDotpartsCache = 
		{
			count: 0,
			max_count: 4096,
			Dotparts: {},
			AliasNames: {},
			AliasTrailers: {},
			IsAlias: {}
		};

		this.NonAliasDotpartsCache =
		{
			count: 0,
			max_count: 2048,
			Dotparts: {}
		};


		// Adds scripts to the page and does all the success handling 
		// On success it decreases the scripts counter (this.sciptsToLoad) so we know that all scripts are loaded if it's zero 
		function AddScriptToPage(this_, nameOfExternalScript)
		{
			if( document === undefined )
			{
				this_.ShowError(
				{
					debug_caller: "Including '"+ nameOfExternalScript +"' script to the page",
					caller_name: "Including '"+ nameOfExternalScript +"' script to the page",              
					error_message: "'document' is not defined. You're probably launching the game in a Worker. Workers are not supported yet. Export project with 'Use worker' option unchecked in the 'Advanced' section of the 'Project properties' panel."
				});

				return;
			}

			//$.ajax is preferable because it automatically makes the whole game wait until scripts are loaded
			//for some reason if it's not jquery, it doesn't wait automatically and you have to check if scripts are loaded 				
			/*
			if( window.jQuery && window.jQuery.ajax )
			{  
 				$.ajax(
 				{  
					url: nameOfExternalScript, 
					dataType: "script", 
					async: false,
					success: function()
					{ 
						this_.sciptsToLoad-- ; 
					},
					error: function(XMLHttpRequest)
					{
						this_.ShowError(
						{
							debug_caller: "Including '"+ nameOfExternalScript +"' script to the page",
							caller_name: "Including '"+ nameOfExternalScript +"' script to the page",              
							error_message: XMLHttpRequest.status
						});
					} 
				});
		    } else  */
			//if jQuery is not presented, load scripts using regular javascript
		    {
				var myScriptTag = document.createElement('script');
				myScriptTag.setAttribute("type","text/javascript");
				myScriptTag.setAttribute("src", nameOfExternalScript);
				myScriptTag.onreadystatechange = function ()
				{
  					if (this.readyState == 'complete') 
  					this_.sciptsToLoad--; 
				}
				myScriptTag.onload = function(){ this_.sciptsToLoad--; };
				myScriptTag.onerror = function()
				{
					this_.ShowError(
					{
						debug_caller: "Including '"+ nameOfExternalScript +"' script to the page",
						caller_name: "Including '"+ nameOfExternalScript +"' script to the page",              
						error_message: "Probably file not found"
					});					
				};

				document.getElementsByTagName("head")[0].appendChild(myScriptTag);
		    }
		}

		//If there's js script files specified, include them into the webpage
		if( this.properties[0] != "" )
		{
			//Script names are separated with '\n' or ';' depending on a Construct version
			var lines = [];

			// Split the string into array of script names
			if( __CONSTRUCT2_RUNTIME2__ )
				lines = this.properties[0].split(';');	
			else
				//lines = this.properties[0].split('\n');
				lines = this.properties[0].split(/[;\n\r]/);
			
			for(var i=0; i<lines.length; i++)
			{
				lines[i] = lines[i].trim();
				//Skip the string if it's empty or contains only spaces
					//var temp = lines[i];
					//if( !temp.replace(/\s/g, '').length )
					//continue;
				if( lines[i].length == 0 )
				{
				   continue;
				} 


				// Increase the scripts counter
				this.sciptsToLoad++;


				if( __CONSTRUCT2_RUNTIME2__ )
				{
					AddScriptToPage(this, lines[i]);
				} 
				
				if( __CONSTRUCT3_RUNTIME2__ )
				{					
					AddScriptToPage(this, this.runtime.getLocalFileUrl( lines[i] ) );
					
				} 
				
				if( __CONSTRUCT3_RUNTIME3__ )
				{
					var this_ = this;
					
					// For Construct3 r116 and higher
					if( this_._runtime.GetAssetManager().LoadProjectFileUrl !== undefined )
					{
						this_._runtime.GetAssetManager().LoadProjectFileUrl( lines[i] )
						.then(function(url)
						{
							AddScriptToPage(this_, url)
						}, function(err)
						{
							this_.ShowError(
							{
								debug_caller: "Including '"+ lines[i] +"' script to the page",
								caller_name: "Including '"+ lines[i] +"' script to the page",              
								error_message: err.message
							});
						}).catch(function(err)
						{
							this_.ShowError(
							{
								debug_caller: "Including '"+ lines[i] +"' script to the page",
								caller_name: "Including '"+ lines[i] +"' script to the page",              
								error_message: err.message
							});
						})
					}
					// For Construct3 r115 and lower
					else
					{
						AddScriptToPage(this_, this_._runtime.GetAssetManager().GetLocalFileUrl( lines[i] ));
					}
				}
			}
		}
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

		var IsValidIdentifier = function(name_)
	{	
		var fnNameRegex = /^[$A-Z_][0-9A-Z_$]*$/i;
		return fnNameRegex.test( name_ );
	}

	var DotStringToDotArray = function( str_ )
	{
		// Array of indexes that will be used to dotsplit the string. Only split by dots that are not in brackets
		// To determine whether the dot is in brackets, we use simple logic:
		// if before the dot there's different amount of '[' and ']', the dot is in brackets 
		
		var SplitArray = [];
		var left = 0;
		var right = 0;

		for( var i=0, str_length=str_.length; i<str_length; i++ )
		{
			if( str_[i] == '[' )
			{
				left++;
				continue;
			}

			if( str_[i] == ']' )
			{
				right++;
				continue;
			}

			if( str_[i] == '.' && (left == right) )
			{
				SplitArray.push(i);
			}
		}
	

		// Split the string using the SplitArray
		// ----------------------------------------------------------------------
		
		var Dotparts = [];
		var splitArrayLengthMinusOne = SplitArray.length-1;
		
		SplitArray.forEach( function(currentValue, index, arr)
		{
			var prevValue = SplitArray[index-1];

			var substr = str_.substring( prevValue+1, currentValue );
			if( substr != "" ) Dotparts.push( substr ); 

			//If this is the last dot, push to dotparts the rest of the string
			if( index == splitArrayLengthMinusOne )
			{
				substr = str_.substring( currentValue+1 );
				if( substr != "" ) Dotparts.push( substr ); 
			}
		});

		// If nothing was added to dotparts (if there was no dots), put the whole string
		if( Dotparts.length == 0 )
		{
			Dotparts.push( str_ )
		}


		
		// Trim every Dotparts element and if this is an array access, go to recursion
		//-------------------------------------------------------------------------------------------
		Dotparts.forEach( function(currentValue, index, arr)
		{ 
			// If this is something like [*]
			if( currentValue[0] == '[' )
			arr[index] = DotStringToDotArray( currentValue.substring(1, currentValue.length-1) ) ;
			
		});

		return Dotparts;
	}
	
	var HashtagParamsToCode = function(code_, params_)
	{
		// Replace all #0 #1 #3... in the code to the corresponding parameters
		code_ = code_.replace( /#[0-9]+/g, function(str)
												{
													var temp = params_[ str.substr(1) ];
													
													if (typeof temp === "string")
													return "'" + temp + "'";
													else
													return temp;
												} 
									);

		return code_;
	}
	
	var MakeCallString = function (funcname_,funcparams_)
	{
 		var callstring = funcname_ + "(";
 		
 		if (funcparams_)
		for (var i=0, funcparams_length=funcparams_.length; i<funcparams_length; ++i)
		{
			if (typeof funcparams_[i] === "string")
			callstring = callstring + "'" + funcparams_[i] + "'";
			else
			callstring = callstring + funcparams_[i];

			if( i != funcparams_.length-1 )
			callstring = callstring + ",";					
		}

		callstring = callstring + ")";

		return callstring;
	}
	
	var InstanceFunctionsObject = {
	Value( caller_name_, params_ )
    {
	    //- C2-C3 COMPATIBILITY -------------------------
	    /*
	    var params_ = Array.prototype.slice.call(arguments);
	    var ret;

	    if( __CONSTRUCT3_RUNTIME3__ )
	    	ret = {set_int: function(){}, set_float: function(){}, set_string: function(){}, set_any: function(){}};
		else
		{
			ret = params_[0];

	        for( var i=0; i<params_.length-1; i++ ) 
	        params_[i] = params_[i+1];

	    	params_.pop();
		}
		//----------------------------------------------
		*/
	    
		var alias_exp_ = params_[0];
		params_.splice(0, 1);
		
        //var caller_name_ = "'Value' expression";
		var store_return_value_ = false;
        var final = this.ParseJS(alias_exp_, true, caller_name_);
 
        // If no such alias
        /*
        if( !final.alias_found )
        {
            var info = 
            {
                debug_caller: "Value",
                caller_name: caller_name_,              
                error_message: "No such alias '" + final.trimmed_code + "'"
            }
 
            this.ShowError( info );
 
            ret.set_any( undefined );
            return;         
        }*/
 
        // If there was an error during parse-resolve
        if( final.error )
        {
            ret.set_any( undefined );
            return;
        }   
 
 
         
        var jsret = undefined;
        try
        {
            jsret = final.end;
 
        } catch(err)
        {
            var info = 
            {
                debug_caller: "Value",
                caller_name: caller_name_,
                "show-alias-expression": final.alias_found,
                alias_expression: final.trimmed_code,
                //"show-code": true,
                //code: code,           
                error_message: err.message
            }
 
            this.ShowError( info );
 
 
            ret.set_any( undefined );
            return;         
        } 


		if( typeof final.end == "function" )
	        jsret = this.CallJSfunction(alias_exp_, params_, store_return_value_, caller_name_, final );



 
        return jsret;
    },

	CallJSfunction: function(funcname_, funcparams_, store_return_value_, caller_name_, final_)
    {
        //If no store_return_value_ passed, make it true
        if( store_return_value_ === undefined )
        store_return_value_ = true;
 
        //If no caller_name_ passed, make it "'Call function' action"
        if( caller_name_ === undefined )
        caller_name_ = "'Call function' action";
 
        // Only parse if parsed result is not passed to the function
        // If it's passed, then it must have been parsed in the CallAlias action
        if( final_ === undefined )
        var final = this.ParseJS( funcname_, true, caller_name_ );
        else
        var final = final_;
         
        // Parse-resolve error
        if( final.error )
        {
            return;
        }
 
 
        //If a function name contains parenthes, shoot an error
        if( funcname_.indexOf("(") >= 0 || funcname_.indexOf(")") >= 0 )
        {
            var info = 
            {
                debug_caller: "CallJSfunction",
                caller_name: caller_name_,              
                error_message: "'" + final.trimmed_code + "' must be a function name, not a function call. Remove parentheses."
            }
 
            if( final.alias_found )
            {
                info["show-alias-expression"] = true;
                info.alias_expression = final.trimmed_code;
            }
             
            this.ShowError( info );
            return;
        }
 
 
 
 
        var ret = undefined;
 
        try
        {
            ret = final.end.apply(final.context, funcparams_);
 
        } catch(err)
        {
             
            if (err instanceof TypeError && err.message.indexOf("apply") >= 0 && err.message.indexOf("undefined") >= 0 )
            err.message = funcname_ + " is undefined";
             
 
            var info = 
            {
                debug_caller: "CallJSfunction",
                caller_name: caller_name_,
                error_message: err.message
            }
             
 
            if( final.alias_found )
            {
                info["show-alias-expression"] = true;
                info.alias_expression = MakeCallString(final.trimmed_code, funcparams_);
                info["show-code"] = true,
                info.code = MakeCallString(this.Aliases[final.alias_name].js + final.alias_trailer, funcparams_);
            }
            else
            {
                info["show-code"] = true,
                info.code = MakeCallString(final.trimmed_code, funcparams_);
            }
 
 
            this.ShowError( info );
            return;
        } 
 
        //Only store return value if the flag is true
        if( store_return_value_ )
        this.returnValue = ret;
  
        return ret;
    },

	CallAlias: function(alias_exp_, funcparams_, store_return_value_, caller_name_)
    {
        //If no store_return_value_ passed, make it true
        if( store_return_value_ === undefined )
        store_return_value_ = true;
 
        //If no caller_name_ passed, make it "'Call function' action"
        if( caller_name_ === undefined )
        caller_name_ = "'Call alias' action";
 
 
        var final = this.ParseJS(alias_exp_, true, caller_name_);
 
         
        // If no such alias
        /*
        if( !final.alias_found )
        {
            var info = 
            {
                debug_caller: "CallAlias",
                caller_name: caller_name_,              
                error_message: "No such alias '" + final.trimmed_code + "'"
            }
 
            this.ShowError( info );
            return;         
        }
        */
     
        // If there was an error during parse-resolve
        if( final.error )
        return;
 
 
        var ret = this.CallJSfunction(this.Aliases[final.alias_name].js + final.alias_trailer, funcparams_, store_return_value_, caller_name_, final );
         
        return ret;
    },

	ShowError: function( info )
	{

		var error_str = "ValerypopoffJS plugin: Error in " + info.caller_name + "\n";
		error_str += "--------------------- \n";


		if( __DEBUG__ )
		{
			error_str += "DEBUG CALLER: " + info.debug_caller + "\n";
			error_str += "--------------------- \n";
		}

		if( info["show-alias-expression"] )
		{
			error_str += "Alias expression: " + info.alias_expression + "\n";
			error_str += "--------------------- \n";
		}

		if( info["show-code"] )
		{
			error_str += "JS code: " + info.code + "\n";
			error_str += "--------------------- \n";
		}		
		
		error_str += info.error_message;

		console.error( error_str );	
	},
	
	Resolve: function( dotparts_, caller_name_, code_, alias_name_, alias_trailer_ )
	{
		var context = window;
		var end = context;
		var endname = "";
		//var prevname = "";

		for( var i=0, dotparts_length=dotparts_.length; i<dotparts_length; i++ )
		{
			endname = dotparts_[i];

			if( typeof(endname) == "object" )
			{
				var temp = this.Resolve( endname, caller_name_, code_, alias_name_, alias_trailer_ );

				if( temp.error ) return {error: true}				
					
				endname = temp.end;


				try
				{
					end = end[endname];
				}
				catch(err)
				{
					//if (err instanceof TypeError)
			 		//err.message = prevname + " is undefined";
				 	var info = 
				 	{
				 		debug_caller: "Resolve",
				 		caller_name: caller_name_,		 		
				 		error_message: err.message,
				 		"show-code": true,
				 		code: code_
				 	}

				 	if( alias_name_ )
				 	{
				 		info["show-alias-expression"] = true;
				 		info.code = this.Aliases[alias_name_].js + alias_trailer_;
				 		info.alias_expression = code_;
				 	}

				 	this.ShowError( info );
					return {error: true}
				}	

			} else
			{
				try
				{
					// Optimization
					// We only need to check if it's a valid identifier if the context is window. Because a non-identifier 
					// can only be in brackets. And when resolving the brackets contents, the context is always window
					if(context == window)
					{
						// If endname is not an identidifier, then it's a string or a number. Then it must be in [brackets]. 
						// In this case, the result of endname resolving IS an endname itself
						// In other words, you don't calculate 4 in [4] or 'something' in ['something']. 
						// You just use it as a string-index to acces an object or an array item
						if( !IsValidIdentifier(endname) )
						{
							// If this is a string in 'quotes', remove quotes, 
							// Optimization
							// if( endname[0] == '\'' ) plus substring is 14% faster than
							// endname = endname.replace(/'/g, "");
							if( endname[0] == '\'' )
							endname = endname.substring(1, endname.length-1);

							end = endname;
						}
						else
						{
							end = end[endname];
						}
					}
					else
					{
						end = end[endname];
					}

				}
				catch(err)
				{
					//if (err instanceof TypeError)
			 		//err.message = prevname + " is undefined";

				 	var info = 
				 	{
				 		debug_caller: "Resolve",
				 		caller_name: caller_name_,		 		
				 		error_message: err.message,
				 		"show-code": true,
				 		code: code_
				 	}

				 	if( alias_name_ )
				 	{
				 		info["show-alias-expression"] = true;
				 		info.code = this.Aliases[alias_name_].js + alias_trailer_;
				 		info.alias_expression = code_;
				 	}

				 	this.ShowError( info );
					return {error: true}
				}	
			}

			//prevname = endname;			


			if( i<dotparts_length-1 )
			context = end;
		}

		return { error: false, context: context, end: end, endname: endname };
	},
	
	ParseJS: function(code_, is_alias_, caller_name_)
	{
		var alias_found = false;
		var alias_name = undefined;
		var alias_trailer = undefined;
		var Dotparts = [];
		var cache = undefined;


		// Remove all unwanted spaces
		var trimmed_code = code_.trim().replace(/\s*([\.\[\]])\s*/g, "$1");


		// Getting a proper cache-------------------------------------
		//if( is_alias_ )
		cache = this.AliasDotpartsCache; 
		//else
		//cache = this.NonAliasDotpartsCache;


		// Get Dotparts from cache -----------------------------------
		if( cache.Dotparts[ trimmed_code ] )
		{
			Dotparts = cache.Dotparts[ trimmed_code ];

			//if( is_alias_ )
			if( cache.IsAlias[ trimmed_code ] )
			{
				alias_found = true;
				alias_name = cache.AliasNames[ trimmed_code ];
				alias_trailer = cache.AliasTrailers[ trimmed_code ];
			}
		}
		// No cache ---------------------------------------------
		else   
		{
			//if( is_alias_ )
			{
				alias_name = trimmed_code.split(/[\.\[]/)[0];
				alias_trailer = trimmed_code.substring( alias_name.length );

				if( this.Aliases[alias_name] )
				{
					alias_found = true;

					if( alias_trailer )
					Dotparts = DotStringToDotArray( this.Aliases[alias_name].dotstring + alias_trailer.split('[').join(".[") );
					else
					Dotparts = DotStringToDotArray( this.Aliases[alias_name].dotstring );
										
				} else 
				{
					alias_name = undefined;
					alias_trailer = undefined;
					Dotparts = DotStringToDotArray( trimmed_code.split('[').join(".[") );
				}
				/*
				return { 
						error: 			true, 
						alias_found:	alias_found, 
						trimmed_code: 	trimmed_code, 
						alias_name: 	alias_name, 
						alias_trailer: 	alias_trailer 
						};
				*/
			} 
			// Not alias, just code
			/*
			else
			{
				Dotparts = DotStringToDotArray( trimmed_code.split('[').join(".[") );
			}
			*/


			// Caching ---------------------------------------------

			// delete old cache entries if max_count entries reached
			if( cache.count >= cache.max_count )
			for( var i in cache.Dotparts ) 
			{
				delete cache.Dotparts[i];

				if( cache.IsAlias[ i ] )
				{
					delete cache.AliasNames[ i ];
					delete cache.AliasTrailers[ i ];
					delete cache.IsAlias[ i ];
				}

				cache.count--;


				if(cache.count <= cache.max_count)
				break;
			}

			
			// Put things in cache
			// DANGEROUS: trimmed_code = trimmed_code + Math.random();
			
			cache.Dotparts[ trimmed_code ] = Dotparts;

			//if( is_alias_ )
			if( alias_found )		
			{
				cache.AliasNames[ trimmed_code ] = alias_name;
				cache.AliasTrailers[ trimmed_code ] = alias_trailer;
				cache.IsAlias[ trimmed_code ] = true;
			}
			

			cache.count++;
			
			//console.log( "cache.count: " + cache.count );
			//console.log( "cache.Dotparts.length: " + Object.keys(cache.Dotparts).length );
			//console.log( "cache.AliasNames.length: " + Object.keys(cache.AliasNames).length );
			//console.log( "cache.AliasTrailers.length: " + Object.keys(cache.AliasTrailers).length );
		}


		
		var Result = this.Resolve( Dotparts, caller_name_, trimmed_code, alias_name, alias_trailer );

		return { 
					error: 			Result.error, 
					end: 			Result.end, 
					endname: 		Result.endname, 
					context: 		Result.context, 
					trimmed_code: 	trimmed_code, 
					alias_found: 	alias_found, 
					alias_name: 	alias_name, 
					alias_trailer: 	alias_trailer
				};
	}
}
	for( var k in InstanceFunctionsObject )
	{
		instanceProto[k] = InstanceFunctionsObject[k];
	}


	//////////////////////////////////////
	// Conditions
	function Cnds() {};

	var CndsObject =
	{
	C2CompareFunctionReturnValue: function(value_, cmp_, funcname_, funcparams_)
    {   
        switch( cmp_ )
        {
            case 2: cmp_=4; break;
            case 3: cmp_=5; break;
            case 4: cmp_=2; break;
            case 5: cmp_=3; break;
        }
 
        return this.CNDS.CompareFunctionReturnValue.call( this, funcname_, funcparams_, cmp_, value_ );
    },
	C2CompareAliasCallReturnValue: function(value_, cmp_, alias_exp_, funcparams_)
    {   
        switch( cmp_ )
        {
            case 2: cmp_=4; break;
            case 3: cmp_=5; break;
            case 4: cmp_=2; break;
            case 5: cmp_=3; break;
        }
 
        return this.CNDS.CompareAliasCallReturnValue.call( this, alias_exp_, funcparams_, cmp_, value_ );
    },
	C2CompareExecReturnWithParams: function(value_, cmp_, code_, params_)
    {   
        switch( cmp_ )
        {
            case 2: cmp_=4; break;
            case 3: cmp_=5; break;
            case 4: cmp_=2; break;
            case 5: cmp_=3; break;
        }
 
        return this.CNDS.CompareExecReturnWithParams.call( this, code_, params_, cmp_, value_ );
    },
	C2CompareValue: function(value_, cmp_, alias_exp_, funcparams_)
    {   
        switch( cmp_ )
        {
            case 2: cmp_=4; break;
            case 3: cmp_=5; break;
            case 4: cmp_=2; break;
            case 5: cmp_=3; break;
        }
 
        //return this.CNDS.CompareAliasCallReturnValue.call( this, alias_exp_, funcparams_, cmp_, value_ );
        return this.CNDS.CompareValue.call(this, alias_exp_, funcparams_, cmp_, value_)
    },
	CompareExecReturnWithParams: function(code_, params_, cmp_, value_)
    {   
        var ret = undefined;
        var caller_name_ = "'Compare JS code Completion value' condition";

        if( params_.length )
        code_ = HashtagParamsToCode(code_, params_);


        try
        {
            ret = eval(code_);

        } catch(err)
        {
            var info = 
            {
                debug_caller: "CompareExecReturnWithParams",
                caller_name: caller_name_,              
                error_message: err.message,
                "show-code": true,
                code: code_
            }

            this.ShowError( info );
            return;
        }


        if( typeof ret === "boolean" )
        ret = ret ? 1 : 0;
             
        return cr.do_cmp(ret, cmp_, value_);
    },
	CompareFunctionReturnValue: function(funcname_, funcparams_, cmp_, value_)
    {   
        var store_return_value_ = false;
        var ret = undefined;

        //Calling the CallJSfunction action with the flag "false" so it doesn't not store return value. 
        //We only want to store return value when the user explicitly calls Plugin Actions that execute JS code
        ret = this.CallJSfunction(funcname_, funcparams_, store_return_value_, "'Compare Function return value' condition" );

        if( typeof ret === "boolean" )
        ret = ret ? 1 : 0;
             
        return cr.do_cmp(ret, cmp_, value_);

        //Double(12) > 24
    },
	CompareStoredReturnValue: function(cmp_, value_)
    {   
        var ret = this.returnValue;
 
        if( typeof ret === "boolean" )
        ret = ret ? 1 : 0;
             
        return cr.do_cmp(ret, cmp_, value_);
    },
	AllScriptsLoaded: function()
    {   
        return ( this.sciptsToLoad <= 0 ) ? true : false;
    },
	CompareValue: function(alias_exp_, funcparams_, cmp_, value_)
    {   
        //var store_return_value_ = false;
        var ret = undefined;

        //Calling the CallAlias action with the flag "false" so it doesn't not store return value. 
        //We only want to store return value when the user explicitly calls Plugin Actions that execute JS code

		var caller_name = "'Compare Value' condition";

    	ret = this.Value( caller_name, [].concat(alias_exp_, funcparams_) );

        //ret = this.CallJSfunction(alias_exp_, funcparams_, false, "'Compare Value' condition" );

        if( typeof ret === "boolean" )
        ret = ret ? 1 : 0;
             
        return cr.do_cmp(ret, cmp_, value_);

        //Double(12) > 24
    },
	CompareAliasValue: function(alias_exp_, cmp_, value_)
    {   
        var caller_name_ = "'Compare alias' condition";
        var store_return_value_ = false;
        var final = this.ParseJS(alias_exp_, true, "'Set alias' action");
 
        // If such alias was not found
        if( !final.alias_found )
        {
            var info = 
            {
                debug_caller: "CompareAliasValue",
                caller_name: caller_name_,              
                error_message: "No such alias '" + alias_exp_ + "'"
            }
 
            this.ShowError( info );
            return;
        }
 
        // If there was an error during parse-resolve
        if( final.error )
        {
            return;
        }
 
 
 
        // If there's an object and there's a special ConstructCompare function declared in the object
        var custom_method = final.context[ this.construct_compare_function_prefix + final.endname ];
        if( custom_method && typeof(final.context) == "object" )
        {
            try
            {
                return custom_method.call( final.context, cmp_, value_ );
 
            } catch(err)
            {
                var info = 
                {
                    debug_caller: "CompareAliasValue",
                    caller_name: caller_name_,
                    "show-alias-expression": true,
                    alias_expression: final.trimmed_code,           
                    error_message: "Error in user defined '" + this.construct_compare_function_prefix + final.endname + "' function: " + err.message
                }
 
                this.ShowError( info );
                return; 
            }
             
        } else
        // Otherwise do standard Construct comparison
        {
            var ret = final.end;
             
            if( typeof ret === "boolean" )
            ret = ret ? 1 : 0;
 
            return cr.do_cmp(ret, cmp_, value_);
        }
    },
	CompareAliasCallReturnValue: function(alias_exp_, funcparams_, cmp_, value_)
    {   
        var store_return_value_ = false;
        var ret = undefined;

        //Calling the CallAlias action with the flag "false" so it doesn't not store return value. 
        //We only want to store return value when the user explicitly calls Plugin Actions that execute JS code
        ret = this.CallAlias(alias_exp_, funcparams_, store_return_value_, "'Compare Alias Call return value' condition" );

        if( typeof ret === "boolean" )
        ret = ret ? 1 : 0;
             
        return cr.do_cmp(ret, cmp_, value_);

        //Double(12) > 24
    }
	};

	for( var k in CndsObject )
	{
		Cnds.prototype[k] = CndsObject[k];
	}
	
	pluginProto.cnds = new Cnds();


	//////////////////////////////////////
	// Actions
	function Acts() {};

	var ActsObject =
	{
	ExecuteJSWithParams: function(code, params_)
    {
        var caller_name_ = "'Execute JS code' action";
        this.returnValue = undefined;
 
        // Replace all #0 #1 #3... in the code to the corresponding parameters
        code = code.replace( /#[0-9]+/g, function(str)
                                                {
                                                    var temp = params_[ str.substr(1) ];
                                                     
                                                    if (typeof temp === "string")
                                                    return "'" + temp + "'";
                                                    else
                                                    return temp;
                                                } 
                                    );
 
        try
        {
            this.returnValue = eval(code);
 
        } catch(err)
        {
            this.ShowError( 
            { 
                debug_caller: "ExecuteJSWithParams",
                caller_name: caller_name_,
                "show-code": true,
                code: code,
                error_message: err.message
            });
 
            return;
        }
    },
	CallJSfunction: function(funcname_, funcparams_, store_return_value_, caller_name_, final_)
    {
    	this.CallJSfunction(funcname_, funcparams_, store_return_value_, caller_name_, final_);
    },
	SetValue: function(alias_exp_, alias_value_)
    {
        var caller_name_ = "'Set value' action";
        var final = this.ParseJS(alias_exp_, true, caller_name_);
 
        // If such alias was not found
        /*
        if( !final.alias_found )
        {
            var info = 
            {
                debug_caller: "SetValue",
                caller_name: caller_name_,              
                error_message: "No such alias '" + final.trimmed_code + "'"
            }
 
            this.ShowError( info );
            return;         
        } */
 
        // Error during parse-resolve
        if( final.error )
        return;
         
 
 
        try
        {
            final.context[final.endname] = alias_value_;
             
        // It seems like no way an error can occure though
        } catch(err)
        {
            var code = alias_exp_ + "=";
            if( typeof alias_value_ == "string" )
            code = code + "'" + alias_value_ + "'";
            else
            code = code + alias_value_;
 
            var info = 
            {
                debug_caller: "SetValue",
                caller_name: caller_name_,
                "show-alias-expression": final.alias_found,
                alias_expression: final.trimmed_code,
                "show-code": true,
                code: code,         
                error_message: err.message
            }
 
            this.ShowError( info );
            return;         
        } 
    },
	Call: function(alias_exp_, funcparams_, store_return_value_, caller_name_)
    {
		//this.CallAlias(alias_exp_, funcparams_, true, "'Call' action");

		this.CallJSfunction(alias_exp_, funcparams_, true, "'Call' action" );
    },
	InitAlias: function(alias_name_, alias_js_)
    {
        var caller_name_ = "'Init alias' action";
        alias_name_ = alias_name_.trim();
        alias_js_ = alias_js_.trim();
 
 
        //If the JS is empty, shoot an error
        if( alias_js_.length == 0 )
        {
            var info = 
            {
                debug_caller: "InitAlias",
                caller_name: caller_name_,
                error_message: "Javascript string of alias '" + alias_name_ + "' must not be empty."
            }
 
            this.ShowError( info );
            return;             
        }
 
        //If the alias name contains dots or brackets, shoot an error
        if( alias_name_.indexOf(".") >= 0 || alias_name_.indexOf("[") >= 0 || alias_name_.indexOf("]") >= 0 )
        {
            var info = 
            {
                debug_caller: "InitAlias",
                caller_name: caller_name_,
                error_message: "Alias name must not contain '.', '[' or ']' signs: '" + alias_name_ + "'"
            }
 
            this.ShowError( info );
            return;
        }
 
 
        // Check if there's already an alias with the same name
        //if( this.AliasIndex( alias_name_ ) >= 0 )
        if( this.Aliases[alias_name_] != undefined )
        {
            var info = 
            {
                debug_caller: "InitAlias",
                caller_name: caller_name_,
                error_message: "Alias '" + alias_name_ + "' already exists"
            }
 
            this.ShowError( info );
            return;
        }
 
 
        // Finally, if everything is OK, add new alias
        var newAlias = new Object();
        newAlias.js = alias_js_;
        newAlias.dotstring = alias_js_.split('[').join(".[");
        //newAlias.name = alias_name_;
        //newAlias.dotparts = DotStringToDotArray(newAlias.dotstring);
        //newAlias.dotparts_length = newAlias.dotparts.length;
 
        this.Aliases[alias_name_] = newAlias;
    },
	SetAlias: function(alias_exp_, alias_value_)
    {
        var caller_name_ = "'Set alias' action";
        var final = this.ParseJS(alias_exp_, true, "'Set alias' action");
 
        // If such alias was not found
        if( !final.alias_found )
        {
            var info = 
            {
                debug_caller: "SetAlias",
                caller_name: caller_name_,              
                error_message: "No such alias '" + final.trimmed_code + "'"
            }
 
            this.ShowError( info );
            return;         
        }
 
        // Error during parse-resolve
        if( final.error )
        return;
         
 
 
        try
        {
            final.context[final.endname] = alias_value_;
             
        // It seems like no way an error can occure though
        } catch(err)
        {
            var code = alias_exp_ + "=";
            if( typeof alias_value_ == "string" )
            code = code + "'" + alias_value_ + "'";
            else
            code = code + alias_value_;
 
            var info = 
            {
                debug_caller: "SetAlias",
                caller_name: caller_name_,
                "show-alias-expression": true,
                alias_expression: final.trimmed_code,
                "show-code": true,
                code: code,         
                error_message: err.message
            }
 
            this.ShowError( info );
            return;         
        } 
    },
	CallAlias: function(alias_exp_, funcparams_, store_return_value_, caller_name_)
    {
		this.CallAlias(alias_exp_, funcparams_, store_return_value_, caller_name_);
    }
	};

	for( var k in ActsObject )
	{
		Acts.prototype[k] = ActsObject[k];
	}

	
	pluginProto.acts = new Acts();


	//////////////////////////////////////
	// Expressions
	function Exps() {};

	var ExpsObject =
	{
	JSCodeValue: function()
    {
	    //- C2-C3 COMPATIBILITY -------------------------
	    var params_ = Array.prototype.slice.call(arguments);
	    var ret;

	    if( __CONSTRUCT3_RUNTIME3__ )
	    	ret = {set_int: function(){}, set_float: function(){}, set_string: function(){}, set_any: function(){}};
		else
		{
			ret = params_[0];

	        for( var i=0; i<params_.length-1; i++ ) 
	        params_[i] = params_[i+1];

	    	params_.pop();
		}
		//----------------------------------------------
	    
    	var code_ = params_[0];
    	
    	var caller_name_ = "'JSCodeValue' expression";
        var jscode = code_;
 
        //Make an array from all arguments of a function. 
        //Then delete first param leaving only parameters that were passed to a code (if any)
        params_.splice(0, 1);
 
        if( params_.length )
        jscode = HashtagParamsToCode(jscode, params_);
 
 
 
        var jsret = undefined;
        try
        {
            jsret = eval(jscode);
        } catch(err)
        {
            this.ShowError( 
            { 
                debug_caller: "JSCodeValue",
                caller_name: caller_name_,
                "show-code": true,
                code: jscode,
                error_message: err.message
            });
 
 
            ret.set_any( undefined );
            return;         
        }
 
        if( typeof jsret == "boolean" )
        {
        	ret.set_any( jsret ? 1 : 0 );
        	
        	if( __CONSTRUCT3_RUNTIME3__ )
        	return jsret ? 1 : 0;
        }
        else
        {
        	ret.set_any( jsret );
        	
        	if( __CONSTRUCT3_RUNTIME3__ )
        	return jsret;
        }
    },
	StoredReturnValue: function() 
    {
	    //- C2-C3 COMPATIBILITY -------------------------
	    var params_ = Array.prototype.slice.call(arguments);
	    var ret;

	    if( __CONSTRUCT3_RUNTIME3__ )
	    	ret = {set_int: function(){}, set_float: function(){}, set_string: function(){}, set_any: function(){}};
		else
		{
			ret = params_[0];

	        for( var i=0; i<params_.length-1; i++ ) 
	        params_[i] = params_[i+1];

	    	params_.pop();
		}
		//----------------------------------------------
	    

        if( typeof this.returnValue === "boolean" )
        {
        	ret.set_any( this.returnValue ? 1 : 0 );
        	
        	if( __CONSTRUCT3_RUNTIME3__ )
        	return this.returnValue ? 1 : 0;
        }
        else
        {
        	ret.set_any( this.returnValue );
        	
        	if( __CONSTRUCT3_RUNTIME3__ )
        	return this.returnValue;
        }
    },
	FunctionReturnValue: function()    
    {
	    //- C2-C3 COMPATIBILITY -------------------------
	    var params_ = Array.prototype.slice.call(arguments);
	    var ret;

	    if( __CONSTRUCT3_RUNTIME3__ )
	    	ret = {set_int: function(){}, set_float: function(){}, set_string: function(){}, set_any: function(){}};
		else
		{
			ret = params_[0];

	        for( var i=0; i<params_.length-1; i++ ) 
	        params_[i] = params_[i+1];

	    	params_.pop();
		}
		//----------------------------------------------
	    
		var func_exp_ = params_[0];

        var caller_name_ = "'FunctionReturnValue' expression";
        var store_return_value_ = false;
        var final = this.ParseJS(func_exp_, false, caller_name_);
 
        //Make an array from all arguments of a function. 
        //Then delete first param leaving only parameters that were passed to a code (if any)
        params_.splice(0, 1);
 
 
        // If there was an error during parse-resolve
        if( final.error )
        {
            ret.set_any( undefined );
            return;
        }   
 
         
        var jsret = undefined;
        jsret = this.CallJSfunction(func_exp_, params_, store_return_value_, caller_name_, final );
 
 
        if( typeof jsret === "boolean" )
        {
        	ret.set_any( jsret ? 1 : 0 );
        	
        	if( __CONSTRUCT3_RUNTIME3__ )
        	return jsret ? 1 : 0;
        }
        else
        {
        	ret.set_any( jsret );
        	
        	if( __CONSTRUCT3_RUNTIME3__ )
        	return jsret;
        }
 
        return;
    },
	Value: function()    
    {
	    //- C2-C3 COMPATIBILITY -------------------------
	    var params_ = Array.prototype.slice.call(arguments);
	    var ret;

	    if( __CONSTRUCT3_RUNTIME3__ )
	    	ret = {set_int: function(){}, set_float: function(){}, set_string: function(){}, set_any: function(){}};
		else
		{
			ret = params_[0];

	        for( var i=0; i<params_.length-1; i++ ) 
	        params_[i] = params_[i+1];

	    	params_.pop();
		}
		//----------------------------------------------

		var caller_name = "'Value' expression";

    	var jsret = this.Value( caller_name, params_ );

        if( typeof jsret === "boolean" )
        {
        	ret.set_any( jsret ? 1 : 0 );
        	
        	if( __CONSTRUCT3_RUNTIME3__ )
        	return jsret ? 1 : 0;
        }
        else
        {
        	ret.set_any( jsret );
        	
        	if( __CONSTRUCT3_RUNTIME3__ )
        	return jsret;
        }
 
        return;
    },
	AliasValue: function()    
    {
	    //- C2-C3 COMPATIBILITY -------------------------
	    var params_ = Array.prototype.slice.call(arguments);
	    var ret;

	    if( __CONSTRUCT3_RUNTIME3__ )
	    	ret = {set_int: function(){}, set_float: function(){}, set_string: function(){}, set_any: function(){}};
		else
		{
			ret = params_[0];

	        for( var i=0; i<params_.length-1; i++ ) 
	        params_[i] = params_[i+1];

	    	params_.pop();
		}
		//----------------------------------------------
	    
		var alias_exp_ = params_[0];
        var caller_name_ = "'AliasValue' expression";
        var final = this.ParseJS(alias_exp_, true, caller_name_);
 
        // If no such alias
        if( !final.alias_found )
        {
            var info = 
            {
                debug_caller: "AliasValue",
                caller_name: caller_name_,              
                error_message: "No such alias '" + final.trimmed_code + "'"
            }
 
            this.ShowError( info );
 
            ret.set_any( undefined );
            return;         
        }
 
        // If there was an error during parse-resolve
        if( final.error )
        {
            ret.set_any( undefined );
            return;
        }   
 
 
         
        var jsret = undefined;
        try
        {
            jsret = final.end;
 
        } catch(err)
        {
            var info = 
            {
                debug_caller: "AliasValue",
                caller_name: caller_name_,
                "show-alias-expression": true,
                alias_expression: final.trimmed_code,
                //"show-code": true,
                //code: code,           
                error_message: err.message
            }
 
            this.ShowError( info );
 
 
            ret.set_any( undefined );
            return;         
        } 
 
        if( typeof jsret === "boolean" )
        {
        	ret.set_any( jsret ? 1 : 0 );
        	
        	if( __CONSTRUCT3_RUNTIME3__ )
        	return jsret ? 1 : 0;
        }
        else
        {
        	ret.set_any( jsret );
        	
        	if( __CONSTRUCT3_RUNTIME3__ )
        	return jsret;
        }
 
        return;
    },
	AliasCallReturnValue: function()  
    {
	    //- C2-C3 COMPATIBILITY -------------------------
	    var params_ = Array.prototype.slice.call(arguments);
	    var ret;

	    if( __CONSTRUCT3_RUNTIME3__ )
	    	ret = {set_int: function(){}, set_float: function(){}, set_string: function(){}, set_any: function(){}};
		else
		{
			ret = params_[0];

	        for( var i=0; i<params_.length-1; i++ ) 
	        params_[i] = params_[i+1];

	    	params_.pop();
		}
		//----------------------------------------------
	    
		var alias_exp_ = params_[0];

        var caller_name_ = "'AliasCallValue' expression";
        var store_return_value_ = false;
        var final = this.ParseJS(alias_exp_, true, caller_name_);
 
        //Make an array from all arguments of a function. 
        //Then delete first param leaving only parameters that were passed to a code (if any)
        params_.splice(0, 1);
 
 
        // If no such alias
        if( !final.alias_found )
        {
            var info = 
            {
                debug_caller: "AliasCallValue",
                caller_name: caller_name_,              
                error_message: "No such alias '" + final.trimmed_code + "'"
            }
 
            this.ShowError( info );
 
            ret.set_any( undefined );
            return;         
        }
 
        // If there was an error during parse-resolve
        if( final.error )
        {
            ret.set_any( undefined );
            return;
        }   
 
 
         
        var jsret = undefined;
        jsret = this.CallJSfunction(alias_exp_, params_, store_return_value_, caller_name_, final );
 
 
        if( typeof jsret === "boolean" )
        {
        	ret.set_any( jsret ? 1 : 0 );
        	
        	if( __CONSTRUCT3_RUNTIME3__ )
        	return jsret ? 1 : 0;
        }
        else
        {
        	ret.set_any( jsret );  
        	
        	if( __CONSTRUCT3_RUNTIME3__ )
        	return jsret;
        }
        
        return;
    }
	};

	for( var k in ExpsObject )
	{
		Exps.prototype[k] = ExpsObject[k];
	}
	
	pluginProto.exps = new Exps();

	instanceProto.EXPS = pluginProto.exps;
	instanceProto.CNDS = pluginProto.cnds;
	instanceProto.ACTS = pluginProto.acts;
}());