import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Styles/Home.css";

function Home({ isLoggedIn }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Smooth scroll from Navbar (Features / Contact)
  useEffect(() => {
    if (location.state?.scrollTo) {
      const section = document.getElementById(location.state.scrollTo);
      if (section)
        setTimeout(() => section.scrollIntoView({ behavior: "smooth" }), 400);
    }
  }, [location]);

  // Counter Animation
  useEffect(() => {
    const animateValue = (id, start, end, duration, suffix = "") => {
      const obj = document.getElementById(id);
      if (!obj) return;
      let startTime = null;
      const step = (time) => {
        if (!startTime) startTime = time;
        const progress = Math.min((time - startTime) / duration, 1);
        obj.textContent =
          Math.floor(progress * (end - start) + start) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    animateValue("patients", 0, 1500, 2000, "+");
    animateValue("accuracy", 0, 97, 2000, "%");
    animateValue("caregivers", 0, 920, 2000, "+");
    animateValue("reports", 0, 410, 2000, "+");
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <h2>Empowering Neurodegenerative Care with Intelligence</h2>
        <p>
          NeuroCare AI combines EEG-based diagnosis with an intelligent caregiver
          assistant to enhance early detection, simplify patient management, and
          bring transparency to AI healthcare.
        </p>

        {/*  Hide button when user is logged in */}
        {!isLoggedIn && (
          <button className="btn" onClick={() => navigate("/signup")}>
            Get Started
          </button>
        )}
      </section>

      {/* Features */}
      <section id="features">
        <h2>Our Key Features</h2>
        <p className="section-subtext">
          Built on cutting-edge deep learning and NLP, NeuroCare AI delivers
          precision diagnosis, empathetic caregiver support, and data-driven
          transparency.
        </p>
        <div className="features">
          {[
            {
              img: "https://cdn-icons-png.flaticon.com/512/3063/3063825.png",
              title: "AI Diagnosis",
              text: "Upload EEG signals for AI-based detection of Alzheimer's and FTD, using CNN-LSTM models with visual confidence metrics.",
            },
            {
              img: "https://cdn-icons-png.flaticon.com/512/4712/4712139.png",
              title: "Caregiver Assistant",
              text: "Interactive RAG-based chatbot provides clinical guidance, emotional support, and WHO-validated caregiving resources for patient care.",
            },
            {
              img: "https://cdn-icons-png.flaticon.com/512/1828/1828884.png",
              title: "Reports & Insights",
              text: "Visual dashboards track patient progress, diagnosis confidence, and system performance to ensure data transparency and accuracy.",
            },
            {
              img: "https://cdn-icons-png.flaticon.com/512/484/484167.png",
              title: "Data Security & Privacy",
              text: "End-to-end encryption and strict access control ensure medical data remains protected and compliant with global healthcare standards.",
            },
            {
              img: "https://cdn-icons-png.flaticon.com/512/3209/3209987.png",
              title: "Intelligent Diagnosis Engine",
              text: "Utilizes deep CNN-LSTM models to detect Alzheimer's and FTD from EEG signals, providing confidence-based predictions and visual interpretation.",
            },
            {
              img: "https://cdn-icons-png.flaticon.com/512/4072/4072584.png",
              title: "Caregiver Training & Education",
              text: "Provides an integrated library of WHO-based caregiving manuals, AI explainers, and personalized learning paths to empower caregivers.",
            },
          ].map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-img">
                <img
                  src={f.img}
                  alt={f.title}
                  style={
                    f.title === "Data Security & Privacy"
                      ? { filter: "brightness(0) invert(1)" }
                      : {}
                  }
                />
              </div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Chatbot Demo */}
      <section className="chatbot-demo">
        <h2>Try Our Caregiver Chatbot</h2>
        <p className="section-subtext">
          Preview how our AI assistant interacts with caregivers and patients to
          provide real-time guidance.
        </p>
        <div className="chatbot-box">
          <div className="chat-message user">
            Hi, I'm worried about my patient's memory loss.
          </div>
          <div className="chat-message bot">
            I understand your concern. Would you like some cognitive exercise
            suggestions?
          </div>
          <div className="chat-message user">Yes please.</div>
          <div className="chat-message bot">
            Start with simple recall activities and daily memory games to
            strengthen retention.
          </div>
        </div>

        {/* ✅ Explore Chatbot button changes based on login */}
        <button
          className="btn"
          onClick={() => navigate(isLoggedIn ? "/chatbot" : "/signup")}
        >
          Explore Chatbot
        </button>
      </section>

      {/* Contact */}
      <section id="contact" className="contact">
        <h2>Contact Us</h2>
        <p className="section-subtext">
          We're here to collaborate with researchers, hospitals, and caregivers
          to advance AI-based neuro-healthcare solutions.
        </p>
        <div className="contact-wrapper">
          <div className="contact-info">
            <h3>Reach Us</h3>
            <p>
              <strong>Email:</strong> neurocareai@gmail.com
            </p>
            <p>
              <strong>Phone:</strong> +92 300 1234567
            </p>
            <p>
              <strong>Location:</strong> Karachi, Pakistan
            </p>
            <p>
              Partner with us for AI-driven diagnosis research and clinical
              implementations.
            </p>
          </div>
          <form onSubmit={(e) => e.preventDefault()}>
            <input type="text" name="name" placeholder="Your Name" required />
            <input type="email" name="email" placeholder="Your Email" required />
            <textarea
              name="message"
              placeholder="Your Message"
              required
            ></textarea>
            <button type="submit" className="btn">
              Send Message
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

export default Home;
