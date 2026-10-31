// Kinematics of the SO-101 arm in Jerry's LinqBot CAD, shared by the page's demos.
// Plain math, no three.js, so it can be tested on its own.
//
// Arm frame = the GLB's frame (metres, Y up, base bottom at y = 0; the arm points along +Z in the
// CAD pose and +X is its left). Joint origins are the ST3215 servo horns in the CAD and the axes
// are the servo axes (checked against the STEP and the Golden Retriever rig of the same arm).
// Angles are degrees, right-handed about the listed axis; all zeros is the CAD pose (folded).
//
// Our repo's kinematics use the SO-101 URDF frame (base_link: +x forward, +y left, +z up). Matching
// the URDF joint positions to the servo positions in the CAD gives
//   arm X = y_u,  arm Y = z_u + 0.003,  arm Z = x_u - 0.031
// and the URDF zero pose (upper arm up, forearm level) is (0, 90, -90, 0, 0) here: the elbow,
// wrist flex and wrist roll axes land within 2 mm of the URDF's. The tool point is the URDF's
// gripper_frame_link carried back into the CAD pose.

export const DEG = Math.PI / 180;
export const JOINTS = [
  { key: 'pan', name: 'Shoulder pan', origin: [-0.0001, 0.0658, 0.0076], axis: [0, 1, 0], min: -90, max: 90 },
  { key: 'lift', name: 'Shoulder lift', origin: [-0.017, 0.1198, 0.0389], axis: [1, 0, 0], min: 0, max: 100 },
  { key: 'elbow', name: 'Elbow', origin: [-0.0155, 0.1484, -0.0736], axis: [1, 0, 0], min: -170, max: 0 },
  { key: 'wflex', name: 'Wrist flex', origin: [-0.0134, 0.1522, 0.0606], axis: [1, 0, 0], min: -100, max: 100 },
  { key: 'wroll', name: 'Wrist roll', origin: [0.0071, 0.1521, 0.1221], axis: [0, 0, 1], min: -180, max: 180 },
  { key: 'grip', name: 'Gripper', origin: [0.0261, 0.1721, 0.1457], axis: [1, 0, 0], min: 0, max: 95 },
];
export const TCP0 = [0.0071, 0.1456, 0.2193];
// gripper angle: 0 = jaw wide open as modelled, 95 = closed. Gap between the jaw tips (from the CAD)
const GAP = [[0, 0.13], [30, 0.093], [55, 0.06], [70, 0.04], [85, 0.02], [95, 0]];
export function gripAngleFor(width) {
  for (let i = 1; i < GAP.length; i++) {
    const [a0, g0] = GAP[i - 1], [a1, g1] = GAP[i];
    if (width >= g1) return a0 + ((g0 - width) / (g0 - g1)) * (a1 - a0);
  }
  return 95;
}

export const ROLL = 90; // wrist roll held fixed; at 90 the jaws close sideways around a standing can
export const SEEDS = [[0, 60, -90, 20, ROLL], [0, 90, -90, 0, ROLL], [0, 40, -120, 60, ROLL], [0, 20, -60, 70, ROLL], [0, 80, -140, 60, ROLL]];
export const CAN = { r: 0.029, h: 0.13 }; // a prop, about the size of the cans in our footage

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };

export const toArm = ([x, y, z]) => [y, z + 0.003, x - 0.031];
export const toRepo = ([X, Y, Z]) => [Z + 0.031, X, Y - 0.003];

function rot(p, o, a, t) {
  const c = Math.cos(t), s = Math.sin(t);
  const v0 = p[0] - o[0], v1 = p[1] - o[1], v2 = p[2] - o[2];
  const d = a[0] * v0 + a[1] * v1 + a[2] * v2;
  const c0 = a[1] * v2 - a[2] * v1, c1 = a[2] * v0 - a[0] * v2, c2 = a[0] * v1 - a[1] * v0;
  return [o[0] + v0 * c + c0 * s + a[0] * d * (1 - c), o[1] + v1 * c + c1 * s + a[1] * d * (1 - c), o[2] + v2 * c + c2 * s + a[2] * d * (1 - c)];
}
/** Any point of link `from` (CAD pose coordinates) carried through joints 0..from-1. */
export function carry(q, p, from = 5) {
  for (let i = Math.min(from, 5) - 1; i >= 0; i--) p = rot(p, JOINTS[i].origin, JOINTS[i].axis, (q[i] || 0) * DEG);
  return p;
}
/** The inverse of carry(q, p, 5): a point in the arm frame back into the CAD pose of the gripper link. */
export function uncarry(q, p) {
  for (let i = 0; i < 5; i++) p = rot(p, JOINTS[i].origin, JOINTS[i].axis, -(q[i] || 0) * DEG);
  return p;
}
/** Tool point in the arm frame for joint angles q (degrees). */
export const fk = (q) => carry(q, TCP0, 5);
/** Unit vector the gripper points along (the wrist roll axis) in the arm frame. */
export function pointing(q) {
  const a = carry(q, JOINTS[4].origin, 4), b = carry(q, [JOINTS[4].origin[0], JOINTS[4].origin[1], JOINTS[4].origin[2] + 0.1], 4);
  return [(b[0] - a[0]) / 0.1, (b[1] - a[1]) / 0.1, (b[2] - a[2]) / 0.1];
}

/**
 * Position-only IK for the tool point over pan, lift, elbow and wrist flex, warm-started from
 * `seed`, like the robot's ikpy solver (4 joints, seeded from the current angles every call).
 * Damped least squares with a numerical Jacobian, steps capped at 5 degrees, joint limits
 * enforced. Returns { q, miss } with miss in metres.
 */
export function ik(target, seed, o = {}) {
  const iters = o.iters ?? 60, lambda = (o.lambda ?? 5e-4) ** 2, h = 0.05;
  const q = seed.slice();
  let p = fk(q);
  let miss = Math.hypot(target[0] - p[0], target[1] - p[1], target[2] - p[2]);
  for (let it = 0; it < iters && miss > (o.tol ?? 1e-4); it++) {
    const e = [target[0] - p[0], target[1] - p[1], target[2] - p[2]];
    const Jc = [];
    for (let j = 0; j < 4; j++) {
      const qq = q.slice(); qq[j] += h;
      const pp = fk(qq);
      Jc.push([(pp[0] - p[0]) / h, (pp[1] - p[1]) / h, (pp[2] - p[2]) / h]);
    }
    // dq = J^T (J J^T + lambda I)^-1 e  (3x3 solve)
    const A = [[lambda, 0, 0], [0, lambda, 0], [0, 0, lambda]];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) for (let j = 0; j < 4; j++) A[r][c] += Jc[j][r] * Jc[j][c];
    const y = solve3(A, e);
    if (!y) break;
    for (let j = 0; j < 4; j++) {
      let d = Jc[j][0] * y[0] + Jc[j][1] * y[1] + Jc[j][2] * y[2];
      d = clamp(d, -5, 5);
      q[j] = clamp(q[j] + d, JOINTS[j].min, JOINTS[j].max);
    }
    p = fk(q);
    miss = Math.hypot(target[0] - p[0], target[1] - p[1], target[2] - p[2]);
  }
  return { q, miss, p };
}
function solve3(A, b) {
  const [[a, b1, c], [d, e, f], [g, h, i]] = A;
  const det = a * (e * i - f * h) - b1 * (d * i - f * g) + c * (d * h - e * g);
  if (Math.abs(det) < 1e-18) return null;
  const inv = [
    [(e * i - f * h) / det, (c * h - b1 * i) / det, (b1 * f - c * e) / det],
    [(f * g - d * i) / det, (a * i - c * g) / det, (c * d - a * f) / det],
    [(d * h - e * g) / det, (b1 * g - a * h) / det, (a * e - b1 * d) / det],
  ];
  return [0, 1, 2].map((r) => inv[r][0] * b[0] + inv[r][1] * b[1] + inv[r][2] * b[2]);
}

/** Solve from several seeds and keep the best (used once, for presets and start poses). */
export function ikBest(target, seeds, o) {
  let best = null;
  for (const s of seeds) {
    const r = ik(target, s, { iters: 200, ...o });
    if (!best || r.miss < best.miss) best = r;
  }
  return best;
}
