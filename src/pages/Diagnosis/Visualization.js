import React from "react";
import "./Diagnosis.css";

function Visualization() {
  return (
    <div className="visualization-page">
      <h2>📊 EEG Visualization & Analytics</h2>
      <p className="section-subtext">
        Explore EEG signal patterns, model confidence, and explainable AI insights.
      </p>

      <div className="visualization-grid">
        <div className="visual-card">
          <h3>EEG Waveform</h3>
          <div className="placeholder-chart">[ EEG Wave Plot Here ]</div>
        </div>
        <div className="visual-card">
          <h3>Model Accuracy</h3>
          <div className="placeholder-chart">[ Accuracy / Confusion Matrix ]</div>
        </div>
        <div className="visual-card">
          <h3>Feature Importance</h3>
          <div className="placeholder-chart">[ XAI Visualization ]</div>
        </div>
      </div>
    </div>
  );
}

export default Visualization;
