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
      date: "8/2025 - 10/2025", // Optional: Add date here (e.g., "Summer 2025", "Jan 2024 - Mar 2024", "2024")
      keyPoints: "Hybrid drone/rover · ROS2 + PX4 · URTC poster",
      repoUrl: "https://github.com/Ryker32/Hybrid-UAV-UGV", // Example repository
      description: "Built a detachable rover + quadcopter system that ferries a ground robot over hostile terrain, re-docks in flight, and ships data back over ROS2 + PX4.",
      badge: "URTC Poster",
      highlights: [
        "Custom dock + battery rails keep the UGV stable in flight",
        "Flight controller + rover share ROS2/PX4 telemetry for hand-offs",
        "Demoed live at MIT URTC & Beaver Works Summer Institute"
      ],
      descriptionHtml: `
      <H3>At a glance</H3>
      <ul>
        <li><strong class="list-label">Team:</strong> 5 high-school students (Research project organized by Ryker Kollmyer)</li>
        <li><strong class="list-label">Mentors:</strong> Two Cambridge-area researchers from the BWSI network</li>
        <li><strong class="list-label">Goal:</strong> Design a hybrid UAV-UGV system where a quadcopter ferries a small rover over terrain it can't traverse (tall grass, stairs, rubble), then re-docks and extracts it</li>
        <li><strong class="list-label">My role:</strong> Research project organizer, hardware, data analysis, CAD, materials sourcing, and documentation</li>
        <li><strong class="list-label">Stack:</strong> Fusion 360, ROS2, PX4, Python, 3D printing.</li>
        <li><strong class="list-label">Outcome:</strong> Working prototype demonstrated at Beaver Works Summer Institute (BWSI) in the Zesiger Center MIT; presented as a peer-reviewed poster at the IEEE MIT Undergraduate Research and Technology Conference (URTC).</li>
        </ul>
        <hr>
        <h3>Project Overview</h3>
        <p>We extended the BWSI UAV course by proposing an external research project: a “drone on wheels” that combines a quadcopter (UAV) with a ground vehicle (UGV). The UAV carries the UGV over terrain the rover can't handle, releases it to drive a precision course, then re-attaches and extracts it (using Aruco tags).</p>
        <p>I co-designed a modular attachment system where the landing gear doubles as rails for the UGV, plus a new battery mount that keeps the vehicle mechanically stable in flight while still allowing quick separation and re-docking.</p>
        <p>We tested the hybrid platform in the <strong class="list-label">MIT AeroAstro lab</strong> and on foam, concrete, grass, mulch, sand, and dirt, measuring linear and angular velocity to quantify when a UAV “ride” is necessary for small UGVs. Control and telemetry were handled with <strong class="list-label">ROS2</strong> + <strong class="list-label">PX4</strong>.</p>
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
            <div style="flex: 1 1 55%;">
              <iframe 
                src="/assets/img/bwsicars/poster.pdf" 
                type="application/pdf"
                style="width: 100%; height: 600px; min-height: 600px; border: 2px solid var(--edge); border-radius: 8px; background: #161b22;"
                frameborder="0">
              </iframe>
            </div>
          </div>
        <div class="clear-float"></div>
        <hr>
        <h3 class="clear-both">Context</h3>
        <p>This was completed externally from BWSI under guidance of two researchers from the Cambridge area. I presented it along with a teammate at the IEEE-MIT Undergraduate Research and Technology Conference as a poster presentation. 
        This was done during the summer of 2025 with four other team mates. I contributed by CADing the wheels, sourcing materials, and coming up with an overall team plan for the project including documentation in a notebook and creating a roadmap.
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
      title: "Resilient Election and Impeachment Policy (REIP) Research",
      date: "May 2025 - Present",
      keyPoints: "Multi Agent Systems · Governance Policy · Research",
      description: "Designed a governance layer that lets drone teams impeach hallucinating leaders and elect new ones mid-mission while staying within 0.7% of baseline coverage.",
      badge: "REIP",
      highlights: [
        "Trust-scored elections keep swarm coverage near 99%",
        "Custom Python grid world with YAML-configured benchmarks",
        "Documented for Washington State Science & Engineering Fair"
      ],
      descriptionHtml: `
      <h3>At a glance</h3>
      <ul>
        <li><strong class="list-label">Solo project</strong> with mentorship from Avi Soval, a masters student in aerospace and multi agent systems research.</li>
        <li><strong class="list-label">My role:</strong> Conducted literature review, developed the novel REIP governance policy, built a full multi-agent simulation environment, ran controlled experiments/ablations, wrote a technical analysis report paper and a software system description document.</li>
        <li><strong class="list-label">Goal:</strong> Develop a governance policy for leader-follower drone systems so teams can maintain coverage even when AI based leaders "hallucinate" or adversarial attacks occur.</li>
        <li><strong class="list-label">Key tools:</strong> Python, NumPy, custom Grid-World environment, multiprocessing library for parallel agent processing, Matplotlib, LaTeX, Pandas.</li>
        <li><strong class="list-label">Outcome:</strong>In faulted environments with hallucinating leaders and packet loss, REIP maintains ~99% coverage vs ~89% for a leader-follower baseline, with ~52% higher success rate at reaching 95% coverage in <400 steps and ~30% lower median time-to-95%.</li>      
        <li><strong class="list-label">Status:</strong> Simulation framework and experimental results complete; research paper draft in progress for Washington State Science and Engineering Fair 2025. Working on Hardware implementation of REIP on six Holybro X500 drones courtesy of South Puget Sound Community College.</li>
        </ul>
        <hr>
      <h3>Project Overview</h3>
      <p>
      Resilient Election & Impeachment Policy (REIP) is my ongoing research submission for the Washington State Science Fair 2025. The project tackles a hard robotics question: how do we keep multi-agent teams coordinated when leaders fail, misbehave, or face adversarial interference? Traditional leader-follower strategies crumble when the designated leader hallucinates or loses communication, so I designed a trust-based governance layer that lets the team continuously evaluate leadership, call elections when trust drops, and impeach compromised leaders in real time. This governance sits above standard exploration behaviors and treats leadership as a revocable privilege rather than a fixed role.
      </p>
      <p>
      REIP's high-level approach blends collective trust scoring, democratic leadership rotation, and lightweight fallback autonomy so that no single failure can derail the mission. In large benchmark trials, REIP remained within 0.7% of the baseline while achieving a ~52% higher success rate at reaching 95% coverage in under 400 steps while completing missions 32% faster in adversarial conditions. These gains translate to faster, safer mapping and search missions under uncertainty. Detailed technical documentation is currently under review for competition, but this summary highlights the outcome: multi-agent robotics can remain resilient if governance is distributed, transparent, and accountable to the team it serves.
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
      <div class="clear-float"></div>

      `,
      image: "/assets/img/reip/reipenv.png",
      files: []
    },
    {
      id: 3,
      title: "MIT-BWSI Autonomous UAV Racing",
      date: "7/2025 - 8/2025",
      keyPoints: "Autonomous UAV · OpenCV line tracking · BWSI champion",
      repoUrl: "https://github.com/amzoeee/line_follower_v2",
      description: "Led sensing + electronics for the MIT BWSI UAV racing team, integrating OpenCV line tracking on a Pi 5 with PX4 autopilot to win by over a minute.",
      badge: "BWSI Winner",
      highlights: [
        "Custom MAVLink + OpenCV stack on Raspberry Pi 5",
        "Manufactured enclosures + landing gear to stabilize payloads",
        "Piloted winning final run at MIT’s Zesiger Center"
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
      badge: "YC Agent Jam",
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
      description: "Co-invented LifeFlo, a monitored GPT + FlutterFlow women’s health app that’s live on Google Play and covered by US provisional patent 63/873,509.",
      badge: "Patent Pending",
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
      badge: "Hot-fire",
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
      title: "Windsurfing & Sailing Interface",
      date: "6/2025 - Present",
      keyPoints: "ESP32 interface · Arduino firmware · Selling Units",
      description: "Shipping ESP32-based windsurf dashboards that pull marine weather APIs + local radio data into a rugged TFT interface sold to local clubs.",
      badge: "Product",
      highlights: [
        "ESP32 firmware w/ Wi-Fi + radio ingest",
        "Weather + tide data rendered on TFT UI",
        "Sold units at $50 with $15 BOM"
      ],
      descriptionHtml: `
        <h3>Description</h3>
        <p>This uses an ESP WROOM-32 microcontroller and a TFT display to create a simple interface for local windsurfers and sailors to use.
        This is programmed in Arduino and uses API keys and the home Wi-Fi for a constant connection, it can also receive constant radio data from the local weather station for constant updates.
        This was created for sailors and windsurfers at the local clubs. It has been sold for $50 per unit and costs only $15 to produce.
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
  const modalRepoLink = document.getElementById('modalRepoLink');
  const modalAppLink = document.getElementById('modalAppLink');
  const modalMeta = document.getElementById('modalMeta');
  const modalKeyPoints = document.getElementById('modalKeyPoints');
  const modalDate = document.getElementById('modalDate');
  const modalDescription = document.getElementById('modalDescription');
  const modalFiles = document.getElementById('modalFiles');
  const filesGrid = document.getElementById('filesGrid');

  // Initialize portfolio grid
  function initPortfolio() {
    if (!portfolioGrid) return;

    portfolioGrid.innerHTML = '';

    portfolioData.forEach(project => {
      const card = createProjectCard(project);
      portfolioGrid.appendChild(card);
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
      } catch (err) {
        console.debug('Theme storage unavailable:', err);
        return null;
      }
    };

    const writeStoredTheme = (theme) => {
      try {
        localStorage.setItem(storageKey, theme);
      } catch (err) {
        console.debug('Theme storage unavailable:', err);
      }
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

    const media = document.createElement('div');
    media.className = 'project-card__media';

    const thumbnail = document.createElement('img');
    thumbnail.src = project.image || '/assets/img/logo.png';
    thumbnail.alt = `${project.title} preview`;
    thumbnail.loading = 'lazy';
    thumbnail.onerror = function() {
      this.src = '/assets/img/logo.png';
    };
    media.appendChild(thumbnail);

    if (project.badge) {
      const badge = document.createElement('span');
      badge.className = 'project-card__badge';
      badge.textContent = project.badge;
      media.appendChild(badge);
    }

    const body = document.createElement('div');
    body.className = 'project-card__body';

    const titleRow = document.createElement('div');
    titleRow.className = 'project-card__titleRow';

    const titleGroup = document.createElement('div');
    titleGroup.className = 'project-card__titleGroup';

    const title = document.createElement('h3');
    title.textContent = project.title;
    titleGroup.appendChild(title);

    if (project.keyPoints) {
      const subtitle = document.createElement('p');
      subtitle.textContent = project.keyPoints;
      titleGroup.appendChild(subtitle);
    }

    if (project.date) {
      const meta = document.createElement('p');
      meta.className = 'project-card__meta';
      meta.textContent = project.date;
      titleGroup.appendChild(meta);
    }

    titleRow.appendChild(titleGroup);

    const links = document.createElement('div');
    links.className = 'project-card__links';

    if (project.repoUrl) {
      const repo = document.createElement('a');
      repo.className = 'pill-link pill-link--ghost';
      repo.href = project.repoUrl;
      repo.target = '_blank';
      repo.rel = 'noopener';
      repo.textContent = 'View repo';
      links.appendChild(repo);
    }

    if (project.appUrl) {
      const app = document.createElement('a');
      app.className = 'pill-link';
      app.href = project.appUrl;
      app.target = '_blank';
      app.rel = 'noopener';
      app.textContent = 'Open app';
      links.appendChild(app);
    }

    if (links.children.length) {
      titleRow.appendChild(links);
    }

    const overview = document.createElement('div');
    overview.className = 'project-card__overview';

    const atGlanceHeading = document.createElement('h4');
    atGlanceHeading.className = 'project-card__glanceHeading';
    atGlanceHeading.textContent = 'At a glance';
    overview.appendChild(atGlanceHeading);
    const highlights = document.createElement('ul');
    highlights.className = 'project-card__list';
    const highlightItems = Array.isArray(project.highlights)
      ? project.highlights
      : (project.keyPoints || '').split('·').map(item => item.trim()).filter(Boolean);

    highlightItems.slice(0, 3).forEach(text => {
      const li = document.createElement('li');
      li.textContent = text;
      highlights.appendChild(li);
    });
    if (highlights.children.length) {
      overview.appendChild(highlights);
    }

    body.appendChild(titleRow);
    body.appendChild(overview);

    article.appendChild(media);
    article.appendChild(body);

    article.addEventListener('click', (evt) => {
      if (evt.target.closest('a, button')) return;
      evt.preventDefault();
      openModal(project);
    });

    return article;
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
      if (hasApp) modalAppLink.href = project.appUrl;
    }
    if (modalMeta) {
      modalMeta.style.display = (hasKeyPoints || hasDate) ? 'flex' : 'none';
    }

    modalDescription.innerHTML = project.descriptionHtml || `<p>${project.description || 'Detailed write-up coming soon.'}</p>`;
    modalDescription.querySelectorAll('img').forEach(img => {
      if (!img.hasAttribute('loading')) img.loading = 'lazy';
    });

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

  function bootstrap() {
    initPortfolio();
    initThemeToggle();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
