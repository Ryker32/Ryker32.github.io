---
layout: default
---

<section class="hero" id="home">
  <div class="hero__canvas" aria-hidden="true">
    <canvas id="heroCanvas"></canvas>
  </div>
  <div class="hero__content">
    <p class="hero__eyebrow">Autonomy · Multi-agent systems · CAD</p>
    <h1>Ryker Kollmyer</h1>
    <p class="hero__lede">
      Robotics researcher and systems builder focused on resilient UAV/UGV platforms, REIP governance, and UX-heavy engineering tools.
      I like shipping polished demos that mix CAD, software, and field testing.
    </p>
  </div>
</section>

<section class="content-split" id="portfolio" aria-label="Portfolio layout">
  <aside class="profile-panel" id="about" aria-labelledby="profileHeading">
    <div class="profile-panel__card">
      {% if site.logo %}
      <div class="profile-panel__image">
        <img src="{{site.logo | relative_url }}" alt="Ryker Kollmyer portrait">
      </div>
      {% endif %}
      <div class="profile-panel__meta">
        <p class="profile-panel__eyebrow">Ryker Kollmyer</p>
        <h2 id="profileHeading">Autonomy researcher</h2>
        <p class="profile-panel__summary">
          I prototype hybrid UAV/UGV systems, governance policies for multi-agent drones, hands-on rockets, and health tech apps.
        </p>
      </div>
      <dl class="profile-panel__stats">
        <div>
          <dt>Focus</dt>
          <dd>Robotics, MAS, CAD</dd>
        </div>
        <div>
          <dt>Currently</dt>
          <dd>REIP research + UAV programs</dd>
        </div>
      </dl>
      <div class="profile-panel__actions">
        <a href="{{ site.github.owner_url }}" class="pill-link" target="_blank" rel="noopener" data-cursor-target>GitHub</a>
        <a href="https://www.linkedin.com/in/ryker-kollmyer/" class="pill-link pill-link--ghost" target="_blank" rel="noopener" data-cursor-target>LinkedIn</a>
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
