(() => {
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  const heroCanvas = document.getElementById('heroCanvas');
  if (heroCanvas) {
    initHeroField(heroCanvas);
  }

  const profileCanvas = document.getElementById('profileNetwork');
  if (profileCanvas) {
    initNetwork(profileCanvas);
  }

  function initHeroField(canvas) {
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;

    const PARTICLE_COUNT = 900;
    const particles = [];
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * DPR;
      canvas.height = height * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    function createParticle() {
      return {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: Math.random(),
        speed: 0.0015 + Math.random() * 0.0035,
        hue: 190 + Math.random() * 80
      };
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle());
    }

    const updatePointer = evt => {
      const rect = canvas.getBoundingClientRect();
      const x = (evt.clientX - rect.left) / rect.width;
      const y = (evt.clientY - rect.top) / rect.height;
      pointer.targetX = (x - 0.5) * 2;
      pointer.targetY = (y - 0.5) * 2;
    };

    window.addEventListener('mousemove', updatePointer, { passive: true });

    function render() {
      ctx.fillStyle = '#050815';
      ctx.fillRect(0, 0, width, height);

      pointer.x += (pointer.targetX - pointer.x) * 0.05;
      pointer.y += (pointer.targetY - pointer.y) * 0.05;

      particles.forEach(p => {
        p.z -= p.speed;
        if (p.z <= 0) {
          p.x = (Math.random() - 0.5) * 2;
          p.y = (Math.random() - 0.5) * 2;
          p.z = 1;
        }

        const perspective = 1 / (1 + p.z * 3.5);
        const x = width / 2 + (p.x + pointer.x * 0.6) * width * perspective * 0.5;
        const y = height / 2 + (p.y + pointer.y * 0.6) * height * perspective * 0.5;
        const size = Math.max(0.6, (1 - p.z) * 3.2);
        const alpha = 0.25 + (1 - p.z) * 0.75;

        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${alpha})`;
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  }

  function initNetwork(canvas) {
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * DPR;
      canvas.height = height * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    const COLORS = {
      bg: '#070a12',
      node: '#8ab9ff',
      nodeGlow: 'rgba(138, 185, 255, 0.35)',
      msg: '#ffffff'
    };

    const N = 26;
    const nodes = Array.from({ length: N }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 2 + Math.random() * 2,
      t: Math.random() * 1000
    }));

    function step(time) {
      ctx.fillStyle = COLORS.bg;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 150) {
          const alpha = 1 - dist / 150;
          ctx.save();
          ctx.strokeStyle = `rgba(173, 206, 255, ${0.2 * alpha})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          ctx.restore();

          const u = (time * 0.0006 + a.t * 0.001) % 1;
          const px = a.x + (b.x - a.x) * u;
          const py = a.y + (b.y - a.y) * u;
          ctx.fillStyle = COLORS.msg;
          ctx.beginPath();
          ctx.arc(px, py, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        const margin = n.r + 2;
        if (n.x < margin) { n.x = margin; n.vx = Math.abs(n.vx); }
        if (n.x > width - margin) { n.x = width - margin; n.vx = -Math.abs(n.vx); }
        if (n.y < margin) { n.y = margin; n.vy = Math.abs(n.vy); }
        if (n.y > height - margin) { n.y = height - margin; n.vy = -Math.abs(n.vy); }

        ctx.fillStyle = COLORS.nodeGlow;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 2.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = COLORS.node;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }
})();
