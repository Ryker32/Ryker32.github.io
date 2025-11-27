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

    const NODE_COUNT = 70;
    const nodes = [];
    const pointer = { x: 0, y: 0, active: false };

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * DPR;
      canvas.height = height * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    function createNode() {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        depth: 0.4 + Math.random() * 0.6,
        pulseOffset: Math.random() * 1000
      };
    }

    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push(createNode());
    }

    window.addEventListener('mousemove', evt => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = evt.clientX - rect.left;
      pointer.y = evt.clientY - rect.top;
      pointer.active = true;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      pointer.active = false;
    });

    function render(time) {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#060a13');
      gradient.addColorStop(1, '#0f1423');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < NODE_COUNT; i++) {
        for (let j = i + 1; j < NODE_COUNT; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          const maxDist = 240;
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.6;
            ctx.lineWidth = (a.depth + b.depth) * 0.5;
            ctx.strokeStyle = `rgba(131, 170, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();

            const progress = ((time * 0.0005) + a.pulseOffset * 0.001) % 1;
            const px = a.x + (b.x - a.x) * progress;
            const py = a.y + (b.y - a.y) * progress;
            ctx.fillStyle = `rgba(255,255,255,${alpha})`;
            ctx.beginPath();
            ctx.arc(px, py, 1.4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      nodes.forEach(node => {
        node.x += node.vx * node.depth;
        node.y += node.vy * node.depth;

        if (pointer.active) {
          const dx = node.x - pointer.x;
          const dy = node.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          const influenceRadius = 260;
          if (dist < influenceRadius) {
            const force = (1 - dist / influenceRadius) * 0.6;
            node.vx += (dx / dist || 0) * force * 0.02;
            node.vy += (dy / dist || 0) * force * 0.02;
          }
        }

        const margin = 40;
        if (node.x < -margin) node.x = width + margin;
        if (node.x > width + margin) node.x = -margin;
        if (node.y < -margin) node.y = height + margin;
        if (node.y > height + margin) node.y = -margin;

        node.vx += (Math.random() - 0.5) * 0.002;
        node.vy += (Math.random() - 0.5) * 0.002;
        node.vx *= 0.995;
        node.vy *= 0.995;

        ctx.fillStyle = `rgba(173, 206, 255, ${0.4 + node.depth * 0.6})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2 + node.depth * 2, 0, Math.PI * 2);
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
