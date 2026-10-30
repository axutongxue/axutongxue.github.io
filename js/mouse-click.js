(function () {
  document.addEventListener('touchstart', function (event) {
    var target = event.target.closest && event.target.closest('.fa-info-circle');
    if (!target) return;
    document.querySelectorAll('.fa-info-circle.touched').forEach(function (item) {
      item.classList.remove('touched');
    });
    target.classList.add('touched');
    event.preventDefault();
  }, { passive: false });

  var container = document.getElementById('clickCanvas');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!container || reduceMotion) return;

  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  if (!context) return;

  canvas.style.cssText = 'display:block;width:100vw;height:100vh;pointer-events:none;';
  container.appendChild(canvas);

  var colors = ['#5ee4ff', '#f44033', '#ffeb3b', '#F38630', '#FA6900', '#f403e8', '#F9D423'];
  var particles = [];
  var rafId = 0;
  var maxParticles = 50;
  var lastW = 0;
  var lastH = 0;

  function random(min, max) {
    if (Array.isArray(min)) return min[Math.floor(Math.random() * min.length)];
    if (max === undefined) {
      max = min || 1;
      min = 0;
    }
    return min + Math.random() * (max - min);
  }

  // 位图尺寸必须取 canvas 的真实显示盒（getBoundingClientRect），不能用 innerWidth：
  // 根元素 zoom 下 100vw/100vh 不会缩小（zoom 1.25 时显示盒是 innerWidth×1.25），
  // 若位图仍按 innerWidth 设，位图会被拉伸 1.25 倍，点击坐标(clientX/Y)
  // 与绘制坐标错位（越靠右/下偏移越大）。
  // 尺寸没变时直接返回：改 canvas.width 会清空画布，不应在每次点击时无谓触发。
  function resize() {
    var ratio = window.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();
    var w = Math.floor((rect.width || window.innerWidth) * ratio);
    var h = Math.floor((rect.height || window.innerHeight) * ratio);
    if (w === lastW && h === lastH) return;
    lastW = w;
    lastH = h;
    canvas.width = w;
    canvas.height = h;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function spawn(x, y) {
    if (particles.length >= maxParticles) particles.shift();
    var theta = random(Math.PI * 2);
    var force = random(2, 3);
    particles.push({
      x: x,
      y: y,
      vx: Math.sin(theta) * force,
      vy: Math.cos(theta) * force,
      radius: random(2, 4),
      wander: random(0.5, 2),
      theta: theta,
      drag: random(0.9, 0.99),
      color: random(colors)
    });
  }

  function draw() {
    rafId = 0;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.globalCompositeOperation = 'lighter';

    for (var i = particles.length - 1; i >= 0; i--) {
      var particle = particles[i];
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= particle.drag;
      particle.vy *= particle.drag;
      particle.theta += random(-0.5, 0.5) * particle.wander;
      particle.vx += Math.sin(particle.theta) * 0.1;
      particle.vy += Math.cos(particle.theta) * 0.1;
      particle.radius *= 0.96;

      if (particle.radius <= 0.5) {
        particles.splice(i, 1);
        continue;
      }

      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = particle.color;
      context.fill();
    }

    if (particles.length) {
      rafId = requestAnimationFrame(draw);
    } else {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function shouldIgnore(target) {
    return target.closest && target.closest('textarea,input,a,i,img,button');
  }

  document.addEventListener('mousedown', function (event) {
    // 字号面板改 zoom 不会派发 resize 事件，必须在每次按下时先校正画布尺寸，
    // 否则 canvas 位图与显示盒比例失配，粒子落点偏移。
    // 注意：resize() 必须放在 shouldIgnore 之前——点在链接/按钮等元素上时虽然不喷粒子，
    // 但画布仍需保持尺寸同步。
    resize();
    if (shouldIgnore(event.target)) return;
    for (var i = 0, count = random(15, 20); i < count; i++) {
      spawn(event.clientX, event.clientY);
    }
    if (!rafId) rafId = requestAnimationFrame(draw);
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden && rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    } else if (!document.hidden && particles.length && !rafId) {
      rafId = requestAnimationFrame(draw);
    }
  });

  window.addEventListener('resize', resize, { passive: true });
  // 字号面板改 zoom、以及布局变化都不会派发 resize 事件；用 ResizeObserver 监听
  // canvas 自身的显示盒变化，保证位图始终与显示盒同尺寸（否则点击落点会偏移）。
  if (window.ResizeObserver) {
    new ResizeObserver(resize).observe(canvas);
  }
  resize();
})();
