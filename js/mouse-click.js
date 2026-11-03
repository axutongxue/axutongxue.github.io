(function () {
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

/* ============================================================
   备注条目：ⓘ 位置调整 + 悬停/点按浮窗
   1) 旧版 index.html 的 ⓘ 排在备用链接右侧；新版生成器（13 步）已改为
      名称 → ⓘ → 备用链接。这里对旧 DOM 做同样的移动（幂等，新 DOM 命中
      条件不成立、跳过），保证未重新生成的页面上顺序也正确。
   2) 桌面悬停、触屏点按都显示备注全文浮层（#noteTip，样式在 css/style.css）。
      不用 :hover::after / .touched 行内展开——会把行内文字挤开；CSS 里保留的
      .touched 规则仅作「访客缓存了旧 JS」时的兜底，本文件已不再添加该类。
      定位用 getBoundingClientRect + 右下角探针取视口边界：根元素 zoom
      生效时 window.innerWidth 与 rect 不是同一坐标系（见上方 resize 注释），
      两者不能混用；写回 style.left/top 时把 rect 坐标除回 zoom。
   ============================================================ */
(function () {
  var tip = null;
  var probe = null;

  function ensure() {
    if (!tip) {
      tip = document.createElement('div');
      tip.id = 'noteTip';
      document.body.appendChild(tip);
    }
    if (!probe) {
      // 探针钉在视口右下角，其 rect 即「rect 坐标系下的视口右/下边界」
      probe = document.createElement('div');
      probe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;visibility:hidden;pointer-events:none;';
      document.body.appendChild(probe);
    }
  }

  function show(icon) {
    var text = icon.getAttribute('notes');
    if (!text) return;
    ensure();
    // 点击态（方案 E）：先清掉其它图标的 active，再标记当前这个
    document.querySelectorAll('.note-icon.active').forEach(function (el) { el.classList.remove('active'); });
    icon.classList.add('active');
    tip.textContent = text;
    tip.style.display = 'block';
    var edge = probe.getBoundingClientRect();
    var rect = icon.getBoundingClientRect();
    var box = tip.getBoundingClientRect();
    // ⚠️ rect/box/edge 都是「根 zoom 后的视觉像素」（Aa 字号面板/高分屏缩放改的是根 zoom）。
    // 下面所有 CSS px 量（避让边距、屏幕边距、浮窗最大宽）必须 × zoom 换算成视觉像素，
    // 否则字号放大后全部失准：100vw 渲染成 视口×zoom，浮窗会比屏幕还宽、
    // 避让量 52px 只等效 52/zoom——zoom 2 时浮窗整条压在功能栏底下（站长实测截图）。
    var zoom = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
    // 移动端浮窗避让：右缘给右侧功能栏（30px + 间距）留出空间，不压在它上面
    var marginR = (window.matchMedia('(max-width: 768px)').matches ? 52 : 12) * zoom;
    var pad = 12 * zoom;      // 屏幕四周安全边距
    // 浮窗最大宽由 JS 按视觉像素写入——CSS 里的 calc(100vw-64px) 在根 zoom 下语义错误
    tip.style.maxWidth = Math.round(edge.left / zoom - 64) + 'px';
    tip.textContent = text;
    tip.style.display = 'block';
    box = tip.getBoundingClientRect();
    var x = rect.left;
    var y = rect.bottom + 6 * zoom;
    if (x + box.width > edge.left - marginR) x = edge.left - marginR - box.width;
    if (x < pad) x = pad;
    if (y + box.height > edge.top - pad) {
      var above = rect.top - 6 * zoom - box.height;
      y = above >= pad ? above : Math.max(pad, edge.top - pad - box.height);
    }
    tip.style.left = Math.round(x / zoom) + 'px';
    tip.style.top = Math.round(y / zoom) + 'px';
  }

  function hide() {
    if (tip) tip.style.display = 'none';
    document.querySelectorAll('.note-icon.active').forEach(function (el) { el.classList.remove('active'); });
  }

  document.addEventListener('mouseover', function (event) {
    var icon = event.target.closest && event.target.closest('.note-icon');
    if (icon && icon.getAttribute('notes')) show(icon);
    else hide();
  });
  document.addEventListener('mouseout', function (event) {
    if (event.target.closest && event.target.closest('.note-icon')) hide();
  });
  // 触屏：点按 ⓘ 与桌面悬停走同一浮窗。
  // ⚠️ 用 touchend 而非 touchstart：touchstart 在手指刚碰到就触发，滚动页面时
  // 手指划过 ⓘ 也会误弹窗，且无法表达「按下—抬起」的完整点击语义。
  // 判定「是点击而非滑动」：记录按下点，抬起时位移超过 10px 就不算点击（用户是在滚动）。
  var touchStartX = 0, touchStartY = 0, touchMoved = false;
  document.addEventListener('touchstart', function (event) {
    var t = event.touches[0];
    touchStartX = t ? t.clientX : 0;
    touchStartY = t ? t.clientY : 0;
    touchMoved = false;
  }, { passive: true });
  document.addEventListener('touchmove', function (event) {
    var t = event.touches[0];
    if (!t) return;
    if (Math.abs(t.clientX - touchStartX) > 10 || Math.abs(t.clientY - touchStartY) > 10) {
      touchMoved = true;
    }
  }, { passive: true });
  document.addEventListener('touchend', function (event) {
    if (touchMoved) return;   // 是滑动手势，不当作点击
    var icon = event.target.closest && event.target.closest('.note-icon');
    if (icon && icon.getAttribute('notes')) {
      show(icon);
      event.preventDefault();
    } else {
      hide();
    }
  }, { passive: false });
  window.addEventListener('scroll', hide, { passive: true });
  window.addEventListener('resize', hide, { passive: true });

  /* 移动端：滚动时右侧功能栏淡化到 40%（上滑或回顶恢复）。
     站长反馈功能栏遮挡列表文字与备注浮窗；桌面端列表不与侧栏重叠，不做。 */
  var sbLastY = 0;
  var sideStackEl = document.getElementById('sideStack');
  window.addEventListener('scroll', function () {
    if (!sideStackEl || !window.matchMedia('(max-width: 768px)').matches) return;
    var y = window.scrollY;
    if (y > 24 && y > sbLastY) sideStackEl.classList.add('dimmed');
    else if (y < sbLastY || y <= 24) sideStackEl.classList.remove('dimmed');
    sbLastY = y;
  }, { passive: true });
})();
