import React, { useEffect, useMemo, useState } from "react";
import { reportService } from "../../api/reportService";
import "./Diagnosis.css";

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleString();
};

const formatConfidence = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "N/A";
  return `${(num <= 1 ? num * 100 : num).toFixed(2)}%`;
};

function ReportHistory() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDownloading, setBulkDownloading] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await reportService.getReports({ all: true });
      setReports(response?.reports || []);
    } catch (err) {
      setError(err?.message || "Failed to load report history");
    } finally {
      setLoading(false);
    }
  };

  const allSelected = useMemo(() => reports.length > 0 && selectedIds.length === reports.length, [reports, selectedIds]);

  const toggleSelected = (reportId) => {
    setSelectedIds((current) =>
      current.includes(reportId) ? current.filter((id) => id !== reportId) : [...current, reportId]
    );
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(reports.map((report) => report.id));
  };

  const handleSingleDownload = async (reportId) => {
    try {
      await reportService.downloadReport(reportId, "pdf");
    } catch (err) {
      setError(err?.message || "Failed to download report");
    }
  };

  const handleBulkDownload = async () => {
    if (!selectedIds.length) {
      setError("Select at least one report to download.");
      return;
    }
    try {
      setBulkDownloading(true);
      setError("");
      await reportService.downloadReports(selectedIds, "pdf");
    } catch (err) {
      setError(err?.message || "Failed to download selected reports");
    } finally {
      setBulkDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="report-history">
        <h2>📁 Diagnosis Report History</h2>
        <p className="section-subtext">Loading saved reports...</p>
      </div>
    );
  }

  return (
    <div className="report-history">
      <h2>📁 Diagnosis Report History</h2>
      <p className="section-subtext">
        Saved diagnosis reports from the backend. Select multiple reports to download them as a ZIP archive.
      </p>

      {error && <div className="error-message" style={{ marginBottom: "1rem" }}>{error}</div>}

      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <button className="btn btn-small" onClick={loadReports}>Refresh</button>
        <button className="btn btn-small" onClick={toggleAll} disabled={!reports.length}>
          {allSelected ? "Clear Selection" : "Select All"}
        </button>
        <button className="btn btn-small" onClick={handleBulkDownload} disabled={!selectedIds.length || bulkDownloading}>
          {bulkDownloading ? "Downloading..." : `Download Selected (${selectedIds.length})`}
        </button>
      </div>

      {!reports.length ? (
        <div className="result-card" style={{ maxWidth: 720 }}>
          <p>No saved reports yet. Run a diagnosis and use Save Report to add it here.</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>
                <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              </th>
              <th>Date</th>
              <th>Title</th>
              <th>Type</th>
              <th>Source File(s)</th>
              <th>Verdict</th>
              <th>Confidence</th>
              <th>Report</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(report.id)}
                    onChange={() => toggleSelected(report.id)}
                  />
                </td>
                <td>{formatDate(report.created_at)}</td>
                <td>{report.title}</td>
                <td>{report.report_type}</td>
                <td>{(report.source_files || []).join(", ") || "N/A"}</td>
                <td>{report.verdict || "N/A"}</td>
                <td>{formatConfidence(report.confidence)}</td>
                <td>
                  <button className="btn btn-small" onClick={() => handleSingleDownload(report.id)}>
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ReportHistory;
