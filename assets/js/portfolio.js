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
  //     <h3>YouTube Video</h3>
  //     <div class="article-image youtube-embed">
  //       <div class="youtube-thumbnail" data-video-id="VIDEO_ID">
  //         <img src="https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg" alt="Video thumbnail">
  //       </div>
  //       <div class="image-caption">Click the thumbnail to play the video.</div>
  //     </div>
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
      date: "July 2025 - October 2025",
      keyPoints: "MIT Lincoln Laboratory · ROS2 + PX4 · IEEE-URTC poster",
      repoUrl: "https://github.com/Ryker32/Hybrid-UAV-UGV", // Example repository
      description: "As an Autonomous Systems Researcher with MIT Lincoln Laboratory, built a detachable rover + quadcopter system that ferries a ground robot over hostile terrain and re-docks in flight. Presented as a peer-reviewed poster at IEEE URTC at the MIT STATA Center.",
      badge: "IEEE-URTC",
      orgLogo: "/assets/img/logos/mit.png",
      highlights: [
        "Autonomous Systems Researcher, MIT Lincoln Laboratory",
        "Custom dock + battery rails keep the UGV stable in flight",
        "Peer-reviewed poster at IEEE URTC, MIT STATA Center"
      ],
      descriptionHtml: `
      <H3>At a glance</H3>
      <ul>
        <li><strong class="list-label">Team:</strong> 5 high school students</li>
        <li><strong class="list-label">Mentors:</strong> Two Cambridge-area researchers from the BWSI network</li>
        <li><strong class="list-label">Goal:</strong> Design a hybrid UAV-UGV system where a quadcopter ferries a small rover over terrain it can't traverse (tall grass, stairs, rubble), then re-docks and extracts it</li>
        <li><strong class="list-label">My role:</strong> Autonomous Systems Researcher (MIT Lincoln Laboratory); research project organizer, hardware, data analysis, CAD, materials sourcing, and documentation</li>
        <li><strong class="list-label">Stack:</strong> Fusion 360, ROS2, PX4, Python, 3D printing.</li>
        <li><strong class="list-label">Outcome:</strong> Working prototype demonstrated at Beaver Works Summer Institute (BWSI) in the Zesiger Center MIT; presented as a peer-reviewed poster at the IEEE MIT Undergraduate Research and Technology Conference (URTC).</li>
        </ul>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin: 24px 0; clear: both; align-items: stretch; width: 100%;">
          <figure class="project-figure object-cover" style="height: 400px; max-height: 400px; width: 100%; max-width: none;">
            <img src="/assets/img/bwsicars/cardrone.png" alt="Soldering">
            <figcaption>This is the drone with the car attached.</figcaption>
          </figure>
          <figure class="project-figure object-cover" style="height: 400px; max-height: 400px; width: 100%; max-width: none;">
            <img src="/assets/img/bwsicars/car.png" alt="Soldering">
            <figcaption>This is the standalone car.</figcaption>
          </figure>
          <figure class="project-figure--right object-cover" style="height: 400px; max-height: 400px; width: 100%; max-width: none;">
            <img src="/assets/img/bwsicars/presentationposter.png" alt="Deconstruction">
            <figcaption>Poster with demo drone on it.</figcaption>
          </figure>
        </div>
        <div class="clear-float"></div>
        <hr>
        <figure class="project-figure project-figure--right object-cover" style="height: 400px; max-height: 400px; width: 400px; max-width: 400px;">
          <img src="/assets/img/bwsicars/mitdrone.jpg" alt="Custom drone frame">
          <figcaption>Final modified Holybro X500 V2 drone.</figcaption>
        </figure>
        <h3>Project Overview</h3>
        <p>We extended the BWSI UAV course by proposing an external research project: a “drone on wheels” that combines a quadcopter (UAV) with a ground vehicle (UGV). The UAV carries the UGV over terrain the rover can't handle, releases it to drive a precision course, then re-attaches and extracts it (using Aruco tags).</p>
        <p>We designed a modular attachment system where the landing gear doubles as rails for the UGV, plus a new battery mount that keeps the vehicle mechanically stable in flight while still allowing quick separation and re-docking.</p>
        <p>We tested the hybrid platform in the <strong class="list-label">MIT AeroAstro lab</strong> and on foam, concrete, grass, mulch, sand, and dirt, measuring linear and angular velocity to quantify when a UAV “ride” is necessary for small UGVs. Control and telemetry were handled with <strong class="list-label">ROS2</strong> + <strong class="list-label">PX4</strong>.</p>
        <div class="clear-float"></div>
        <hr>
        <h3>IEEE-URTC</h3>
          <div style="display: flex; gap: 24px; margin: 24px 0; clear: both;">
            <div style="flex: 0 0 45%; display: flex; flex-direction: column; gap: 16px;">
              <figure class="project-figure">
                <video muted loop playsinline preload="none" data-lazy-video style="width: 100%; height: auto; display: block; border-radius: 12px 12px 0 0; object-fit: cover;">
                  <source src="/assets/video/hybrid-vehicle-detached.mp4" type="video/mp4">
                </video>
                <figcaption>UAV and UGV separated</figcaption>
              </figure>
              <figure class="project-figure">
                <video muted loop playsinline preload="none" data-lazy-video style="width: 100%; height: auto; display: block; border-radius: 12px 12px 0 0; object-fit: cover;">
                  <source src="/assets/video/hybrid-vehicle-flight.mp4" type="video/mp4">
                </video>
                <figcaption>Hybrid Vehicle Flight</figcaption>
              </figure>
            </div>
            <div style="flex: 1 1 55%; display: flex; flex-direction: column; gap: 12px;">
              <iframe
                src="/assets/img/bwsicars/poster.pdf#view=FitH&toolbar=0&navpanes=0&scrollbar=0"
                style="width: 100%; height: 720px; border: 2px solid var(--edge); border-radius: 8px; background: #0f131b;"
              ></iframe>
              <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                <a href="/assets/img/bwsicars/poster.pdf" target="_blank" rel="noopener" data-cursor-target>Open full PDF</a>
                <a href="/assets/img/bwsicars/poster.pdf#view=FitH" target="_blank" rel="noopener" data-cursor-target>View in browser</a>
              </div>
            </div>
          </div>
        <div class="clear-float"></div>
        <hr>
        <h3 class="clear-both">Context</h3>
        <p>This was completed externally from BWSI under guidance of two researchers from the Cambridge area. I presented it along with a teammate at the IEEE-MIT Undergraduate Research and Technology Conference as a poster presentation. 
        This was done during the summer of 2025 with four other teammates. I contributed by designing the wheels in CAD, sourcing materials, and coming up with an overall team plan for the project including documentation in a notebook and creating a roadmap.
        </p>
        <figure class="project-figure project-figure--left object-cover" style="height: 400px; max-height: 400px; width: 300px; max-width: 300px;">
          <img src="/assets/img/bwsicars/modifiedlanding.png" alt="Landing Gear">
          <figcaption>Landing gear modeled in Fusion 360. (Photo Cred: Ryker Kollmyer)</figcaption>
        </figure>
        <figure class="project-figure project-figure--right object-cover" style="height: 400px; max-height: 400px; width: 300px; max-width: 300px;">
          <img src="/assets/img/bwsicars/custombattery.jpg" alt="Custom Battery">
          <figcaption>Battery Holder modeled in Fusion 360. (Photo Cred: Ryker Kollmyer)</figcaption>
        </figure>
        <h3>Landing Gear & Battery Holder Modification</h3>
        <p>We realized that we could use the carbon pipes from the old landing gear to create "rails" for the UGV to attach onto the UAV. Through experimental trials we discovered that the new landing gear was more stable than the standard landing gear while being funcitonal to a hybrid system.</p>
        <p>The new landing gear presented another problem, the battery was too large to fit as the UGV is designed to snugly fit onto the bottom of the UAV. We designed a new battery mount that mitigates instability while allowing for easy battery access.</p>
        <div class="clear-float"></div>

        <hr>
        
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
      title: "REIP: Trust-Based Fault Tolerance for Multi-Agent Systems",
      date: "March 2025 - February 2026",
      keyPoints: "WSSEF 1st in Robotics · AIAA Symposium · Multi-agent research",
      description: "Designed a democratic governance framework that lets robot teams detect, impeach, and replace faulty leaders — 3.1x more reliable than the standard heartbeat baseline. 1st place in Robotics and Top 20 overall out of 1,200 at the Washington State Science & Engineering Fair 2026.",
      badge: "WSSEF 1st",
      orgLogo: "/assets/img/logos/wssef.png",
      highlights: [
        "1st in Robotics + Top 20 overall of 1,200 @ WSSEF 2026",
        "3.1x more reliable than baseline; 98% vs 22% coverage under adversarial faults",
        "Presented at AIAA Technical Symposium; hardware port with custom PCBs + 3D-printed robots"
      ],
      descriptionHtml: `
      <h3>At a glance</h3>
      <ul>
        <li><strong class="list-label">Solo project</strong> with mentorship from Avi Soval, a masters student in aerospace and multi agent systems research.</li>
        <li><strong class="list-label">My role:</strong> Conducted literature review, developed the novel REIP governance policy, built a full multi-agent simulation environment, ran controlled experiments/ablations, wrote a technical analysis report paper and a software system description document.</li>
        <li><strong class="list-label">Goal:</strong> Develop a governance policy for leader-follower drone systems so teams can maintain coverage even when AI based leaders "hallucinate" or adversarial attacks occur.</li>
        <li><strong class="list-label">Key tools:</strong> Python & C++, MATLAB, NumPy, R, custom Grid-World environment, multiprocessing library for parallel agent processing, Matplotlib, LaTeX, Pandas, CAD + PCB design for the hardware port.</li>
        <li><strong class="list-label">Outcome:</strong> In faulted environments with hallucinating leaders and packet loss, REIP reached 98% final coverage vs 22% for a leader-follower baseline under identical adversarial faults (76 pp resilience gain); 3.1x more reliable than the standard heartbeat-based baseline.</li>
        <li><strong class="list-label">Results:</strong> <strong class="list-label">1st place in Robotics</strong> and <strong class="list-label">Top 20 overall out of 1,200</strong> at the Washington State Science & Engineering Fair 2026; presented at the AIAA Technical Symposium.</li>
        <li><strong class="list-label">Status:</strong> Hardware implementation in progress on two Holybro X500 drones courtesy of South Puget Sound Community College, and five Micromouse robots using Raspberry Pi 5s with custom PCBs and 3D-printed chassis.</li>
      </ul>
      <figure class="project-figure" style="width: 100%; max-width: 100%; display: block; float: none; margin: 24px 0;">
        <video muted loop playsinline preload="none" data-lazy-video style="width: 100%; height: auto; display: block; border-radius: 4px; object-fit: cover;">
          <source src="/assets/img/reip/Hallucination.mp4" type="video/mp4">
        </video>
        <figcaption>Live demonstration of REIP in action in a 2-D gridworld environment.</figcaption>
      </figure>

      <hr>
      
      <h3>Project Overview</h3>
      <p>
      Resilient Election & Impeachment Policy (REIP) is my research project that won 1st place in Robotics (Top 20 overall out of 1,200) at the Washington State Science & Engineering Fair 2026 and was presented at the AIAA Technical Symposium. The project tackles a hard robotics question: how do we keep multi-agent teams coordinated when leaders fail, misbehave, or face adversarial interference? Traditional leader-follower strategies crumble when the designated leader hallucinates or loses communication, so I designed a trust-based governance layer that lets the team continuously evaluate leadership, call elections when trust drops, and impeach compromised leaders in real time. This governance sits above standard exploration behaviors and treats leadership as a revocable privilege rather than a fixed role.
      </p>
      <hr>
      <h3>Custom Simulation Environment</h3>
      <p>
      I built this custom simulation environment in Python that allows me to live monitor the behavior of the agents in the environment.
      This environment is a grid-world with a start and end point, and a number of obstacles. The drones can move around the grid-world and collect rewards.
      The agents each have a local view of the environment and a shared "Simultaneous Localization And Mapping" (SLAM) view of the environment through a custom communication protocol.
      The simulation can be ran under .YAML configuration files that define which agent policy is to be ran within the environment for comparison and ablation tests.
      </p>
      <div class="reip-section">
        <figure class="project-figure" style="height: 550px; max-height: 550px; width: 500px; max-width: 500px;">
          <img src="/assets/img/reip/square.png" alt="REIP Simulation Demo">
          <figcaption>Demo image of the REIP simulation environment.</figcaption>
        </figure>
        <div class="reip-guide">
          <h3>Simulation Interpretation Guide</h3>
          <ul class="reip-list">
            <li><strong class="list-label">t:</strong> Current time step</li>
            <li><strong class="list-label">N:</strong> Number of agents</li>
            <li><strong class="list-label">Dots:</strong> Agents with their individual ID number labeled</li>
            <li><strong class="list-label">Agent with yellow "halo":</strong> Current leader with current trust metric labeled</li>
            <li><strong class="list-label">Dashed circle around agents:</strong> Communication Radius</li>
            <li><strong class="list-label">Green squares around agents:</strong> Visibility Radius</li>
            <li><strong class="list-label">Black Squares:</strong> Obstacles</li>
            <li><strong class="list-label">Blue Squares:</strong> Unexplored Spaces</li>
            <li><strong class="list-label">Yellow Squares:</strong> Currently visible frontiers (exploration targets)</li>
          </ul>
        </div>
      </div>
      <hr>
      <h3>Results</h3>
      <div style="float: right; width: 500px; max-width: 50%; margin: 0 0 24px 40px; display: flex; flex-direction: column; gap: 24px;">
        <figure class="project-figure" style="width: 100%; max-width: 100%; margin: 0;">
          <img src="/assets/img/reip/adversarial.png" alt="Adversarial Conditions" style="width: 100%; height: auto; display: block;">
          <figcaption>Adversarial conditions Coverage Vs. Time graph.</figcaption>
        </figure>
        <figure class="project-figure" style="width: 100%; max-width: 100%; margin: 0;">
          <img src="/assets/img/reip/cleanconditions.png" alt="Clean Conditions" style="width: 100%; height: auto; display: block;">
          <figcaption>Clean conditions Coverage Vs. Time graph.</figcaption>
        </figure>
      </div>
      <p> <strong class="list-label">Clean conditions (no injected faults):</strong>
      A round-robin leader-follower baseline and REIP both reach similar final coverage (baseline 92.6%, REIP 91.2%), showing that the governance layer doesn't significantly hurt performance when the leader is healthy.
      </p>
      <p> <strong class="list-label">Adversarial conditions (hallucinations + packet / command loss):</strong>
      The fixed leader-follower baseline's final coverage collapses to 22.0%, while REIP still maps 98.0% of the grid—a 76 pp advantage. Across 2,000 trials, the baseline reaches 95% coverage in 47.9% of runs (median 399.6 steps), whereas REIP succeeds in 100% of runs with median time-to-95% of 273.5 steps (~32% faster). REIP is 3.1× more reliable than RAFT at hitting coverage thresholds in this benchmark.
      </p>
      <figure class="project-figure" style="width: 80%; max-width: 500px; margin: 24px 0;">
        <img src="/assets/img/reip/reipbarchartfinal.png" alt="Bar chart comparison" style="width: 100%; height: auto; display: block;">
        <figcaption>Performance comparison between baseline and REIP systems.</figcaption>
      </figure>
      <div class="clear-float"></div>
      <h3>Limitations and Next Steps</h3>
      <p>
      These results are currently limited to my 2-D gridworld benchmark with hand-tuned hyperparameters and a specific fault profile. I'm now porting REIP to higher-fidelity settings: first into a 3-D physics simulator (Isaac Sim / Gazebo), and in parallel onto micromouse-scale ground robots to see whether the robustness gains carry over to real hardware under sensing noise and actuation limits.
      </p>
      <figure class="project-figure" style="width: 100%; max-width: 960px; margin: 24px auto; display: block;">
        <iframe 
          src="https://docs.google.com/presentation/d/1deZ7RDOKHEwC3LnkchgeaxY-HRdvQ7BTmA_eFWyl4E8/embed?start=false&loop=false&delayms=3000" 
          frameborder="0" 
          allowfullscreen="true" 
          allow="autoplay; fullscreen"
          loading="lazy"
          style="width: 100%; height: 560px; border: 2px solid var(--edge); border-radius: 8px; background: #0b0f14;">
        </iframe>
      <figcaption>Hardware implementation slides for REIP.</figcaption>
      </figure>
      <div class="clear-float"></div>

              <h3>Micromouse CAD Design</h3>
        <div class="article-image fusion-360-embed">
          <iframe 
            src="https://a360.co/4q0nG6c" 
            allowfullscreen="true" 
            webkitallowfullscreen="true" 
            mozallowfullscreen="true" 
            frameborder="0">
          </iframe>
          <div class="image-caption">Micromouse Robot CAD Design.</div>
        </div>
        <div class="clear-float"></div>

      `,
      image: "/assets/img/reip/reipenv.png",
      files: []
    },
    {
      id: 10,
      title: "Flight Lab Educational Kits",
      date: "December 2025 - Present",
      keyPoints: "Founder & product lead · K-5 aerospace kits · Launching Aug 2026",
      description: "Founded Flight Lab: K-5 aerospace teaching kits built around project-based learning, with a custom manufacturing method for cheap, scalable production. Piloting with 100+ students ahead of the August 2026 launch.",
      badge: "Founder",
      orgLogo: "/assets/img/logos/flight-lab.png",
      highlights: [
        "Designed K-5 aerospace kits teaching concepts through project-based learning",
        "Custom manufacturing method for cheap and scalable kit production",
        "Pilot production with 100+ students before initial launch in Aug 2026"
      ],
      descriptionHtml: `
        <h3>At a glance</h3>
        <ul>
          <li><strong class="list-label">Role:</strong> Founder and product lead</li>
          <li><strong class="list-label">Product:</strong> Aerospace teaching kits that introduce K-5 students to flight and engineering concepts through project-based learning</li>
          <li><strong class="list-label">Manufacturing:</strong> Custom manufacturing method designed for cheap and scalable kit production</li>
          <li><strong class="list-label">Status:</strong> Pilot production with over 100 young students for research and refinement ahead of the initial launch in August 2026</li>
        </ul>
        <hr>
        <h3>Project Overview</h3>
        <p>
        Flight Lab grew out of years of aerospace outreach: after teaching rocketry and flight fundamentals to thousands of K-5 students, I kept seeing the same gap — there was no affordable, hands-on kit that let young students actually build and understand something that flies. Flight Lab kits are designed to fill that gap with project-based lessons that a classroom teacher can run without an aerospace background.
        </p>
        <p>
        I designed the kits, developed a custom manufacturing method to keep per-unit costs low at scale, and am currently running pilot production with more than 100 students to refine the product before launch in August 2026.
        </p>
        <hr>
        <h3>Custom Foam Needle Cutter — Interactive CAD</h3>
        <p>
        The heart of the manufacturing method: a custom CNC foam needle cutter I designed to cut kit parts cheaply and repeatably at scale.
        </p>
        <div class="article-image fusion-360-embed">
          <iframe
            src="https://students99370.autodesk360.com/shares/public/SH28cd1QT2badd0ea72b8faab487f339da5e?mode=embed"
            allowfullscreen="true"
            webkitallowfullscreen="true"
            mozallowfullscreen="true"
            frameborder="0">
          </iframe>
          <div class="image-caption">Interactive Fusion 360 model of the foam needle cutter. Click and drag to rotate, scroll to zoom.</div>
        </div>
        <div class="clear-float"></div>
      `,
      image: "/assets/img/logos/flight-lab.png",
      files: []
    },
    {
      id: 3,
      title: "MIT-BWSI Autonomous UAV Racing",
      date: "7/2025 - 8/2025",
      keyPoints: "Autonomous UAV · OpenCV line tracking · BWSI champion",
      repoUrl: "https://github.com/amzoeee/line_follower_v2",
      description: "Led sensing + electronics for the MIT BWSI UAV racing team, integrating OpenCV line tracking on a Pi 5 with PX4 autopilot to win by over a minute.",
      badge: "BWSI",
      orgLogo: "/assets/img/logos/bwsi.png",
      highlights: [
        "Custom MAVLink + OpenCV stack on Raspberry Pi 5",
        "Custom landing gear/rPi Enclosure",
        "Won first place in the final challenge (52 sec.)"
      ],
      descriptionHtml: `
        <h3>Description</h3>
        <p>This was the UAV racing course done through The Beaver Works Summer Institute (BWSI).
        In this team competition, I took the roles of piloting the drone, integrating electronics, and some OpenCV code for line following and detection.
        Our drone uses MAVLink for communication with the ground station and a Pixhawk 4 for flight control and a Holybro X500 drone body. OpenCV was used to detect line and Aruco tags
        so that the drone can avoid obstacles and follow the course. A Raspberry Pi 5 was used to run the OpenCV code.
        We placed first in the competition during the final challenge by over a minute after spending weeks optimizing the code to be more efficient and accurate.
        Several parts were made in CAD such as the Pi enclosure, landing gear, and battery holder.
        </p>
        <div style="display: flex; gap: 20px; margin: 24px 0; clear: both; flex-wrap: wrap; justify-content: space-between; align-items: stretch; width: 100%;">
          <figure class="project-figure object-cover" style="height: 400px; max-height: 400px; width: 300px; max-width: 300px; flex: 0 0 300px;">
            <img src="/assets/img/bwsi/solderingdrone.jpg" alt="Soldering">
            <figcaption>Soldering the electronics.</figcaption>
          </figure>
          <figure class="project-figure object-cover" style="height: 400px; max-height: 400px; width: auto; flex: 0 0 300px;">
            <video muted loop playsinline preload="none" data-lazy-video style="width: 100%; height: 100%; display: block; border-radius: 12px 12px 0 0; object-fit: cover;">
              <source src="/assets/video/droneflights.mp4" type="video/mp4">
            </video>
            <figcaption>Flying UAV</figcaption>
          </figure>
          <figure class="project-figure--right object-cover" style="height: 400px; max-height: 400px; width: 300px; max-width: 300px; flex: 0 0 300px;">
            <img src="/assets/img/bwsi/deconstructdrone.jpg" alt="Deconstruction">
            <figcaption>Drone parts layed out for visualization.</figcaption>
          </figure>
        </div>
        <div class="clear-float"></div>
     `,
      image: "/assets/img/bwsi/frontdrone.jpg",
      files: []
    },
    {
      id: 4,
      title: "Y-Combinator Agent Jam '25 Hackathon",
      date: "11/3/2025",
      keyPoints: "Teleoperated LeRobot · LLM safety agent · YC Agent Jam",
      repoUrl: "https://github.com/ZakHussain/dodo-cli-agent",
      description: "Built a safety-aware teleop stack for a KiwiBot/LeRobot platform at YC Agent Jam ’25, blending HuggingFace LLM cues with real-time manipulation.",
      badge: "YC",
      orgLogo: "/assets/img/logos/yc.png",
      highlights: [
        "LLM watches for hazards & triggers alerts in teleop mode",
        "Robot grips color-coded objects via custom HF training loop",
        "Wrapped in CLI agent experience pitched to YC mentors"
      ],
      descriptionHtml: `
      <figure class="project-figure project-figure--left object-cover" style="height: 400px; max-height: 400px; width: 300px; max-width: 300px;">
        <video muted loop playsinline preload="none" data-lazy-video style="width: 100%; height: 100%; display: block; border-radius: 12px 12px 0 0; object-fit: cover;">
          <source src="/assets/video/dodamoving.mp4" type="video/mp4">
        </video>
        <figcaption>Robot grabbing and moving objects.</figcaption>
      </figure>
      <h3>Description</h3>
      <p> I competed in this hackathon hosted by Y-Combinator and Metorial AI to embed an LLM into a custom LeRobot/KiwiBot robot.
      The robot can do tasks such as picking up objects placed in front of it, be teleoperated, and navigate to a location.
      The LLM allows the robot to have "feelings" and interact with the environment based on its observations; this is important
      because it shows how LLMS can be used to detect danger, and when embedded, act to prevent or set of an alert of said danger.
      When a sharp object was "seen" by the robot, it would set off an alert that there was a sharp object in the way which can help people 
      who are not able to see the object themselves. We used the HuggingFace API to train the robot to pick up specific colored objects as well.
      This was completed on a team of three comprising of a professor and a grad student who were experts in the field. We then went through the 
      startup process of pitching a business idea to a panel of investors and mentors.
      </p>
      <p>
      Since then I've stayed in the Y-Combinator orbit: I completed YC Startup School '26 and presented at the YC Startup Internship Expo '26.
      </p>
      <div class="clear-float"></div>
      <hr>
      <h3>Demo Video</h3>
      <div class="article-image youtube-embed">
        <div class="youtube-thumbnail" data-video-id="Usc1UKZaNwo">
          <img src="https://img.youtube.com/vi/Usc1UKZaNwo/maxresdefault.jpg" alt="Demo video thumbnail">
        </div>
        <div class="image-caption">Watch the full demonstration.</div>
      </div>
      <div class="clear-float"></div>
   `,
      image: "/assets/img/yc/dodada.png",
      files: []
    },
    {
      id: 5,
      title: "Co-inventor of LifeFlo",
      date: "November 2024 - Present",
      keyPoints: "US Provisional Patent Pending No. 63/873,509 · Google Play Store · Co-inventor",
      appUrl: "https://play.google.com/store/apps/details?id=com.mycompany.womenshealth",
      description: "Co-invented LifeFlo, a monitored GPT + FlutterFlow women's health app that's live on Google Play and covered by US provisional patent 63/873,509.",
      badge: "Patent",
      orgLogo: "/assets/img/logos/lifeflo.png",
      highlights: [
        "GPT-based menstrual insights with human-in-the-loop review",
        "Firebase backend w/ logging + push-ready symptom tracking",
        "Play Store release with full UX + content system"
      ],
      descriptionHtml: `
        <h3>Description</h3>
        <p>
        LifeFlo is a women's health app made in FlutterFlow/Firebase. It allows users to learn about their menstrual cycle, track their symptoms, and receive personalized recommendations for their health using a monitored GPT wrapper. 
        The app was co-invented with Veda Hiremath and Gabe Balzer and is currently pending a provisional patent No. 63/873,509. The app is available on the Google Play Store and can be downloaded for free.
        </p>
        <div style="display: flex; gap: 20px; margin: 24px 0; clear: both; flex-wrap: wrap; justify-content: space-between; align-items: stretch; width: 100%;">
          <figure class="project-figure object-cover" style="height: 400px; max-height: 400px; width: 300px; max-width: 300px; flex: 0 0 300px;">
            <img src="/assets/img/lifeflo/cycle.jpg" alt="Soldering">
            <figcaption>GPT Based Menstrual Cycle Assesment Feature.</figcaption>
          </figure>
          <figure class="project-figure object-cover" style="height: 400px; max-height: 400px; width: 300px; max-width: 300px; flex: 0 0 300px;">
            <img src="/assets/img/lifeflo/ffff.jpg" alt="Soldering">
            <figcaption>Daily logging function for Menstrual Health Tracker.</figcaption>
          </figure>
          <figure class="project-figure object-cover" style="height: 400px; max-height: 400px; width: 300px; max-width: 300px; flex: 0 0 300px;">
            <img src="/assets/img/lifeflo/calendar.jpg" alt="Soldering">
            <figcaption>Personal notes can also be left for logging purposes.</figcaption>
          </figure>
          <figure class="project-figure--right object-cover" style="height: 400px; max-height: 400px; width: 300px; max-width: 300px; flex: 0 0 300px;">
            <img src="/assets/img/lifeflo/menu.jpg" alt="Deconstruction">
            <figcaption>Sidebar menu for navigation.</figcaption>
          </figure>
        </div>
        <div class="clear-float"></div>
     `,
      image: "/assets/img/lifeflo/lifeflopic.png",
      files: []
    },
    {
      id: 6,
      title: "LOX-Propane Rocket Engine",
      date: "December 2023 - January 2025",
      keyPoints: "LOX-Propane Rocket Engine · Finite Element Analysis · ANSYS Fluent",
      description: "Led design/build/test of a regen-cooled LOX/propane engine made from scrap materials, then diagnosed failures with ANSYS CFD and iterated the cooling loop.",
      badge: "Rocket",
      highlights: [
        "Regen cooling sized in ANSYS Fluent",
        "Hot-fired multiple builds with instrumented pressure data",
        "Documented failure analysis + redesign in LaTeX report"
      ],
      descriptionHtml: `
      <h3>At a glance</h3>
      <ul>
        <li><strong class="list-label">Team:</strong> 4 high-school students (project lead: Ryker Kollmyer)</li>
        <li><strong class="list-label">My role:</strong> Concept + system architecture, CAD, regen cooling design, CFD, test planning, failure analysis</li>
        <li><strong class="list-label">Key tools:</strong> Fusion 360, ANSYS Fluent, Python, Arduino, pressure/flow instrumentation</li>
        <li><strong class="list-label">Status:</strong> Engine designed, built, and hot-fire tested; diagnosed failure, redesigned cooling loop, and documented in a LaTeX report</li>
      </ul>
      <hr>
      <h3>Project Overview</h3>
      <p>
      This project aimed to design and hot-fire a small LOX-propane rocket engine using a constrained set of materials (truck muffler shell + scrap tubing). I led the design of the combustion chamber and regenerative cooling channels, ran CFD in ANSYS Fluent to size the flow paths, and coordinated fabrication and test. Early hot-fires reached ~43 s of stable burn, but later tests failed when thermal expansion in the cooling channels over-injected fuel into the chamber. Using simulation and mentor feedback, I diagnosed the failure, iterated the design, and wrote an informal research-style report in LaTeX documenting the process and lessons learned.      </p>
      </p>
      <div style="display: flex; gap: 20px; margin: 24px 0; clear: both; flex-wrap: wrap; justify-content: space-between; align-items: stretch; width: 100%;">
      <figure class="project-figure project-figure object-cover" style="height: 400px; max-height: 400px; width: 300px; max-width: 300px;">
        <video muted loop playsinline preload="none" data-lazy-video style="width: 100%; height: 100%; display: block; border-radius: 12px 12px 0 0; object-fit: cover;">
          <source src="/assets/img/rocket/rockettest1.mp4" type="video/mp4">
        </video>
        <figcaption>First successful combustion test.</figcaption>
      </figure>
      <figure class="project-figure project-figure object-cover" style="height: 400px; max-height: 400px; width: 300px; max-width: 300px;">
        <video muted loop playsinline preload="none" data-lazy-video style="width: 100%; height: 100%; display: block; border-radius: 12px 12px 0 0; object-fit: cover;">
          <source src="/assets/img/rocket/mk2test.mp4" type="video/mp4">
        </video>
        <figcaption>Second successful combustion test with better optimized combustion chamber.</figcaption>
      </figure>
        <figure class="project-figure object-cover" style="height: 400px; max-height: 400px; width: 300px; max-width: 300px; flex: 0 0 300px;">
          <img src="/assets/img/rocket/buildingrocket.jpg" alt="Soldering">
          <figcaption>Building version two of the rocket engine.</figcaption>
        </figure>
        <figure class="project-figure object-cover" style="height: 400px; max-height: 400px; width: 300px; max-width: 300px; flex: 0 0 300px;">
          <img src="/assets/img/rocket/mk3picture.jpg" alt="Soldering">
          <figcaption>Firing up the third version of the rocket engine.</figcaption>
        </figure>
      </div>
      <hr>
      <h3>Failure Analysis</h3>
      <p>
      After early hot-fire tests (~43 s average runtime) the engine began to fail prematurely, with unstable combustion and flooding. We logged chamber pressure, mass flow rate, and injector temperatures, then built a simplified thermal-expansion model of the regen channels.
      <p>
      Comparing CFD results and test data, we found that as the engine heated up, the thin cooling tubes expanded more than the chamber wall, increasing their flow area and over-injecting fuel into the chamber. That mixture shift explained both the pressure traces and the visible flame behavior.
      </p>
      <p>
      Using this result, I resized the channels and adjusted the flow split in simulation to maintain stable mixture ratio over the expected temperature range. We documented the failure, analysis, and redesign process in an informal LaTeX report as practice for future research write-ups.
      </p>
      <hr>
      <figure class="project-figure project-figure--right object-cover" style="height: 400px; max-height: 400px; width: 300px; max-width: 300px;">
        <video muted loop playsinline preload="none" data-lazy-video style="width: 100%; height: 100%; display: block; border-radius: 12px 12px 0 0; object-fit: cover;">
          <source src="/assets/img/rocket/rde-density.mp4" type="video/mp4">
        </video>
        <figcaption>Density field for the same RDE concept, highlighting reactant injection, mixing, and high-density regions along the cooled walls (simulation only).</figcaption>
      </figure>
      <figure class="project-figure project-figure--left object-cover" style="height: 400px; max-height: 400px; width: 300px; max-width: 300px;">
        <video muted loop playsinline preload="none" data-lazy-video style="width: 100%; height: 100%; display: block; border-radius: 12px 12px 0 0; object-fit: cover;">
          <source src="/assets/img/rocket/rde-velocity.mp4" type="video/mp4">
        </video>
        <figcaption>Velocity field in a conceptual LOX-propane rotating-detonation combustor, showing high-speed detonation fronts and recirculation zones in the chamber and cooling channels (simulation only).</figcaption>
      </figure>
      <h3>RDE Concept Analysis - Simulation Only</h3>
      <p> 
      As a follow-on to the LOX-propane engine, I designed a conceptual rotating-detonation combustor (RDE) in Fusion 360 and ran ANSYS Fluent CFD to study flow, density, and wall heat transfer. Using the same performance targets and cooling-channel layout as our baseline engine, I explored how an RDE variant would behave and compared its fields to the conventional design. This work stayed entirely in simulation for safety-no hardware was built. 
      </p>
      <div class="clear-float"></div>
   `,
      image: "/assets/img/rocket/rocketicon.png",
      files: []
    },
    {
      id: 7,
      title: "Weather Brick for Windsurfers & Sailors",
      date: "January 2025 - Present",
      keyPoints: "ESP32 interface · Waterproof product · Selling units",
      description: "Designing and selling \"Weather Bricks\": waterproof, low-power ESP32 weather devices for sailors and windsurfers that pull marine weather APIs + local radio data into a rugged TFT interface — $35 profit per unit.",
      badge: "Product",
      highlights: [
        "ESP32 firmware w/ Wi-Fi + radio ingest",
        "Waterproof chassis designed and fabricated in Fusion 360",
        "Selling at $50 with a $15 BOM ($35 profit per unit)"
      ],
      descriptionHtml: `
        <h3>Description</h3>
        <p>The "Weather Brick" uses an ESP WROOM-32 microcontroller and a TFT display to create a simple, rugged interface for local windsurfers and sailors.
        It is programmed in Arduino and uses API keys and home Wi-Fi for a constant connection; it can also receive continuous radio data from the local weather station for live updates.
        I designed and fabricated the waterproof chassis and mapped the circuits in Autodesk Fusion before soldering each device together.
        Units sell for $50 and cost only $15 to produce — $35 profit per unit — and are currently selling to sailors and windsurfers at local clubs.
        </p>
        <figure class="project-figure project-figure--left object-cover" style="height: 400px; max-height: 400px; width: 300px; max-width: 300px;">
          <img src="/assets/img/windsurfing/windsurfing.png" alt="Interface">
          <figcaption>Interface with marine units.</figcaption>
        </figure>
        <figure class="project-figure project-figure--left object-cover" style="height: 400px; max-height: 400px; width: 300px; max-width: 300px;">
          <img src="/assets/img/windsurfing/wires.jpg" alt="Custom Battery">
          <figcaption>Custom wiring for the microcontroller.</figcaption>
        </figure>
      `,
      image: "/assets/img/windsurfing/windsurfing.png",
      files: []
    },
    {
      id: 8,
      title: "Fiji Education Fund & Solar-Powered E-Writer",
      date: "August 2023 - Present",
      keyPoints: "Chairman & founder · $4,000+ raised · Sustainable design",
      description: "Chairman and founder of the Fiji Education Fund: raised $4,000+ for low-cost e-writers, supplies, laptops, and Starlink Wi-Fi for students at Yalobi School in Nalauwaki, Fiji — including a sub-$3 solar-powered e-writer I designed and prototyped.",
      badge: "Founder",
      highlights: [
        "Chairman & founder; raised $4,000+ for school supplies, laptops, and Starlink Wi-Fi",
        "Solar-powered circuit design eliminates need for expensive coin cell batteries",
        "Under $3 total cost (PLA filament + electronics); piloting with students before deployment"
      ],
      descriptionHtml: `
        <h3>At a glance</h3>
        <ul>
          <li><strong class="list-label">Context:</strong> It is difficult for children in the Yalobi school, Fiji to constantly buy paper from the mainland due to expensive boat gas.</li>
          <li><strong class="list-label">Problem:</strong> The Yalobi school lacks government support; battery-powered devices are unsustainable due to expensive, hard-to-source coin cells</li>
          <li><strong class="list-label">Solution:</strong> Prototyped a solar-powered e-writer that combines a Boogie Board writing device with a small solar-powered circuit</li>
          <li><strong class="list-label">My role:</strong> Chairman and founder of the Fiji Education Fund: CAD design, local business outreach, electronics prototyping, fundraising, and community testing.</li>
          <li><strong class="list-label">Tools:</strong> Fusion 360, 3D printing, circuit design</li>
          <li><strong class="list-label">Fundraising:</strong> Raised $4,000+ to develop low-cost e-writers and provide school supplies, laptops, and Starlink Wi-Fi for the Yalobi school.</li>
          <li><strong class="list-label">Outcome:</strong> Functional prototype under $3 total cost; currently testing with middle school students before sending units to Fiji.</li>
        </ul>
        
        <hr>
        
        <h3>Project Overview</h3>
        <figure class="project-figure project-figure--left object-cover" style="height: 400px; max-height: 400px; width: 300px; max-width: 300px;">
          <img src="/assets/img/fiji/kidfiji.jpg" alt="Yalobi school in Fiji">
          <figcaption>Yalobi school in Nalauwaki, Fiji. (Photo Credit: Ryker Kollmyer)</figcaption>
        </figure>
        <p> I learned that the teacher of the Yalobi school has to pay over $200 per trip to the mainland to buy school supplies for her students.
        This is very unsustainable because everything has to be paid out of pocket due to the lack of government support.
        I initially started by raising funds for basic supplies and new cubbies for the students to store their supplies.
        Then, I considered a more permanent solution for the students. 
        Instead of buying new supplies, the students could use an e-writer that doesnt need paper or even a pencil to work, it just needs a small coin cell battery.
        However, I realized that coin cell batteries are very hard to source on the island of Nalauwaki so I decided to prototype a solar-powered solution that would be sustainable in the sunny climate.
        </p>

        <div class="clear-float"></div>
        
        <figure class="project-figure project-figure--right object-cover" style="height: 400px; max-height: 400px; width: 500px; max-width: 500px;">
          <img src="/assets/img/fiji/boogieboardjpg.jpg" alt="Solar-powered e-writer prototype">
          <figcaption>Original Boogie Board e-writer.(Photo Credit: Ryker Kollmyer)</figcaption>
        </figure>
        
        <h3>Engineering the Solution</h3>
        <p>My design combines the writing device with a small solar-powered circuit. The total cost is under $3: less than a dollar in PLA filament for the housing, and less than $2 for the electronics. The device doesn't require a special stylus—students can write with their finger if the pen is lost, making it ideal for resource-constrained environments.</p>
        
        <p>I'm currently iterating on a more robust design and ensuring long-term functionality by giving demos to students in my old middle school before sending units abroad. The goal is to engineer a sustainable tool that fits their environment, rather than one that seems promising but proves unsustainable.</p>
        
        <div class="clear-float"></div>
        
        <hr>
        
        <h3>CAD Design</h3>
        <div class="article-image fusion-360-embed">
          <iframe 
            src="https://a360.co/3MwGFYp" 
            allowfullscreen="true" 
            webkitallowfullscreen="true" 
            mozallowfullscreen="true" 
            frameborder="0">
          </iframe>
          <div class="image-caption">Interactive Fusion 360 model of the solar-powered e-writer housing. Click and drag to rotate, scroll to zoom.</div>
        </div>
        <div class="clear-float"></div>
        
        <hr>
        
      `,
      image: "/assets/img/fiji/kidfiji.jpg",
      files: []
    },
    {
      id: 9,
      title: "Olympia Aerospace Club & American Rocketry Challenge",
      date: "September 2024 - Present",
      keyPoints: "VP & outreach lead · 18th nationally of 1,000+ teams · 3,000+ students reached",
      appUrl: "https://www.ohsaerospace.org/home",
      appLabel: "Club Website",
      description: "Vice president and outreach lead of a 16-team TARC program ranked 18th nationally out of 1,000+ teams — 130+ launches, 3,000+ K-5 students reached at 9 schools, and $10,000+ raised for the team and outreach.",
      badge: "Aerospace",
      orgLogo: "/assets/img/logos/arc.png",
      highlights: [
        "18th national rank (2025) out of 1,000+ TARC teams; 16 teams, 130+ launches",
        "Led outreach to 3,000+ K-5 students at 9 schools; raised $10,000+",
        "Sole recipient of the AIAA PNW Young Professional of the Year award (2026)"
      ],
      descriptionHtml: `
        <h3>At a glance</h3>
        <ul>
          <li><strong class="list-label">Role:</strong> Vice President and Leader of Outreach, <a href="https://www.ohsaerospace.org/home" target="_blank" rel="noopener" data-cursor-target>Olympia Aerospace Club</a></li>
          <li><strong class="list-label">Scale:</strong> 16 TARC teams, 130+ total launches, 2,000+ students reached through the club; ranked 18th nationally out of 1,000+ teams in 2025</li>
          <li><strong class="list-label">Outreach:</strong> Led aerospace outreach events to 3,000+ K-5 students at 9 schools; founded and instructed Aerospace Summer Camps at Hands On Children's Museum</li>
          <li><strong class="list-label">Fundraising:</strong> Raised over $10,000 for the rocketry team and outreach events</li>
          <li><strong class="list-label">Recognition:</strong> Sole recipient of the AIAA PNW Young Professional of the Year award (2026), recognizing highly technical and outstanding community-building professionals under the age of 35</li>
          <li><strong class="list-label">Competition:</strong> Engineered dual-deploy ARC vehicles with redundant altimeters, telemetry-driven iteration, and OpenRocket/ANSYS-optimized frames and fin cans</li>
        </ul>

        <hr>

        <h3>Flight & test clips</h3>
        <div class="project-media-grid">
          <figure class="project-figure">
            <video muted loop playsinline preload="none" data-lazy-video style="width: 100%; height: auto; display: block; border-radius: 6px;">
              <source src="/assets/img/rocket/rockettest2.mp4" type="video/mp4">
            </video>
            <figcaption>Flight test clip</figcaption>
          </figure>
          <figure class="project-figure">
            <video muted loop playsinline preload="none" data-lazy-video style="width: 100%; height: auto; display: block; border-radius: 6px;">
              <source src="/assets/img/rocket/rde-density.mp4" type="video/mp4">
            </video>
            <figcaption>Static fire / flow visualization</figcaption>
          </figure>
        </div>

        <hr>

        <h3>Gallery</h3>
        <div class="project-media-grid">
          <figure class="project-figure">
            <img src="/assets/img/rocket/rocketmk3.png" alt="ARC airframe build">
            <figcaption>Airframe build</figcaption>
          </figure>
          <figure class="project-figure">
            <img src="/assets/img/rocket/mk4picture.jpg" alt="Stack assembly">
            <figcaption>Stack assembly</figcaption>
          </figure>
          <figure class="project-figure">
            <img src="/assets/img/rocket/buildingrocket.jpg" alt="Static fire prep">
            <figcaption>Static fire prep</figcaption>
          </figure>
          <figure class="project-figure">
            <img src="/assets/img/rocket/rocketbackfire.png" alt="Exhaust during test">
            <figcaption>Exhaust during testing</figcaption>
          </figure>
        </div>

        <hr>

        <h3>Notes</h3>
        <ul>
          <li>Dual-deploy charge testing and checklists in progress</li>
          <li>Telemetry review after each flight to tune sims and recovery</li>
          <li>OpenRocket sims kept in sync with hardware mass changes</li>
        </ul>
      `,
      image: "/assets/img/rocket/rocketmk3.png",
      files: []
    },
  ];

  const portfolioGrid = document.getElementById('portfolioGrid');
  const projectModal = document.getElementById('projectModal');
  const modalClose = document.getElementById('modalClose');
  const modalThumbnailImg = document.getElementById('modalThumbnailImg');
  const modalThumbnail = document.getElementById('modalThumbnail');
  const modalTitle = document.getElementById('modalTitle');
  const modalRepoLink = document.getElementById('modalRepoLink');
  const modalAppLink = document.getElementById('modalAppLink');
  const modalMeta = document.getElementById('modalMeta');
  const modalKeyPoints = document.getElementById('modalKeyPoints');
  const modalDate = document.getElementById('modalDate');
  const modalDescription = document.getElementById('modalDescription');
  const modalFiles = document.getElementById('modalFiles');
  const filesGrid = document.getElementById('filesGrid');
  const modalBody = document.querySelector('.modal-body');

  // Initialize portfolio grid: two columns, org chips on the outer edges
  function initPortfolio() {
    if (!portfolioGrid) return;

    portfolioGrid.innerHTML = '';

    const colLeft = document.createElement('div');
    colLeft.className = 'project-col project-col--left';
    const colRight = document.createElement('div');
    colRight.className = 'project-col project-col--right';

    portfolioData.forEach((project, index) => {
      const row = document.createElement('div');
      row.className = 'project-row';

      if (project.badge || project.orgLogo) {
        const org = document.createElement('span');
        org.className = 'project-row__org';
        if (project.orgLogo) {
          org.classList.add('project-row__org--logo');
          const img = document.createElement('img');
          img.src = project.orgLogo;
          img.alt = '';
          img.loading = 'lazy';
          org.appendChild(img);
        } else {
          org.textContent = project.badge;
        }
        org.setAttribute('aria-hidden', 'true');
        row.appendChild(org);
      }

      const card = createProjectCard(project);
      card.setAttribute('data-cursor-target', 'true');

      const cardWrap = document.createElement('div');
      cardWrap.className = 'project-row__card';
      cardWrap.appendChild(card);
      row.appendChild(cardWrap);

      (index % 2 === 0 ? colLeft : colRight).appendChild(row);
    });

    portfolioGrid.appendChild(colLeft);
    portfolioGrid.appendChild(colRight);
  }

  function activateModalMedia() {
    if (!modalDescription) return;
    const videos = modalDescription.querySelectorAll('video[data-lazy-video]');
    if (!videos.length) return;

    videos.forEach(video => {
      if (video.dataset.videoActivated === 'true') return;
      video.dataset.videoActivated = 'true';
      video.removeAttribute('preload');
      video.preload = 'auto';
      video.setAttribute('autoplay', 'autoplay');
      video.muted = true;
      const ensurePlay = () => {
        const playPromise = video.play();
        if (playPromise?.catch) {
          playPromise.catch(() => {
            video.addEventListener(
              'pointerdown',
              () => video.play().catch(() => {}),
              { once: true }
            );
          });
        }
      };
      video.addEventListener('loadeddata', ensurePlay, { once: true });
      video.load();
      // Fall back in case loadeddata already fired
      ensurePlay();
    });
  }

  function initThemeToggle() {
    const toggle = document.getElementById('navThemeToggle');
    if (!toggle) return;

    const storageKey = 'ryker-preferred-theme';
    const mediaQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

    const readStoredTheme = () => {
      try {
        return localStorage.getItem(storageKey);
      } catch (_) {
        return null;
      }
    };

    const writeStoredTheme = (theme) => {
      try {
        localStorage.setItem(storageKey, theme);
      } catch (_) {}
    };

    const applyTheme = (theme, persist = false) => {
      const sanitizedTheme = theme === 'light' ? 'light' : 'dark';
      document.body.dataset.theme = sanitizedTheme;
      toggle.setAttribute('aria-pressed', sanitizedTheme === 'dark' ? 'true' : 'false');
      if (persist) {
        writeStoredTheme(sanitizedTheme);
      }
    };

    const storedTheme = readStoredTheme();
    if (storedTheme) {
      applyTheme(storedTheme);
    } else if (mediaQuery) {
      applyTheme(mediaQuery.matches ? 'dark' : 'light');
    } else {
      applyTheme('dark');
    }

    toggle.addEventListener('click', () => {
      const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme, true);
    });

    if (mediaQuery?.addEventListener) {
      mediaQuery.addEventListener('change', event => {
        const stored = readStoredTheme();
        if (!stored) {
          applyTheme(event.matches ? 'dark' : 'light');
        }
      });
    }
  }

  function createProjectCard(project) {
    const article = document.createElement('article');
    article.className = 'project-card';
    article.setAttribute('data-project-id', project.id);

    // Cursor-following border glow (masked ring, lights up near the pointer)
    const glow = document.createElement('div');
    glow.className = 'project-card__glow';
    article.appendChild(glow);

    // Soft center sheen on hover
    const sheen = document.createElement('div');
    sheen.className = 'project-card__sheen';
    article.appendChild(sheen);

    const inner = document.createElement('div');
    inner.className = 'project-card__inner';

    // Media sits in a sharp-edged inset with corner-fading frame lines + ticks
    const media = document.createElement('div');
    media.className = 'project-card__media';

    const mediaBox = document.createElement('div');
    mediaBox.className = 'project-card__mediaBox';

    const thumbnail = document.createElement('img');
    thumbnail.src = project.image || '/assets/img/logo.png';
    thumbnail.alt = `${project.title} preview`;
    thumbnail.loading = 'lazy';
    thumbnail.onerror = function() {
      this.src = '/assets/img/logo.png';
    };
    mediaBox.appendChild(thumbnail);
    media.appendChild(mediaBox);

    // 8 edge halves + 8 outward corner ticks
    const frame = document.createElement('div');
    frame.className = 'project-card__frame';
    for (let i = 0; i < 16; i++) {
      frame.appendChild(document.createElement('span'));
    }
    media.appendChild(frame);

    const body = document.createElement('div');
    body.className = 'project-card__body';

    const title = document.createElement('h3');
    title.className = 'project-card__title';
    title.textContent = project.title;
    body.appendChild(title);

    if (project.date) {
      const meta = document.createElement('p');
      meta.className = 'project-card__meta';
      meta.textContent = project.date;
      body.appendChild(meta);
    }

    if (project.description) {
      const summary = document.createElement('p');
      summary.className = 'project-card__summary';
      summary.textContent = project.description;
      body.appendChild(summary);
    }

    const chips = document.createElement('ul');
    chips.className = 'project-card__list';
    (project.keyPoints || '').split('·').map(s => s.trim()).filter(Boolean).slice(0, 3).forEach(text => {
      const li = document.createElement('li');
      li.textContent = text.toLowerCase();
      chips.appendChild(li);
    });
    if (chips.children.length) {
      body.appendChild(chips);
    }

    inner.appendChild(media);
    inner.appendChild(body);
    article.appendChild(inner);

    attachCardPointerFX(article, glow);

    article.addEventListener('click', (evt) => {
      if (evt.target.closest('a, button')) return;
      evt.preventDefault();
      openModal(project);
    });

    return article;
  }

  // "Reactive but static" hover: card drifts a few px toward the cursor,
  // and the border glow tracks the pointer position.
  const prefersReducedMotion = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function attachCardPointerFX(card, glow) {
    if (prefersReducedMotion) return;

    let raf = null;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let hovering = false;

    const tick = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      card.style.transform = `translate(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px)`;
      if (hovering || Math.abs(currentX) > 0.05 || Math.abs(currentY) > 0.05) {
        raf = requestAnimationFrame(tick);
      } else {
        card.style.transform = '';
        raf = null;
      }
    };

    const start = () => {
      // The scroll-reveal transition eases `transform`; take over with an
      // instant inline transition so pointer tracking isn't laggy.
      card.style.transition = 'opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.3s ease, box-shadow 0.3s ease';
      if (raf === null) raf = requestAnimationFrame(tick);
    };

    card.addEventListener('pointermove', (evt) => {
      const rect = card.getBoundingClientRect();
      const px = (evt.clientX - rect.left) / rect.width;
      const py = (evt.clientY - rect.top) / rect.height;
      targetX = (px - 0.5) * 8;
      targetY = (py - 0.5) * 8;
      hovering = true;
      glow.style.setProperty('--glow-x', `${(px * 100).toFixed(2)}%`);
      glow.style.setProperty('--glow-y', `${(py * 100).toFixed(2)}%`);
      start();
    });

    card.addEventListener('pointerleave', () => {
      hovering = false;
      targetX = 0;
      targetY = 0;
      start();
    });
  }

  function openModal(project) {
    if (!projectModal || !modalTitle || !modalDescription || !filesGrid) return;

    const placeholderSrc = modalThumbnailImg?.dataset?.placeholder || modalThumbnailImg?.getAttribute('src') || '';
    const thumbnailSrc = project.image || '';
    if (modalThumbnailImg && modalThumbnail) {
      if (thumbnailSrc) {
        modalThumbnailImg.src = thumbnailSrc;
        modalThumbnailImg.alt = project.title;
        modalThumbnailImg.style.display = 'block';
        modalThumbnail.classList.add('has-image');
      } else if (placeholderSrc) {
        modalThumbnailImg.src = placeholderSrc;
        modalThumbnailImg.style.display = 'block';
        modalThumbnail.classList.remove('has-image');
      } else {
        modalThumbnailImg.removeAttribute('src');
        modalThumbnailImg.style.display = 'none';
        modalThumbnail.classList.remove('has-image');
      }
    }

    modalTitle.textContent = project.title;

    const hasKeyPoints = project.keyPoints && project.keyPoints.trim() !== '';
    const hasDate = project.date && project.date.trim() !== '';
    const hasRepo = project.repoUrl && project.repoUrl.trim() !== '';
    const hasApp = project.appUrl && project.appUrl.trim() !== '';

    if (modalKeyPoints) {
      modalKeyPoints.textContent = hasKeyPoints ? project.keyPoints : '';
      modalKeyPoints.style.display = hasKeyPoints ? 'block' : 'none';
    }
    if (modalDate) {
      modalDate.textContent = hasDate ? project.date : '';
      modalDate.style.display = hasDate ? 'block' : 'none';
    }
    if (modalRepoLink) {
      modalRepoLink.style.display = hasRepo ? 'inline-flex' : 'none';
      if (hasRepo) modalRepoLink.href = project.repoUrl;
    }
    if (modalAppLink) {
      modalAppLink.style.display = hasApp ? 'inline-flex' : 'none';
      if (hasApp) {
        modalAppLink.href = project.appUrl;
        modalAppLink.textContent = project.appLabel || 'Open App';
      }
    }
    if (modalMeta) {
      modalMeta.style.display = (hasKeyPoints || hasDate) ? 'flex' : 'none';
    }

    modalDescription.innerHTML = project.descriptionHtml || `<p>${project.description || 'Detailed write-up coming soon.'}</p>`;
    modalDescription.querySelectorAll('img').forEach(img => {
      if (!img.hasAttribute('loading')) img.loading = 'lazy';
    });
    activateModalMedia();

    if (modalFiles) {
      filesGrid.innerHTML = '';
      const hasFiles = project.files && project.files.length;
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
            img.loading = 'lazy';
            img.onerror = function() {
              this.parentElement.innerHTML = `<div class="file-placeholder">${file.name || 'Image not found'}</div>`;
            };
            fileItem.appendChild(img);
          } else {
            fileItem.innerHTML = `<div class="file-placeholder">${file.name || 'File'}</div>`;
          }
          fileItem.addEventListener('click', () => {
            if (file.type === 'image' && file.url) {
              window.open(file.url, '_blank');
            }
          });
          filesGrid.appendChild(fileItem);
        });
      } else {
        modalFiles.style.display = 'none';
        modalFiles.setAttribute('hidden', 'true');
      }
    }

    projectModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!projectModal) return;
    projectModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (projectModal) {
    projectModal.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && projectModal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  // Initialize YouTube click-to-play embeds
  function initYouTubeEmbeds() {
    document.addEventListener('click', (e) => {
      const thumbnail = e.target.closest('.youtube-thumbnail');
      if (!thumbnail) return;
      
      const container = thumbnail.closest('.youtube-embed');
      if (!container) return;
      
      const videoId = thumbnail.dataset.videoId;
      if (!videoId) return;
      
      // Create iframe with autoplay
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.frameBorder = '0';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.minHeight = '500px';
      iframe.style.display = 'block';
      iframe.style.borderRadius = '4px';
      iframe.style.border = '2px solid var(--edge)';
      iframe.style.background = '#161b22';
      iframe.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
      
      // Replace thumbnail with iframe
      thumbnail.replaceWith(iframe);
    });
  }

  // Lightweight view counter using countapi.xyz
  function initViewCounter() {
    const valueEl = document.getElementById('siteViewCounterValue');
    const container = document.getElementById('siteViewCounter');
    if (!valueEl || !container) return;

    const namespace = 'ryker-portfolio';
    const key = 'site-views';
    const providers = ['https://api.countapi.xyz', 'https://api.countapi.dev'];
    const hitUrls = providers.map((base) => `${base}/hit/${namespace}/${key}`);
    const getUrls = providers.map((base) => `${base}/get/${namespace}/${key}`);
    const storageKey = 'ryker-view-hit-ts';
    const sessionKey = 'ryker-view-hit-session';

    const now = Date.now();
    let shouldHit = true;
    try {
      if (sessionStorage.getItem(sessionKey) === '1') {
        shouldHit = false;
      }
      const lastHit = Number(localStorage.getItem(storageKey));
      // Only increment once per 12 hours per browser to avoid noisy counts
      shouldHit = shouldHit && (Number.isNaN(lastHit) || now - lastHit > 12 * 60 * 60 * 1000);
    } catch (e) {
      // Ignore storage issues and default to hitting
    }

    valueEl.textContent = '...';

    const updateValue = (data) => {
      if (typeof data?.value === 'number') {
        valueEl.textContent = data.value.toLocaleString();
        try {
          localStorage.setItem(storageKey, String(now));
        } catch (e) {}
        return true;
      }
      return false;
    };

    const fetchCount = (url) =>
      fetch(url, { mode: 'cors' })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (!updateValue(data)) throw new Error('Unexpected payload');
        });

    const tryProviders = async () => {
      // Pick the first provider; if it fails, try the next; fall back to GET if HIT blocked.
      const urls = shouldHit ? hitUrls : getUrls;
      for (let i = 0; i < urls.length; i += 1) {
        try {
          await fetchCount(urls[i]);
          try {
            sessionStorage.setItem(sessionKey, '1');
          } catch (e) {}
          return;
        } catch (_) {
          // try next
        }
      }
      // If all HIT attempts fail, try GET across providers
      for (let i = 0; i < getUrls.length; i += 1) {
        try {
          await fetchCount(getUrls[i]);
          try {
            sessionStorage.setItem(sessionKey, '1');
          } catch (e) {}
          return;
        } catch (_) {
          // try next
        }
      }
      throw new Error('All providers failed');
    };

    tryProviders().catch(() => {
      valueEl.textContent = '—';
      container.title = 'View counter unavailable right now.';
    });
  }

  // Silent geo ping to Cloudflare Worker (once per session)
  function initGeoPing() {
    const endpoint = 'https://view-geo-worker.therykerviewgeo.workers.dev/';
    if (!endpoint) return;
    if (sessionStorage.getItem('geoPingSent')) return;
    sessionStorage.setItem('geoPingSent', '1');
    fetch(endpoint, { mode: 'cors' }).catch(() => {});
  }

  function bootstrap() {
    initPortfolio();
    initThemeToggle();
    initYouTubeEmbeds();
    initGeoPing();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
