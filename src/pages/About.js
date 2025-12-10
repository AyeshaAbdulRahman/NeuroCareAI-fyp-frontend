import React from "react";
import "./Styles/About.css";

function About() {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <header>
        <h2>About NeuroCare AI</h2>
        <p>
          NeuroCare AI merges EEG-based diagnostic intelligence and AI-powered caregiver assistance
          to redefine dementia care through precision, empathy, and trust.
        </p>
      </header>

      {/* Mission Section */}
      <section>
        <h3>Our Mission</h3>
        <div className="card-section">
          <p>
            We aim to revolutionize neurological healthcare by enabling early detection of{" "}
            <strong>Alzheimer’s</strong> and <strong>Frontotemporal Dementia</strong> using
            EEG-based artificial intelligence models. Our integrated AI companion further supports
            caregivers and clinicians with educational and emotional tools.
          </p>
        </div>
      </section>

      {/* Technology Section */}
      <section>
        <h3>Our Core Technology</h3>
        <p>
          Our system integrates deep learning, natural language processing, and human-centered AI
          design to bring intelligent, transparent, and secure neuro-healthcare solutions.
        </p>

        <div className="tech-grid">
          <div className="tech-card">
            <h5>EEG Diagnosis Model</h5>
            <p>
              Processes and interprets EEG signals to identify Alzheimer’s and FTD patterns,
              delivering confidence-based predictions and clinically interpretable visual results.
            </p>
          </div>

          <div className="tech-card">
            <h5>Universal Caregiver Chatbot</h5>
            <p>
              RAG-based conversational agent offering cognitive-care recommendations,
              WHO-guided training, and emotional support for families and caregivers.
            </p>
          </div>

          <div className="tech-card">
            <h5>Secure Cloud Infrastructure</h5>
            <p>
              Protects patient EEG and diagnostic data through end-to-end encryption and
              healthcare-compliant privacy frameworks.
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section>
        <h3>Why Choose NeuroCare AI?</h3>
        <div className="card-section">
          <p>
            Because we believe that healthcare AI should never replace empathy — it should empower
            it. NeuroCare AI blends neuroscience, clinical data, and explainable AI to ensure every
            prediction supports informed, compassionate decision-making.
          </p>
        </div>
      </section>
    </div>
  );
}

export default About;
