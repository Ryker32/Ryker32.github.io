(() => {
  const c = document.getElementById('mas-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  const COLORS = {
    bg: '#0b0f14',
    edge: 'rgba(43,58,74,0.5)',   // muted blue-gray
    node: '#5aa7ff',              // blue agents
    nodeGlow: 'rgba(90,167,255,0.35)',
    msg: '#ffffff'                // white message pulses
  };

  function resize() {
    c.width = c.clientWidth * DPR;
    c.height = c.clientHeight * DPR;
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }
  addEventListener('resize', resize, { passive:true });
  resize();

  const N = 42;
  const nodes = Array.from({length:N}, () => ({
    x: Math.random() * c.clientWidth,
    y: Math.random() * c.clientHeight,
    vx:(Math.random()-0.5)*0.5,
    vy:(Math.random()-0.5)*0.5,
    r: 2 + Math.random()*2,
    t: Math.random()*1000
  }));

  function step(t) {
    // background
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0,0,c.clientWidth,c.clientHeight);

    // edges + message pulses
    for (let i=0;i<N;i++){
      for (let j=i+1;j<N;j++){
        const a = nodes[i], b = nodes[j];
        const dx=a.x-b.x, dy=a.y-b.y, d=Math.hypot(dx,dy);
        if (d<140){
          const alpha = 1 - d/140;
          ctx.strokeStyle = `rgba(43,58,74,${0.6*alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();

          // white message traveling along edge
          const u = ( (t*0.0006 + (a.t*0.001)) % 1 );
          const px = a.x + (b.x-a.x)*u, py = a.y + (b.y-a.y)*u;
          ctx.fillStyle = COLORS.msg;
          ctx.beginPath(); ctx.arc(px,py,1.5,0,Math.PI*2); ctx.fill();
        }
      }
    }

    // nodes
    for (const n of nodes){
      n.x += n.vx; n.y += n.vy;
      if (n.x<0||n.x>c.clientWidth) n.vx*=-1;
      if (n.y<0||n.y>c.clientHeight) n.vy*=-1;

      // glow
      const glow = 0.9 + 0.1*Math.sin(t*0.003 + n.t);
      ctx.fillStyle = COLORS.nodeGlow;
      ctx.beginPath(); ctx.arc(n.x,n.y,n.r+2.2,0,Math.PI*2); ctx.fill();

      // core
      ctx.fillStyle = COLORS.node;
      ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fill();
    }
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
})();
