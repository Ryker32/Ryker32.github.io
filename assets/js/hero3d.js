import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

console.log('hero3d.js module loaded');

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

  attribute vec3 aStart;
  attribute vec3 aTarget;
  uniform float uReveal;

  void main() {
    float t = uTime * 0.12;

    // Lerp from clustered start to full layout
    vec3 pos = mix(aStart, aTarget, uReveal);

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

  attribute vec3 aStart;
  attribute vec3 aTarget;
  uniform float uReveal;

  void main() {
    float t = uTime * 0.12;

    vec3 pos = mix(aStart, aTarget, uReveal);

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
  console.log('initHero3D called');
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) {
    console.warn('heroCanvas not found');
    return;
  }
  console.log('heroCanvas found:', canvas);

  const prefersMotion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animationAlreadyShown = sessionStorage.getItem('siteAnimationShown') === 'true';

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    });
    renderer.setClearColor(0x000000, 0); // Transparent background
    console.log('WebGL renderer created successfully');
  } catch (error) {
    console.error('WebGL unavailable, skipping hero animation.', error);
    canvas.remove();
    return;
  }

  const PARTICLE_COUNT = prefersMotion ? 320 : 180;
  const LINK_DISTANCE = prefersMotion ? 0.75 : 0.65; // slightly longer to guarantee links
  const MAX_CONNECTIONS = 3;                          // aim for 2-3 closest connections

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 6);
  const group = new THREE.Group();
  group.scale.setScalar(1.0);
  scene.add(group);
  // Store reference for external access
  canvas.__heroGroup = group;

  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const offsets = new Float32Array(PARTICLE_COUNT);
  const startPositions = new Float32Array(PARTICLE_COUNT * 3);
  const finalPositions = new Float32Array(PARTICLE_COUNT * 3);
  const palette = getHeroPalette();

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const radius = 1.4 + Math.random() * 1.8; // final spread radius
    const theta = Math.random() * Math.PI * 2;
    const v = Math.random() * 2 - 1;
    const phi = Math.acos(v);
    const sinPhi = Math.sin(phi);
    const x = radius * sinPhi * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * sinPhi * Math.sin(theta);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    finalPositions[i * 3] = x;
    finalPositions[i * 3 + 1] = y;
    finalPositions[i * 3 + 2] = z;

    // Clustered start on a small sphere
    const len = Math.max(Math.hypot(x, y, z), 1e-4);
    const rStart = 0.04; // tight clustered orb start radius
    startPositions[i * 3] = (x / len) * rStart;
    startPositions[i * 3 + 1] = (y / len) * rStart;
    startPositions[i * 3 + 2] = (z / len) * rStart;

    offsets[i] = Math.random() * Math.PI * 2;
  }

  const connectionCounts = new Array(PARTICLE_COUNT).fill(0);
  const linkPositions = [];
  const linkStartPositions = [];
  const linkTargetPositions = [];
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
        // line positions (final)
        linkPositions.push(
          positions[baseIndex],
          positions[baseIndex + 1],
          positions[baseIndex + 2],
          positions[otherIndex],
          positions[otherIndex + 1],
          positions[otherIndex + 2]
        );
        // line start positions (clustered)
        linkStartPositions.push(
          startPositions[baseIndex],
          startPositions[baseIndex + 1],
          startPositions[baseIndex + 2],
          startPositions[otherIndex],
          startPositions[otherIndex + 1],
          startPositions[otherIndex + 2]
        );
        // line target positions (same as final)
        linkTargetPositions.push(
          finalPositions[baseIndex],
          finalPositions[baseIndex + 1],
          finalPositions[baseIndex + 2],
          finalPositions[otherIndex],
          finalPositions[otherIndex + 1],
          finalPositions[otherIndex + 2]
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
  geometry.setAttribute('aStart', new THREE.BufferAttribute(startPositions, 3));
  geometry.setAttribute('aTarget', new THREE.BufferAttribute(finalPositions, 3));

  const uniforms = {
    uTime: { value: 0 },
    uReveal: { value: animationAlreadyShown ? 1 : 0 },
    uColorNear: { value: new THREE.Color().fromArray(palette.near) },
    uColorFar: { value: new THREE.Color().fromArray(palette.far) }
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    opacity: 1.0
  });

  const points = new THREE.Points(geometry, material);
  group.add(points);
  
  console.log('Particle group created - scale:', group.scale.x, 'particles:', PARTICLE_COUNT, 'initial opacity:', material.opacity);

  let lineMaterial = null;

  if (linkPositions.length > 0) {
    const linkGeometry = new THREE.BufferGeometry();
    linkGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linkPositions), 3));
    linkGeometry.setAttribute('aStart', new THREE.BufferAttribute(new Float32Array(linkStartPositions), 3));
    linkGeometry.setAttribute('aTarget', new THREE.BufferAttribute(new Float32Array(linkTargetPositions), 3));
    linkGeometry.setAttribute('aOffset', new THREE.BufferAttribute(new Float32Array(linkOffsets), 1));

    lineMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: uniforms.uTime,
        uReveal: uniforms.uReveal,
        uLineColor: { value: new THREE.Color().fromArray(palette.line) }
      },
      vertexShader: lineVertexShader,
      fragmentShader: lineFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.8 // Start visible so we can see the orb
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

  function handleResize() {
    const width = canvas.clientWidth || canvas.offsetWidth;
    const height = canvas.clientHeight || canvas.offsetHeight;
    console.log('handleResize - canvas size:', width, 'x', height);
    if (width === 0 || height === 0) {
      console.warn('Canvas has zero size!', { 
        clientWidth: canvas.clientWidth, 
        offsetWidth: canvas.offsetWidth, 
        clientHeight: canvas.clientHeight, 
        offsetHeight: canvas.offsetHeight,
        parentWidth: canvas.parentElement?.clientWidth,
        parentHeight: canvas.parentElement?.clientHeight
      });
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    console.log('Canvas resized successfully');
  }

  handleResize();
  window.addEventListener('resize', handleResize);

  let rotationX = 0;
  let rotationY = 0;

  let renderCallCount = 0;
  function render(time) {
    uniforms.uTime.value = time * 0.001;
    const easing = prefersMotion ? 0.08 : 0;
    rotationX += ((prefersMotion ? pointer.y * 0.7 : 0) - rotationX) * easing;
    rotationY += ((prefersMotion ? -pointer.x * 0.7 : 0) - rotationY) * easing;
    group.rotation.x = rotationX;
    group.rotation.y = rotationY;
    renderer.render(scene, camera);
    renderCallCount++;
    if (renderCallCount === 1) {
      console.log('First render call completed - canvas size:', renderer.domElement.width, 'x', renderer.domElement.height);
      console.log('Scene children:', scene.children.length, 'Group children:', group.children.length);
      console.log('Group scale:', group.scale.x, 'Material opacity:', material.opacity);
    }
    if (renderCallCount === 10) {
      console.log('10 frames rendered - checking if particles are visible');
    }
    requestAnimationFrame(render);
  }
  
  console.log('Render function created, starting render loop');

  // Make canvas visible immediately
  const canvasElement = document.getElementById('heroCanvas');
  if (canvasElement && canvasElement.parentElement) {
    canvasElement.parentElement.style.opacity = '1';
    console.log('Canvas parent opacity set to 1');
  } else {
    console.warn('Canvas or parent not found for opacity setting');
  }

  // Reveal animation - lerp positions from clustered start to full layout
  function animateReveal() {
    console.log('Starting reveal animation');
    const startTime = performance.now();
    const duration = 1200; // 1.2 seconds

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function update() {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      uniforms.uReveal.value = eased;
      if (lineMaterial) {
        lineMaterial.uniforms.uReveal.value = eased;
      }

      if (Math.floor(progress * 5) !== Math.floor((progress - 0.01) * 5)) {
        console.log(`Reveal progress: ${Math.floor(progress * 100)}% - uReveal: ${uniforms.uReveal.value.toFixed(3)}`);
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        uniforms.uReveal.value = 1.0;
        if (lineMaterial) {
          lineMaterial.uniforms.uReveal.value = 1.0;
        }
        console.log('Reveal animation complete');
        document.dispatchEvent(new Event('hero-reveal-complete'));
      }
    }

    requestAnimationFrame(update);
  }

  // Start render loop - particles start as visible orb
  console.log('Starting render loop - orb should be visible at scale', group.scale.x, 'opacity:', material.opacity);
  console.log('Scene has', scene.children.length, 'children');
  console.log('Group has', group.children.length, 'children');
  requestAnimationFrame(render);
  
  // Run reveal animation immediately on first load; skip if already shown this session
  if (!animationAlreadyShown) {
    animateReveal(); // start right away so we don't sit on a blank screen
  } else {
    uniforms.uReveal.value = 1.0;
    if (lineMaterial) lineMaterial.uniforms.uReveal.value = 1.0;
    console.log('Animation already shown, skipping reveal - particles already at full layout');
    document.dispatchEvent(new Event('hero-reveal-complete'));
  }
}

  // Signal that hero is ready (scene built)
  document.dispatchEvent(new Event('hero-ready'));

// Initialize once DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    try {
      initHero3D();
    } catch (error) {
      console.error('Error initializing hero3d:', error);
    }
  });
} else {
  try {
    initHero3D();
  } catch (error) {
    console.error('Error initializing hero3d:', error);
  }
}

