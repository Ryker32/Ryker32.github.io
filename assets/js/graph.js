(() => {
  const c = document.getElementById('mas-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  const COLORS = {
    bg:'#0b0f14',
    node:'#5aa7ff',
    nodeGlow:'rgba(90,167,255,0.35)',
    msg:'#ffffff'
  };

  const W = () => c.clientWidth;
  const H = () => c.clientHeight;

  function resize() {
    c.width  = W() * DPR;
    c.height = H() * DPR;
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }
  window.addEventListener('resize', resize, {passive:true});
  resize();

  const N = 20;
  const nodes = Array.from({length:N}, () => ({
    x: Math.random()*W(),
    y: Math.random()*H(),
    vx:(Math.random()-0.5)*0.5,
    vy:(Math.random()-0.5)*0.5,
    r: 2 + Math.random()*2,
    t: Math.random()*1000
  }));

  function step(t){
    // background
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0,0,W(),H());

    // edges + pulses
    for (let i=0;i<N;i++) for (let j=i+1;j<N;j++){
      const a = nodes[i], b = nodes[j];
      const dx=a.x-b.x, dy=a.y-b.y, d=Math.hypot(dx,dy);
      if (d<160){
        const alpha = 1 - d/160;

        // glow pass
        ctx.save();
        ctx.strokeStyle = `rgba(120,160,220,${0.35*alpha})`;
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(226,232,241,0.6)';
        ctx.shadowBlur = 4;
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();

        // core pass
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(220,235,255,${0.9*alpha})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        ctx.restore();

        // pulse
        const u = (t*0.0006 + a.t*0.001) % 1;
        const px = a.x + (b.x-a.x)*u, py = a.y + (b.y-a.y)*u;
        ctx.fillStyle = COLORS.msg;
        ctx.beginPath(); ctx.arc(px,py,1.8,0,Math.PI*2); ctx.fill();
      }
    }

    // nodes with radius-aware bounce (no clipping)
    for (const n of nodes){
      n.x += n.vx; n.y += n.vy;

      const R = n.r + 2;                 // margin for glow
      if (n.x < R)        { n.x = R;           n.vx = Math.abs(n.vx); }
      if (n.x > W() - R)  { n.x = W() - R;     n.vx = -Math.abs(n.vx); }
      if (n.y < R)        { n.y = R;           n.vy = Math.abs(n.vy); }
      if (n.y > H() - R)  { n.y = H() - R;     n.vy = -Math.abs(n.vy); }

      ctx.fillStyle = COLORS.nodeGlow;
      ctx.beginPath(); ctx.arc(n.x,n.y,n.r+2.2,0,Math.PI*2); ctx.fill();

      ctx.fillStyle = COLORS.node;
      ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fill();
    }

    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
})();
