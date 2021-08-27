(function (name, factory) {
  if (typeof window === "object") {
      window[name] = factory();
  }
})
  ("Ribbons", function () {
      var _w = window, _b = document.body, _d = document.documentElement;

      //随机函数
      var random = function () {
          if (arguments.length === 1) {
              if (Array.isArray(arguments[0])) {
                  var index = Math.round(random(0, arguments[0].length - 1));
                  return arguments[0][index];
              }
              return random(0, arguments[0]);
          } else
              if (arguments.length === 2) {
                  return Math.random() * (arguments[1] - arguments[0]) + arguments[0];
              }
          return 0;
      };

      //屏幕信息
      var screenInfo = function (e) {
          var width = Math.max(0, _w.innerWidth || _d.clientWidth || _b.clientWidth || 0),
              height = Math.max(0, _w.innerHeight || _d.clientHeight || _b.clientHeight || 0),
              scrollx = Math.max(0, _w.pageXOffset || _d.scrollLeft || _b.scrollLeft || 0) - (_d.clientLeft || 0),
              scrolly = Math.max(0, _w.pageYOffset || _d.scrollTop || _b.scrollTop || 0) - (_d.clientTop || 0);
          return {
              width: width,
              height: height,
              ratio: width / height,
              centerx: width / 2,
              centery: height / 2,
              scrollx: scrollx,
              scrolly: scrolly
          };
      };

      var mouseInfo = function (e) {
          var screen = screenInfo(e),
              mousex = e ? Math.max(0, e.pageX || e.clientX || 0) : 0,
              mousey = e ? Math.max(0, e.pageY || e.clientY || 0) : 0;

          return {
              mousex: mousex,
              mousey: mousey,
              centerx: mousex - screen.width / 2,
              centery: mousey - screen.height / 2
          };
      };

      //点
      var Point = function (x, y) {
          this.x = 0;
          this.y = 0;
          this.set(x, y);
      };
      //点运算
      Point.prototype = {
          constructor: Point,
          set: function (x, y) {
              this.x = x || 0; this.y = y || 0;
          },
          copy: function (point) {
              this.x = point.x || 0; this.y = point.y || 0; return this;
          },
          multiply: function (x, y) {
              this.x *= x || 1; this.y *= y || 1; return this;
          },
          divide: function (x, y) {
              this.x /= x || 1; this.y /= y || 1; return this;
          },
          add: function (x, y) {
              this.x += x || 0; this.y += y || 0; return this;
          },
          subtract: function (x, y) {
              this.x -= x || 0; this.y -= y || 0; return this;
          },
          clampX: function (min, max) {
              this.x = Math.max(min, Math.min(this.x, max)); return this;
          },
          clampY: function (min, max) {
              this.y = Math.max(min, Math.min(this.y, max)); return this;
          },
          flipX: function () {
              this.x *= -1; return this;
          },
          flipY: function () {
              this.y *= -1; return this;
          }
      };

      //丝带画板
      var Factory = function (options) {
          this._canvas = null;
          this._context = null;
          this._sto = null;
          this._width = 0;
          this._height = 0;
          this._scroll = 0;
          this._ribbons = [];
          this._options = {
              id: "bgCanvas",//画板Id
              colorSaturation: "80%",//纯度
              colorBrightness: "60%",//亮度
              colorAlpha: 0.65,//透明度
              colorCycleSpeed: 6,//丝带不同块之间的色彩变化量
              verticalPosition: "center",//丝带相对于屏幕的初始位置：top/min 屏幕最上方，middle|center 中间，bottom|max 屏幕最下面
              horizontalSpeed: 200,//丝带水平方向移动速度参数（会乘以一个随机值）
              ribbonCount: 3,//同一时间丝带总条数
              strokeSize: 0,//公共边路径样式
              parallaxAmount: -0.5,//滚动偏移参数，-1表示不偏移，0表示基于丝带只出现在页面最上面
              animateSections: true//丝带块是否偏移，显得有动感
          };
          this._onDraw = this._onDraw.bind(this);
          this._onResize = this._onResize.bind(this);
          this._onScroll = this._onScroll.bind(this);
          this.setOptions(options);
          this.init();
      };
      Factory.prototype = {
          constructor: Factory,
          setOptions: function (options) {
              if (typeof options === "object") {
                  for (var key in options) {
                      if (options.hasOwnProperty(key)) {
                          this._options[key] = options[key];
                      }
                  }
              }
          },
          //初始化
          init: function () {
              //初始化画板
              try {
                  this._canvas = document.createElement("canvas");
                  this._canvas.style["display"] = "block";
                  this._canvas.style["position"] = "fixed";
                  this._canvas.style["margin"] = "0";
                  this._canvas.style["padding"] = "0";
                  this._canvas.style["border"] = "0";
                  this._canvas.style["outline"] = "0";
                  this._canvas.style["left"] = "0";
                  this._canvas.style["top"] = "0";
                  this._canvas.style["width"] = "100%";
                  this._canvas.style["height"] = "100%";
                  this._canvas.style["z-index"] = "-1";
                  this._canvas.style["background-color"] = this._options.backgroundColor;
                  this._canvas.id = this._options.id;
                  this._onResize();
                  this._context = this._canvas.getContext("2d");
                  this._context.clearRect(0, 0, this._width, this._height);
                  this._context.globalAlpha = this._options.colorAlpha;
                  window.addEventListener("resize", this._onResize);
                  window.addEventListener("scroll", this._onScroll);
                  document.body.appendChild(this._canvas);
              }
              catch (e) {
                  console.warn("Canvas Context Error: " + e.toString());
                  return;
              }
              //开始绘画
              this._onDraw();
          },
          //生成一条丝带
          addRibbon: function () {
              var dir = Math.round(random(1, 9)) > 5 ? "right" : "left",//丝带延伸方向
                  stop = 1000,
                  hide = 200,
                  min = 0 - hide,
                  max = this._width + hide,
                  movex = 0,
                  movey = 0,
                  startx = dir === "right" ? min : max,//起始点x左边
                  starty = Math.round(random(0, this._height));//起始点y左边

              //丝带生成的位置
              if (/^(top|min)$/i.test(this._options.verticalPosition)) {//最上方
                  starty = 0 + hide;
              } else if (/^(middle|center)$/i.test(this._options.verticalPosition)) {//中间
                  starty = this._height / 2;
              } else if (/^(bottom|max)$/i.test(this._options.verticalPosition)) {//最下方
                  starty = this._height - hide;
              }

              if (this._options.parallaxAmount !== 0) {
                  starty += this._scroll;//加上滚动
              }

              var ribbon = [],
                  point1 = new Point(startx, starty),
                  point2 = new Point(startx, starty),
                  point3 = null,
                  color = Math.round(random(0, 360)),
                  delay = 0;

              //从起始位置开始生成一条丝带
              //丝带每个分部都是一个三角形，三点确定一个三角形，相邻三角形有一条公共边
              while (true) {
                  if (stop <= 0) break;
                  stop--;
                  movex = Math.round((Math.random() * 1 - 0.2) * this._options.horizontalSpeed);
                  movey = Math.round((Math.random() * 1 - 0.5) * (this._height * 0.25));
                  point3 = new Point();
                  point3.copy(point2);
                  if (dir === "right") {
                      point3.add(movex, movey);
                      if (point2.x >= max) break;
                  } else if (dir === "left") {
                      point3.subtract(movex, movey);
                      if (point2.x <= min) break;
                  }
                  ribbon.push({
                      //三点
                      point1: new Point(point1.x, point1.y),
                      point2: new Point(point2.x, point2.y),
                      point3: point3,
                      color: color,//丝带颜色
                      delay: delay,//延迟消失
                      dir: dir,//方向
                      alpha: 0,//透明度
                      phase: 0 //随机位移有关参数
                  });
                  //公共边
                  point1.copy(point2);
                  point2.copy(point3);
                  delay += 4;
                  color += this._options.colorCycleSpeed;
              }
              this._ribbons.push(ribbon);
          },
          //绘制一个三角形方块
          _drawRibbonSection: function (section) {
              if (section) {
                  if (section.phase >= 1 && section.alpha <= 0) {
                      return true;
                  }
                  if (section.delay <= 0) {
                      section.phase += 0.02;
                      section.alpha = Math.sin(section.phase) * 1;
                      section.alpha = section.alpha <= 0 ? 0 : section.alpha;
                      section.alpha = section.alpha >= 1 ? 1 : section.alpha;
                      if (this._options.animateSections) {
                          var mod = Math.sin(1 + section.phase * Math.PI / 2) * 0.1;
                          if (section.dir === "right") {
                              section.point1.add(mod, 0);
                              section.point2.add(mod, 0);
                              section.point3.add(mod, 0);
                          } else {
                              section.point1.subtract(mod, 0);
                              section.point2.subtract(mod, 0);
                              section.point3.subtract(mod, 0);
                          }
                          section.point1.add(0, mod);
                          section.point2.add(0, mod);
                          section.point3.add(0, mod);
                      }
                  } else {
                      section.delay -= 0.5;
                  }
                  var s = this._options.colorSaturation,
                      l = this._options.colorBrightness,
                      c = "hsla(" + section.color + ", " + s + ", " + l + ", " + section.alpha + " )";

                  //绘制一个方块
                  this._context.save();
                  if (this._options.parallaxAmount !== 0) {
                      this._context.translate(0, this._scroll * this._options.parallaxAmount);
                  }
                  this._context.beginPath();
                  this._context.moveTo(section.point1.x, section.point1.y);
                  this._context.lineTo(section.point2.x, section.point2.y);
                  this._context.lineTo(section.point3.x, section.point3.y);
                  this._context.fillStyle = c;
                  this._context.fill();
                  if (this._options.strokeSize > 0) {
                      this._context.lineWidth = this._options.strokeSize;
                      this._context.strokeStyle = c;
                      this._context.lineCap = "round";
                      this._context.stroke();
                  }
                  this._context.restore();
              }
              return false;
          },
          //绘制丝带
          _onDraw: function () {
              //清空已经绘制过的丝带
              for (var i = 0, t = this._ribbons.length; i < t; ++i) {
                  if (!this._ribbons[i]) {
                      this._ribbons.splice(i, 1);
                  }
              }
              this._context.clearRect(0, 0, this._width, this._height);//清空画板
              for (var a = 0; a < this._ribbons.length; ++a) {
                  var ribbon = this._ribbons[a],
                      numSections = ribbon ? ribbon.length : 0,
                      numDone = 0;

                  //绘制整条丝带
                  for (var b = 0; b < numSections; ++b) {
                      if (this._drawRibbonSection(ribbon[b])) {
                          numDone++;
                      }
                  }
                  //丝带已经全部飘过屏幕，设置为null,函数前面会自动清理
                  if (numDone >= numSections) {
                      this._ribbons[a] = null;
                  }
              }
              //随机生成一条丝带
              if (this._ribbons.length < this._options.ribbonCount && Math.random() > 0.99) {
                  this.addRibbon();
              }

              //调度交给系统，当需要刷新画板时调用指定的回调函数，用于提高性能
              requestAnimationFrame(this._onDraw);
          },
          //重新设置窗体大小时需要获取窗体大小
          _onResize: function (e) {
              var screen = screenInfo(e);
              this._width = screen.width;
              this._height = screen.height;
              if (this._canvas) {
                  this._canvas.width = this._width;
                  this._canvas.height = this._height;
                  if (this._context) {
                      this._context.globalAlpha = this._options.colorAlpha;
                  }
              }
          },
          //滚动时获取滚动距离
          _onScroll: function (e) {
              var screen = screenInfo(e);
              this._scroll = screen.scrolly;
          }
      }; return Factory;
  });

//初始化并绘制
new Ribbons({
  ribbonCount: 5,
  parallaxAmount: -0.99
});