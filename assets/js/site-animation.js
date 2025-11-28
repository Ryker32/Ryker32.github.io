(() => {
  // Skip animation only if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // For now, always run animation (comment out sessionStorage check for testing)
  const hasSeenAnimation = false; // sessionStorage.getItem('siteAnimationShown');

  if (prefersReducedMotion) {
    document.body.classList.add('animation-complete');
    const siteMain = document.querySelector('.site-main');
    if (siteMain) siteMain.style.opacity = '1';
    const heroCanvas = document.querySelector('.hero__canvas');
    if (heroCanvas) {
      heroCanvas.style.opacity = '0.9';
      heroCanvas.style.transform = 'scale(1)';
    }
    return;
  }

  // Initialize animation sequence
  function initAnimation() {
    // Body already has animation-loading from HTML, just ensure scroll is locked
    document.documentElement.style.overflow = 'hidden';
    
    // Force animation to trigger by removing and re-adding the class
    // This ensures the animation starts fresh
    const body = document.body;
    body.classList.remove('animation-loading');
    // Force reflow
    void body.offsetHeight;
    body.classList.add('animation-loading');
    
    // Start animation sequence
    setTimeout(() => {
      startAnimationSequence();
    }, 100);
  }

  function startAnimationSequence() {
    // Phase 1: Hero canvas explosion starts at 0.6s (CSS animation)
    // Phase 2: Hero content expansion starts at 1.2s (CSS animation)
    // Phase 3: Site main fade in starts at 1.8s (CSS transition)
    // Phase 4: Preloader fades out at 1.6s (CSS transition)
    
    // Mark animation as shown immediately so it only runs once per session
    if (!hasSeenAnimation) {
      sessionStorage.setItem('siteAnimationShown', 'true');
    }
    
    // Mark animation as complete after all phases
    setTimeout(() => {
      document.body.classList.add('animation-complete');
      document.body.classList.remove('animation-loading');
      document.documentElement.style.overflow = '';
      
      // Ensure all content is visible
      const siteMain = document.querySelector('.site-main');
      if (siteMain) {
        siteMain.style.opacity = '1';
      }
      
      // Navigation will be visible via CSS (body.animation-complete .glass-nav-wrapper)
      const nav = document.querySelector('.glass-nav-wrapper');
      if (nav) {
        nav.style.opacity = '';
      }
    }, 2500);
  }

  // Start immediately when script loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimation);
  } else {
    // DOM already ready, start immediately
    setTimeout(initAnimation, 10);
  }
})();
