import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaUserPlus, 
  FaHistory, 
  FaCog, 
  FaQuestionCircle,
  FaChevronDown
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const [expandedSection, setExpandedSection] = React.useState('accounts');

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <FaHome />,
      path: '/dashboard'
    },
    {
      title: 'Accounts',
      icon: <FaUserPlus />,
      path: '/accounts',
      subItems: [
        { title: 'Open Account', path: '/open-account' },
        { title: 'My Accounts', path: '/my-accounts' }
      ]
    },
    {
      title: 'Transactions',
      icon: <FaHistory />,
      path: '/transactions'
    },
    {
      title: 'Settings',
      icon: <FaCog />,
      path: '/settings'
    },
    {
      title: 'Help',
      icon: <FaQuestionCircle />,
      path: '/help'
    }
  ];

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-content">
          {menuItems.map((item, index) => (
            <div key={index} className="sidebar-section">
              {item.subItems ? (
                <>
                  <button 
                    className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
                    onClick={() => toggleSection(item.title.toLowerCase())}
                  >
                    <span className="icon">{item.icon}</span>
                    <span className="title">{item.title}</span>
                    <FaChevronDown className={`arrow ${expandedSection === item.title.toLowerCase() ? 'expanded' : ''}`} />
                  </button>
                  {expandedSection === item.title.toLowerCase() && (
                    <div className="submenu">
                      {item.subItems.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          to={subItem.path}
                          className={`submenu-item ${isActive(subItem.path) ? 'active' : ''}`}
                        >
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.path}
                  className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
                >
                  <span className="icon">{item.icon}</span>
                  <span className="title">{item.title}</span>
                </Link>
              )}
            </div>
          ))}
        </div>
      </aside>
    </>
  );
};

export default Sidebar; 