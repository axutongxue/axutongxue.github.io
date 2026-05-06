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

  function random(min, max) {
    if (Array.isArray(min)) return min[Math.floor(Math.random() * min.length)];
    if (max === undefined) {
      max = min || 1;
      min = 0;
    }
    return min + Math.random() * (max - min);
  }

  function resize() {
    var ratio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * ratio);
    canvas.height = Math.floor(window.innerHeight * ratio);
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
  resize();
})();
