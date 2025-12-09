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
  let scheduledLockUpdate = false;

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
      corner.style.transform = `translate(${positions[i].x - cursorPos.x}px, ${positions[i].y - cursorPos.y}px)`;
    });
  };

  const releaseCorners = () => {
    corners.forEach((corner, i) => {
      corner.style.transform = `translate(${RELEASE_POSITIONS[i].x}px, ${RELEASE_POSITIONS[i].y}px)`;
    });
  };

  const updateLockRect = () => {
    if (!lockedTarget) return;
    lockCornersToRect(lockedTarget.getBoundingClientRect());
  };

  const scheduleLockUpdate = () => {
    if (scheduledLockUpdate) return;
    scheduledLockUpdate = true;
    requestAnimationFrame(() => {
      scheduledLockUpdate = false;
      updateLockRect();
    });
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
    updateLockRect();
  };

  const handleLeave = () => {
    // if already unlocked, skip
    if (!isLocked) return;
    lockedTarget = null;
    isLocked = false;
    releaseCorners();
    // delay spin restart slightly
    spinResumeTimeout = setTimeout(() => startSpin(), 100);
  };

  const bindTargets = () => {
    document.querySelectorAll(TARGET_SELECTOR).forEach((el) => {
      if (el.dataset.cursorBound) return;
      el.dataset.cursorBound = 'true';
      el.addEventListener('mouseenter', () => handleEnter(el));
      el.addEventListener('mouseleave', handleLeave);
    });
  };

  // Observe DOM changes for dynamically added targets
  const observer = new MutationObserver(bindTargets);
  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener('pointermove', (e) => {
    cursorPos = { x: e.clientX, y: e.clientY };
    cursor.style.left = `${cursorPos.x}px`;
    cursor.style.top = `${cursorPos.y}px`;
  });

  window.addEventListener('scroll', () => {
    if (!lockedTarget) return;
    const el = document.elementFromPoint(cursorPos.x, cursorPos.y);
    const stillOver = el && (el === lockedTarget || el.closest(TARGET_SELECTOR) === lockedTarget);
    if (!stillOver) {
      handleLeave();
      return;
    }
    scheduleLockUpdate();
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (isLocked) scheduleLockUpdate();
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
  document.body.classList.add('has-target-cursor');
})();
