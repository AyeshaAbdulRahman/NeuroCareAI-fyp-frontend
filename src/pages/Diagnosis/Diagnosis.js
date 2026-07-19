import React from "react";
import { useNavigate } from "react-router-dom";
import "./Diagnosis.css";

function Diagnosis() {
  const navigate = useNavigate();

  const steps = [
    {
      id: 1,
      title: "Step 1 — Input EEG Data",
      desc: "Begin by uploading EEG files (.edf, .csv, or .mat) or manually select symptoms. Our platform ensures all data is securely encrypted before processing.",
      icon: "🧠",
      path: "/diagnosis/input",
    },
    {
      id: 2,
      title: "Step 2 — Model Diagnosis",
      desc: "The trained model predicts Alzheimer’s Disease (AD) or Frontotemporal Dementia (FTD), providing a confidence score and explainable insights.",
      icon: "📊",
      path: "/diagnosis/result",
    },
    {
      id: 3,
      title: "Step 3 — Report History",
      desc: "View, download, or save your diagnosis reports with AI confidence metrics and EEG pattern highlights for medical validation.",
      icon: "📂",
      path: "/diagnosis/report-history",
    },
  ];

  return (
    <div className="diagnosis-main-page">
      <header className="diagnosis-header">
        <h2>🧩 NeuroCare AI — Diagnosis Intelligence</h2>
        <p className="section-subtext">
          Our AI-powered EEG diagnosis module helps clinicians and researchers detect early signs of 
          Alzheimer’s Disease (AD) and Frontotemporal Dementia (FTD) using deep learning.
        </p>
      </header>

      <div className="diagnosis-flow">
        {steps.map((step, i) => (
          <div key={i} className="flow-step" onClick={() => navigate(step.path)}>
            <div className="icon">{step.icon}</div>
            <div className="flow-content">
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
              <button className="btn flow-btn" onClick={() => navigate(step.path)}>
                Go to {step.title.split("—")[1]}
              </button>
            </div>
            {i < steps.length - 1 && <div className="flow-arrow">↓</div>}
          </div>
        ))}
      </div>

      <div className="diagnosis-cta">
        <h3>Ready to begin your diagnosis?</h3>
        <p>
          Upload your EEG data or select symptoms to start the AI-powered prediction process.
          All results are private and securely stored.
        </p>
        <button className="btn start-btn" onClick={() => navigate("/diagnosis/input")}>
          Start Diagnosis
        </button>
      </div>
    </div>
  );
}

export default Diagnosis;