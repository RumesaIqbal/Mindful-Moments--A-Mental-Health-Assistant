import React, { useState, useRef } from 'react';
import { ASSESSMENT_QUESTIONS, RESPONSE_OPTIONS, MOOD_OPTIONS } from '../utils/constants';
import { FiSun, FiCloud, FiMoon, FiArrowRight, FiArrowLeft, FiActivity, FiHeart, FiChevronRight, FiChevronLeft } from 'react-icons/fi';

const AssessmentForm = ({ onSubmit, isLoading }) => {
  const [currentSection, setCurrentSection] = useState('basic');
  const formContainerRef = useRef(null);
  
  const [formData, setFormData] = useState({
    Sleep_Hours: '7',
    Steps_Per_Day: '5000',
    Mood: 'Neutral'
  });
  
  const [responses, setResponses] = useState({
    stress: Array(10).fill('Never'),
    anxiety: Array(10).fill('Never'),
    depression: Array(10).fill('Never')
  });
  
  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Also scroll the form container if it exists
    if (formContainerRef.current) {
      formContainerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };
  
  const handleBasicChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleResponseChange = (category, index, value) => {
    setResponses(prev => ({
      ...prev,
      [category]: prev[category].map((r, i) => i === index ? value : r)
    }));
  };
  
  const handleSubmit = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    scrollToTop(); // Scroll to top before submission
    
    // Combine all data
    const assessmentData = { ...formData };
    
    // Add stress responses
    responses.stress.forEach((response, index) => {
      assessmentData[`stress_${index + 1}`] = response;
    });
    
    // Add anxiety responses
    responses.anxiety.forEach((response, index) => {
      assessmentData[`anxiety_${index + 1}`] = response;
    });
    
    // Add depression responses
    responses.depression.forEach((response, index) => {
      assessmentData[`depression_${index + 1}`] = response;
    });
    
    console.log("Submitting assessment data:", assessmentData);
    onSubmit(assessmentData);
  };
  
  const calculateProgress = () => {
    switch(currentSection) {
      case 'basic': return 25;
      case 'stress': return 50;
      case 'anxiety': return 75;
      case 'depression': return 100;
      default: return 0;
    }
  };
  
  const navigateToSection = (section) => {
    scrollToTop(); // Scroll to top first
    // Use setTimeout to ensure scroll completes before section change
    setTimeout(() => {
      setCurrentSection(section);
    }, 300);
  };
  
  const renderBasicInfo = () => (
    <div className="basic-info-section fade-in">
      <div className="section-header">
        <FiHeart className="header-icon" />
        <div>
          <h2>Welcome to Your Mental Wellness Assessment</h2>
          <p className="text-muted">Let's start by understanding your daily habits and current mood</p>
        </div>
      </div>
      
      <div className="input-group">
        <label>
          <FiMoon className="input-icon" />
          <span>How many hours did you sleep last night?</span>
        </label>
        <div className="range-input">
          <input
            type="range"
            min="0"
            max="12"
            step="0.5"
            value={formData.Sleep_Hours}
            onChange={(e) => handleBasicChange('Sleep_Hours', e.target.value)}
            className="slider"
          />
          <div className="range-labels">
            <span>0 hrs</span>
            <span className="range-value">{formData.Sleep_Hours} hours</span>
            <span>12 hrs</span>
          </div>
          <div className="sleep-quality">
            <span className={parseFloat(formData.Sleep_Hours) < 6 ? 'poor' : parseFloat(formData.Sleep_Hours) < 8 ? 'average' : 'good'}>
              {parseFloat(formData.Sleep_Hours) < 6 ? 'Poor sleep' : 
               parseFloat(formData.Sleep_Hours) < 8 ? 'Average sleep' : 'Good sleep'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="input-group">
        <label>
          <FiActivity className="input-icon" />
          <span>Average daily steps (last 7 days)</span>
        </label>
        <div className="range-input">
          <input
            type="range"
            min="0"
            max="20000"
            step="500"
            value={formData.Steps_Per_Day}
            onChange={(e) => handleBasicChange('Steps_Per_Day', e.target.value)}
            className="slider"
          />
          <div className="range-labels">
            <span>0 steps</span>
            <span className="range-value">{parseInt(formData.Steps_Per_Day).toLocaleString()} steps</span>
            <span>20k steps</span>
          </div>
          <div className="activity-level">
            <span className={parseInt(formData.Steps_Per_Day) < 5000 ? 'sedentary' : 
                             parseInt(formData.Steps_Per_Day) < 10000 ? 'moderate' : 'active'}>
              {parseInt(formData.Steps_Per_Day) < 5000 ? 'Sedentary' : 
               parseInt(formData.Steps_Per_Day) < 10000 ? 'Moderately Active' : 'Very Active'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="input-group">
        <label>
          <FiSun className="input-icon" />
          <span>How are you feeling right now?</span>
        </label>
        <div className="mood-options">
          {MOOD_OPTIONS.map(mood => (
            <button
              key={mood.value}
              type="button"
              className={`mood-btn ${formData.Mood === mood.value ? 'selected' : ''}`}
              onClick={() => handleBasicChange('Mood', mood.value)}
              style={{ 
                '--mood-color': mood.color,
                '--mood-bg': `${mood.color}20`
              }}
            >
              <span className="mood-emoji">{mood.emoji}</span>
              <span className="mood-label">{mood.value}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="navigation-section">
        <button
          type="button"
          className="btn-continue"
          onClick={() => navigateToSection('stress')}
          disabled={isLoading}
        >
          <span className="btn-text">Continue to Assessment</span>
          <span className="btn-icon">
            <FiArrowRight />
          </span>
          <div className="btn-shine"></div>
        </button>
        <p className="info-note">
          Your information is confidential and will only be used to provide personalized recommendations.
        </p>
      </div>
      
      <style jsx>{`
        .basic-info-section {
          background: white;
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          max-width: 800px;
          margin: 0 auto;
        }
        
        .section-header {
          display: flex;
          align-items: flex-start;
          gap: 1.5rem;
          margin-bottom: 2.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid #e8edf5;
        }
        
        .header-icon {
          font-size: 2.5rem;
          color: #5d5fef;
          margin-top: 0.5rem;
          animation: pulse 2s infinite;
        }
        
        .section-header h2 {
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #5d5fef 0%, #7879f1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .text-muted {
          color: #64748b;
          font-size: 1.1rem;
        }
        
        .input-group {
          margin-bottom: 2.5rem;
        }
        
        .input-group label {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: #1e293b;
          font-size: 1.1rem;
        }
        
        .input-icon {
          font-size: 1.5rem;
          color: #5d5fef;
        }
        
        .range-input {
          background: #f8fafc;
          padding: 2rem;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
        }
        
        .slider {
          width: 100%;
          height: 10px;
          border-radius: 5px;
          background: #e2e8f0;
          outline: none;
          -webkit-appearance: none;
          margin: 1.5rem 0;
        }
        
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #5d5fef;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 10px rgba(93, 95, 239, 0.3);
        }
        
        .slider::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #5d5fef;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 10px rgba(93, 95, 239, 0.3);
        }
        
        .range-labels {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
          font-size: 0.9rem;
          color: #64748b;
        }
        
        .range-value {
          font-size: 1.8rem;
          font-weight: 700;
          color: #5d5fef;
          background: rgba(93, 95, 239, 0.1);
          padding: 0.5rem 1.5rem;
          border-radius: 25px;
        }
        
        .sleep-quality, .activity-level {
          margin-top: 1rem;
          text-align: center;
        }
        
        .sleep-quality span, .activity-level span {
          display: inline-block;
          padding: 0.5rem 1.5rem;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.9rem;
        }
        
        .poor, .sedentary {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .average, .moderate {
          background: #fef3c7;
          color: #92400e;
        }
        
        .good, .active {
          background: #dcfce7;
          color: #166534;
        }
        
        .mood-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1rem;
        }
        
        .mood-btn {
          padding: 1.5rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          background: var(--mood-bg, white);
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }
        
        .mood-btn:hover {
          transform: translateY(-3px);
          border-color: var(--mood-color);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .mood-btn.selected {
          background: var(--mood-color);
          color: white;
          border-color: var(--mood-color);
          transform: scale(1.05);
        }
        
        .mood-btn.selected .mood-emoji {
          transform: scale(1.2);
        }
        
        .mood-emoji {
          font-size: 2.5rem;
          transition: transform 0.3s ease;
        }
        
        .mood-label {
          font-weight: 600;
          font-size: 1rem;
        }
        
        .navigation-section {
          margin-top: 3rem;
          text-align: center;
        }
        
        .btn-continue {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 1.2rem 2.5rem;
          font-size: 1.1rem;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #5d5fef 0%, #7879f1 100%);
          border: none;
          border-radius: 16px;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 8px 30px rgba(93, 95, 239, 0.3);
        }
        
        .btn-continue:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(93, 95, 239, 0.4);
        }
        
        .btn-continue:active:not(:disabled) {
          transform: translateY(-1px);
        }
        
        .btn-continue:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .btn-icon {
          font-size: 1.2rem;
          transition: transform 0.3s ease;
        }
        
        .btn-continue:hover:not(:disabled) .btn-icon {
          transform: translateX(5px);
        }
        
        .btn-shine {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            to right,
            transparent 20%,
            rgba(255, 255, 255, 0.3) 50%,
            transparent 80%
          );
          transform: rotate(30deg);
          transition: transform 0.6s ease;
          pointer-events: none;
        }
        
        .btn-continue:hover:not(:disabled) .btn-shine {
          transform: rotate(30deg) translateX(100%);
        }
        
        .info-note {
          margin-top: 1.5rem;
          color: #64748b;
          font-size: 0.9rem;
          line-height: 1.5;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
        }
        
        @media (max-width: 768px) {
          .basic-info-section {
            padding: 1.5rem;
          }
          
          .section-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
          
          .header-icon {
            align-self: center;
          }
          
          .mood-options {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .range-input {
            padding: 1.5rem;
          }
          
          .range-value {
            font-size: 1.5rem;
            padding: 0.5rem 1rem;
          }
          
          .btn-continue {
            padding: 1rem 2rem;
            font-size: 1rem;
          }
        }
        
        @media (max-width: 480px) {
          .mood-options {
            grid-template-columns: 1fr;
          }
          
          .range-labels {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
  
  const renderAssessmentSection = (category, questions) => {
    const categoryInfo = {
      stress: {
        title: 'Stress Assessment',
        icon: '🔥',
        description: 'How often do you experience these stress-related feelings?',
        color: '#ff6b6b'
      },
      anxiety: {
        title: 'Anxiety Assessment',
        icon: '😰',
        description: 'How often do you experience these anxiety-related feelings?',
        color: '#4d96ff'
      },
      depression: {
        title: 'Depression Assessment',
        icon: '🌧️',
        description: 'How often do you experience these mood-related feelings?',
        color: '#6b48ff'
      }
    };
    
    const info = categoryInfo[category];
    
    return (
      <div className="assessment-section fade-in">
        <div className="assessment-header">
          <div className="category-badge" style={{ background: info.color }}>
            <span className="category-icon">{info.icon}</span>
          </div>
          <div className="header-content">
            <h2>{info.title}</h2>
            <p className="category-description">{info.description}</p>
          </div>
        </div>
        
        <div className="questions-container">
          {questions.map((question, index) => (
            <div key={index} className="question-card" style={{ borderLeftColor: info.color }}>
              <div className="question-number">
                <span>Q{index + 1}</span>
              </div>
              <div className="question-content">
                <p className="question-text">{question}</p>
                
                <div className="response-options">
                  {RESPONSE_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      className={`response-btn ${responses[category][index] === option.value ? 'selected' : ''}`}
                      onClick={() => handleResponseChange(category, index, option.value)}
                      style={{ 
                        '--option-color': option.color,
                        '--option-bg': `${option.color}15`
                      }}
                    >
                      <span className="option-emoji">{option.emoji}</span>
                      <span className="option-label">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="assessment-navigation">
          <div className="navigation-buttons">
            {category !== 'stress' && (
              <button
                type="button"
                className="btn-prev"
                onClick={() => navigateToSection(category === 'anxiety' ? 'stress' : 'anxiety')}
                disabled={isLoading}
              >
                <span className="btn-icon">
                  <FiArrowLeft />
                </span>
                <span className="btn-text">Previous</span>
              </button>
            )}
            
            <button
              type="button"
              className={`btn-next ${category === 'depression' ? 'btn-recommendation' : ''}`}
              onClick={() => {
                scrollToTop(); // Scroll to top first
                if (category === 'stress') {
                  setTimeout(() => setCurrentSection('anxiety'), 300);
                } else if (category === 'anxiety') {
                  setTimeout(() => setCurrentSection('depression'), 300);
                } else {
                  handleSubmit();
                }
              }}
              disabled={isLoading}
            >
              <span className="btn-text">
                {isLoading ? 'Processing...' : category === 'depression' ? 'Get Recommendations' : 'Continue'}
              </span>
              <span className="btn-icon">
                {category === 'depression' ? <FiArrowRight /> : <FiChevronRight />}
              </span>
              <div className="btn-shine"></div>
              {category === 'depression' && <div className="btn-particles"></div>}
            </button>
          </div>
          
          <p className="assessment-note">
            Be honest with your responses. This helps us provide the most accurate recommendations for you.
          </p>
        </div>
        
        <style jsx>{`
          .assessment-section {
            background: white;
            border-radius: 20px;
            padding: 2.5rem;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            max-width: 1200px;
            margin: 0 auto;
          }
          
          .assessment-header {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            margin-bottom: 2.5rem;
            padding-bottom: 1.5rem;
            border-bottom: 2px solid #e8edf5;
          }
          
          .category-badge {
            width: 70px;
            height: 70px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            flex-shrink: 0;
          }
          
          .category-icon {
            font-size: 2.5rem;
          }
          
          .header-content h2 {
            margin-bottom: 0.5rem;
            color: #1e293b;
          }
          
          .category-description {
            color: #64748b;
            font-size: 1.1rem;
          }
          
          .questions-container {
            margin-bottom: 2.5rem;
          }
          
          .question-card {
            background: #f8fafc;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border-left: 4px solid;
            display: flex;
            gap: 1.5rem;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          
          .question-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
          }
          
          .question-number {
            width: 50px;
            height: 50px;
            background: white;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            font-weight: 700;
            color: #5d5fef;
            font-size: 1.2rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          
          .question-content {
            flex: 1;
          }
          
          .question-text {
            font-weight: 500;
            margin-bottom: 1.5rem;
            color: #1e293b;
            font-size: 1.1rem;
            line-height: 1.5;
          }
          
          .response-options {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 0.75rem;
          }
          
          .response-btn {
            padding: 1rem;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            background: var(--option-bg, white);
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
          }
          
          .response-btn:hover {
            transform: translateY(-2px);
            border-color: var(--option-color);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          
          .response-btn.selected {
            background: var(--option-color);
            color: white;
            border-color: var(--option-color);
            transform: scale(1.05);
          }
          
          .option-emoji {
            font-size: 1.8rem;
          }
          
          .option-label {
            font-weight: 600;
            font-size: 0.9rem;
          }
          
          .assessment-navigation {
            padding-top: 2rem;
            border-top: 2px solid #e8edf5;
          }
          
          .navigation-buttons {
            display: flex;
            justify-content: ${category === 'stress' ? 'flex-end' : 'space-between'};
            gap: 1.5rem;
            margin-bottom: 1.5rem;
          }
          
          .btn-prev, .btn-next {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            padding: 1rem 2rem;
            font-size: 1rem;
            font-weight: 600;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            min-width: 160px;
          }
          
          .btn-prev {
            background: white;
            color: #5d5fef;
            border: 2px solid #e2e8f0;
          }
          
          .btn-prev:hover:not(:disabled) {
            background: #f8fafc;
            border-color: #5d5fef;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(93, 95, 239, 0.15);
          }
          
          .btn-next {
            background: linear-gradient(135deg, #5d5fef 0%, #7879f1 100%);
            color: white;
            box-shadow: 0 5px 20px rgba(93, 95, 239, 0.25);
          }
          
          .btn-next:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(93, 95, 239, 0.35);
          }
          
          .btn-next:active:not(:disabled) {
            transform: translateY(-1px);
          }
          
          .btn-recommendation {
            background: linear-gradient(135deg, #6b48ff 0%, #9d7aff 100%);
            box-shadow: 0 5px 20px rgba(107, 72, 255, 0.3);
            animation: glow 2s infinite alternate;
          }
          
          .btn-recommendation:hover:not(:disabled) {
            box-shadow: 0 8px 25px rgba(107, 72, 255, 0.4);
          }
          
          .btn-prev:disabled, .btn-next:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none !important;
          }
          
          .btn-icon {
            font-size: 1.1rem;
            transition: transform 0.3s ease;
          }
          
          .btn-prev:hover:not(:disabled) .btn-icon {
            transform: translateX(-3px);
          }
          
          .btn-next:hover:not(:disabled) .btn-icon {
            transform: translateX(3px);
          }
          
          .btn-shine {
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(
              to right,
              transparent 20%,
              rgba(255, 255, 255, 0.2) 50%,
              transparent 80%
            );
            transform: rotate(30deg);
            transition: transform 0.6s ease;
            pointer-events: none;
          }
          
          .btn-next:hover:not(:disabled) .btn-shine {
            transform: rotate(30deg) translateX(100%);
          }
          
          .btn-particles {
            position: absolute;
            width: 100%;
            height: 100%;
            pointer-events: none;
          }
          
          .btn-particles::before,
          .btn-particles::after {
            content: '✨';
            position: absolute;
            font-size: 1.2rem;
            opacity: 0;
            animation: particleFloat 2s ease-in-out infinite;
          }
          
          .btn-particles::before {
            top: -10px;
            left: 20%;
            animation-delay: 0.2s;
          }
          
          .btn-particles::after {
            bottom: -10px;
            right: 20%;
            animation-delay: 0.5s;
          }
          
          .assessment-note {
            text-align: center;
            color: #64748b;
            font-size: 0.9rem;
            line-height: 1.5;
            margin-top: 1.5rem;
          }
          
          @keyframes glow {
            0% {
              box-shadow: 0 5px 20px rgba(107, 72, 255, 0.3);
            }
            100% {
              box-shadow: 0 5px 25px rgba(107, 72, 255, 0.5);
            }
          }
          
          @keyframes particleFloat {
            0%, 100% {
              transform: translateY(0) rotate(0deg);
              opacity: 0;
            }
            50% {
              opacity: 1;
            }
            100% {
              transform: translateY(-20px) rotate(180deg);
            }
          }
          
          @media (max-width: 768px) {
            .assessment-section {
              padding: 1.5rem;
            }
            
            .assessment-header {
              flex-direction: column;
              text-align: center;
              gap: 1rem;
            }
            
            .question-card {
              flex-direction: column;
              gap: 1rem;
            }
            
            .question-number {
              align-self: center;
            }
            
            .response-options {
              grid-template-columns: repeat(2, 1fr);
            }
            
            .navigation-buttons {
              flex-direction: column;
            }
            
            .btn-prev, .btn-next {
              width: 100%;
            }
          }
          
          @media (max-width: 480px) {
            .response-options {
              grid-template-columns: 1fr;
            }
            
            .category-badge {
              width: 60px;
              height: 60px;
            }
            
            .category-icon {
              font-size: 2rem;
            }
          }
        `}</style>
      </div>
    );
  };
  
  return (
    <div className="assessment-form" ref={formContainerRef}>
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${calculateProgress()}%`,
              background: 'linear-gradient(135deg, #5d5fef 0%, #7879f1 100%)'
            }}
          />
        </div>
        <div className="progress-steps">
          <div className={`step ${currentSection === 'basic' ? 'active' : ''}`}>
            <div className="step-circle">1</div>
            <span className="step-label">Basic Info</span>
          </div>
          <div className={`step ${currentSection === 'stress' ? 'active' : ''}`}>
            <div className="step-circle">2</div>
            <span className="step-label">Stress</span>
          </div>
          <div className={`step ${currentSection === 'anxiety' ? 'active' : ''}`}>
            <div className="step-circle">3</div>
            <span className="step-label">Anxiety</span>
          </div>
          <div className={`step ${currentSection === 'depression' ? 'active' : ''}`}>
            <div className="step-circle">4</div>
            <span className="step-label">Depression</span>
          </div>
        </div>
      </div>
      
      {currentSection === 'basic' && renderBasicInfo()}
      {currentSection === 'stress' && renderAssessmentSection('stress', ASSESSMENT_QUESTIONS.stress)}
      {currentSection === 'anxiety' && renderAssessmentSection('anxiety', ASSESSMENT_QUESTIONS.anxiety)}
      {currentSection === 'depression' && renderAssessmentSection('depression', ASSESSMENT_QUESTIONS.depression)}
      
      <style jsx>{`
        .assessment-form {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
          scroll-margin-top: 20px; /* Ensures smooth scroll doesn't get cut off */
        }
        
        .progress-container {
          margin-bottom: 3rem;
        }
        
        .progress-bar {
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          margin-bottom: 2rem;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease;
        }
        
        .progress-steps {
          display: flex;
          justify-content: space-between;
          position: relative;
        }
        
        .progress-steps::before {
          content: '';
          position: absolute;
          top: 24px;
          left: 0;
          right: 0;
          height: 2px;
          background: #e2e8f0;
          z-index: 1;
        }
        
        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 2;
        }
        
        .step-circle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: white;
          border: 3px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.2rem;
          color: #64748b;
          margin-bottom: 0.75rem;
          transition: all 0.3s ease;
        }
        
        .step.active .step-circle {
          background: #5d5fef;
          border-color: #5d5fef;
          color: white;
          transform: scale(1.1);
          box-shadow: 0 4px 15px rgba(93, 95, 239, 0.3);
        }
        
        .step-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: #64748b;
          transition: color 0.3s ease;
        }
        
        .step.active .step-label {
          color: #5d5fef;
        }
        
        @media (max-width: 768px) {
          .progress-steps {
            flex-wrap: wrap;
            justify-content: center;
            gap: 1.5rem;
          }
          
          .progress-steps::before {
            display: none;
          }
          
          .step {
            flex: 0 0 calc(25% - 1.5rem);
          }
          
          .step-circle {
            width: 40px;
            height: 40px;
            font-size: 1rem;
          }
        }
        
        @media (max-width: 480px) {
          .step {
            flex: 0 0 calc(50% - 1rem);
            margin-bottom: 1rem;
          }
          
          .assessment-form {
            padding: 1rem 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AssessmentForm;