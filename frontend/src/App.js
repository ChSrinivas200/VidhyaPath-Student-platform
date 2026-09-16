import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

// ✅ Import ThemeProvider
import { ThemeProvider } from './context/ThemeContext';

// --- Pages ---
import Homepage from './pages/Homepage';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Summarizer from './pages/Summarizer';
import QuizGenerator from './pages/QuizGenerator';
import Visualizer from './pages/Visualizer';
import PdfViewer from './pages/PdfViewer';
import PdfTools from './pages/PdfTools';       
import PdfToolView from './pages/PdfToolView'; 
import StudyPlanner from './pages/StudyPlanner'; 
import FocusPage from './pages/FocusPage';
import MentorPath from './pages/MentorPath'; 
import StudentBasket from './pages/StudentBasket'; // ✅ NEW IMPORT
import RagAssistant from './pages/RagAssistant'; // ✅ AI Colab RAG Assistant
import SkillAssessments from './pages/SkillAssessments'; // ✅ Tutor Skill Assessments & AI Skill Gap Engine
import SkillPaths from './pages/SkillPaths'; // ✅ Skill Paths & Curated Roadmaps
import ProgressAnalytics from './pages/ProgressAnalytics'; // ✅ Progress & Skill-Gap Analytics Dashboard
import Flashcards from './pages/Flashcards'; // 🎴 3D AI Flashcards
import MockVivaSimulator from './pages/MockVivaSimulator'; // 🎙️ Mock Viva Examiner
import ConceptMapGenerator from './pages/ConceptMapGenerator'; // 🧠 Concept Mind Map
import JudgeShowcase from './pages/JudgeShowcase'; // ✨ Hackathon Judge Showcase
import TutorLearnersAnalytics from './pages/TutorLearnersAnalytics'; // 🎓 Tutor Learners Analytics & Feature Usage

// --- Components ---
import Layout from './components/Layout';
import SplashScreen from './components/SplashScreen';

// --- Private Route Logic ---
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

// --- Learner Only Route Logic (Tutors authorized exclusively for /assessments) ---
const LearnerOnlyRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  if (!token) return <Navigate to="/login" />;
  if (userRole === 'tutor') return <Navigate to="/assessments" replace />;
  return children;
};

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    // ✅ WRAP THE ROUTER IN THEME PROVIDER
    <ThemeProvider>
      {/* ✅ ADDED FUTURE FLAGS to silence console warnings */}
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>

          {/* -------------------- PUBLIC ROUTES -------------------- */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* -------------------- PRIVATE ROUTES -------------------- */}
          
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                {localStorage.getItem('userRole') === 'tutor' ? (
                  <Navigate to="/assessments" replace />
                ) : (
                  <Navigate to="/home" replace />
                )}
              </PrivateRoute>
            } 
          />

          <Route 
            path="/home"
            element={
              <LearnerOnlyRoute>
                <Layout>
                  <Homepage />
                </Layout>
              </LearnerOnlyRoute>
            }
          />

          <Route 
            path="/dashboard"
            element={
              <LearnerOnlyRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </LearnerOnlyRoute>
            }
          />

          <Route 
            path="/study-planner"
            element={
              <LearnerOnlyRoute>
                <Layout>
                  <StudyPlanner />
                </Layout>
              </LearnerOnlyRoute>
            }
          />
          <Route 
            path="/planner" 
            element={
              <LearnerOnlyRoute>
                <Layout>
                  <StudyPlanner />
                </Layout>
              </LearnerOnlyRoute>
            }
          />

          {/* Skill Paths & Curated Roadmaps */}
          <Route 
            path="/skill-paths"
            element={
              <LearnerOnlyRoute>
                <Layout>
                  <SkillPaths />
                </Layout>
              </LearnerOnlyRoute>
            }
          />
          <Route 
            path="/skill-path"
            element={
              <LearnerOnlyRoute>
                <Layout>
                  <SkillPaths />
                </Layout>
              </LearnerOnlyRoute>
            }
          />
          <Route 
            path="/playlists"
            element={
              <LearnerOnlyRoute>
                <Layout>
                  <SkillPaths />
                </Layout>
              </LearnerOnlyRoute>
            }
          />

          {/* Progress & Skill-Gap Analytics Module */}
          <Route 
            path="/progress"
            element={
              <LearnerOnlyRoute>
                <Layout>
                  <ProgressAnalytics />
                </Layout>
              </LearnerOnlyRoute>
            }
          />
          <Route 
            path="/learner-progress"
            element={
              <LearnerOnlyRoute>
                <Layout>
                  <ProgressAnalytics />
                </Layout>
              </LearnerOnlyRoute>
            }
          />
          <Route 
            path="/analytics"
            element={
              <LearnerOnlyRoute>
                <Layout>
                  <ProgressAnalytics />
                </Layout>
              </LearnerOnlyRoute>
            }
          />

          {/* Document Q&A Assistant (formerly PDF Viewer) */}
          <Route 
            path="/pdf-viewer"
            element={
              <LearnerOnlyRoute>
                <PdfViewer />
              </LearnerOnlyRoute>
            }
          />
          <Route 
            path="/document-assistant"
            element={
              <LearnerOnlyRoute>
                <PdfViewer />
              </LearnerOnlyRoute>
            }
          />
          <Route 
            path="/pdf-tools"
            element={
              <LearnerOnlyRoute>
                <Layout>
                  <PdfTools />
                </Layout>
              </LearnerOnlyRoute>
            } 
          />
          <Route 
            path="/pdf-tools/:toolId" 
            element={
              <LearnerOnlyRoute>
                <Layout>
                  <PdfToolView />
                </Layout>
              </LearnerOnlyRoute>
            } 
          />

          {/* AI & Assessment Tools */}
          {/* ✅ /assessments is accessible to BOTH Tutors (exclusive workspace) and Learners */}
          <Route 
            path="/assessments"
            element={
              <PrivateRoute>
                <Layout>
                  <SkillAssessments />
                </Layout>
              </PrivateRoute>
            }
          />
          {/* 🎓 Tutor Analytics & Learners Progress */}
          <Route 
            path="/tutor-analytics"
            element={
              <PrivateRoute>
                <Layout>
                  <TutorLearnersAnalytics />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route 
            path="/learners-progress"
            element={
              <PrivateRoute>
                <Layout>
                  <TutorLearnersAnalytics />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route 
            path="/rag"
            element={
              <LearnerOnlyRoute>
                <Layout>
                  <RagAssistant />
                </Layout>
              </LearnerOnlyRoute>
            }
          />
          <Route 
            path="/summarizer"
            element={
              <LearnerOnlyRoute>
                <Layout>
                  <Summarizer />
                </Layout>
              </LearnerOnlyRoute>
            }
          />
          <Route 
            path="/quiz-generator"
            element={
              <LearnerOnlyRoute>
                <Layout>
                  <QuizGenerator />
                </Layout>
              </LearnerOnlyRoute>
            }
          />
          <Route 
            path="/visualizer"
            element={
              <LearnerOnlyRoute>
                <Layout>
                  <Visualizer />
                </Layout>
              </LearnerOnlyRoute>
            }
          />

          {/* Mentorship Module */}
          <Route 
            path="/mentor-path"
            element={
              <LearnerOnlyRoute>
                <Layout>
                  <MentorPath />
                </Layout>
              </LearnerOnlyRoute>
            }
          />

          {/* ✅ LearnerBasket Module */}
          <Route 
            path="/learner-basket"
            element={
              <LearnerOnlyRoute>
                <Layout>
                  <StudentBasket />
                </Layout>
              </LearnerOnlyRoute>
            }
          />
          <Route 
            path="/student-basket"
            element={
              <LearnerOnlyRoute>
                <Layout>
                  <StudentBasket />
                </Layout>
              </LearnerOnlyRoute>
            }
          />

          {/* Focus Mode */}
          <Route 
            path="/focus"
            element={
              <LearnerOnlyRoute>
                 <FocusPage />
              </LearnerOnlyRoute>
            }
          />

          {/* 🎴 3D AI Flashcards */}
          <Route 
            path="/flashcards"
            element={
              <LearnerOnlyRoute>
                <Layout>
                  <Flashcards />
                </Layout>
              </LearnerOnlyRoute>
            }
          />

          {/* 🎙️ Mock Viva Oral Examiner */}
          <Route 
            path="/mock-viva"
            element={
              <LearnerOnlyRoute>
                <Layout>
                  <MockVivaSimulator />
                </Layout>
              </LearnerOnlyRoute>
            }
          />

          {/* 🧠 Concept Mind Map Generator */}
          <Route 
            path="/concept-map"
            element={
              <LearnerOnlyRoute>
                <Layout>
                  <ConceptMapGenerator />
                </Layout>
              </LearnerOnlyRoute>
            }
          />

          {/* ✨ Animated Hackathon Judge Showcase */}
          <Route 
            path="/showcase"
            element={
              <LearnerOnlyRoute>
                <Layout>
                  <JudgeShowcase />
                </Layout>
              </LearnerOnlyRoute>
            }
          />
          <Route 
            path="/judge-demo"
            element={
              <LearnerOnlyRoute>
                <Layout>
                  <JudgeShowcase />
                </Layout>
              </LearnerOnlyRoute>
            }
          />

        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;