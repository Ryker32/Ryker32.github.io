(function () {
  const nav = document.querySelector('.glass-surface');
  const mapNode = document.getElementById('glass-nav-map');
  const redDisp = document.getElementById('glass-nav-red');
  const greenDisp = document.getElementById('glass-nav-green');
  const blueDisp = document.getElementById('glass-nav-blue');
  if (!nav || !mapNode || !redDisp || !greenDisp || !blueDisp) return;

  let rafId = null;

  function clamp(value, min) {
    return Math.max(value, min);
  }

  function buildSvg(width, height) {
    const radius = Math.round(height / 2);
    const ringWidth = Math.max(6, Math.round(height * 0.18));
    const stops = [
      '#ff6ec4',
      '#7873f5',
      '#35c7ff',
      '#f4ea8e',
      '#ff6ec4'
    ];

    const gradientStops = stops
      .map((color, index) => `<stop offset="${(index / (stops.length - 1)) * 100}%" stop-color="${color}" />`)
      .join('');

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
        <defs>
          <linearGradient id="outer-grad" x1="0" y1="0" x2="1" y2="1">
            ${gradientStops}
          </linearGradient>
          <radialGradient id="inner-fade" cx="0.5" cy="0.5" r="0.65">
            <stop offset="60%" stop-color="rgba(0,0,0,0)"/>
            <stop offset="100%" stop-color="rgba(0,0,0,1)"/>
          </radialGradient>
        </defs>

        <rect width="${width}" height="${height}" rx="${radius}" fill="#000000"/>
        <rect width="${width}" height="${height}" rx="${radius}" fill="url(#outer-grad)"/>
        <rect x="${ringWidth}" y="${ringWidth}" width="${width - ringWidth * 2}" height="${height - ringWidth * 2}" rx="${radius - ringWidth}" fill="url(#inner-fade)"/>
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
    redDisp.setAttribute('scale', '-180');
    greenDisp.setAttribute('scale', '-150');
    blueDisp.setAttribute('scale', '-120');
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

