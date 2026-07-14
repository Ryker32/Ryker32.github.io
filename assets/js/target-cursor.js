(() => {
  const cursor = document.querySelector('.target-cursor');
  if (!cursor) return;

  const pointerFine = window.matchMedia('(pointer: fine)');
  if (!pointerFine.matches) { cursor.remove(); return; }

  const dot = cursor.querySelector('.target-cursor__dot');
  const corners = [...cursor.querySelectorAll('.target-cursor__corner')];
  const CORNER_SIZE = 12;
  const BORDER = 3;
  const ROTATE_DURATION = 2000;
  const TARGET_SELECTOR = '.cursor-target, [data-cursor-target]';
  // Hysteresis: once locked, the pointer must travel this far past the
  // target's edge before the lock releases. Prevents jitter at boundaries.
  const STICKY_PAD = 18;
  // How strongly the cursor is pulled toward the locked target's center
  // (0 = follows pointer exactly, 1 = pinned to center). Only applied to
  // small targets (buttons, pills, links) — large cards get no pull, since
  // the visible dot must stay near the real pointer for in-card clicks.
  const MAGNET_PULL = 0.45;
  const MAGNET_MAX_SIZE = 180;
  // Smoothing factor per frame for the cursor's visual position.
  const EASE = 0.35;
  const RELEASE_POSITIONS = [
    { x: -CORNER_SIZE * 1.5, y: -CORNER_SIZE * 1.5 },
    { x: CORNER_SIZE * 0.5,   y: -CORNER_SIZE * 1.5 },
    { x: CORNER_SIZE * 0.5,   y:  CORNER_SIZE * 0.5 },
    { x: -CORNER_SIZE * 1.5,  y:  CORNER_SIZE * 0.5 }
  ];

  let spinHandle = null;
  let spinResumeTimeout = null;
  let rotation = 0;
  let lockedTarget = null;
  let isLocked = false;
  let cursorPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let viewPos = { ...cursorPos };
  let renderHandle = null;

  const setRotation = (angle) => {
    rotation = angle % 360;
    cursor.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
  };

  const startSpin = () => {
    cancelAnimationFrame(spinHandle);
    let last = performance.now();
    const tick = (now) => {
      const delta = now - last;
      last = now;
      setRotation(rotation + (360 / ROTATE_DURATION) * delta);
      spinHandle = requestAnimationFrame(tick);
    };
    spinHandle = requestAnimationFrame(tick);
  };

  const stopSpin = () => cancelAnimationFrame(spinHandle);

  const lockCornersToRect = (rect) => {
    const positions = [
      { x: rect.left - BORDER, y: rect.top - BORDER },
      { x: rect.right + BORDER - CORNER_SIZE, y: rect.top - BORDER },
      { x: rect.right + BORDER - CORNER_SIZE, y: rect.bottom + BORDER - CORNER_SIZE },
      { x: rect.left - BORDER, y: rect.bottom + BORDER - CORNER_SIZE }
    ];
    corners.forEach((corner, i) => {
      corner.style.transform = `translate(${positions[i].x - viewPos.x}px, ${positions[i].y - viewPos.y}px)`;
    });
  };

  const releaseCorners = () => {
    corners.forEach((corner, i) => {
      corner.style.transform = `translate(${RELEASE_POSITIONS[i].x}px, ${RELEASE_POSITIONS[i].y}px)`;
    });
  };

  // Continuous render loop: eases the cursor toward its desired position
  // (magnetically pulled toward the locked target) and keeps corners pinned.
  const render = () => {
    let desired = cursorPos;
    if (isLocked && lockedTarget) {
      const r = lockedTarget.getBoundingClientRect();
      if (r.width <= MAGNET_MAX_SIZE && r.height <= MAGNET_MAX_SIZE) {
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        desired = {
          x: cursorPos.x + (cx - cursorPos.x) * MAGNET_PULL,
          y: cursorPos.y + (cy - cursorPos.y) * MAGNET_PULL
        };
      }
    }

    viewPos.x += (desired.x - viewPos.x) * EASE;
    viewPos.y += (desired.y - viewPos.y) * EASE;
    cursor.style.left = `${viewPos.x}px`;
    cursor.style.top = `${viewPos.y}px`;

    if (isLocked && lockedTarget) {
      lockCornersToRect(lockedTarget.getBoundingClientRect());
    }

    renderHandle = requestAnimationFrame(render);
  };

  const pointerOutsideSticky = () => {
    if (!lockedTarget) return true;
    const r = lockedTarget.getBoundingClientRect();
    return (
      cursorPos.x < r.left - STICKY_PAD ||
      cursorPos.x > r.right + STICKY_PAD ||
      cursorPos.y < r.top - STICKY_PAD ||
      cursorPos.y > r.bottom + STICKY_PAD
    );
  };

  // Corners have a 0.3s CSS transition for the lock/release glide, but while
  // locked their transforms are rewritten every frame — a lingering transition
  // makes them trail and scatter. Glide in, then pin them hard.
  let cornerPinTimeout = null;

  const setCornerTransition = (value) => {
    corners.forEach((c) => { c.style.transition = value; });
  };

  const handleEnter = (target) => {
    if (spinResumeTimeout) {
      clearTimeout(spinResumeTimeout);
      spinResumeTimeout = null;
    }
    stopSpin();
    setRotation(0); // ensure brackets orient upright on lock
    isLocked = true;
    lockedTarget = target;

    clearTimeout(cornerPinTimeout);
    setCornerTransition(''); // allow the 0.3s glide onto the target
    cornerPinTimeout = setTimeout(() => setCornerTransition('none'), 320);
  };

  const releaseLock = () => {
    lockedTarget = null;
    isLocked = false;
    clearTimeout(cornerPinTimeout);
    setCornerTransition(''); // animate the release
    releaseCorners();
    // delay spin restart slightly
    spinResumeTimeout = setTimeout(() => startSpin(), 100);
  };

  const handleLeave = () => {
    if (!isLocked) return;

    // If the pointer is still over another target (e.g. left a nested
    // button but is still on its parent card), re-acquire it immediately.
    const el = document.elementFromPoint(cursorPos.x, cursorPos.y);
    const next = el && el.closest ? el.closest(TARGET_SELECTOR) : null;
    if (next && next !== lockedTarget) {
      handleEnter(next);
      return;
    }

    releaseLock();
  };

  const bindTargets = () => {
    document.querySelectorAll(TARGET_SELECTOR).forEach((el) => {
      if (el.dataset.cursorBound) return;
      el.dataset.cursorBound = 'true';
      // Acquire on enter; release is handled by the sticky-pad check so the
      // lock survives edge jitter and brief excursions past the boundary.
      el.addEventListener('mouseenter', () => handleEnter(el));
    });
  };

  // Observe DOM changes for dynamically added targets
  const observer = new MutationObserver(bindTargets);
  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener('pointermove', (e) => {
    cursorPos = { x: e.clientX, y: e.clientY };
    // Only release once the pointer has moved well past the target's edge.
    if (isLocked && pointerOutsideSticky()) {
      handleLeave();
    }
  });

  window.addEventListener('scroll', () => {
    if (!lockedTarget) return;
    if (pointerOutsideSticky()) {
      handleLeave();
    }
  }, { passive: true });

  // Release when the pointer leaves the window entirely
  document.documentElement.addEventListener('mouseleave', () => {
    if (isLocked) releaseLock();
  });

  window.addEventListener('pointerdown', () => {
    dot.style.transform = 'translate(-50%, -50%) scale(0.7)';
    cursor.style.scale = 0.9;
  });

  window.addEventListener('pointerup', () => {
    dot.style.transform = 'translate(-50%, -50%) scale(1)';
    cursor.style.scale = 1;
  });

  releaseCorners();
  startSpin();
  bindTargets();
  renderHandle = requestAnimationFrame(render);
  document.body.classList.add('has-target-cursor');
})();
