---
layout: default
---

<div class="portfolio-container">
  <div class="portfolio-banner">
    <h1>Project Portfolio</h1>
  </div>
  
  <div class="portfolio-grid" id="portfolio-grid">
    <!-- Project items will be added here via JavaScript or you can add them manually -->
    <div class="project-item" data-project-id="1">
      <div class="project-icon">
        <img src="/assets/img/logo.png" alt="Project 1" />
      </div>
      <div class="project-title">Project 1</div>
    </div>
    
    <div class="project-item" data-project-id="2">
      <div class="project-icon">
        <img src="/assets/img/logo.png" alt="Project 2" />
      </div>
      <div class="project-title">Project 2</div>
    </div>
    
    <div class="project-item" data-project-id="3">
      <div class="project-icon">
        <img src="/assets/img/logo.png" alt="Project 3" />
      </div>
      <div class="project-title">Project 3</div>
    </div>
    
    <div class="project-item" data-project-id="4">
      <div class="project-icon">
        <img src="/assets/img/logo.png" alt="Project 4" />
      </div>
      <div class="project-title">Project 4</div>
    </div>
  </div>
</div>

<!-- Project Modal -->
<div class="project-modal" id="project-modal">
  <div class="modal-overlay"></div>
  <div class="modal-content">
    <button class="modal-close" id="modal-close">&times;</button>
    <div class="modal-header">
      <h2 id="modal-title">Project Title</h2>
    </div>
    <div class="modal-body">
      <div class="modal-description" id="modal-description">
        <p>Project description goes here...</p>
      </div>
      <div class="modal-files" id="modal-files">
        <!-- Files/images will be added here -->
      </div>
    </div>
  </div>
</div>
