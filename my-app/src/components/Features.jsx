import React from "react";
import "./Features.css";
import { FaUserPlus, FaShieldAlt, FaHeadset } from "react-icons/fa";

function Features() {
  return (
    <div className="features">
      <h2>Our Features</h2>
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">
            <FaUserPlus size={40} color="#0047ab" />
          </div>
          <h3>Easy Account Opening</h3>
          <p>Open your bank account in minutes with our streamlined process. No paperwork, no hassle - just a few simple steps to get started.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <FaShieldAlt size={40} color="#0047ab" />
          </div>
          <h3>Secure Banking</h3>
          <p>Your security is our top priority. We use advanced encryption and multi-factor authentication to keep your data safe.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <FaHeadset size={40} color="#0047ab" />
          </div>
          <h3>24/7 Support</h3>
          <p>Get help whenever you need it with our round-the-clock customer support. Our team is always ready to assist you.</p>
        </div>
      </div>
    </div>
  );
}

export default Features;
