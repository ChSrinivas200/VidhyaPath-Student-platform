# 🎓 VidyaPath — Next-Gen AI Learning & Productivity Platform

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=nodedotjs)
![Express](https://img.shields.io/badge/Express.js-v4.21-000000?style=for-the-badge&logo=express)
![React](https://img.shields.io/badge/React.js-v18.2-61DAFB?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)
![Render](https://img.shields.io/badge/Render-Deployment%20Ready-46E3B7?style=for-the-badge&logo=render)
[![YouTube Demo](https://img.shields.io/badge/YouTube-Watch%20Demo-FF0000?style=for-the-badge&logo=youtube)](https://youtu.be/QMOUjxdObGA)

**Empowering students with AI-driven RAG assistance, skill gap analytics, study planning, binaural focus tools, and interactive exam preparation.**

[Video Demo](#-project-demo--video-walkthrough) • [Features](#-key-features) • [Tech Stack](#%EF%B8%8F-tech-stack) • [Installation & Setup](#%EF%B8%8F-installation--local-setup) • [Render Deployment](#-render-cloud-deployment) • [API Architecture](#-api-endpoints-overview)

</div>

---

## 🎥 Project Demo & Video Walkthrough

[![VidyaPath Video Walkthrough](https://img.youtube.com/vi/QMOUjxdObGA/maxresdefault.jpg)](https://youtu.be/QMOUjxdObGA)

▶️ **[Watch the full VidyaPath Demonstration Video on YouTube](https://youtu.be/QMOUjxdObGA)**

---

## 🌟 Overview

**VidyaPath** is a comprehensive, full-stack learning productivity platform designed to transform how students and educators approach academic success. By integrating advanced AI models (RAG with OpenRouter / Colab RAG), automated document processing, binaural focus soundscapes, and data-driven skill diagnostics, VidyaPath provides an end-to-end environment for mastering complex subjects.

---

## 🚀 Key Features

### 🧠 1. AI Academic Suite & RAG Engine
* **Retrieval-Augmented Generation (RAG) Assistant**: Upload study notes or textbooks to query context-grounded answers with exact page/chunk citations using OpenRouter (GPT-4o) or custom Google Colab GPU backends.
* **AI Skill Gap Diagnostics**: Interactive assessments for computing student proficiency, identifying weak knowledge areas, and rendering diagnostic radar charts.
* **AI Document Summarizer**: Generate high-yield executive summaries, core concepts, formulas, and actionable exam takeaways from PDFs and raw text.
* **AI Quiz & Flashcard Generator**: Automatically convert lecture notes or documents into practice MCQs and spaced-repetition flashcard decks.
* **Mock Viva Simulator**: Interactive voice-enabled oral exam practice with AI evaluator scoring, real-time audio synthesis, and feedback.
* **Concept Map & Visualizer**: Automatically transform dense topics into visual node graphs and study flowcharts.

### 🎧 2. Study Productivity & Focus Engine
* **Focus Studio & Binaural Beats Engine**: Customizable Pomodoro timers paired with synthesized ambient audio (binaural focus frequencies, white/pink/brown noise generator).
* **Interactive Study Planner**: Drag-and-drop Kanban task boards, milestone tracking, and daily schedule management.
* **Streak & Habit Tracking**: Monitor daily study streaks, retention indices, and progress analytics.
* **Progress Analytics Dashboard**: Visual dashboards tracking subject mastery, retake trends, and study duration breakdowns.

### 👩‍🏫 3. Mentor & Marketplace Ecosystem
* **Mentor Path System**: Connect with educators for 1-on-1 guidance, career roadmaps, and review sessions.
* **Student Marketplace & Basket**: Access and purchase curated educational materials, study kits, and resources.
* **Tutor & Learner Analytics**: Specialized dashboard for educators to monitor student cohort progress and skill gaps.

### 📄 4. PDF Processing Tools
* **PDF Utility Suite**: In-browser PDF viewing, page extraction, splitting, merging, and document text parsing.

### 👤 5. User Profile & AI Profile Builder
* **AI Profile Builder**: Auto-generate career bios, target roles, proficiency levels, and weekly goal roadmaps.
* **Role Customization**: Seamless toggle between Learner and Educator personas.
* **Custom & Preset Avatars**: Support for custom avatar URLs, preset options, and local image file uploads.

---

## 🛠️ Tech Stack

### **Frontend**
* **Framework**: React.js (v18)
* **Styling**: Vanilla CSS, Tailwind CSS, Lucide Icons, React Icons
* **State & Routing**: React Context API, React Router v6
* **Data Visualization**: Recharts, Canvas Confetti
* **HTTP Client**: Axios with token interceptors

### **Backend**
* **Runtime**: Node.js & Express.js (v4.21)
* **Database**: MongoDB Atlas with Mongoose ODM
* **Authentication**: JSON Web Tokens (JWT), Bcrypt password hashing
* **AI Services**: OpenRouter API (GPT-4o), Google Generative AI, Colab RAG Tunnel integration
* **File Uploads**: Multer (Local & Static Upload Handling)
* **PDF Engine**: `pdf-parse`, `pdf-lib`, `docx`

### **DevOps & Cloud**
* **Platform**: Render (Web Services & Static Sites)
* **Infrastructure as Code**: Render Blueprint (`render.yaml`)

---

## 📁 Project Structure

```
project/
├── backend/                  # Node.js + Express API Server
│   ├── middleware/           # JWT & Auth middleware
│   ├── models/               # Mongoose database schemas
│   ├── routes/               # API endpoints (Auth, RAG, Assessments, Quiz, etc.)
│   ├── utils/                # DB connection, OpenRouter client, Colab RAG client
│   ├── uploads/              # Uploaded user avatars & document storage
│   ├── package.json          # Backend dependencies & start scripts
│   └── server.js             # Express entry point & CORS configuration
│
├── frontend/                 # React Single Page Application
│   ├── src/
│   │   ├── components/       # Reusable UI components (Navbar, Binaural Banner, etc.)
│   │   ├── context/          # React Context (Auth, Theme, Focus)
│   │   ├── pages/            # Page views (RAG Assistant, Study Planner, Focus, etc.)
│   │   ├── services/         # Axios API service configuration
│   │   └── utils/            # Focus audio engine & helper functions
│   ├── public/               # Static assets & index.html
│   └── package.json          # Frontend dependencies & React build scripts
│
└── render.yaml               # Render Blueprint configuration file
```

---

## 🔑 Environment Variables

### Backend Environment Variables (`backend/.env`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Backend server port (Render injects automatically) | `5000` |
| `NODE_ENV` | Environment mode (`development` / `production`) | `development` |
| `MONGO_URI` / `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for signing authentication tokens | `your_jwt_secret_key` |
| `OPENROUTER_API_KEY` | OpenRouter API Key for RAG & Quiz generation | `sk-or-v1-...` |
| `COLAB_RAG_API` | External Colab RAG Tunnel URL (Optional) | `https://your-tunnel.loca.lt` |
| `FRONTEND_URL` | Allowed CORS Frontend URL | `http://localhost:3000` |

### Frontend Environment Variables (`frontend/.env`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `REACT_APP_API_URL` | Full backend API URL | `http://localhost:5000/api` |
| `REACT_APP_COLAB_RAG_API` | Default Colab RAG Endpoint | `https://your-tunnel.loca.lt` |

---

## ⚙️ Installation & Local Setup

### Prerequisites
* **Node.js**: v18.x or higher
* **MongoDB**: Local MongoDB instance or MongoDB Atlas account
* **npm**: v9.x or higher

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/L24cs200/project.git
cd project
```

### 2️⃣ Configure Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/vidyapath
JWT_SECRET=super_secret_key_123
OPENROUTER_API_KEY=your_openrouter_api_key
```

Start the backend server:
```bash
npm run dev
# Server will run at http://localhost:5000
```

### 3️⃣ Configure Frontend
Open a new terminal window:
```bash
cd frontend
npm install
```

Start the React development server:
```bash
npm start
# Application will open at http://localhost:3000
```

---

## 🌐 Render Cloud Deployment

VidyaPath includes a pre-configured `render.yaml` Blueprint file for seamless 1-click deployment on Render.

### Option 1: Render Blueprint (Recommended)
1. Push your repository code to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** -> **Blueprint**.
4. Select your GitHub repository.
5. Render will automatically configure:
   - **`vidyapath-backend`** (Node Web Service)
   - **`vidyapath-frontend`** (React Static Site)
6. Enter your `MONGO_URI` under `vidyapath-backend` environment variables.

### Option 2: Manual Render Setup
* **Backend Web Service**:
  - Root Directory: `backend`
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Add `MONGO_URI`, `JWT_SECRET`, and `FRONTEND_URL`.
* **Frontend Static Site**:
  - Root Directory: `frontend`
  - Build Command: `npm install && npm run build`
  - Publish Directory: `build`
  - Add `REACT_APP_API_URL` pointing to `https://<your-backend-app>.onrender.com/api`
  - Add Rewrite Rule: `/*` -> `/index.html`

---

## 📡 API Endpoints Overview

| Service Module | Base Route | Description |
| :--- | :--- | :--- |
| **Auth** | `/api/auth` | User registration, login, profile updates & avatar upload |
| **RAG Assistant** | `/api/rag` | Query RAG engine, set active Colab URL, health status |
| **Assessments** | `/api/assessments` | AI Skill Gap Diagnostics, tutor quizzes, radar chart stats |
| **Summarizer** | `/api/summarize` | Generate document summaries & key takeaways |
| **Quiz Generator** | `/api/quiz` | Generate & evaluate multiple choice quizzes |
| **Study Planner** | `/api/planner` | Create tasks, study sessions, specializations & deadlines |
| **PDF Tools** | `/api/pdf-tools` | Parse, merge, split, and convert PDF files |
| **Mentors** | `/api/mentors` | Retrieve mentors and book 1-on-1 guidance sessions |
| **Marketplace** | `/api/market` | Browse study materials & manage student basket |

---

## 🤝 Contributing

Contributions are welcome! If you find a bug or have a feature suggestion, please open an issue or submit a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the ISC License.

---

<div align="center">
  <sub>Built with ❤️ for Students & Educators worldwide.</sub>
</div>
