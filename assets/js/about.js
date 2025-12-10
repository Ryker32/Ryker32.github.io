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

  // Simple looping typing effect
  const phrases = ['hello, stranger...', 'hello, world...', 'hello, friend...', 'hello, there...'];
  const typedEl = document.getElementById('aboutTyped');
  let idx = 0;

  function typeLoop() {
    if (!typedEl) return;
    typedEl.textContent = phrases[idx];
    idx = (idx + 1) % phrases.length;
    setTimeout(typeLoop, 2000);
  }

  setTimeout(typeLoop, 2000);
});

