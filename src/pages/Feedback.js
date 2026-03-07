import React, { useState } from "react";
import feedbackService from "../api/feedbackService";
import "./Styles/Feedback.css";

function Feedback() {
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      setError("Please enter your feedback");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await feedbackService.submitFeedback(feedback);
      
      if (response.success) {
        setSubmitted(true);
      } else {
        setError(response.message || "Failed to submit feedback");
      }
    } catch (err) {
      setError(err.message || "An error occurred while submitting feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="feedback-page">
      <h2>Send Feedback</h2>
      <p className="section-subtext">
        We value your thoughts. Help us make <strong>NeuroCare AI</strong> even better by sharing your feedback.
      </p>

      {error && <div className="error-message">{error}</div>}

      {!submitted ? (
        <form className="feedback-form" onSubmit={handleSubmit}>
          <textarea
            value={feedback}
            onChange={(e) => {
              setFeedback(e.target.value);
              setError("");
            }}
            placeholder="Share your thoughts, suggestions, or experiences..."
            required
          ></textarea>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      ) : (
        <div className="thank-you-box">
          <i className="bi bi-check-circle-fill"></i>
          <h3>Thank you for your feedback!</h3>
          <p>We appreciate your time and effort in helping us improve NeuroCare AI.</p>
          <button 
            className="btn" 
            onClick={() => {
              setSubmitted(false);
              setFeedback("");
            }}
          >
            Submit Another Feedback
          </button>
        </div>
      )}
    </section>
  );
}

export default Feedback;
