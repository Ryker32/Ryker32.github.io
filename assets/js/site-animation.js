(() => {
  // Skip animation only if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasSeenAnimation = false; // always play for now
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
  
  // Always play; no skip path

  const collapseHeroFrame = () => {
    if (!heroFrame) return;
    heroFrame.classList.add('hero-frame--collapsed');
  };

  const prepHeroCanvasSmall = () => {
    if (!heroCanvas) return;
    heroCanvas.style.opacity = '1';
    heroCanvas.style.transform = 'scale(0.5)';
    heroCanvas.style.transition = 'transform 1.6s ease, opacity 1s ease';
  };

  const resetHeroFrame = () => {
    if (!heroFrame) return;
    heroFrame.classList.remove('hero-frame--collapsed');
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
    return;
  }

  // Initialize animation sequence
  function initAnimation() {
    document.documentElement.style.overflow = 'hidden';

    let animationTriggered = false;

    // Make sure the hero is visible in its small state immediately
    prepHeroCanvasSmall();

    // Hide main/nav until after hero expands
    const siteMain = document.querySelector('.site-main');
    const nav = document.querySelector('.glass-nav-wrapper');
    if (siteMain) siteMain.style.opacity = '0';
    if (nav) nav.style.opacity = '0';

    function triggerAnimation() {
      if (animationTriggered) return;
      animationTriggered = true;

      const canvas = document.getElementById('heroCanvas');
      console.log('Triggering hero reveal', {
        canvasExists: !!canvas,
        canvasSize: canvas ? `${canvas.width}x${canvas.height}` : 'N/A',
        bodyClasses: document.body.className
      });

      document.body.classList.add('animation-ready');
      document.dispatchEvent(new Event('animation-ready'));
      collapseHeroFrame();
      startAnimationSequence();
    }

    // Trigger immediately (hero is the preloader)
    setTimeout(() => triggerAnimation(), 50);
  }

  function startAnimationSequence() {
    const canvas = document.getElementById('heroCanvas');
    const siteMain = document.querySelector('.site-main');
    const nav = document.querySelector('.glass-nav-wrapper');

    // Make the hero visible in its small state right away
    if (canvas) {
      canvas.style.opacity = '1';
      canvas.style.transform = 'scale(0.5)';
      canvas.style.transition = 'transform 1.6s ease, opacity 1s ease';
      requestAnimationFrame(() => {
        canvas.style.transform = 'scale(1.08)';
        canvas.style.opacity = '1';
      });
    }

    // Stagger in nav and hero card/site content after the hero expands
    if (nav) {
      nav.style.opacity = '0';
      setTimeout(() => {
        nav.style.transition = 'opacity 0.5s ease';
        nav.style.opacity = '1';
      }, 800);
    }

    if (siteMain) {
      siteMain.style.opacity = '0';
      setTimeout(() => {
        siteMain.style.transition = 'opacity 0.5s ease';
        siteMain.style.opacity = '1';
      }, 950);
    }

    // Finish: unlock scroll and mark complete
    setTimeout(() => {
      document.body.classList.add('animation-complete');
      document.body.classList.remove('animation-loading');
      document.documentElement.style.overflow = '';
      collapseHeroFrame();
    }, 1600);
  }

  // Start animation initialization promptly
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initAnimation, 50);
    });
  } else {
    setTimeout(initAnimation, 50);
  }
})();
