import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Footer() {
  const navigate = useNavigate();

  // ✅ Reuse the smooth scroll behavior (like Navbar)
  const handleScroll = (id) => {
    if (window.location.pathname !== "/") {
      navigate("/", { state: { scrollTo: id } });
    } else {
      const section = document.getElementById(id);
      if (section) section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer>
      <div className="footer-section">
        <h4>Quick Links</h4>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <button onClick={() => handleScroll("features")} className="footer-btn-link">
          Features
        </button>
        <button onClick={() => handleScroll("contact")} className="footer-btn-link">
          Contact
        </button>
      </div>

      <div className="footer-section">
        <h4>Resources</h4>
        <a href="/reports">Reports</a>
        <a href="/library">Resource Library</a>
        <a href="/faq">FAQ</a>
      </div>

      <div className="footer-section">
        <h4>Contact</h4>
        <a href="mailto:neurocareai@gmail.com">neurocareai@gmail.com</a>
        <a href="#">LinkedIn</a>
        <a href="#">GitHub</a>
      </div>

      <div className="footer-bottom">
        © 2025 <span>NeuroCare AI</span> — Empowering the Future of Neurodegenerative Care
      </div>
    </footer>
  );
}

export default Footer;
