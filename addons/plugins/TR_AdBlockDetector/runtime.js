/**
 * Object holder for the plugin
 */
cr.plugins_.TR_AdBlockDetector = function (runtime)
{
    this.runtime = runtime;
};

/**
 * C2 plugin
 */
(function ()
{

    var pluginProto = cr.plugins_.TR_AdBlockDetector.prototype;

    pluginProto.Type = function (plugin)
    {
        this.plugin = plugin;
        this.runtime = plugin.runtime;
    };

    var typeProto = pluginProto.Type.prototype;

    typeProto.onCreate = function ()
    {
    };

    /**
     * C2 specific behaviour
     */
    pluginProto.Instance = function (type)
    {
        this.type = type;
        this.runtime = type.runtime;
    };

    var instanceProto = pluginProto.Instance.prototype;

    instanceProto.onCreate = function ()
    {
        this.adblock = false
        var self =  this
        var xhttp = new XMLHttpRequest ();
        xhttp.onreadystatechange = function () {

            if (this.readyState === 4 && this.status === 0)
                self.adblock = true
        }
        xhttp.open ("GET", "https://api.adinplay.com/libs/aiptag/assets/adsbygoogle.js", true);
        xhttp.send ();
    };


    function Cnds()
    {
    }


    /** * @returns {boolean} */
    Cnds.prototype.IsBlocking = function ()
    {
        return (this.adblock);
    };

    /** * @returns {boolean} */
    Cnds.prototype.IsReady = function ()
    {
        return true;
    };

    pluginProto.cnds = new Cnds();

    /**
     * Plugin actions
     */
    function Acts()
    {
    }


    pluginProto.acts = new Acts();

    function Exps()
    {
    };

    Exps.prototype.IsBlocking = function (ret)
    {
        ret.set_int(+(this.adblock));
    };

    pluginProto.exps = new Exps();

}());
