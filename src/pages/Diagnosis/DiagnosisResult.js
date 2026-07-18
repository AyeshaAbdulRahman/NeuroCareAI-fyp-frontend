// import React from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import "./Diagnosis.css";

// function DiagnosisResult() {
//   const { state } = useLocation();
//   const navigate  = useNavigate();
//   const r         = state?.results;

//   if (!r) {
//     return (
//       <div className="diagnosis-container">
//         <h2>📊 Diagnosis Result</h2>
//         <p className="section-subtext">No results found. Please run a diagnosis first.</p>
//         <button className="btn" onClick={() => navigate("/diagnosis/input")}>Go to Input</button>
//       </div>
//     );
//   }

//   const cellStyle = {
//     padding: "0.75rem 1.2rem",
//     borderBottom: "1px solid rgba(255,255,255,0.07)",
//     textAlign: "right",
//   };
//   const labelCell = { ...cellStyle, textAlign: "left", fontWeight: 600 };
//   const headCell  = {
//     padding: "0.6rem 1.2rem",
//     color: "var(--secondary)",
//     fontSize: "0.78rem",
//     textTransform: "uppercase",
//     letterSpacing: "0.07em",
//     textAlign: "right",
//     borderBottom: "1px solid rgba(255,255,255,0.12)",
//   };

//   return (
//     <div className="diagnosis-container">
//       <h2>📊 Diagnosis Result</h2>
//       <p className="section-subtext">
//         Task: AD+FTD vs CN &nbsp;|&nbsp; Test samples: {r.n_test_samples}
//       </p>

//       {/* ── Classification Report Table ── */}
//       <div className="result-card" style={{ maxWidth: 680, overflowX: "auto" }}>
//         <h3 style={{ marginBottom: "1.2rem", textAlign: "left" }}>Classification Report</h3>

//         <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.93rem" }}>
//           <thead>
//             <tr>
//               {["Class", "Precision", "Recall", "F1-Score", "Support"].map(h => (
//                 <th key={h} style={{ ...headCell, textAlign: h === "Class" ? "left" : "right" }}>{h}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {/* Per-class rows */}
//             {r.class_report.map((row, i) => (
//               <tr key={i}>
//                 <td style={labelStyle(row.class)}>{row.class}</td>
//                 <td style={cellStyle}>{row.precision.toFixed(4)}</td>
//                 <td style={cellStyle}>{row.recall.toFixed(4)}</td>
//                 <td style={cellStyle}>{row.f1.toFixed(4)}</td>
//                 <td style={cellStyle}>{row.support}</td>
//               </tr>
//             ))}

//             {/* Spacer */}
//             <tr><td colSpan={5} style={{ padding: "0.3rem" }} /></tr>

//             {/* Accuracy */}
//             <tr>
//               <td style={{ ...labelCell, color: "#e2e8f0" }}>accuracy</td>
//               <td style={cellStyle} />
//               <td style={cellStyle} />
//               <td style={{ ...cellStyle, fontWeight: 600, color: "#a78bfa" }}>
//                 {r.accuracy.toFixed(4)}
//               </td>
//               <td style={cellStyle}>{r.n_test_samples}</td>
//             </tr>

//             {/* Macro avg */}
//             <tr>
//               <td style={{ ...labelCell, color: "#94a3b8" }}>macro avg</td>
//               <td style={cellStyle}>{r.macro_avg.precision.toFixed(4)}</td>
//               <td style={cellStyle}>{r.macro_avg.recall.toFixed(4)}</td>
//               <td style={cellStyle}>{r.macro_avg.f1.toFixed(4)}</td>
//               <td style={cellStyle}>{r.n_test_samples}</td>
//             </tr>

//             {/* Weighted avg */}
//             <tr>
//               <td style={{ ...labelCell, color: "#94a3b8" }}>weighted avg</td>
//               <td style={cellStyle}>{r.weighted_avg.precision.toFixed(4)}</td>
//               <td style={cellStyle}>{r.weighted_avg.recall.toFixed(4)}</td>
//               <td style={cellStyle}>{r.weighted_avg.f1.toFixed(4)}</td>
//               <td style={{ ...cellStyle, borderBottom: "none" }}>{r.n_test_samples}</td>
//             </tr>
//           </tbody>
//         </table>
//       </div>

//       {/* ── Confusion Matrix ── */}
//       <div className="result-card" style={{ maxWidth: 400, marginTop: "1.5rem" }}>
//         <h3 style={{ marginBottom: "1.2rem", textAlign: "left" }}>Confusion Matrix</h3>
//         <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", fontSize: "0.93rem" }}>
//           <thead>
//             <tr>
//               <th style={{ ...headCell, textAlign: "center" }}></th>
//               {r.target_names.map(n => (
//                 <th key={n} style={{ ...headCell, textAlign: "center" }}>Pred {n}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {r.confusion_matrix.map((row, i) => (
//               <tr key={i}>
//                 <td style={{ ...labelCell, color: "#94a3b8", fontSize: "0.82rem" }}>
//                   True {r.target_names[i]}
//                 </td>
//                 {row.map((val, j) => (
//                   <td key={j} style={{
//                     ...cellStyle,
//                     textAlign: "center",
//                     fontWeight: i === j ? 700 : 400,
//                     color: i === j ? "#34d399" : "#f87171",
//                     fontSize: "1rem",
//                   }}>
//                     {val}
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       <div className="result-buttons">
//         <button className="btn btn-small" onClick={() => navigate("/diagnosis/input")}>
//           New Diagnosis
//         </button>
//         <button className="btn btn-small" onClick={() => navigate("/diagnosis/report-history")}>
//           View Reports
//         </button>
//       </div>
//     </div>
//   );
// }

// function labelStyle(cls) {
//   return {
//     padding: "0.75rem 1.2rem",
//     borderBottom: "1px solid rgba(255,255,255,0.07)",
//     textAlign: "left",
//     fontWeight: 600,
//     color: cls === "CN" ? "#34d399" : "#f87171",
//   };
// }

// export default DiagnosisResult;




import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Diagnosis.css";

/* ─── shared cell styles ───────────────────────────────────────────────────── */
const cell  = { padding: "0.75rem 1.2rem", borderBottom: "1px solid rgba(255,255,255,0.07)", textAlign: "right" };
const label = { ...cell, textAlign: "left", fontWeight: 600 };
const head  = { padding: "0.6rem 1.2rem", color: "var(--secondary)", fontSize: "0.78rem",
                textTransform: "uppercase", letterSpacing: "0.07em",
                textAlign: "right", borderBottom: "1px solid rgba(255,255,255,0.12)" };

function classCellColor(cls) {
  return { ...label, color: cls === "CN" ? "#34d399" : "#f87171" };
}

/* ══════════════════════════════════════════════════════════════════════════════
   BATCH RESULT  — existing classification report + confusion matrix layout
══════════════════════════════════════════════════════════════════════════════ */
function BatchResult({ r }) {
  return (
    <>
      {/* Classification Report */}
      <div className="result-card" style={{ maxWidth: 680, overflowX: "auto" }}>
        <h3 style={{ marginBottom: "1.2rem" }}>Classification Report</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.93rem" }}>
          <thead>
            <tr>
              {["Class","Precision","Recall","F1-Score","Support"].map(h => (
                <th key={h} style={{ ...head, textAlign: h === "Class" ? "left" : "right" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {r.class_report.map((row, i) => (
              <tr key={i}>
                <td style={classCellColor(row.class)}>{row.class}</td>
                <td style={cell}>{row.precision.toFixed(4)}</td>
                <td style={cell}>{row.recall.toFixed(4)}</td>
                <td style={cell}>{row.f1.toFixed(4)}</td>
                <td style={cell}>{row.support}</td>
              </tr>
            ))}
            <tr><td colSpan={5} style={{ padding: "0.3rem" }} /></tr>
            <tr>
              <td style={{ ...label, color: "#e2e8f0" }}>accuracy</td>
              <td style={cell} /><td style={cell} />
              <td style={{ ...cell, fontWeight: 600, color: "#a78bfa" }}>{r.accuracy.toFixed(4)}</td>
              <td style={cell}>{r.n_test_samples}</td>
            </tr>
            <tr>
              <td style={{ ...label, color: "#94a3b8" }}>macro avg</td>
              <td style={cell}>{r.macro_avg.precision.toFixed(4)}</td>
              <td style={cell}>{r.macro_avg.recall.toFixed(4)}</td>
              <td style={cell}>{r.macro_avg.f1.toFixed(4)}</td>
              <td style={cell}>{r.n_test_samples}</td>
            </tr>
            <tr>
              <td style={{ ...label, color: "#94a3b8" }}>weighted avg</td>
              <td style={cell}>{r.weighted_avg.precision.toFixed(4)}</td>
              <td style={cell}>{r.weighted_avg.recall.toFixed(4)}</td>
              <td style={cell}>{r.weighted_avg.f1.toFixed(4)}</td>
              <td style={{ ...cell, borderBottom: "none" }}>{r.n_test_samples}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Confusion Matrix */}
      <div className="result-card" style={{ maxWidth: 400, marginTop: "1.5rem" }}>
        <h3 style={{ marginBottom: "1.2rem" }}>Confusion Matrix</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", fontSize: "0.93rem" }}>
          <thead>
            <tr>
              <th style={{ ...head, textAlign: "center" }}></th>
              {r.target_names.map(n => (
                <th key={n} style={{ ...head, textAlign: "center" }}>Pred {n}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {r.confusion_matrix.map((row, i) => (
              <tr key={i}>
                <td style={{ ...label, color: "#94a3b8", fontSize: "0.82rem" }}>True {r.target_names[i]}</td>
                {row.map((val, j) => (
                  <td key={j} style={{ ...cell, textAlign: "center",
                    fontWeight: i === j ? 700 : 400,
                    color: i === j ? "#34d399" : "#f87171", fontSize: "1rem" }}>
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   SINGLE-PATIENT RESULT
══════════════════════════════════════════════════════════════════════════════ */
function VerdictBadge({ verdict, prob }) {
  const isDem  = verdict === "DEMENTIA DETECTED";
  const color  = isDem ? "#f87171" : "#34d399";
  const bg     = isDem ? "rgba(248,113,113,0.1)" : "rgba(52,211,153,0.1)";
  const border = isDem ? "rgba(248,113,113,0.3)" : "rgba(52,211,153,0.3)";
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem",
                  padding: "0.8rem 1.4rem", borderRadius: 10,
                  background: bg, border: `1px solid ${border}`, marginBottom: "1.2rem" }}>
      <span style={{ fontSize: "1.5rem" }}>{isDem ? "⚠️" : "✅"}</span>
      <div>
        <div style={{ fontWeight: 700, fontSize: "1.05rem", color }}>{verdict}</div>
        <div style={{ fontSize: "0.82rem", color: "#94a3b8", marginTop: 2 }}>
          Dementia probability: <strong style={{ color }}>{prob.toFixed(1)}%</strong>
        </div>
      </div>
    </div>
  );
}

function TierPill({ tier }) {
  const colors = { "HIGH": "#f87171", "MODERATE": "#fb923c", "LOW": "#facc15", "VERY LOW": "#34d399" };
  const c = colors[tier] || "#94a3b8";
  return (
    <span style={{ background: `${c}22`, color: c, border: `1px solid ${c}66`,
                   borderRadius: 999, padding: "0.2rem 0.75rem", fontSize: "0.78rem", fontWeight: 700 }}>
      {tier}
    </span>
  );
}

function BandBar({ name, value }) {
  const pct = Math.min(value * 200 * 100, 100);
  return (
    <div style={{ marginBottom: "0.55rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between",
                    fontSize: "0.82rem", marginBottom: 3 }}>
        <span style={{ color: "#94a3b8" }}>{name}</span>
        <span style={{ color: "#e2e8f0" }}>{value.toFixed(4)}</span>
      </div>
      <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 6 }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 4,
                      background: "var(--secondary, #a78bfa)" }} />
      </div>
    </div>
  );
}

function SingleResult({ r }) {
  const ens  = r.ensemble;
  const t2   = r.tasks?.task2;

  return (
    <>
      {/* Verdict card */}
      <div className="result-card" style={{ maxWidth: 580 }}>
        <h3 style={{ marginBottom: "1rem" }}>Ensemble Verdict</h3>
        <VerdictBadge verdict={ens.verdict} prob={ens.avg_dementia_prob} />

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", marginTop: "0.5rem" }}>
          <tbody>
            <tr>
              <td style={label}>Subject</td>
              <td style={{ ...cell, color: "#e2e8f0" }}>{r.subject}</td>
            </tr>
            <tr>
              <td style={label}>Epochs analysed</td>
              <td style={{ ...cell, color: "#e2e8f0" }}>{r.n_epochs}</td>
            </tr>
            <tr>
              <td style={label}>Confidence tier</td>
              <td style={cell}><TierPill tier={ens.confidence_tier} /></td>
            </tr>
            <tr>
              <td style={label}>Task votes (dem / total)</td>
              <td style={{ ...cell, color: "#e2e8f0" }}>
                {ens.dementia_votes} / {ens.total_tasks}
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: "1rem", padding: "0.8rem 1rem",
                      background: "rgba(255,255,255,0.04)", borderRadius: 8,
                      fontSize: "0.86rem", color: "#cbd5e1", lineHeight: 1.6 }}>
          💬 {ens.interpretation}
        </div>
      </div>

      {/* Task 2 detail */}
      {t2 && (
        <div className="result-card" style={{ maxWidth: 580, marginTop: "1.5rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>Diagnose:  Dementia Disease vs Healthy</h3>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <tbody>
              <tr>
                <td style={label}>Predicted label</td>
                <td style={{ ...cell, fontWeight: 700,
                  color: t2.predicted_label === "CN" ? "#34d399" : "#f87171" }}>
                  {t2.predicted_label === "CN" ? "Healthy" : "Dementia"}
                </td>
              </tr>
              <tr>
                <td style={label}>Confidence</td>
                <td style={{ ...cell, color: "#a78bfa", fontWeight: 600 }}>
                  {t2.confidence.toFixed(2)}%
                </td>
              </tr>
              <tr>
                <td style={label}>Dementia probability</td>
                <td style={{ ...cell, color: "#f87171" }}>{t2.dementia_prob.toFixed(2)}%</td>
              </tr>
            </tbody>
          </table>

          {/* Epoch vote breakdown */}
          <div style={{ marginTop: "1.1rem" }}>
            <div style={{ fontSize: "0.78rem", color: "var(--secondary)", textTransform: "uppercase",
                          letterSpacing: "0.07em", marginBottom: "0.7rem" }}>Epoch votes</div>
            {Object.entries(t2.epoch_votes).map(([cls, votes]) => {
              const total = Object.values(t2.epoch_votes).reduce((a, b) => a + b, 0);
              const pct   = total ? (votes / total * 100) : 0;
              const color = cls === "CN" ? "#34d399" : "#f87171";
              return (
                <div key={cls} style={{ marginBottom: "0.55rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between",
                                fontSize: "0.82rem", marginBottom: 3 }}>
                    <span style={{ color }}>{cls}</span>
                    <span style={{ color: "#e2e8f0" }}>{votes} epochs ({pct.toFixed(1)}%)</span>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 6 }}>
                    <div style={{ width: `${pct}%`, height: "100%", borderRadius: 4, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mean class probabilities */}
          <div style={{ marginTop: "1.1rem" }}>
            <div style={{ fontSize: "0.78rem", color: "var(--secondary)", textTransform: "uppercase",
                          letterSpacing: "0.07em", marginBottom: "0.7rem" }}>Mean probabilities</div>
            {Object.entries(t2.mean_probs).map(([cls, prob]) => (
              <div key={cls} style={{ display: "flex", justifyContent: "space-between",
                                      fontSize: "0.86rem", padding: "0.3rem 0",
                                      borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ color: cls === "CN" ? "#34d399" : "#f87171" }}>{cls}</span>
                <span style={{ color: "#e2e8f0" }}>{prob.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Band powers */}
      {r.band_powers && (
        <div className="result-card" style={{ maxWidth: 580, marginTop: "1.5rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>Relative Band Powers</h3>
          {Object.entries(r.band_powers).map(([band, val]) => (
            <BandBar key={band} name={band} value={val} />
          ))}
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   ROOT COMPONENT
══════════════════════════════════════════════════════════════════════════════ */
export default function DiagnosisResult() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const r         = state?.results;

  if (!r) {
    return (
      <div className="diagnosis-container">
        <h2>📊 Diagnosis Result</h2>
        <p className="section-subtext">No results found. Please run a diagnosis first.</p>
        <button className="btn" onClick={() => navigate("/diagnosis/input")}>Go to Input</button>
      </div>
    );
  }

  const isSingle = r.mode === "single";

  return (
    <div className="diagnosis-container">
      <h2>📊 Diagnosis Result</h2>
      <p className="section-subtext">
        {isSingle
          ? <>Mode: Single Patient &nbsp;|&nbsp; Task: Dementia Disease vs Healthy</>
          : <>Mode: Batch Inference &nbsp;|&nbsp; Task: Disease vs Healthy &nbsp;|&nbsp; Test samples: {r.n_test_samples}</>}
      </p>

      {isSingle ? <SingleResult r={r} /> : <BatchResult r={r} />}

      <div className="result-buttons" style={{ marginTop: "2rem" }}>
        <button className="btn btn-small" onClick={() => navigate("/diagnosis/input")}>
          New Diagnosis
        </button>
        <button className="btn btn-small" onClick={() => navigate("/diagnosis/report-history")}>
          View Reports
        </button>
      </div>
    </div>
  );
}