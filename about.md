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
{% assign about_loop    = site.static_files | where: "path", "/assets/video/about-loop.mp4" | first %}
{% assign aboutme_video = site.static_files | where_exp: "f", "f.path contains '/assets/img/aboutme/' and f.extname == '.mp4'" | first %}
{% assign about_video   = aboutme_video | default: about_loop %}
{% assign aboutme_images = site.static_files | where_exp: "f", "f.path contains '/assets/img/aboutme/'" | sort: "path" %}
{% assign about_poster_raw = aboutme_images[0].path | default: "/assets/img/ryker.jpg" %}
{% assign about_poster = about_poster_raw | relative_url %}

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

<link rel="stylesheet" href="{{ '/assets/css/about.css' | relative_url }}">
<section id="about" class="about">
  <div class="about__bg"></div>
  <div class="about__grid">
    <div class="about__text">
      <h2 class="about__headline">
        <span class="about__typed" id="aboutTyped">hello, stranger...</span>
        <span class="about__caret">|</span>
      </h2>
      <p class="about__para">hey, i'm <strong>ryker.</strong></p>
      <p class="about__para">
        building and testing autonomy, robotics, and systems that have to work in the real world—from hybrid UAV/UGV platforms to EVs and battlebots.
      </p>
      <p class="about__para">
        i've presented at IEEE-MIT URTC and MIT AeroAstro, shipped 10+ hackathon projects, and led STEM writing and community fundraisers back home.
      </p>
      <p class="about__para">
        i'm into controls, sensing, and rapid prototyping. if you're working on something interesting, <a class="about__link" href="/#contact">reach out</a>!
      </p>
      <div class="about__links">
        <a class="pill" href="mailto:rykerkollmyer@gmail.com">Email</a>
        <a class="pill" href="https://www.linkedin.com/in/rykerkollmyer/" target="_blank" rel="noopener" data-proofer-ignore>LinkedIn</a>
        {% if resume_pdf %}
        <a class="pill" href="{{ resume_pdf.path | relative_url }}" target="_blank" rel="noopener">Resume PDF</a>
        {% endif %}
      </div>
    </div>
    <div class="about__media">
      <div class="about__media-frame">
        {% if about_video %}
        <video
          class="about__media-base"
          src="{{ about_video.path | relative_url }}"
          poster="{{ about_poster }}"
          autoplay
          muted
          loop
          playsinline
          preload="auto"
        ></video>
        {% else %}
        <img src="{{ about_poster }}" alt="Ryker Kollmyer" class="about__media-base about__hero-img" decoding="async">
        {% endif %}
        <div class="about__cards">
          {% assign has_cards = false %}
          {% for img in aboutme_images %}
            {% unless img.extname == '.mp4' %}
              {% assign has_cards = true %}
              <div class="about__card"><img src="{{ img.path | relative_url }}" alt="About photo"></div>
            {% endunless %}
          {% endfor %}
          {% unless has_cards %}
            <div class="about__card"><img src="{{ '/assets/img/ryker.jpg' | relative_url }}" alt="Ryker"></div>
          {% endunless %}
        </div>
        <div class="about__media-smear"></div>
        <div class="about__media-mask"></div>
      </div>
    </div>
  </div>
</section>

<script src="{{ '/assets/js/about.js' | relative_url }}"></script>

