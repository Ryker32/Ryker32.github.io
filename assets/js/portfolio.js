(() => {
  // Portfolio data structure
  // You can modify this to load from a JSON file or API
  // 
  // For article-style layouts with images and text wrapping, use descriptionHtml:
  // 
  // Example with images, videos, and interactive CAD:
  // {
  //   id: 1,
  //   title: "My Project",
  //   descriptionHtml: `
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
  //     <h3>CAD</h3>
  //     <div class="article-image width-large height-tall">
  //       <model-viewer 
  //         src="/assets/models/cad-model.glb" 
  //         alt="3D CAD Model"
  //         camera-controls 
  //         auto-rotate 
  //         ar
  //         shadow-intensity="1"
  //         exposure="1">
  //       </model-viewer>
  //       <div class="image-caption">Interactive 3D CAD model. Drag to rotate, scroll to zoom.</div>
  //     </div>
  //     <p>You can embed interactive 3D CAD files using model-viewer. Convert your CAD files to glTF/GLB format.</p>
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
  //     { type: "image", url: "/assets/img/detail1.jpg", name: "Demo 1" },
  //     { type: "video", url: "/assets/video/demo.mp4", name: "Demo Video", poster: "/assets/img/video-thumb.jpg" },
  //     { type: "youtube", url: "https://www.youtube.com/embed/VIDEO_ID", name: "YouTube Video" }
  //   ]
  // }
  //
  // For interactive CAD files, you have two options:
  //
  // OPTION 1: Fusion 360 Native Embed (Recommended - easiest)
  // 1. In Fusion 360, open your design
  // 2. Click "Share" > "Share Public Link" or "Get link"
  // 3. Copy the share link (looks like: https://a360.co/XXXXX)
  // 4. Use an iframe in your descriptionHtml:
  //    <h3>CAD</h3>
  //    <div class="article-image fusion-360-embed">
  //      <iframe 
  //        src="https://a360.co/XXXXX" 
  //        allowfullscreen="true" 
  //        webkitallowfullscreen="true" 
  //        mozallowfullscreen="true" 
  //        frameborder="0">
  //      </iframe>
  //      <div class="image-caption">Interactive Fusion 360 model. Click and drag to rotate, scroll to zoom.</div>
  //    </div>
  //    <div class="clear-float"></div>
  //
  // OPTION 2: model-viewer (for offline/self-hosted models)
  // 1. Export your Fusion 360 model to glTF (.gltf) or GLB (.glb) format
  //    - Fusion 360: File > Export > glTF (if available)
  //    - Or: File > Export > 3MF, then convert using online converter
  //    - Online converters: https://products.aspose.app/3d/conversion
  // 2. Place the .glb or .gltf file in your assets folder (e.g., /assets/models/)
  // 3. Use <model-viewer> tag in your descriptionHtml with:
  //    - src: path to your .glb/.gltf file
  //    - camera-controls: enables mouse/touch controls
  //    - auto-rotate: automatically rotates the model
  //    - ar: enables AR viewing on mobile devices
  //    - Other attributes: exposure, shadow-intensity, etc.
  //
  const portfolioData = [
    {
      id: 1,
      title: "Hybrid/Modular UAV-UGV Research",
      description: "This is a description of Project 1. You can add detailed information about your project here, including technologies used, challenges faced, and outcomes achieved.",
      descriptionHtml: `
        <h3 class="clear-both">Context</h3>
        <p>This was completed externally from BWSI under guidance of two researchers from the Cambridge area. I presented it along with a teammate at the IEEE-MIT Undergraduate Research and Technology Conference as a poster presentation. 
        This was done during the summer of 2025 with four other team mates. I contributed by CADing the wheels, sourcing materials, and coming up with an overall team plan for the project including documentation in a notebook and creating a roadmap.
        </p>
        <figure class="project-figure project-figure--left object-cover" style="height: 400px; max-height: 400px; width: 300px; max-width: 300px;">
          <img src="/assets/img/bwsicars/modifiedlanding.png" alt="Landing Gear">
          <figcaption>Landing gear modeled in Fusion 360. (Photo Cred: Ryker Kollmyer)</figcaption>
        </figure>
        <h3 class="clear-both">Landing Gear Modification</h3>
        <p>I realized that we could use the carbon pipes from the old landing gear to create "rails" for the UGV to attach onto the UAV. Through experimental trials we discovered that the new landing gear was more stable than the standard landing gear while being funcitonal to a hybrid system.</p>
        <figure class="project-figure project-figure--right">
          <img src="/assets/img/project1-detail2.jpg" alt="Live demo">
          <figcaption>Secondary image with additional context.</figcaption>
        </figure>
        <p>Use additional paragraphs to provide deeper technical insight. Swap these examples with your own images, diagrams, GIFs, or videos.</p>
        <div class="clear-float"></div>
        
        <h3>CAD</h3>
        <div class="article-image fusion-360-embed">
          <iframe 
            src="https://a360.co/45sUzAD" 
            allowfullscreen="true" 
            webkitallowfullscreen="true" 
            mozallowfullscreen="true" 
            frameborder="0">
          </iframe>
          <div class="image-caption">Interactive Fusion 360 model. Click and drag to rotate, scroll to zoom.</div>
        </div>
        <div class="clear-float"></div>
      `,
      image: "/assets/img/bwsicars/bwsicar.png",
      files: []
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
  const modalFiles = document.getElementById('modalFiles');
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

    // Clear and populate files - hide section if no files
    if (modalFiles) {
      filesGrid.innerHTML = '';
      // Check if files exist and array is not empty
      const hasFiles = project.files && Array.isArray(project.files) && project.files.length > 0;
      if (hasFiles) {
        modalFiles.style.display = 'block';
        modalFiles.removeAttribute('hidden');
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
        // Hide the entire files section if no files
        modalFiles.style.display = 'none';
        modalFiles.setAttribute('hidden', 'true');
      }
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
