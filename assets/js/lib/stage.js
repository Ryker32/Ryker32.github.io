// Shared 3D stage for rich project pages (see tools/pages/README.md).
//
//   import { createStage, cad } from '/assets/js/lib/stage.js';
//   const stage = createStage(el, { controls: false });
//   const rover = await stage.load('/assets/models/rover.glb');
//   stage.frame(rover);
//
// The look is a product render of Jerry's CAD, kept light:
//  - a real studio HDRI for reflections and soft light (@pmndrs/assets "studio", CC0; 256 x 128,
//    RGBE, 79 KB: assets/models/studio-env.bin, made by tools/pages/mkenv.mjs), prefiltered with PMREM
//  - a key light that casts soft shadows, plus a fill and a rim light that ride with the camera
//  - a contact shadow under the model (baked, re-baked only when the scene changes and settles)
//  - materials read from the STEP colours (aluminium, steel, carbon fibre, printed plastic, rubber,
//    PCB), with fine surface detail: brushed metal, a twill weave, faint layer lines. CAD meshes have
//    no UVs, so box-projected UVs are generated at load. Shapes and colours are never changed.
//  - neutral tone mapping (Khronos PBR Neutral), which keeps the CAD colours true
//  - section cuts with clean hatched caps tinted by each part's colour
// Performance: it renders only while on screen and only when something changed (a scroll-driven
// stage renders when its progress changes; nothing runs on its own). Shadows re-render only when
// parts move, not when the camera does. The pixel ratio drops while frames are slow and comes back
// when things settle; once the picture stops changing it draws one refined frame (full pixel ratio,
// contact shadow, and ambient occlusion on desktop when asked) and then nothing until the next change.
import * as THREE from 'three';
import { GLTFLoader } from '../../vendor/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from '../../vendor/addons/libs/meshopt_decoder.module.js';
import { OrbitControls } from '../../vendor/addons/controls/OrbitControls.js';

const DEG = Math.PI / 180;
// frame counters for tools/pages/perf.mjs: live frames and their draw calls (shadow passes
// included), refined frames, shadow map updates and contact-shadow bakes, over every stage
const STATS = (globalThis.__rxStats ||= { live: 0, liveCalls: 0, refined: 0, refinedCalls: 0, shadows: 0, bakes: 0 });
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const v3 = (a) => (a && a.isVector3 ? a.clone() : Array.isArray(a) ? new THREE.Vector3(a[0], a[1], a[2]) : new THREE.Vector3(a?.x || 0, a?.y || 0, a?.z || 0));

// ------------------------------------------------------------------ hashed asset URLs
// Assets are cached for a month, so every URL carries a content hash. The build writes the map
// into the page (data-assets); load() and assetUrl() look paths up in it.
let MAP = null;
function assetMap() {
  if (MAP) return MAP;
  try { MAP = JSON.parse(document.querySelector('[data-assets]')?.getAttribute('data-assets') || '{}'); } catch { MAP = {}; }
  return MAP;
}
/** '/assets/models/x.glb', 'assets/models/x.glb' or 'models/x.glb' -> the hashed URL (or the plain path if unknown). */
export function assetUrl(path) {
  if (typeof path !== 'string' || /^(https?:|data:|blob:)/.test(path) || /[?&]v=/.test(path)) return path;
  const key = path.startsWith('/') ? path : path.startsWith('assets/') ? `/${path}` : `/assets/${path.replace(/^\.?\//, '')}`;
  return assetMap()[key] || key;
}

// ------------------------------------------------------------------ CAD coordinates
// tools/cad-axes.py prints STEP coordinates: millimetres, Z up. The GLBs are metres, Y up
// (step2glb.py), so a STEP point (x, y, z) is (x, z, -y) / 1000 in the model's frame.
export const cad = {
  point: ([x, y, z]) => [x / 1000, z / 1000, -y / 1000],
  dir: ([x, y, z]) => [x, z, -y],
};

// ------------------------------------------------------------------ loading
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const fetches = new Map(); // one download per URL even when two stages load the same model
function fetchBuffer(url) {
  if (!fetches.has(url)) {
    fetches.set(url, fetch(url).then((r) => { if (!r.ok) throw new Error(`${r.status} loading ${url}`); return r.arrayBuffer(); })
      .catch((e) => { fetches.delete(url); throw e; }));
  }
  return fetches.get(url);
}

// ------------------------------------------------------------------ studio environment
// assets/models/studio-env.bin: 'RXE2', width, height (u32 LE), 4 reserved bytes, then the RGBE
// bytes as four planes (R, G, B, E) with a left-neighbour delta per row; the file is gzip'd.
// Decoded once per page into a half-float equirect texture that every stage prefilters itself.
const ENV_URL = '/assets/models/studio-env.bin';
let envPromise = null;
function studioTexture() {
  envPromise ||= (async () => {
    if (typeof DecompressionStream === 'undefined') throw new Error('no DecompressionStream');
    const r = await fetch(assetUrl(ENV_URL));
    if (!r.ok) throw new Error(`${r.status} loading ${ENV_URL}`);
    let u8 = new Uint8Array(await r.arrayBuffer());
    if (u8[0] === 0x1f && u8[1] === 0x8b) u8 = new Uint8Array(await new Response(new Blob([u8]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
    const dv = new DataView(u8.buffer, u8.byteOffset);
    if (String.fromCharCode(u8[0], u8[1], u8[2], u8[3]) !== 'RXE2') throw new Error('bad studio-env.bin');
    const W = dv.getUint32(4, true), H = dv.getUint32(8, true), N = W * H;
    const planes = u8.subarray(16);
    for (let ch = 0; ch < 4; ch++) for (let y = 0; y < H; y++) { // undo the row deltas
      let prev = 0; const o = ch * N + y * W;
      for (let x = 0; x < W; x++) { prev = (prev + planes[o + x]) & 255; planes[o + x] = prev; }
    }
    const half = new Uint16Array(N * 4), toHalf = THREE.DataUtils.toHalfFloat;
    for (let i = 0; i < N; i++) {
      const e = planes[3 * N + i];
      const f = e ? Math.pow(2, e - 136) : 0; // (mantissa + 0.5) / 256 * 2^(e - 128)
      half[i * 4] = toHalf((planes[i] + 0.5) * f); half[i * 4 + 1] = toHalf((planes[N + i] + 0.5) * f); half[i * 4 + 2] = toHalf((planes[2 * N + i] + 0.5) * f); half[i * 4 + 3] = toHalf(1);
    }
    const tex = new THREE.DataTexture(half, W, H, THREE.RGBAFormat, THREE.HalfFloatType);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.LinearSRGBColorSpace;
    tex.magFilter = tex.minFilter = THREE.LinearFilter;
    tex.flipY = true; // rows are stored top to bottom
    tex.needsUpdate = true;
    tex.userData.rxShared = true;
    return tex;
  })();
  return envPromise;
}

// ------------------------------------------------------------------ surface detail
// Small procedural textures, made once per page and shared by every stage (never disposed per stage).
// They only add fine detail (bump, roughness, a weave): colours stay the CAD colours.
const TEX = {};
function canvasTex(key, size, draw, srgb = false) {
  if (TEX[key]) return TEX[key];
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = 4;
  t.userData.rxShared = true;
  return (TEX[key] = t);
}
let seed = 7;
const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
// brushed metal: fine streaks along u. Value is height (bump) and a roughness factor (0.72..1).
const brushed = () => canvasTex('brushed', 256, (g, n) => {
  const img = g.createImageData(n, n);
  const row = new Float32Array(n);
  for (let y = 0; y < n; y++) {
    const base = rnd();
    let run = rnd();
    for (let x = 0; x < n; x++) { run += (rnd() - 0.5) * 0.08; row[x] = run; }
    for (let x = 0; x < n; x++) {
      const v = clamp(0.5 * base + 0.35 * (row[x] - Math.floor(row[x])) + 0.15 * rnd(), 0, 1);
      const k = (y * n + x) * 4, b = Math.round(185 + 70 * v);
      img.data[k] = img.data[k + 1] = img.data[k + 2] = b; img.data[k + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
});
// carbon fibre, 2x2 twill: tows alternate direction on a diagonal staircase. Height map with fibre
// grooves along each tow, used as a bump map; the clearcoat stays smooth on top of it.
const twill = () => canvasTex('twill', 256, (g, n) => {
  const img = g.createImageData(n, n), cells = 8, cs = n / cells;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const cx = Math.floor(x / cs), cy = Math.floor(y / cs);
    const alongX = ((cx + cy) & 3) < 2; // 2 over, 2 under, shifted by one each row: the twill diagonal
    const u = (alongX ? x : y) % cs / cs, w = (alongX ? y : x) % cs / cs;
    const bulge = Math.sin(Math.PI * w); // each tow is a flattened cylinder across its width
    const fibres = 0.5 + 0.5 * Math.sin((alongX ? y : x) * 2.3 + Math.sin(u * 9) * 0.6);
    const v = clamp(0.62 * bulge + 0.18 * fibres + 0.2 * (alongX ? 1 : 0.55), 0, 1);
    const k = (y * n + x) * 4, b = Math.round(40 + 215 * v);
    img.data[k] = img.data[k + 1] = img.data[k + 2] = b; img.data[k + 3] = 255;
  }
  g.putImageData(img, 0, 0);
});
// printed layers: horizontal ridges (v runs up the part), 32 layers per tile with slight variation
const layers = () => canvasTex('layers', 128, (g, n) => {
  const img = g.createImageData(n, n), L = 32, lh = n / L, jit = Array.from({ length: L }, () => rnd());
  for (let y = 0; y < n; y++) {
    const i = Math.floor(y / lh), f = (y % lh) / lh;
    const ridge = Math.sin(Math.PI * f);
    for (let x = 0; x < n; x++) {
      const v = clamp(0.75 * ridge + 0.15 * jit[i] + 0.1 * Math.sin((x / n) * Math.PI * 2 * 3 + jit[i] * 6), 0, 1);
      const k = (y * n + x) * 4, b = Math.round(60 + 195 * v);
      img.data[k] = img.data[k + 1] = img.data[k + 2] = b; img.data[k + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
});
// rubber and matte finishes: fine isotropic grain
const grain = () => canvasTex('grain', 128, (g, n) => {
  const img = g.createImageData(n, n);
  for (let i = 0; i < n * n; i++) { const b = Math.round(170 + 85 * rnd()); img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = b; img.data[i * 4 + 3] = 255; }
  g.putImageData(img, 0, 0);
});

// UVs for textures on CAD meshes (which come without any): box projection in the mesh's own frame,
// so the detail sticks to a moving part. mode 'layers' keeps v = height so layer lines stay
// horizontal and vanish on flat tops. tile: metres per texture repeat.
const uvDone = new WeakSet();
function projectUVs(mesh, mode, tile) {
  const geo = mesh.geometry;
  if (!geo || uvDone.has(geo) || geo.attributes.uv || !geo.attributes.position || !geo.attributes.normal) return;
  uvDone.add(geo);
  mesh.updateWorldMatrix(true, false);
  const e = mesh.matrixWorld.elements; // per-axis scale (quantized meshes carry it in the node)
  const sx = Math.hypot(e[0], e[1], e[2]) / tile, sy = Math.hypot(e[4], e[5], e[6]) / tile, sz = Math.hypot(e[8], e[9], e[10]) / tile;
  const pos = geo.attributes.position, nor = geo.attributes.normal, n = pos.count, uv = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) {
    const x = pos.getX(i) * sx, y = pos.getY(i) * sy, z = pos.getZ(i) * sz;
    const ax = Math.abs(nor.getX(i)), ay = Math.abs(nor.getY(i)), az = Math.abs(nor.getZ(i));
    if (mode === 'layers') { uv[i * 2] = ax > az ? z : x; uv[i * 2 + 1] = y; }
    else if (ax >= ay && ax >= az) { uv[i * 2] = z; uv[i * 2 + 1] = y; }
    else if (ay >= az) { uv[i * 2] = x; uv[i * 2 + 1] = z; }
    else { uv[i * 2] = x; uv[i * 2 + 1] = y; }
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}

// The material pass: STEP exports carry only a colour, so the colour decides the finish (as on the
// landing scene), unless the page or the GLB names one (see FINISHES). Materials that already have
// textures are left alone. userData.rxUv says which UV projection and tile the finish wants.
const RUBBER = /wheel|tire|tyre|tread|o.?ring|grommet|belt(?![\w\s-]*(pulley|sprocket|clamp|idler|tension))/i;
const CARBON = /carbon|\bcf[_\s-]|cf_|_cf\b/i;
// finishes a page (load options, @turntable model fields) or the GLB (material extras.finish,
// written by tools/optimize-cad.mjs "finish") can ask for instead of the colour's guess:
//   printed   printed plastic with faint layer lines, whatever the colour (green PLA is not a PCB,
//             grey PLA is not aluminium)
//   moulded   injection-moulded plastic: smooth, slightly glossy, no layer lines ('smooth' too)
//   anodized  anodized metal in the part's colour: smooth, no brushing
//   metal     brushed metal in the part's colour
//   rubber, carbon   as the name-based guesses
//   plain     the colour's finish without the fine surface detail (no bump or roughness texture)
const FINISHES = ['printed', 'moulded', 'anodized', 'metal', 'rubber', 'carbon', 'plain'];
// the part's own name and its parent's (a multi-material part is a group of meshes); not the whole
// assembly chain, or every part of a "wheel module" would turn to rubber
function nameChain(o) { return `${o.name} ${o.parent?.userData?.rxModel ? '' : o.parent?.name || ''}`; }
// a RegExp (its g / y flags dropped, so test() has no state) from a RegExp or a string, else null
function toRx(x) {
  if (x instanceof RegExp) return x.global || x.sticky ? new RegExp(x.source, x.flags.replace(/[gy]/g, '')) : x;
  return typeof x === 'string' && x ? new RegExp(x, 'i') : null;
}
// Printed layer lines are 0.2 mm apart: at most sizes a layer is under a pixel, and the bump of
// ridges that fine aliases into a woven, carbon-like moire on big flat plates; the carbon twill's
// tows do the same, into a dithered noise. The bump fades out by how many pixels one feature
// covers on screen: full from 3 px, gone below 1.5 px. period: feature size in UV; axis 'v' for
// the layers (they repeat up the part), 'uv' for the weave.
function bumpFade(period, axis) {
  const d = axis === 'v' ? 'abs( a.y ) + abs( b.y )' : 'max( abs( a.x ) + abs( b.x ), abs( a.y ) + abs( b.y ) )';
  const fn = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace('#include <bumpmap_pars_fragment>', THREE.ShaderChunk.bumpmap_pars_fragment
      .replace('vec2 dHdxy_fwd() {', `float rxBumpFade( vec2 a, vec2 b ) { return smoothstep( 1.5, 3.0, ${period.toFixed(6)} / max( ${d}, 1e-8 ) ); }\n\tvec2 dHdxy_fwd() {`)
      .replace('return vec2( dBx, dBy );', 'return vec2( dBx, dBy ) * rxBumpFade( dSTdx, dSTdy );'));
  };
  const key = `rxfade${period.toFixed(5)}${axis}`;
  return (m) => { m.onBeforeCompile = fn; m.customProgramCacheKey = () => key; };
}
const layerFade = bumpFade(1 / 32, 'v'); // a tile of the layers texture holds 32 layers
const twillFade = bumpFade(1 / 8, 'uv'); // and of the twill, 8 tows each way
function cadMaterial(mat, kind) {
  if (!mat || !mat.color || mat.map || mat.normalMap || mat.roughnessMap || mat.metalnessMap) return mat;
  const c = mat.color.clone(), hsl = {};
  c.getHSL(hsl, THREE.SRGBColorSpace);
  // CAD black is a colour name, not a physical albedo: real black plastic, anodizing and powder
  // coat reflect about 2-4 %. Lifting pure black to that keeps it black but lets it show its shape.
  if (hsl.l < 0.1) { const f = kind === 'anodized' ? 0.045 : 0.022; c.r = Math.max(c.r, f); c.g = Math.max(c.g, f); c.b = Math.max(c.b, f); }
  let m;
  const P = (o) => new THREE.MeshPhysicalMaterial({ color: c, ...o });
  const S = (o) => new THREE.MeshStandardMaterial({ color: c, ...o });
  const printed = () => {
    if (hsl.l < 0.12) m = S({ roughness: 0.58, metalness: 0, bumpMap: layers(), bumpScale: 0.5, roughnessMap: grain() }); // black printed parts, nylon, powder coat
    else if ((hsl.h < 0.04 || hsl.h > 0.96) && hsl.s > 0.6) m = P({ roughness: 0.46, metalness: 0, clearcoat: 0.12, clearcoatRoughness: 0.5, bumpMap: layers(), bumpScale: 0.5 }); // red PLA
    else m = S({ roughness: 0.48, metalness: 0, bumpMap: layers(), bumpScale: 0.45 }); // other plastics
    m.userData.rxUv = ['layers', 0.0064];
    layerFade(m);
  };
  if (mat.name === 'carbon' || mat.userData?.carbon || (kind === 'carbon' && hsl.l < 0.25)) {
    m = P({ roughness: 0.42, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08, bumpMap: twill(), bumpScale: 0.6, roughnessMap: twill() });
    m.userData.rxUv = ['box', 0.012];
    twillFade(m);
  } else if (kind === 'rubber') {
    m = S({ roughness: 0.86, metalness: 0, bumpMap: grain(), bumpScale: 0.25 });
    m.userData.rxUv = ['box', 0.006];
  } else if (kind === 'printed') {
    printed();
  } else if (kind === 'moulded') {
    m = P({ roughness: hsl.l < 0.12 ? 0.4 : 0.34, metalness: 0, clearcoat: 0.3, clearcoatRoughness: 0.3 });
  } else if (kind === 'anodized') {
    m = S({ roughness: 0.34, metalness: 1 });
  } else if (kind === 'metal' || (hsl.s < 0.1 && hsl.l > 0.28 && hsl.l < 0.82)) { // aluminium, steel
    m = S({ roughness: hsl.l > 0.55 ? 0.3 : 0.38, metalness: 1, roughnessMap: brushed(), bumpMap: brushed(), bumpScale: 0.22 });
    m.userData.rxUv = ['box', 0.05];
  } else if (hsl.h > 0.08 && hsl.h < 0.16 && hsl.s > 0.5 && hsl.l > 0.45) {
    m = S({ roughness: 0.25, metalness: 1 }); // gold contacts
  } else if (hsl.h > 0.25 && hsl.h < 0.5 && hsl.s > 0.3 && hsl.l < 0.4) {
    // PCB soldermask: the dark greens of board libraries. Brighter greens are printed parts
    m = P({ roughness: 0.4, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.2, bumpMap: grain(), bumpScale: 0.25 });
    m.userData.rxUv = ['box', 0.004];
  } else {
    printed();
  }
  m.name = mat.name; m.side = mat.side;
  if (mat.transparent) { m.transparent = true; m.opacity = mat.opacity; }
  return m;
}

function disposeMaterial(m) {
  if (!m) return;
  for (const k of Object.keys(m)) { const t = m[k]; if (t && t.isTexture && !t.userData?.rxShared) t.dispose(); }
  m.dispose();
}
function disposeTree(root) {
  root.traverse((o) => {
    o.geometry?.dispose();
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) disposeMaterial(m);
    if (o.userData.rxOrig) for (const m of [].concat(o.userData.rxOrig)) disposeMaterial(m);
  });
}

// ------------------------------------------------------------------ contact shadow
// A soft dark footprint right under the model (the way a product sits on a sweep): a depth pass
// from below, blurred twice, on a plane at ground level. Baked, not live.
const blurVS = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
const blurFS = `uniform sampler2D tDiffuse; uniform vec2 dir; varying vec2 vUv;
void main() { vec4 s = vec4(0.0); float w[5]; w[0] = 0.227; w[1] = 0.1945; w[2] = 0.1216; w[3] = 0.054; w[4] = 0.0162;
  s += texture2D(tDiffuse, vUv) * w[0];
  for (int i = 1; i < 5; i++) { s += texture2D(tDiffuse, vUv + dir * float(i)) * w[i]; s += texture2D(tDiffuse, vUv - dir * float(i)) * w[i]; }
  gl_FragColor = s; }`;
function contactShadow(renderer, scene, parent) {
  const RES = 256;
  const opt = { type: THREE.HalfFloatType };
  const rtA = new THREE.WebGLRenderTarget(RES, RES, opt), rtB = new THREE.WebGLRenderTarget(RES, RES, opt);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const depth = new THREE.MeshDepthMaterial({ side: THREE.DoubleSide });
  depth.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace('gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );', 'gl_FragColor = vec4( vec3( 0.0 ), pow( 1.0 - fragCoordZ, 1.6 ) );');
  };
  const blur = new THREE.ShaderMaterial({ uniforms: { tDiffuse: { value: null }, dir: { value: new THREE.Vector2() } }, vertexShader: blurVS, fragmentShader: blurFS, depthTest: false, depthWrite: false });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), blur);
  quad.frustumCulled = false;
  const quadScene = new THREE.Scene(); quadScene.add(quad);
  const mat = new THREE.MeshBasicMaterial({ map: rtA.texture, transparent: true, opacity: 0.62, depthWrite: false, toneMapped: false, color: 0x000000 });
  mat.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace('#include <map_fragment>', 'diffuseColor.a *= texture2D( map, vMapUv ).a;'); };
  mat.customProgramCacheKey = () => 'rxcontact';
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
  plane.name = 'contact shadow'; plane.renderOrder = -1; plane.visible = false;
  parent.add(plane); // a child of the ground: hiding the ground hides this too
  let size = 1;
  return {
    plane,
    /** fit to the models' bounds (box, centre, radius) */
    fit(box, r) {
      const w = (box.max.x - box.min.x) + r * 0.5, d = (box.max.z - box.min.z) + r * 0.5;
      size = Math.max(w, d);
      plane.scale.set(-size / parent.scale.x, size / parent.scale.y, 1); // the camera below sees the footprint mirrored in x
      plane.position.set(((box.min.x + box.max.x) / 2 - parent.position.x) / parent.scale.x, -((box.min.z + box.max.z) / 2 - parent.position.z) / parent.scale.y, 0.0005);
      const h = Math.max(0.02, (box.max.y - box.min.y) * 0.5);
      Object.assign(cam, { left: -size / 2, right: size / 2, top: size / 2, bottom: -size / 2, near: 0, far: h });
      cam.position.set((box.min.x + box.max.x) / 2, box.min.y - 0.0005, (box.min.z + box.max.z) / 2);
      cam.up.set(0, 0, -1); // image rows along -z, matching the ground plane's orientation
      cam.lookAt(cam.position.x, cam.position.y + 1, cam.position.z);
      cam.updateProjectionMatrix();
    },
    bake(roots) {
      const prevOverride = scene.overrideMaterial, prevBg = scene.background, prevTarget = renderer.getRenderTarget();
      const prevClear = renderer.getClearColor(new THREE.Color()), prevAlpha = renderer.getClearAlpha(), prevAuto = renderer.shadowMap.autoUpdate;
      const hidden = [];
      scene.traverse((o) => { if (o.visible && (o.isLight ? false : !roots.some((r) => r === o || isIn(o, r)) && o.isMesh)) { hidden.push(o); o.visible = false; } });
      scene.overrideMaterial = depth; scene.background = null;
      renderer.shadowMap.autoUpdate = false;
      renderer.setClearColor(0x000000, 0);
      renderer.setRenderTarget(rtA); renderer.clear(); renderer.render(scene, cam);
      scene.overrideMaterial = prevOverride; scene.background = prevBg;
      for (const o of hidden) o.visible = true;
      for (let i = 0; i < 2; i++) { // blur A -> B -> A, twice
        blur.uniforms.tDiffuse.value = rtA.texture; blur.uniforms.dir.value.set((1.6 + i) / RES, 0); renderer.setRenderTarget(rtB); renderer.render(quadScene, cam);
        blur.uniforms.tDiffuse.value = rtB.texture; blur.uniforms.dir.value.set(0, (1.6 + i) / RES); renderer.setRenderTarget(rtA); renderer.render(quadScene, cam);
      }
      renderer.setRenderTarget(prevTarget);
      renderer.setClearColor(prevClear, prevAlpha);
      renderer.shadowMap.autoUpdate = prevAuto;
      plane.visible = true;
    },
    dispose() { rtA.dispose(); rtB.dispose(); depth.dispose(); blur.dispose(); mat.dispose(); quad.geometry.dispose(); plane.geometry.dispose(); },
  };
}
function isIn(o, root) { for (let p = o; p; p = p.parent) if (p === root) return true; return false; }

// The environment every stage reflects: the real studio HDRI, dimmed, as the room, with large soft
// light panels added the way a product photographer would: a big key softbox up front left (where
// the key light sits), two tall strips behind for rim highlights, a broad dim panel overhead and a
// low bounce card. Wide sources give every surface a soft gradient instead of a hard mirror image,
// so black parts read as black with their shape, and metals as metal. World axes: +y up; the
// default camera looks from +x +z.
function studioRoom(hdri) {
  const s = new THREE.Scene();
  if (hdri) { s.background = hdri; s.backgroundIntensity = 0.3; s.backgroundRotation.set(0, 2.2, 0); }
  else s.background = new THREE.Color(0.012, 0.011, 0.01);
  const geo = new THREE.PlaneGeometry(1, 1);
  const panel = (w, h, pos, k, tint = [1, 1, 1]) => {
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color(tint[0] * k, tint[1] * k, tint[2] * k), side: THREE.DoubleSide }));
    m.scale.set(w, h, 1); m.position.set(...pos); m.lookAt(0, 0, 0); s.add(m);
  };
  panel(7, 5, [-5, 8, 5.5], 5.5, [1, 0.96, 0.9]); // key softbox, warm
  panel(1.6, 9, [7, 3, -5], 7); // rim strip, back right
  panel(1.6, 9, [-7.5, 2.5, -4.5], 4.5, [0.9, 0.95, 1]); // rim strip, back left, cool
  panel(14, 14, [0, 10, 0], 0.7); // overhead
  panel(10, 3, [3, -3.5, 8], 0.5, [1, 0.95, 0.9]); // low bounce card in front
  s.dispose = () => { geo.dispose(); s.traverse((o) => o.material?.dispose()); };
  return s;
}

// ------------------------------------------------------------------ stage
/**
 * createStage(el, opts) mounts a WebGL canvas that fills `el` (give el a size in CSS).
 * opts:
 *   controls    true (default): drag to orbit, pinch or ctrl/cmd + wheel to zoom. false for scroll-driven stages.
 *   background  'transparent' (default; the page's panel shows through) or any CSS colour.
 *   shadow      true (default): soft key-light shadow and a contact shadow under the models.
 *   hint        text of the "drag to rotate" chip, or false. Default depends on touch.
 *   fov         vertical field of view in degrees (default 32).
 *   exposure    tone mapping exposure (default 1).
 *   envIntensity  strength of the studio environment (default 1).
 *   ao          true: ambient occlusion in the refined frame drawn once things settle (desktop only).
 *   pixelRatio  cap on devicePixelRatio (default 1.75); the stage lowers it while frames are slow.
 *   detail      surface detail textures (default: on, except on touch devices).
 */
export function createStage(el, opts = {}) {
  if (!el) throw new Error('createStage: no element');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = matchMedia('(hover: none) and (pointer: coarse)').matches;
  const transparent = !opts.background || opts.background === 'transparent';

  const canvas = document.createElement('canvas');
  canvas.className = 'rx-canvas';
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: transparent, powerPreference: 'high-performance' });
  } catch (e) {
    throw new Error(`WebGL unavailable: ${e.message || e}`);
  }
  const dprMax = Math.min(window.devicePixelRatio || 1, opts.pixelRatio || 1.75);
  const dprMin = Math.min(dprMax, touch ? 1 : 0.8);
  let dprLive = dprMax, dprNow = dprMax;
  renderer.setPixelRatio(dprNow);
  renderer.toneMapping = THREE.NeutralToneMapping;
  // neutral tone mapping passes mid-tones through almost untouched; this lifts them to about the
  // brightness the pages were tuned for, and pages' own exposure values still scale it
  renderer.toneMappingExposure = 1.15 * (opts.exposure ?? 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = opts.shadow !== false;
  renderer.shadowMap.type = THREE.PCFShadowMap; // PCF honours shadow.radius, which keeps the shadow soft
  renderer.shadowMap.autoUpdate = false; // shadows re-render only when the scene changes (see render())
  if (transparent) renderer.setClearColor(0x000000, 0);
  else renderer.setClearColor(new THREE.Color(opts.background), 1);
  if (getComputedStyle(el).position === 'static') el.style.position = 'relative'; // the canvas fills el
  el.appendChild(canvas);

  const scene = new THREE.Scene();
  let envTex = null;
  const setEnv = (t) => { envTex?.dispose(); envTex = t; scene.environment = t; invalidate(); };
  scene.environmentIntensity = opts.envIntensity ?? 1;
  const envReady = studioTexture().catch((e) => { console.warn('stage: studio HDRI unavailable', e?.message || e); return null; }).then((tex) => {
    if (disposed) return;
    const pm = new THREE.PMREMGenerator(renderer);
    const room = studioRoom(tex);
    setEnv(pm.fromScene(room, 0.02).texture);
    room.dispose();
    pm.dispose();
  });

  const camera = new THREE.PerspectiveCamera(opts.fov || 32, 1, 0.01, 100);
  camera.position.set(1.2, 0.7, 1.4);
  const target = new THREE.Vector3();
  camera.lookAt(target);
  scene.add(camera);

  // key: warm, from the upper front left, fixed in the scene; it casts the shadows
  const key = new THREE.DirectionalLight('#fff1e3', 1.5);
  key.castShadow = opts.shadow !== false;
  key.shadow.mapSize.set(touch ? 1024 : 2048, touch ? 1024 : 2048);
  key.shadow.radius = 5;
  const keyDir = new THREE.Vector3(-0.45, 1, 0.55).normalize();
  scene.add(key, key.target);
  // fill and rim ride with the camera, so every angle the scroll turns to stays lit and the
  // silhouette separates from the dark page (they cast no shadows, so they cost almost nothing)
  const fill = new THREE.DirectionalLight('#dfe8ff', 0.35);
  fill.position.set(1, -0.2, 0.6); fill.target.position.set(0, 0, -1);
  const rim = new THREE.DirectionalLight('#ffffff', 1.1);
  rim.position.set(-0.3, 0.8, -1); rim.target.position.set(0, 0, 0);
  camera.add(fill, fill.target, rim, rim.target);

  const root = new THREE.Group(); // loaded models live here; section planes cut only these
  root.name = 'models';
  scene.add(root);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShadowMaterial({ opacity: 0.3, depthWrite: false }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; ground.visible = false; ground.name = 'ground';
  ground.renderOrder = -1;
  scene.add(ground);
  const contact = opts.shadow !== false ? contactShadow(renderer, scene, ground) : null;

  // ---------------------------------------------------------------- controls
  let controls = null;
  if (opts.controls !== false) {
    controls = new OrbitControls(camera, canvas);
    controls.target = target; // one shared target: frame(), setView() and the controls agree
    controls.enableDamping = !reduced;
    controls.dampingFactor = 0.12;
    controls.enablePan = false;
    controls.enableZoom = touch; // set per event below: pinch, or ctrl/cmd + wheel, zooms; a plain wheel scrolls
    controls.rotateSpeed = 0.8;
    // A plain wheel scrolls the page; a trackpad pinch (ctrl + wheel) or ctrl/cmd + wheel zooms.
    el.addEventListener('wheel', (e) => { controls.enableZoom = e.ctrlKey || e.metaKey; }, { capture: true, passive: true });
    el.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') controls.enableZoom = true; }, { capture: true, passive: true });
    // Touch: vertical swipes keep scrolling the page, sideways swipes turn the model, two fingers zoom.
    if (touch) canvas.style.touchAction = 'pan-y';
    controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE };
    controls.addEventListener('change', () => invalidate(false));
    controls.addEventListener('start', () => { hintEl?.classList.add('gone'); wake(); });
  } else {
    canvas.style.pointerEvents = 'none';
  }
  let hintEl = null;
  if (controls && opts.hint !== false) {
    hintEl = document.createElement('span');
    hintEl.className = 'rx-hint';
    hintEl.textContent = typeof opts.hint === 'string' ? opts.hint : touch ? 'Swipe sideways to turn' : 'Drag to rotate';
    el.appendChild(hintEl);
  }

  // ---------------------------------------------------------------- optional AO, refined frame only
  let composer = null;
  if (opts.ao && !touch) {
    Promise.all([
      import('../../vendor/addons/postprocessing/EffectComposer.js'),
      import('../../vendor/addons/postprocessing/RenderPass.js'),
      import('../../vendor/addons/postprocessing/GTAOPass.js'),
      import('../../vendor/addons/postprocessing/OutputPass.js'),
    ]).then(([{ EffectComposer }, { RenderPass }, { GTAOPass }, { OutputPass }]) => {
      if (disposed) return;
      const rt = new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType, samples: 4 });
      const c = new EffectComposer(renderer, rt);
      c.addPass(new RenderPass(scene, camera));
      const gtao = new GTAOPass(scene, camera, 2, 2);
      gtao.output = GTAOPass.OUTPUT.Default; gtao.blendIntensity = 0.75;
      c.addPass(gtao);
      c.addPass(new OutputPass());
      composer = c;
      aoRadius();
      resize();
    }).catch((e) => console.warn('stage: AO unavailable', e));
  }
  function aoRadius() {
    const g = composer?.passes.find((p) => p.gtaoMaterial);
    if (g) g.updateGtaoMaterial({ radius: Math.max(0.004, bounds.r * 0.08), distanceExponent: 2, thickness: 1.5, scale: 1, samples: 12, distanceFallOff: 1, screenSpaceRadius: false });
  }

  // ---------------------------------------------------------------- rendering, on demand only
  // dirty: the picture must be redrawn. sceneDirty: something other than the camera changed, so the
  // shadow map (and later the contact shadow) must be redrawn too. refined: the settled frame is up.
  let raf = 0, dirty = true, sceneDirty = true, contactDirty = true, refined = false, visible = false, disposed = false;
  let last = 0, elapsed = 0, lastDraw = 0, slowEma = 16, slowN = 0, fastN = 0, idleT = 0;
  const frameFns = new Set();
  const tweens = new Set();
  function wake() {
    if (raf || disposed || !visible || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  }
  /** Ask for a redraw. scene = false when only the camera moved (the shadows stay as they are). */
  function invalidate(scene = true) {
    dirty = true; refined = false;
    if (scene) { sceneDirty = true; contactDirty = true; }
    wake();
  }
  function setDpr(d) {
    if (Math.abs(d - dprNow) < 0.01) return;
    dprNow = d;
    renderer.setPixelRatio(d);
    const w = el.clientWidth, h = el.clientHeight;
    if (w && h) { renderer.setSize(w, h, false); composer?.setPixelRatio?.(d); composer?.setSize(w, h); }
    cap.hatch.value = 7 * d;
  }
  let lastShadow = -1e9;
  function draw(hq) {
    // while parts keep moving, the shadow map refreshes about ten times a second (a lag nobody sees
    // on soft shadows); the settled frame always gets an exact one
    const now = performance.now();
    if (sceneDirty && (hq || now - lastShadow > 90)) { renderer.shadowMap.needsUpdate = true; sceneDirty = false; lastShadow = now; }
    if (renderer.shadowMap.needsUpdate && renderer.shadowMap.enabled) STATS.shadows++;
    if (hq && composer) composer.render(); else renderer.render(scene, camera);
    if (hq) { STATS.refined++; STATS.refinedCalls += renderer.info.render.calls; } else { STATS.live++; STATS.liveCalls += renderer.info.render.calls; }
    dirty = false;
  }
  // an ordinary frame: at the live pixel ratio, adapting it to how fast frames come
  function drawLive(now) {
    if (dprNow !== dprLive) setDpr(dprLive);
    draw(false);
    const gap = now - lastDraw;
    lastDraw = now;
    if (gap < 70) { // consecutive frames: is the stage keeping up?
      slowEma = slowEma * 0.8 + gap * 0.2;
      if (slowEma > 26) { fastN = 0; if (++slowN > 5 && dprLive > dprMin) { dprLive = Math.max(dprMin, dprLive * 0.8); slowN = 0; } }
      else if (slowEma < 18) { slowN = 0; if (++fastN > 90 && dprLive < dprMax) { dprLive = Math.min(dprMax, dprLive * 1.15); fastN = 0; } }
    }
    clearTimeout(idleT);
    idleT = setTimeout(settle, 260);
  }
  // once nothing has changed for a moment: one refined frame, then nothing. Skipped when it would
  // not change anything (full pixel ratio already, no AO, shadows exact, contact shadow current).
  let contactSig = '';
  const sigBox = new THREE.Box3();
  function footprint() { // where the models are and which of them show: the contact shadow depends on it
    sigBox.makeEmpty();
    let n = 0;
    root.traverseVisible((o) => { if (o.isMesh) { n++; sigBox.expandByObject(o); } });
    const r = (v) => Math.round(v * 2000);
    return `${n}|${r(sigBox.min.x)},${r(sigBox.min.y)},${r(sigBox.min.z)}|${r(sigBox.max.x)},${r(sigBox.max.y)},${r(sigBox.max.z)}`;
  }
  function settle() {
    idleT = 0;
    if (disposed || !visible || document.hidden || raf) return;
    let bake = false;
    if (contact && contactDirty && ground.visible && root.children.length) {
      const sig = footprint();
      bake = sig !== contactSig;
      contactSig = sig; contactDirty = false;
    }
    if (!bake && !sceneDirty && !composer && dprNow === dprMax) { refined = true; return; }
    if (bake) { contact.bake([root]); STATS.bakes++; }
    setDpr(dprMax);
    draw(true);
    refined = true;
  }
  function tick(now) {
    raf = 0;
    if (disposed || !visible || document.hidden) return;
    const dt = clamp((now - last) / 1000, 0, 0.05);
    last = now; elapsed += dt;
    let busy = false;
    for (const tw of tweens) { busy = true; tw(dt); }
    if (frameFns.size) sceneDirty = contactDirty = true; // callbacks move parts: shadows follow
    for (const fn of frameFns) {
      busy = true;
      try { fn(dt, elapsed); } catch (e) { console.error('stage onFrame callback failed; removed', e); frameFns.delete(fn); }
    }
    if (controls) {
      if (controls.update(dt)) { dirty = true; busy = true; }
      if (controls.autoRotate && !reduced) busy = true;
    }
    if (dirty || busy) drawLive(now);
    if (busy) raf = requestAnimationFrame(tick);
  }
  // Draw now if anything changed: the page runtime calls this right after it hands a scroll-driven
  // module its progress, so the canvas and any HTML labels move in the same frame.
  function flush() {
    if (!dirty || disposed || !visible || document.hidden) return;
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    tick(performance.now());
  }
  canvas.rxFlush = flush;
  const io = new IntersectionObserver((es) => {
    visible = es[es.length - 1].isIntersecting;
    if (visible) invalidate(false); else if (raf) { cancelAnimationFrame(raf); raf = 0; }
  }, { rootMargin: '120px 0px' });
  io.observe(el);
  const onVis = () => { if (!document.hidden) invalidate(false); };
  document.addEventListener('visibilitychange', onVis);

  function resize() {
    const w = el.clientWidth, h = el.clientHeight;
    if (!w || !h) return;
    // live frames get a budget of about 2.4 million pixels (a full-screen stage on a 2x screen
    // would be 7); the refined frame at rest is drawn at the full pixel ratio
    dprLive = Math.min(dprLive, Math.max(dprMin, Math.min(dprMax, Math.sqrt(2.4e6 / (w * h)))));
    if (dprNow !== dprLive && !refined) setDpr(dprLive);
    renderer.setSize(w, h, false);
    composer?.setPixelRatio?.(renderer.getPixelRatio());
    composer?.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (shift.x || shift.y) applyShift();
    // keep the framed model fitting the new shape, seen from wherever the camera is now
    if (lastFrame) frame(lastFrame.obj, { ...lastFrame.opts, dir: camera.position.clone().sub(target), duration: 0 });
    invalidate(false);
  }
  const ro = new ResizeObserver(resize);
  ro.observe(el);

  // ---------------------------------------------------------------- bounds, ground, shadow fit
  const bounds = { box: new THREE.Box3(), c: new THREE.Vector3(), r: 0.5 };
  const sphereCache = new WeakMap();
  // Exact world box of each mesh. The quick box (the geometry's box turned by the node) is exact
  // only for an unrotated node: a long merged mesh under a rotated node comes out far too big,
  // which shrank the framing and left the ground floating below the model. Rotated meshes are
  // measured vertex by vertex, once per placement (static parts once, moving parts when they move).
  const meshBoxes = new WeakMap();
  const vTmp = new THREE.Vector3();
  function meshBox(m) {
    const geo = m.geometry, pos = geo?.attributes?.position;
    if (!pos) return null;
    const e = m.matrixWorld.elements;
    let c = meshBoxes.get(m);
    if (c && c.geo === geo && c.ver === pos.version && c.e.every((x, i) => x === e[i])) return c.box;
    if (!c) meshBoxes.set(m, (c = { box: new THREE.Box3(), e: new Float64Array(16) }));
    c.geo = geo; c.ver = pos.version; c.e.set(e);
    if (!geo.boundingBox) geo.computeBoundingBox();
    // unrotated (scaled, moved, axes swapped or flipped): every column of the 3x3 has one non-zero
    const s = Math.max(Math.abs(e[0]), Math.abs(e[1]), Math.abs(e[2]), Math.abs(e[4]), Math.abs(e[5]), Math.abs(e[6]), Math.abs(e[8]), Math.abs(e[9]), Math.abs(e[10])) * 1e-6;
    const aligned = [0, 4, 8].every((k) => (Math.abs(e[k]) > s) + (Math.abs(e[k + 1]) > s) + (Math.abs(e[k + 2]) > s) <= 1);
    if (m.boundingBox !== undefined) { // instanced and batched meshes: their own box over every instance (never cached)
      m.computeBoundingBox();
      c.box.copy(m.boundingBox).applyMatrix4(m.matrixWorld);
      c.geo = null;
    } else if (aligned || !m.isMesh || m.isSkinnedMesh || geo.morphAttributes?.position) c.box.copy(geo.boundingBox).applyMatrix4(m.matrixWorld);
    else {
      c.box.makeEmpty();
      for (let i = 0, n = pos.count; i < n; i++) c.box.expandByPoint(vTmp.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld));
    }
    return c.box;
  }
  function sphereOf(obj, refresh) {
    obj = obj || root;
    if (!refresh && sphereCache.has(obj)) return sphereCache.get(obj);
    const box = new THREE.Box3();
    for (const o of Array.isArray(obj) ? obj : [obj]) {
      o.updateWorldMatrix(true, true);
      o.traverse((x) => { if (x.geometry) { const b = meshBox(x); if (b && !b.isEmpty()) box.union(b); } });
    }
    const s = { box, center: box.getCenter(new THREE.Vector3()), radius: Math.max(1e-4, box.getSize(new THREE.Vector3()).length() / 2) };
    if (box.isEmpty()) { box.setFromCenterAndSize(new THREE.Vector3(), new THREE.Vector3(1, 1, 1)); s.center.set(0, 0, 0); s.radius = 0.5; }
    sphereCache.set(obj, s);
    return s;
  }
  function fitGround() {
    const s = sphereOf(root, true);
    bounds.box.copy(s.box); bounds.c.copy(s.center); bounds.r = s.radius;
    if (s.box.isEmpty()) return;
    const r = s.radius;
    ground.visible = opts.shadow !== false;
    ground.position.set(s.center.x, s.box.min.y - r * 0.002, s.center.z);
    ground.scale.setScalar(r * 8);
    key.position.copy(s.center).addScaledVector(keyDir, r * 4);
    key.target.position.copy(s.center);
    Object.assign(key.shadow.camera, { left: -r * 1.4, right: r * 1.4, top: r * 1.4, bottom: -r * 1.4, near: r * 0.5, far: r * 9 });
    key.shadow.camera.updateProjectionMatrix();
    key.shadow.bias = -0.0004; key.shadow.normalBias = r * 0.006;
    camera.near = r / 200; camera.far = r * 120; camera.updateProjectionMatrix();
    if (controls) { controls.minDistance = r * 0.35; controls.maxDistance = r * 14; }
    contact?.fit(s.box, r);
    contactDirty = true;
    aoRadius();
    invalidate();
  }

  // ---------------------------------------------------------------- section planes with caps
  // Cut faces show the parts' inside (their back faces). Those are painted as a flat cap: a light
  // tint of the part's own colour with thin antialiased hatch lines, alternating direction from part
  // to part like a drawing, so the cut reads as solid material and neighbouring parts stay apart.
  // A mesh (or anything under an object) with userData.rxNoClip set, or passed to noClip(), is never
  // cut: balls rolling through a cut robot stay whole.
  const clipPlanes = [];
  // on: 1 while a plane is enabled; with none, back faces are drawn as ordinary faces again (most
  // CAD materials are double-sided, so without this a switched-off cut would leave hatching)
  const cap = { a: { value: new THREE.Color('#ebe4d9') }, b: { value: new THREE.Color('#b9ae9f') }, hatch: { value: 7 }, on: { value: 0 } };
  const capped = new Set(); // materials prepared for the cut (the stage frees them all on dispose)
  const pre = new WeakMap(); // material -> { side, obc, key } from before it was prepared
  const BASE_OBC = THREE.Material.prototype.onBeforeCompile, BASE_KEY = THREE.Material.prototype.customProgramCacheKey;
  let capN = 0, doubleSided = false;
  const mats = (o) => (Array.isArray(o.material) ? o.material : [o.material]).filter(Boolean);
  function prepClip(m) {
    // custom shader materials are left alone: their shaders may not have the chunks the cap needs
    if (!m || capped.has(m) || !clipPlanes.length || m.isShaderMaterial) return;
    capped.add(m);
    const dirSign = (capN++ & 1) ? 1 : -1;
    const prev = m.onBeforeCompile, prevKey = m.customProgramCacheKey;
    pre.set(m, { side: m.side, obc: prev, key: prevKey });
    m.onBeforeCompile = (sh, r) => {
      prev?.call(m, sh, r);
      const fs = sh.fragmentShader;
      if (!fs.includes('#include <tonemapping_fragment>')) return; // clipped, without a cap
      // unlit materials (MeshBasicMaterial) have no emissive term; some have no diffuseColor
      const col = /\bdiffuseColor\b/.test(fs) ? 'diffuseColor.rgb' : 'vec3(0.7)';
      const glow = /\btotalEmissiveRadiance\b/.test(fs) ? ' + totalEmissiveRadiance * 0.6' : '';
      sh.uniforms.rxCapA = cap.a; sh.uniforms.rxCapB = cap.b; sh.uniforms.rxHatch = cap.hatch; sh.uniforms.rxCapOn = cap.on;
      sh.fragmentShader = `uniform vec3 rxCapA; uniform vec3 rxCapB; uniform float rxHatch; uniform float rxCapOn;\n${fs.replace('#include <tonemapping_fragment>', `#include <tonemapping_fragment>
        if (!gl_FrontFacing && rxCapOn > 0.5) {
          float h = mod(gl_FragCoord.x ${dirSign > 0 ? '+' : '-'} gl_FragCoord.y, rxHatch) - rxHatch * 0.5;
          float line = 1.0 - smoothstep(0.55, 1.35, abs(h));
          vec3 base = mix(rxCapA, ${col}, 0.28);
          gl_FragColor.rgb = mix(base, rxCapB * mix(vec3(1.0), ${col}, 0.4), line * 0.85)${glow};
          gl_FragColor.a = 1.0;
        }`)}`;
    };
    m.customProgramCacheKey = () => `${prevKey ? prevKey.call(m) : ''}|rxcap${dirSign}`;
    m.side = THREE.DoubleSide;
    m.clippingPlanes = clipPlanes;
    m.clipShadows = true;
    m.needsUpdate = true;
  }
  /** A copy of a material that keeps its shader changes and the section-cut caps (use it instead of material.clone()). */
  function cloneMaterial(m) {
    const c = m.clone();
    if (m.onBeforeCompile !== BASE_OBC) { c.onBeforeCompile = m.onBeforeCompile; c.customProgramCacheKey = m.customProgramCacheKey; }
    if (capped.has(m)) { c.clippingPlanes = clipPlanes; capped.add(c); pre.set(c, pre.get(m)); }
    return c;
  }
  // every mesh under root that may be cut; subtrees marked rxNoClip are skipped
  function eachCuttable(fn, o = root) {
    if (o.userData?.rxNoClip) return;
    if (o.isMesh) fn(o);
    for (const c of o.children) eachCuttable(fn, c);
  }
  function prepAllClip() {
    if (clipPlanes.length) eachCuttable((o) => mats(o).forEach(prepClip));
  }
  // With no plane on, prepared materials go back to their own side, so no back face shows the cap.
  function setCapSides(on) {
    cap.on.value = on ? 1 : 0;
    if (on === doubleSided) return;
    doubleSided = on;
    for (const m of capped) {
      const s = on ? THREE.DoubleSide : pre.get(m)?.side ?? THREE.FrontSide;
      if (m.side !== s) { m.side = s; m.needsUpdate = true; }
    }
  }
  /** Keep objects (and everything under them) out of every section cut. yes = false cuts them again. */
  function noClip(objs, yes = true) {
    const copies = new Map();
    const uncut = (m) => { // a copy of a prepared material as it was before the cut
      if (!capped.has(m)) return m;
      if (!copies.has(m)) {
        const p = pre.get(m) || {}, c = m.clone();
        c.clippingPlanes = null; c.side = p.side ?? THREE.FrontSide;
        if (p.obc && p.obc !== BASE_OBC) { c.onBeforeCompile = p.obc; c.customProgramCacheKey = p.key || BASE_KEY; }
        copies.set(m, c);
      }
      return copies.get(m);
    };
    for (const x of (Array.isArray(objs) ? objs : [objs]).filter(Boolean)) {
      x.userData.rxNoClip = yes;
      if (yes) x.traverse((o) => { if (o.isMesh) o.material = Array.isArray(o.material) ? o.material.map(uncut) : uncut(o.material); });
    }
    if (!yes) prepAllClip();
    invalidate();
  }
  /** Add a model loaded with { add: false } (or anything else) to the stage: cut like the rest, ground refitted. */
  function add(obj) {
    root.add(obj);
    prepAllClip();
    fitGround();
    return obj;
  }
  /** sectionPlane(normal, constant, { enabled: false }) creates it switched off (materials untouched until enabled). */
  function sectionPlane(normal = [1, 0, 0], constant = 0, o = {}) {
    const plane = new THREE.Plane(v3(normal).normalize(), constant);
    let on = false;
    const enable = (yes) => {
      yes = !!yes;
      if (yes === on) return;
      on = yes;
      if (yes) { clipPlanes.push(plane); renderer.localClippingEnabled = true; prepAllClip(); setCapSides(true); }
      else { const i = clipPlanes.indexOf(plane); if (i >= 0) clipPlanes.splice(i, 1); if (!clipPlanes.length) setCapSides(false); }
      invalidate();
    };
    if (o.enabled !== false) enable(true);
    return {
      plane,
      get constant() { return plane.constant; },
      /** move the cut: keeps points where dot(normal, p) + constant >= 0 */
      set(c) { if (c !== plane.constant) { plane.constant = c; invalidate(); } },
      setNormal(n) { plane.normal.copy(v3(n).normalize()); invalidate(); },
      enable,
      get enabled() { return on; },
      remove() { enable(false); },
    };
  }
  cap.hatch.value = 7 * renderer.getPixelRatio();

  // ---------------------------------------------------------------- camera
  function setView(view) {
    if (view.pos) camera.position.copy(v3(view.pos));
    if (view.target) target.copy(v3(view.target));
    camera.lookAt(target);
    invalidate(false);
  }
  // Move the picture on the canvas without moving the camera, e.g. up out of the way of text
  // cards that cover the bottom of a phone screen. Fractions of the canvas; +y moves it up.
  // A scrolly's stage starts with the page runtime's shift (project.js sets el.rxShift to ctx.shift),
  // so views framed at mount already fit the part of the stage the step cards leave free.
  const shift = { x: 0, y: 0 };
  try { const s0 = el.rxShift?.(); if (s0) { shift.x = +s0[0] || 0; shift.y = +s0[1] || 0; } } catch { /* none */ }
  function applyShift() {
    const w = el.clientWidth, h = el.clientHeight;
    if (w && h && (shift.x || shift.y)) camera.setViewOffset(w, h, -shift.x * w, shift.y * h, w, h);
    else { camera.clearViewOffset(); }
  }
  function setShift(fx = 0, fy = 0) {
    if (fx === shift.x && fy === shift.y) return;
    shift.x = fx; shift.y = fy; applyShift(); invalidate(false);
  }
  function tweenCamera(view, seconds = 0.9) {
    const toPos = view.pos ? v3(view.pos) : camera.position.clone();
    const toTarget = view.target ? v3(view.target) : target.clone();
    if (reduced || seconds <= 0) { setView({ pos: toPos, target: toTarget }); return Promise.resolve(); }
    // orbit around the target rather than cutting straight through the model
    const s0 = new THREE.Spherical().setFromVector3(camera.position.clone().sub(target));
    const s1 = new THREE.Spherical().setFromVector3(toPos.clone().sub(toTarget));
    let dTheta = s1.theta - s0.theta;
    while (dTheta > Math.PI) dTheta -= Math.PI * 2;
    while (dTheta < -Math.PI) dTheta += Math.PI * 2;
    const t0 = target.clone(), sph = new THREE.Spherical();
    for (const tw of tweens) if (tw.camera) tweens.delete(tw); // a new move replaces the old one
    return new Promise((resolve) => {
      let t = 0;
      const tw = (dt) => {
        t = Math.min(1, t + dt / seconds);
        const k = easeInOut(t);
        target.lerpVectors(t0, toTarget, k);
        sph.set(s0.radius + (s1.radius - s0.radius) * k, s0.phi + (s1.phi - s0.phi) * k, s0.theta + dTheta * k);
        camera.position.setFromSpherical(sph).add(target);
        camera.lookAt(target);
        dirty = true;
        if (t >= 1) { tweens.delete(tw); resolve(); }
      };
      tw.camera = true;
      tweens.add(tw);
      wake();
    });
  }
  let lastFrame = null;
  /**
   * Fit obj (an Object3D or an array of them; default: every loaded model) in view. opts: pad (1.12), azimuth / elevation in
   * degrees (35 / 22; azimuth 0 looks from +Z, 90 from +X), or dir [x, y, z] from the model toward
   * the camera, duration in seconds (0 = jump), apply (false = only compute). Returns { pos, target }.
   */
  function frame(obj, o = {}) {
    const s = sphereOf(obj || root, o.refresh);
    let dir;
    if (o.dir) dir = v3(o.dir).normalize();
    else {
      const az = (o.azimuth ?? 35) * DEG, el = (o.elevation ?? 22) * DEG;
      dir = new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
    }
    const center = s.center.clone();
    if (o.offset) center.add(v3(o.offset));
    // tightest distance at which all eight corners of the bounding box fit the view; with the picture
    // shifted (setShift, e.g. clear of the step cards) it fits the part of the canvas left free
    const pad = o.pad ?? 1.12;
    const fx = 1 - 2 * Math.min(0.4, Math.abs(shift.x)), fy = 1 - 2 * Math.min(0.4, Math.abs(shift.y));
    const tv = (Math.tan((camera.fov * DEG) / 2) * fy) / pad, th = (Math.tan((camera.fov * DEG) / 2) * camera.aspect * fx) / pad;
    const fwd = dir.clone().negate();
    const right = new THREE.Vector3().crossVectors(fwd, Math.abs(dir.y) > 0.999 ? new THREE.Vector3(0, 0, -1) : new THREE.Vector3(0, 1, 0)).normalize();
    const up = new THREE.Vector3().crossVectors(right, fwd);
    let dist = s.radius * 0.25;
    const q = new THREE.Vector3();
    for (let i = 0; i < 8; i++) {
      q.set(i & 1 ? s.box.max.x : s.box.min.x, i & 2 ? s.box.max.y : s.box.min.y, i & 4 ? s.box.max.z : s.box.min.z).sub(center);
      const z = q.dot(dir);
      dist = Math.max(dist, z + Math.abs(q.dot(right)) / th, z + Math.abs(q.dot(up)) / tv);
    }
    const view = { pos: center.clone().addScaledVector(dir, dist), target: center };
    if (o.apply === false) return view;
    lastFrame = o.track === false ? null : { obj, opts: o };
    if (o.duration > 0) tweenCamera(view, o.duration); else setView(view);
    return view;
  }

  // ---------------------------------------------------------------- models and parts
  const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  /**
   * load(url, { add, pbr, shadows, detail, finish, rubber, carbon, printed, moulded (or smooth), anodized, metal, plain }):
   * the finish names take a regex (or string) on CAD part names: matching parts get that finish
   * (see FINISHES); `finish: 'printed'` sets the finish of every other part of this model.
   */
  async function load(url, o = {}) {
    const [buf] = await Promise.all([fetchBuffer(assetUrl(url)), envReady]);
    if (disposed) throw new Error('stage disposed while loading');
    const gltf = await loader.parseAsync(buf.slice(0), assetUrl(url).replace(/[^/]*$/, '').replace(/\?.*$/, ''));
    const obj = gltf.scene;
    obj.userData.rxModel = true;
    obj.userData.src = url;
    const cache = new Map();
    // fine surface detail is invisible at phone size: phones and tablets skip it (fewer texture reads)
    const detail = (opts.detail ?? !touch) !== false && o.detail !== false;
    // page-chosen finishes by part name, first match wins; then the GLB's own (material extras),
    // then the name guesses (wheels and belts are rubber), then the model default, then the colour
    const picks = FINISHES.map((f) => [f, toRx(o[f] ?? (f === 'moulded' ? o.smooth : null))]).filter(([, r]) => r);
    const fallback = FINISHES.includes(o.finish) ? o.finish : o.finish === 'smooth' ? 'moulded' : '';
    obj.updateWorldMatrix(true, true);
    obj.traverse((m) => {
      if (!m.isMesh) return;
      m.castShadow = o.shadows !== false; m.receiveShadow = o.shadows !== false;
      if (o.pbr === false) return;
      const names = nameChain(m);
      const picked = picks.find(([, r]) => r.test(names))?.[0] || '';
      const guess = RUBBER.test(names) ? 'rubber' : CARBON.test(names) ? 'carbon' : '';
      const fix = (mat) => {
        const own = mat.userData?.finish === 'smooth' ? 'moulded' : FINISHES.includes(mat.userData?.finish) ? mat.userData.finish : '';
        const chain = [picked, own, guess, fallback].filter(Boolean);
        const plain = chain[0] === 'plain'; // the colour's (or the next named) finish, no surface detail
        const kind = chain.find((x) => x !== 'plain') || '';
        const k = `${mat.uuid}|${kind}|${plain}`;
        if (!cache.has(k)) {
          const nm = cadMaterial(mat, kind);
          if ((!detail || plain) && nm !== mat) for (const t of ['bumpMap', 'roughnessMap']) nm[t] = null;
          cache.set(k, nm);
        }
        return cache.get(k);
      };
      m.material = Array.isArray(m.material) ? m.material.map(fix) : fix(m.material);
      const uvWant = [].concat(m.material).map((x) => x.userData?.rxUv).find(Boolean);
      if (uvWant && detail) projectUVs(m, uvWant[0], uvWant[1]);
    });
    for (const t of Object.values(TEX)) t.anisotropy = maxAniso;
    if (o.add !== false) root.add(obj);
    prepAllClip();
    fitGround();
    invalidate();
    return obj;
  }
  /** Top-most nodes whose name matches re (meshes, or groups for parts with several materials). */
  function part(re, within = root) {
    const rx = re instanceof RegExp ? new RegExp(re.source, re.flags.replace(/[gy]/g, '')) : new RegExp(String(re)); // no stateful g/y
    const out = [];
    const walk = (o) => {
      if (o !== within && rx.test(o.name)) { out.push(o); return; }
      for (const c of o.children) walk(c);
    };
    walk(within);
    return out;
  }
  function modelRootOf(o) { for (let p = o; p; p = p.parent) if (p.userData?.rxModel) return p; return null; }
  /**
   * Group that rotates objs about a real axis. point and dir are in the model's own frame
   * (metres, Y up: the GLB's coordinates; convert cad-axes.py output with cad.point / cad.dir).
   * point 'center' uses the parts' bounding-box centre (only for parts that are round about the
   * axis, like wheels and gears). Returns a THREE.Group with setAngle(radians) and .axis.
   */
  function pivot(objs, point = 'center', dir = [0, 0, 1], o = {}) {
    const list = (Array.isArray(objs) ? objs : [objs]).filter(Boolean);
    if (!list.length) throw new Error('pivot: no parts (check the part() pattern)');
    const first = list[0], parent = first.parent;
    const frameObj = o.frame || modelRootOf(first) || scene;
    frameObj.updateWorldMatrix(true, false);
    parent.updateWorldMatrix(true, false);
    let worldPoint;
    if (point === 'center' || point == null) {
      const box = new THREE.Box3();
      for (const x of list) box.expandByObject(x);
      worldPoint = box.getCenter(new THREE.Vector3());
    } else worldPoint = frameObj.localToWorld(v3(point));
    const worldDir = v3(dir).normalize().transformDirection(frameObj.matrixWorld);
    const inv = new THREE.Matrix4().copy(parent.matrixWorld).invert();
    const g = new THREE.Group();
    g.name = `pivot:${first.name}`;
    g.position.copy(worldPoint).applyMatrix4(inv);
    parent.add(g);
    g.updateWorldMatrix(true, false);
    for (const x of list) g.attach(x);
    const axis = worldDir.clone().transformDirection(inv).normalize();
    const q0 = g.quaternion.clone();
    let angle = 0;
    g.axis = axis;
    g.setAngle = (a) => { if (a === angle) return g; angle = a; g.quaternion.setFromAxisAngle(axis, a).premultiply(q0); invalidate(); return g; };
    Object.defineProperty(g, 'angle', { get: () => angle });
    return g;
  }
  /** Light parts up (emissive tint). Returns a function that restores them. color null clears. */
  function highlight(objs, color = '#ff6b35', o = {}) {
    const meshes = [];
    for (const x of (Array.isArray(objs) ? objs : [objs]).filter(Boolean)) x.traverse((m) => { if (m.isMesh) meshes.push(m); });
    const clear = () => {
      for (const m of meshes) {
        if (!m.userData.rxOrig) continue;
        for (const x of Array.isArray(m.material) ? m.material : [m.material]) { capped.delete(x); disposeMaterial(x); }
        m.material = m.userData.rxOrig;
        delete m.userData.rxOrig;
      }
      invalidate(false);
    };
    if (color == null) { clear(); return () => {}; }
    for (const m of meshes) {
      if (!m.userData.rxOrig) {
        m.userData.rxOrig = m.material;
        m.material = Array.isArray(m.material) ? m.material.map(cloneMaterial) : cloneMaterial(m.material);
      }
      let cut = true;
      for (let p = m; p; p = p.parent) if (p.userData?.rxNoClip) cut = false;
      for (const mat of Array.isArray(m.material) ? m.material : [m.material]) {
        if (mat.emissive) { mat.emissive.set(color); mat.emissiveIntensity = o.intensity ?? 0.45; }
        if (cut) prepClip(mat);
      }
    }
    invalidate(false);
    return clear;
  }

  // ---------------------------------------------------------------- lifecycle
  function onFrame(fn) {
    frameFns.add(fn);
    wake();
    return () => { frameFns.delete(fn); invalidate(); };
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    el.removeEventListener('rx:unmount', dispose);
    if (raf) cancelAnimationFrame(raf);
    clearTimeout(idleT);
    frameFns.clear(); tweens.clear(); capped.clear();
    io.disconnect(); ro.disconnect();
    document.removeEventListener('visibilitychange', onVis);
    controls?.dispose();
    disposeTree(scene);
    envTex?.dispose();
    contact?.dispose();
    key.shadow.map?.dispose();
    composer?.renderTarget1?.dispose(); composer?.renderTarget2?.dispose();
    composer?.passes.forEach((p) => p.dispose?.());
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove(); hintEl?.remove();
  }

  // the page runtime (project.js) sends rx:unmount when it unmounts a block or its module fails,
  // so a stage is freed even if the module forgot to return dispose()
  el.addEventListener('rx:unmount', dispose, { once: true });

  resize();
  return {
    THREE, scene, camera, renderer, controls, root, el, canvas, ground, light: key, lights: { key, fill, rim }, reducedMotion: reduced, isTouch: touch,
    load, frame, setView, tweenCamera, setShift, onFrame, invalidate, flush, render: () => { sceneDirty = true; lastShadow = -1e9; draw(false); },
    highlight, sectionPlane, part, pivot, dispose, ready: envReady, cloneMaterial, noClip, add,
    bounds: (obj, refresh) => sphereOf(obj || root, refresh),
    fitGround,
    /** colours of the section cap (CSS colours) */
    setCapColor(a, b = a) { cap.a.value.set(a); cap.b.value.set(b); invalidate(false); },
  };
}
