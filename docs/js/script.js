(function (win, doc, $) {

  // alias.
  var __root = root;
  var $body, $html, $win, $doc;
  var model_, prop_, lib_, fn_, mod_, view_, api_, data_;
  var that;

  new __root.init({
    init: _init,
    model: _model,
    controller: _controller
  });


  function _init() {

    that = this;
    prop_ = this.prop;
    lib_ = this.lib;
    fn_ = this.fn;
    mod_ = this.mod;
    now_ = this.now();
    ua_ = lib_.ua;
    view_ = _view();
    model_ = _model();

    // elements.
    $body = this.elm.$body;
    $html = this.elm.$html;
    $win = this.elm.$win;
    $doc = this.elm.$doc;


    /*
     * initialize & setting
     * ----------------------------------------------------- */

    this.target = $('#puzzle');
    this.pointTgt = $('#point');
    this.hignScoreTgt = $('#highScore');
    this.startBtn = $('#start');
    this.countDown = $('#countDown');
    this.time = $('#time');

    this.limitTime = 30000;
    this.connectNum = 3;
    this.dropColor = [ 
      '#e44d93', //red
      '#0066cc', //blue
      '#ffd700', //yello
      '#00ced1', //green
      '#999999'  //gray
    ];
    this.startFlg = false;
    this.seq = 6;
    this.line = 5;
    this.dropDiameter = 50;
    this.dropRadius = this.dropDiameter / 2;
    this.threshold = 15;
    this.fadeTime = 500;

    this.touchX = 0;
    this.touchY = 0;
    this.ball = null;
    this.x = 0;
    this.y = 0;
    this.model = model_.puzzle;
    this.drop = model_.drop;
    this.score = {};
    this.totalScore = 0;
    this.timer = null;
    this.timeoutFlg = false;
    this.finFlg = false;

    this.now = null;
    this.top = null;
    this.bottom = null;
    this.left = null;
    this.right = null;

    this.wrap = $('<ul>');
    this.overWrap = $('<div>').addClass('overWrap').css({
      position: 'absolute',
      width: 300,
      height: 250,
      top: 20,
      left: 20
    });

    this.clone = $('<li>').addClass('clone').css({
      'display': 'none',
        'position': 'absolute',
        'z-index': '100',
        'left': 0,
        'top': 0
    });

    this.pointWrap = $('<div>').addClass('point').css({
      'padding': '20px',
      'font-size': '20px'
    });

    this.scoreWrap = $('<ul>').css({
      'overflow': 'hidden'
    });

    this.pop = new mod_.PopWindow({
      cnt: this.pointWrap
    });

    this.cache = new lib_.cache('dt');
    this.hignScore = this.cache.get('hiscr');
    this.hignScoreTgt.text('High Score : ' + (this.hignScore ? this.hignScore : 0 ) + ' pt');

    this.time.text('0 / 30 sec');

    this.wrap.append(this.clone);
    this.target.append(this.wrap);
    this.offset = this.wrap.offset();

    for (i = 0; i < this.line; i++) {
      this.model[i] = [];
      for (j = 0; j < this.seq; j++) {
        that.model[i][j] = new this.drop([j, i]);
      }
    }

    for (i = 0; i < this.dropColor.length; i++) {
      this.score[i] = {
        comb: 0,
        point: 0
      };
    }

    for (i = 0; i < this.dropColor.length; i++) {
      this.score[i] = {
        comb: 0,
        point: 0
      };

      this.scoreWrap
        ._tag('li').css({
          'color': this.dropColor[i]
        })
      ._gat();
    }

    this.pointTgt.append(this.scoreWrap);

    this.target.append(this.overWrap);
    this.wrap.css('opacity', 0.2);

  }


  /**
   * controller.
   * ---------------------------------------------------------------------- */

  function _controller() {
    var self = this;
    var i, j;

    this.wrap.bind('touchstart', startHandler);
    this.wrap.bind('touchmove', moveHandler);
    this.wrap.bind('touchend', endHandler);

    this.startBtn.bind('click', function () {

      var countDown = 3;
      self.countDown.css('display','block');
      self.countDown.text(countDown);
      self.timeoutFlg = false;
      self.finflg = false;
      self.startBtn.css('display', 'none');
      self.time.text('0 / 30 sec');
      self.scoreWrap.find('li').text('');

      var timer = setInterval(function() {
        countDown -= 1;
        if (countDown === 0) {
          var now = new Date().getTime();
          var tm = 0;
          clearInterval(timer);
          self.overWrap.remove();
          self.countDown.css('display','none');
          self.wrap.css('opacity', 1);
          self.scoreWrap.find('li').text(0);
          self.time.text(tm + ' / 30 sec');

          var tim = setInterval(function() {
            tm += 1;
            self.time.text(tm + ' / 30 sec');

            if (tm === 30) {
              clearInterval(tim);
            }
          } , 1000);

          self.timer = setTimeout(function() {
            self.timeoutFlg = true;
            if (self.finflg || !self.startFlg) {
              fin();
            }
            self.time.text(tm + ' / 30 sec');
          }, self.limitTime);
        }
        self.countDown.text(countDown);
      } ,1000);
    });

    $win.bind('resize', function() {
      self.offset = self.wrap.offset();
    });


    /*
     * touch start
     * -------------------------------------------------- */
    function startHandler(e) {
      var evt = e.originalEvent;
      evt.preventDefault();
      self.touchX = evt.changedTouches[0].pageX - self.offset.left;
      self.touchY = evt.changedTouches[0].pageY - self.offset.top;

      self.ball = [Math.floor(self.touchY / self.dropDiameter), Math.floor(self.touchX / self.dropDiameter)];

      initAround();


      self.clone.css({
        'display': 'block',
        'background-color': self.now.body.css('background-color'),
        'left': -100,
        'top': -100
      });

    }

    /*
     * touch move
     * -------------------------------------------------- */
    function moveHandler(e) {
      var evt = e.originalEvent;
      self.touchX = evt.changedTouches[0].pageX - self.offset.left;
      self.touchY = evt.changedTouches[0].pageY - self.offset.top;

      self.x = self.touchX - self.dropRadius;
      self.y = self.touchY - self.dropRadius;

      self.now.body.css('opacity', 0.2);

      self.clone.css({
        'left': self.x,
        'top': self.y
      });

      initAround();

      if (self.top && self.touchY < self.top.y + self.dropRadius + self.threshold) {
        self.model[self.ball[0]][self.ball[1]] =
          [self.model[self.ball[0] - 1][self.ball[1]], self.model[self.ball[0] - 1][self.ball[1]] = self.model[self.ball[0]][self.ball[1]]][0];
        self.now.update([self.ball[0] - 1, self.ball[1]]);
        self.top.update([self.ball[0], self.ball[1]]);
        self.ball[0] -=  1;
        self.startFlg = true;
      } else if (self.bottom && self.touchY > self.bottom.y + self.dropRadius - self.threshold) {
        self.model[self.ball[0]][self.ball[1]] =
          [self.model[self.ball[0] + 1][self.ball[1]], self.model[self.ball[0] + 1][self.ball[1]] = self.model[self.ball[0]][self.ball[1]]][0];
        self.now.update([self.ball[0] + 1, self.ball[1]]);
        self.bottom.update([self.ball[0], self.ball[1]]);
        self.ball[0] += 1;
        self.startFlg = true;
      } else if (self.left && self.touchX < self.left.x + self.dropRadius + self.threshold) {
        self.model[self.ball[0]][self.ball[1]] =
          [self.model[self.ball[0]][self.ball[1] - 1], self.model[self.ball[0]][self.ball[1] - 1] = self.model[self.ball[0]][self.ball[1]]][0];
        self.now.update([self.ball[0], self.ball[1] - 1]);
        self.left.update([self.ball[0], self.ball[1]]);
        self.ball[1] -= 1;
        self.startFlg = true;
      } else if (self.right && self.touchX > self.right.x + self.dropRadius - self.threshold) {
        self.model[self.ball[0]][self.ball[1]] =
          [self.model[self.ball[0]][self.ball[1] + 1], self.model[self.ball[0]][self.ball[1] + 1] = self.model[self.ball[0]][self.ball[1]]][0];
        self.now.update([self.ball[0], self.ball[1] + 1]);
        self.right.update([self.ball[0], self.ball[1]]);
        self.ball[1] += 1;
        self.startFlg = true;
      }
    }

    /*
     * touch end
     * -------------------------------------------------- */
    function endHandler(e) {
      self.clone.css({ 'display': 'none' });
      self.now.body.css({ 'opacity': 1 });

      self.target.append(self.overWrap);

      if (!self.startFlg) {
        self.overWrap.remove();
        return;
      };
      delDrop(self.model, self.line, self.seq);
    }

    /*
     * パズルの処理が終わった時に呼ばれるやつ
     * -------------------------------------------------- */
    function fin() {
      var i, k;
      var score;
      self.overWrap.remove();
      self.finFlg = true;


      if (self.timeoutFlg) {
        for (k in self.score) {
          score = self.score[k].comb * self.score[k].point;
          self.totalScore += score;
        }
        if (self.hignScore < self.totalScore) {
          self.cache.set('hiscr', self.totalScore);
          self.hignScore = self.totalScore;
          self.hignScoreTgt.text('High Score : ' + self.totalScore + ' pt');
        }
        self.target.append(self.overWrap);
        self.startBtn.css('display', 'block');
        self.pointWrap.text(self.totalScore + ' pt');
        self.pop.on();
        for (i = 0; i < self.dropColor.length; i++) {
          self.score[i] = {
            comb: 0,
            point: 0
          };
        }

        self.target.append(this.overWrap);
        self.wrap.css('opacity', 0.2);
        self.totalScore = 0;
      }

      //スコア初期化
      self.startFlg = false;
    }

    /*
     * 現在のドロップ及び周りのドロップオブジェクト取得
     * -------------------------------------------------- */
    function initAround() {
      self.now = self.model[self.ball[0]][self.ball[1]];
      self.top = (self.ball[0] - 1) >= 0 ? self.model[self.ball[0] - 1][self.ball[1]] : null;
      self.bottom = (self.ball[0] + 1) < self.line ? self.model[self.ball[0] + 1][self.ball[1]] : null;
      self.left = (self.ball[1] - 1)  >= 0 ? self.model[self.ball[0]][self.ball[1] - 1] : null;
      self.right = (self.ball[1] + 1)  < self.seq ? self.model[self.ball[0]][self.ball[1] + 1] : null;
    }

    /*
     * 消えるドロップ決定 -> 消える処理 -> 降ってくる処理 -> 再配置まで
     * -------------------------------------------------- */
    function delDrop(model, line, seq) {
      var i, j;
      var now, top, bottom, left, right;
      var grp = 0;
      var pool = {};
      var finFlg = 0;

      // 消えるドロップ決定
      for (i = 0; i < line; i++) {
        for (j = 0; j < seq; j++) {
          ameba([i, j]);
        }
      }

      // 連結してグルーピングされたドロップを配列に突っ込む
      for (i = 0; i < line; i++) {
        for (j = 0; j < seq; j++) {
        drop = model[i][j];
        !pool[drop.grp] && (pool[drop.grp] = []);
        pool[drop.grp].push(drop);
        }
      }


      // 3個以上繋がってるドロップオブジェクトにdelフラグをたてる
      // 2個のグループはグループナンバー初期化
      for (k in pool) {
        if (pool[k].length > self.connectNum - 1 && k != 0) {
          for (i = 0; i < pool[k].length; i++) {
            pool[k][i].body.css('opacity', 0.2);
            pool[k][i].del = 1;
          }
        } else {
          for (i = 0; i < pool[k].length; i++) {
            pool[k][i].grp = 0;
          }
          delete pool[k];
        }
      }

      // スコア算出
      for (k in pool) {
        self.score[pool[k][0].idf - 1].point += pool[k].length;
        self.score[pool[k][0].idf - 1].comb += 1;

        self.scoreWrap.find('li:eq(' + (pool[k][0].idf - 1) + ')').text(self.score[pool[k][0].idf - 1].point * self.score[pool[k][0].idf - 1].comb);
        self.scoreWrap.find('li:eq(' + (pool[k][0].idf - 1) + ')').addClass('str');
      }


      // 3個以上繋がってるドロップオブジェクトにdelフラグをたてる
      for (i = 0; i < line; i++) {
        for (j = 0; j < seq; j++) {
          if (model[i][j].del) {
            model[i][j].body.animate({'opacity': 0}, self.fadeTime, 'swing');
            !finFlg && (finFlg = 1);
          }
        }
      }

      if (!finFlg) {
        fin();
        return;
      }

     setTimeout(del, self.fadeTime);

      function del() {
        var i, j

        self.scoreWrap.find('li').removeClass('str');

        for (i = 0; i < line; i++) {
          for (j = 0; j < seq; j++) {
            if (model[i][j].del) {
              model[i][j].body.remove();
              model[i][j] = 'del';
            }
          }
        }
        for (i = line - 1; i >= 0; i--) {
          for (j = seq - 1; j >= 0; j--) {
            checkFallDrop(model, i, j);
          }
        }
        setTimeout(function() {
          for (i = 0; i < line; i++) {
            for (j = 0; j < seq; j++) {
              if (model[i][j] === 'del') {
                model[i][j] = new self.drop([j, i]);
              }
            }
          }

          for (i = 0; i < line; i++) {
            for (j = 0; j < seq; j++) {
              model[i][j].update([i, j]);
            }
          }

        delDrop(model, line, seq);
        }, 200);
      }


    /*
     * つながっているドロップにグループフラグ設置
     * -------------------------------------------------- */
      function ameba(ball) {
        var k;
        var obj = {
          top: [],
          bottom: [],
          left: [],
          right: []
        };

        var now = model[ball[0]][ball[1]];
        obj.top[0] = (ball[0] - 1) >= 0 ? model[ball[0] - 1][ball[1]] : null;
        obj.bottom[0] = (ball[0] + 1) < line ? model[ball[0] + 1][ball[1]] : null;
        obj.left[0] = (ball[1] - 1)  >= 0 ? model[ball[0]][ball[1] - 1] : null;
        obj.right[0] = (ball[1] + 1)  < seq ? model[ball[0]][ball[1] + 1] : null;

        obj.bottom[1] = !!(obj.bottom[0] && obj.bottom[0].idf === now.idf);
        obj.top[1] = !!(obj.top[0] && obj.top[0].idf === now.idf);
        obj.left[1] = !!(obj.left[0] && obj.left[0].idf === now.idf);
        obj.right[1] = !!(obj.right[0] && obj.right[0].idf === now.idf);

        obj.bottom[2] = !!(obj.bottom[0] && !obj.bottom[0].grp);
        obj.top[2] = !!(obj.top[0] && !obj.top[0].grp);
        obj.left[2] = !!(obj.left[0] && !obj.left[0].grp);
        obj.right[2] = !!(obj.right[0] && !obj.right[0].grp);

        for (k in obj) {
          if (obj[k][1] && obj[k][2]) {
            !now.grp && (now.grp = obj[k][0]['grp'] ? obj[k][0]['grp'] : grp += 1);
            !obj[k][0]['grp'] && (obj[k][0]['grp'] = now.grp);

            ameba([obj[k][0]['line'], obj[k][0]['seq']]);
          }
        }
      }
    }

    /*
     * 浮いたドロップを下に落とす処理
     * -------------------------------------------------- */
    function checkFallDrop(model, i, j, rec) {
      if (model[i][j] !== 'del') {
        if (model[i + 1]) {
          if (model[i + 1][j] === 'del') {
            model[i][j] = [model[i + 1][j], model[i + 1][j] = model[i][j]][0];
            checkFallDrop(model, i + 1, j, true);
          } else if (rec) {
            model[i][j].update([i, j]);
          }
        } else if (rec){
          model[i][j].update([i, j]);
        }
      }
    }

  }



  /**
   * model.
   * ---------------------------------------------------------------------- */
  function _model() {

    return {
      puzzle: [],
      drop: _drop()
    };

    function _drop() {
      var _constructor = function(xy) {
        this.idf = Math.round(Math.random() * (that.dropColor.length - 1)) + 1;
        this.grp = 0;
        this.del = 0;
        this.line = xy[1];
        this.seq = xy[0];
        this.x = this.seq * that.dropDiameter;
        this.y = this.line * that.dropDiameter;
        this.color = that.dropColor[this.idf - 1];
        this.body = $('<li>').addClass('drop').css({
          'background-color': this.color,
          'position': 'absolute'
        });

        this.setPos();
        this.append();
      };
      _constructor.prototype = {
        append: _append,
        update: _update,
        setPos: _setPos
      };

      return _constructor;

      function _update(arr) {
        this.line = arr[0];
        this.seq = arr[1];
        this.x = this.seq * that.dropDiameter;
        this.y = this.line * that.dropDiameter;
        this.del = 0;
        this.grp = 0;
        this.setPos();
      }

      function _append() {
        that.wrap.append(this.body);
      }

      function _setPos() {
        this.body.css({
          'left': this.x,
          'top': this.y
        });
      }

    }
  }



  /**
   * view.
   * ---------------------------------------------------------------------- */

  function _view() {

    return {
      init: _init,
      style: _style()
    };

    function _init() {

    }


    function _style() {

      return {
        common: _common
      };

      function _common() {
        return '<style>' +
          '.test {' +
            'text-align: right;' +
          '}' +
        '</style>';
      }

    }
  }



  (function ($) {
    $.fn._tag = function (name) { var tag = $('<' + name + ' />'); return this.pushStack(tag); };
    $.fn._gat = function () { return this.end().append(this); };
  })(jQuery);

})(window, document, jQuery);
