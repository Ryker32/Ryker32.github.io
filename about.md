---
layout: default
title: about
permalink: /about/
---

{% assign resume_pdf    = site.static_files | where: "path", "/assets/img/resume/RykerKollmyer_Resume (4).pdf" | first %}
{% assign resume_img0   = site.static_files | where: "path", "/assets/img/resume/RykerKollmyer_Resume (4) (1)_page-0001.jpg" | first %}
{% assign resume_img1   = site.static_files | where: "path", "/assets/img/resume/resume.png" | first %}
{% assign resume_img2   = site.static_files | where: "path", "/assets/img/resume/resume.jpg" | first %}
{% assign resume_img3   = site.static_files | where: "path", "/assets/img/resume.png" | first %}
{% assign resume_img4   = site.static_files | where: "path", "/assets/img/resume.jpg" | first %}

{% if resume_img0 %}
  {% assign resume_src = resume_img0.path | relative_url %}
{% elsif resume_img1 %}
  {% assign resume_src = resume_img1.path | relative_url %}
{% elsif resume_img2 %}
  {% assign resume_src = resume_img2.path | relative_url %}
{% elsif resume_img3 %}
  {% assign resume_src = resume_img3.path | relative_url %}
{% elsif resume_img4 %}
  {% assign resume_src = resume_img4.path | relative_url %}
{% else %}
  {% assign resume_src = "/assets/img/ryker.jpg" | relative_url %}
{% endif %}

<section class="about-hero">
  <div class="about-hero__grid">
    <div class="about-hero__text">
      <p class="about-hero__eyebrow">hello, stranger...</p>
      <h1 class="about-hero__title">Ryker Kollmyer</h1>
      <p class="about-hero__lede">
        Building and testing autonomy, robotics, and systems that have to work in the real world—from hybrid UAV/UGV platforms to electric vehicles and small robots.
      </p>
      <div class="about-hero__chips">
        <span>autonomy & robotics</span>
        <span>controls & sensing</span>
        <span>fast prototyping</span>
      </div>
      <ul class="about-hero__bullets">
        <li>Researching hybrid UAV/UGV autonomy at MIT AeroAstro.</li>
        <li>10+ hackathons; STEM writing and community fundraising back home.</li>
        <li>Hands-on builds: EVs, battlebots, plotters, printers, and more.</li>
      </ul>
      <div class="about-hero__links">
        <a class="pill" href="mailto:rykerkollmyer@gmail.com">Email</a>
        <a class="pill" href="https://www.linkedin.com/in/rykerkollmyer/" target="_blank" rel="noopener">LinkedIn</a>
        {% if resume_pdf %}
          <a class="pill" href="{{ resume_pdf.path | relative_url }}" target="_blank" rel="noopener">Resume PDF</a>
        {% endif %}
      </div>
    </div>
    <div class="about-hero__media">
      <div class="about-media-card primary">
        <img src="{{ '/assets/img/ryker.jpg' | relative_url }}" alt="Ryker Kollmyer" decoding="async">
      </div>
      <div class="about-media-card secondary">
        <img src="{{ resume_src }}" alt="Resume preview" loading="lazy" decoding="async">
      </div>
    </div>
  </div>
</section>

<section class="about-panels">
  <div class="about-panel">
    <h2>What I'm working on</h2>
    <p>Hybrid UAV/UGV autonomy, resilient controls, and rapid hardware iterations. I like taking ideas from CAD to field tests, then tightening the loop with data.</p>
  </div>
  <div class="about-panel">
    <h2>Recent highlights</h2>
    <ul class="about-panel__list">
      <li>Presented UAV research at MIT AeroAstro and IEEE events.</li>
      <li>Led STEM journalism and community fundraisers in Olympia.</li>
      <li>Built electric vehicles, battlebots, pen plotters, and robotics projects.</li>
    </ul>
  </div>
</section>
