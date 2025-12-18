import React, { useState, useEffect } from 'react';
import { FiHeart, FiGithub, FiMail, FiMessageCircle, FiPhone } from 'react-icons/fi';

const Footer = () => {
  const [footerParticles, setFooterParticles] = useState([]);
  
  // Create footer particles
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      const colors = ['#FF7EB3', '#7AF2FF', '#FFDE59', '#ffffff'];
      
      for (let i = 0; i < 20; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          speed: Math.random() * 0.2 + 0.05,
          opacity: Math.random() * 0.4 + 0.2,
          blur: Math.random() * 1 + 0.5
        });
      }
      setFooterParticles(newParticles);
    };
    
    generateParticles();
  }, []);
  
  // Animate footer particles
  useEffect(() => {
    const interval = setInterval(() => {
      setFooterParticles(prev => prev.map(p => ({
        ...p,
        x: (p.x + p.speed) % 100,
        y: (p.y + Math.sin(Date.now() / 3000 + p.id) * 0.2) % 100
      })));
    }, 50);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="footer">
      {/* Footer Particles */}
      <div className="footer-particles-bg">
        {footerParticles.map(p => (
          <div
            key={p.id}
            className="footer-particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.color,
              opacity: p.opacity,
              filter: `blur(${p.blur}px)`,
              animationDelay: `${p.id * 0.1}s`
            }}
          />
        ))}
      </div>
      
      <div className="footer-content">
        {/* Top Row - Brand and Contact */}
        <div className="footer-top-row">
          <div className="footer-brand">
            <div className="brand-content">
              <div className="footer-logo-container">
                <FiHeart className="footer-logo" />
              </div>
              <div className="footer-text">
                <h3>Mindful Moments</h3>
                <p>Your personal mental wellness companion</p>
              </div>
            </div>
            <div className="footer-social">
              <a href="https://github.com" className="social-icon" aria-label="GitHub">
                <FiGithub />
              </a>
              <a href="mailto:contact@mindfulmoments.com" className="social-icon" aria-label="Email">
                <FiMail />
              </a>
              <a href="https://twitter.com" className="social-icon" aria-label="Twitter">
                <FiMessageCircle />
              </a>
            </div>
          </div>
          
          <div className="footer-contact">
            <h4>Contact Info</h4>
            <div className="contact-grid">
              <div className="contact-item">
                <FiMail className="contact-icon" />
                <span>support@mindfulmoments.com</span>
              </div>
              <div className="contact-item">
                <FiPhone className="contact-icon" />
                <span>+1 (800) 123-4567</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Row - Copyright */}
        <div className="footer-bottom-row">
          <div className="footer-copyright">
            <p>© {new Date().getFullYear()} Mindful Moments. All rights reserved.</p>
            <p className="disclaimer">
              <strong>Note:</strong> This tool is for informational purposes only. Not a substitute for professional medical advice.
            </p>
            <p className="crisis-note">
              In crisis? Call 911 or go to nearest emergency room.
            </p>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .footer {
          background: linear-gradient(135deg, 
            rgba(30, 41, 59, 0.95) 0%, 
            rgba(51, 65, 85, 0.95) 100%);
          color: white;
          padding: 1.5rem 0;
          width: 100%;
          position: relative;
          z-index: 10;
          overflow: hidden;
          border-top: 1px solid rgba(255, 126, 179, 0.2);
          backdrop-filter: blur(10px);
        }
        
        /* Footer Particles */
        .footer-particles-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
        }
        
        .footer-particle {
          position: absolute;
          border-radius: 50%;
          animation: footerParticleFloat 15s infinite ease-in-out;
          box-shadow: 
            0 0 15px rgba(255, 255, 255, 0.2),
            0 0 30px currentColor;
        }
        
        @keyframes footerParticleFloat {
          0%, 100% { 
            transform: translateY(0) scale(1);
            opacity: 0.3;
          }
          33% { 
            transform: translateY(-10px) scale(1.2);
            opacity: 0.6;
          }
          66% { 
            transform: translateY(5px) scale(0.8);
            opacity: 0.4;
          }
        }
        
        .footer-content {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }
        
        /* Top Row Styling */
        .footer-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .footer-brand {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        
        .brand-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .footer-logo-container {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #FF7EB3, #7AF2FF);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 
            0 5px 20px rgba(255, 126, 179, 0.4),
            0 0 30px rgba(122, 242, 255, 0.3);
        }
        
        .footer-logo {
          font-size: 1.6rem;
          color: white;
        }
        
        .footer-text h3 {
          color: white;
          margin: 0;
          font-size: 1.4rem;
          font-weight: 600;
          line-height: 1.2;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }
        
        .footer-text p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.95rem;
          margin: 0.3rem 0 0;
          line-height: 1.3;
        }
        
        .footer-social {
          display: flex;
          gap: 0.8rem;
        }
        
        .social-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.2rem;
          transition: all 0.3s ease;
          flex-shrink: 0;
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .social-icon:hover {
          background: linear-gradient(135deg, #FF7EB3, #7AF2FF);
          transform: translateY(-1px) scale(1.1);
          box-shadow: 
            0 10px 30px rgba(255, 126, 179, 0.4),
            0 0 40px rgba(122, 242, 255, 0.3);
        }
        
        .footer-contact {
          flex-shrink: 0;
        }
        
        .footer-contact h4 {
          color: white;
          margin: 0 0 0.8rem;
          font-size: 1.1rem;
          font-weight: 600;
          text-align: right;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }
        
        .contact-grid {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        
        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.95rem;
          justify-content: flex-end;
        }
        
        .contact-icon {
          color: #7AF2FF;
          font-size: 1rem;
          flex-shrink: 0;
          filter: drop-shadow(0 0 10px rgba(122, 242, 255, 0.5));
        }
        
        /* Bottom Row Styling */
        .footer-bottom-row {
          padding-top: 1rem;
        }
        
        .footer-copyright {
          text-align: center;
        }
        
        .footer-copyright p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
          margin: 0.4rem 0;
          line-height: 1.4;
          text-shadow: 0 1px 5px rgba(0, 0, 0, 0.3);
        }
        
        .disclaimer {
          max-width: 600px;
          margin: 0.5rem auto !important;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.85rem;
        }
        
        .crisis-note {
          color: rgba(255, 126, 179, 0.9) !important;
          font-size: 0.85rem;
          font-weight: 500;
          text-shadow: 0 0 15px rgba(255, 126, 179, 0.5);
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          .footer-top-row {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
          
          .footer-brand {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
            width: 100%;
          }
          
          .footer-contact {
            width: 100%;
          }
          
          .footer-contact h4 {
            text-align: left;
            font-size: 1rem;
          }
          
          .contact-grid {
            align-items: flex-start;
          }
          
          .contact-item {
            justify-content: flex-start;
            font-size: 0.9rem;
          }
        }
        
        @media (max-width: 480px) {
          .footer {
            padding: 1rem 0;
          }
          
          .footer-content {
            padding: 0 1rem;
          }
          
          .brand-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.8rem;
          }
          
          .footer-text h3 {
            font-size: 1.2rem;
          }
          
          .footer-text p {
            font-size: 0.85rem;
          }
          
          .contact-item {
            font-size: 0.85rem;
          }
          
          .social-icon {
            width: 36px;
            height: 36px;
            font-size: 1.1rem;
          }
          
          /* Reduce particles on mobile */
          .footer-particles-bg {
            opacity: 0.7;
          }
        }
        
        @media (max-width: 360px) {
          .footer-social {
            gap: 0.6rem;
          }
          
          .social-icon {
            width: 34px;
            height: 34px;
            font-size: 1rem;
          }
          
          .footer-copyright p {
            font-size: 0.8rem;
          }
          
          .footer-logo-container {
            width: 42px;
            height: 42px;
          }
          
          .footer-logo {
            font-size: 1.4rem;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;