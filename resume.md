---
layout: default
title: Resume
permalink: /resume/
---

{% assign resume_file = site.static_files | where: "path", "/assets/img/resume.png" | first %}
{% assign resume_src = resume_file ? resume_file.path | relative_url : '/assets/img/ryker.jpg' | relative_url %}

<section class="resume-page">
  <div class="resume-container">
    <div class="resume-image-wrapper">
      <img src="{{ resume_src }}" alt="Ryker Kollmyer Resume" class="resume-image">
      {% unless resume_file %}
      <p class="resume-note">Inline preview placeholder shown until resume.png is uploaded to assets/img/.</p>
      {% endunless %}
    </div>
  </div>
</section>

﻿