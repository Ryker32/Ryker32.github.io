(() => {
  // Portfolio data structure
  // You can modify this to load from a JSON file or API
  // 
  // For article-style layouts with images and text wrapping, use descriptionHTML:
  // 
  // Example with images and videos:
  // {
  //   id: 1,
  //   title: "My Project",
  //   descriptionHTML: `
  //     <div class="article-intro">
  //       <p>This is an introductory paragraph that spans the full width.</p>
  //       <p>You can have multiple intro paragraphs here.</p>
  //     </div>
  //     <div class="article-image">
  //       <img src="/assets/img/project-image1.jpg" alt="Description" />
  //       <div class="image-caption">Caption text here. (Photo Credit)</div>
  //     </div>
  //     <p>This text will wrap around the image on the left. The image floats left by default.</p>
  //     <p>More text continues here, wrapping naturally around the image.</p>
  //     <div class="clear-float"></div>
  //     <div class="article-image">
  //       <video controls>
  //         <source src="/assets/video/demo.mp4" type="video/mp4">
  //       </video>
  //       <div class="image-caption">Video caption here.</div>
  //     </div>
  //     <p>Videos can also be embedded and wrapped with text.</p>
  //     <div class="clear-float"></div>
  //   `,
  //   image: "/assets/img/project1.jpg",
  //   files: [
  //     { type: "image", url: "/assets/img/detail1.jpg", name: "Detail 1" },
  //     { type: "video", url: "/assets/video/demo.mp4", name: "Demo Video", poster: "/assets/img/video-thumb.jpg" },
  //     { type: "youtube", url: "https://www.youtube.com/embed/VIDEO_ID", name: "YouTube Video" }
  //   ]
  // }
  //
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

    // Set description - supports rich HTML content
    modalDescription.innerHTML = '';
    if (project.descriptionHTML) {
      // If descriptionHTML is provided, use it directly (allows full HTML control)
      modalDescription.innerHTML = project.descriptionHTML;
    } else if (project.description) {
      // Otherwise, parse as HTML if it contains HTML tags, or as plain text
      const hasHTML = /<[a-z][\s\S]*>/i.test(project.description);
      if (hasHTML) {
        modalDescription.innerHTML = project.description;
      } else {
        // Plain text: split by newlines and create paragraphs
        const descriptionParagraphs = project.description.split('\n').filter(p => p.trim());
        if (descriptionParagraphs.length === 0) {
          descriptionParagraphs.push(project.description || 'No description available.');
        }
        descriptionParagraphs.forEach(text => {
          const p = document.createElement('p');
          p.textContent = text;
          modalDescription.appendChild(p);
        });
      }
    } else {
      modalDescription.innerHTML = '<p>No description available.</p>';
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
          
          // Make image items clickable to view full size
          fileItem.addEventListener('click', () => {
            if (file.url) {
              window.open(file.url, '_blank');
            }
          });
        } else if (file.type === 'video') {
          fileItem.className = 'file-item file-item-video';
          const video = document.createElement('video');
          video.src = file.url;
          video.controls = true;
          video.preload = 'metadata';
          video.style.width = '100%';
          video.style.height = '100%';
          video.style.objectFit = 'cover';
          if (file.poster) {
            video.poster = file.poster; // Optional thumbnail image
          }
          fileItem.appendChild(video);
          
          // Don't make videos clickable (they have their own controls)
          fileItem.style.cursor = 'default';
        } else if (file.type === 'youtube' || file.type === 'iframe') {
          // Support for YouTube embeds or other iframe videos
          fileItem.className = 'file-item file-item-iframe';
          const iframe = document.createElement('iframe');
          iframe.src = file.url;
          iframe.setAttribute('frameborder', '0');
          iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
          iframe.allowFullscreen = true;
          iframe.style.width = '100%';
          iframe.style.height = '100%';
          fileItem.appendChild(iframe);
          fileItem.style.cursor = 'default';
        } else {
          fileItem.innerHTML = `<div class="file-placeholder">${file.name || 'File'}</div>`;
        }
        
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

