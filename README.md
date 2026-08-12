# ⚡ CodeForge 2.0 — College-Ready DSA Learning & Assessment Ecosystem

![CodeForge Banner](https://img.shields.io/badge/CodeForge-2.0-00f3ff?style=for-the-badge&logo=codeforces&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green?style=for-the-badge&logo=nodedotjs)
![React](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20Tailwind-blue?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-brightgreen?style=for-the-badge&logo=mongodb)

> **CodeForge** is an intelligent Data Structures & Algorithms (DSA) learning and assessment ecosystem. It combines a secure multi-language code judge (Judge0 CE), dynamic runtime algorithm visualizer, role-based faculty management portal, AI reasoning evaluation (Gemini), adaptive learning loops, and proctored assessment mode into one integrated platform.

**Live Application:** [https://codeforge-eta.vercel.app/](https://codeforge-eta.vercel.app/)

---

## 🌟 Key Features & Innovations

### 1. 💻 CodeForge CodeLab (Dedicated Coding Module)
- **Multi-Language Support**: C++, Java, Python, JavaScript with Monaco Editor integration.
- **Deterministic Judge Engine**: Code evaluation via sandboxed Judge0 execution (Public, Hidden, Edge, and Stress test cases).
- **Comprehensive Verdicts**: `Accepted`, `Wrong Answer`, `Time Limit Exceeded`, `Memory Limit Exceeded`, `Compilation Error`, `Runtime Error`.
- **Granular Test Output**: Pass/fail counters (e.g. `18/20 Passed`), runtime in ms, memory in KB, and detailed submission history.

### 2. 🛡️ Faculty Control Center & Admin Portal (`/admin`)
- **Role-Based Authentication**: Enforces `STUDENT`, `FACULTY`, and `ADMIN` role permissions.
- **Separate Faculty Login**: Dedicated login portal with optional passkey verification (`/admin/login`).
- **Classroom Intervention Analytics**: Overview of total active students, classroom accuracy, topic heatmaps, and automatically flagged at-risk students.
- **Problem Builder**: Rich problem statement editor, public example manager, hidden test case creator, and reference solution validator (`/admin/problems/new`).

### 3. 🪄 Dynamic Runtime Algorithm Visualizer (`/visualize`)
- **User-Driven Execution**: Enter any custom array input and select an algorithm.
- **Dynamic Trace Engine**: Instruments user input into a deterministic step-by-step event trace (`COMPARE`, `SWAP`, `SET`, `HIGHLIGHT`, `FOUND`).
- **Synchronized Visuals**: Real-time synchronization between bar chart state animations, operation event logs, and line-by-line code highlighting.

### 4. 🤖 AI Code Review & Reasoning Evaluation (Gemini)
- **Strict Separation of Concerns**: Judge decides correctness (truth); AI acts as teacher (feedback).
- **Post-Execution AI Review**: Analyzes code quality, time/space complexity, edge-case coverage, and optimization suggestions after judging.
- **Voice AI & Speech Analysis**: Evaluates verbal algorithm explanations for clarity, structure, filler word ratio, and DSA concept depth.

---

## 🏛️ System Architecture

```text
                         CODEFORGE ECOSYSTEM
                                 │
             ┌───────────────────┴───────────────────┐
             │                                       │
      STUDENT PORTAL                            FACULTY PORTAL
             │                                       │
     ┌───────┼───────┐                       ┌───────┼───────┐
   Learn  Practice CodeLab                 Dashboard Questions Analytics
     │       │       │                       │       │       │
 Visualizer Editor AI Review               Monitor  Assign  Validate
     │       │       │                       │       │       │
     └───────┼───────┘                       └───────┬───────┘
             │                                       │
             └───────────────────┬───────────────────┘
                                 ↓
                         Node / Express API
                                 │
                   ┌─────────────┼─────────────┐
                   ↓             ↓             ↓
               Judge0 CE      MongoDB        Gemini AI
               (Sandbox)      (Atlas)        (Teacher)
```

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, TailwindCSS, Monaco Editor (`@monaco-editor/react`), Lucide React, Framer Motion.
- **Backend**: Node.js, Express 5, Mongoose (MongoDB Atlas), JWT, BcryptJS, Nodemailer.
- **Evaluation Layer**: Judge0 CE API (RapidAPI or Self-Hosted), Custom Submission Service.
- **AI / LLM Integration**: Google Gemini API (`gemini-1.5-flash`), Custom Knowledge Base (RAG).

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js >= 18.0.0
- MongoDB Atlas Database URI
- (Optional) Judge0 API Key & Google Gemini API Key

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/roshann635/CodeForge.git
cd CodeForge

# Install all dependencies (root, client, server)
npm run install-all
```

### 2. Environment Configuration

Create a `.env` file inside the `server/` directory (see `server/.env.example`):

```ini
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/codeforge
JWT_SECRET=your_jwt_secret_here
ADMIN_KEY=codeforge_admin_2026

# Optional: Judge0 & Gemini API Credentials
JUDGE0_HOST=judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_rapidapi_key
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Seed MongoDB Database

Seed the database with standard DSA problems and test cases:

```bash
node server/scripts/seedProblems.js
```

### 4. Run Development Server

```bash
# Start backend server
npm start

# In a separate terminal, start frontend dev server
cd client
npm run dev
```

Visit `http://localhost:5173` for Student Portal or `http://localhost:5173/#/admin/login` for Faculty Portal.

---

## 📊 Evaluation & Judge Pipeline

```text
                 STUDENT CODE
                      │
                      ▼
               Select Language
                      │
                      ▼
               CodeForge API
                      │
                      ▼
              Submission Service
                      │
                      ▼
               ┌─────────────┐
               │  Judge0 CE  │
               │  Sandbox    │
               └─────────────┘
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
       Compile     Execute     Resource
        Check       Tests       Limits
          │           │           │
          └───────────┼───────────┘
                      ▼
             Deterministic Verdict
                      │
            ┌─────────┴─────────┐
            ▼                   ▼
      Student UI             AI Layer
     (Passed 18/20)        (Explanation)
```

---

## 👥 Roles & Access Controls

| Feature | Student | Faculty | Admin |
| :--- | :---: | :---: | :---: |
| CodeLab IDE & Submissions | ✅ | ✅ | ✅ |
| Dynamic Visualizer & Learn Path | ✅ | ✅ | ✅ |
| Voice AI Interview Prep | ✅ | ✅ | ✅ |
| Create & Edit Problems | ❌ | ✅ | ✅ |
| Add Public & Hidden Test Cases | ❌ | ✅ | ✅ |
| Class Analytics & At-Risk Tracking | ❌ | ✅ | ✅ |
| Manage System Users & Roles | ❌ | ❌ | ✅ |

---

## 👨‍💻 Developer

### Roshan Jadhav
Computer Science Engineering Student • Full-Stack Developer • AI/ML Enthusiast

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).
