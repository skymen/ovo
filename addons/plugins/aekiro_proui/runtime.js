// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.aekiro_proui2 = function (runtime) {
  this.runtime = runtime;
};

(function () {
  var pluginProto = cr.plugins_.aekiro_proui2.prototype;

  /////////////////////////////////////
  // Object type class
  pluginProto.Type = function (plugin) {
    this.plugin = plugin;
    this.runtime = plugin.runtime;
  };

  var typeProto = pluginProto.Type.prototype;

  typeProto.onCreate = function () {};

  /////////////////////////////////////
  // Instance class
  pluginProto.Instance = function (type) {
    this.type = type;
    this.runtime = type.runtime;
    this.touches = [];
    this.mouseDown = false;
    this.touchDown = false;
    this.cursor = { x: null, y: null };

    this._callbackObjs = {};
    this._callbackObjs["touch"] = [];
    this._callbackObjs["wheel"] = [];

    //aekiro
    this.handled = false;
  };

  var instanceProto = pluginProto.Instance.prototype;

  var dummyoffset = { left: 0, top: 0 };

  instanceProto.findTouch = function (id) {
    var i, len;
    for (i = 0, len = this.touches.length; i < len; i++) {
      if (this.touches[i]["id"] === id) return i;
    }

    return -1;
  };

  var theInstance = null;

  var touchinfo_cache = [];

  function AllocTouchInfo(x, y, id, index) {
    var ret;

    if (touchinfo_cache.length) ret = touchinfo_cache.pop();
    else ret = new TouchInfo();

    ret.init(x, y, id, index);
    return ret;
  }

  function ReleaseTouchInfo(ti) {
    if (touchinfo_cache.length < 100) touchinfo_cache.push(ti);
  }

  var GESTURE_HOLD_THRESHOLD = 15; // max px motion for hold gesture to register
  var GESTURE_HOLD_TIMEOUT = 500; // time for hold gesture to register
  var GESTURE_TAP_TIMEOUT = 333; // time for tap gesture to register
  var GESTURE_DOUBLETAP_THRESHOLD = 25; // max distance apart for taps to be

  function TouchInfo() {
    this.starttime = 0;
    this.time = 0;
    this.lasttime = 0;

    this.startx = 0;
    this.starty = 0;
    this.x = 0;
    this.y = 0;
    this.lastx = 0;
    this.lasty = 0;

    this["id"] = 0;
    this.startindex = 0;

    this.triggeredHold = false;
    this.tooFarForHold = false;
  }

  TouchInfo.prototype.init = function (x, y, id, index) {
    var nowtime = cr.performance_now();
    this.time = nowtime;
    this.lasttime = nowtime;
    this.starttime = nowtime;

    this.startx = x;
    this.starty = y;
    this.x = x;
    this.y = y;
    this.lastx = x;
    this.lasty = y;
    this.width = 0;
    this.height = 0;
    this.pressure = 0;

    this["id"] = id;
    this.startindex = index;

    this.triggeredHold = false;
    this.tooFarForHold = false;
  };

  TouchInfo.prototype.update = function (
    nowtime,
    x,
    y,
    width,
    height,
    pressure
  ) {
    this.lasttime = this.time;
    this.time = nowtime;

    this.lastx = this.x;
    this.lasty = this.y;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.pressure = pressure;

    if (
      !this.tooFarForHold &&
      cr.distanceTo(this.startx, this.starty, this.x, this.y) >=
        GESTURE_HOLD_THRESHOLD
    ) {
      this.tooFarForHold = true;
    }
  };

  var lastTapX = -1000;
  var lastTapY = -1000;
  var lastTapTime = -10000;

  TouchInfo.prototype.maybeTriggerTap = function (inst, index) {
    if (this.triggeredHold) return;

    var nowtime = cr.performance_now();

    // Must also come within the hold threshold
    if (
      nowtime - this.starttime <= GESTURE_TAP_TIMEOUT &&
      !this.tooFarForHold &&
      cr.distanceTo(this.startx, this.starty, this.x, this.y) <
        GESTURE_HOLD_THRESHOLD
    ) {
      inst.trigger_index = this.startindex;
      inst.trigger_id = this["id"];
      inst.getTouchIndex = index;

      // Is within the distance and time of last tap: trigger a double tap
      if (
        nowtime - lastTapTime <= GESTURE_TAP_TIMEOUT * 2 &&
        cr.distanceTo(lastTapX, lastTapY, this.x, this.y) <
          GESTURE_DOUBLETAP_THRESHOLD
      ) {
        inst.curTouchX = this.x;
        inst.curTouchY = this.y;

        lastTapX = -1000;
        lastTapY = -1000;
        lastTapTime = -10000;
      }
      // Otherwise trigger single tap
      else {
        inst.curTouchX = this.x;
        inst.curTouchY = this.y;

        lastTapX = this.x;
        lastTapY = this.y;
        lastTapTime = nowtime;
      }

      inst.getTouchIndex = 0;
    }
  };

  instanceProto.onCreate = function () {
    theInstance = this;
    this.isWindows8 = !!(
      typeof window["c2isWindows8"] !== "undefined" && window["c2isWindows8"]
    );

    this.curTouchX = 0;
    this.curTouchY = 0;

    this.trigger_index = 0;
    this.trigger_id = 0;

    // For returning correct position for TouchX and TouchY expressions in a trigger
    this.getTouchIndex = 0;

    //this.useMouseInput = (this.properties[0] !== 0);
    this.useMouseInput = true;

    // Use document touch input for PhoneGap or fullscreen mode
    var elem =
      this.runtime.fullscreen_mode > 0 ? document : this.runtime.canvas;

    // Use elem2 to attach the up and cancel events to document, since we want to know about
    // these even if they happen off the main canvas.
    var elem2 = document;

    if (this.runtime.isDirectCanvas) elem2 = elem = window["Canvas"];
    else if (this.runtime.isCocoonJs) elem2 = elem = window;

    var self = this;

    if (typeof PointerEvent !== "undefined") {
      elem.addEventListener(
        "pointerdown",
        function (info) {
          self.onPointerStart(info);
        },
        false
      );

      elem.addEventListener(
        "pointermove",
        function (info) {
          self.onPointerMove(info);
        },
        false
      );

      // Always attach up/cancel events to document (note elem2),
      // otherwise touches dragged off the canvas could get lost
      elem2.addEventListener(
        "pointerup",
        function (info) {
          self.onPointerEnd(info, false);
        },
        false
      );

      // Treat pointer cancellation the same as a touch end
      elem2.addEventListener(
        "pointercancel",
        function (info) {
          self.onPointerEnd(info, true);
        },
        false
      );

      if (this.runtime.canvas) {
        this.runtime.canvas.addEventListener(
          "MSGestureHold",
          function (e) {
            e.preventDefault();
          },
          false
        );
        document.addEventListener(
          "MSGestureHold",
          function (e) {
            e.preventDefault();
          },
          false
        );
        this.runtime.canvas.addEventListener(
          "gesturehold",
          function (e) {
            e.preventDefault();
          },
          false
        );
        document.addEventListener(
          "gesturehold",
          function (e) {
            e.preventDefault();
          },
          false
        );
      }
    }
    // IE10-style MS prefixed pointer events
    else if (window.navigator["msPointerEnabled"]) {
      elem.addEventListener(
        "MSPointerDown",
        function (info) {
          self.onPointerStart(info);
        },
        false
      );

      elem.addEventListener(
        "MSPointerMove",
        function (info) {
          self.onPointerMove(info);
        },
        false
      );

      // Always attach up/cancel events to document (note elem2),
      // otherwise touches dragged off the canvas could get lost
      elem2.addEventListener(
        "MSPointerUp",
        function (info) {
          self.onPointerEnd(info, false);
        },
        false
      );

      // Treat pointer cancellation the same as a touch end
      elem2.addEventListener(
        "MSPointerCancel",
        function (info) {
          self.onPointerEnd(info, true);
        },
        false
      );

      if (this.runtime.canvas) {
        this.runtime.canvas.addEventListener(
          "MSGestureHold",
          function (e) {
            e.preventDefault();
          },
          false
        );
        document.addEventListener(
          "MSGestureHold",
          function (e) {
            e.preventDefault();
          },
          false
        );
      }
    }
    // otherwise old style touch events
    else {
      elem.addEventListener(
        "touchstart",
        function (info) {
          self.onTouchStart(info);
        },
        false
      );

      elem.addEventListener(
        "touchmove",
        function (info) {
          self.onTouchMove(info);
        },
        false
      );

      // Always attach up/cancel events to document (note elem2),
      // otherwise touches dragged off the canvas could get lost
      elem2.addEventListener(
        "touchend",
        function (info) {
          self.onTouchEnd(info, false);
        },
        false
      );

      // Treat touch cancellation the same as a touch end
      elem2.addEventListener(
        "touchcancel",
        function (info) {
          self.onTouchEnd(info, true);
        },
        false
      );
    }

    if (this.useMouseInput && !this.runtime.isDomFree) {
      jQuery(document).mousemove(function (info) {
        self.onMouseMove(info);
      });

      jQuery(document).mousedown(function (info) {
        self.onMouseDown(info);
      });

      jQuery(document).mouseup(function (info) {
        self.onMouseUp(info);
      });
    }

    //aekiro
    if (!this.runtime.isDomFree) {
      var wheelevent = function (info) {
        self.onWheel(info);
      };

      document.addEventListener("mousewheel", wheelevent, false);
      document.addEventListener("DOMMouseScroll", wheelevent, false);
    }
    //***********************************************************

    this.runtime.tick2Me(this);

    this.enable = true;
    this.lastTouchX = null;
    this.lastTouchY = null;
    //************************************************************
    cr.proui = this;

    this.cssURL = this.properties[0];
    this.fontFamily = this.properties[1];
    this.defaultSoundTag = this.properties[2];
    this.useHowler = this.properties[3] === 0;
    this.firstFrame = true;

    //************************************************************
    //https://www.scirra.com/forum/is-it-possible-to-destroy-other-instances-under-quot-ondestroy-quot_t125600
    /*The following is to get around not being able to destroy other instance in onDestroy of an instance, 
		cf onDestroy of radiogroup
		*/
    var runtime = this.runtime;
    this.toBeDestroyed = [];
    //************************************************************
    this.currentDialogs = [];
    this.currentDialogs_lastResetTick = 0;
    //************************************************************
    this.tags = {};
    this.tags_lastResetTick = 0;
    //************************************************************
    this.scrollViews = {};
    //************************************************************
    this.iter = 0;
    this.notRegister = false;
    //************************************************************
    this.areInputsActive = true;
  };

  //**********ADDITIONS*************************************************************
  instanceProto.getIter = function () {
    this.iter++;
    return this.iter;
  };

  instanceProto.setNoRegister = function () {};

  instanceProto.addTag = function (tag, inst) {
    if (!this.runtime.extra) {
      this.runtime.extra = {};
    }

    if (this.runtime.extra.notRegister || !tag) {
      return;
    }

    /*if(this.runtime.changelayout && this.tags_lastResetTick != this.runtime.tickcount){
			this.tags = {} ;
			this.tags_lastResetTick = this.runtime.tickcount;
		}*/

    if (this.tags.hasOwnProperty(tag)) {
      console.error("PROUI: Tag %s already exist !", tag);
      return;
    }

    this.tags[tag] = inst;
  };

  instanceProto.removeTag = function (tag) {
    delete this.tags[tag];
  };

  instanceProto.addDialog = function (behavior) {
    if (
      this.runtime.changelayout &&
      this.currentDialogs_lastResetTick != this.runtime.tickcount
    ) {
      //console.log("*** Reseting currentDialogs***");
      this.currentDialogs.length = 0;
      this.currentDialogs_lastResetTick = this.runtime.tickcount;
    }
    this.currentDialogs.push(behavior);
  };

  instanceProto.isModalDialogOpened = function () {
    for (var i = 0; i < this.currentDialogs.length; i++) {
      if (this.currentDialogs[i].isModal) {
        return true;
      }
    }
    return false;
  };

  instanceProto.removeDialog = function (behavior) {
    this.removeFromArray(this.currentDialogs, behavior);
  };

  instanceProto.removeFromArray = function (array, e) {
    for (var i = 0, l = array.length; i < l; i++) {
      if (array[i] == e) {
        array.splice(i, 1);
        return;
      }
    }
  };

  instanceProto.clearDestroyList = function () {
    //console.log(this.runtime.running_layout.name);
    var toBeDestroyed = this.toBeDestroyed;
    for (var i = 0, l = toBeDestroyed.length; i < l; i++) {
      this.runtime.DestroyInstance(toBeDestroyed[i]);
    }
    toBeDestroyed.length = 0;
  };

  instanceProto.playAudio = function (fileName) {
    if (this.useHowler) {
      this.getDependency(cr.plugins_.skymenhowlerjs, "howler");
      if (this["howler"]) {
        cr.plugins_.skymenhowlerjs.prototype.acts.PlayByName.call(
          this["howler"],
          fileName,
          this.defaultSoundTag
        );
      } else {
        console.error("ProUI: Please add the Howler plugin to the project.");
      }
    } else {
      this.getDependency(cr.plugins_.Audio, "audio");
      if (this["audio"]) {
        var ret = {
          val: 0,
          set_float(val) {
            ret.val = val;
          },
        };
        cr.plugins_.Audio.prototype.exps.Volume.call(
          this["audio"],
          ret,
          this.defaultSoundTag
        );
        var volume = ret.val;
        cr.plugins_.Audio.prototype.acts.PlayByName.call(
          this["audio"],
          0,
          fileName,
          0,
          volume,
          this.defaultSoundTag
        );
      } else {
        console.error("ProUI: Please add the Audio plugin to the project.");
      }
    }
  };

  instanceProto.getDependency = function (dependency, dependencyRef) {
    if (this[dependencyRef] != null) {
      return this[dependencyRef];
    }

    if (!dependency) {
      console.error("ProUI: Can not find the " + dependencyRef + " object.");
      return;
    }

    var plugins = this.runtime.types;
    var name, inst;
    for (name in plugins) {
      inst = plugins[name].instances[0];
      if (inst instanceof dependency.prototype.Instance) {
        this[dependencyRef] = inst;
        //console.log("%cPROUI: %s found.","color:green",dependencyRef);
        return this[dependencyRef];
      }
    }

    if (!this[dependencyRef]) {
      console.error("ProUI: Can not find " + dependencyRef + " object.");
    }
  };

  instanceProto.isTypeValid = function (inst, types, errorMsg) {
    var test;
    for (var i = 0, l = types.length; i < l; i++) {
      test = types[i] ? inst.type.plugin instanceof types[i] : false;
      if (test) {
        return;
      }
    }

    throw new Error(errorMsg);
  };

  /*behinstProto.runCallback = function ()
	{
		if(this.callbackName == ""){
			return;
		}

		var params = this.callbackParams.split(",");
		if(this.callbackName[0]=="$"){ //$41$transitionToLayout
			var callback = this.callbackName.split("$");
			console.log(callback);
			var inst = this.runtime.getObjectByUID(parseInt(callback[1]));
			if(inst){
				//inst.type.behavior.acts[callback[2]].call(inst,params);
				console.log(inst.type);
			}
			
		}else{
			c2_callFunction(this.callbackName,params);
		}
	};*/

  instanceProto.runCallback = function (callbackName, callbackParams) {
    if (callbackName == "") {
      return;
    }
    var params = callbackParams.split(",");

    var callFunction = window["c2_callFunction"];
    if (callFunction) {
      callFunction(callbackName, params);
    } else {
      console.error("ProUI : Please add the Function plugin to the project.");
    }
  };

  instanceProto.validateSimpleValue = function (value, default_value) {
    var o;
    if (value === true) {
      o = 1;
    } else if (value === false) {
      o = 0;
    } else if (
      value == null ||
      value == undefined ||
      typeof value == "object"
    ) {
      if (default_value != null && default_value != undefined)
        o = default_value;
      else o = 0;
    } else {
      o = value;
    }
    return o;
  };

  instanceProto.HookMe = function (obj, types) {
    var type;
    for (var i = 0, l = types.length; i < l; i++) {
      type = types[i];
      this._callbackObjs[type].push(obj);
    }
  };

  //???
  instanceProto.UnHookMe = function (obj, types) {
    var type;
    for (var i = 0, l = types.length; i < l; i++) {
      type = types[i];
      cr.arrayFindRemove(this._callbackObjs[type], obj);
    }
  };

  function getThisBehavior(inst, behaviorProto) {
    var i, len;
    for (i = 0, len = inst.behavior_insts.length; i < len; i++) {
      if (inst.behavior_insts[i] instanceof behaviorProto.Instance)
        return inst.behavior_insts[i];
    }

    return null;
  }

  /*var dispatchTouchStart = function(touchX, touchY)
	{
		//get all instances that have this behavior
		var instances = this.my_instances.valuesRef();   

		//pick the one that has been touched
		var instance;
		var lx, ly;
		var objectInstances = [];
		for (var i=0,l=instances.length; i<l; i++ )
		{
			instance = instances[i];
			if (!instance)
				continue;

			if(!instance.layer.visible || !instance.visible)
				continue;

			lx = instance.layer.canvasToLayer(touchX, touchY, true);
			ly = instance.layer.canvasToLayer(touchX, touchY, false);
			instance.update_bbox();
			if (instance.contains_pt(lx, ly))
				objectInstances.push(instance);
		}
		
		if (objectInstances.length == 0)
			return;

		//pick the max z-order inst // Is it really usefull to only pick the top object ??
		var maxZInstance = objectInstances[0];
		for (var i=1,l=objectInstances.length; i<l; i++)
		{
			if ( ( objectInstances[i].layer.index > maxZInstance.layer.index) || ( (objectInstances[i].layer.index == maxZInstance.layer.index) && (objectInstances[i].get_zindex() > maxZInstance.get_zindex()) ) )               
			{
				maxZInstance = objectInstances[i];
			} 
		}

		var maxZInstanceBehavior = getThisBehavior(maxZInstance,this);
		if(maxZInstanceBehavior.OnTouchStart){
			maxZInstanceBehavior.OnTouchStart();	
		}
		
		objectInstances.length = 0;
	};*/

  //Without picking the top z
  var dispatchTouchStart = function (touchX, touchY) {
    //get all instances that have this behavior
    var instances = this.my_instances.valuesRef();

    //pick the one that has been touched
    var instance;
    var instanceBehavior;
    var lx, ly;
    for (var i = 0, l = instances.length; i < l; i++) {
      instance = instances[i];
      if (!instance) continue;

      if (!instance.layer.visible || !instance.visible) continue;

      lx = instance.layer.canvasToLayer(touchX, touchY, true);
      ly = instance.layer.canvasToLayer(touchX, touchY, false);

      instance.update_bbox();
      instanceBehavior = getThisBehavior(instance, this);

      if (instanceBehavior.OnAnyTouchStart) {
        instanceBehavior.OnAnyTouchStart();
      }

      if (instance.contains_pt(lx, ly)) {
        if (instanceBehavior.OnTouchStart) {
          instanceBehavior.OnTouchStart(lx, ly);
        }
      }
    }
  };

  //Without picking the top z
  var dispatchTouchMove = function (touchX, touchY) {
    //get all instances that have this behavior
    var instances = this.my_instances.valuesRef();

    //pick the one that has been touched
    var instance;
    var instanceBehavior;
    var lx, ly;
    for (var i = 0, l = instances.length; i < l; i++) {
      instance = instances[i];
      if (!instance) continue;

      if (!instance.layer.visible || !instance.visible) continue;

      lx = instance.layer.canvasToLayer(touchX, touchY, true);
      ly = instance.layer.canvasToLayer(touchX, touchY, false);

      instance.update_bbox();
      instanceBehavior = getThisBehavior(instance, this);

      /*if(instanceBehavior.OnAnyTouchStart){
				instanceBehavior.OnAnyTouchStart();
			}*/

      if (instance.contains_pt(lx, ly)) {
        if (instanceBehavior.OnTouchMove) {
          instanceBehavior.OnTouchMove(lx, ly);
        }
      }
    }
  };

  var dispatchTouchEnd = function (touchX, touchY) {
    //get all instances that have this behavior
    var instances = this.my_instances.valuesRef();
    var instance;
    var instanceBehavior;
    var tx, ty;

    for (var i = 0, l = instances.length; i < l; i++) {
      instance = instances[i];
      if (!instance) continue;

      /*if(!instance.layer.visible || !instance.visible)
				continue;*/

      tx = instance.layer.canvasToLayer(touchX, touchY, true);
      ty = instance.layer.canvasToLayer(touchX, touchY, false);
      instanceBehavior = getThisBehavior(instance, this);
      if (instanceBehavior.OnAnyTouchEnd) {
        instanceBehavior.OnAnyTouchEnd(tx, ty);
      }
    }
  };

  var dispatchWheel = function (triggerDir) {
    //get all instances that have this behavior
    var instances = this.my_instances.valuesRef();
    var instance;
    var instanceBehavior;

    for (var i = 0, l = instances.length; i < l; i++) {
      instance = instances[i];
      if (!instance) continue;

      instanceBehavior = getThisBehavior(instance, this);
      if (instanceBehavior.OnWheel) {
        instanceBehavior.OnWheel(triggerDir);
      }
    }
  };

  instanceProto.onWheel = function (info) {
    var delta = info.wheelDelta
      ? info.wheelDelta
      : info.detail
      ? -info.detail
      : 0;

    this.triggerDir = delta < 0 ? 0 : 1;
    this.handled = false;

    this.runtime.isInUserInputEvent = true;

    //*****************************

    for (var i = 0, l = this._callbackObjs["wheel"].length; i < l; i++) {
      this.handled = true;
      dispatchWheel.call(this._callbackObjs["wheel"][i], this.triggerDir);
    }
    //*****************************

    this.runtime.isInUserInputEvent = false;

    if (this.handled && cr.isCanvasInputEvent(info)) info.preventDefault();
  };

  //***********************************************************************
  instanceProto.onPointerMove = function (info) {
    if (!this.enable) return;

    // Ignore mouse events (note check for both IE10 and IE11 style pointerType values)
    if (
      info["pointerType"] === info["MSPOINTER_TYPE_MOUSE"] ||
      info["pointerType"] === "mouse"
    )
      return;

    if (info.preventDefault) info.preventDefault();

    var i = this.findTouch(info["pointerId"]);
    var nowtime = cr.performance_now();
    if (i >= 0) {
      var offset = this.runtime.isDomFree
        ? dummyoffset
        : jQuery(this.runtime.canvas).offset();
      var t = this.touches[i];

      // Ignore events <2ms after the last event - seems events sometimes double-fire
      // very close which throws off speed measurements
      if (nowtime - t.time < 2) return;

      t.update(
        nowtime,
        info.pageX - offset.left,
        info.pageY - offset.top,
        info.width || 0,
        info.height || 0,
        info.pressure || 0
      );

      var touchx = info.pageX - offset.left;
      var touchy = info.pageY - offset.top;

      var cnt = this._callbackObjs["touch"].length,
        hooki;
      for (hooki = 0; hooki < cnt; hooki++) {
        dispatchTouchMove.call(
          this._callbackObjs["touch"][hooki],
          touchx,
          touchy
        );
      }
    }
  };

  instanceProto.onPointerStart = function (info) {
    if (!this.enable) return;

    // Ignore mouse events (note check for both IE10 and IE11 style pointerType values)
    if (
      info["pointerType"] === info["MSPOINTER_TYPE_MOUSE"] ||
      info["pointerType"] === "mouse"
    )
      return;

    if (info.preventDefault && cr.isCanvasInputEvent(info))
      info.preventDefault();

    var offset = this.runtime.isDomFree
      ? dummyoffset
      : jQuery(this.runtime.canvas).offset();
    var touchx = info.pageX - offset.left;
    var touchy = info.pageY - offset.top;
    var nowtime = cr.performance_now();

    this.trigger_index = this.touches.length;
    this.trigger_id = info["pointerId"];

    this.touches.push(
      AllocTouchInfo(touchx, touchy, info["pointerId"], this.trigger_index)
    );

    this.runtime.isInUserInputEvent = true;

    // Trigger OnTouchObject for each touch started event
    this.curTouchX = touchx;
    this.curTouchY = touchy;

    //************************************
    var hooki,
      cnt = this._callbackObjs["touch"].length;
    for (hooki = 0; hooki < cnt; hooki++) {
      dispatchTouchStart.call(
        this._callbackObjs["touch"][hooki],
        this.curTouchX,
        this.curTouchY
      );
    }
    //************************************

    this.runtime.isInUserInputEvent = false;
  };

  instanceProto.onPointerEnd = function (info, isCancel) {
    if (!this.enable) return;

    // Ignore mouse events (note check for both IE10 and IE11 style pointerType values)
    if (
      info["pointerType"] === info["MSPOINTER_TYPE_MOUSE"] ||
      info["pointerType"] === "mouse"
    )
      return;

    if (info.preventDefault && cr.isCanvasInputEvent(info))
      info.preventDefault();

    var i = this.findTouch(info["pointerId"]);
    this.trigger_index = i >= 0 ? this.touches[i].startindex : -1;
    this.trigger_id = i >= 0 ? this.touches[i]["id"] : -1;

    this.runtime.isInUserInputEvent = true;

    if (i >= 0) {
      this.lastTouchX = this.touches[i].x;
      this.lastTouchY = this.touches[i].y;
    }

    //**********************
    var cnt = this._callbackObjs["touch"].length,
      hooki;
    for (hooki = 0; hooki < cnt; hooki++) {
      dispatchTouchEnd.call(
        this._callbackObjs["touch"][hooki],
        this.lastTouchX,
        this.lastTouchY
      );
    }
    //**********************

    // Remove touch
    if (i >= 0) {
      if (!isCancel) this.touches[i].maybeTriggerTap(this, i);

      ReleaseTouchInfo(this.touches[i]);
      this.touches.splice(i, 1);
    }

    this.runtime.isInUserInputEvent = false;
  };

  instanceProto.onTouchMove = function (info) {
    if (!this.enable) return;

    if (info.preventDefault) info.preventDefault();

    var nowtime = cr.performance_now();

    var i, len, t, u;
    var cnt = this._callbackObjs["touch"].length,
      hooki;
    for (i = 0, len = info.changedTouches.length; i < len; i++) {
      t = info.changedTouches[i];

      var j = this.findTouch(t["identifier"]);

      if (j >= 0) {
        var offset = this.runtime.isDomFree
          ? dummyoffset
          : jQuery(this.runtime.canvas).offset();
        u = this.touches[j];

        // Ignore events <2ms after the last event - seems events sometimes double-fire
        // very close which throws off speed measurements
        if (nowtime - u.time < 2) continue;

        var touchWidth =
          (t.radiusX || t.webkitRadiusX || t.mozRadiusX || t.msRadiusX || 0) *
          2;
        var touchHeight =
          (t.radiusY || t.webkitRadiusY || t.mozRadiusY || t.msRadiusY || 0) *
          2;
        var touchForce =
          t.force || t.webkitForce || t.mozForce || t.msForce || 0;
        u.update(
          nowtime,
          t.pageX - offset.left,
          t.pageY - offset.top,
          touchWidth,
          touchHeight,
          touchForce
        );

        var touchx = t.pageX - offset.left;
        var touchy = t.pageY - offset.top;

        for (hooki = 0; hooki < cnt; hooki++) {
          dispatchTouchMove.call(
            this._callbackObjs["touch"][hooki],
            touchx,
            touchy
          );
        }
      }
    }
  };

  instanceProto.onTouchStart = function (info) {
    if (!this.enable) return;

    if (info.preventDefault && cr.isCanvasInputEvent(info))
      info.preventDefault();

    var offset = this.runtime.isDomFree
      ? dummyoffset
      : jQuery(this.runtime.canvas).offset();
    var nowtime = cr.performance_now();

    this.runtime.isInUserInputEvent = true;

    var i, len, t, j;
    var cnt = this._callbackObjs["touch"].length,
      hooki;
    for (i = 0, len = info.changedTouches.length; i < len; i++) {
      t = info.changedTouches[i];

      // WORKAROUND Chrome for Android bug: touchstart sometimes fires twice with same id.
      // If there is already a touch with this id, ignore this event.
      j = this.findTouch(t["identifier"]);

      if (j !== -1) continue;
      // END WORKAROUND

      var touchx = t.pageX - offset.left;
      var touchy = t.pageY - offset.top;

      this.trigger_index = this.touches.length;
      this.trigger_id = t["identifier"];

      this.touches.push(
        AllocTouchInfo(touchx, touchy, t["identifier"], this.trigger_index)
      );

      // Trigger OnTouchObject for each touch started event
      for (hooki = 0; hooki < cnt; hooki++) {
        //console.log("TOUCH START ZZZZZZZZZZZZZ");
        dispatchTouchStart.call(
          this._callbackObjs["touch"][hooki],
          touchx,
          touchy
        );
      }
    }
    this.runtime.isInUserInputEvent = false;
  };

  instanceProto.onTouchEnd = function (info, isCancel) {
    if (!this.enable) return;

    if (info.preventDefault && cr.isCanvasInputEvent(info))
      info.preventDefault();

    this.runtime.isInUserInputEvent = true;

    var i, len, t, j;
    var cnt = this._callbackObjs["touch"].length,
      hooki;
    for (i = 0, len = info.changedTouches.length; i < len; i++) {
      t = info.changedTouches[i];
      j = this.findTouch(t["identifier"]);

      // Remove touch
      if (j >= 0) {
        // Trigger OnNthTouchEnd & OnTouchEnd
        // NOTE: Android stock browser is total garbage and fires touchend twice
        // when a single touch ends. So we only fire these events when we found the
        // touch identifier exists.
        this.trigger_index = this.touches[j].startindex;
        this.trigger_id = this.touches[j]["id"];

        this.lastTouchX = this.touches[j].x;
        this.lastTouchY = this.touches[j].y;

        for (hooki = 0; hooki < cnt; hooki++) {
          dispatchTouchEnd.call(
            this._callbackObjs["touch"][hooki],
            this.lastTouchX,
            this.lastTouchY
          );
        }

        if (!isCancel) this.touches[j].maybeTriggerTap(this, j);

        ReleaseTouchInfo(this.touches[j]);
        this.touches.splice(j, 1);
      }
    }

    this.runtime.isInUserInputEvent = false;
  };

  instanceProto.updateCursor = function (info) {
    var offset = this.runtime.isDomFree
      ? dummyoffset
      : jQuery(this.runtime.canvas).offset();

    this.cursor.x = info.pageX - offset.left;
    this.cursor.y = info.pageY - offset.top;
  };

  instanceProto.onMouseDown = function (info) {
    if (!this.enable) return;

    this.updateCursor(info);

    this.mouseDown = true;
    if (
      info.preventDefault &&
      this.runtime.had_a_click &&
      !this.runtime.isMobile
    )
      info.preventDefault();

    var index = this.findTouch(0);
    if (index !== -1) {
      ReleaseTouchInfo(this.touches[index]);
      cr.arrayRemove(this.touches, index);
    }

    // Send a fake touch start event
    var t = { pageX: info.pageX, pageY: info.pageY, identifier: 0 };
    var fakeinfo = { changedTouches: [t] };
    this.onTouchStart(fakeinfo);
  };

  instanceProto.onMouseMove = function (info) {
    if (!this.enable) return;

    this.updateCursor(info);

    if (!this.mouseDown) return;

    // Send a fake touch move event
    var t = { pageX: info.pageX, pageY: info.pageY, identifier: 0 };
    var fakeinfo = { changedTouches: [t] };
    this.onTouchMove(fakeinfo);
  };

  instanceProto.onMouseUp = function (info) {
    if (!this.enable) return;

    this.updateCursor(info);

    this.mouseDown = false;
    if (
      info.preventDefault &&
      this.runtime.had_a_click &&
      !this.runtime.isMobile
    )
      info.preventDefault();

    this.runtime.had_a_click = true;

    // Send a fake touch end event
    var t = { pageX: info.pageX, pageY: info.pageY, identifier: 0 };
    var fakeinfo = { changedTouches: [t] };
    this.onTouchEnd(fakeinfo);
  };

  instanceProto.tick2 = function () {
    if (!this.enable) return;

    var i, len, t;
    var nowtime = cr.performance_now();

    for (i = 0, len = this.touches.length; i < len; ++i) {
      // Update speed for touches which haven't moved for 50ms
      t = this.touches[i];

      if (t.time <= nowtime - 50) t.lasttime = nowtime;
    }

    this.lastTouchX = null;
    this.lastTouchY = null;

    /*if(this.firstFrame){
			this.firstFrame = false;
			//we get the audio here and not in onCreate because audio might be instanciated after proui
			

		}*/
  };

  /**BEGIN-PREVIEWONLY**/
  instanceProto.getDebuggerValues = function (propsections) {
    /*var props = [], i, len, t, val;
		
		for (i = 0, len = this.touches.length; i < len; ++i)
		{
			t = this.touches[i];
			val = "(" + t.x + ", " + t.y + "), ID: " + t["id"];
			props.push({"name": i.toString(), "value": val, "readonly": true});
		}
		
		propsections.push({
			"title": "Touches",
			"properties": props
		});*/
    var currentDialogsUIDs = [];
    for (var i = 0, l = this.currentDialogs.length; i < l; i++) {
      currentDialogsUIDs.push(this.currentDialogs[i].inst.uid);
    }
    var dialogs_str = JSON.stringify(currentDialogsUIDs, null, "\t");

    //************************
    var tags = [];
    Object.keys(this.tags).forEach(function (key) {
      tags.push(key);
    });
    var tags_str = JSON.stringify(tags, null, "\t");

    propsections.push({
      title: "ProUI",
      properties: [
        {
          name: "dialogs",
          value: dialogs_str,
          readonly: true,
        },
        {
          name: "tags",
          value: tags_str,
          readonly: true,
        },
      ],
    });
  };
  /**END-PREVIEWONLY**/

  //////////////////////////////////////
  // Conditions
  function Cnds() {}

  Cnds.prototype.IsDialogOpened = function () {
    return this.currentDialogs.length;
  };

  pluginProto.cnds = new Cnds();

  //////////////////////////////////////
  // Actions
  function Acts() {}
  pluginProto.acts = new Acts();

  Acts.prototype.SetInputEnabled = function (en) {
    this.enable = en == 1;
  };

  //////////////////////////////////////
  // Expressions
  function Exps() {}

  pluginProto.exps = new Exps();

  //////////////////////////////////////

  instanceProto.TouchCount = function (ret) {
    ret.set_int(this.touches.length);
  };

  instanceProto.X = function (layerparam) {
    var index = this.getTouchIndex;
    var result;

    if (index < 0 || index >= this.touches.length) {
      result = 0;
      return result;
    }

    var layer, oldScale, oldZoomRate, oldParallaxX, oldAngle;

    if (cr.is_undefined(layerparam)) {
      // calculate X position on bottom layer as if its scale were 1.0
      layer = this.runtime.getLayerByNumber(0);
      oldScale = layer.scale;
      oldZoomRate = layer.zoomRate;
      oldParallaxX = layer.parallaxX;
      oldAngle = layer.angle;
      layer.scale = 1;
      layer.zoomRate = 1.0;
      layer.parallaxX = 1.0;
      layer.angle = 0;
      result = layer.canvasToLayer(
        this.touches[index].x,
        this.touches[index].y,
        true
      );
      layer.scale = oldScale;
      layer.zoomRate = oldZoomRate;
      layer.parallaxX = oldParallaxX;
      layer.angle = oldAngle;
    } else {
      // use given layer param
      if (cr.is_number(layerparam))
        layer = this.runtime.getLayerByNumber(layerparam);
      else layer = this.runtime.getLayerByName(layerparam);

      if (layer)
        result = layer.canvasToLayer(
          this.touches[index].x,
          this.touches[index].y,
          true
        );
      else result = 0;
    }

    return result;
  };

  instanceProto.XAt = function (ret, index, layerparam) {
    index = Math.floor(index);

    if (index < 0 || index >= this.touches.length) {
      ret.set_float(0);
      return;
    }

    var layer, oldScale, oldZoomRate, oldParallaxX, oldAngle;

    if (cr.is_undefined(layerparam)) {
      // calculate X position on bottom layer as if its scale were 1.0
      layer = this.runtime.getLayerByNumber(0);
      oldScale = layer.scale;
      oldZoomRate = layer.zoomRate;
      oldParallaxX = layer.parallaxX;
      oldAngle = layer.angle;
      layer.scale = 1;
      layer.zoomRate = 1.0;
      layer.parallaxX = 1.0;
      layer.angle = 0;
      ret.set_float(
        layer.canvasToLayer(this.touches[index].x, this.touches[index].y, true)
      );
      layer.scale = oldScale;
      layer.zoomRate = oldZoomRate;
      layer.parallaxX = oldParallaxX;
      layer.angle = oldAngle;
    } else {
      // use given layer param
      if (cr.is_number(layerparam))
        layer = this.runtime.getLayerByNumber(layerparam);
      else layer = this.runtime.getLayerByName(layerparam);

      if (layer)
        ret.set_float(
          layer.canvasToLayer(
            this.touches[index].x,
            this.touches[index].y,
            true
          )
        );
      else ret.set_float(0);
    }
  };

  instanceProto.XForID = function (ret, id, layerparam) {
    var index = this.findTouch(id);

    if (index < 0) {
      ret.set_float(0);
      return;
    }

    var touch = this.touches[index];

    var layer, oldScale, oldZoomRate, oldParallaxX, oldAngle;

    if (cr.is_undefined(layerparam)) {
      // calculate X position on bottom layer as if its scale were 1.0
      layer = this.runtime.getLayerByNumber(0);
      oldScale = layer.scale;
      oldZoomRate = layer.zoomRate;
      oldParallaxX = layer.parallaxX;
      oldAngle = layer.angle;
      layer.scale = 1;
      layer.zoomRate = 1.0;
      layer.parallaxX = 1.0;
      layer.angle = 0;
      ret.set_float(layer.canvasToLayer(touch.x, touch.y, true));
      layer.scale = oldScale;
      layer.zoomRate = oldZoomRate;
      layer.parallaxX = oldParallaxX;
      layer.angle = oldAngle;
    } else {
      // use given layer param
      if (cr.is_number(layerparam))
        layer = this.runtime.getLayerByNumber(layerparam);
      else layer = this.runtime.getLayerByName(layerparam);

      if (layer) ret.set_float(layer.canvasToLayer(touch.x, touch.y, true));
      else ret.set_float(0);
    }
  };

  instanceProto.Y = function (layerparam) {
    var index = this.getTouchIndex;
    var result;

    if (index < 0 || index >= this.touches.length) {
      result = 0;
      return;
    }

    var layer, oldScale, oldZoomRate, oldParallaxY, oldAngle;

    if (cr.is_undefined(layerparam)) {
      // calculate X position on bottom layer as if its scale were 1.0
      layer = this.runtime.getLayerByNumber(0);
      oldScale = layer.scale;
      oldZoomRate = layer.zoomRate;
      oldParallaxY = layer.parallaxY;
      oldAngle = layer.angle;
      layer.scale = 1;
      layer.zoomRate = 1.0;
      layer.parallaxY = 1.0;
      layer.angle = 0;
      result = layer.canvasToLayer(
        this.touches[index].x,
        this.touches[index].y,
        false
      );
      layer.scale = oldScale;
      layer.zoomRate = oldZoomRate;
      layer.parallaxY = oldParallaxY;
      layer.angle = oldAngle;
    } else {
      // use given layer param
      if (cr.is_number(layerparam))
        layer = this.runtime.getLayerByNumber(layerparam);
      else layer = this.runtime.getLayerByName(layerparam);

      if (layer)
        result = layer.canvasToLayer(
          this.touches[index].x,
          this.touches[index].y,
          false
        );
      else result = 0;
    }

    return result;
  };

  instanceProto.YAt = function (ret, index, layerparam) {
    index = Math.floor(index);

    if (index < 0 || index >= this.touches.length) {
      ret.set_float(0);
      return;
    }

    var layer, oldScale, oldZoomRate, oldParallaxY, oldAngle;

    if (cr.is_undefined(layerparam)) {
      // calculate X position on bottom layer as if its scale were 1.0
      layer = this.runtime.getLayerByNumber(0);
      oldScale = layer.scale;
      oldZoomRate = layer.zoomRate;
      oldParallaxY = layer.parallaxY;
      oldAngle = layer.angle;
      layer.scale = 1;
      layer.zoomRate = 1.0;
      layer.parallaxY = 1.0;
      layer.angle = 0;
      ret.set_float(
        layer.canvasToLayer(this.touches[index].x, this.touches[index].y, false)
      );
      layer.scale = oldScale;
      layer.zoomRate = oldZoomRate;
      layer.parallaxY = oldParallaxY;
      layer.angle = oldAngle;
    } else {
      // use given layer param
      if (cr.is_number(layerparam))
        layer = this.runtime.getLayerByNumber(layerparam);
      else layer = this.runtime.getLayerByName(layerparam);

      if (layer)
        ret.set_float(
          layer.canvasToLayer(
            this.touches[index].x,
            this.touches[index].y,
            false
          )
        );
      else ret.set_float(0);
    }
  };

  instanceProto.YForID = function (ret, id, layerparam) {
    var index = this.findTouch(id);

    if (index < 0) {
      ret.set_float(0);
      return;
    }

    var touch = this.touches[index];

    var layer, oldScale, oldZoomRate, oldParallaxY, oldAngle;

    if (cr.is_undefined(layerparam)) {
      // calculate X position on bottom layer as if its scale were 1.0
      layer = this.runtime.getLayerByNumber(0);
      oldScale = layer.scale;
      oldZoomRate = layer.zoomRate;
      oldParallaxY = layer.parallaxY;
      oldAngle = layer.angle;
      layer.scale = 1;
      layer.zoomRate = 1.0;
      layer.parallaxY = 1.0;
      layer.angle = 0;
      ret.set_float(layer.canvasToLayer(touch.x, touch.y, false));
      layer.scale = oldScale;
      layer.zoomRate = oldZoomRate;
      layer.parallaxY = oldParallaxY;
      layer.angle = oldAngle;
    } else {
      // use given layer param
      if (cr.is_number(layerparam))
        layer = this.runtime.getLayerByNumber(layerparam);
      else layer = this.runtime.getLayerByName(layerparam);

      if (layer) ret.set_float(layer.canvasToLayer(touch.x, touch.y, false));
      else ret.set_float(0);
    }
  };

  instanceProto.AbsoluteX = function (ret) {
    if (this.touches.length) ret.set_float(this.touches[0].x);
    else ret.set_float(0);
  };

  instanceProto.AbsoluteXAt = function (ret, index) {
    index = Math.floor(index);

    if (index < 0 || index >= this.touches.length) {
      ret.set_float(0);
      return;
    }

    ret.set_float(this.touches[index].x);
  };

  instanceProto.AbsoluteXForID = function (ret, id) {
    var index = this.findTouch(id);

    if (index < 0) {
      ret.set_float(0);
      return;
    }

    var touch = this.touches[index];

    ret.set_float(touch.x);
  };

  instanceProto.AbsoluteY = function (ret) {
    if (this.touches.length) ret.set_float(this.touches[0].y);
    else ret.set_float(0);
  };

  instanceProto.AbsoluteYAt = function (ret, index) {
    index = Math.floor(index);

    if (index < 0 || index >= this.touches.length) {
      ret.set_float(0);
      return;
    }

    ret.set_float(this.touches[index].y);
  };

  instanceProto.AbsoluteYForID = function (ret, id) {
    var index = this.findTouch(id);

    if (index < 0) {
      ret.set_float(0);
      return;
    }

    var touch = this.touches[index];

    ret.set_float(touch.y);
  };

  // wrapper --------

  instanceProto.IsInTouch = function () {
    return this.touches.length > 0;
  };

  instanceProto.CursorX = function (layerparam) {
    if (this.cursor.x == null) return null;

    var x;
    var layer, oldScale, oldZoomRate, oldParallaxX, oldAngle;

    if (cr.is_undefined(layerparam)) {
      // calculate X position on bottom layer as if its scale were 1.0
      layer = this.runtime.getLayerByNumber(0);
      oldScale = layer.scale;
      oldZoomRate = layer.zoomRate;
      oldParallaxX = layer.parallaxX;
      oldAngle = layer.angle;
      layer.scale = 1;
      layer.zoomRate = 1.0;
      layer.parallaxX = 1.0;
      layer.angle = 0;
      x = layer.canvasToLayer(this.cursor.x, this.cursor.y, true);
      layer.scale = oldScale;
      layer.zoomRate = oldZoomRate;
      layer.parallaxX = oldParallaxX;
      layer.angle = oldAngle;
    } else {
      // use given layer param
      if (cr.is_number(layerparam))
        layer = this.runtime.getLayerByNumber(layerparam);
      else layer = this.runtime.getLayerByName(layerparam);

      if (layer) x = layer.canvasToLayer(this.cursor.x, this.cursor.y, true);
      else x = 0;
    }

    return x;
  };

  instanceProto.CursorY = function (layerparam) {
    if (this.cursor.y == null) return null;

    var y;
    var layer, oldScale, oldZoomRate, oldParallaxX, oldAngle;

    if (cr.is_undefined(layerparam)) {
      // calculate X position on bottom layer as if its scale were 1.0
      layer = this.runtime.getLayerByNumber(0);
      oldScale = layer.scale;
      oldZoomRate = layer.zoomRate;
      oldParallaxX = layer.parallaxX;
      oldAngle = layer.angle;
      layer.scale = 1;
      layer.zoomRate = 1.0;
      layer.parallaxX = 1.0;
      layer.angle = 0;
      y = layer.canvasToLayer(this.cursor.x, this.cursor.y, false);
      layer.scale = oldScale;
      layer.zoomRate = oldZoomRate;
      layer.parallaxX = oldParallaxX;
      layer.angle = oldAngle;
    } else {
      // use given layer param
      if (cr.is_number(layerparam))
        layer = this.runtime.getLayerByNumber(layerparam);
      else layer = this.runtime.getLayerByName(layerparam);

      if (layer) y = layer.canvasToLayer(this.cursor.x, this.cursor.y, false);
      else y = 0;
    }

    return y;
  };

  instanceProto.CursorAbsoluteX = function () {
    return this.cursor.x;
  };

  instanceProto.CursorAbsoluteY = function () {
    return this.cursor.y;
  };

  // wrapper --------
})();
