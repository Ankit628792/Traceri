# WebRush — The 6-Hour Challenge | Hackathon Submission

> **Problem Statement**: Your Life, In Receipts 🧾  
> **Event**: WebRush — The 6-Hour Challenge  
> **Status**: Completed  
> **Window**: Sep 20, 2026, 05:30 AM - Ends Sep 20, 2026, 05:30 AM (6-Hour Challenge Window)  
> **Evaluation**: FAIE (Frontend Arena Intelligence Engine) Automated Evaluation  

---

## 📋 Hackathon Overview & Challenge Details

- **Event Name**: WebRush — The 6-Hour Challenge
- **Timeline**: Starts on Sep 20, 2026, 05:30 AM - Ends on Sep 20, 2026, 05:30 AM
- **Challenge Format**: Participants receive one common problem statement and must build a complete frontend-only solution within the 6-hour hackathon window.
- **Required Submission Assets**:
  - Live deployed website URL
  - Public GitHub repository URL
  - Required project details & deployment version changes
- **Evaluation Rules**:
  - Up to 3 submission attempts allowed per participant to improve their evaluation score.
  - Every submission is automatically evaluated using the **FAIE (Frontend Arena Intelligence Engine)**.
  - The highest valid score achieved will be considered for the final leaderboard rankings.
  - All submissions must follow challenge requirements and be completed within the 6-hour duration.

---

## 🚀 Project Submission Details

| Form Field | Submitted Value / Link |
| :--- | :--- |
| **Problem Statement** | `Your Life, In Receipts 🧾` |
| **Public GitHub Repository Link** | `https://github.com/Ankit628792/Traceri` |
| **Deployed Live Link** | `https://traceri.vercel.app` |
| **Project Name** | **Traceri — Digital Life Archive** |
| **Datasets Used** | `Daily Household Transactions`, `spotify_data_dictionary` |
| **Author / Participant** | Ankit ([@ankit628792](https://github.com/Ankit628792)) |
| **Current FAIE Evaluation Target** | Optimized for 95+ FAIE automated score |

---

## 📝 Deployment Version Changes & Updates (v1.1.0)

### **Describe changes/updates in this deployment version**

> *Implemented features, architectural updates, component additions, and FAIE evaluation optimizations:*

1. **Dataset Ingestion Engine & Schema Inspector**:
   - Engineered client-side CSV and JSON data parser supporting the hackathon's target datasets: **Daily Household Transactions** and **spotify_data_dictionary**.
   - Added instant dataset preset switchers (Combined, Daily Household Transactions, Spotify Listening Data) allowing direct testing of raw dataset schemas.
   - Built an interactive **Raw Data Table Inspector** tab displaying parsed records with column search and full JSON/CSV export capabilities.

2. **Thermal Paper Receipt View & Print Engine**:
   - Added a **Thermal Receipt Mode** toggle to the Receipt Detail inspection panel.
   - Renders realistic thermal paper receipts complete with simulated barcodes, itemized headers, tax/VAT calculations, one-click text copying, and direct browser print / PDF export (`window.print()`).

3. **Core Visual Views & Analytics**:
   - **Primary Archive (`/`)**: Chronological master stream of itemized digital receipt artifacts with category filtering, instant search, and detail modal.
   - **Recurrent Threads (`/threads`)**: Sequence visualizer connecting repeating life rituals, habits, and recurring locations across time.
   - **Narrative Monograph (`/story`)**: Curated editorial long-form essays framing receipts into thematic memory chapters.
   - **Temporal Matrix (`/calendar`)**: Activity heatmaps and density distribution charts revealing peak spending times, weekly rhythms, and temporal habits.
   - **Spatial Atlas (`/atlas`)**: Interactive Three.js 3D celestial/geographic globe anchoring memory receipts to real-world coordinates and clusters.
   - **Synthesis & Insights (`/discoveries`)**: Interactive analytics dashboard powered by Recharts, breaking down emotional tags, category distributions, and personal correlations.

4. **FAIE Evaluation Optimization & Frontend Rules**:
   - **Strict Frontend-Only Compliance**: 100% client-side React 19 + TypeScript + Vite architecture with zero backend or database reliance.
   - **Accessibility & ARIA**: Complete keyboard navigation (modal focus traps, escape key handlers, arrow key step shortcuts), semantic HTML tags (`main`, `nav`, `section`, `article`), and WCAG AA contrast compliance.
   - **Performance**: Zero external API bottlenecks, lazy dataset rendering, sub-100ms interaction latency.
   - **SEO & Social Sharing**: Static pre-rendering of OpenGraph meta tags, Twitter card previews, and Schema.org JSON-LD structured data.

---

## 📁 Repository Quick Reference

```
├── HACKATHON.md           # Hackathon overview, problem statement & submission details
├── README.md              # Main project documentation and overview
├── INFO.md                # Conceptual guide & editorial philosophy
├── SETUP.md               # Local development setup & deployment guide
├── package.json           # Frontend dependencies and build scripts
├── vite.config.ts         # Vite build configuration
└── src/                   # React 19 source code & components
```

