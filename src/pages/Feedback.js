import React, { useState } from "react";
import "./Styles/Feedback.css";

function Feedback() {
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (feedback.trim()) setSubmitted(true);
  };

  return (
    <section className="feedback-page">
      <h2>Send Feedback</h2>
      <p className="section-subtext">
        We value your thoughts. Help us make <strong>NeuroCare AI</strong> even better by sharing your feedback.
      </p>

      {!submitted ? (
        <form className="feedback-form" onSubmit={handleSubmit}>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your thoughts, suggestions, or experiences..."
            required
          ></textarea>
          <button type="submit" className="btn">Submit Feedback</button>
        </form>
      ) : (
        <div className="thank-you-box">
          <i className="bi bi-check-circle-fill"></i>
          <h3>Thank you for your feedback!</h3>
          <p>We appreciate your time and effort in helping us improve NeuroCare AI.</p>
        </div>
      )}
    </section>
  );
}

export default Feedback;
