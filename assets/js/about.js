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
});

