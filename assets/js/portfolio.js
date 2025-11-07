(() => {
  // Portfolio data structure
  // You can modify this to load from a JSON file or API
  const portfolioData = [
    {
      id: 1,
      title: "Project 1",
      description: "This is a description of Project 1. You can add detailed information about your project here, including technologies used, challenges faced, and outcomes achieved.",
      image: "/assets/img/project1.jpg",
      files: [
        { type: "image", url: "/assets/img/project1-detail1.jpg", name: "Detail 1" },
        { type: "image", url: "/assets/img/project1-detail2.jpg", name: "Detail 2" }
      ]
    },
    {
      id: 2,
      title: "Project 2",
      description: "This is a description of Project 2. Add your project details here.",
      image: "/assets/img/project2.jpg",
      files: [
        { type: "image", url: "/assets/img/project2-detail1.jpg", name: "Detail 1" }
      ]
    }
    // Add more projects here
  ];

  const portfolioGrid = document.getElementById('portfolioGrid');
  const projectModal = document.getElementById('projectModal');
  const modalClose = document.getElementById('modalClose');
  const modalTitle = document.getElementById('modalTitle');
  const modalDescription = document.getElementById('modalDescription');
  const filesGrid = document.getElementById('filesGrid');

  // Initialize portfolio grid
  function initPortfolio() {
    if (!portfolioGrid) return;

    portfolioData.forEach(project => {
      const card = createProjectCard(project);
      portfolioGrid.appendChild(card);
    });
  }

  // Create a project card element
  function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.setAttribute('data-project-id', project.id);
    
    const imageDiv = document.createElement('div');
    imageDiv.className = 'project-image';
    
    const img = document.createElement('img');
    img.src = project.image || '/assets/img/logo.png'; // Fallback image
    img.alt = project.title;
    img.onerror = function() {
      this.src = '/assets/img/logo.png'; // Fallback if image doesn't exist
    };
    
    imageDiv.appendChild(img);
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'project-title';
    titleDiv.textContent = project.title;
    
    card.appendChild(imageDiv);
    card.appendChild(titleDiv);
    
    card.addEventListener('click', () => openModal(project));
    
    return card;
  }

  // Open modal with project details
  function openModal(project) {
    if (!projectModal || !modalTitle || !modalDescription || !filesGrid) return;

    // Set title
    modalTitle.textContent = project.title;

    // Set description
    modalDescription.innerHTML = '';
    const descriptionParagraphs = project.description.split('\n').filter(p => p.trim());
    if (descriptionParagraphs.length === 0) {
      descriptionParagraphs.push(project.description || 'No description available.');
    }
    descriptionParagraphs.forEach(text => {
      const p = document.createElement('p');
      p.textContent = text;
      modalDescription.appendChild(p);
    });

    // Clear and populate files
    filesGrid.innerHTML = '';
    if (project.files && project.files.length > 0) {
      project.files.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        if (file.type === 'image') {
          const img = document.createElement('img');
          img.src = file.url;
          img.alt = file.name || 'Project file';
          img.onerror = function() {
            this.parentElement.innerHTML = `<div class="file-placeholder">${file.name || 'Image not found'}</div>`;
          };
          fileItem.appendChild(img);
        } else {
          fileItem.innerHTML = `<div class="file-placeholder">${file.name || 'File'}</div>`;
        }
        
        // Make file items clickable to view full size
        fileItem.addEventListener('click', () => {
          if (file.type === 'image' && file.url) {
            window.open(file.url, '_blank');
          }
        });
        
        filesGrid.appendChild(fileItem);
      });
    } else {
      // Show message if no files
      const noFilesMsg = document.createElement('div');
      noFilesMsg.className = 'file-placeholder';
      noFilesMsg.style.gridColumn = '1 / -1';
      noFilesMsg.textContent = 'No files attached to this project.';
      filesGrid.appendChild(noFilesMsg);
    }

    // Show modal
    projectModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  // Close modal
  function closeModal() {
    if (!projectModal) return;
    projectModal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
  }

  // Event listeners
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (projectModal) {
    // Close modal when clicking overlay
    projectModal.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        closeModal();
      }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && projectModal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortfolio);
  } else {
    initPortfolio();
  }
})();

