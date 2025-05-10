import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import './Dashboard.css';

function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-theme');
  };

  return (
    <div className={`bg-gray-50 min-h-screen flex flex-col ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Navbar 
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />
      <div className="app-container">
        <Sidebar isOpen={isSidebarOpen} />
        <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="dashboard">
            <div className="dashboard-header">
              <h1>Dashboard</h1>
              <p>Welcome to your banking dashboard</p>
            </div>
            
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>Account Summary</h3>
                <div className="card-content">
                  <p>Total Balance: ₹50,000</p>
                  <p>Account Number: XXXX-XXXX-1234</p>
                </div>
              </div>

              <div className="dashboard-card">
                <h3>Quick Actions</h3>
                <div className="card-content">
                  <button className="action-button">View Statement</button>
                  <button className="action-button">Transfer Money</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default Dashboard; 