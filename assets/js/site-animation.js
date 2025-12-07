(() => {
  // Skip animation only if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasSeenAnimation = sessionStorage.getItem('siteAnimationShown') === 'true';
  const heroFrame = document.querySelector('.hero-frame');
  const heroCanvas = document.getElementById('heroCanvas');
  
  // If there's no hero section on this page, skip all animation logic
  if (!heroCanvas) {
    document.body.classList.add('animation-complete');
    document.body.classList.remove('animation-loading');
    document.documentElement.style.overflow = '';
    const siteMain = document.querySelector('.site-main');
    if (siteMain) siteMain.style.opacity = '1';
    const nav = document.querySelector('.glass-nav-wrapper');
    if (nav) nav.style.opacity = '1';
    return;
  }
  
  // If animation was already shown in this session, skip it
  if (hasSeenAnimation) {
    document.body.classList.add('animation-complete', 'animation-ready');
    document.body.classList.remove('animation-loading');
    document.documentElement.style.overflow = '';
    const siteMain = document.querySelector('.site-main');
    if (siteMain) siteMain.style.opacity = '1';
    const nav = document.querySelector('.glass-nav-wrapper');
    if (nav) nav.style.opacity = '1';
    if (heroFrame) heroFrame.classList.add('hero-frame--collapsed');
    const preloader = document.getElementById('sitePreloader');
    if (preloader) preloader.remove();
    return;
  }

  const collapseHeroFrame = () => {
    if (!heroFrame) return;
    heroFrame.classList.add('hero-frame--collapsed');
  };

  const resetHeroFrame = () => {
    if (!heroFrame) return;
    heroFrame.classList.remove('hero-frame--collapsed');
  };

  const hidePreloader = () => {
    const preloader = document.getElementById('sitePreloader');
    if (!preloader) return;
    preloader.style.transition = 'opacity 0.5s ease';
    preloader.style.opacity = '0';
    setTimeout(() => preloader.remove(), 600);
  };

  if (prefersReducedMotion) {
    document.body.classList.add('animation-complete');
    const siteMain = document.querySelector('.site-main');
    if (siteMain) siteMain.style.opacity = '1';
    const heroCanvas = document.querySelector('.hero__canvas');
    if (heroCanvas) {
      heroCanvas.style.opacity = '0.9';
      heroCanvas.style.transform = 'scale(1)';
    }
    collapseHeroFrame();
    hidePreloader();
    return;
  }

  // Initialize animation sequence
  function initAnimation() {
    // Body already has animation-loading from HTML, just ensure scroll is locked
    document.documentElement.style.overflow = 'hidden';
    
    // Wait for hero3d.js to initialize and start rendering
    // hero3d.js runs on DOMContentLoaded, so we need to wait a bit for it to initialize
    // Use a combination of detection and timeout to ensure animation triggers
    
    let animationTriggered = false;
    
    function triggerAnimation() {
      if (animationTriggered) return;
      animationTriggered = true;
      
      const canvas = document.getElementById('heroCanvas');
      console.log('Triggering explosion animation', {
        canvasExists: !!canvas,
        canvasSize: canvas ? `${canvas.width}x${canvas.height}` : 'N/A',
        bodyClasses: document.body.className
      });
      
      // Mark as ready to trigger CSS explosion animation
      document.body.classList.add('animation-ready');
      collapseHeroFrame();
      hidePreloader();
      // Start the animation sequence
      startAnimationSequence();
    }
    
    // Method 1: Check if canvas has been initialized
    let checkCount = 0;
    const maxChecks = 100; // 5 seconds max wait
    const checkInterval = setInterval(() => {
      const canvas = document.getElementById('heroCanvas');
      let isInitialized = false;
      
      if (canvas) {
        // Check if canvas has been properly sized (hero3d.js sets size in handleResize)
        // Default canvas is 300x150, hero3d.js sets it to container size
        const isLargerThanDefault = canvas.width > 400 || canvas.height > 200;
        
        // Also check if renderer has been created by checking canvas attributes
        // WebGL canvas typically gets specific attributes set
        const hasWebGLAttributes = canvas.width > 0 && canvas.height > 0 && 
                                    (canvas.width !== 300 || canvas.height !== 150);
        
        isInitialized = isLargerThanDefault || hasWebGLAttributes;
      }
      
      if (isInitialized) {
        clearInterval(checkInterval);
        // Give it a moment to render a few frames
        setTimeout(triggerAnimation, 300);
      } else if (checkCount >= maxChecks) {
        clearInterval(checkInterval);
        // Fallback: trigger anyway after timeout (canvas might still render)
        console.warn('Canvas initialization timeout, triggering animation anyway');
        setTimeout(triggerAnimation, 100);
      }
      checkCount++;
    }, 50);
    
    // Method 2: Fallback timeout - trigger animation after reasonable delay regardless
    // This ensures animation always runs even if detection fails
    setTimeout(() => {
      if (!animationTriggered) {
        console.warn('Animation fallback triggered');
        triggerAnimation();
      }
    }, 2000); // 2 second fallback
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
      
      const siteMain = document.querySelector('.site-main');
      if (siteMain) {
        siteMain.style.opacity = '1';
      }
      
      const nav = document.querySelector('.glass-nav-wrapper');
      if (nav) {
        nav.style.opacity = '';
      }
      collapseHeroFrame();
    }, 2500);
  }

  // Start animation initialization
  // hero3d.js is a module script, so it loads asynchronously after DOMContentLoaded
  // We need to wait for both DOM ready AND give hero3d.js time to initialize
  function startInit() {
    if (document.readyState === 'loading') {
      // Wait for DOM, then wait a bit more for hero3d.js module to load
      document.addEventListener('DOMContentLoaded', () => {
        // Module scripts execute after DOMContentLoaded, so wait a bit
        setTimeout(initAnimation, 100);
      });
    } else {
      // DOM already ready, but hero3d.js module might still be loading
      // Wait a bit to give it time to initialize
      setTimeout(initAnimation, 150);
    }
  }
  
  startInit();
})();
