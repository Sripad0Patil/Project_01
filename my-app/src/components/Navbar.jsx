import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaMoon, FaSun, FaBars, FaUserCircle, FaCog, FaSignOutAlt } from 'react-icons/fa';
import Logo from './Logo';
import "./Navbar.css";

const Navbar = ({ isDarkMode, toggleTheme, toggleSidebar, isSidebarOpen }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    // Clear any stored user data or tokens
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Close the dropdown
    setIsDropdownOpen(false);
    
    // Redirect to auth page
    navigate('/auth');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button 
          className={`menu-button ${isSidebarOpen ? 'active' : ''}`} 
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <FaBars />
        </button>
        <Link to="/" className="logo">
          <Logo className="logo-svg" />
          <span>SecureBank</span>
        </Link>
      </div>

      <div className="navbar-right">
        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <FaSun /> : <FaMoon />}
        </button>
        
        <div className="user-menu" ref={dropdownRef}>
          <button 
            className={`user-button ${isDropdownOpen ? 'active' : ''}`}
            onClick={toggleDropdown}
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
          >
            <FaUserCircle />
            <span>Account</span>
          </button>
          <div className={`user-dropdown ${isDropdownOpen ? 'show' : ''}`}>
            <Link to="/profile" onClick={() => setIsDropdownOpen(false)}>
              <FaUserCircle />
              <span>Profile</span>
            </Link>
            <Link to="/settings" onClick={() => setIsDropdownOpen(false)}>
              <FaCog />
              <span>Settings</span>
            </Link>
            <button 
              className="logout-button"
              onClick={handleLogout}
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
