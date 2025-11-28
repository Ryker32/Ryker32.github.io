(() => {
  // Skip animation on reloads or if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasSeenAnimation = sessionStorage.getItem('siteAnimationShown');

  if (prefersReducedMotion || hasSeenAnimation) {
    document.body.classList.add('animation-complete');
    return;
  }

  // Mark animation as shown
  sessionStorage.setItem('siteAnimationShown', 'true');

  // Initialize animation sequence
  function initAnimation() {
    // Lock body scroll during animation
    document.body.classList.add('animation-loading');
    
    // Hide navigation and other elements initially
    const nav = document.querySelector('.glass-nav-wrapper');
    const siteMain = document.querySelector('.site-main');
    
    if (nav) nav.style.opacity = '0';
    if (siteMain) siteMain.style.opacity = '0';

    // Wait for hero3d to initialize, then start explosion
    const checkHero3D = setInterval(() => {
      const canvas = document.getElementById('heroCanvas');
      if (canvas && canvas.getContext('webgl') || canvas.getContext('webgl2')) {
        clearInterval(checkHero3D);
        startAnimationSequence();
      }
    }, 50);

    // Fallback timeout
    setTimeout(() => {
      clearInterval(checkHero3D);
      startAnimationSequence();
    }, 2000);
  }

  function startAnimationSequence() {
    // Phase 1: Hero canvas explosion (starts immediately, animated via CSS)
    // Phase 2: Hero content expansion (starts at 1.2s, animated via CSS)
    // Phase 3: Site main fade in (starts at 1.8s, animated via CSS)
    
    // Mark animation as complete after all phases
    setTimeout(() => {
      document.body.classList.add('animation-complete');
      document.body.classList.remove('animation-loading');
      
      // Fade in navigation
      const nav = document.querySelector('.glass-nav-wrapper');
      if (nav) {
        nav.style.transition = 'opacity 0.6s ease 0.2s';
        nav.style.opacity = '1';
      }
    }, 2400);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimation);
  } else {
    initAnimation();
  }
})();

