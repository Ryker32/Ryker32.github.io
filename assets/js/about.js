class CardSwap {
  constructor(container, options = {}) {
    this.container =
      typeof container === 'string'
        ? document.querySelector(container)
        : container;

    if (!this.container) return;

    this.cards = Array.from(this.container.querySelectorAll('.about__card'));
    if (this.cards.length < 2) return;

    const defaults = {
      cardDistance: 36,
      verticalDistance: 28,
      delay: 4200,
      skew: 3,
      dropDistance: 220,
      durDrop: 750,
      durMove: 750,
      durReturn: 750,
      promoteOverlap: 0.42,
      returnDelay: 0.2,
      stagger: 120,
      ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
      pauseOnHover: true
    };

    this.cfg = { ...defaults, ...options };
    this.order = this.cards.map((_, i) => i);
    this.timerId = null;

    this.setup();
    this.attachHover();
    this.start();
  }

  makeSlot(i) {
    const { cardDistance, verticalDistance } = this.cfg;
    const total = this.cards.length;
    return {
      x: i * cardDistance,
      y: -i * verticalDistance,
      z: -i * cardDistance * 1.5,
      zIndex: total - i
    };
  }

  placeNow(el, slot) {
    el.style.transform = `translate3d(${slot.x}px, ${slot.y}px, ${slot.z}px) skewY(${this.cfg.skew}deg) translate(-50%, -50%)`;
    el.style.zIndex = String(slot.zIndex);
  }

  setup() {
    this.cards.forEach((el, i) => {
      el.style.backfaceVisibility = 'hidden';
      el.style.transformStyle = 'preserve-3d';
      el.style.opacity = '1';
      el.style.transition = 'none';
      this.placeNow(el, this.makeSlot(i));
    });
    void this.container.offsetHeight;
    this.cards.forEach((el) => {
      el.style.transition = '';
    });
  }

  swap() {
    const {
      durDrop,
      durMove,
      durReturn,
      dropDistance,
      ease,
      promoteOverlap,
      returnDelay,
      stagger
    } = this.cfg;

    if (this.order.length < 2) return;

    const [frontIndex, ...rest] = this.order;
    const frontEl = this.cards[frontIndex];
    if (!frontEl) return;

    const currentSlot = this.makeSlot(0);

    frontEl.style.transition = `transform ${durDrop}ms ${ease}, opacity ${durDrop}ms ${ease}`;
    frontEl.style.opacity = '0';
    frontEl.style.transform = `translate3d(${currentSlot.x}px, ${currentSlot.y + dropDistance}px, ${currentSlot.z}px) skewY(${this.cfg.skew}deg) translate(-50%, -50%)`;

    rest.forEach((idx, i) => {
      const el = this.cards[idx];
      const slot = this.makeSlot(i);
      el.style.transition = `transform ${durMove}ms ${ease}, opacity ${durMove}ms ${ease}`;
      el.style.opacity = '1';
      setTimeout(() => this.placeNow(el, slot), i * stagger);
    });

    const backSlot = this.makeSlot(this.cards.length - 1);
    const startReturnAfter = durDrop * promoteOverlap + durMove * returnDelay;

    setTimeout(() => {
      frontEl.style.transition = `transform ${durReturn}ms ${ease}, opacity ${durReturn}ms ${ease}`;
      frontEl.style.opacity = '1';
      this.placeNow(frontEl, backSlot);
      this.order = [...rest, frontIndex];
    }, startReturnAfter);
  }

  start() {
    if (this.timerId) clearInterval(this.timerId);
    this.swap();
    this.timerId = window.setInterval(() => this.swap(), this.cfg.delay);
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  attachHover() {
    if (!this.cfg.pauseOnHover) return;
    this.container.addEventListener('mouseenter', () => this.stop());
    this.container.addEventListener('mouseleave', () => this.start());
  }
}

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

  // Card swap carousel (vanilla)
  const aboutCards = document.querySelector('.js-card-carousel');
  if (aboutCards) {
    new CardSwap(aboutCards, {
      cardDistance: 36,
      verticalDistance: 28,
      delay: 4200,
      skew: 3,
      dropDistance: 220,
      durDrop: 750,
      durMove: 750,
      durReturn: 750,
      promoteOverlap: 0.42,
      stagger: 120
    });
  }
});
