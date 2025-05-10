import React, { useState } from 'react'
import Hero from '../components/Hero';
import Features from '../components/Features';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import './Home.css';

function Home() {
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
        <div className={`home-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
            <Navbar 
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
                toggleSidebar={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
            />
            <div className="app-container">
                <Sidebar isOpen={isSidebarOpen} />
                <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
                    <Hero />
                    <Features />
                </main>
            </div>
            <Footer />
        </div>
    );
}

export default Home
