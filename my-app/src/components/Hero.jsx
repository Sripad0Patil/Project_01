import React from "react";
import "./Hero.css";
import { useNavigate } from "react-router-dom";  // Import useNavigate

function Hero() {
  const navigate = useNavigate();  // Call the hook inside your component

  return (
    <div className="hero">
      <div className="hero-content">
        <h1>Welcome to BankEase</h1>
        <p>Open accounts from any Indian national bank — all in one place.</p>
        <button onClick={() => navigate("/open-account")}>Open Account</button>
      </div>
    </div>
  );
}

export default Hero;
