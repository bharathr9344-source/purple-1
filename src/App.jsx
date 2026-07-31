import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ProgressProvider } from "./context/ProgressContext";
import { LearningProvider } from "./context/LearningContext";
import { HuntProvider } from "./context/HuntContext";

import Navbar from "./components/Navbar";
import RequireAuth from "./components/RequireAuth";

import Home from "./pages/Home";
import Room from "./pages/Room";
import AttackChain from "./pages/AttackChain";
import Analysis from "./pages/Analysis";
import Report from "./pages/Report";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Learn from "./pages/Learn";
import Lesson from "./pages/Lesson";
import PathPage from "./pages/PathPage";
import PlaygroundHub from "./pages/PlaygroundHub";
import Hunt from "./pages/Hunt";
import HuntAnalysis from "./pages/HuntAnalysis";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProgressProvider>
          <LearningProvider>
            <HuntProvider>
              <div className="app-shell">
                <Navbar />
                <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/room/:roomId" element={<Room />} />
                <Route path="/room/:roomId/chain" element={<AttackChain />} />
                <Route path="/room/:roomId/analysis" element={<Analysis />} />
                <Route path="/learn" element={<Learn />} />
                <Route path="/learn/path/:pathId" element={<PathPage />} />
                <Route path="/learn/:courseId" element={<Lesson />} />
                <Route path="/play" element={<Navigate to="/playgrounds" replace />} />
                <Route path="/playgrounds" element={<PlaygroundHub />} />
                <Route path="/playgrounds/:id" element={<Hunt />} />
                <Route
                  path="/playgrounds/:id/analysis"
                  element={<HuntAnalysis />}
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/report"
                  element={
                    <RequireAuth>
                      <Report />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <RequireAuth>
                      <Dashboard />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <RequireAuth>
                      <Profile />
                    </RequireAuth>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              </div>
              </HuntProvider>
            </LearningProvider>
          </ProgressProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
