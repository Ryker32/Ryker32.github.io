import * as THREE from 'https://cdn.skypack.dev/three@0.160.0';

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

const PARTICLE_COUNT = prefersMotion ? 24000 : 8000;
const positions = new Float32Array(PARTICLE_COUNT * 3);
const offsets = new Float32Array(PARTICLE_COUNT);

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

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 1));

const vertexShader = /* glsl */ `
  uniform float uTime;
  attribute float aOffset;
  varying float vDepth;

  vec3 hash33(vec3 p) {
    p = vec3( dot(p, vec3(127.1, 311.7, 74.7)),
              dot(p, vec3(269.5, 183.3, 246.1)),
              dot(p, vec3(113.5, 271.9, 124.6)) );
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float snoise(vec3 p){
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(p + dot(p, C.yyy) );
    vec3 x0 =   p - i + dot(i, C.xxx) ;

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod(i, 289.0 );
    vec4 p0 = vec4(i.xyz, i.w);

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    m = m * m;

    vec4 x = 2.0 * fract(p0 * C.www) - 1.0;
    vec4 h = abs(x) - 0.5;
    vec4 ox = floor(x + 0.5);
    vec4 a0 = x - ox;

    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);

    vec4 g0 = vec4(a0.x, h.x, a0.y, h.y);
    vec4 g1 = vec4(a0.z, h.z, a0.w, h.w);

    vec4 norm = inversesqrt(vec4(dot(g0.xy, g0.xy), dot(g0.zw, g0.zw), dot(g1.xy, g1.xy), dot(g1.zw, g1.zw)));
    g0 *= norm.xxyy;
    g1 *= norm.zzww;

    float n0 = dot(g0.xy, vec2(x0.x, x0.y));
    float n1 = dot(g0.zw, vec2(x1.x, x1.y));
    float n2 = dot(g1.xy, vec2(x2.x, x2.y));
    float n3 = dot(g1.zw, vec2(x3.x, x3.y));

    return 42.0 * dot(m, vec4(n0, n1, n2, n3));
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
    float size = (vDepth * 3.5 + 1.5) * (1.0 / -mvPosition.z) * 40.0;
    gl_PointSize = clamp(size, 1.0, 6.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  varying float vDepth;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float dist = dot(uv, uv);
    if (dist > 0.25) discard;
    float alpha = smoothstep(0.25, 0.0, dist);
    vec3 base = mix(vec3(0.35, 0.65, 1.0), vec3(1.0, 0.55, 0.9), vDepth);
    gl_FragColor = vec4(base, alpha * (0.25 + vDepth * 0.75));
  }
`;

const uniforms = {
  uTime: { value: 0 }
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
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
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
  if (prefersMotion) requestAnimationFrame(render);
}

requestAnimationFrame(render);

