(() => {
  // Project data - you can customize this with your actual projects
  const projects = {
    1: {
      title: "Project 1",
      description: "This is a description of Project 1. You can add detailed information about your project here, including technologies used, challenges faced, and outcomes achieved.",
      files: [
        // Add image paths or file links here
        // Example: { type: 'image', url: '/assets/img/project1-1.jpg' },
        // Example: { type: 'file', url: '/assets/files/project1-doc.pdf', name: 'Project Documentation' }
      ]
    },
    2: {
      title: "Project 2",
      description: "This is a description of Project 2. Describe what this project does, what technologies you used, and what you learned from it.",
      files: []
    },
    3: {
      title: "Project 3",
      description: "This is a description of Project 3. Add your project details, screenshots, and any relevant files here.",
      files: []
    },
    4: {
      title: "Project 4",
      description: "This is a description of Project 4. Customize this with your actual project information.",
      files: []
    }
  };

  const modal = document.getElementById('project-modal');
  const modalClose = document.getElementById('modal-close');
  const modalTitle = document.getElementById('modal-title');
  const modalDescription = document.getElementById('modal-description');
  const modalFiles = document.getElementById('modal-files');
  const projectItems = document.querySelectorAll('.project-item');

  // Open modal with project data
  function openModal(projectId) {
    const project = projects[projectId];
    if (!project) return;

    modalTitle.textContent = project.title;
    modalDescription.innerHTML = `<p>${project.description}</p>`;
    
    // Clear and populate files
    modalFiles.innerHTML = '';
    if (project.files && project.files.length > 0) {
      project.files.forEach(file => {
        if (file.type === 'image') {
          const img = document.createElement('img');
          img.src = file.url;
          img.alt = file.alt || project.title;
          modalFiles.appendChild(img);
        } else if (file.type === 'file') {
          const link = document.createElement('a');
          link.href = file.url;
          link.target = '_blank';
          link.textContent = file.name || 'Download File';
          modalFiles.appendChild(link);
        }
      });
    }

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  // Close modal
  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
  }

  // Event listeners for project items
  projectItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const projectId = item.getAttribute('data-project-id');
      if (projectId) {
        openModal(projectId);
      }
    });
  });

  // Close modal events
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (modal) {
    // Close when clicking overlay
    modal.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        closeModal();
      }
    });

    // Close with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }
})();

