document.addEventListener('DOMContentLoaded', () => {
  // Reveal on scroll
  const aboutSection = document.getElementById('about');
  if (aboutSection) {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          aboutSection.classList.add('is-visible');
        }
      },
      { threshold: 0.25 }
    );
    obs.observe(aboutSection);
  }

  // Type + delete the word after "hello,"
  const typedEl = document.getElementById('aboutTyped');
  const base = 'hello,';
  const phrases = ['stranger...', 'world...', 'friend...', 'there...'];
  const typeSpeed = 70;      // ms per character when typing
  const deleteSpeed = 45;    // ms per character when deleting
  const holdDelay = 1200;    // pause when a word is fully typed
  const gapDelay = 500;      // pause before starting the next word
  let phraseIdx = 0;
  let charIdx = 0;
  let isTyping = true;

  const render = (wordSlice) => {
    typedEl.textContent = `${base} ${wordSlice}`;
  };

  function loop() {
    if (!typedEl) return;
    const word = phrases[phraseIdx];

    if (isTyping) {
      if (charIdx < word.length) {
        charIdx += 1;
        render(word.slice(0, charIdx));
        setTimeout(loop, typeSpeed);
      } else {
        isTyping = false;
        setTimeout(loop, holdDelay);
      }
    } else {
      if (charIdx > 0) {
        charIdx -= 1;
        render(word.slice(0, charIdx));
        setTimeout(loop, deleteSpeed);
      } else {
        isTyping = true;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(loop, gapDelay);
      }
    }
  }

  if (typedEl) {
    render('');
    setTimeout(loop, 600);
  }

  // Card swap (vanilla, no deps)
  (function initCardSwap() {
    const container = document.querySelector('.about__cards');
    if (!container) return;
    const cards = Array.from(container.querySelectorAll('.about__card'));
    if (cards.length < 2) return;

    const cfg = {
      distX: 60,
      distY: 70,
      skew: 6,
      delay: 5000,
      drop: 1200,
      move: 1200,
      back: 1200,
      overlap: 0.5,
      ease: 'cubic-bezier(0.19, 1, 0.22, 1)'
    };

    const slot = (i) => ({
      x: i * cfg.distX,
      y: -i * cfg.distY,
      z: -i * cfg.distX * 1.5,
      zIndex: cards.length - i
    });

    const applyTransform = (el, s) => {
      el.style.transform = `translate3d(${s.x}px, ${s.y}px, ${s.z}px) skewY(${cfg.skew}deg) translate(-50%, -50%)`;
      el.style.zIndex = String(s.zIndex);
    };

    cards.forEach((el, i) => {
      el.style.transition = 'none';
      applyTransform(el, slot(i));
    });
    void container.offsetHeight; // force reflow
    cards.forEach((el) => { el.style.transition = ''; });

    let order = cards.map((_, i) => i);
    let timerId;

    const swap = () => {
      if (order.length < 2) return;
      const [front, ...rest] = order;
      const elFront = cards[front];

      // Drop front
      const currentSlot = slot(0);
      elFront.style.transition = `transform ${cfg.drop}ms ${cfg.ease}`;
      elFront.style.transform = `translate3d(${currentSlot.x}px, ${currentSlot.y + 500}px, ${currentSlot.z}px) skewY(${cfg.skew}deg) translate(-50%, -50%)`;

      // Promote rest
      rest.forEach((idx, i) => {
        const el = cards[idx];
        const s = slot(i);
        el.style.transition = `transform ${cfg.move}ms ${cfg.ease}`;
        applyTransform(el, s);
      });

      const backSlot = slot(cards.length - 1);
      const returnDelay = cfg.move * cfg.overlap;
      window.setTimeout(() => {
        elFront.style.transition = `transform ${cfg.back}ms ${cfg.ease}`;
        applyTransform(elFront, backSlot);
        order = [...rest, front];
      }, returnDelay);
    };

    const start = () => {
      swap();
      timerId = window.setInterval(swap, cfg.delay);
    };
    const stop = () => timerId && window.clearInterval(timerId);

    container.addEventListener('mouseenter', stop);
    container.addEventListener('mouseleave', start);
    start();
  })();
});

