(() => {
  const c = document.getElementById('mas-canvas');
  if(!c) return;
  const ctx = c.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    c.width = c.clientWidth * DPR;
    c.height = c.clientHeight * DPR;
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }
  window.addEventListener('resize', resize, {passive:true});
  resize();

  const N = 36, nodes = [];
  for (let i=0;i<N;i++) {
    nodes.push({
      x: Math.random()*c.clientWidth,
      y: Math.random()*c.clientHeight,
      vx:(Math.random()-0.5)*0.6,
      vy:(Math.random()-0.5)*0.6,
      r: 2 + Math.random()*2,
      t: Math.random()*1000
    });
  }

  function step(t) {
    ctx.clearRect(0,0,c.clientWidth,c.clientHeight);
    // edges
    for (let i=0;i<N;i++){
      for (let j=i+1;j<N;j++){
        const a = nodes[i], b = nodes[j];
        const dx=a.x-b.x, dy=a.y-b.y, d=Math.hypot(dx,dy);
        if (d<140){
          const alpha = 1 - d/140;
          ctx.strokeStyle = `rgba(17,17,17,${0.18*alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();

          // pulse "message" traveling the edge
          const u = ((t*0.0006 + (a.t*0.001)) % 1);
          const px = a.x + (b.x-a.x)*u, py = a.y + (b.y-a.y)*u;
          ctx.fillStyle = `rgba(17,17,17,${0.5*alpha})`;
          ctx.beginPath(); ctx.arc(px,py,1.6,0,Math.PI*2); ctx.fill();
        }
      }
    }
    // nodes
    for (const n of nodes){
      n.x += n.vx; n.y += n.vy;
      if (n.x<0||n.x>c.clientWidth) n.vx*=-1;
      if (n.y<0||n.y>c.clientHeight) n.vy*=-1;
      const glow = 0.25 + 0.25*Math.sin(t*0.003 + n.t);
      ctx.fillStyle = `rgba(17,17,17,${0.7})`;
      ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = `rgba(17,17,17,${glow})`;
      ctx.beginPath(); ctx.arc(n.x,n.y,n.r+1.2,0,Math.PI*2); ctx.fill();
    }
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
})();
