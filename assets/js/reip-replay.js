// REIP vs Raft replay: plays back two recorded hardware trials side by side.
// Data: /assets/data/reip-replay.json, exported from the robots' own trial logs by
// web_replay/export_replay.py in github.com/Ryker32/reip-experiments. Nothing is
// simulated: positions, leaders and fault times are what the robots logged.
//
// Kept deliberately simple: who leads, which robot is faulty, one status line,
// and how much of the arena has been explored.
//
// How "faulty" is tracked (matches the robot code):
//   - A fault is injected into the robot the trial runner sees as leader.
//   - REIP (reip_node.py) clears a robot's fault mode when it loses leadership.
//   - Raft (raft_node.py) never clears it; the faulty robot can lead again
//     whenever Raft re-elects it after a heartbeat timeout.

const DATA_URL = '/assets/data/reip-replay.json';
const SPEED = 4; // 120 s trial plays in 30 s
const STEP = 0.25;

const C = {
  panel: '#0f1013',
  floor: '#17191f',
  cellOpen: 'rgba(255,255,255,0.03)',
  cellCovered: 'rgba(125,143,217,0.32)',
  wall: '#c9ccd6',
  robot: '#e6e6e6',
  robotText: '#0f1013',
  leader: '#ffd166',
  fault: '#ff5d5d',
  ok: '#4fd18b',
  warn: '#ffb347',
  dim: 'rgba(230,230,230,0.65)',
};

const CSS = `
.rr { --rr-accent: var(--accent, #7d8fd9); font-family: var(--font-body, system-ui, sans-serif); }
.rr-panels { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.rr-panel { background: ${C.panel}; border: 1px solid var(--edge, #343434); border-radius: 12px; padding: 10px 10px 8px; min-width: 0; }
.rr-head { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; margin: 0 0 6px; }
.rr-name { font-weight: 700; font-size: 1rem; color: #f2f2f2; }
.rr-cov { font-size: 0.82rem; color: ${C.dim}; }
.rr-cov b { color: #f2f2f2; font-weight: 700; }
.rr-status { display: flex; align-items: center; gap: 8px; margin: 0 0 8px; padding: 7px 10px; border-radius: 8px;
  font-size: 0.84rem; font-weight: 600; line-height: 1.35; background: rgba(255,255,255,0.05); color: #e8e8e8; min-height: 2.7em; }
.rr-status::before { content: ""; flex: 0 0 9px; height: 9px; border-radius: 50%; background: ${C.dim}; }
.rr-status[data-tone="bad"] { background: rgba(255,93,93,0.14); color: #ffd0d0; }
.rr-status[data-tone="bad"]::before { background: ${C.fault}; }
.rr-status[data-tone="warn"] { background: rgba(255,179,71,0.13); color: #ffe2b8; }
.rr-status[data-tone="warn"]::before { background: ${C.warn}; }
.rr-status[data-tone="ok"] { background: rgba(79,209,139,0.13); color: #c9f5dc; }
.rr-status[data-tone="ok"]::before { background: ${C.ok}; }
.rr-canvas { display: block; width: 100%; height: auto; border-radius: 8px; }
.rr-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-top: 12px; }
.rr-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 999px; border: 1px solid var(--rr-accent);
  background: var(--rr-accent); color: #0b0d14; font: inherit; font-size: .88rem; font-weight: 700; cursor: pointer; }
.rr-btn:hover { filter: brightness(1.1); }
.rr-scrub { flex: 1 1 200px; accent-color: var(--rr-accent); }
.rr-time { font-family: var(--font-mono, monospace); font-size: .8rem; color: ${C.dim}; white-space: nowrap; }
.rr-legend { display: flex; flex-wrap: wrap; gap: 16px; margin: 10px 0 0; padding: 0; list-style: none; font-size: .78rem; color: ${C.dim}; }
.rr-legend i { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 6px; vertical-align: -1px; }
.rr-error { padding: 24px; text-align: center; color: ${C.dim}; }
@media (max-width: 720px) { .rr-panels { grid-template-columns: 1fr; } }
`;

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

function injectCss() {
  if (document.getElementById('rr-css')) return;
  const s = el('style');
  s.id = 'rr-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

// Leader = the robot most teammates report following (needs at least two votes).
function majorityLeader(robots) {
  const votes = new Map();
  for (const v of Object.values(robots)) {
    if (v[4] != null) votes.set(v[4], (votes.get(v[4]) || 0) + 1);
  }
  let best = null, n = 0;
  for (const [k, c] of votes) if (c > n) { best = k; n = c; }
  return n >= 2 ? best : null;
}

// Precompute, per frame: leader, faulty robots, and the status line.
function buildTimeline(run) {
  const isReip = run.controller === 'reip';
  const faults = [...run.faults].sort((a, b) => a.t - b.t);
  const faulty = new Map(); // robot -> { since, ledSince }
  let prevLeader = null;
  let lastChange = null; // { t, from, to }
  let raftReelections = 0;
  const out = [];

  for (const f of run.frames) {
    const t = f.t;
    const leader = majorityLeader(f.r);
    for (const x of faults) if (x.t <= t && x.t > t - STEP && !faulty.has(x.robot)) faulty.set(x.robot, { since: x.t, led: false });

    if (leader !== prevLeader) {
      if (prevLeader != null && leader != null) lastChange = { t, from: prevLeader, to: leader };
      if (!isReip && leader != null && faulty.has(leader) && faulty.get(leader).led) raftReelections += 1;
      prevLeader = leader;
    }
    for (const [r, s] of faulty) {
      if (r === leader) s.led = true;
      // REIP clears a robot's fault mode once it has led and then lost leadership
      if (isReip && s.led && r !== leader) faulty.delete(r);
    }

    const anyFault = faults.some((x) => x.t <= t);
    let tone = 'neutral', text;
    const L = leader != null ? `R${leader}` : 'none';
    if (!anyFault) {
      text = `Normal: ${L} leading`;
    } else if (isReip) {
      const recent = lastChange && t - lastChange.t < 5 && lastChange.t > faults[0].t;
      if (leader != null && faulty.has(leader)) {
        tone = 'bad';
        text = recent
          ? `R${lastChange.from} voted out, but ${L} was also hit by a fault (injected at ${Math.round(faulty.get(leader).since)} s)`
          : `Fault active: leader ${L} is sending bad commands`;
      } else {
        tone = 'ok';
        text = recent ? `Fault resolved: R${lastChange.from} voted out, ${L} now leads` : `Fault resolved: ${L} leading`;
      }
    } else {
      const bad = [...faulty.keys()];
      if (leader != null && faulty.has(leader)) {
        tone = 'bad';
        text = `Fault active: faulty ${L} is leading`;
      } else {
        tone = 'warn';
        text = `Fault undetected: faulty R${bad.join(', R')} can lead again` +
          (raftReelections ? ` (re-elected ${raftReelections}× so far)` : '');
      }
    }
    out.push({ leader, faulty: new Set(faulty.keys()), tone, text });
  }
  return out;
}

function makePanel(run, arena, label) {
  const timeline = buildTimeline(run);
  const panel = el('div', 'rr-panel');
  const head = el('div', 'rr-head');
  const name = el('span', 'rr-name', label);
  const cov = el('span', 'rr-cov');
  head.append(name, cov);
  const status = el('p', 'rr-status');
  const canvas = el('canvas', 'rr-canvas');
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', `${label}: overhead view of five robots exploring a two-room arena`);
  panel.append(head, status, canvas);

  const W = arena.width, H = arena.height, cell = arena.cell;
  const ctx = canvas.getContext('2d');

  function resize() {
    const cssW = canvas.clientWidth || 400;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssW * (H / W) * dpr);
  }

  function draw(t) {
    if (!canvas.width) resize();
    const i = Math.max(0, Math.min(run.frames.length - 1, Math.round(t / STEP)));
    const f = run.frames[i];
    const s = timeline[i];
    const k = canvas.width / W;
    const X = (x) => x * k;
    const Y = (y) => canvas.height - y * k;

    ctx.fillStyle = C.floor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const [cx, cy] of arena.reachable) {
      const first = run.cell_first[`${cx},${cy}`];
      ctx.fillStyle = first != null && first <= t ? C.cellCovered : C.cellOpen;
      ctx.fillRect(X(cx * cell) + 1, Y((cy + 1) * cell) + 1, cell * k - 2, cell * k - 2);
    }
    const w = arena.wall;
    ctx.fillStyle = C.wall;
    ctx.fillRect(X(w.x_left), Y(w.y_end), Math.max(2, (w.x_right - w.x_left) * k), w.y_end * k);
    ctx.strokeStyle = C.wall;
    ctx.lineWidth = Math.max(2, canvas.width / 220);
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

    const R = 95 * k;
    // Canvas text follows the page's typeface (Times New Roman on the MIT page)
    const family = getComputedStyle(canvas).fontFamily || 'system-ui, sans-serif';
    const font = (px, weight = 700) => `${weight} ${Math.max(9, px)}px ${family}`;
    // draw the leader last so its tag sits on top
    const ids = Object.keys(f.r).sort((a, b) => (Number(a) === s.leader) - (Number(b) === s.leader));
    for (const id of ids) {
      const [x, y] = f.r[id];
      const px = X(x), py = Y(y);
      const isLeader = Number(id) === s.leader;
      const isFaulty = s.faulty.has(Number(id));
      if (isLeader) {
        ctx.beginPath(); ctx.arc(px, py, R * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,209,102,0.22)'; ctx.fill();
        ctx.lineWidth = Math.max(2, R * 0.22); ctx.strokeStyle = C.leader; ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(px, py, R, 0, Math.PI * 2);
      ctx.fillStyle = isFaulty ? C.fault : C.robot; ctx.fill();
      ctx.fillStyle = isFaulty ? '#fff' : C.robotText;
      ctx.font = font(R * 1.0);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(id, px, py + R * 0.05);
      if (isLeader) {
        const tag = 'LEADER';
        ctx.font = font(R * 0.75, 800);
        const tw = ctx.measureText(tag).width + R * 0.6, th = R * 1.05;
        const ty = py - R * 1.6 - th * 0.75;
        const tx = Math.min(Math.max(px, tw / 2 + 2), canvas.width - tw / 2 - 2);
        ctx.fillStyle = C.leader;
        ctx.beginPath(); ctx.roundRect(tx - tw / 2, Math.max(2, ty - th / 2), tw, th, th / 2); ctx.fill();
        ctx.fillStyle = '#1a1406';
        ctx.fillText(tag, tx, Math.max(2 + th / 2, ty));
      }
    }

    cov.innerHTML = `explored <b>${f.cov.toFixed(0)}%</b>`;
    status.textContent = s.text;
    status.dataset.tone = s.tone;
  }

  return { panel, draw, resize };
}

export async function mount(host, { autoplay = false } = {}) {
  injectCss();
  host.classList.add('rr');
  host.textContent = 'Loading recorded trials…';

  let data;
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`${res.status}`);
    data = await res.json();
  } catch (err) {
    host.replaceChildren(el('p', 'rr-error', 'The recorded trials could not be loaded.'));
    throw err;
  }
  host.replaceChildren();

  const reip = data.runs.find((r) => r.controller === 'reip');
  const raft = data.runs.find((r) => r.controller === 'raft');
  const duration = Math.min(reip.duration, raft.duration);

  const panels = el('div', 'rr-panels');
  const A = makePanel(reip, data.arena, 'REIP');
  const B = makePanel(raft, data.arena, 'Raft (standard baseline)');
  panels.append(A.panel, B.panel);

  const controls = el('div', 'rr-controls');
  const play = el('button', 'rr-btn', '▶ Play');
  play.type = 'button';
  const scrub = el('input', 'rr-scrub');
  Object.assign(scrub, { type: 'range', min: 0, max: duration, step: STEP, value: 0 });
  scrub.setAttribute('aria-label', 'Trial time');
  const time = el('span', 'rr-time');
  controls.append(play, scrub, time);

  const legend = el('ul', 'rr-legend');
  for (const [c, t] of [[C.leader, 'leader'], [C.fault, 'robot with an injected fault'], ['rgba(125,143,217,0.9)', 'explored area']]) {
    const li = el('li'); const dot = el('i'); dot.style.background = c; li.append(dot, t); legend.append(li);
  }
  host.append(panels, controls, legend);

  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  let t = 0, playing = false, last = 0, raf = 0;
  const render = () => {
    A.draw(t); B.draw(t);
    scrub.value = t;
    time.textContent = `${fmt(t)} / ${fmt(duration)} · ${SPEED}× speed`;
  };
  const tick = (now) => {
    if (!playing) return;
    const dt = last ? (now - last) / 1000 : 0;
    last = now;
    t = Math.min(duration, t + dt * SPEED);
    render();
    if (t >= duration) { setPlaying(false); return; }
    raf = requestAnimationFrame(tick);
  };
  function setPlaying(on) {
    playing = on;
    play.textContent = on ? '❚❚ Pause' : (t >= duration ? '↺ Replay' : '▶ Play');
    cancelAnimationFrame(raf);
    if (on) {
      if (t >= duration) t = 0;
      last = 0;
      raf = requestAnimationFrame(tick);
    }
  }
  play.addEventListener('click', () => setPlaying(!playing));
  scrub.addEventListener('input', () => { t = Number(scrub.value); render(); });
  const ro = new ResizeObserver(() => { A.resize(); B.resize(); render(); });
  ro.observe(panels);

  A.resize(); B.resize(); render();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (autoplay && !reduced) setPlaying(true);

  return {
    play() { setPlaying(true); },
    pause() { setPlaying(false); },
    get playing() { return playing; },
    dispose() {
      playing = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      host.replaceChildren();
    },
  };
}
