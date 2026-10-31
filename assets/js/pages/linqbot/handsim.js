// The hand-to-arm pipeline of our AR mode (github.com/amzoeee/soma-hackathon, robot/), run once over
// a drawn hand that follows a fixed script, 30 frames a second. Plain math, no three.js, no camera.
// The scroll then shows frame n of this run, so the picture is a pure function of the scroll.
//   robot/src/tracking/hand_tracker.py     hands under 4% of the frame dropped, the last good hand held
//                                          24 frames, fist latched on Closed_Fist >= 0.60 and let go once
//                                          the hand is clearly not a fist (an open label >= 0.35, or the
//                                          label and the finger-curl check both say no)
//   robot/src/mapping/relative_teleop.py   target = anchor + scale x (hand - origin): image x -> y (x 0.6),
//                                          image y -> z (x -0.5), hand size -> x (x 0.5 on -size); EMA 0.15
//                                          (0.08 for size) and dead bands 0.006 (0.010 for size); clutch after
//                                          18 fist frames, released after 6 open ones; pinch = thumb to index
//                                          over twice the hand size, EMA 0.25
//   robot/src/main.py, config/settings.py  target clamped into 0.12 to 0.30 m forward, 0.15 m either side,
//                                          0.05 to 0.30 m up (grown to hold the start pose); IK seeded from
//                                          the current angles, a miss over 3 cm keeps the last answer; no
//                                          joint more than 5 degrees per frame; wrist roll locked
// Only the hand is drawn: its path, its shape changes and the gesture label a tracker would give it
// are a script. Everything after that is the code's rules.
import { ROLL, SEEDS, CAN, fk, carry, uncarry, toArm, toRepo, ik, ikBest, gripAngleFor, clamp, lerp } from './kin.js';

export const FPS = 30;
export const C = {
  minHandSize: 0.04, holdFrames: 24, fistEnter: 0.6, fistExit: 0.35,
  scale: { x: 0.5, y: 0.6, z: 0.5 }, alphaXY: 0.15, alphaZ: 0.08, dbXY: 0.006, dbZ: 0.01, alphaGrip: 0.25,
  clutchOn: 18, clutchOff: 6,
  box: { x: [0.12, 0.3], y: [-0.15, 0.15], z: [0.05, 0.3] },
  home: [0.2, 0, 0.15], maxStep: 5, miss: 0.03,
};
export const ASPECT = 512 / 378; // the Eye camera's frame

// an open right hand seen from behind (thumb on the left), wrist at 0, the middle knuckle 1 unit above
const OPEN = [[0, 0], [-0.4, -0.18], [-0.75, -0.35], [-1.05, -0.52], [-1.35, -0.72], [-0.3, -0.95], [-0.36, -1.4], [-0.4, -1.7], [-0.43, -1.95],
  [0, -1], [0, -1.5], [0, -1.82], [0, -2.1], [0.28, -0.95], [0.32, -1.42], [0.35, -1.7], [0.37, -1.95], [0.52, -0.82], [0.62, -1.15], [0.68, -1.38], [0.72, -1.58]];
const over = (o) => OPEN.map((p, i) => o[i] || p);
const PINCH = over({ 3: [-0.62, -1.05], 4: [-0.52, -1.28], 7: [-0.46, -1.45], 8: [-0.5, -1.3] });
const FIST = over({ 3: [-0.45, -0.75], 4: [-0.2, -0.95], 6: [-0.34, -1.25], 7: [-0.25, -1.1], 8: [-0.2, -0.85], 10: [0, -1.3], 11: [0.05, -1.1], 12: [0.05, -0.8],
  14: [0.3, -1.25], 15: [0.3, -1.05], 16: [0.25, -0.8], 18: [0.55, -1.05], 19: [0.5, -0.9], 20: [0.42, -0.75] });
export const BONES = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [0, 9], [9, 10], [10, 11], [11, 12], [0, 13], [13, 14], [14, 15], [15, 16], [0, 17], [17, 18], [18, 19], [19, 20], [5, 9], [9, 13], [13, 17]];

/** the hand shape for form f: 0 open, 1 pinch, 2 fist, blended in between */
export function shape(f) {
  const [A, B, k] = f <= 1 ? [OPEN, PINCH, clamp(f, 0, 1)] : [PINCH, FIST, clamp(f - 1, 0, 1)];
  return A.map((p, i) => [lerp(p[0], B[i][0], k), lerp(p[1], B[i][1], k)]);
}
/** landmarks in the camera image (0..1, y down) for a wrist at (x, y), hand size s, form f */
export function landmarks(x, y, s, f) {
  return shape(f).map(([a, b]) => [x + (a * s) / ASPECT, y + b * s]);
}

// ------------------------------------------------------------------ the script (seconds)
// Six scroll steps, each a stretch of this timeline. Channels ease between keyframes.
export const STEPS = [0, 1.5, 4.5, 7.5, 12.5, 16.5, 22.5];
const KEYS = {
  x: [[0, 0.5], [1.6, 0.5], [3.2, 0.35], [13.8, 0.35], [15.4, 0.5], [17.3, 0.5], [19.1, 0.7]],
  y: [[0, 0.5], [1.6, 0.5], [3.2, 0.4], [7.6, 0.4], [9.0, 0.66], [10.6, 0.66], [11.8, 0.46], [13.8, 0.46], [15.4, 0.5], [17.3, 0.5], [19.1, 0.7], [20.5, 0.7], [21.3, 0.55]],
  s: [[0, 0.2], [4.6, 0.2], [6.2, 0.12], [13.8, 0.12], [15.4, 0.2]],
  f: [[0, 0], [9.3, 0], [10.0, 1], [12.6, 1], [13.0, 2], [16.6, 2], [16.9, 1], [19.5, 1], [20.1, 0]],
};
const APPEAR = 0.4; // the hand comes into the camera's view
const ease = (t) => t * t * (3 - 2 * t);
function channel(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i];
    if (t <= t1) { const [t0, v0] = keys[i - 1]; return lerp(v0, v1, ease((t - t0) / (t1 - t0))); }
  }
  return keys.at(-1)[1];
}
export function handAt(t) {
  if (t < APPEAR) return null;
  const f = channel(KEYS.f, t);
  return { x: channel(KEYS.x, t), y: channel(KEYS.y, t), s: channel(KEYS.s, t), f,
    // the label a gesture recognizer would give this shape
    gesture: f < 0.5 ? { name: 'Open_Palm', score: 0.9 } : f >= 1.6 ? { name: 'Closed_Fist', score: 0.9 } : { name: 'None', score: 0 } };
}

// ------------------------------------------------------------------ the pipeline (our code, ported)
const OPEN_LABELS = new Set(['Open_Palm', 'Victory', 'Thumb_Up', 'Pointing_Up']);
function tracker() {
  let last = null, missed = 0, latched = false;
  return (lm, g) => {
    const held = () => { missed++; if (last && missed <= C.holdFrames) return last; if (missed > C.holdFrames) last = null; return null; };
    if (!lm) return held();
    const size = Math.hypot(lm[9][0] - lm[0][0], lm[9][1] - lm[0][1]);
    if (size < C.minHandSize) return held();
    const gFist = g.name === 'Closed_Fist';
    let curled = 0;
    for (const i of [8, 12, 16, 20]) if (Math.hypot(lm[i][0] - lm[9][0], lm[i][1] - lm[9][1]) < size * 0.55) curled++;
    const geom = curled >= 4;
    if (latched) { if ((OPEN_LABELS.has(g.name) && g.score >= C.fistExit) || (!gFist && !geom)) latched = false; }
    else if (gFist && g.score >= C.fistEnter) latched = true;
    missed = 0;
    return (last = { lm, size, fist: latched, gesture: g.name !== 'None' ? g.name : latched ? 'Closed_Fist' : 'None' });
  };
}
function teleop(seed) {
  const ema = (a) => ({ a, v: null, up(x) { this.v = this.v == null ? x : this.a * x + (1 - this.a) * this.v; return this.v; } });
  const fx = ema(C.alphaXY), fy = ema(C.alphaXY), fz = ema(C.alphaZ), fg = ema(C.alphaGrip);
  fg.v = 1;
  const target = { x: seed[0], y: seed[1], z: seed[2], g: 1 };
  let anchor = seed.slice(), origin = null, engaged = false, fist = false, fistN = 0, openN = 0;
  const db = { x: null, y: null, z: null };
  const band = (v, k, b) => { if (db[k] == null || Math.abs(v - db[k]) >= b) db[k] = v; return db[k]; };
  return (t) => {
    const out = (clutched, extra) => ({ x: target.x, y: target.y, z: target.z, g: target.g, clutched, fistN, openN, origin, anchor, ...extra });
    if (!t) return out(fist, { valid: false });
    const hx = t.lm[0][0], hy = t.lm[0][1], hz = -t.size;
    const pinch = clamp(Math.hypot(t.lm[4][0] - t.lm[8][0], t.lm[4][1] - t.lm[8][1]) / (t.size * 2 + 1e-6), 0, 1);
    const g = fg.up(pinch);
    if (t.fist) { fistN++; openN = 0; if (!fist && fistN >= C.clutchOn) fist = true; }
    else { openN++; fistN = 0; if (fist && openN >= C.clutchOff) fist = false; }
    if (fist) {
      if (engaged) { engaged = false; origin = null; }
      target.g = g;
      return out(true, { valid: true, pinch });
    }
    let x, y, z;
    if (!engaged) {
      fx.v = hx; fy.v = hy; fz.v = hz; db.x = hx; db.y = hy; db.z = hz;
      x = hx; y = hy; z = hz;
      origin = [hx, hy, hz];
      anchor = [target.x, target.y, target.z];
      engaged = true;
    } else {
      x = band(fx.up(hx), 'x', C.dbXY); y = band(fy.up(hy), 'y', C.dbXY); z = band(fz.up(hz), 'z', C.dbZ);
    }
    target.x = anchor[0] + C.scale.x * (z - origin[2]);
    target.y = anchor[1] + C.scale.y * (x - origin[0]);
    target.z = anchor[2] + C.scale.z * -(y - origin[1]);
    target.g = g;
    return out(false, { valid: true, pinch, hand: [x, y, z] });
  };
}

/**
 * Runs the script through the pipeline. canAt: where the can stands (URDF x, y). Returns
 * { frames, home, box } with one frame per 1/30 s: q (6 joint angles, degrees), can { b, a } (bottom
 * centre and axis, arm frame), lm (landmarks or null) and the readout values.
 */
export function runHand(canAt = [0.24, -0.09]) {
  const HOME = ikBest(toArm(C.home), SEEDS).q;
  let q = [...HOME.slice(0, 4), ROLL, 0];
  const seed = toRepo(fk(q));
  const box = {};
  for (const [i, k] of ['x', 'y', 'z'].entries()) box[k] = [Math.min(C.box[k][0], seed[i] - 0.01), Math.max(C.box[k][1], seed[i] + 0.01)];
  const track = tracker(), tele = teleop(seed);
  // the can, standing
  const cb = toArm([canAt[0], canAt[1], 0]); cb[1] = 0;
  const can = { b: cb, a: [0, 1, 0], held: null, fall: null };
  const contact = gripAngleFor(CAN.r * 2 + 0.004);
  let sol = q.slice(0, 4);
  const frames = [];
  const dt = 1 / FPS, N = Math.round(STEPS.at(-1) * FPS);
  for (let n = 0; n <= N; n++) {
    const t = n * dt;
    const h = handAt(t);
    const lm = h ? landmarks(h.x, h.y, h.s, h.f) : null;
    const tr = track(lm, h ? h.gesture : null);
    const tg = tele(tr);
    const ee = [clamp(tg.x, ...box.x), clamp(tg.y, ...box.y), clamp(tg.z, ...box.z)];
    const r = ik(toArm(ee), [...q.slice(0, 4), ROLL], { iters: 60 });
    if (r.miss <= C.miss) sol = r.q.slice(0, 4);
    const nq = sol.map((v, i) => clamp(v, q[i] - C.maxStep, q[i] + C.maxStep));
    let jaw = clamp((1 - clamp(tg.g, 0, 1)) * 95, q[5] - 4.75, q[5] + 4.75);
    const pose = [...nq, ROLL, 0];
    // grasp: a jaw closing on a standing can between its tips stops at contact and carries it
    if (can.held) {
      if (jaw < contact - 8) { can.held = null; can.fall = { v: 0 }; }
      else jaw = Math.min(jaw, contact);
    } else if (!can.fall && jaw >= contact - 1 && q[5] < contact + 0.5 && can.a[1] > Math.cos(0.3)) {
      const p = fk(pose);
      const hy = p[1] - can.b[1];
      if (Math.hypot(p[0] - can.b[0], p[2] - can.b[2]) < 0.025 && hy > CAN.h * 0.2 && hy < CAN.h * 1.02) {
        jaw = contact;
        const top = can.b.map((v, i) => v + can.a[i] * CAN.h);
        can.held = { b: uncarry(pose, can.b), t: uncarry(pose, top) };
      }
    }
    pose[5] = jaw;
    if (can.held) {
      can.b = carry(pose, can.held.b, 5);
      const top = carry(pose, can.held.t, 5);
      can.a = top.map((v, i) => (v - can.b[i]) / CAN.h);
    }
    if (can.fall) {
      can.fall.v += 9.81 * dt;
      can.b = [can.b[0], Math.max(0, can.b[1] - can.fall.v * dt), can.b[2]];
      if (can.b[1] <= 0) {
        if (can.a[1] > Math.cos((20 * Math.PI) / 180)) can.a = [0, 1, 0];
        can.fall = null;
      }
    }
    q = pose;
    frames.push({
      t, q: q.slice(), can: { b: can.b.slice(), a: can.a.slice(), held: !!can.held }, lm, h,
      hud: { clutched: tg.clutched, detected: !!tr, gesture: tr ? tr.gesture : 'None', fistN: tg.fistN, openN: tg.openN,
        target: [tg.x, tg.y, tg.z], ee, g: tg.g, pinch: tg.pinch ?? null, origin: tg.origin, anchor: tg.anchor, hand: tg.hand || null },
    });
  }
  return { frames, seed, box, contact };
}
