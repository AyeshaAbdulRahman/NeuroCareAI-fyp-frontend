import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Diagnosis.css";

function DiagnosisPreprocess() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/diagnosis/result"), 6000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="diagnosis-preprocess">
      <h2>⚙️ Preprocessing EEG Data</h2>
      <p>Filtering noise, normalizing signals, and extracting features...</p>

      <div className="progress-container">
        <div className="progress-bar"></div>
      </div>

      <div className="ai-loader">
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
      </div>
    </div>
  );
}

export default DiagnosisPreprocess;
