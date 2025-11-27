(() => {
  const cursor = document.querySelector('.target-cursor');
  if (!cursor) return;

  const pointerFine = window.matchMedia('(pointer: fine)');
  if (!pointerFine.matches) {
    cursor.remove();
    return;
  }

  document.body.classList.add('has-target-cursor');

  const dot = cursor.querySelector('.target-cursor__dot');
  const corners = [...cursor.querySelectorAll('.target-cursor__corner')];
  const CORNER_SIZE = 12;
  const BORDER = 3;
  const ROTATE_DURATION = 2000;

  let spinHandle = null;
  let rotation = 0;
  let activeRect = null;
  let cursorPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

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
      const offsetX = positions[i].x - cursorPos.x;
      const offsetY = positions[i].y - cursorPos.y;
      corner.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    });
  };

  const releaseCorners = () => {
    const positions = [
      { x: -CORNER_SIZE * 1.5, y: -CORNER_SIZE * 1.5 },
      { x: CORNER_SIZE * 0.5, y: -CORNER_SIZE * 1.5 },
      { x: CORNER_SIZE * 0.5, y: CORNER_SIZE * 0.5 },
      { x: -CORNER_SIZE * 1.5, y: CORNER_SIZE * 0.5 }
    ];
    corners.forEach((corner, i) => {
      corner.style.transform = `translate(${positions[i].x}px, ${positions[i].y}px)`;
    });
  };

  window.addEventListener('pointermove', (e) => {
    cursorPos = { x: e.clientX, y: e.clientY };
    cursor.style.left = `${cursorPos.x}px`;
    cursor.style.top = `${cursorPos.y}px`;
    if (activeRect) lockCornersToRect(activeRect);
  });

  window.addEventListener('pointerdown', () => {
    dot.style.transform = 'translate(-50%, -50%) scale(0.7)';
    cursor.style.scale = 0.9;
  });

  window.addEventListener('pointerup', () => {
    dot.style.transform = 'translate(-50%, -50%) scale(1)';
    cursor.style.scale = 1;
  });

  const handleEnter = (target) => {
    stopSpin();
    activeRect = target.getBoundingClientRect();
    lockCornersToRect(activeRect);
  };

  const handleLeave = () => {
    activeRect = null;
    releaseCorners();
    startSpin();
  };

  const bindTargets = () => {
    document.querySelectorAll('[data-cursor-target]').forEach((el) => {
      if (el.dataset.cursorBound) return;
      el.dataset.cursorBound = 'true';
      el.addEventListener('mouseenter', () => handleEnter(el));
      el.addEventListener('mouseleave', handleLeave);
    });
  };

  const observer = new MutationObserver(bindTargets);
  observer.observe(document.body, { childList: true, subtree: true });

  releaseCorners();
  startSpin();
  bindTargets();
})();

