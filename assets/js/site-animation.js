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
    // Lock body scroll during animation
    document.body.classList.add('animation-loading');
    
    // Hide navigation and other elements initially
    const nav = document.querySelector('.glass-nav-wrapper');
    const siteMain = document.querySelector('.site-main');
    
    if (nav) nav.style.opacity = '0';
    
    // Start animation sequence immediately
    startAnimationSequence();
  }

  function startAnimationSequence() {
    // Phase 1: Hero canvas explosion starts at 0.8s (CSS transition)
    // Phase 2: Hero content expansion starts at 1.2s (CSS transition)
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
      
      // Ensure all content is visible
      const siteMain = document.querySelector('.site-main');
      if (siteMain) {
        siteMain.style.opacity = '1';
      }
      
      // Navigation will fade in via CSS transition
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
