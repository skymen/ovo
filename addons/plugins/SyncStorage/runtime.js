// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class

cr.plugins_.SyncStorage = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	///////////////////////////////////////

    ///////////////////////////////////////
	var pluginProto = cr.plugins_.SyncStorage.prototype;
		
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
        this.data = {};
        this.isStorageLoaded = false;
        this.storageIndex = this.properties[1];
        this.isEncodingEnabled = !this.properties[3];
        this.headSalt = this.properties[4];
        this.tailSalt = this.properties[5];
        this.isLocalStorageLoaded = null;
        this.LS_Instance = null;
        this.LS_ProtoActions = null;
        //this.LS_ProtoExpressions = null;

        this.lastErrorMsg = null;
	};

	// called whenever an instance is destroyed
	// note the runtime may keep the object after this call for recycling; be sure
	// to release/recycle/reset any references to other objects in this function.
	instanceProto.onDestroy = function ()
	{
	};

    instanceProto.isLocalStorageReady = function()
    {
        if (this.isLocalStorageLoaded) return true;

        if ( ! this.storageIndex) return false;

        if(cr.plugins_.LocalStorage)
        {
            var type, LS_Type;
            for (type in this.runtime.types)
            {
                if ( ! this.runtime.types.hasOwnProperty(type)) continue;

                if (this.runtime.types[type].plugin instanceof cr.plugins_.LocalStorage)
                {
                    LS_Type = this.runtime.types[type];
                }
            }

            if (LS_Type)
            {
                this.LS_Instance = LS_Type.instances[0];
                this.LS_ProtoActions = cr.plugins_.LocalStorage.prototype.acts;
                //this.LS_ProtoExpressions = cr.plugins_.LocalStorage.prototype.exps;
                this.isLocalStorageLoaded = true;

                return true;
            }
        }

        console.log("\n*\n*\n*\nERROR: LocalStorage plugin not found. You must add LocalStorage plugin to the project. It's a JS library for SyncStorage plugin.\n*\n*\n*\n");
        return false;
    };
	//////////////////////////////////////

    /**BEGIN-PREVIEWONLY**/
    instanceProto.getDebuggerValues = function (propsections)
    {
        var props = [];

        props.push({"name": "LocalStorage IDX", "value": this.storageIndex, "readonly": true});

        for (var p in this.data)
        {
            if (this.data.hasOwnProperty(p))
            {
                props.push({"name": p, "value": this.data[p]});
            }
        }

        propsections.push({
            "title": "SyncStorage",
            "properties": props
        });
    };

    instanceProto.onDebugValueEdited = function (header, name, value)
    {
        this.data[name] = value;
    };
    /**END-PREVIEWONLY**/

	// Conditions
	function Cnds() {};


	/**
	 * @returns {boolean}
	 */
    Cnds.prototype.OnLoaded = function()
    {
        return true;
    };

    /**
     * @returns {boolean}
     */
    Cnds.prototype.OnLoadError = function()
    {
        return true;
    };

	/**
	 * @returns {boolean}
	 */
	Cnds.prototype.IsLoaded = function()
	{
		return this.isStorageLoaded;
	};


    /**
     * @returns {boolean}
     */
    Cnds.prototype.HasData = function(index_)
    {
        return this.hasData(index_);
    };

    /**
     * @returns {boolean}
     */
    Cnds.prototype.CompareData = function(dataIndex_, cmp_, value_)
    {
        return cr.do_cmp(this.data[dataIndex_], cmp_, value_);
    };

    /**
     * @returns {boolean}
     */
    Cnds.prototype.OnSave = function()
    {
        return true;
    };

    /**
     * @returns {boolean}
     */
    Cnds.prototype.OnDataMissing = function()
    {
        return true;
    };

	pluginProto.cnds = new Cnds();
	
	//////////////////////////////////////
	// Actions
	function Acts() {};


    Acts.prototype.SetData = function(index_, value_)
    {
        this.data[index_] = value_;
    };

    Acts.prototype.SaveData = function()
    {
        if(this.isLocalStorageReady())
        {
            this.LS_ProtoActions.SetItem.call(this.LS_Instance, this.storageIndex,
                this.isEncodingEnabled
                    ? this.encode(JSON.stringify(this.data))
                    : JSON.stringify(this.data));
        }

        this.runtime.trigger(cr.plugins_.SyncStorage.prototype.cnds.OnSave, this);
    };

    Acts.prototype.LoadData = function()
    {
        if( ! this.isLocalStorageReady())
        {
            this.lastErrorMsg = "Could not load data from LocalStorage. Possible reasons: \"LocalStorage IDX\" property not set or LocalStorage plugin is not added to the project.";
            this.runtime.trigger(cr.plugins_.SyncStorage.prototype.cnds.OnLoadError, this);
            this.lastErrorMsg = "";
            return;
        }


        var self = this;
        localforage["getItem"](this.storageIndex, function (err, value)
        {
            if (err)
            {
                if ( ! err)
                    err = "unknown error";

                else if (typeof err.message === "string")
                    err = err.message;
                else if (typeof err.name === "string")
                    err = err.name;
                else if (typeof err.data === "string")
                    err = err.data;
                else if (typeof err !== "string")
                    err = "unknown error";

                self.isStorageLoaded = false;
                self.lastErrorMsg = err;
                self.runtime.trigger(cr.plugins_.SyncStorage.prototype.cnds.OnLoadError, self);

                self.lastErrorMsg = null;
            }
            else
            {
                // if no data found, create new
                if (typeof value === "undefined" || value === null || value === "")
                {
                    self.data = {};
                    self.runtime.trigger(cr.plugins_.SyncStorage.prototype.cnds.OnDataMissing, self);
                }
                //otherwise load existing data
                else
                {
                    self.data = self.isEncodingEnabled ? JSON.parse(self.decode(value)) : JSON.parse(value);
                }

                self.isStorageLoaded = true;
                self.runtime.trigger(cr.plugins_.SyncStorage.prototype.cnds.OnLoaded, self);
            }
        });
    };

    Acts.prototype.ClearData = function()
    {
        this.data = {};
    };

    Acts.prototype.RemoveData = function(index_)
    {
        if(typeof this.data[index_] !== "undefined")
        {
            delete this.data[index_];
        }
    };

    Acts.prototype.LoadString = function(data_)
    {
        try
        {
            if(data_ == "")
            {
                this.data = {};
                this.runtime.trigger(cr.plugins_.SyncStorage.prototype.cnds.OnDataMissing, this);
            }
            else
            {
                if(data_.charAt(0) === "{")
                {
                    this.data = JSON.parse(data_);
                }
                else
                {
                    this.data = JSON.parse(this.decode(data_));
                }
            }

            this.runtime.trigger(cr.plugins_.SyncStorage.prototype.cnds.OnLoaded, this);
        }
        catch(e)
        {
            this.lastErrorMsg = e.message;
            this.runtime.trigger(cr.plugins_.SyncStorage.prototype.cnds.OnLoadError, this);
            this.lastErrorMsg = "";
        }


    };

    Acts.prototype.AddValue = function(index_, value_)
    {
        if ( ! this.hasData(index_))
        {
            this.data[index_] = 0;
        }

        if ( ! isNaN(parseFloat(value_)) && isFinite(value_))
        {
            this.data[index_] += value_;
        }
    };

    Acts.prototype.SubtractValue = function(index_, value_)
    {
        if ( ! this.hasData(index_))
        {
            this.data[index_] = 0;
        }

        if ( ! isNaN(parseFloat(value_)) && isFinite(value_))
        {
            this.data[index_] -= value_;
        }
    };

    Acts.prototype.AppendValue = function(index_, value_)
    {
        if ( ! this.hasData(index_))
        {
            this.data[index_] = "";
        }

        if (typeof value_ === "string")
        {
            this.data[index_] += value_;
        }
    };

    Acts.prototype.PrependValue = function(index_, value_)
    {
        if ( ! this.hasData(index_))
        {
            this.data[index_] = "";
        }

        if (typeof value_ === "string")
        {
            this.data[index_] = value_ + this.data[index_];
        }
    };

	pluginProto.acts = new Acts();
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};

	Exps.prototype.GetData = function(ret, dataIndex_)
	{
        ret.set_any(this.data[dataIndex_]);
	};

    Exps.prototype.StorageIndex = function(ret)
    {
        ret.set_string(this.storageIndex);
    };

    Exps.prototype.HasData = function(ret, index_)
    {
        ret.set_int(+this.hasData(index_));
    };

    Exps.prototype.AsJSON = function(ret)
    {
        ret.set_string(JSON.stringify(this.data));
    };

    Exps.prototype.AsString = function(ret)
    {
        ret.set_string(this.isEncodingEnabled
            ? this.encode(JSON.stringify(this.data))
            : JSON.stringify(this.data));
    };

    Exps.prototype.ErrorMsg = function(ret)
    {
        ret.set_string(this.lastErrorMsg);
    };

    Exps.prototype.Get = function(ret, dataIndex_)
    {
        ret.set_any(this.data[dataIndex_]);
    };

    Exps.prototype.Has = function(ret, index_)
    {
        ret.set_int(+this.hasData(index_));
    };

    instanceProto.encode = function (rawData)
    {
        var encodedData = Secret.encode(rawData);
        var i;

        for (i = 0; i < this.headSalt; i++)
        {
            encodedData = encodedData.charAt(Math.floor((Math.random() * (encodedData.length-1)))) + encodedData;
        }

        for (i = 0; i < this.tailSalt; i++)
        {
            encodedData += encodedData.charAt(Math.floor((Math.random() * (encodedData.length-1))));
        }

        return encodedData;
    };

    instanceProto.decode = function (encodedData)
    {
        var rawData = encodedData.substring(this.headSalt);
        rawData = rawData.substring(0, rawData.length - this.tailSalt);

        rawData = Secret.decode(rawData);
        return rawData;
    };

    instanceProto.hasData = function(index_)
    {
        return !! this.data[index_];
    };

    pluginProto.exps = new Exps();


	//////////////////////////////////////
	// Custom functions

    var Secret={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(r){var t,e,o,a,h,n,d,C="",i=0;for(r=Secret._utf8_encode(r);i<r.length;)a=(t=r.charCodeAt(i++))>>2,h=(3&t)<<4|(e=r.charCodeAt(i++))>>4,n=(15&e)<<2|(o=r.charCodeAt(i++))>>6,d=63&o,isNaN(e)?n=d=64:isNaN(o)&&(d=64),C=C+this._keyStr.charAt(a)+this._keyStr.charAt(h)+this._keyStr.charAt(n)+this._keyStr.charAt(d);return C},decode:function(r){var t,e,o,a,h,n,d="",C=0;for(r=r.replace(/[^A-Za-z0-9\+\/\=]/g,"");C<r.length;)t=this._keyStr.indexOf(r.charAt(C++))<<2|(a=this._keyStr.indexOf(r.charAt(C++)))>>4,e=(15&a)<<4|(h=this._keyStr.indexOf(r.charAt(C++)))>>2,o=(3&h)<<6|(n=this._keyStr.indexOf(r.charAt(C++))),d+=String.fromCharCode(t),64!=h&&(d+=String.fromCharCode(e)),64!=n&&(d+=String.fromCharCode(o));return d=Secret._utf8_decode(d)},_utf8_encode:function(r){r=r.replace(/\r\n/g,"\n");for(var t="",e=0;e<r.length;e++){var o=r.charCodeAt(e);o<128?t+=String.fromCharCode(o):o>127&&o<2048?(t+=String.fromCharCode(o>>6|192),t+=String.fromCharCode(63&o|128)):(t+=String.fromCharCode(o>>12|224),t+=String.fromCharCode(o>>6&63|128),t+=String.fromCharCode(63&o|128))}return t},_utf8_decode:function(r){for(var t="",e=0,o=0,a=0,h=0;e<r.length;)(o=r.charCodeAt(e))<128?(t+=String.fromCharCode(o),e++):o>191&&o<224?(a=r.charCodeAt(e+1),t+=String.fromCharCode((31&o)<<6|63&a),e+=2):(a=r.charCodeAt(e+1),h=r.charCodeAt(e+2),t+=String.fromCharCode((15&o)<<12|(63&a)<<6|63&h),e+=3);return t}};
}());