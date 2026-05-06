(function (window, document) {
  if (!window || !document || !document.body) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  function random(min, max) {
    if (Array.isArray(min)) return min[Math.floor(Math.random() * min.length)];
    if (max === undefined) {
      max = min || 1;
      min = 0;
    }
    return min + Math.random() * (max - min);
  }

  function viewport() {
    var doc = document.documentElement;
    var body = document.body;
    return {
      width: Math.max(0, window.innerWidth || doc.clientWidth || body.clientWidth || 0),
      height: Math.max(0, window.innerHeight || doc.clientHeight || body.clientHeight || 0),
      scrollY: Math.max(0, window.pageYOffset || doc.scrollTop || body.scrollTop || 0)
    };
  }

  function Point(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }

  Point.prototype.copy = function (point) {
    this.x = point.x || 0;
    this.y = point.y || 0;
    return this;
  };

  Point.prototype.add = function (x, y) {
    this.x += x || 0;
    this.y += y || 0;
    return this;
  };

  Point.prototype.subtract = function (x, y) {
    this.x -= x || 0;
    this.y -= y || 0;
    return this;
  };

  function Ribbons(options) {
    this.options = Object.assign({
      id: 'bgCanvas',
      backgroundColor: 'whitesmoke',
      colorSaturation: '80%',
      colorBrightness: '60%',
      colorAlpha: 0.2,
      colorCycleSpeed: 6,
      verticalPosition: 'center',
      horizontalSpeed: 200,
      ribbonCount: window.innerWidth < 768 ? 2 : 5,
      strokeSize: 0,
      parallaxAmount: -0.99,
      animateSections: true
    }, options || {});

    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.ribbons = [];
    this.scroll = 0;
    this.rafId = 0;
    this.draw = this.draw.bind(this);
    this.resize = this.resize.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.onVisibilityChange = this.onVisibilityChange.bind(this);
    this.init();
  }

  Ribbons.prototype.init = function () {
    if (!this.context) return;

    this.canvas.id = this.options.id;
    this.canvas.style.cssText = 'display:block;position:fixed;margin:0;padding:0;border:0;outline:0;left:0;top:0;width:100%;height:100%;z-index:-1;background-color:' + this.options.backgroundColor;
    document.body.appendChild(this.canvas);

    window.addEventListener('resize', this.resize, { passive: true });
    window.addEventListener('scroll', this.onScroll, { passive: true });
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    this.resize();
    this.start();
  };

  Ribbons.prototype.start = function () {
    if (!this.rafId && !document.hidden) {
      this.rafId = window.requestAnimationFrame(this.draw);
    }
  };

  Ribbons.prototype.stop = function () {
    if (this.rafId) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  };

  Ribbons.prototype.resize = function () {
    var size = viewport();
    this.width = size.width;
    this.height = size.height;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.context.globalAlpha = this.options.colorAlpha;
  };

  Ribbons.prototype.onScroll = function () {
    this.scroll = viewport().scrollY;
  };

  Ribbons.prototype.onVisibilityChange = function () {
    document.hidden ? this.stop() : this.start();
  };

  Ribbons.prototype.addRibbon = function () {
    var direction = Math.round(random(1, 9)) > 5 ? 'right' : 'left';
    var widthOffset = 200;
    var minX = -widthOffset;
    var maxX = this.width + widthOffset;
    var current = new Point(direction === 'right' ? minX : maxX, this.height / 2 + this.scroll);
    var previous = new Point(current.x, current.y);
    var color = Math.round(random(0, 360));
    var delay = 0;
    var ribbon = [];
    var guard = 1000;

    while (guard--) {
      var horizontal = Math.round(random(-0.2, 0.8) * this.options.horizontalSpeed);
      var vertical = Math.round(random(-0.5, 0.5) * 0.25 * this.height);
      var next = new Point().copy(current);

      if (direction === 'right') {
        next.add(horizontal, vertical);
        if (current.x >= maxX) break;
      } else {
        next.subtract(horizontal, vertical);
        if (current.x <= minX) break;
      }

      ribbon.push({
        point1: new Point(previous.x, previous.y),
        point2: new Point(current.x, current.y),
        point3: next,
        color: color,
        delay: delay,
        direction: direction,
        alpha: 0,
        phase: 0
      });

      previous.copy(current);
      current.copy(next);
      color += this.options.colorCycleSpeed;
      delay += 4;
    }

    this.ribbons.push(ribbon);
  };

  Ribbons.prototype.drawSection = function (section) {
    if (!section) return false;
    if (section.phase >= 1 && section.alpha <= 0) return true;

    if (section.delay <= 0) {
      section.phase += 0.02;
      section.alpha = Math.max(0, Math.min(1, Math.sin(section.phase)));

      if (this.options.animateSections) {
        var offset = 0.1 * Math.sin(1 + section.phase * Math.PI / 2);
        var move = section.direction === 'right' ? offset : -offset;
        section.point1.add(move, offset);
        section.point2.add(move, offset);
        section.point3.add(move, offset);
      }
    } else {
      section.delay -= 0.5;
    }

    var color = 'hsla(' + section.color + ', ' + this.options.colorSaturation + ', ' + this.options.colorBrightness + ', ' + section.alpha + ')';
    this.context.save();
    if (this.options.parallaxAmount) {
      this.context.translate(0, this.scroll * this.options.parallaxAmount);
    }
    this.context.beginPath();
    this.context.moveTo(section.point1.x, section.point1.y);
    this.context.lineTo(section.point2.x, section.point2.y);
    this.context.lineTo(section.point3.x, section.point3.y);
    this.context.fillStyle = color;
    this.context.fill();
    this.context.restore();
    return false;
  };

  Ribbons.prototype.draw = function () {
    this.rafId = 0;
    if (document.hidden) return;

    this.context.clearRect(0, 0, this.width, this.height);
    for (var i = this.ribbons.length - 1; i >= 0; i--) {
      var ribbon = this.ribbons[i];
      if (!ribbon) {
        this.ribbons.splice(i, 1);
        continue;
      }
      var finished = 0;
      for (var j = 0; j < ribbon.length; j++) {
        if (this.drawSection(ribbon[j])) finished++;
      }
      if (finished >= ribbon.length) this.ribbons.splice(i, 1);
    }

    if (this.ribbons.length < this.options.ribbonCount && Math.random() > 0.99) {
      this.addRibbon();
    }
    this.start();
  };

  window.Ribbons = Ribbons;
  new Ribbons();
})(window, document);
