import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import Navbar from "./Components/NavBar";
import Footer from "./Components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ActivityDetails from "./pages/ActivityDetails";
import UpdateProfile from "./pages/UpdateProfile";
import Feedback from "./pages/Feedback";
import Chatbot from "./pages/Chatbot";
import DiagnosisMain from "./pages/Diagnosis/Diagnosis";
import DiagnosisInput from "./pages/Diagnosis/DiagnosisInput";
import DiagnosisPreprocess from "./pages/Diagnosis/DiagnosisPreprocess";

import DiagnosisResult from "./pages/Diagnosis/DiagnosisResult";
import ReportHistory from "./pages/Diagnosis/ReportHistory";
import Visualization from "./pages/Diagnosis/Visualization";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminFeedback from "./pages/Admin/AdminFeedback";
import AdminProfile from "./pages/Admin/AdminProfile";
import AdminSettings from "./pages/Admin/AdminSettings";
import AdminActivity from "./pages/Admin/AdminActivity";
import AdminReports from "./pages/Admin/AdminReports";
import ScrollToTopButton from "./Components/ScrollToTopButton";
import "./App.css";

// Protected Route Component
function ProtectedRoute({ children, requireAdmin = false }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !user.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Check login status on mount
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
  };

  const hideNavbarFooter =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/chatbot" ||
    location.pathname.startsWith("/admin");

  return (
    <>
      {!hideNavbarFooter && (
        <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} user={user} />
      )}

      <Routes>
        <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login setIsLoggedIn={handleLogin} />} />
        <Route path="/signup" element={<Signup setIsLoggedIn={handleLogin} />} />
        
        {/* User Dashboard Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard user={user} />
          </ProtectedRoute>
        } />
        <Route path="/activity-details" element={
          <ProtectedRoute>
            <ActivityDetails />
          </ProtectedRoute>
        } />
        <Route path="/updateprofile" element={
          <ProtectedRoute>
            <UpdateProfile user={user} />
          </ProtectedRoute>
        } />
        <Route path="/feedback" element={
          <ProtectedRoute>
            <Feedback user={user} />
          </ProtectedRoute>
        } />
        <Route path="/chatbot" element={
          <ProtectedRoute>
            <Chatbot />
          </ProtectedRoute>
        } />

        {/* Diagnosis Module Routes */}
        <Route path="/diagnosis" element={
          <ProtectedRoute>
            <DiagnosisMain />
          </ProtectedRoute>
        } />
        <Route path="/diagnosis/input" element={
          <ProtectedRoute>
            <DiagnosisInput />
          </ProtectedRoute>
        } />
        <Route path="/diagnosis/preprocess" element={
          <ProtectedRoute>
            <DiagnosisPreprocess />
          </ProtectedRoute>
        } />
        <Route path="/diagnosis/result" element={
          <ProtectedRoute>
            <DiagnosisResult />
          </ProtectedRoute>
        } />
        <Route path="/diagnosis/report-history" element={
          <ProtectedRoute>
            <ReportHistory />
          </ProtectedRoute>
        } />
        <Route path="/diagnosis/result" element={<DiagnosisResult />} />
        <Route path="/diagnosis/visualization" element={
          <ProtectedRoute>
            <Visualization />
          </ProtectedRoute>
        } />

        {/* Admin Routes - Separate Pages */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminUsers />
          </ProtectedRoute>
        } />
        <Route path="/admin/feedback" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminFeedback />
          </ProtectedRoute>
        } />
        <Route path="/admin/profile" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminProfile />
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminSettings />
          </ProtectedRoute>
        } />
        <Route path="/admin/activity" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminActivity />
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminReports />
          </ProtectedRoute>
        } />
      </Routes>

      {/* SCROLL UP BUTTON: */}
      {!hideNavbarFooter && <ScrollToTopButton />} 
      
      {/* Footer */}
      {!hideNavbarFooter && <Footer />}
    </>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;

