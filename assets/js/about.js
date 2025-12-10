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

  // GSAP card swap (vanilla)
  (function initCardSwap() {
    if (typeof gsap === 'undefined') return;
    const container = document.querySelector('.about__cards');
    if (!container) return;
    const cards = Array.from(container.querySelectorAll('.about__card'));
    if (cards.length < 2) return;

    const cfg = {
      distX: 60,
      distY: 70,
      skew: 6,
      delay: 5000,
      easing: 'elastic.out(0.6,0.9)',
      durDrop: 2,
      durMove: 2,
      durReturn: 2,
      promoteOverlap: 0.9,
      returnDelay: 0.05
    };

    const slot = (i) => ({
      x: i * cfg.distX,
      y: -i * cfg.distY,
      z: -i * cfg.distX * 1.5,
      zIndex: cards.length - i
    });

    cards.forEach((el, i) => {
      const s = slot(i);
      gsap.set(el, {
        x: s.x,
        y: s.y,
        z: s.z,
        xPercent: -50,
        yPercent: -50,
        skewY: cfg.skew,
        transformOrigin: 'center center',
        zIndex: s.zIndex,
        force3D: true
      });
    });

    let order = cards.map((_, i) => i);
    let intervalId;

    const swap = () => {
      if (order.length < 2) return;
      const [front, ...rest] = order;
      const elFront = cards[front];
      const tl = gsap.timeline();

      tl.to(elFront, { y: '+=500', duration: cfg.durDrop, ease: cfg.easing });
      tl.addLabel('promote', `-=${cfg.durDrop * cfg.promoteOverlap}`);

      rest.forEach((idx, i) => {
        const el = cards[idx];
        const s = slot(i);
        tl.set(el, { zIndex: s.zIndex }, 'promote');
        tl.to(
          el,
          { x: s.x, y: s.y, z: s.z, duration: cfg.durMove, ease: cfg.easing },
          `promote+=${i * 0.15}`
        );
      });

      const back = slot(cards.length - 1);
      tl.addLabel('return', `promote+=${cfg.durMove * cfg.returnDelay}`);
      tl.call(() => gsap.set(elFront, { zIndex: back.zIndex }), null, 'return');
      tl.to(elFront, { x: back.x, y: back.y, z: back.z, duration: cfg.durReturn, ease: cfg.easing }, 'return');
      tl.call(() => { order = [...rest, front]; });
    };

    const start = () => {
      swap();
      intervalId = window.setInterval(swap, cfg.delay);
    };
    const stop = () => intervalId && clearInterval(intervalId);

    container.addEventListener('mouseenter', stop);
    container.addEventListener('mouseleave', start);
    start();
  })();
});

