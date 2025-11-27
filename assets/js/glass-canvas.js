(function () {
  const nav = document.querySelector('.glass-surface');
  const canvas = nav?.querySelector('.glass-surface__canvas');
  if (!nav || !canvas || typeof html2canvas === 'undefined') return;

  const ctx = canvas.getContext('2d');
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  const colorCanvas = document.createElement('canvas');
  const colorCtx = colorCanvas.getContext('2d');
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

  function distortSlices(destCtx, source, sliceWidth, amplitude, dpr) {
    destCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    for (let x = 0; x < tempCanvas.width; x += sliceWidth) {
      const normalized = x / tempCanvas.width;
      const towardEdge = 1 - Math.abs(normalized - 0.5) * 2;
      const influence = Math.pow(Math.max(towardEdge, 0), 1.5);
      const direction = normalized < 0.5 ? -1 : 1;
      const offset = direction * influence * amplitude * dpr;
      tempCtx.drawImage(
        source,
          x, 0, sliceWidth, tempCanvas.height,
          x + offset, 0, sliceWidth, tempCanvas.height
      );
    }
    destCtx.drawImage(tempCanvas, 0, 0);
  }

  function render(source, dpr) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCtx.drawImage(source, 0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.filter = 'blur(10px)';
    distortSlices(ctx, tempCanvas, Math.max(2, Math.round(4 * dpr)), 12, dpr);
    ctx.restore();

    colorCanvas.width = canvas.width;
    colorCanvas.height = canvas.height;
    colorCtx.clearRect(0, 0, canvas.width, canvas.height);
    distortSlices(colorCtx, tempCanvas, Math.max(2, Math.round(4 * dpr)), 18, dpr);

    ctx.globalCompositeOperation = 'screen';
    ['rgba(255,130,150,0.45)', 'rgba(120,200,255,0.4)', 'rgba(255,220,140,0.35)'].forEach((color, index) => {
      ctx.save();
      ctx.globalAlpha = 0.6 - index * 0.1;
      ctx.drawImage(colorCanvas, 0, 0);
      ctx.globalCompositeOperation = 'source-in';
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    });
    ctx.globalCompositeOperation = 'source-over';
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
    }, 150);
  }, { passive: true });

  requestCapture();
})();

