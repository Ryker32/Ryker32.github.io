// "Try it with your own hand": the AR-glasses control mode of LinqBot, run in the browser on the
// reader's webcam. Jerry's explicit exception to the scroll-only rule (Sept 27: "re-include the
// interactive thing with the hand and the webcam"), restored from the pre-scroll hand-teleop module.
//
// Nothing happens until the reader presses Start camera: mounting only draws the start card (the
// poster and a button). The click asks for the camera; only once the camera is granted does the
// arm model load and the hand tracker (MediaPipe, about 8 MB) download. The camera stops when the
// demo scrolls out of view, on Stop camera, and when the block is unmounted. With no camera, a
// blocked camera, no WebGL or a tracker that will not load, the card says so and nothing else runs.
//
// Everything after the camera follows our code in github.com/amzoeee/soma-hackathon (the constants
// are shared with the scroll animation through handsim.js):
//   robot/src/tracking/hand_tracker.py  one MediaPipe GestureRecognizer in VIDEO mode, hands under
//                                       4% of the frame dropped, the last good hand held 24 frames,
//                                       fist latched on Closed_Fist >= 0.60, released on an open hand >= 0.35
//   robot/src/mapping/relative_teleop.py  relative mapping, EMA and dead bands per axis, clutch debounce
//                                       (18 frames on, 6 off), proportional pinch
//   robot/src/main.py, config/settings.py  workspace box, IK seeded from the current angles (a miss over
//                                       3 cm keeps the last solution), 5 degrees per step per joint,
//                                       wrist roll locked
// The one change: the glasses' camera looks out from the operator's head toward the arm, and a
// webcam looks back at the reader, so the left/right and reach signs are flipped to feel natural.
// Frames never leave the page.
import { createStage } from '/assets/js/lib/stage.js';
import { THREE, loadArm, props, fitBox, style, h } from './rig.js';
import { ROLL, SEEDS, CAN, DEG, fk, toArm, toRepo, ik, ikBest, gripAngleFor, clamp } from './kin.js';
import { C as SIM, BONES } from './handsim.js';

const MP = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21';
const TASK = '/assets/models/linqbot/gesture_recognizer.task';
const POSTER = '/assets/models/linqbot/poster-teleop.webp';
const C = { ...SIM, minConf: 0.15, fps: 30 };
const CAN_HOME = [-0.07, 0, 0.204]; // arm frame: ahead and a little to the arm's right, in easy reach (a prop)
const OPEN = new Set(['Open_Palm', 'Victory', 'Thumb_Up', 'Pointing_Up']);

const CSS = `
.lq-cam-card { position: absolute; inset: 0; z-index: 6; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
  padding: 24px; text-align: center; background: linear-gradient(rgba(10, 9, 8, .55), rgba(10, 9, 8, .78)), var(--lq-poster) center / cover no-repeat, #121110; }
.lq-cam-card.over { background: rgba(10, 9, 8, .62); }
.lq-cam-card[hidden] { display: none; }
.lq-cam-card p { margin: 0; max-width: 34em; font-size: 14px; line-height: 1.5; color: #e9e3dc; text-shadow: 0 1px 2px #000; }
.lq-cam-card .lq-cam-msg { min-height: 1.5em; color: #ffd9c7; }
.lq-cam-card .lq-cam-msg:empty { display: none; }
.lq-btn { display: inline-flex; align-items: center; gap: 7px; padding: 8px 16px; border-radius: 999px; border: 1px solid var(--line-strong, rgba(255,255,255,.3)); background: rgba(255, 255, 255, 0.04);
  color: var(--text, #f3eee8); font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; touch-action: manipulation; user-select: none; -webkit-user-select: none; }
.lq-btn:hover { border-color: var(--accent, #ff6b35); }
.lq-btn[aria-pressed="true"], .lq-btn.lq-primary { background: var(--accent, #ff6b35); border-color: var(--accent, #ff6b35); color: #1a0b04; }
.lq-btn[disabled] { opacity: .45; cursor: default; }
.lq-btn[hidden] { display: none !important; }
.lq-cam-card .lq-btn { font-size: 15px; padding: 10px 20px; }
.lq-hud { position: absolute; z-index: 4; top: 12px; right: 12px; margin: 0; padding: 9px 12px; border-radius: 10px; list-style: none;
  font: 13px/1.55 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; color: #e8e8e8; background: rgba(0, 0, 0, 0.72); border: 1px solid rgba(255, 255, 255, 0.14); pointer-events: none; }
.lq-hud .ok { color: #3ee06b; } .lq-hud .warn { color: #ffe14d; } .lq-hud .dim { color: #8d8d8d; }
.lq-goal { position: absolute; z-index: 4; left: 12px; top: 12px; margin: 0; padding: 6px 12px; border-radius: 999px; font-size: 14px; font-weight: 650;
  color: #f3eee8; background: rgba(12, 10, 9, 0.75); border: 1px solid rgba(255, 255, 255, 0.14); pointer-events: none; transition: background .3s, color .3s; }
.lq-goal.done { background: #3ee06b; color: #06220f; border-color: #3ee06b; }
.lq-pip { position: absolute; z-index: 4; left: 12px; bottom: 12px; width: clamp(260px, 24vw, 380px); aspect-ratio: 4 / 3; border-radius: 10px; overflow: hidden;
  background: #0d0d0d; border: 1px solid rgba(255, 255, 255, 0.18); box-shadow: 0 12px 28px -14px rgba(0, 0, 0, .9); }
.lq-pip canvas { display: block; width: 100%; height: 100%; }
.lq-pip-tag { position: absolute; left: 8px; top: 6px; font: 600 12.5px/1.3 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; color: #e8e8e8; pointer-events: none; text-shadow: 0 1px 2px #000; }
.lq-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.lq-note { flex: 1 1 100%; margin: 0; font-size: 13.5px; line-height: 1.5; color: var(--muted); }
@media (max-width: 640px) { .lq-hud { font-size: 12px; padding: 6px 8px; top: 8px; right: 8px; } .lq-goal { font-size: 12.5px; left: 8px; top: 8px; } .lq-pip { width: 50%; left: 8px; bottom: 8px; } .lq-pip-tag { font-size: 12px; } }
`;

/** hand_tracker.py after MediaPipe: size gate, hold-over, fist latch */
function makeTracker() {
  let last = null, missed = 0, latched = false;
  const held = () => {
    missed++;
    if (last && missed <= C.holdFrames) return { ...last, fist: latched, held: true };
    if (missed > C.holdFrames) last = null;
    return null;
  };
  return {
    process(lm, g) {
      if (!lm) return held();
      const size = Math.hypot(lm[9][0] - lm[0][0], lm[9][1] - lm[0][1]);
      if (size < C.minHandSize) return held();
      let name = null, conf = 0, gFist = false;
      if (g && g.name && g.name !== 'None') { name = g.name; conf = g.score; gFist = name === 'Closed_Fist'; }
      let curled = 0;
      for (const t of [8, 12, 16, 20]) if (Math.hypot(lm[t][0] - lm[9][0], lm[t][1] - lm[9][1]) < size * 0.55) curled++;
      const geom = curled >= 4;
      if (latched) { if ((OPEN.has(name) && conf >= C.fistExit) || (!gFist && !geom)) latched = false; }
      else if (gFist && conf >= C.fistEnter) latched = true;
      last = { lm, size, fist: latched, gesture: name || (latched ? 'Closed_Fist' : null), conf };
      missed = 0;
      return last;
    },
    reset() { last = null; missed = 0; latched = false; },
  };
}

/** relative_teleop.py: target = anchor + scale * (hand - origin), fist clutch with debounce */
function makeTeleop() {
  const ema = (a) => ({ a, v: null, up(x) { this.v = this.v == null ? x : this.a * x + (1 - this.a) * this.v; return this.v; } });
  let fx, fy, fz, fg, db, target, anchor, origin, engaged, fist, fistN, openN;
  function seedPose(p, g = 1) {
    target = { x: p[0], y: p[1], z: p[2], g };
    anchor = p.slice(); origin = null; engaged = false; fist = false; fistN = 0; openN = 0;
    fx = ema(C.alphaXY); fy = ema(C.alphaXY); fz = ema(C.alphaZ); fg = ema(C.alphaGrip); fg.v = g; db = { x: null, y: null, z: null };
  }
  const band = (v, k, b) => { if (db[k] == null || Math.abs(v - db[k]) >= b) db[k] = v; return db[k]; };
  function debounce(raw) {
    if (raw) { fistN++; openN = 0; if (!fist && fistN >= C.clutchOn) fist = true; }
    else { openN++; fistN = 0; if (fist && openN >= C.clutchOff) fist = false; }
    return fist;
  }
  seedPose(C.home);
  return {
    seed: seedPose,
    update(t) {
      if (!t) return { ...target, clutched: fist, valid: false };
      const hx = t.lm[0][0], hy = t.lm[0][1], hz = -t.size;
      const pinch = Math.hypot(t.lm[4][0] - t.lm[8][0], t.lm[4][1] - t.lm[8][1]);
      const g = fg.up(clamp(pinch / (t.size * 2 + 1e-6), 0, 1));
      if (debounce(!!t.fist)) {
        if (engaged) { engaged = false; origin = null; }
        target.g = g;
        return { ...target, clutched: true, valid: true };
      }
      let x, y, z;
      if (!engaged) {
        fx.v = hx; fy.v = hy; fz.v = hz; db = { x: hx, y: hy, z: hz };
        x = hx; y = hy; z = hz;
        origin = [hx, hy, hz];
        anchor = [target.x, target.y, target.z];
        engaged = true;
      } else {
        x = band(fx.up(hx), 'x', C.dbXY); y = band(fy.up(hy), 'y', C.dbXY); z = band(fz.up(hz), 'z', C.dbZ);
      }
      // robot: x = ax + sx (hz - oz), y = ay + sy (hx - ox); signs flipped for a webcam facing the reader
      target.x = anchor[0] - C.scale.x * (z - origin[2]);
      target.y = anchor[1] + C.scale.y * (x - origin[0]);
      target.z = anchor[2] + C.scale.z * -(y - origin[1]);
      target.g = g;
      return { ...target, clutched: false, valid: true };
    },
  };
}

/**
 * The claw and the can: if the jaw closes with the can between the jaw tips it stops at contact and
 * the can rides with the gripper; opening past contact lets it go, and it drops back to the table.
 */
function makeGrasp(stage, arm, can) {
  const contact = gripAngleFor(CAN.r * 2 + 0.004);
  const tmp = new THREE.Vector3(), up = new THREE.Vector3(), q = new THREE.Quaternion();
  const st = { held: false, falling: null };
  function reset(pos = CAN_HOME) {
    if (st.held) { stage.root.attach(can); st.held = false; }
    st.falling = null;
    can.position.set(pos[0], pos[1], pos[2]);
    can.rotation.set(0, 0, 0);
    stage.invalidate();
  }
  function between() {
    if (Math.abs(can.rotation.x) > 0.3 || Math.abs(can.rotation.z) > 0.3) return false; // only a standing can
    arm.grip.getWorldPosition(tmp);
    const dx = tmp.x - can.position.x, dz = tmp.z - can.position.z, hy = tmp.y - can.position.y;
    return Math.hypot(dx, dz) < 0.025 && hy > CAN.h * 0.2 && hy < CAN.h * 1.02;
  }
  function update(cmd, dt) {
    let jaw = cmd;
    if (st.held) {
      if (cmd < contact - 8) { stage.root.attach(can); st.held = false; st.falling = { v: 0 }; } // opened: let go
      else jaw = Math.min(cmd, contact);
    } else if (cmd >= contact - 1 && arm.angles[5] < contact + 0.5 && between()) {
      jaw = contact;
      arm.pivots[4].attach(can);
      st.held = true;
      st.falling = null;
    }
    if (st.falling) {
      // drop straight down, then stand it up or lay it down depending on how it is tilted
      st.falling.v += 9.81 * dt;
      can.position.y = Math.max(0, can.position.y - st.falling.v * dt);
      if (can.position.y <= 0) {
        up.set(0, 1, 0).applyQuaternion(can.quaternion);
        if (up.y > Math.cos(20 * DEG)) can.rotation.set(0, 0, 0);
        else {
          const yaw = Math.atan2(up.x, up.z);
          can.rotation.set(0, 0, 0);
          can.rotateY(yaw); can.rotateX(Math.PI / 2);
          can.position.y = CAN.r;
        }
        st.falling = null;
      }
      stage.invalidate();
    }
    return jaw;
  }
  /** height of the can's lowest point above the table while held */
  function lift() {
    if (!st.held) return 0;
    up.set(0, 1, 0).applyQuaternion(can.getWorldQuaternion(q));
    can.getWorldPosition(tmp);
    return tmp.y + Math.min(0, up.y * CAN.h) - Math.sqrt(Math.max(0, 1 - up.y * up.y)) * CAN.r;
  }
  reset();
  return Object.assign(st, { update, reset, lift });
}

function drawHand(g, lm, w, hh, clutched) {
  if (!lm) return;
  const P = lm.map(([x, y]) => [(1 - x) * w, y * hh]); // mirrored: a selfie view
  g.lineWidth = 2;
  g.strokeStyle = clutched ? '#ff4b3e' : '#3ee06b';
  g.beginPath();
  for (const [a, b] of BONES) { g.moveTo(P[a][0], P[a][1]); g.lineTo(P[b][0], P[b][1]); }
  g.stroke();
  g.fillStyle = '#ff8000';
  for (const [x, y] of P) { g.beginPath(); g.arc(x, y, 2.6, 0, Math.PI * 2); g.fill(); }
}

export async function mount(el, ctx) {
  style('lq-webcam-css', CSS);

  // ---------------------------------------------------------------- the start card (all that mounting does)
  const card = h('div', 'lq-cam-card');
  card.style.setProperty('--lq-poster', `url("${ctx.asset(POSTER)}")`);
  const bStart = h('button', 'lq-btn lq-primary', 'Start camera');
  bStart.type = 'button';
  const intro = h('p', null, 'Uses your webcam. Nothing loads until you press the button, and the video never leaves your browser.');
  const msg = h('p', 'lq-cam-msg', '');
  msg.setAttribute('role', 'status');
  card.append(bStart, intro, msg);
  el.appendChild(card);

  const panel = ctx.panel;
  const row = h('div', 'lq-row');
  const bStop = h('button', 'lq-btn', 'Stop camera');
  const bEye = h('button', 'lq-btn', 'Eye camera view');
  const bReset = h('button', 'lq-btn', 'Reset the can');
  for (const b of [bStop, bEye, bReset]) { b.type = 'button'; b.hidden = true; }
  bEye.setAttribute('aria-pressed', 'false');
  bEye.title = 'What the glasses gave the tracker: 4-bit grey and noisy';
  row.append(bStop, bEye, bReset);
  const note = h('p', 'lq-note', '');
  panel?.append(row, note);

  // ---------------------------------------------------------------- state, built on the first start
  let stage = null, arm = null, grasp = null, HOME = null, sol = null, box = null, hud = null, goal = null, pc = null, g2 = null, tag = null;
  let video = null, stream = null, recognizer = null, loading = null, lastVT = -1, lastTs = 0;
  let eye = false, running = false, starting = false, disposed = false, session = 0;
  const tracker = makeTracker();
  const teleop = makeTeleop();
  const eyeC = document.createElement('canvas'); eyeC.width = 512; eyeC.height = 378;
  const eyeG = eyeC.getContext('2d', { willReadFrequently: true });

  async function build3D() {
    if (stage) return;
    stage = createStage(el, { controls: false, hint: false });
    arm = await loadArm(stage);
    const { can } = props(stage);
    stage.fitGround();
    grasp = makeGrasp(stage, arm, can);
    const r = ikBest(toArm(C.home), SEEDS);
    HOME = [...r.q.slice(0, 4), ROLL, 0];
    arm.pose(HOME);
    sol = HOME.slice(0, 4);
    // camera behind the arm and to its right, so the reader's right is the arm's right on screen
    stage.frame(fitBox(stage, [-0.2, 0, -0.08], [0.12, 0.32, 0.33]), { azimuth: 222, elevation: 26, pad: 1.02 });
    goal = h('p', 'lq-goal', 'Goal: pick up the can');
    hud = h('ul', 'lq-hud');
    const pip = h('div', 'lq-pip');
    pc = h('canvas'); pc.width = 320; pc.height = 240;
    tag = h('span', 'lq-pip-tag', 'Your camera');
    pip.append(pc, tag);
    el.append(goal, hud, pip);
    g2 = pc.getContext('2d');
    for (const k of ['clutch', 'hand', 'gesture', 'fps', 'ee']) hud.appendChild(h('li'));
  }
  function reseed() {
    tracker.reset();
    const p = toRepo(fk(arm.angles));
    teleop.seed(p, 1 - arm.angles[5] / 95);
    box = {};
    for (const [i, k] of ['x', 'y', 'z'].entries()) box[k] = [Math.min(C.box[k][0], p[i] - 0.01), Math.max(C.box[k][1], p[i] + 0.01)];
  }
  function resetCan() {
    grasp.reset(CAN_HOME);
    arm.pose(HOME);
    sol = HOME.slice(0, 4);
    reseed();
    goal.textContent = 'Goal: pick up the can'; goal.classList.remove('done');
  }

  async function loadRecognizer() {
    if (recognizer) return recognizer;
    if (!loading) {
      loading = (async () => {
        const vision = await import(/* @vite-ignore */ `${MP}/vision_bundle.mjs`);
        const files = await vision.FilesetResolver.forVisionTasks(`${MP}/wasm`);
        const opts = (delegate) => ({
          baseOptions: { modelAssetPath: new URL(ctx.asset(TASK), location.href).href, delegate },
          runningMode: 'VIDEO', numHands: 1,
          minHandDetectionConfidence: C.minConf, minHandPresenceConfidence: C.minConf, minTrackingConfidence: C.minConf,
        });
        try { return await vision.GestureRecognizer.createFromOptions(files, opts('GPU')); }
        catch { return await vision.GestureRecognizer.createFromOptions(files, opts('CPU')); }
      })();
      loading.catch(() => { loading = null; });
    }
    recognizer = await loading;
    return recognizer;
  }

  const showCard = (text) => {
    msg.textContent = text || '';
    card.classList.toggle('over', !!stage);
    card.hidden = false;
    bStart.disabled = false;
    for (const b of [bStop, bEye, bReset]) b.hidden = true;
    note.textContent = '';
  };

  async function start() {
    if (starting || running || disposed) return;
    if (!navigator.mediaDevices?.getUserMedia) { showCard('This browser gives the page no camera, so the demo cannot run here. The scroll animation above runs the same code on a drawn hand.'); return; }
    starting = true;
    const my = ++session;
    bStart.disabled = true;
    msg.textContent = 'Asking for your camera…';
    let s;
    try {
      s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
    } catch (e) {
      if (my !== session) return;
      starting = false;
      showCard(e && e.name === 'NotAllowedError'
        ? 'The camera is blocked. Allow it for this site in the browser and press Start camera again.'
        : 'No camera found. The scroll animation above runs the same code on a drawn hand.');
      return;
    }
    // stopped (scrolled away, unmounted) while the browser was asking: hand the camera straight back
    if (my !== session || disposed) { s.getTracks().forEach((t) => t.stop()); return; }
    stream = s;
    video = document.createElement('video');
    Object.assign(video, { muted: true, playsInline: true, srcObject: stream });
    try { await video.play(); } catch { /* starts on the next frame */ }
    msg.textContent = recognizer ? 'Starting…' : 'Loading the arm and the hand tracker (about 8 MB, once)…';
    try {
      await Promise.all([build3D(), loadRecognizer()]);
    } catch (e) {
      console.error('[webcam] could not start', e);
      if (my !== session) return;
      stopCamera(/webgl/i.test(String(e && e.message)) ? 'This demo needs WebGL, which this browser has turned off.' : 'The hand tracker could not load here. The scroll animation above runs the same code on a drawn hand.');
      return;
    }
    if (my !== session || disposed) return; // stopped while loading (scrolled away)
    starting = false;
    reseed();
    running = true;
    card.hidden = true;
    for (const b of [bStop, bEye, bReset]) b.hidden = false;
    note.textContent = 'Open hand moves the arm. Pinch thumb and index to close the claw. Make a fist to freeze the arm, move your hand back, open it to carry on.';
    run();
  }
  function stopCamera(text) {
    session++;
    running = false;
    starting = false;
    stream?.getTracks().forEach((t) => t.stop());
    stream = null;
    if (video) { video.srcObject = null; video = null; }
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    if (!disposed) showCard(text);
  }

  // ---------------------------------------------------------------- one control step per camera frame
  let steps = 0, fpsT = 0, fps = 0, lastLm = null, lastClutch = false, prevT = 0;
  const put = (li, text, cls = '') => { if (li.textContent !== text) li.textContent = text; if (li.className !== cls) li.className = cls; };
  function step(sample, dt) {
    const t = tracker.process(sample.lm, sample.gesture);
    const tg = teleop.update(t);
    const ee = [clamp(tg.x, ...box.x), clamp(tg.y, ...box.y), clamp(tg.z, ...box.z)];
    const cur = arm.angles.slice();
    const r = ik(toArm(ee), [...cur.slice(0, 4), ROLL], { iters: 60 });
    if (r.miss <= C.miss) sol = r.q.slice(0, 4);
    const q = sol.map((v, i) => clamp(v, cur[i] - C.maxStep, cur[i] + C.maxStep));
    const jawCmd = clamp((1 - clamp(tg.g, 0, 1)) * 95, cur[5] - 4.75, cur[5] + 4.75);
    const jaw = grasp.update(jawCmd, dt);
    arm.pose([...q, ROLL, jaw]);
    stage.invalidate();
    lastLm = t ? t.lm : null; lastClutch = tg.clutched;
    // HUD, in the style of the robot's glasses overlay
    const li = hud.children;
    put(li[0], `Clutch: ${tg.clutched ? 'ACTIVE' : 'INACTIVE'}`, tg.clutched ? 'warn' : 'dim');
    put(li[1], `Hand: ${t ? 'DETECTED' : 'MISSING'}`, t ? 'ok' : 'dim');
    put(li[2], `Gesture: ${t?.gesture || 'None'}`);
    put(li[3], `FPS: ${fps.toFixed(1)}`);
    put(li[4], `EE: [${ee.map((v) => v.toFixed(2)).join(', ')}]`);
    steps++;
    if (grasp.held && grasp.lift() > 0.05 && !goal.classList.contains('done')) { goal.textContent = 'Got it'; goal.classList.add('done'); }
  }
  function camFrame(now) {
    if (!video || !recognizer || video.readyState < 2 || video.currentTime === lastVT) return;
    lastVT = video.currentTime;
    const dt = prevT ? Math.min(0.2, (now - prevT) / 1000) : 1 / C.fps;
    prevT = now;
    fpsT += dt;
    if (fpsT >= 1) { fps = steps / fpsT; steps = 0; fpsT = 0; }
    let src = video;
    const vw = video.videoWidth, vh = video.videoHeight;
    if (eye) {
      // what the glasses gave the tracker: 512 x 378, 4 bits of grey, noisy
      const s = Math.max(512 / vw, 378 / vh), dw = vw * s, dh = vh * s;
      eyeG.drawImage(video, (512 - dw) / 2, (378 - dh) / 2, dw, dh);
      const img = eyeG.getImageData(0, 0, 512, 378), d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const y = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2] + (Math.random() - 0.5) * 40;
        d[i] = d[i + 1] = d[i + 2] = Math.floor(clamp(y, 0, 255) / 16) * 17;
      }
      eyeG.putImageData(img, 0, 0);
      src = eyeC;
    }
    const ts = Math.max(lastTs + 1, performance.now());
    lastTs = ts;
    let res = null;
    try { res = recognizer.recognizeForVideo(src, ts); } catch (e) { console.error(e); }
    const lm = res?.landmarks?.[0]?.map((p) => [p.x, p.y]) || null;
    const top = res?.gestures?.[0]?.[0];
    step({ lm, gesture: top ? { name: top.categoryName, score: top.score } : null }, dt);
    // preview, mirrored
    const w = pc.width, hh = pc.height;
    g2.save(); g2.translate(w, 0); g2.scale(-1, 1);
    const sw = eye ? 512 : vw, sh = eye ? 378 : vh, s = Math.max(w / sw, hh / sh);
    g2.drawImage(src, (w - sw * s) / 2, (hh - sh * s) / 2, sw * s, sh * s);
    g2.restore();
    drawHand(g2, lastLm, w, hh, lastClutch);
  }

  // ---------------------------------------------------------------- loop: only while the camera runs,
  // the demo is on screen and the tab is visible
  let raf = 0;
  const away = () => { const r = el.getBoundingClientRect(); return r.bottom <= 0 || r.top >= innerHeight; };
  const leave = () => stopCamera('Camera stopped when you scrolled away. Press Start camera to use it again.');
  function tick(now) {
    raf = 0;
    if (!running || document.hidden) return;
    if (away()) { leave(); return; } // do not wait for the observer on a busy page
    camFrame(now);
    raf = requestAnimationFrame(tick);
  }
  const run = () => { if (!raf && running && !away() && !document.hidden) { prevT = 0; raf = requestAnimationFrame(tick); } };
  const onVis = () => run();
  document.addEventListener('visibilitychange', onVis);
  // stop the camera when the demo scrolls away
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting && (stream || starting)) leave();
    run();
  }, { threshold: 0 });
  io.observe(el);
  // and on scroll, while the camera is on or being asked for (the observer can lag on a busy page)
  const onScroll = () => { if ((stream || starting) && away()) leave(); };
  addEventListener('scroll', onScroll, { passive: true });

  bStart.addEventListener('click', start);
  bStop.addEventListener('click', () => stopCamera());
  bReset.addEventListener('click', () => { if (grasp) resetCan(); });
  bEye.addEventListener('click', () => { eye = !eye; bEye.setAttribute('aria-pressed', String(eye)); if (tag) tag.textContent = eye ? 'Eye camera (simulated)' : 'Your camera'; });

  return {
    dispose() {
      disposed = true;
      stopCamera();
      io.disconnect();
      removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVis);
      recognizer?.close?.(); recognizer = null; loading = null;
      stage?.dispose();
      for (const n of [card, goal, hud, pc?.parentElement]) n?.remove(); // added after mount, so project.js does not know them
    },
  };
}
