import React from "react";
import "./Diagnosis.css";

function ReportHistory() {
  const reports = [
    { date: "2025-10-18", file: "patient1.csv", disease: "Alzheimer’s", confidence: "92%", report: "Download" },
    { date: "2025-10-10", file: "patient2.csv", disease: "FTD", confidence: "88%", report: "Download" },
  ];

  return (
    <div className="report-history">
      <h2>📁 Diagnosis Report History</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Uploaded File</th>
            <th>Disease</th>
            <th>Confidence</th>
            <th>Report</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r, i) => (
            <tr key={i}>
              <td>{r.date}</td>
              <td>{r.file}</td>
              <td>{r.disease}</td>
              <td>{r.confidence}</td>
              <td><button className="btn btn-small">{r.report}</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="btn export-btn">Export All Reports</button>
    </div>
  );
}

export default ReportHistory;
