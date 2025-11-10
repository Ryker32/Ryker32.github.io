(() => {
  // Portfolio data structure
  // You can modify this to load from a JSON file or API
  const portfolioData = [
    {
      id: 1,
      title: "Project 1",
      thumbnailOptions: {
        width: '100%',
        height: '420px',
        fit: 'cover'
      },
      descriptionHTML: `
        <div class="article-intro">
          <p>This is an introductory paragraph that spans the full width.</p>
          <p>You can have multiple intro paragraphs here.</p>
        </div>
        <div class="article-image">
          <img src="/assets/img/project-image1.jpg" alt="Description" />
          <div class="image-caption">Caption text here. (Photo Credit)</div>
        </div>
        <p>This text will wrap around the image on the left. The image floats left by default.</p>
        <p>More text continues here, wrapping naturally around the image.</p>
        <div class="clear-float"></div>
        <div class="article-image">
          <video controls>
            <source src="/assets/video/hybrid-vehicle-detached.mp4" type="video/mp4">
          </video>
          <div class="image-caption">Video caption here.</div>
        </div>
        <p>Videos can also be embedded and wrapped with text.</p>
        <div class="clear-float"></div>
      `,
      image: "/assets/img/bwsicar.png",
      files: [
        { type: "image", url: "/assets/img/project1-detail1.jpg", name: "Detail 1" },
        { type: "image", url: "/assets/img/project1-detail2.jpg", name: "Detail 2" }
      ]
    },
    {
      id: 2,
      title: "Project 2",
      description: "This is a description of Project 2. Add your project details here.",
      thumbnailOptions: {
        width: '80%',
        height: '320px',
        fit: 'contain'
      },
      image: "/assets/img/project2.jpg",
      files: [
        { type: "image", url: "/assets/img/project2-detail1.jpg", name: "Detail 1" }
      ]
    },
    {
      id: 3,
      title: "Project 3",
      description: "This is a description of Project 3. Add your project details here.",
      image: "/assets/img/project3.jpg",
      files: [
        { type: "image", url: "/assets/img/project3-detail1.jpg", name: "Detail 1" }
      ]
    },
    {
      id: 4,
      title: "Project 4",
      description: "This is a description of Project 4. Add your project details here.",
      image: "/assets/img/project4.jpg",
      files: [
        { type: "image", url: "/assets/img/project4-detail1.jpg", name: "Detail 1" }
      ]
    },
    {
      id: 5,
      title: "Project 5",
      description: "This is a description of Project 5. Add your project details here.",
      image: "/assets/img/project5.jpg",
      files: [
        { type: "image", url: "/assets/img/project5-detail1.jpg", name: "Detail 1" }
      ]
    },
    {
      id: 6,
      title: "Project 6",
      description: "This is a description of Project 6. Add your project details here.",
      image: "/assets/img/project6.jpg",
      files: [
        { type: "image", url: "/assets/img/project6-detail1.jpg", name: "Detail 1" }
      ]
    },
    {
      id: 7,
      title: "Project 7",
      description: "This is a description of Project 7. Add your project details here.",
      image: "/assets/img/project7.jpg",
      files: [
        { type: "image", url: "/assets/img/project7-detail1.jpg", name: "Detail 1" }
      ]
    },
    {
      id: 8,
      title: "Project 8",
      description: "This is a description of Project 8. Add your project details here.",
      image: "/assets/img/project8.jpg",
      files: [
        { type: "image", url: "/assets/img/project8-detail1.jpg", name: "Detail 1" }
      ]
    },
    {
      id: 9,
      title: "Project 9",
      description: "This is a description of Project 9. Add your project details here.",
      image: "/assets/img/project9.jpg",
      files: [
        { type: "image", url: "/assets/img/project9-detail1.jpg", name: "Detail 1" }
      ]
    },
    {
      id: 10,
      title: "Project 10",
      description: "This is a description of Project 10. Add your project details here.",
      image: "/assets/img/project10.jpg",
      files: [
        { type: "image", url: "/assets/img/project10-detail1.jpg", name: "Detail 1" }
      ]
    }
  ];

  const portfolioGrid = document.getElementById('portfolioGrid');
  const projectModal = document.getElementById('projectModal');
  const modalClose = document.getElementById('modalClose');
  const modalThumbnailImg = document.getElementById('modalThumbnailImg');
  const modalThumbnail = document.getElementById('modalThumbnail');
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

    // Set thumbnail
    if (modalThumbnailImg && modalThumbnail) {
      // Reset thumbnail classes to base and apply any project-specific modifiers
      modalThumbnail.className = 'modal-thumbnail';
      modalThumbnail.style.removeProperty('--modal-thumbnail-width');
      modalThumbnail.style.removeProperty('--modal-thumbnail-height');
      modalThumbnail.style.removeProperty('--modal-thumbnail-fit');

      if (project.thumbnailClasses) {
        const modifiers = Array.isArray(project.thumbnailClasses)
          ? project.thumbnailClasses
          : String(project.thumbnailClasses).split(/\s+/).filter(Boolean);
        modifiers.forEach(cls => modalThumbnail.classList.add(cls));
      }

      if (project.thumbnailOptions) {
        const { width, height, fit } = project.thumbnailOptions;
        if (width) {
          modalThumbnail.style.setProperty('--modal-thumbnail-width', width);
        }
        if (height) {
          modalThumbnail.style.setProperty('--modal-thumbnail-height', height);
        }
        if (fit) {
          modalThumbnail.style.setProperty('--modal-thumbnail-fit', fit);
        }
      }

      const thumbnailSrc = project.image || '';
      if (thumbnailSrc) {
        modalThumbnailImg.src = thumbnailSrc;
        modalThumbnailImg.alt = project.title;
        modalThumbnailImg.style.display = 'block';
        modalThumbnailImg.onerror = function() {
          this.style.display = 'none';
        };
        modalThumbnailImg.onload = function() {
          this.style.display = 'block';
        };
      } else {
        modalThumbnailImg.style.display = 'none';
      }
    }

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

