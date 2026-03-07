# 📄 Functional Requirements Document (FRD)
**Project Name:** Interactive Career Mindmap & Portfolio Engine
**Owner:** Mohammed Reqasse
**Version:** 1.0
**Date:** March 2027

---

## 1. Project Overview
### 1.1 Purpose
To develop an interactive, web-based mindmap that serves as both a personal progress tracker and a high-impact digital portfolio. The system will dynamically visualize a three-branched engineering roadmap (Networking, Telecommunications, Cybersecurity) and track completion of specific technical milestones (e.g., Cisco CCNA modules, 5G architecture deployment, Cyber Drill participation) to immediately demonstrate job-market readiness to recruiters.

### 1.2 Target Audience
* **Primary:** Technical Recruiters, HR Managers, and Senior Network Architects evaluating candidates for tier-1 engineering roles.
* **Secondary:** The project owner, functioning as a daily dashboard to track study progress and certification readiness prior to graduation from ENSA Safi.

---

## 2. System Architecture & Technology Stack
### 2.1 Frontend
* **Core:** HTML5, CSS3, JavaScript (ES6+).
* **Framework (Optional but Recommended):** React.js (to leverage existing full-stack capabilities and manage state for progress tracking).
* **Styling:** Tailwind CSS for rapid, responsive UI development.
* **Visualization Engine:** D3.js (for deep custom interactivity) or Mermaid.js (for rapid markdown-to-graph rendering).

### 2.2 Backend & Data Management
* **Data Structure:** A local `data.json` file derived directly from the `conception.md` blueprint.
* **State Persistence:** `localStorage` to save the user's progress (checked modules) without requiring a full backend database initially. 

---

## 3. Functional Requirements (Core Features)

### 3.1 Interactive Visualization (The Mindmap)
* **REQ-101 (Node Rendering):** The system must render a central root node ("Graduation 2027") branching into three main category nodes: Networking, Telecommunications, and Cybersecurity.
* **REQ-102 (Sub-Node Expansion):** Users must be able to click on a main category node to expand/collapse its specific milestones (e.g., clicking "Networking" reveals ITN, SRWE, ENSA, Advanced Routing, Programmability).
* **REQ-103 (Zoom & Pan):** The mindmap canvas must support mouse-wheel zooming and click-and-drag panning for navigation of complex structures.

### 3.2 Detail Panel & Content Display
* **REQ-201 (Dynamic Context):** Clicking a specific milestone (e.g., "Sub-Node 3: ENSA v7.0") must open a side panel or modal.
* **REQ-202 (Granular Detail):** The detail panel must display the exact sub-modules (e.g., "1. Single-Area OSPFv2 Concepts", "4. ACL Concepts") associated with that node.
* **REQ-203 (Actionable Links):** The panel must support hyperlinking to external evidence, such as GitHub repositories (e.g., Netmiko scripts, MediConnect code) or certification badges.

### 3.3 Progress Tracking Engine
* **REQ-301 (Interactive Checkboxes):** Inside the detail panel, each granular module (e.g., the 17 modules of ITN) must have a clickable checkbox.
* **REQ-302 (State Management):** Checking a box must update the completion state in the browser's local storage.
* **REQ-303 (Visual Status Indicators):** * Nodes at 0% completion appear *Grey* (Pending).
    * Nodes between 1% and 99% appear *Yellow/Orange* (In Progress).
    * Nodes at 100% completion appear *Green* (Validated).
* **REQ-304 (Automated Calculation):** The root category node must display an aggregate percentage based on the completion of its child nodes.

---

## 4. Non-Functional Requirements (UI/UX & Performance)

### 4.1 User Interface Design
* **UI-101 (Theme):** The application must default to a Dark Mode aesthetic (e.g., deep blues and slate greys) to mimic modern terminal and IDE environments, aligning with a cybersecurity and networking motif.
* **UI-102 (Responsive Layout):** The mindmap canvas must automatically resize to fit desktop monitors, tablets, and mobile screens without breaking the node hierarchy.

### 4.2 Performance
* **PERF-101 (Load Time):** The graph data and rendering engine must load in under 1.5 seconds on a standard broadband connection.
* **PERF-102 (Client-Side Rendering):** All graph calculations and state changes must happen client-side to ensure zero latency when clicking nodes.

---

## 5. Data Schema Specification (JSON Blueprint)
The system will ingest data structured in the following format to dynamically generate the nodes:

```json
{
  "id": "root",
  "label": "Graduation Portfolio 2027",
  "status": "in-progress",
  "children": [
    {
      "id": "branch-network",
      "label": "Networking & Infrastructure",
      "children": [
        {
          "id": "ccna-ensa",
          "label": "ENSA v7.0",
          "type": "certification",
          "modules": [
            {"id": "ensa-m1", "name": "Single-Area OSPFv2 Concepts", "completed": false},
            {"id": "ensa-m14", "name": "Automation and Programmability", "completed": false}
          ]
        }
      ]
    }
  ]
}