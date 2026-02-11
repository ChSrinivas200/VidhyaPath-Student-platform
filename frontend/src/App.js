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

// --- Components ---
import Layout from './components/Layout';
import SplashScreen from './components/SplashScreen';

// --- Private Route  Logic ---
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
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
                <Navigate to="/home" replace />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/home"
            element={
              <PrivateRoute>
                <Layout>
                  <Homepage />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route 
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route 
            path="/study-planner"
            element={
              <PrivateRoute>
                <Layout>
                  <StudyPlanner />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route 
            path="/planner" 
            element={
              <PrivateRoute>
                <Layout>
                  <StudyPlanner />
                </Layout>
              </PrivateRoute>
            }
          />

          {/* PDF Tools & Viewer */}
          <Route 
            path="/pdf-viewer"
            element={
              <PrivateRoute>
                <Layout>
                  <PdfViewer />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route 
            path="/pdf-tools"
            element={
              <PrivateRoute>
                <Layout>
                  <PdfTools />
                </Layout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/pdf-tools/:toolId" 
            element={
              <PrivateRoute>
                <Layout>
                  <PdfToolView />
                </Layout>
              </PrivateRoute>
            } 
          />

          {/* AI Tools */}
          <Route 
            path="/summarizer"
            element={
              <PrivateRoute>
                <Layout>
                  <Summarizer />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route 
            path="/quiz-generator"
            element={
              <PrivateRoute>
                <Layout>
                  <QuizGenerator />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route 
            path="/visualizer"
            element={
              <PrivateRoute>
                <Layout>
                  <Visualizer />
                </Layout>
              </PrivateRoute>
            }
          />

          {/* Mentorship Module */}
          <Route 
            path="/mentor-path"
            element={
              <PrivateRoute>
                <Layout>
                  <MentorPath />
                </Layout>
              </PrivateRoute>
            }
          />

          {/* ✅ StudentBasket Module */}
          <Route 
            path="/student-basket"
            element={
              <PrivateRoute>
                <Layout>
                  <StudentBasket />
                </Layout>
              </PrivateRoute>
            }
          />

          {/* Focus Mode */}
          <Route 
            path="/focus"
            element={
              <PrivateRoute>
                 <FocusPage />
              </PrivateRoute>
            }
          />

        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;