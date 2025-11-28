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
    // Check multiple indicators that hero3d.js has initialized:
    // 1. Canvas exists and has proper dimensions (not just default 300x150)
    // 2. Canvas has a WebGL context
    // 3. Give enough time for first render
    let checkCount = 0;
    const maxChecks = 120; // 6 seconds max wait
    const checkInterval = setInterval(() => {
      const canvas = document.getElementById('heroCanvas');
      let isInitialized = false;
      
      if (canvas) {
        // Check if canvas has been properly sized (hero3d.js calls handleResize which sets size)
        // Default canvas is 300x150, but hero3d.js sets it to container size
        // We check both width and height to ensure it's been properly initialized
        const container = canvas.parentElement;
        const hasProperSize = container && 
          (canvas.width >= (container.clientWidth * 0.9) || 
           canvas.height >= (container.clientHeight * 0.9));
        
        // Also check if canvas is larger than default (indicating initialization)
        const isLargerThanDefault = canvas.width > 300 || canvas.height > 150;
        
        // Canvas is initialized if it has proper size matching container or is larger than default
        isInitialized = hasProperSize || isLargerThanDefault;
      }
      
      if (isInitialized || checkCount >= maxChecks) {
        clearInterval(checkInterval);
        
        // Give it a moment to render a few frames so the particles are visible
        setTimeout(() => {
          // Mark as ready to trigger CSS explosion animation
          document.body.classList.add('animation-ready');
          // Start the animation sequence
          startAnimationSequence();
        }, 400);
      }
      checkCount++;
    }, 50);
  }

  function startAnimationSequence() {
    // Phase 1: Hero canvas explosion starts immediately when animation-ready is added (0s)
    //   - Canvas scales from 0.01 to 1.0 with opacity fade (1.2s duration)
    // Phase 2: Preloader fades out at 0.4s (so explosion is visible)
    // Phase 3: Hero content expands from center at 1.2s (0.8s duration)
    // Phase 4: Site main fades in at 1.8s
    // Phase 5: Navigation fades in at 2.6s
    
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
