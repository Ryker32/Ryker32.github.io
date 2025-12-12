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
    <p class="hero__eyebrow">Autonomy · Multi-agent systems · CAD</p>
    <h1>Ryker Kollmyer</h1>
    <p class="hero__lede">
      Mechatronics and distributed-systems student researcher focused on robust hardware and software systems.
    </p>
  </div>
</section>

<section class="content-split" id="portfolio" aria-label="Portfolio layout">
  <aside class="profile-panel" id="about" aria-labelledby="profileHeading">
    <div class="profile-panel__card">
      <div class="profile-panel__image">
        <img src="{{ '/assets/img/ryker.jpg' | relative_url }}" alt="Ryker Kollmyer portrait">
      </div>
      <div class="profile-panel__meta">
        <p class="profile-panel__eyebrow">Ryker Kollmyer</p>
        <h2 id="profileHeading">Youth Researcher</h2>
        <p class="profile-panel__summary">
          I develop and build robots, research, and am founder of a education access initiative in Fiji.
          Outside of engineering I hike, boat, and cycle.
        </p>
      </div>
      <dl class="profile-panel__stats">
        <div>
          <dt>Focus</dt>
          <dd>Mechatronics, Distributed Systems</dd>
        </div>
        <div>
          <dt>Current</dt>
          <dd>Olympia High School CO '27</dd>
        </div>
      </dl>
      <div class="profile-panel__actions">
        <a href="{{ site.github.owner_url }}" class="pill-link" target="_blank" rel="noopener" data-cursor-target>GitHub</a>
        <a href="https://www.linkedin.com/in/rykerkollmyer/" class="pill-link pill-link--ghost" target="_blank" rel="noopener" data-cursor-target data-proofer-ignore>LinkedIn</a>
      </div>
    </div>
  </aside>

  <div class="portfolio-column">
    <header class="portfolio-header">
      <p class="portfolio-kicker">"What if?" started everything in my</p>
      <h2>Engineering Portfolio</h2>
      <p>
        Software systems, hackathons, rockets, and apps. Click any card to see an expanded view of the project including interactive CAD files,
        data, figures, high-def videos, and documentation.
      </p>
    </header>
    <div class="project-stack" id="portfolioGrid">
      <!-- Cards injected by portfolio.js -->
    </div>
  </div>
</section>

<footer class="site-footer" id="contact">
  <div>
    <h3>Let’s build something</h3>
    <p>rykerkollmyer@gmail.com · @Ryker32</p>
  </div>
  <p>© 2025 Ryker Kollmyer. All rights reserved.</p>
</footer>
