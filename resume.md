---
layout: default
title: Resume
permalink: /resume/
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