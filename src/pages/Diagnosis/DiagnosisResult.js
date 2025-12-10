import React from "react";
import { useNavigate } from "react-router-dom";
import "./Diagnosis.css";

function DiagnosisResult() {
  const navigate = useNavigate();

  const result = {
    disease: "Alzheimer’s Disease",
    confidence: 92.8,
    insights:
      "AI detected abnormal EEG patterns indicating cognitive decline and reduced temporal lobe activity.",
  };

  return (
    <div className="diagnosis-result">
      <h2>🧩 Diagnosis Result</h2>

      <div className="result-card">
        <p><strong>Predicted Condition:</strong> {result.disease}</p>
        <p><strong>Confidence Score:</strong> {result.confidence}%</p>
        <div className="confidence-bar">
          <div
            className="bar-fill"
            style={{ width: `${result.confidence}%` }}
          ></div>
        </div>

        <p className="ai-insight">
          <strong>AI Insights:</strong> {result.insights}
        </p>

        <div className="result-buttons">
          <button className="btn">Download Report</button>
          <button className="btn" onClick={() => navigate("/diagnosis/input")}>
            Re-run Diagnosis
          </button>
          <button className="btn" onClick={() => navigate("/diagnosis/reports")}>
            View History
          </button>
        </div>
      </div>
    </div>
  );
}

export default DiagnosisResult;
