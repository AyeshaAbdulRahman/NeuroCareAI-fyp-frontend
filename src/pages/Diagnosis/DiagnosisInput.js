// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./Diagnosis.css";
// import userService from "../../api/userService";

// const API_URL = "http://127.0.0.1:5000/api/predict";

// function DiagnosisInput() {
//   const navigate = useNavigate();
//   const [fileX,      setFileX]      = useState(null);
//   const [fileY,      setFileY]      = useState(null);
//   const [fileGroups, setFileGroups] = useState(null);
//   const [loading,    setLoading]    = useState(false);
//   const [error,      setError]      = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     if (!fileX || !fileY || !fileGroups) {
//       setError("Please upload all three files: features (X), labels (y), and groups.");
//       return;
//     }

//     setLoading(true);

//     try {
//       await userService.logActivity({
//         activity_type: "diagnosis_submission",
//         description: `Diagnosis submitted: ${fileX.name} + ${fileY.name} + ${fileGroups.name}`,
//       });
//     } catch (err) {
//       console.error("Failed to log activity:", err);
//     }

//     try {
//       const formData = new FormData();
//       formData.append("file_X",      fileX);
//       formData.append("file_y",      fileY);
//       formData.append("file_groups", fileGroups);

//       const res  = await fetch(API_URL, { method: "POST", body: formData });
//       const data = await res.json();

//       if (!res.ok) throw new Error(data.error || "Prediction failed.");

//       navigate("/diagnosis/result", { state: { results: data } });
//     } catch (err) {
//       setError(err.message);
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="diagnosis-container">
//       <h2>🧠 AI Diagnosis Input</h2>
//       <p className="section-subtext">
//         Upload your EEG feature file, labels file, and groups file to run the full classification pipeline.
//       </p>

//       <form onSubmit={handleSubmit} className="diagnosis-form">

//         <div className="upload-section">
//           <label>
//             Features File — X_features_deeplearning.npy &nbsp;
//             <span style={{ color: "#a78bfa" }}>(shape N×6)</span>
//           </label>
//           <input
//             type="file"
//             accept=".npy"
//             onChange={(e) => { setFileX(e.target.files[0]); setError(""); }}
//           />
//           {fileX && (
//             <p style={{ color: "#a78bfa", marginTop: "0.4rem", fontSize: "0.85rem" }}>
//               ✓ {fileX.name}
//             </p>
//           )}
//         </div>

//         <div className="upload-section">
//           <label>
//             Labels File — y_labels_deeplearning.npy &nbsp;
//             <span style={{ color: "#a78bfa" }}>(0=AD, 1=CN, 2=FTD)</span>
//           </label>
//           <input
//             type="file"
//             accept=".npy"
//             onChange={(e) => { setFileY(e.target.files[0]); setError(""); }}
//           />
//           {fileY && (
//             <p style={{ color: "#a78bfa", marginTop: "0.4rem", fontSize: "0.85rem" }}>
//               ✓ {fileY.name}
//             </p>
//           )}
//         </div>

//         <div className="upload-section">
//           <label>
//             Groups File — groups_deeplearning.npy &nbsp;
//             <span style={{ color: "#a78bfa" }}>(subject IDs — ensures same split as training)</span>
//           </label>
//           <input
//             type="file"
//             accept=".npy"
//             onChange={(e) => { setFileGroups(e.target.files[0]); setError(""); }}
//           />
//           {fileGroups && (
//             <p style={{ color: "#a78bfa", marginTop: "0.4rem", fontSize: "0.85rem" }}>
//               ✓ {fileGroups.name}
//             </p>
//           )}
//         </div>

//         {error && (
//           <p style={{ color: "#f87171", marginBottom: "1rem" }}>⚠ {error}</p>
//         )}

//         <button className="btn" type="submit" disabled={loading}>
//           {loading ? "Running Pipeline..." : "Submit for Diagnosis"}
//         </button>

//         <p className="note">
//           🔒 Data is encrypted and securely processed via our AI engine.
//         </p>
//       </form>
//     </div>
//   );
// }

// export default DiagnosisInput;



import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Diagnosis.css";

/* ─── tiny helpers ─────────────────────────────────────────────────────────── */
function FileDropZone({ label, accept, file, onChange }) {
  const ref = useRef();
  return (
    <div
      className="drop-zone"
      onClick={() => ref.current.click()}
      onDragOver={e => e.preventDefault()}
      onDrop={e => { e.preventDefault(); onChange(e.dataTransfer.files[0]); }}
    >
      <input
        ref={ref} type="file" accept={accept} style={{ display: "none" }}
        onChange={e => onChange(e.target.files[0])}
      />
      <span className="drop-label">{label}</span>
      {file
        ? <span className="drop-file">✓ {file.name}</span>
        : <span className="drop-hint">Click or drag & drop</span>}
    </div>
  );
}

/* ─── main component ───────────────────────────────────────────────────────── */
export default function DiagnosisInput() {
  const navigate = useNavigate();

  /* mode: "batch" | "single" */
  const [mode, setMode] = useState("batch");

  /* batch state */
  const [fileX,      setFileX]      = useState(null);
  const [fileY,      setFileY]      = useState(null);
  const [fileGroups, setFileGroups] = useState(null);

  /* single-patient state */
  const [fileSet, setFileSet] = useState(null);

  /* shared */
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  /* ── batch submit ──────────────────────────────────────────────────────── */
  async function handleBatchSubmit() {
    if (!fileX || !fileY || !fileGroups) {
      setError("Please upload all three .npy files.");
      return;
    }
    setError("");
    setLoading(true);

    const fd = new FormData();
    fd.append("file_X",      fileX);
    fd.append("file_y",      fileY);
    fd.append("file_groups", fileGroups);

    try {
      const res  = await fetch("/api/predict", { method: "POST", headers: authHeaders(), body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Prediction failed");
      navigate("/diagnosis/result", {
        state: {
          results: {
            ...data,
            mode: "batch",
            source_files: [fileX.name, fileY.name, fileGroups.name],
          },
        },
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  /* ── single-patient submit ─────────────────────────────────────────────── */
  async function handleSingleSubmit() {
    if (!fileSet) {
      setError("Please upload a .set EEG file.");
      return;
    }
    setError("");
    setLoading(true);

    const fd = new FormData();
    fd.append("file_set", fileSet);

    try {
      const res  = await fetch("/api/predict/single", { method: "POST", headers: authHeaders(), body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Inference failed");
      navigate("/diagnosis/result", {
        state: {
          results: {
            ...data,
            mode: "single",
            source_file: fileSet.name,
          },
        },
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  /* ── render ────────────────────────────────────────────────────────────── */
  return (
    <div className="diagnosis-container">
      <h2>🧠 EEG Dementia Diagnosis</h2>
      <p className="section-subtext">
        Upload pre-processed feature files for batch evaluation, or upload a
        single patient EEG recording for instant diagnosis.
      </p>

      {/* ── mode toggle ── */}
      <div className="mode-toggle">
        <button
          className={`mode-btn ${mode === "batch" ? "active" : ""}`}
          onClick={() => { setMode("batch"); setError(""); }}
        >
          📦 Batch Inference
        </button>
        <button
          className={`mode-btn ${mode === "single" ? "active" : ""}`}
          onClick={() => { setMode("single"); setError(""); }}
        >
          🔬 Single Patient
        </button>
      </div>

      {/* ── batch panel ── */}
      {mode === "batch" && (
        <div className="result-card" style={{ maxWidth: 520 }}>
          <h3>Upload Pre-processed Features</h3>
          <p className="section-subtext" style={{ marginBottom: "1.4rem" }}>
            Task 2 — (AD+FTD) vs CN &nbsp;|&nbsp; Expects group-aware 80/10/10 split
          </p>

          <FileDropZone
            label="Feature matrix  X.npy  (N × 6)"
            accept=".npy"
            file={fileX}
            onChange={setFileX}
          />
          <FileDropZone
            label="Labels  y.npy  (N,)  — 0=AD, 1=CN, 2=FTD"
            accept=".npy"
            file={fileY}
            onChange={setFileY}
          />
          <FileDropZone
            label="Groups  groups.npy  (N,)  — subject IDs"
            accept=".npy"
            file={fileGroups}
            onChange={setFileGroups}
          />

          {error && <p className="error-text">{error}</p>}

          <button
            className="btn"
            style={{ marginTop: "1.4rem", width: "100%" }}
            onClick={handleBatchSubmit}
            disabled={loading}
          >
            {loading ? "Running pipeline…" : "Run Batch Diagnosis"}
          </button>
        </div>
      )}

      {/* ── single-patient panel ── */}
      {mode === "single" && (
        <div className="result-card" style={{ maxWidth: 520 }}>
          <h3>Upload Patient EEG Recording</h3>
          <p className="section-subtext" style={{ marginBottom: "1.4rem" }}>
            Raw EEGLAB .set file &nbsp;|&nbsp; Preprocessing runs server-side
            (bandpass → ASR → ICA → RBP → Predict Dementia)
          </p>

          <FileDropZone
            label="EEG file  *_task-eyesclosed_eeg.set"
            accept=".set"
            file={fileSet}
            onChange={setFileSet}
          />

          <div className="info-box" style={{ marginTop: "1rem" }}>
            <span>⏱</span>
            <span>
              Processing typically takes <strong>2–5 minutes</strong> depending
              on recording length. Do not close this tab.
            </span>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button
            className="btn"
            style={{ marginTop: "1.4rem", width: "100%" }}
            onClick={handleSingleSubmit}
            disabled={loading}
          >
            {loading
              ? <span className="spinner-label">⏳ Processing EEG…</span>
              : "Run Single Patient Diagnosis"}
          </button>
        </div>
      )}
    </div>
  );
}
