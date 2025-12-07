---
layout: default
title: Resume
permalink: /resume/
---

{% assign resume_file = site.static_files | where: "path", "/assets/img/resume.png" | first %}
{% assign resume_pdf  = site.static_files | where: "path", "/assets/img/resume/RykerKollmyer_Resume (4).pdf" | first %}
{% if resume_file %}
  {% assign resume_src = resume_file.path | relative_url %}
{% else %}
  {% assign resume_src = "/assets/img/ryker.jpg" | relative_url %}
{% endif %}

<section class="resume-page">
  <div class="resume-container">
    {% if resume_pdf %}
    <div class="resume-download">
      <a class="pill-link" href="{{ resume_pdf.path | relative_url }}" download>Download PDF</a>
    </div>
    {% endif %}
    <div class="resume-image-wrapper">
      <img src="{{ resume_src }}" alt="Ryker Kollmyer Resume" class="resume-image">
      {% unless resume_file %}
      <p class="resume-note">Inline preview placeholder shown until resume.png is uploaded to assets/img/.</p>
      {% endunless %}
    </div>
  </div>
</section>

﻿