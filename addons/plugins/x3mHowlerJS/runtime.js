// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

var HowlerAudioPlayer = globalThis.HowlerAudioPlayer;
/////////////////////////////////////
// Plugin class
cr.plugins_.skymenhowlerjs = function (runtime) {
  this.runtime = runtime;
};

(function () {
  /////////////////////////////////////
  var pluginProto = cr.plugins_.skymenhowlerjs.prototype;

  /////////////////////////////////////
  // Object type class
  pluginProto.Type = function (plugin) {
    this.plugin = plugin;
    this.runtime = plugin.runtime;
    HowlerAudioPlayer.init(this.runtime);
  };

  var typeProto = pluginProto.Type.prototype;

  // called on startup for each object type
  typeProto.onCreate = function () {};

  /////////////////////////////////////
  // Instance class
  pluginProto.Instance = function (type) {
    this.type = type;
    this.runtime = type.runtime;
  };

  var instanceProto = pluginProto.Instance.prototype;
  // called whenever an instance is created
  instanceProto.onCreate = function () {};

  instanceProto.saveToJSON = function () {};

  instanceProto.loadFromJSON = function (o) {};

  instanceProto.onDestroy = function () {};

  instanceProto.tick = function () {};

  // only called if a layout object
  instanceProto.draw = function (ctx) {};

  instanceProto.drawGL = function (glw) {};

  /**BEGIN-PREVIEWONLY**/
  instanceProto.getDebuggerValues = function (propsections) {};

  instanceProto.onDebugValueEdited = function (header, name, value) {};
  /**END-PREVIEWONLY**/

  //////////////////////////////////////
  // Conditions
  function Cnds() {}

  Cnds.prototype.IsPlaying = function (group) {
    if (group.trim() === "") {
      return HowlerAudioPlayer.isPlaying();
    }
    return HowlerAudioPlayer.isPlaying(group);
  };

  pluginProto.cnds = new Cnds();

  //////////////////////////////////////
  // Actions
  function Acts() {}

  Acts.prototype.Play = function (file, group) {
    if (group.trim() === "") {
      HowlerAudioPlayer.play(file[0]);
    } else {
      HowlerAudioPlayer.play(file[0], group);
    }
  };
  Acts.prototype.PlayByName = function (file, group) {
    if (group.trim() === "") {
      HowlerAudioPlayer.play(file);
    } else {
      HowlerAudioPlayer.play(file, group);
    }
  };
  Acts.prototype.Stop = function (group) {
    if (group.trim() === "") {
      HowlerAudioPlayer.stop();
    } else {
      HowlerAudioPlayer.stop(group);
    }
  };
  Acts.prototype.Mute = function (group) {
    if (group.trim() === "") {
      HowlerAudioPlayer.setMuted(true);
    } else {
      HowlerAudioPlayer.setMuted(true, group);
    }
  };
  Acts.prototype.Unmute = function (group) {
    if (group.trim() === "") {
      HowlerAudioPlayer.setMuted(false);
    } else {
      HowlerAudioPlayer.setMuted(false, group);
    }
  };
  Acts.prototype.Volume = function (volume, group) {
    if (group.trim() === "") {
      HowlerAudioPlayer.setVolume(volume);
    } else {
      HowlerAudioPlayer.setVolume(volume, group);
    }
  };
  Acts.prototype.LinearVolume = function (volume, group) {
    if (group.trim() === "") {
      HowlerAudioPlayer.setLinearVolume(volume);
    } else {
      HowlerAudioPlayer.setLinearVolume(volume, group);
    }
  };
  Acts.prototype.Load = function (file, group) {
    if (group.trim() === "") {
      HowlerAudioPlayer.load(file[0]);
    } else {
      HowlerAudioPlayer.load(file[0], group);
    }
  };
  Acts.prototype.Unload = function (file, group) {
    if (group.trim() === "") {
      HowlerAudioPlayer.unload(file[0]);
    } else {
      HowlerAudioPlayer.unload(file[0], group);
    }
  };
  Acts.prototype.LoadByName = function (file, group) {
    if (group.trim() === "") {
      HowlerAudioPlayer.load(file);
    } else {
      HowlerAudioPlayer.load(file, group);
    }
  };
  Acts.prototype.UnloadByName = function (file, group) {
    if (group.trim() === "") {
      HowlerAudioPlayer.unload(file);
    } else {
      HowlerAudioPlayer.unload(file, group);
    }
  };

  pluginProto.acts = new Acts();

  //////////////////////////////////////
  // Expressions
  function Exps() {}
  Exps.prototype.Volume = function (ret, group) {
    if (group.trim() === "") {
      ret.set_float(HowlerAudioPlayer.getVolume());
    } else {
      ret.set_float(HowlerAudioPlayer.getVolume(group));
    }
  };
  Exps.prototype.MasterVolume = function (ret) {
    ret.set_float(HowlerAudioPlayer.getVolume(group));
  };
  Exps.prototype.LinearVolume = function (ret, group) {
    if (group.trim() === "") {
      ret.set_float(HowlerAudioPlayer.getLinearVolume());
    } else {
      ret.set_float(HowlerAudioPlayer.getLinearVolume(group));
    }
  };
  Exps.prototype.MasterVolume = function (ret) {
    ret.set_float(HowlerAudioPlayer.getLinearVolume(group));
  };
  pluginProto.exps = new Exps();
})();
