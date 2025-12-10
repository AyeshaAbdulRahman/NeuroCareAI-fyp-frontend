import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Diagnosis.css";

function DiagnosisInput() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(false);

  const symptomList = [
    "Memory loss",
    "Confusion",
    "Language difficulty",
    "Personality changes",
  ];

  const handleSymptomToggle = (symptom) => {
    setSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file && symptoms.length === 0) {
      alert("Please upload an EEG file or select symptoms.");
      return;
    }
    setLoading(true);
    setTimeout(() => navigate("/diagnosis/preprocess"), 1500);
  };

  return (
    <div className="diagnosis-container">
      <h2>🧠 AI Diagnosis Input</h2>
      <p className="section-subtext">
        Upload EEG data or select symptoms for Alzheimer’s / FTD detection.
      </p>

      <form onSubmit={handleSubmit} className="diagnosis-form">
        <div className="upload-section">
          <label>Upload EEG File (.edf, .csv, .mat)</label>
          <input
            type="file"
            accept=".edf,.csv,.mat"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        <div className="symptom-section">
          <label>Select Symptoms (optional)</label>
          <div className="symptom-list">
            {symptomList.map((symptom, i) => (
              <div
                key={i}
                className={`symptom-item ${
                  symptoms.includes(symptom) ? "active" : ""
                }`}
                onClick={() => handleSymptomToggle(symptom)}
              >
                {symptom}
              </div>
            ))}
          </div>
        </div>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Processing..." : "Submit for Diagnosis"}
        </button>

        <p className="note">
          🔒 Data is encrypted and securely processed via our AI engine.
        </p>
      </form>
    </div>
  );
}

export default DiagnosisInput;
