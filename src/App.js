import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Navbar from "./Components/NavBar";
import Footer from "./Components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import UpdateProfile from "./pages/UpdateProfile";
import Feedback from "./pages/Feedback";
import Chatbot from "./pages/Chatbot";
import DiagnosisMain from "./pages/Diagnosis/Diagnosis";
import DiagnosisInput from "./pages/Diagnosis/DiagnosisInput";
import DiagnosisPreprocess from "./pages/Diagnosis/DiagnosisPreprocess";
import DiagnosisResult from "./pages/Diagnosis/DiagnosisResult";
import ReportHistory from "./pages/Diagnosis/ReportHistory";
import Visualization from "./pages/Diagnosis/Visualization";
import ScrollToTopButton from "./Components/ScrollToTopButton";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  const hideNavbarFooter =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/chatbot";

  return (
    <>
      {!hideNavbarFooter && (
        <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      )}

      <Routes>
        <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/signup" element={<Signup setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/updateprofile" element={<UpdateProfile />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/chatbot" element={<Chatbot />} />

        {/* Diagnosis Module Routes */}
        <Route path="/diagnosis" element={<DiagnosisMain />} />
        <Route path="/diagnosis/input" element={<DiagnosisInput />} />
        <Route path="/diagnosis/preprocess" element={<DiagnosisPreprocess />} />
        <Route path="/diagnosis/result" element={<DiagnosisResult />} />
        <Route path="/diagnosis/report-history" element={<ReportHistory />} />
        <Route path="/diagnosis/visualization" element={<Visualization />} />
      </Routes>

      <ScrollToTopButton />
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
