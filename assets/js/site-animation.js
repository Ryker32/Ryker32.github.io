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
    
    // Wait for hero3d.js to initialize and start rendering
    // Check if canvas has been initialized by checking if it has dimensions set
    // hero3d.js will resize the canvas when it initializes
    let checkCount = 0;
    const maxChecks = 100; // 5 seconds max wait
    const checkInterval = setInterval(() => {
      const canvas = document.getElementById('heroCanvas');
      // Check if canvas has been sized (hero3d.js sets this when initializing)
      const isInitialized = canvas && (canvas.width > 0 && canvas.height > 0);
      
      if (isInitialized || checkCount >= maxChecks) {
        clearInterval(checkInterval);
        
        // Give it a moment to render a few frames
        setTimeout(() => {
          // Mark as ready to trigger CSS animation
          document.body.classList.add('animation-ready');
          // Start the animation sequence
          startAnimationSequence();
        }, 300);
      }
      checkCount++;
    }, 50);
  }

  function startAnimationSequence() {
    // Phase 1: Hero canvas explosion starts immediately when animation-ready is added
    // Phase 2: Hero content expansion starts at 1.2s delay (CSS animation)
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
