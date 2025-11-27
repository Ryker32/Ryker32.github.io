(function () {
  const nav = document.querySelector('.glass-surface');
  const canvas = nav?.querySelector('.glass-surface__canvas');
  if (!nav || !canvas || typeof html2canvas === 'undefined') return;

  const ctx = canvas.getContext('2d');
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  let capturing = false;
  let scrollTimeout = null;

  function setCanvasSize(rect) {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    return dpr;
  }

  function drawChannel(source, color, offsetX, offsetY, dpr) {
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.globalCompositeOperation = 'source-over';
    tempCtx.drawImage(source, 0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.globalCompositeOperation = 'source-in';
    tempCtx.fillStyle = color;
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.globalCompositeOperation = 'source-over';
    ctx.drawImage(
      tempCanvas,
      offsetX * dpr,
      offsetY * dpr
    );
  }

  function render(source, dpr) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.filter = 'blur(14px)';
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    drawChannel(source, 'rgba(255,120,160,0.55)', -5, -2, dpr);
    drawChannel(source, 'rgba(120,180,255,0.5)', 4, 1, dpr);
    drawChannel(source, 'rgba(255,220,140,0.45)', 0, 3, dpr);
    ctx.restore();
  }

  async function capture() {
    if (capturing) return;
    capturing = true;
    const rect = nav.getBoundingClientRect();
    const dpr = setCanvasSize(rect);
    try {
      const shot = await html2canvas(document.body, {
        backgroundColor: null,
        x: window.scrollX + rect.left,
        y: window.scrollY + rect.top,
        width: rect.width,
        height: rect.height,
        scale: dpr,
        useCORS: true,
        logging: false
      });
      render(shot, dpr);
    } catch (error) {
      console.error('Glass capture failed', error);
    } finally {
      capturing = false;
    }
  }

  const requestCapture = () => {
    if (!capturing) capture();
  };

  window.addEventListener('resize', requestCapture, { passive: true });
  window.addEventListener('scroll', () => {
    if (scrollTimeout) return;
    scrollTimeout = setTimeout(() => {
      scrollTimeout = null;
      requestCapture();
    }, 200);
  }, { passive: true });

  requestCapture();
})();

