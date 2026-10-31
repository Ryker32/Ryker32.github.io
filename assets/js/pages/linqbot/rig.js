// Shared rig for the LinqBot scrollies: loads the SO-101 from Jerry's CAD (screws and the driver PCB
// left out, nothing else changed) and turns each of its seven links about the servo axis it rides
// on in that CAD. The math lives in kin.js; this file adds the three.js side: the model, nested
// pivots, the table and can props, and small helpers the modules share.
import * as THREE from 'three';
import { JOINTS, TCP0, DEG, fk } from './kin.js';

export * from './kin.js';
export const MODEL = '/assets/models/linqbot/arm.glb';

/**
 * Loads the arm into the stage and rigs it. Returns
 *   model, links[0..6], pivots[0..5], angles, set(i, deg), pose([deg...]), grip (Object3D at the tool point)
 */
export async function loadArm(stage, o = {}) {
  const model = await stage.load(MODEL, { add: o.add });
  const links = [0, 1, 2, 3, 4, 5, 6].map((i) => {
    const a = stage.part(new RegExp(`^anim_lq_${i}_SO101_L${i}_`), model);
    if (!a.length) throw new Error(`rig: link L${i} not found`);
    return a;
  });
  // nested pivots, innermost first, so each joint carries everything beyond it
  let child = null;
  const pivots = [];
  for (let i = 5; i >= 0; i--) {
    const j = JOINTS[i];
    child = stage.pivot([...links[i + 1], ...(child ? [child] : [])], j.origin, j.axis);
    pivots[i] = child;
  }
  const grip = new THREE.Object3D();
  grip.name = 'tool-point';
  grip.position.set(...TCP0);
  model.add(grip);
  pivots[4].attach(grip);
  const angles = [NaN, NaN, NaN, NaN, NaN, NaN];
  const arm = {
    model, links, pivots, grip, angles,
    set(i, deg) { if (angles[i] === deg) return; angles[i] = deg; pivots[i].setAngle(deg * DEG); },
    pose(a) { for (let i = 0; i < 6; i++) if (a[i] != null) arm.set(i, a[i]); },
    /** tool point in the arm frame, from kin.js (matches grip's world position with the model at the origin) */
    tcp() { return fk(angles); },
    all: links.flat(),
  };
  arm.pose([0, 0, 0, 0, 0, 0]);
  return arm;
}

// ------------------------------------------------------------------ props (not CAD)
function canTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#1f4fa8'; g.fillRect(0, 0, 256, 128);
  g.fillStyle = '#d8dde6'; g.fillRect(0, 50, 256, 26);
  g.fillStyle = '#e8b21f'; g.fillRect(0, 76, 256, 5);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
/** A table top (y = 0 is its surface) and a can with its origin at the bottom centre. */
export function props(stage, o = {}) {
  const table = new THREE.Mesh(
    new THREE.CylinderGeometry(o.tableR ?? 0.5, o.tableR ?? 0.5, 0.018, 72),
    new THREE.MeshStandardMaterial({ color: '#4a4037', roughness: 0.85, metalness: 0 }),
  );
  table.position.y = -0.009 - 0.0004;
  table.receiveShadow = true;
  table.name = 'table';
  stage.root.add(table);
  const side = new THREE.MeshStandardMaterial({ map: canTexture(), roughness: 0.35, metalness: 0.55 });
  const lid = new THREE.MeshStandardMaterial({ color: '#c9ced6', roughness: 0.3, metalness: 0.9 });
  const can = new THREE.Mesh(new THREE.CylinderGeometry(0.029, 0.029, 0.13, 40, 1), [side, lid, lid]);
  can.geometry.translate(0, 0.065, 0);
  can.castShadow = true; can.receiveShadow = true;
  can.name = 'can';
  stage.root.add(can);
  const up = new THREE.Vector3(0, 1, 0), ax = new THREE.Vector3();
  /** place the can: b = bottom centre, a = axis (arm frame, metres) */
  can.place = (b, a) => {
    ax.set(a[0], a[1], a[2]).normalize();
    can.quaternion.setFromUnitVectors(up, ax);
    can.position.set(b[0], b[1], b[2]);
  };
  return { table, can };
}

/** An invisible box (arm frame, metres) for stage.frame() to fit, so a view frames the space the arm works in. */
export function fitBox(stage, min, max) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(max[0] - min[0], max[1] - min[1], max[2] - min[2]), new THREE.MeshBasicMaterial());
  m.visible = false;
  m.position.set((min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2);
  stage.scene.add(m);
  return m;
}

/** A camera view framed once, at rest, and cached until the stage changes shape. */
export function cachedView(stage, el, obj, o) {
  let view = null, aspect = 0;
  return () => {
    const a = el.clientWidth / Math.max(1, el.clientHeight);
    if (!view || a !== aspect) {
      aspect = a;
      const v = stage.frame(obj, { ...o, pad: typeof o.pad === 'function' ? o.pad(a) : o.pad, apply: false });
      view = { t: v.target.clone(), s: new THREE.Spherical().setFromVector3(v.pos.clone().sub(v.target)) };
    }
    return view;
  };
}
/** Place the camera between two cached views (k 0..1) with an extra turn of `drift` radians. */
export function placeView(stage, a, b, k, drift = 0) {
  let dT = b.s.theta - a.s.theta;
  while (dT > Math.PI) dT -= 2 * Math.PI;
  while (dT < -Math.PI) dT += 2 * Math.PI;
  const target = a.t.clone().lerp(b.t, k);
  const sp = new THREE.Spherical(a.s.radius + (b.s.radius - a.s.radius) * k, a.s.phi + (b.s.phi - a.s.phi) * k, a.s.theta + dT * k + drift);
  stage.setView({ pos: new THREE.Vector3().setFromSpherical(sp).add(target), target });
}

export function style(id, css) {
  if (document.getElementById(id)) return;
  const s = document.createElement('style');
  s.id = id;
  s.textContent = css;
  document.head.appendChild(s);
}
export const h = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
/** writes text only when it changed */
export function writer() {
  const shown = new Map();
  return (node, text, key = node) => { if (shown.get(key) !== text) { node.textContent = text; shown.set(key, text); } };
}

export { THREE };
