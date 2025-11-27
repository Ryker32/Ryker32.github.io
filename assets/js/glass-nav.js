(function () {
  const nav = document.querySelector('.glass-nav');
  const mapNode = document.getElementById('glass-nav-map');
  const baseDisp = document.getElementById('glass-nav-base-disp');
  const redDisp = document.getElementById('glass-nav-red-disp');
  const greenDisp = document.getElementById('glass-nav-green-disp');
  const blueDisp = document.getElementById('glass-nav-blue-disp');
  const gaussian = document.getElementById('glass-nav-gaussian');
  if (!nav || !mapNode || !baseDisp || !redDisp || !greenDisp || !blueDisp || !gaussian) return;

  let rafId = null;

  function clamp(value, min) {
    return Math.max(value, min);
  }

  function buildSvg(width, height) {
    const radius = Math.round(height / 2);
    const edge = clamp(Math.round(Math.min(width, height) * 0.12), 6);
    const innerWidth = Math.max(0, width - edge * 2);
    const innerHeight = Math.max(0, height - edge * 2);
    const innerRadius = Math.max(0, radius - edge);
    const blur = (Math.min(width, height) * 0.08).toFixed(2);
    const opacity = 0.32;

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
        <defs>
          <linearGradient id="grad-r" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="#ff4d4d"/>
          </linearGradient>
          <linearGradient id="grad-b" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="#5f7bff"/>
          </linearGradient>
          <filter id="inner-blur" color-interpolation-filters="sRGB">
            <feGaussianBlur stdDeviation="${blur}" />
          </filter>
        </defs>
        <rect width="${width}" height="${height}" fill="#000000"/>
        <rect width="${width}" height="${height}" rx="${radius}" fill="url(#grad-r)"/>
        <rect width="${width}" height="${height}" rx="${radius}" fill="url(#grad-b)" style="mix-blend-mode:difference"/>
        <rect x="${edge}" y="${edge}" width="${innerWidth}" height="${innerHeight}" rx="${innerRadius}"
          fill="rgba(255,255,255,${opacity})" filter="url(#inner-blur)"/>
      </svg>
    `;
  }

  function updateMap() {
    const rect = nav.getBoundingClientRect();
    const width = clamp(Math.round(rect.width), 10);
    const height = clamp(Math.round(rect.height), 10);
    const svg = buildSvg(width, height);
    const dataUrl = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    if (mapNode.getAttribute('href') !== dataUrl) {
      mapNode.setAttribute('href', dataUrl);
    }
  }

  function scheduleUpdate() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(updateMap);
  }

  function updateDisplacement() {
    const BASE_SCALE = -80;
    const RED_OFFSET = -120;
    const GREEN_OFFSET = -60;
    const BLUE_OFFSET = -20;
    baseDisp.setAttribute('scale', BASE_SCALE.toString());
    redDisp.setAttribute('scale', (BASE_SCALE + RED_OFFSET).toString());
    greenDisp.setAttribute('scale', (BASE_SCALE + GREEN_OFFSET).toString());
    blueDisp.setAttribute('scale', (BASE_SCALE + BLUE_OFFSET).toString());
    gaussian.setAttribute('stdDeviation', '1.2');
  }

  scheduleUpdate();
  updateDisplacement();

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(nav);
  } else {
    window.addEventListener('resize', scheduleUpdate);
  }
})();

