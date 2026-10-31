// REIP vs Raft replay: plays back two recorded hardware trials side by side.
// Data: /assets/data/reip-replay.json, exported from the per-robot trial logs by
// web_replay/export_replay.py in the reip-experiments repo. Nothing here is
// simulated; positions, leaders, trust and fault times are what the robots logged.

const DATA_URL = '/assets/data/reip-replay.json';

const COLORS = {
  bg: '#0f1013',
  floor: '#16181d',
  cellOpen: 'rgba(255,255,255,0.025)',
  cellCovered: 'rgba(125,143,217,0.30)',
  grid: 'rgba(255,255,255,0.05)',
  wall: '#c9ccd6',
  robot: '#e6e6e6',
  leader: '#ffd166',
  fault: '#ff5d5d',
  text: '#e6e6e6',
  dim: 'rgba(230,230,230,0.6)',
};

const CSS = `
.rr { --rr-accent: var(--accent, #7d8fd9); font-family: var(--font-body, system-ui, sans-serif); }
.rr-panels { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.rr-panel { background: ${COLORS.bg}; border: 1px solid var(--edge, #343434); border-radius: 12px; padding: 10px; min-width: 0; }
.rr-head { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; margin: 0 0 6px; }
.rr-name { font-weight: 700; font-size: 0.95rem; color: #f2f2f2; }
.rr-cov { font-family: var(--font-mono, monospace); font-size: 0.85rem; color: var(--rr-accent); }
.rr-canvas { display: block; width: 100%; height: auto; border-radius: 8px; }
.rr-status { margin: 6px 0 0; font-family: var(--font-mono, monospace); font-size: 0.74rem; line-height: 1.5; color: ${COLORS.dim}; min-height: 3em; }
.rr-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-top: 12px; }
.rr-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 999px; border: 1px solid rgba(255,255,255,.18);
  background: rgba(255,255,255,.06); color: #f0f0f0; font: inherit; font-size: .85rem; font-weight: 600; cursor: pointer; }
.rr-btn:hover { border-color: var(--rr-accent); }
.rr-btn[aria-pressed="true"] { background: var(--rr-accent); border-color: var(--rr-accent); color: #0b0d14; }
.rr-scrub { flex: 1 1 200px; accent-color: var(--rr-accent); }
.rr-time { font-family: var(--font-mono, monospace); font-size: .8rem; color: ${COLORS.dim}; min-width: 7.5em; text-align: right; }
.rr-legend { display: flex; flex-wrap: wrap; gap: 14px; margin: 10px 0 0; padding: 0; list-style: none; font-size: .78rem; color: ${COLORS.dim}; }
.rr-legend i { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 6px; vertical-align: -1px; }
.rr-error { padding: 24px; text-align: center; color: ${COLORS.dim}; }
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

// Team leader = the leader most robots report following (robust to robots that
// don't log themselves as 'leader', which is common in the Raft logs).
function teamLeader(robots) {
  const votes = new Map();
  for (const v of Object.values(robots)) {
    const lid = v[4];
    if (lid != null) votes.set(lid, (votes.get(lid) || 0) + 1);
  }
  let best = null, n = 0;
  for (const [k, c] of votes) if (c > n) { best = k; n = c; }
  return n >= 2 ? best : null;
}

function makePanel(run, arena, label) {
  const panel = el('div', 'rr-panel');
  const head = el('div', 'rr-head');
  const name = el('span', 'rr-name', label);
  const cov = el('span', 'rr-cov', 'coverage 0%');
  head.append(name, cov);
  const canvas = el('canvas', 'rr-canvas');
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', `${label}: overhead view of five robots exploring a two-room arena`);
  const status = el('p', 'rr-status');
  status.setAttribute('aria-live', 'off');
  panel.append(head, canvas, status);

  const W = arena.width, H = arena.height, cell = arena.cell;
  const reachable = arena.reachable;
  const ctx = canvas.getContext('2d');

  function resize() {
    const cssW = canvas.clientWidth || 400;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssW * (H / W) * dpr);
  }

  function frameAt(t) {
    const fr = run.frames;
    const i = Math.max(0, Math.min(fr.length - 1, Math.round(t / 0.25)));
    return fr[i];
  }

  function draw(t) {
    if (!canvas.width) resize();
    const f = frameAt(t);
    const sx = canvas.width / W;
    // arena y grows "up" in the logs; draw with y flipped so the view matches the overhead camera
    const X = (x) => x * sx;
    const Y = (y) => canvas.height - y * sx;
    ctx.fillStyle = COLORS.floor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const [cx, cy] of reachable) {
      const first = run.cell_first[`${cx},${cy}`];
      ctx.fillStyle = first != null && first <= t ? COLORS.cellCovered : COLORS.cellOpen;
      ctx.fillRect(X(cx * cell) + 1, Y((cy + 1) * cell) + 1, cell * sx - 2, cell * sx - 2);
    }

    // interior divider wall
    const w = arena.wall;
    ctx.fillStyle = COLORS.wall;
    ctx.fillRect(X(w.x_left), Y(w.y_end), Math.max(2, (w.x_right - w.x_left) * sx), w.y_end * sx);
    ctx.strokeStyle = COLORS.wall;
    ctx.lineWidth = Math.max(2, 3 * (canvas.width / 600));
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

    const leader = teamLeader(f.r);
    const faulted = new Set(run.faults.filter((x) => x.t <= t).map((x) => x.robot));
    const R = 95 * sx; // ~robot body radius in mm, scaled

    for (const [id, v] of Object.entries(f.r)) {
      const [x, y, th] = v;
      const px = X(x), py = Y(y);
      if (Number(id) === leader) {
        ctx.beginPath(); ctx.arc(px, py, R * 1.55, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,209,102,0.18)'; ctx.fill();
        ctx.strokeStyle = COLORS.leader; ctx.lineWidth = Math.max(1.5, R * 0.18); ctx.stroke();
      }
      if (faulted.has(Number(id))) {
        ctx.beginPath(); ctx.arc(px, py, R * 1.25, 0, Math.PI * 2);
        ctx.strokeStyle = COLORS.fault; ctx.lineWidth = Math.max(1.5, R * 0.14);
        ctx.setLineDash([R * 0.35, R * 0.25]); ctx.stroke(); ctx.setLineDash([]);
      }
      ctx.beginPath(); ctx.arc(px, py, R, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.robot; ctx.fill();
      // heading (theta in radians, CCW from +x in arena frame -> flip y for canvas)
      ctx.beginPath(); ctx.moveTo(px, py);
      ctx.lineTo(px + Math.cos(th) * R * 1.4, py - Math.sin(th) * R * 1.4);
      ctx.strokeStyle = '#0f1013'; ctx.lineWidth = Math.max(1.5, R * 0.2); ctx.stroke();
      ctx.fillStyle = '#0f1013';
      ctx.font = `700 ${Math.max(9, R * 0.95)}px ui-monospace, monospace`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(id, px, py + R * 0.05);
    }

    cov.textContent = `coverage ${f.cov.toFixed(1)}%`;
    const trust = Object.entries(f.r)
      .filter(([, v]) => v[5] != null && v[3] !== 'leader')
      .map(([id, v]) => `R${id} ${v[5].toFixed(2)}`);
    const lines = [`leader: ${leader != null ? 'R' + leader : 'none agreed'}`];
    if (trust.length) lines.push(`trust in leader: ${trust.join('  ')}`);
    const recent = run.faults.filter((x) => x.t <= t);
    if (recent.length) lines.push(`fault injected: ${recent.map((x) => `R${x.robot} @ ${x.t.toFixed(0)}s`).join(', ')}`);
    status.textContent = lines.join('\n');
    status.style.whiteSpace = 'pre-line';
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

  const runs = data.runs;
  const reip = runs.find((r) => r.controller === 'reip');
  const raft = runs.find((r) => r.controller === 'raft');
  const duration = Math.min(reip.duration, raft.duration);

  const panels = el('div', 'rr-panels');
  const A = makePanel(reip, data.arena, 'REIP');
  const B = makePanel(raft, data.arena, 'Raft baseline');
  panels.append(A.panel, B.panel);

  const controls = el('div', 'rr-controls');
  const play = el('button', 'rr-btn', '▶ Play');
  play.type = 'button';
  const scrub = el('input', 'rr-scrub');
  Object.assign(scrub, { type: 'range', min: 0, max: duration, step: 0.25, value: 0 });
  scrub.setAttribute('aria-label', 'Trial time');
  const speedBtns = [1, 4, 8].map((s) => {
    const b = el('button', 'rr-btn', `${s}×`);
    b.type = 'button';
    b.dataset.speed = s;
    b.setAttribute('aria-pressed', String(s === 4));
    return b;
  });
  const time = el('span', 'rr-time', '0.0 / 120 s');
  controls.append(play, ...speedBtns, scrub, time);

  const legend = el('ul', 'rr-legend');
  for (const [c, t] of [[COLORS.leader, 'team leader'], [COLORS.fault, 'robot with injected fault'], ['rgba(125,143,217,0.9)', 'explored 125 mm cell']]) {
    const li = el('li'); const dot = el('i'); dot.style.background = c; li.append(dot, t); legend.append(li);
  }
  host.append(panels, controls, legend);

  let t = 0, speed = 4, playing = false, last = 0, raf = 0;
  const render = () => {
    A.draw(t); B.draw(t);
    scrub.value = t;
    time.textContent = `${t.toFixed(1)} / ${duration.toFixed(0)} s`;
  };
  const tick = (now) => {
    if (!playing) return;
    const dt = last ? (now - last) / 1000 : 0;
    last = now;
    t = Math.min(duration, t + dt * speed);
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
  for (const b of speedBtns) {
    b.addEventListener('click', () => {
      speed = Number(b.dataset.speed);
      for (const o of speedBtns) o.setAttribute('aria-pressed', String(o === b));
    });
  }
  const onResize = () => { A.resize(); B.resize(); render(); };
  const ro = new ResizeObserver(onResize);
  ro.observe(panels);

  A.resize(); B.resize(); render();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (autoplay && !reduced) setPlaying(true);

  return {
    play() { setPlaying(true); },
    dispose() {
      playing = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      host.replaceChildren();
    },
  };
}
