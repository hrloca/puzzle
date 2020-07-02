(function (win, doc, $) {

  // name space.
  var ROOT_NAME = 'root'; // root name.
  //var CATEGORY_NAME = 'acq'; // category name.

  var __root = win[ROOT_NAME] = win[ROOT_NAME] || {};
  //var __root = win[ROOT_NAME][CATEGORY_NAME] = {};

  // alias.
  var protoObj_= Object.prototype;
  var enc_ = encodeURIComponent;
  var __toString = protoObj_.toString;
  var $body = $('body');
  var $html = $('html');
  var $win = $(win);
  var $doc = $(doc);

  var __prop;

  __root.prop = function(prop) {
    __prop = prop || {};
  };


  __root.init = (function(prop) {
    var _constructor = function (obj) {
      var that = this;
      this.set(obj);
      this.prop = __prop;
      this.lib = __root.lib;
      this.fn = __root.fn;
      this.mod = __root.mod;
      this.elm = {
        $body: $body,
        $html: $html,
        $win: $win,
        $doc: $doc
      };

      $(win).ready(function () {
        that.init.call(that);
        that.controller.call(that);
      });
    };

    _constructor.prototype = {
      set: _set,
      now: _now
    };

    return _constructor;

    function _set(param) {
      for (var k in param) {
        this[k] = param[k];
      }
    }

    function _now() {
      var o = new Date();
      return this.fn.timeData(o);
    }

  })();



  /**
   * lib.
   * -------------------------------------------------- */
  var lib = __root.lib = (function () {

    return {
      ua: _ua(),
      isArray: _isArray,
      isObject: _isObject,
      isFunction: _isFunction,
      isString: _isString,
      isNumber: _isNumber,
      shuffle: _shuffle,
      copyObject: _copyObject,
      objectCreate: _objectCreate,
      parse: _parse,
      promise: _promise,
      getQuary: _getQuery,
      createQuery: _createQuery,
      cookie: _cookie(),
      cache: cache()
    };

    function _ua() {
      var reg = {
        IPHONE: /iphone/,
        IPAD: /ipad/,
        IPOD: /ipod/,
        IOS_VERSION: /(ipad|iphone|ipod)+\sos\s(\d+\_\d+)/g,
        ANDROID: /android/,
        ANDROID_VERSION: /android\s(\d+.\d+)/g,
        VERSION: /\d+\.\d+/
      };

      var nav = win.navigator;
      var ua = nav.userAgent.toLowerCase();

      var _uaObj = {
        Android: reg.ANDROID.test(ua) ? true : false,
        iPhone: reg.IPHONE.test(ua) ? true : false,
        iPad: reg.IPAD.test(ua) ? true : false,
        iPod: reg.IPOD.test(ua) ? true : false,
        iOS: false,
        OSVer: null
      };

      (_uaObj.iPhone || _uaObj.iPad || _uaObj.iPod) && (_uaObj.iOS = true);

      if (_uaObj.iOS) {
        _uaObj.OSVer = ua.match(reg.IOS_VERSION)[0];
        _uaObj.OSVer = _uaObj.OSVer.replace(/_/, '.').match(reg.VERSION)[0];
      } else if (_uaObj.Android) {
        _uaObj.OSVer = ua.match(reg.ANDROID_VERSION)[0];
        _uaObj.OSVer = _uaObj.OSVer.match(reg.VERSION)[0];
      }

      return _uaObj;
    }

    function _isArray(obj) { return __toString.call(obj) === '[object Array]'; }
    function _isObject(obj) { return obj === Object(obj); }
    function _isFunction(obj) { return __toString.call(obj) === '[object Function]'; }
    function _isString(obj) { return __toString.call(obj) === '[object String]'; }
    function _isNumber(obj) { return __toString.call(obj) === '[object Number]'; }

    function _objectCreate(obj) {
      if(typeof Object.create !== 'function') {
        var f = function() {};
        f.prototype = obj;
        return new f();
      }else {
        return Object.create(obj);
      }
    }

    function _copyObject(obj, arg) {
      if (!obj) { obj = {}; }
      for (var k in arg) {
        obj.hasOwnProperty(k) || (obj[k] = arg[k]);
      }
      return obj;
    }

    function _shuffle(arr) {
      var i = arr.length;
      while(i){
        var j = Math.floor(Math.random() * i),
          t = arr[--i];
        arr[i] = arr[j];
        arr[j] = t;
      }
      return arr;
    }

    function _parse(args) {
      var obj;
      try {
        obj = JSON.parse(args);
      } catch(e) {
        obj = (new Function("return " + args))();
      } finally {
        return obj;
      }
    }

    function _getQuery() {
      var q = win.location.search.substring(1),
          p = q.split('&'),
          len = p.length,
          key, val, pool,
          query = {};
      for (; len--;) {
        pool = p[len].indexOf('=');
        if (pool > 0) {
          key = p[len].substring(0, pool);
          val = p[len].substring(pool + 1);
          query[key] = val;
        }
      }

      return query;
    }

    function _createQuery(query) {
      if (!query) { return; }
      var q = [],
            k;
      for (k in query) {
        query[k] && (q[q.length] = enc_(k) + '=' + enc_(query[k]));
      }
      return q.join('&');
    }

    function cache() {

      var sign_ = '_';
      var storage_ = __hasStorage() ?  win.localStorage : null;

      var _constructor = function(prefix) {
        prefix || _error('識別名は必須です。');
        this.prefix = prefix;
        this.storage = storage_;
      };


      // super class methods.
      _constructor.show = __show;
      _constructor.get = __get;
      _constructor.clear = __clear;
      _constructor.hasStorage = __hasStorage;


      // instance member.
      _constructor.prototype = {
        set: _set,
        get: _get,
        del: _del
      };

      return _constructor;


      /* methods
       * -------------------------------------------------- */

      function _set(key, val, prefix) {
        var _key;
        prefix = prefix ? prefix : this.prefix;
        val = JSON.stringify(val);
        _key = _getName(prefix, key);
        this.storage.setItem(_key, val);
        return key;
      }


      function _get(key, prefix) {
        prefix = prefix ? prefix : this.prefix;
        key = _getName(prefix, key);
        return lib.parse(this.storage.getItem(key));
      }


      function _del(key) {
        this.storage.removeItem(key);
      }


      function _error(info) {
        throw new Error(NAME_SPACE + ':' + info);
      }


      // --------------------------------------------------

      function __hasStorage() {
        try {
          win.localStorage.setItem('hasStorage', '1');
          win.localStorage.removeItem('hasStorage');
          return true;
        } catch(e) {
          return false;
        }
      }


      function __clear() {
        storage_.clear();
      }


      function __get(key) {
        var val = JSON.parse(storage_.getItem(key));
        return val;
      }


      // debug
      function __show() {
        var i, k;
        var len = storage_.length;
        if (!len) {
          console.log('no data.');
        }
        for (i = 0; i < storage_.length; i++) {
          k = storage_.key(i);
          console.log('key: ' + k + '\nval: ' + storage_.getItem(k));
        }
      }

      // --------------------------------------------------

      function _getName(name, key) {
        var sign = sign_;
        name === '' && (sign = '');
        return name + sign + key;
      }


    }


    function _cookie() {

      return {
        set: _setCookie,
        get: _getCookie,
        delate: _delateCookie
      };

      function _setCookie(name, val, opt_) {
        if(!name || !val)  { return; }
        var cook = name + '=' + encodeURIComponent(val);

        if(_isObject(opt_)) {
          opt_.domain && (cook+='; domain=' + opt_.domain);
          opt_.path && (cook+='; path=' + opt_.path);
          opt_.expires && (cook+='; expires=' + opt_.expires);
        }
        doc.cookie = cook;
      }

      function _getCookie(key) {
        if (!doc.cookie){ return ''; }
        var c = doc.cookie,
          ns = c.indexOf(key + '='), ne;
        if (ns < 0) {
          return null;
        }
        ns = ns + key.length + 1;
        ne = c.indexOf(';', ns);
        (ne < 0) && (ne = c.length);
        return c.substring(ns, ne);
      }

      function _delateCookie(name) {
        var EX_DEL = /^\s+|\s+$/g;
        var time = (function() {
          var d = new Date();
          d.setYear(d.getFullYear() - 1);
          return d.toUTCString();
        })();

        if (doc.cookie !== '') {
          var vals = doc.cookie.split(';');
          var i = vals.length;
          var val, cook = '';
          for (; i--;) {
            val = vals[i].split('=')[0].replace(EX_DEL, '');
            if (val === name) {
              cook = val + '=' + ';expires=' + time + '; path=/;';
            }
          }
          doc.cookie = cook;
        }
      }
    }


    function _promise(when) {
        //private
        when || (when = 1);
        var PENDING = 0, RESOLVED = 1, REJECTED = 2;
        var _queue = {
          res: [],
          rej: []
        };
        var _state = PENDING;
        var _count = 0;

        return {
          resolve: resolve,
          reject: reject,
          done: done,
          fail: fail
        };

        function resolve() {
          if (_state === RESOLVED) { return; }
          _count++;

          if (_count === when) {
            _state = RESOLVED;
          } else {
            return;
          }
          var len = _queue.res.length, i;
          for (i = 0; i < len; ++i) {
            _queue.res[i]();
          }
          _queue.res = null;
        }

        function reject() {
          if (_state === REJECTED) { return; }
          _state = REJECTED;
          var len = _queue.rej.length, i;
          for (i = 0; i < len; ++i) {
            _queue.rej[i]();
          }
          _queue.rej = null;
        }

        function done(fn) {
          (_state === RESOLVED) ? fn() : _queue.res.push(fn);
          return this;
        }

        function fail(fn) {
          (_state === REJECTED) ? fn() : _queue.rej.push(fn);
          return this;
        }

    }

  })();



  /**
   * fn.
   * -------------------------------------------------- */
  var fn = __root.fn = (function () {

    return {
      getContntsSize: _getContntsSize,
      getWindowSize: _getWindowSize,
      getScrollPos: _getScrollPos,
      formatImageSize:_formatImageSize,
      timeData:_timeData,
      per:_per
    };

    function _getContntsSize() {
      var width = Math.max.apply(null, [$html.width(), $body.width()]);
      var height = Math.max.apply(null, [$html.height(), $body.height()]);
      return {
        width: width,
        height: height
      };
    }

    function _getWindowSize() {
      var width = win.innerWidth;
      var height = win.innerHeight;
      return {
        width: width,
        height: height
      };
    }

    function _getScrollPos() {
      return $win.scrollTop();
    }

    function _formatImageSize(w, h, size) {
      w = parseInt(w, 10);
      h = parseInt(h, 10);
      var aspect = w / h;
      var overFlg = size < w || size < h;
      var rate;

      if (overFlg) {
        if (aspect < 1) {
          rate = size / h;
          h = size;
          w = w * rate;
        } else if (aspect > 1) {
          rate = size / w;
          w = size;
          h = h * rate;
        } else {
          w = size;
          h = size;
        }
      }

      return {
        width: w,
        height: h
      };
    }

    function _timeData(date) {
      if (!date) {
        return null;
      }
      if (lib.isNumber(date) || lib.isString(date)) {
        date = new Date(date);
      }

      return {
        o: date,
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate(),
        hour: date.getHours(),
        min: date.getMinutes(),
        sec: date.getSeconds(),
        time:date.getTime()
      };
    }

    function _per() {
      return {
        day: function (time) {
          return time / 86400000;
        },
        hour: function (time) {
          return time / 3600000;
        },
        min: function (time) {
          return time / 60000;
        }
      };
    }

  })();




  /**
   * api.
   * -------------------------------------------------- */
  __root.api = (function() {

    var _constructor = function (parent, obj) {
      this.parent = parent;
      this.opt = obj;
      this.error = parent.error;
      this.data = {};
      this.reqId = {};
    };

    _constructor.prototype = {
      request: _request,
      getUrl: _getUrl,
      commonError: _commonError
    };

    return _constructor;


    /**
     * request method for ajax.
     * @type {function}
     * @param {object} op -> object for extension.
     * @param {number} key -> model name.
     */
    function _request(key, error) {
      var that = this;
      var _parent = that.parent;
      var promise = new lib.promise();
      if (!(key instanceof Array)) { key = [key]; }
      promise.resolve();

      return _then(key, promise);

      function _then(key, prevPromise) {
        if (!(key instanceof Array)) { key = [key]; }
        var keylength = key.length;
        var nextPromise = new lib.promise(keylength);

        prevPromise.done(function(data) {
          for (var i = 0; i < keylength; i++) { requestCore(key[i], nextPromise); }
        });

        nextPromise.fail(function() {
          _error(key);
        });

        function then(key) {
          return _then(key, nextPromise);
        }

        function init(fn) {
          fn();
          return this;
        }

        return {
          then: then,
            init: init,
            done: nextPromise.done,
            fail: nextPromise.fail
        };

      }

      function _error() {
        error && error();
      }

      function requestCore(key, promise) {

        var handler = that.opt[key];
        var url = that.getUrl(key);
        var elm;
        var timer;
        var node;
        var param = {
          type: handler.type || 'GET',
          url: url || '',
          dataType: handler.dataType || 'jsonp',
          cache: handler.cache || false,
          timeout: handler.timeout || _parent.prop.API_TIMEOUT,
          jsonpCallback: handler.callbackName || 'callback',
          success: function(data) {
            that.data[key] = data;
            handler.callback && handler.callback();
            promise && promise.resolve();
          },
          error: function() {
            handler.error && handler.error() || that.commonError(key);
            promise && promise.reject();
          }
        };

        if (param.dataType === 'jsonp') {
          var re = /\?/;
          var sep = (re.test(param.url)) ? '&' : '?';
          param.url += sep + 'callback=' + param.jsonpCallback + (param.cache ? '' : ('&_=' + (new Date() / 1)));

          pushWindow(param.jsonpCallback, function(data) {
            param.success(data);
            //node && doc.getElementsByTagName('body')[0].removeChild(node);
            clearTimeout(timer);
          });

          elm = doc.createElement('script');
          elm.id = key + 'Script';
          elm.src = param.url;

          node = doc.getElementsByTagName('body')[0].appendChild(elm);

          timer = setTimeout(function() {
            param.error();
            //node && doc.getElementsByTagName('body')[0].removeChild(node);
          }, param.timeout);

        } else {
          $ && (that.reqId[key] = $.ajax(param));
        }

      }

      function pushWindow(callbacName, fn) {
        var re = /\./;
        var sep = re.test(callbacName) ? callbacName.split('.') : [callbacName];
        var pool = win;

        if (sep.length === 1) {
          if (pool[sep[0]]) {
            nameSpaceLog();
            pool[sep[0]] = fn;
          } else {
            pool[sep[0]] = fn;
          }
        } else {
          for (var i = 0; i < sep.length; i++) {
            if (i === 0) {
              checkNameSpace(win[sep[i]]);
              pool = win[sep[i]] = win[sep[i]] || {};
            } else if(i === sep.length - 1) {
              if (pool[sep[i]]) {
                nameSpaceLog();
                pool[sep[i]] = fn;
              } else {
                pool[sep[i]] = fn;
              }
            } else {
              checkNameSpace(pool[sep[i]]);
              pool = pool[sep[i]] = pool[sep[i]] || {};
            }
          }
        }
      }

      function nameSpaceLog() {
        //throw new Error('request callback name Error: name space has already existed.');
        console.log('使われてるけど、上書きしたよ');
      }

      function checkNameSpace(obj) {
        if (!obj) {
          return;
        } else {
          if (obj !== Object(obj)) {
            nameSpaceError();
          }
        }
      }
    }



    /**
     * set the parameter and build url.
     * @type {function}
     * @param {string} key -> model name.
     * @param {object} op -> parameter object for extension.
     * @return {string} -> url string
     */
    function _getUrl(key) {
      if (!this.opt[key]) { return ''; }
      var _parent = this.parent;
      var k;
      var equalsSign = '=';
      var queryStringSeparator = "?";
      var argumentSeparator = "&";
      var url = this.opt[key].url;
      this.param = this.opt[key].param ? this.opt[key].param.call(_parent) : null;

      if (this.param) {
        var count = 0;
        for (k in this.param) {
          url += count === 0 ? queryStringSeparator : argumentSeparator;
          url += k + equalsSign + this.param[k];
          count++;
        }
      }

      return url;
    }

    function _commonError(key) {
    }
  })();



  /**
   * mod.
   * -------------------------------------------------- */
  __root.mod = (function () {

    return {
      PopWindow: _popWindow()
    };

    function _popWindow() {


      /* private class variable.
       * -------------------------------------------------- */

      var $wrapper_ = $('<div>').addClass('popWindowWrap');
      var $overlay_ = $('<a>').addClass('popWindowOverlay').attr({
        'href': 'javascript:void(0)'
      });
      var $close_ = $('<a>').addClass('popWindowClose').attr({
        'href': 'javascript:void(0)'
      });
      var $closeI_ = $('<i>');
      $body.append(_style());
      $body.append($wrapper_);
      $body.append($overlay_);




      /* constructor variable.
       * -------------------------------------------------- */

      var _constructor = function(opt) {
        this.opt = opt;

        this.close = this.opt.close || null;
        this.cnt = this.opt.cnt || null;
        this.trig = this.opt.trig || null;

        this.wrapInit = this.opt.wrapInit || null;
        this.wrapClass = this.opt.wrapClass || null;
        this.wrapAnim = this.opt.wrapAnim || null;
        this.opacity = this.opt.opacity || 0.4;
        this.overlayColor = this.opt.overlayColor || '#000';
        this.animTime = this.opt.animTime || 150;
        this.onEasing = this.opt.onEasing || 'swing';
        this.offEasing = this.opt.offEasing || 'swing';
        this.isFix = this.opt.isFix || false;
        this.topPos = this.topPos || 20;
        this.closeTaplog = this.opt.closeTaplog || 'cmn/hop_up/close';

        this.init();
      };



      /* add prototype.
       * -------------------------------------------------- */

      _constructor.prototype = {
        // init
        init: _init,
        // method
        on: _on,
        off: _off,
        // util
        _addClass: _addClass,
        _removeClass: _removeClass,
        _removeEvent: _removeEvent,
        _setStyle: _setStyle,
        _resetStyle: _resetStyle,
        _addOffEvent: _addOffEvent,
        _addOnEvent: _addOnEvent,
        _updateSize: _updateSize,
        _setTaplog: _setTaplog,
        _removeTaplog: _removeTaplog,
        _resize: _resize
      };

      return _constructor;



      /* init.
       * -------------------------------------------------- */

      function _init() {
        $wrapper_.append($close_);
        this.cnt.addClass('popWindowCnt');
        this.animFlg = false;
        this._addOnEvent();
      }



      /* methods.
       * -------------------------------------------------- */

      function _on() {
        var self_ = this;
        $wrapper_[0].innerHTML = "";
        $close_.append($closeI_);
        $wrapper_.append($close_);
        $wrapper_.append(this.cnt);

        this._resize();
        this._updateSize();
        this._setStyle();
        this._addClass();
        this._setTaplog();
        this._removeEvent();
        this._addOffEvent();

        $wrapper_.css({ 'display': 'block' });
        $overlay_.css({ 'display': 'block' });
        this.wrapInit && this.wrapInit($wrapper_);

        this.animFlg = true;
        $overlay_.animate({ 'opacity': this.opacity }, this.animTime, this.onEasing);

        if (this.wrapAnim) {
          this.wrapAnim($wrapper_, callback);
        } else {
          $wrapper_.animate({ 'opacity': 1 }, this.animTime, this.onEasing, callback);
        }
        function callback() {
          self_.onCallback && self_.onCallback();
          self_.animFlg = false;
        }
      }

      function _off() {
        var self_ = this;
        this._updateSize();
        this._removeEvent();
        this._addOffEvent();

        self_.offCallback && self_.offCallback();

        this.animFlg = true;
        $wrapper_.animate({
          opacity: 0
        }, this.animTime, this.offEasing, function() {
          $wrapper_[0].innerHTML = "";
          self_._resetStyle();
          self_._removeClass();
          self_._removeTaplog();
          self_.animFlg = false;
        });

        $overlay_.animate({
          opacity: 0
        }, this.animTime, this.offEasing, function() {
          self_._resetStyle();
        });

      }



      /* util.
       * -------------------------------------------------- */

      function _setTaplog() {
        $close_.attr('data-taplog', this.closeTaplog);
        $overlay_.attr('data-taplog', this.closeTaplog);
      }

      function _removeTaplog() {
        $close_.removeAttr('data-taplog');
        $overlay_.removeAttr('data-taplog');
      }

      function _addClass() {
        $wrapper_.addClass(this.wrapClass);
      }

      function _removeClass() {
        $wrapper_.removeClass(this.wrapClass);
      }

      function _removeEvent() {
        $overlay_.unbind();
        $close_.unbind();
        this.close && $.each(this.close, function() {
          $(this).unbind();
        });
      }

      function _addOnEvent() {
        var self_ = this;
        this.trig && this.trig.click(function() {
          !self_.animFlg && self_.on();
        });
      }

      function _addOffEvent() {
        var self_ = this;
        $.each([$close_, $overlay_], function() {
          $(this).click(function() {
            !self_.animFlg && self_.off();
          });
        });
        this.close && $.each(this.close, function() {
          $(this).click(function() {
            !self_.animFlg && self_.off();
          });
        });
      }

      function _resize() {
        var self_ = this;
        $win.resize(function () {
          self_._updateSize();
          self_._setStyle();
        });
      }

      function _resetStyle() {
        $wrapper_.removeAttr('style');
        $overlay_.removeAttr('style');
      }

      function _setStyle() {
        var halfWrapperHeight = $wrapper_.outerHeight() / 2;
        var topPos = this.isFix ? this.topPos + halfWrapperHeight : this.wSize.height / 2 + this.sTop;
        topPos = topPos < 150 ? 150 : topPos;
        $overlay_.css({
          'background-color': this.overlayColor
        });
        $wrapper_.css({
          'display': 'block',
          'top': topPos,
          'margin-top': -halfWrapperHeight,
          'margin-left': -($wrapper_.outerWidth() / 2)
        });
      }

      function _updateSize() {
        this.cSize = fn.getContntsSize();
        this.wSize = fn.getWindowSize();
        this.sTop = fn.getScrollPos();
      }

      function _style() {

        return '<style>' +
          // core style - popWindow用スタイル
          '.popWindowWrap {' +
            'display: none;' +
            'text-align: center;' +
            'opacity: 0;' +
            'position: absolute;' +
            'left: 50%;' +
            'z-index: 2109;' +
            '-webkit-transform: translate3d(0,0,0);' +
          '}' +

          '.popWindowOverlay {' +
            'width: 200%;' +
            'height: 200%;' +
            'display: none;' +
            'opacity: 0;' +
            '-webkit-tap-highlight-color: rgba(0, 0, 0, 0);' +
            'position: fixed;' +
            'box-sizing: border-box;' +
            'z-index: 2103;' +
            'top: 0;' +
            'left: 0;' +
          '}' +

          // base style - ベースになるレイアウトスタイル
          '.popWindowWrap {' +
            'width: 95%;' +
            'max-width: 298px;' +
          '}' +

          '.popWindowCnt {' +
            'color: #333;' +
            'background-color: #fff;' +
            'border: 2px solid #646464;' +
            'border-radius: 6px;' +
          '}' +

          '.popWindowClose {' +
            'cursor: pointer;' +
            'position: absolute;' +
            'top: -9px;' +
            'right: -9px;' +
            'width: 18px;' +
            'height: 18px;' +
            'border: 2px solid #fff;' +
            'padding: 2px;' +
            'background-color: #999;' +
            'border-radius: 24px;' +
            'background-clip:padding-box;' +
            '-webkit-background-clip:padding-box;' +
            'border-radius: 24px;' +
            'cursor: pointer;' +
            '-webkit-box-sizing: content-box;' +
            'box-sizing: content-box;' +
          '}' +

          '.popWindowClose i {' +
            'position: absolute;' +
            'top: 1px;' +
            'left: 4px;' +
            'font-family: \'AmebaSymbols\';' +
            'font-style: normal;' +
            'font-size: 14px;' +
            'color: #fff;' +
            'line-height: 1.5;' +
          '}' +

          '.popWindowClose i:before {' +
            //'content: \'X\';' +
          '}' +
        '</style>';
      }
    }

  })();


})(window, document, jQuery);
