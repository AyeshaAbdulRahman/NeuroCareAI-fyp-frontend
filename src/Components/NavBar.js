import React from "react";
import { Link, useNavigate } from "react-router-dom";

function NavBar({ isLoggedIn, setIsLoggedIn, user }) {
  const navigate = useNavigate();
  
  const handleScroll = (id) => {
    if (window.location.pathname !== "/") navigate("/", { state: { scrollTo: id } });
    else document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };
  
  const handleLogout = () => { 
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false); 
    navigate("/"); 
  };

  const isAdmin = user?.is_admin === true;

  return (
    <nav>
      <h1>NeuroCare<span>AI</span></h1>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><button onClick={() => handleScroll("features")} className="nav-btn-link">Features</button></li>
        <li><button onClick={() => handleScroll("contact")} className="nav-btn-link">Contact</button></li>
        {!isLoggedIn ? (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Sign Up</Link></li>
          </>
        ) : (
          <>
            {isAdmin && (
              <li><Link to="/admin"><i className="bi bi-speedometer2"></i> Admin</Link></li>
            )}
            <li><Link to="/chatbot"><i className="bi bi-chat"></i> Chat Bot</Link></li>
            <li><Link to="/diagnosis"><i className="bi bi-heart"></i> Diagnosis</Link></li>
            <li><Link to="/dashboard"><i className="bi bi-person"></i> Profile</Link></li>
            <li><button onClick={handleLogout} className="logout-btn"><i className="bi bi-box-arrow-right"></i> Logout</button></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default NavBar;
