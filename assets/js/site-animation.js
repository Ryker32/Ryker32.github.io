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
    const preloader = document.getElementById('sitePreloader');
    if (preloader) preloader.remove();
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

  const prepHeroCanvasSmall = () => {
    if (!heroCanvas) return;
    heroCanvas.style.opacity = '1';
    heroCanvas.style.transform = 'scale(0.18)';
    heroCanvas.style.transition = 'transform 1.1s ease, opacity 0.9s ease';
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
    document.documentElement.style.overflow = 'hidden';

    let animationTriggered = false;

    // Make sure the hero is visible in its small state immediately
    prepHeroCanvasSmall();

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
      hidePreloader();
      startAnimationSequence();
    }

    // Hard fallback: force-ready and complete after 1.5s if nothing fired
    setTimeout(() => {
      if (animationTriggered) return;
      console.warn('Forcing animation-ready/complete fallback');
      animationTriggered = true;
      prepHeroCanvasSmall();
      document.body.classList.add('animation-ready', 'animation-complete');
      document.body.classList.remove('animation-loading');
      document.documentElement.style.overflow = '';
      const siteMain = document.querySelector('.site-main');
      if (siteMain) siteMain.style.opacity = '1';
      const nav = document.querySelector('.glass-nav-wrapper');
      if (nav) nav.style.opacity = '';
      const pre = document.getElementById('sitePreloader');
      if (pre) pre.remove();
      collapseHeroFrame();
    }, 1500);

    // Trigger as soon as the hero scene signals readiness
    document.addEventListener('hero-ready', () => {
      triggerAnimation();
    });
  }

  function startAnimationSequence() {
    const canvas = document.getElementById('heroCanvas');
    const preloader = document.getElementById('sitePreloader');
    const siteMain = document.querySelector('.site-main');
    const nav = document.querySelector('.glass-nav-wrapper');

    // Mark animation as shown immediately so it only runs once per session
    if (!hasSeenAnimation) {
      sessionStorage.setItem('siteAnimationShown', 'true');
    }

    // Make the hero visible in its small state right away
    if (canvas) {
      canvas.style.opacity = '1';
      canvas.style.transform = 'scale(0.15)';
      canvas.style.transition = 'transform 1.1s ease, opacity 0.9s ease';
      requestAnimationFrame(() => {
        canvas.style.transform = 'scale(1)';
        canvas.style.opacity = '0.9';
      });
    }

    // Fade the preloader out quickly so the small hero is visible
    if (preloader) {
      preloader.style.transition = 'opacity 0.35s ease';
      preloader.style.opacity = '0';
      setTimeout(() => preloader.remove(), 450);
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
    }, 1300);
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
