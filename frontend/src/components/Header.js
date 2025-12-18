import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiHome, FiMail, FiSettings } from 'react-icons/fi';

const Header = ({ onReset }) => {
  
  const scrollToContact = () => {
    // Look for the contact section in footer
    const selectors = [
      '.contact-us',
      '.footer-contact',
      'footer',
      '.footer',
      '.contact-section'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
        return;
      }
    }
    
    // If no contact section found, scroll to bottom
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  };

  return (
    <header className="header fade-in-down">
      <div className="container">
        <nav className="nav">
          <div className="nav-brand">
            <FiHeart className="nav-logo" />
            <h1>Mindful Moments</h1>
          </div>
          
          <div className="nav-links">
            <Link to="/" className="nav-link">
              <FiHome />
              <span>Home</span>
            </Link>
            <button onClick={scrollToContact} className="nav-link">
              <FiMail />
              <span>Contact Us</span>
            </button>
          </div>
        </nav>
      </div>
      
      <style jsx>{`
        .header {
          background: linear-gradient(155deg, rgba(255, 122, 184, 0.6), #459da7ff);
          box-shadow: var(--shadow-md);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        .nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-md) 0;
        }
        
        .nav-brand {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }
        
        .nav-logo {
          font-size: 2rem;
          color: var(--primary);
          animation: pulse 2s infinite;
        }
        
        .nav-links {
          font-size: 1.3rem;
          font-color: black;
          display: flex;
          gap: var(--spacing-lg);
          margin-left: auto; /* This pushes links to the right */
        }
        
        .nav-link {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-md);
          color: var(--gray-700);
          transition: all var(--transition-normal);
          text-decoration: none;
          border: none;
          background: none;
          cursor: pointer;
          font-family: inherit;
          font-size: inherit;
        }
        
        .nav-link:hover {
          background: var(--gray-100);
          color: var(--primary);
        }
        
        @media (max-width: 768px) {
          .nav {
            flex-direction: column;
            gap: var(--spacing-md);
          }
          
          .nav-links {
            width: 100%;
            justify-content: flex-end; /* Align to right on mobile too */
            margin-left: 0;
          }
        }
        
        @media (max-width: 480px) {
          .nav {
            flex-direction: column;
            gap: var(--spacing-md);
          }
          
          .nav-links {
            width: 100%;
            justify-content: space-around; /* Even spacing on small screens */
          }
        }
      `}</style>
    </header>
  );
};

export default Header;