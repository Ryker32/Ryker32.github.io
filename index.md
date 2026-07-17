---
layout: default
---

<section class="hero hero-shell" id="home">
  <div class="hero-frame" aria-hidden="true">
    <div class="hero-frame__inner">
      <span class="hero-frame__bar bar-top"></span>
      <span class="hero-frame__bar bar-bottom"></span>
      <span class="hero-frame__bar bar-left"></span>
      <span class="hero-frame__bar bar-right"></span>
    </div>
  </div>
  <div class="hero__canvas" aria-hidden="true">
    <canvas id="heroCanvas"></canvas>
  </div>
  <div class="hero__content">
    <p class="hero__eyebrow">Aerospace Robotics · Distributed Systems · CAD</p>
    <h1>Ryker Kollmyer</h1>
    <p class="hero__lede">
      Robotics Researcher & Vice President @ <a href="https://www.ohsaerospace.org" class="hero__lede-link" target="_blank" rel="noopener" data-cursor-target>Olympia Aerospace</a>
    </p>
    <p class="hero__views" id="siteViewCounter" title="Total site views">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      <span id="siteViewCounterValue">&hellip;</span>&nbsp;views
    </p>
  </div>
</section>

<section class="content-section works-section" id="portfolio" aria-labelledby="worksHeading">
  <div class="works-section__inner">
    <header class="portfolio-header">
      <h2 id="worksHeading">selected works...</h2>
      <p>
        software systems, hackathons, rockets, and apps. click any card for the full write-up.
        interactive cad, data, figures, and documentation.
      </p>
    </header>
    <div class="project-columns" id="portfolioGrid">
      <!-- Cards injected by portfolio.js -->
    </div>
  </div>
</section>

<footer class="site-footer" id="contact">
  <p class="site-footer__kicker">Get in touch</p>
  <h2 class="site-footer__title">Let’s build something.</h2>
  <p class="site-footer__lede">
    I love connecting with fellow builders, researchers, and curious minds.
    Reach me anytime at <a href="mailto:rykerkollmyer@gmail.com" data-cursor-target>rykerkollmyer@gmail.com</a>.
  </p>
  <div class="site-footer__links">
    <a href="https://github.com/Ryker32" class="pill-link pill-link--ghost" target="_blank" rel="noopener" data-cursor-target>GitHub</a>
    <a href="https://www.linkedin.com/in/rykerkollmyer/" class="pill-link pill-link--ghost" target="_blank" rel="noopener" data-cursor-target data-proofer-ignore>LinkedIn</a>
    <a href="{{ '/contact/' | relative_url }}" class="pill-link pill-link--ghost" data-cursor-target>All contact options</a>
  </div>
  <p class="site-footer__copyright">© 2026 Ryker Kollmyer. All rights reserved.</p>
</footer>
