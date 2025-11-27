(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const XLINK = 'http://www.w3.org/1999/xlink';
  const DEFAULTS = {
    backgroundOpacity: 0.25,
    saturation: 1,
    borderRadius: 50,
    borderWidth: 0.07,
    brightness: 45,
    opacity: 0.93,
    blur: 11,
    displace: 1.5,
    distortionScale: -160,
    redOffset: 0,
    greenOffset: 10,
    blueOffset: 20,
    xChannel: 'R',
    yChannel: 'G',
    mixBlendMode: 'difference'
  };

  const instances = [];
  let counter = 0;

  function parseNumber(value, fallback) {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  }

  function readConfig(el) {
    return {
      backgroundOpacity: parseNumber(el.dataset.glassBackgroundOpacity, DEFAULTS.backgroundOpacity),
      saturation: parseNumber(el.dataset.glassSaturation, DEFAULTS.saturation),
      borderRadius: parseNumber(el.dataset.glassBorderRadius, DEFAULTS.borderRadius),
      borderWidth: parseNumber(el.dataset.glassBorderWidth, DEFAULTS.borderWidth),
      brightness: parseNumber(el.dataset.glassBrightness, DEFAULTS.brightness),
      opacity: parseNumber(el.dataset.glassOpacity, DEFAULTS.opacity),
      blur: parseNumber(el.dataset.glassBlur, DEFAULTS.blur),
      displace: parseNumber(el.dataset.glassDisplace, DEFAULTS.displace),
      distortionScale: parseNumber(el.dataset.glassDistortionScale, DEFAULTS.distortionScale),
      redOffset: parseNumber(el.dataset.glassRedOffset, DEFAULTS.redOffset),
      greenOffset: parseNumber(el.dataset.glassGreenOffset, DEFAULTS.greenOffset),
      blueOffset: parseNumber(el.dataset.glassBlueOffset, DEFAULTS.blueOffset),
      xChannel: el.dataset.glassXChannel || DEFAULTS.xChannel,
      yChannel: el.dataset.glassYChannel || DEFAULTS.yChannel,
      mixBlendMode: el.dataset.glassBlend || DEFAULTS.mixBlendMode
    };
  }

  function createFilterElements(ids) {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.classList.add('glass-surface__filter');

    const defs = document.createElementNS(NS, 'defs');
    const filter = document.createElementNS(NS, 'filter');
    filter.setAttribute('id', ids.filter);
    filter.setAttribute('color-interpolation-filters', 'sRGB');
    filter.setAttribute('x', '0%');
    filter.setAttribute('y', '0%');
    filter.setAttribute('width', '100%');
    filter.setAttribute('height', '100%');

    const feImage = document.createElementNS(NS, 'feImage');
    feImage.dataset.role = 'map';
    feImage.setAttribute('preserveAspectRatio', 'none');
    feImage.setAttribute('result', 'map');
    filter.appendChild(feImage);

    function makeChannel(role, colorValues) {
      const disp = document.createElementNS(NS, 'feDisplacementMap');
      disp.dataset.role = role;
      disp.setAttribute('in', 'SourceGraphic');
      disp.setAttribute('in2', 'map');
      disp.setAttribute('result', `disp${role}`);
      filter.appendChild(disp);

      const matrix = document.createElementNS(NS, 'feColorMatrix');
      matrix.setAttribute('in', `disp${role}`);
      matrix.setAttribute('type', 'matrix');
      matrix.setAttribute('values', colorValues);
      matrix.setAttribute('result', role);
      filter.appendChild(matrix);
      return disp;
    }

    const red = makeChannel('red', '1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0');
    const green = makeChannel('green', '0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0');
    const blue = makeChannel('blue', '0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0');

    const blendRG = document.createElementNS(NS, 'feBlend');
    blendRG.setAttribute('in', 'red');
    blendRG.setAttribute('in2', 'green');
    blendRG.setAttribute('mode', 'screen');
    blendRG.setAttribute('result', 'rg');
    filter.appendChild(blendRG);

    const blendRGB = document.createElementNS(NS, 'feBlend');
    blendRGB.setAttribute('in', 'rg');
    blendRGB.setAttribute('in2', 'blue');
    blendRGB.setAttribute('mode', 'screen');
    blendRGB.setAttribute('result', 'output');
    filter.appendChild(blendRGB);

    const gaussian = document.createElementNS(NS, 'feGaussianBlur');
    gaussian.dataset.role = 'gaussian';
    gaussian.setAttribute('in', 'output');
    gaussian.setAttribute('stdDeviation', '0.7');
    filter.appendChild(gaussian);

    defs.appendChild(filter);
    svg.appendChild(defs);

    return { svg, feImage, red, green, blue, gaussian };
  }

  function buildDisplacementMap(rect, cfg, ids) {
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const edgeSize = Math.min(width, height) * (cfg.borderWidth * 0.5);

    return `data:image/svg+xml,${encodeURIComponent(`
      <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${ids.redGrad}" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <linearGradient id="${ids.blueGrad}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="black"/>
        <rect width="${width}" height="${height}" rx="${cfg.borderRadius}" fill="url(#${ids.redGrad})"/>
        <rect width="${width}" height="${height}" rx="${cfg.borderRadius}" fill="url(#${ids.blueGrad})" style="mix-blend-mode:${cfg.mixBlendMode}"/>
        <rect x="${edgeSize}" y="${edgeSize}" width="${width - edgeSize * 2}" height="${height - edgeSize * 2}" rx="${cfg.borderRadius}"
          fill="hsl(0 0% ${cfg.brightness}% / ${cfg.opacity})" style="filter:blur(${cfg.blur}px)"/>
      </svg>
    `)}`;
  }

  function applyConfig(instance) {
    const { cfg, red, green, blue, gaussian } = instance;
    [red, green, blue].forEach((node, index) => {
      const offset = [cfg.redOffset, cfg.greenOffset, cfg.blueOffset][index];
      node.setAttribute('scale', String(cfg.distortionScale + offset));
      node.setAttribute('xChannelSelector', cfg.xChannel);
      node.setAttribute('yChannelSelector', cfg.yChannel);
    });
    gaussian.setAttribute('stdDeviation', String(cfg.displace));
  }

  function updateMap(instance) {
    const rect = instance.el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dataUrl = buildDisplacementMap(rect, instance.cfg, instance.ids);
    instance.feImage.setAttributeNS(XLINK, 'href', dataUrl);
  }

  function initGlassElement(el) {
    const cfg = readConfig(el);
    const ids = {
      filter: `glass-filter-${++counter}`,
      redGrad: `glass-red-grad-${counter}`,
      blueGrad: `glass-blue-grad-${counter}`
    };

    el.style.setProperty('--glass-frost', cfg.backgroundOpacity);
    el.style.setProperty('--glass-saturation', cfg.saturation);
    el.style.setProperty('--filter-id', `url(#${ids.filter})`);
    el.style.borderRadius = `${cfg.borderRadius}px`;

    const { svg, feImage, red, green, blue, gaussian } = createFilterElements(ids);
    el.insertBefore(svg, el.firstChild);

    const instance = { el, cfg, ids, feImage, red, green, blue, gaussian };
    applyConfig(instance);
    updateMap(instance);

    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(() => requestAnimationFrame(() => updateMap(instance)));
      ro.observe(el);
      instance.disconnect = () => ro.disconnect();
    } else {
      window.addEventListener('resize', () => updateMap(instance));
    }

    instances.push(instance);
  }

  function initAll() {
    document.querySelectorAll('[data-glass]').forEach(initGlassElement);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();

