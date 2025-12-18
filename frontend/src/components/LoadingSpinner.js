import React from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  message = 'Loading...',
  variant = 'calm', // 'calm', 'serene', 'uplifting'
  showBreathingAnimation = true
}) => {
  const sizeMap = {
    small: '2rem',
    medium: '3rem',
    large: '4rem'
  };

  const colorThemes = {
    calm: {
      primary: '#4F8A8B', // Soothing teal
      secondary: '#AED6DC', // Soft blue
      accent: '#F9F7F0', // Warm white
      text: '#4A5568' // Soft gray
    },
    serene: {
      primary: '#9F7AEA', // Lavender (calming)
      secondary: '#D6BCFA', // Light lavender
      accent: '#FAF5FF', // Very light purple
      text: '#6B7280'
    },
    uplifting: {
      primary: '#68D391', // Mint green (renewal)
      secondary: '#9AE6B4', // Light mint
      accent: '#F0FFF4', // Very light green
      text: '#4A5568'
    }
  };

  const theme = colorThemes[variant] || colorThemes.calm;

  return (
    <div className="loading-container">
      <div className="spinner-wrapper">
        {/* Main spinner */}
        <div className="mindful-spinner">
          <svg
            className="spinner-svg"
            width={sizeMap[size]}
            height={sizeMap[size]}
            viewBox="0 0 100 100"
          >
            {/* Outer calm circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={theme.secondary}
              strokeWidth="6"
              strokeOpacity="0.3"
            />
            
            {/* Breathing circle */}
            {showBreathingAnimation && (
              <circle
                cx="50"
                cy="50"
                r="15"
                fill={theme.primary}
                className="breathing-circle"
              />
            )}
            
            {/* Progressive arcs */}
            <path
              d="M50 5 A45 45 0 0 1 95 50"
              fill="none"
              stroke={theme.primary}
              strokeWidth="8"
              strokeLinecap="round"
              className="spinner-arc"
            />
            <path
              d="M50 5 A45 45 0 0 0 5 50"
              fill="none"
              stroke={theme.primary}
              strokeWidth="8"
              strokeLinecap="round"
              opacity="0.7"
              className="spinner-arc delayed-1"
            />
            <path
              d="M5 50 A45 45 0 0 0 50 95"
              fill="none"
              stroke={theme.primary}
              strokeWidth="8"
              strokeLinecap="round"
              opacity="0.5"
              className="spinner-arc delayed-2"
            />
          </svg>
        </div>
        
        {/* Optional floating dots for calm effect */}
        <div className="floating-dots">
          {[1, 2, 3].map((dot) => (
            <div 
              key={dot} 
              className="floating-dot"
              style={{ 
                backgroundColor: theme.secondary,
                animationDelay: `${dot * 0.3}s`
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Thoughtful loading messages */}
      <div className="loading-content">
        <p className="loading-message">{message}</p>
        <p className="wellness-tip">
          {variant === 'calm' && 'Take a deep breath...'}
          {variant === 'serene' && 'This moment is for you...'}
          {variant === 'uplifting' && 'Good things are coming...'}
        </p>
      </div>
      
      <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          padding: 2.5rem;
          gap: 1.5rem;
          background: ${theme.accent};
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(79, 138, 139, 0.1);
        }
        
        .spinner-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .mindful-spinner {
          position: relative;
          z-index: 2;
        }
        
        .spinner-svg {
          animation: gentleFloat 3s ease-in-out infinite;
        }
        
        .spinner-arc {
          animation: mindfulRotate 2s linear infinite;
          transform-origin: 50% 50%;
        }
        
        .delayed-1 {
          animation-delay: 0.66s;
        }
        
        .delayed-2 {
          animation-delay: 1.33s;
        }
        
        .breathing-circle {
          animation: mindfulBreathing 3s ease-in-out infinite;
        }
        
        .floating-dots {
          position: absolute;
          width: 100%;
          height: 100%;
          z-index: 1;
        }
        
        .floating-dot {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          opacity: 0.4;
        }
        
        .floating-dot:nth-child(1) {
          top: 10%;
          left: 20%;
          animation: floatUpDown 4s ease-in-out infinite;
        }
        
        .floating-dot:nth-child(2) {
          top: 30%;
          right: 15%;
          animation: floatUpDown 5s ease-in-out infinite reverse;
        }
        
        .floating-dot:nth-child(3) {
          bottom: 20%;
          left: 40%;
          animation: floatUpDown 6s ease-in-out infinite;
        }
        
        .loading-content {
          text-align: center;
          max-width: 300px;
        }
        
        .loading-message {
          color: ${theme.text};
          font-size: 1.1rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
          letter-spacing: 0.5px;
        }
        
        .wellness-tip {
          color: ${theme.primary};
          font-size: 0.9rem;
          font-style: italic;
          opacity: 0.8;
          margin: 0;
        }
        
        @keyframes mindfulRotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        @keyframes mindfulBreathing {
          0%, 100% {
            r: 15;
            opacity: 0.7;
          }
          50% {
            r: 18;
            opacity: 1;
          }
        }
        
        @keyframes gentleFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        @keyframes floatUpDown {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-15px) scale(1.1);
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;