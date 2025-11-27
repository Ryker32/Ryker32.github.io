import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

function getThemeMode() {
  return document.body?.dataset?.theme === 'light' ? 'light' : 'dark';
}

function getHeroPalette(mode = getThemeMode()) {
  if (mode === 'light') {
    return {
      near: [0.12, 0.22, 0.36],
      far: [0.32, 0.48, 0.68],
      line: [0.22, 0.33, 0.46]
    };
  }
  return {
    near: [0.35, 0.65, 1.0],
    far: [1.0, 0.55, 0.9],
    line: [0.55, 0.8, 1.0]
  };
}

const sharedVertexTransform = /* glsl */ `
  uniform float uTime;
  attribute float aOffset;
  varying float vDepth;

  vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 permute(vec4 x) {
    return mod289(((x * 34.0) + 1.0) * x);
  }

  vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
  }

  float snoise(vec3 v) {
    const vec2  C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(
      permute(
        permute(i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0)
      )
      + i.x + vec4(0.0, i1.x, i2.x, 1.0)
    );

    vec4 j = p - 49.0 * floor(p * 0.02040816326530612);
    vec4 x_ = floor(j * 0.14285714285714285);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * 0.14285714285714285 + 0.07142857142857142;
    vec4 y = y_ * 0.14285714285714285 + 0.07142857142857142;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 g0 = vec3(a0.xy, h.x);
    vec3 g1 = vec3(a0.zw, h.y);
    vec3 g2 = vec3(a1.xy, h.z);
    vec3 g3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(g0, g0), dot(g1, g1), dot(g2, g2), dot(g3, g3)));
    g0 *= norm.x;
    g1 *= norm.y;
    g2 *= norm.z;
    g3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(g0, x0), dot(g1, x1), dot(g2, x2), dot(g3, x3)));
  }

  vec3 curlNoise(vec3 p) {
    const float e = 0.1;
    vec3 dx = vec3(e, 0.0, 0.0);
    vec3 dy = vec3(0.0, e, 0.0);
    vec3 dz = vec3(0.0, 0.0, e);

    float p_x = snoise(p + dy) - snoise(p - dy);
    float p_y = snoise(p + dz) - snoise(p - dz);
    float p_z = snoise(p + dx) - snoise(p - dx);

    return normalize(vec3(p_x, p_y, p_z));
  }
`;

const vertexShader = /* glsl */ `
${sharedVertexTransform}

  void main() {
    float t = uTime * 0.12;
    vec3 pos = position;
    vec3 curl = curlNoise(pos * 0.75 + t) * 0.35;
    pos += curl;

    float angle = t + aOffset;
    float s = sin(angle);
    float c = cos(angle);
    pos.xz = mat2(c, -s, s, c) * pos.xz;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vDepth = clamp(1.0 - (-mvPosition.z - 1.0) / 6.0, 0.0, 1.0);
    float size = (vDepth * 4.5 + 2.5) * (1.0 / -mvPosition.z) * 70.0;
    gl_PointSize = clamp(size, 2.0, 14.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const lineVertexShader = /* glsl */ `
${sharedVertexTransform}

  void main() {
    float t = uTime * 0.12;
    vec3 pos = position;
    vec3 curl = curlNoise(pos * 0.75 + t) * 0.35;
    pos += curl;

    float angle = t + aOffset;
    float s = sin(angle);
    float c = cos(angle);
    pos.xz = mat2(c, -s, s, c) * pos.xz;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vDepth = clamp(1.0 - (-mvPosition.z - 1.0) / 6.0, 0.0, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorNear;
  uniform vec3 uColorFar;
  varying float vDepth;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float dist = dot(uv, uv);
    if (dist > 0.25) discard;
    float alpha = smoothstep(0.25, 0.0, dist);
    vec3 base = mix(uColorNear, uColorFar, vDepth);
    gl_FragColor = vec4(base, alpha * (0.25 + vDepth * 0.75));
  }
`;

const lineFragmentShader = /* glsl */ `
  varying float vDepth;
  uniform vec3 uLineColor;
  void main() {
    float alpha = mix(0.05, 0.35, vDepth);
    gl_FragColor = vec4(uLineColor, alpha);
  }
`;

function initHero3D() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const prefersMotion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    });
  } catch (error) {
    console.error('WebGL unavailable, skipping hero animation.', error);
    canvas.remove();
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 6);

  const group = new THREE.Group();
  scene.add(group);

  const PARTICLE_COUNT = prefersMotion ? 300 : 150;
  const LINK_DISTANCE = prefersMotion ? 0.55 : 0.45;
  const MAX_CONNECTIONS = prefersMotion ? 4 : 2;

  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const offsets = new Float32Array(PARTICLE_COUNT);
  const palette = getHeroPalette();

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const radius = 1.2 + Math.random() * 1.5;
    const theta = Math.random() * Math.PI * 2;
    const v = Math.random() * 2 - 1;
    const phi = Math.acos(v);
    const sinPhi = Math.sin(phi);
    positions[i * 3] = radius * sinPhi * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.cos(phi);
    positions[i * 3 + 2] = radius * sinPhi * Math.sin(theta);
    offsets[i] = Math.random() * Math.PI * 2;
  }

  const connectionCounts = new Array(PARTICLE_COUNT).fill(0);
  const linkPositions = [];
  const linkOffsets = [];
  const linkDistanceSq = LINK_DISTANCE * LINK_DISTANCE;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const baseIndex = i * 3;
    for (let j = i + 1; j < PARTICLE_COUNT; j++) {
      if (connectionCounts[i] >= MAX_CONNECTIONS) break;
      if (connectionCounts[j] >= MAX_CONNECTIONS) continue;
      const otherIndex = j * 3;
      const dx = positions[baseIndex] - positions[otherIndex];
      const dy = positions[baseIndex + 1] - positions[otherIndex + 1];
      const dz = positions[baseIndex + 2] - positions[otherIndex + 2];
      const distSq = dx * dx + dy * dy + dz * dz;
      if (distSq <= linkDistanceSq) {
        linkPositions.push(
          positions[baseIndex],
          positions[baseIndex + 1],
          positions[baseIndex + 2],
          positions[otherIndex],
          positions[otherIndex + 1],
          positions[otherIndex + 2]
        );
        linkOffsets.push(offsets[i], offsets[j]);
        connectionCounts[i]++;
        connectionCounts[j]++;
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 1));

  const uniforms = {
    uTime: { value: 0 },
    uColorNear: { value: new THREE.Color().fromArray(palette.near) },
    uColorFar: { value: new THREE.Color().fromArray(palette.far) }
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const points = new THREE.Points(geometry, material);
  group.add(points);

  let lineMaterial = null;

  if (linkPositions.length > 0) {
    const linkGeometry = new THREE.BufferGeometry();
    linkGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linkPositions), 3));
    linkGeometry.setAttribute('aOffset', new THREE.BufferAttribute(new Float32Array(linkOffsets), 1));

    lineMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: uniforms.uTime,
        uLineColor: { value: new THREE.Color().fromArray(palette.line) }
      },
      vertexShader: lineVertexShader,
      fragmentShader: lineFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const links = new THREE.LineSegments(linkGeometry, lineMaterial);
    group.add(links);
  }

  function applyThemePalette(mode = getThemeMode()) {
    const next = getHeroPalette(mode);
    uniforms.uColorNear.value.setRGB(next.near[0], next.near[1], next.near[2]);
    uniforms.uColorFar.value.setRGB(next.far[0], next.far[1], next.far[2]);
    if (lineMaterial) {
      lineMaterial.uniforms.uLineColor.value.setRGB(next.line[0], next.line[1], next.line[2]);
    }
  }

  applyThemePalette();

  const themeObserver = new MutationObserver(() => applyThemePalette());
  themeObserver.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });

  const pointer = new THREE.Vector2(0, 0);
  window.addEventListener('pointermove', (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  const cursorMedia = window.matchMedia('(pointer: fine)');
  if (!cursorMedia.matches) {
    document.body.classList.add('is-coarse-pointer');
  }

  function initCursor() {
    if (!cursorMedia.matches) return;
    const cursor = document.createElement('div');
    cursor.className = 'cursor-target';
    document.body.appendChild(cursor);

    document.addEventListener('pointermove', (event) => {
      cursor.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
    });

    const bindTargets = () => {
      const interactiveTargets = document.querySelectorAll('a, button, .project-card, .pill-link, .glass-nav__links a, .glass-nav__toggle');
      interactiveTargets.forEach((node) => {
        if (node.dataset.cursorBound) return;
        node.dataset.cursorBound = 'true';
        node.addEventListener('mouseenter', () => cursor.classList.add('cursor-target--active'));
        node.addEventListener('mouseleave', () => cursor.classList.remove('cursor-target--active'));
      });
    };

    bindTargets();
    const targetObserver = new MutationObserver(() => bindTargets());
    targetObserver.observe(document.body, { childList: true, subtree: true });
  }

  initCursor();

  function handleResize() {
    const width = canvas.clientWidth || canvas.offsetWidth;
    const height = canvas.clientHeight || canvas.offsetHeight;
    if (width === 0 || height === 0) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  handleResize();
  window.addEventListener('resize', handleResize);

  let rotationX = 0;
  let rotationY = 0;

  function render(time) {
    uniforms.uTime.value = time * 0.001;
    const easing = prefersMotion ? 0.08 : 0;
    rotationX += ((prefersMotion ? pointer.y * 0.7 : 0) - rotationX) * easing;
    rotationY += ((prefersMotion ? -pointer.x * 0.7 : 0) - rotationY) * easing;
    group.rotation.x = rotationX;
    group.rotation.y = rotationY;
    renderer.render(scene, camera);
    if (prefersMotion) {
      requestAnimationFrame(render);
    }
  }

  requestAnimationFrame(render);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHero3D);
} else {
  initHero3D();
}

