(() => {
  // Portfolio data structure
  // You can modify this to load from a JSON file or API
  const portfolioData = [
    {
      id: 1,
      title: "Project 1",
      description: "This is a description of Project 1. You can add detailed information about your project here, including technologies used, challenges faced, and outcomes achieved.",
      descriptionHtml: `
        <p>This is an introductory paragraph that spans the full width. You can have multiple intro paragraphs here.</p>
        <figure class="project-figure project-figure--left">
          <img src="/assets/img/project1-detail1.jpg" alt="Prototype detail">
          <figcaption>Caption text here. (Photo Credit)</figcaption>
        </figure>
        <p>This text will wrap around the image on the left. The image floats left by default. More text continues here, wrapping naturally around the image.</p>
        <figure class="project-figure project-figure--right">
          <img src="/assets/img/project1-detail2.jpg" alt="Live demo">
          <figcaption>Secondary image with additional context.</figcaption>
        </figure>
        <p>Use additional paragraphs to provide deeper technical insight. Swap these examples with your own images, diagrams, GIFs, or videos.</p>
      `,
      image: "/assets/img/bwsicar.png",
      files: [
        { type: "image", url: "/assets/img/bwsicar.png", name: "Thumbnail" },
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
      const placeholderSrc = modalThumbnailImg.dataset?.placeholder || modalThumbnailImg.getAttribute('src') || '';
      const thumbnailSrc = project.image || '';
      if (thumbnailSrc) {
        modalThumbnailImg.src = thumbnailSrc;
        modalThumbnailImg.alt = project.title;
        modalThumbnailImg.style.display = 'block';
        modalThumbnail.classList.add('has-image');
        modalThumbnailImg.onerror = function() {
          if (placeholderSrc) {
            this.src = placeholderSrc;
            modalThumbnail.classList.remove('has-image');
            this.style.display = 'block';
          } else {
            this.style.display = 'none';
            modalThumbnail.classList.remove('has-image');
          }
        };
        modalThumbnailImg.onload = function() {
          this.style.display = 'block';
          modalThumbnail.classList.add('has-image');
        };
      } else {
        if (placeholderSrc) {
          modalThumbnailImg.src = placeholderSrc;
          modalThumbnailImg.style.display = 'block';
        } else {
          modalThumbnailImg.removeAttribute('src');
          modalThumbnailImg.style.display = 'none';
        }
        modalThumbnail.classList.remove('has-image');
      }
    }

    // Set title
    modalTitle.textContent = project.title;

    // Set description
    modalDescription.innerHTML = '';
    if (project.descriptionHtml) {
      modalDescription.innerHTML = project.descriptionHtml;
    } else {
      const descriptionText = project.description || 'No description available.';
      const descriptionParagraphs = descriptionText.split('\n').filter(p => p.trim());
      descriptionParagraphs.forEach(text => {
        const p = document.createElement('p');
        p.textContent = text;
        modalDescription.appendChild(p);
      });
    }

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

