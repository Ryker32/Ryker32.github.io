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

<section class="content-section about-blurb" id="about" aria-labelledby="aboutHeading">
  <div class="about-blurb__inner">
    <h2 id="aboutHeading">hello, world...</h2>
    <div class="about-blurb__body">
      <div class="about-blurb__text">
        <p>
          hey, i'm ryker. mechatronics and distributed-systems student researcher at olympia high school
          (class of '27). i spend most of my time building robust hardware and software systems &mdash;
          hybrid uav-ugv platforms, fault-tolerant multi-agent governance, rocket engines, and the
          occasional shipped product.
        </p>
        <p>
          i've presented peer-reviewed research at <a href="https://urtc.mit.edu/" target="_blank" rel="noopener" data-cursor-target>ieee urtc</a> at mit,
          won the bwsi autonomous uav race, co-invented a patent-pending health app, and founded an
          education-access initiative for the yalobi school in fiji.
        </p>
        <p>
          outside of engineering i hike, boat, cycle, and windsurf. if you're building something
          interesting, reach out &mdash; i'm on
          <a href="{{ site.github.owner_url }}" target="_blank" rel="noopener" data-cursor-target>github</a> and
          <a href="https://www.linkedin.com/in/rykerkollmyer/" target="_blank" rel="noopener" data-cursor-target data-proofer-ignore>linkedin</a>.
        </p>
      </div>
      <figure class="about-blurb__photo" aria-hidden="false">
        <img src="{{ '/assets/img/ryker.jpg' | relative_url }}" alt="Ryker Kollmyer portrait">
      </figure>
    </div>
  </div>
</section>

<section class="content-section works-section" id="portfolio" aria-labelledby="worksHeading">
  <div class="works-section__inner">
    <header class="portfolio-header">
      <h2 id="worksHeading">selected works...</h2>
      <p>
        software systems, hackathons, rockets, and apps. click any card for the full write-up &mdash;
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
  <p class="site-footer__copyright">© 2025 Ryker Kollmyer. All rights reserved.</p>
</footer>
