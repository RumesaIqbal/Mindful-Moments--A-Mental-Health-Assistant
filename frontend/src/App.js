import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import AssessmentForm from './components/AssessmentForm';
import Recommendations from './components/Recommendations';
import LoadingSpinner from './components/LoadingSpinner';
import './styles/App.css';

function App() {
const [assessmentData, setAssessmentData] = useState(null);
const [recommendations, setRecommendations] = useState(null);
const [isLoading, setIsLoading] = useState(false);
const [apiStatus, setApiStatus] = useState('checking');
const [particles, setParticles] = useState([]);
const [confetti, setConfetti] = useState(false);
const [activeSection, setActiveSection] = useState('welcome');

// Add state for confirmation modal
const [showConfirmModal, setShowConfirmModal] = useState(false);
const [pendingSection, setPendingSection] = useState(null);

// Create animated particles
useEffect(() => {
  const generateParticles = () => {
    const newParticles = [];
    const colors = ['#FF7EB3', '#7AF2FF', '#FFDE59', '#B28DFF', '#6BEFC9'];
    
    for (let i = 0; i < 40; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 25 + 15,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 0.3 + 0.1,
        direction: Math.random() * 360
      });
    }
    setParticles(newParticles);
  };
  
  generateParticles();
}, []);

// Animate particles
useEffect(() => {
  const interval = setInterval(() => {
    setParticles(prev => prev.map(p => ({
      ...p,
      y: (p.y + p.speed) % 100,
      x: (p.x + Math.sin(Date.now() / 2000 + p.id) * 0.3) % 100
    })));
  }, 50);
  
  return () => clearInterval(interval);
}, []);

// Trigger confetti on recommendations
useEffect(() => {
  if (recommendations) {
    setConfetti(true);
    setTimeout(() => setConfetti(false), 3000);
  }
}, [recommendations]);

const checkApiHealth = async () => {
  try {
    const response = await fetch('http://localhost:5000/health');
    const data = await response.json();
    setApiStatus('healthy');
    console.log('✅ API Health:', data);
  } catch (error) {
    console.warn('⚠️ API is not reachable, using fallback mode');
    setApiStatus('unreachable');
  }
};

// Check API health on component mount
useEffect(() => {
  checkApiHealth();
  const interval = setInterval(checkApiHealth, 30000);
  return () => clearInterval(interval);
}, []);

const calculateFallbackScores = (data) => {
  const responseValue = {
    'Never': 0,
    'Sometimes': 0.5,
    'Often': 0.75,
    'Almost Always': 1
  };
  
  let stressScore = 0;
  let anxietyScore = 0;
  let depressionScore = 0;
  
  for (let i = 1; i <= 10; i++) {
    stressScore += responseValue[data[`stress_${i}`] || 'Never'];
    anxietyScore += responseValue[data[`anxiety_${i}`] || 'Never'];
    depressionScore += responseValue[data[`depression_${i}`] || 'Never'];
  }
  
  return {
    Stress_Level: Math.min(10, Math.round(stressScore * 10) / 10),
    Anxiety_Score: Math.min(10, Math.round(anxietyScore * 10) / 10),
    Depression_Score: Math.min(10, Math.round(depressionScore * 10) / 10)
  };
};

const getFallbackRecommendations = (scores) => {
  const allActivities = [
    {
      id: 1,
      name: 'Ocean Breathing Meditation',
      type: 'Breathing Exercise',
      category: 'Stress Relief',
      duration: 12,
      intensity: 'Low',
      benefits: '- Calms the nervous system\n- Reduces cortisol levels\n- Improves oxygen flow\n- Enhances mental clarity',
      recommended_when: 'When feeling overwhelmed or stressed',
      instructions: '1. Imagine ocean waves\n2. Inhale as wave comes in\n3. Hold at the peak\n4. Exhale as wave recedes\n5. Sync with natural rhythm',
      tips: '- Use calming music\n- Practice near water\n- Focus on sound of breath',
      precautions: '- Stop if dizzy\n- Sit comfortably',
      equipment: 'None',
      video_link: 'https://youtu.be/tEmt1Znux58',
      description: 'A wave-like breathing pattern to mimic ocean rhythms'
    },
    {
      id: 2,
      name: 'Sunrise Yoga Flow',
      type: 'Yoga',
      category: 'Mood Enhancement',
      duration: 25,
      intensity: 'Medium',
      benefits: '- Boosts serotonin\n- Increases energy\n- Improves flexibility\n- Enhances positivity',
      recommended_when: 'Morning or when feeling low energy',
      instructions: '1. Gentle warm-up stretches\n2. Sun salutation sequence\n3. Standing poses\n4. Cool-down stretches\n5. Final relaxation',
      tips: '- Practice facing east\n- Wear comfortable clothes\n- Stay hydrated',
      precautions: '- Avoid if injured\n- Modify as needed',
      equipment: 'Yoga mat',
      video_link: 'https://youtu.be/v7AYKMP6rOE',
      description: 'Morning yoga sequence to energize and uplift'
    },
    {
      id: 3,
      name: 'Forest Sound Bath',
      type: 'Meditation',
      category: 'Anxiety Reduction',
      duration: 18,
      intensity: 'Low',
      benefits: '- Reduces anxiety\n- Lowers heart rate\n- Improves focus\n- Promotes relaxation',
      recommended_when: 'When feeling anxious or restless',
      instructions: '1. Find quiet space\n2. Play forest sounds\n3. Focus on different sounds\n4. Breathe naturally\n5. Gradually expand awareness',
      tips: '- Use headphones\n- Dim the lights\n- Add essential oils',
      precautions: '- Not while driving\n- Use moderate volume',
      equipment: 'Headphones',
      video_link: 'https://youtu.be/H_uc-uQ3Nkc',
      description: 'Nature sound meditation for anxiety relief'
    },
    {
      id: 4,
      name: 'Gratitude Garden Journal',
      type: 'Journaling',
      category: 'Depression Uplift',
      duration: 15,
      intensity: 'Low',
      benefits: '- Shifts perspective\n- Increases positivity\n- Enhances mindfulness\n- Improves sleep',
      recommended_when: 'Evening or when feeling down',
      instructions: '1. Plant seeds of gratitude\n2. Water with details\n3. Watch growth daily\n4. Harvest insights weekly',
      tips: '- Use colored pens\n- Add drawings\n- Review weekly',
      precautions: '- Be gentle\n- Don\'t force positivity',
      equipment: 'Journal',
      video_link: 'https://youtu.be/4iA4zz_qto',
      description: 'Creative journaling using garden metaphor'
    },
    {
      id: 5,
      name: 'Energy Dance Break',
      type: 'Physical Exercise',
      category: 'Focus & Productivity',
      duration: 10,
      intensity: 'Medium',
      benefits: '- Increases dopamine\n- Boosts circulation\n- Enhances creativity\n- Reduces fatigue',
      recommended_when: 'Afternoon slump or when stuck',
      instructions: '1. Play favorite upbeat song\n2. Move freely to rhythm\n3. Express through movement\n4. Gradually slow down\n5. End with deep breath',
      tips: '- No judgment\n- Have fun\n- Involve friends',
      precautions: '- Clear space\n- Wear supportive shoes',
      equipment: 'Music player',
      video_link: 'https://youtu.be/ah4PAK18Rtg',
      description: 'Short dance session to boost energy and focus'
    }
  ];
  
  const priorities = [];
  
  if (scores.Stress_Level >= 7) priorities.push('Stress Relief', 'Anxiety Reduction');
  if (scores.Anxiety_Score >= 7) priorities.push('Anxiety Reduction', 'Stress Relief');
  if (scores.Depression_Score >= 7) priorities.push('Depression Uplift', 'Mood Enhancement');
  
  if (priorities.length === 0) {
    priorities.push('Stress Relief', 'Mood Enhancement', 'Focus & Productivity');
  }
  
  const uniquePriorities = [...new Set(priorities)];
  const selected = [];
  
  for (const priority of uniquePriorities) {
    const match = allActivities.find(a => a.category === priority);
    if (match && !selected.includes(match)) selected.push(match);
  }
  
  while (selected.length < 5) {
    const remaining = allActivities.filter(a => !selected.includes(a));
    if (remaining.length === 0) break;
    selected.push(remaining[Math.floor(Math.random() * remaining.length)]);
  }
  
  return selected.slice(0, 5);
};

const handleAssessmentSubmit = async (data) => {
  setIsLoading(true);
  setAssessmentData(data);
  
  try {
    console.log("🌱 Sending your wellness data...");
    
    // First, calculate scores from the form responses
    const calculatedScores = calculateScoresFromResponses(data);
    console.log("📊 Calculated scores:", calculatedScores);
    
    // Prepare data to send to API
    const apiData = {
      ...data,  // Send all form data
      ...calculatedScores  // Include calculated scores
    };
    
    const response = await fetch('http://localhost:5000/assess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiData),
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const result = await response.json();
    console.log("🌸 Recommendations received:", result);
    
    if (result.success) {
      // Ensure we have scores to pass to Recommendations
      const finalData = {
        user_input: data,  // Original form data
        assessment_scores: result.assessment_scores || calculatedScores, // Use API scores or calculated
        ...result  // Include recommendations
      };
      
      setRecommendations(finalData);
      setActiveSection('results');
    } else {
      throw new Error('API returned error');
    }
  } catch (error) {
    console.log("🍂 Using personalized fallback recommendations");
    const scores = calculateScoresFromResponses(data);
    const fallbackRecs = getFallbackRecommendations(scores);
    
    setRecommendations({
      success: true,
      user_input: data,
      assessment_scores: scores,
      recommendations: fallbackRecs
    });
    setActiveSection('results');
  } finally {
    setIsLoading(false);
  }
};

const calculateScoresFromResponses = (data) => {
  console.log('🧮 Calculating scores from responses:', data);
  
  // Scoring values as requested
  const responseValue = {
    'Never': 0,
    'Sometimes': 0.25,
    'Often': 0.75,
    'Almost Always': 1
  };
  
  let stressTotal = 0;
  let anxietyTotal = 0;
  let depressionTotal = 0;
  
  // Check for stress questions (stress_1 to stress_10)
  for (let i = 1; i <= 10; i++) {
    const stressKey = `stress_${i}`;
    const anxietyKey = `anxiety_${i}`;
    const depressionKey = `depression_${i}`;
    
    if (data[stressKey] && responseValue[data[stressKey]] !== undefined) {
      stressTotal += responseValue[data[stressKey]];
      console.log(`Stress Q${i}: ${data[stressKey]} = ${responseValue[data[stressKey]]}`);
    }
    
    if (data[anxietyKey] && responseValue[data[anxietyKey]] !== undefined) {
      anxietyTotal += responseValue[data[anxietyKey]];
      console.log(`Anxiety Q${i}: ${data[anxietyKey]} = ${responseValue[data[anxietyKey]]}`);
    }
    
    if (data[depressionKey] && responseValue[data[depressionKey]] !== undefined) {
      depressionTotal += responseValue[data[depressionKey]];
      console.log(`Depression Q${i}: ${data[depressionKey]} = ${responseValue[data[depressionKey]]}`);
    }
  }
  
  console.log('📊 Raw totals:', {
    stressTotal,
    anxietyTotal,
    depressionTotal
  });
  
  // Total is already out of 10 (10 questions × max 1 point each = 10)
  return {
    Stress_Level: parseFloat(Math.min(10, stressTotal).toFixed(1)),
    Anxiety_Score: parseFloat(Math.min(10, anxietyTotal).toFixed(1)),
    Depression_Score: parseFloat(Math.min(10, depressionTotal).toFixed(1)),
    Sleep_Hours: parseFloat(data.Sleep_Hours || 7.0),
    Steps_Per_Day: parseFloat(data.Steps_Per_Day || 5000.0),
    Mood: data.Mood || 'Neutral'
  };
};

// Modified handleReset function
const handleReset = () => {
  setAssessmentData(null);
  setRecommendations(null);
  setActiveSection('welcome');
  setShowConfirmModal(false);
};

// Function to handle sidebar navigation with confirmation
const handleSidebarNavigation = (section) => {
  // If we're currently on results page and trying to navigate away
  if (recommendations && activeSection === 'results' && section !== 'results') {
    setPendingSection(section);
    setShowConfirmModal(true);
  } else {
    setActiveSection(section);
  }
};

// Function to confirm navigation
const confirmNavigation = () => {
  handleReset();
  if (pendingSection) {
    setActiveSection(pendingSection);
  }
  setShowConfirmModal(false);
  setPendingSection(null);
};

// Function to cancel navigation
const cancelNavigation = () => {
  setShowConfirmModal(false);
  setPendingSection(null);
};

return (
  <Router>
    <div className="app">
      {/* Animated Background Particles */}
      <div className="particles-bg">
        {particles.map(p => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: `${p.x}vw`,
              top: `${p.y}vh`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.color,
              opacity: 0.4,
              transform: `rotate(${p.direction}deg)`,
              filter: 'blur(0.5px)'
            }}
          />
        ))}
      </div>
      
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="confirmation-modal-overlay">
          <div className="confirmation-modal">
            <div className="modal-header">
              <span className="modal-icon">⚠️</span>
              <h3>Reset Assessment?</h3>
            </div>
            <div className="modal-content">
              <p>Your current recommendations will be lost. Are you sure you want to start a new assessment?</p>
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel-btn" onClick={cancelNavigation}>
                Cancel
              </button>
              <button className="modal-btn confirm-btn" onClick={confirmNavigation}>
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Confetti Celebration */}
      {confetti && (
        <div className="confetti-container">
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}vw`,
                animationDelay: `${Math.random() * 2}s`,
                background: ['#FF7EB3', '#7AF2FF', '#FFDE59', '#B28DFF', '#6BEFC9'][
                  Math.floor(Math.random() * 5)
                ]
              }}
            />
          ))}
        </div>
      )}
      
      <Header onReset={handleReset} />
      
      {/* Main Content Wrapper */}
      <div className="content-wrapper">
        <div className="dashboard-container">
          {/* VIBRANT SIDEBAR - Completely Redesigned */}
          <div className="dashboard-sidebar">
            {/* Floating Garden Background */}
            <div className="sidebar-garden-bg">
              <div className="floating-flower flower-1">🌸</div>
              <div className="floating-flower flower-2">🌼</div>
              <div className="floating-flower flower-3">🌺</div>
              <div className="floating-leaf leaf-1">🍃</div>
              <div className="floating-leaf leaf-2">🌿</div>
            </div>
            
            {/* Sidebar Header */}
            <div className="sidebar-header">
              <div className="sidebar-logo">
                <div className="logo-text">
                  <h3>Wellness Assistant</h3>
                  <p>Nurture Your Mind</p>
                </div>
              </div>
              <div className="sidebar-status">
                <div className={`status-indicator ${apiStatus}`}>
                  <span className="status-dot"></span>
                  <span className="status-text">
                    {apiStatus === 'healthy' ? 'Connected' : 
                     apiStatus === 'unreachable' ? 'Local Mode' : 'Connecting...'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="sidebar-nav">
              <button
                className={`nav-item ${activeSection === 'welcome' ? 'active' : ''}`}
                onClick={() => handleSidebarNavigation('welcome')}
              >
                <div className="nav-item-content">
                  <span className="nav-icon">🏠</span>
                  <div className="nav-text">
                    <div className="nav-title">Welcome</div>
                    <div className="nav-subtitle">How It Works</div>
                  </div>
                  <span className="nav-arrow">→</span>
                </div>
              </button>
              
              <button
                className={`nav-item ${activeSection === 'assessment' ? 'active' : ''}`}
                onClick={() => handleSidebarNavigation('assessment')}
              >
                <div className="nav-item-content">
                  <span className="nav-icon">📝</span>
                  <div className="nav-text">
                    <div className="nav-title">Start Assessment</div>
                    <div className="nav-subtitle">Answer questions</div>
                  </div>
                  <span className="nav-arrow">→</span>
                </div>
              </button>
              
              {recommendations && (
                <button
                  className={`nav-item ${activeSection === 'results' ? 'active' : ''}`}
                  onClick={() => setActiveSection('results')}
                >
                  <div className="nav-item-content">
                    <span className="nav-icon">🌸</span>
                    <div className="nav-text">
                      <div className="nav-title">Your Results</div>
                      <div className="nav-subtitle">Personalized recommendations</div>
                    </div>
                    <span className="nav-badge">New!</span>
                  </div>
                </button>
              )}
            </nav>
            
            {/* Sidebar Footer */}
            <div className="sidebar-footer">
              <div className="motivation-quote">
                <span className="quote-icon">💭</span>
                <p>"Every flower blooms in its own time"</p>
              </div>
              <div className="sidebar-actions">
                <button className="reset-btn" onClick={handleReset}>
                  <span className="reset-icon">🔄</span>
                  Start Over
                </button>
              </div>
            </div>
          </div>
          
          {/* Main Content Area */}
          <main className="dashboard-main">
            {/* API Status Indicators */}
            {apiStatus === 'checking' && (
              <div className="api-status-card glow">
                <div className="status-loader">
                  <div className="spinner"></div>
                  <span>Connecting to Wellness Garden...</span>
                </div>
              </div>
            )}
            
            {apiStatus === 'unreachable' && (
              <div className="api-warning-card bloom">
                <div className="warning-content">
                  <span className="warning-icon">🌼</span>
                  <div>
                    <h3>Local Bloom Mode</h3>
                    <p>Growing recommendations from your local garden. Your data stays with you.</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Loading Animation */}
            {isLoading && (
              <div className="mindful-loading-overlay">
                <div className="mindful-loading-container">
                  {/* Mental Health Wellness Spinner */}
                  <div className="wellness-spinner">
                    <div className="breathing-center">
                      <div className="breathing-dot"></div>
                    </div>
                    
                    {/* Calming rings */}
                    <div className="calm-ring ring-1"></div>
                    <div className="calm-ring ring-2"></div>
                    <div className="calm-ring ring-3"></div>
                    
                    {/* Progress dots */}
                    <div className="progress-dots">
                      {[1, 2, 3, 4].map((dot) => (
                        <div key={dot} className="progress-dot" style={{ animationDelay: `${dot * 0.2}s` }}></div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Loading message with mental health theme */}
                  <div className="mindful-message">
                    <h3>Nurturing Your Well-being</h3>
                    <p className="loading-subtitle">Breathing in calm, breathing out stress...</p>
                    
                    <div className="mindful-steps">
                      <div className="mindful-step active">
                        <span className="step-icon">🧘</span>
                        <span className="step-text">Assessing</span>
                      </div>
                      <div className="mindful-step">
                        <span className="step-icon">💭</span>
                        <span className="step-text">Analyzing</span>
                      </div>
                      <div className="mindful-step">
                        <span className="step-icon">🌱</span>
                        <span className="step-text">Growing</span>
                      </div>
                      <div className="mindful-step">
                        <span className="step-icon">✨</span>
                        <span className="step-text">Blooming</span>
                      </div>
                    </div>
                    
                    {/* Affirmation */}
                    <div className="affirmation">
                      <span className="affirmation-icon">💖</span>
                      <p>"Every breath brings you closer to peace"</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Dashboard Content */}
            {!isLoading && (
              <>
                {activeSection === 'welcome' && !recommendations && (
                  <div className="home-garden">
                    {/* WELCOME BOX */}
                    <div className="welcome-box-wide">
                      <div className="welcome-header">
                        <h1 className="welcome-title">
                          <span className="title-sparkle">✨</span>
                          Welcome to Your Mental Wellness Assessment
                          <span className="title-sparkle">✨</span>
                        </h1>
                        <p className="welcome-subtitle">Nurture Your Mind, Grow Your Peace</p>
                      </div>
                      
                      <div className="welcome-features">
                        <div className="welcome-feature">
                          <div className="feature-icon">🧠</div>
                          <div className="feature-content">
                            <h3>Personalized Insights</h3>
                            <p>Get tailored recommendations based on your unique mental state</p>
                          </div>
                        </div>
                        <div className="welcome-feature">
                          <div className="feature-icon">🌿</div>
                          <div className="feature-content">
                            <h3>Holistic Approach</h3>
                            <p>Address stress, anxiety, and depression through evidence-based activities</p>
                          </div>
                        </div>
                        <div className="welcome-feature">
                          <div className="feature-icon">🎯</div>
                          <div className="feature-content">
                            <h3>Actionable Steps</h3>
                            <p>Receive clear, practical activities you can start immediately</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="welcome-cta">
                        <div className="cta-flower">
                          <span className="flower-icon">🌸</span>
                          <p>Begin your journey to better mental health today</p>
                          <span className="flower-icon">🌼</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* FEATURE PLANTS SECTION */}
                    <div className="features-container">
                      <h2 className="features-title">How It Works</h2>
                      <div className="features-grid">
                        <div className="feature-card" data-delay="0">
                          <div className="feature-number">1</div>
                          <div className="feature-details">
                            <h3>Complete Assessment</h3>
                            <p>Answer simple questions about your stress, anxiety, and mood</p>
                          </div>
                          <div className="feature-wave"></div>
                        </div>
                        <div className="feature-card" data-delay="200">
                          <div className="feature-number">2</div>
                          <div className="feature-details">
                            <h3>Get Personalized Analysis</h3>
                            <p>Receive detailed scores and insights about your mental wellness</p>
                          </div>
                          <div className="feature-wave"></div>
                        </div>
                        <div className="feature-card" data-delay="400">
                          <div className="feature-number">3</div>
                          <div className="feature-details">
                            <h3>Receive Recommendations</h3>
                            <p>Get custom activities designed specifically for your needs</p>
                          </div>
                          <div className="feature-wave"></div>
                        </div>
                      </div>
                      
                      {/* Start Assessment Button */}
                      <div className="how-it-works-cta">
                        <button 
                          className="start-assessment-btn"
                          onClick={() => setActiveSection('assessment')}
                        >
                          Start Your Assessment Now ➡️
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeSection === 'assessment' && !recommendations && (
                  <div className="home-garden">
                    {/* ASSESSMENT FORM */}
                    <div className="assessment-container-wide">
                      <div className="assessment-header">
                        <h2>Your Wellness Assessment</h2>
                        <p>Take a few minutes to help us understand your current state</p>
                      </div>
                      <AssessmentForm onSubmit={handleAssessmentSubmit} isLoading={isLoading} />
                    </div>
                  </div>
                )}
                
                {(activeSection === 'results' || recommendations) && recommendations && (
                  <div className="home-garden">
                    <Recommendations 
                      data={recommendations} 
                      onReset={handleReset} 
                    />
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
      
      <Footer />
      
      {/* Floating Action Button */}
      <button 
        className="garden-fab"
        onClick={handleReset}
        title="Start New Assessment"
      >
        <span className="fab-icon">🌱</span>
      </button>
      
      <style jsx>{`
        .app {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, 
            #ce5f7dff 0%, 
            #9fc4d6ff 25%, 
            #9afab5ff 50%, 
            #eed68dff 75%, 
            #F0E6FF 100%);
          position: relative;
          overflow-x: hidden;
        }
        
        .content-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }
        
        .dashboard-container {
          display: flex;
          flex: 1;
          min-height: calc(100vh - 120px);
          position: relative;
          z-index: 1;
        }
        
        /* Confirmation Modal Styles */
        .confirmation-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease-out;
        }
        
        .confirmation-modal {
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.95) 0%,
            rgba(255, 255, 255, 0.85) 100%);
          border-radius: 25px;
          padding: 2.5rem;
          max-width: 500px;
          width: 90%;
          box-shadow: 
            0 25px 80px rgba(255, 126, 179, 0.3),
            0 10px 40px rgba(122, 242, 255, 0.2);
          border: 3px solid rgba(255, 126, 179, 0.4);
          backdrop-filter: blur(20px);
          animation: modalSlideIn 0.4s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .modal-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .modal-icon {
          font-size: 2.5rem;
          animation: warningPulse 2s infinite;
        }
        
        @keyframes warningPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        .modal-header h3 {
          margin: 0;
          background: linear-gradient(135deg, #FF7EB3, #FF4D94);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 1.8rem;
        }
        
        .modal-content {
          margin-bottom: 2rem;
        }
        
        .modal-content p {
          color: #4B5563;
          font-size: 1.1rem;
          line-height: 1.6;
          margin: 0;
        }
        
        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }
        
        .modal-btn {
          padding: 0.8rem 2rem;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 120px;
        }
        
        .cancel-btn {
          background: rgba(122, 242, 255, 0.1);
          color: #06B6D4;
          border: 2px solid rgba(122, 242, 255, 0.3);
        }
        
        .cancel-btn:hover {
          background: rgba(122, 242, 255, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(122, 242, 255, 0.2);
        }
        
        .confirm-btn {
          background: linear-gradient(135deg, #FF7EB3, #FF4D94);
          color: white;
          border: 2px solid #FF7EB3;
        }
        
        .confirm-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(255, 126, 179, 0.4);
        }
        
        /* ====== VIBRANT SIDEBAR ====== */
        .dashboard-sidebar {
          width: 320px;
          min-width: 320px;
          background: linear-gradient(180deg, 
            rgba(255, 122, 184, 0.6)
            rgba(255, 122, 184, 0.6) 100%);
          backdrop-filter: blur(20px);
          border-right: 2px solid rgba(255, 126, 179, 0.15);
          padding: 2rem 1.5rem;
          display: flex;
          flex-direction: column;
          box-shadow: 
            5px 0 40px rgba(255, 126, 179, 0.15),
            inset 1px 0 0 rgba(255, 255, 255, 0.5);
          position: sticky;
          top: 0;
          height: calc(100vh - 80px);
          overflow-y: auto;
          z-index: 2;
          border-radius: 0 35px 35px 0;
        }
        
        /* Floating Garden Background */
        .sidebar-garden-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: -1;
        }
        
        .floating-flower, .floating-leaf {
          position: absolute;
          font-size: 2rem;
          opacity: 0.3;
          animation: float 15s infinite ease-in-out;
        }
        
        .flower-1 {
          top: 20%;
          left: 20%;
          animation-delay: 0s;
          animation-duration: 20s;
        }
        
        .flower-2 {
          top: 60%;
          right: 15%;
          animation-delay: 5s;
          animation-duration: 25s;
        }
        
        .flower-3 {
          bottom: 30%;
          left: 25%;
          animation-delay: 10s;
          animation-duration: 18s;
        }
        
        .leaf-1 {
          top: 40%;
          right: 25%;
          font-size: 1.8rem;
          animation-delay: 2s;
          animation-duration: 22s;
        }
        
        .leaf-2 {
          bottom: 20%;
          right: 30%;
          font-size: 1.8rem;
          animation-delay: 8s;
          animation-duration: 19s;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) rotate(5deg);
          }
          66% {
            transform: translateY(10px) rotate(-5deg);
          }
        }
        /* Mental Health Wellness Loading Animation */
.mindful-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(255, 248, 240, 0.95) 0%, 
    rgba(240, 249, 255, 0.95) 50%,
    rgba(240, 255, 244, 0.95) 100%);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.mindful-loading-container {
  text-align: center;
  max-width: 600px;
  padding: 3rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 30px;
  box-shadow: 
    0 25px 60px rgba(79, 138, 139, 0.15),
    0 10px 30px rgba(159, 122, 234, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.wellness-spinner {
  width: 120px;
  height: 120px;
  margin: 0 auto 2.5rem;
  position: relative;
}

.breathing-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4F8A8B, #9F7AEA);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
}

.breathing-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  animation: mindfulBreathing 3s ease-in-out infinite;
}

@keyframes mindfulBreathing {
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(0.7);
    opacity: 1;
  }
}

.calm-ring {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 3px solid;
  border-radius: 50%;
  opacity: 0;
}

.ring-1 {
  border-color: rgba(79, 138, 139, 0.3);
  animation: calmPulse 2s ease-out infinite;
}

.ring-2 {
  border-color: rgba(159, 122, 234, 0.2);
  animation: calmPulse 2s ease-out infinite 0.66s;
}

.ring-3 {
  border-color: rgba(104, 211, 145, 0.15);
  animation: calmPulse 2s ease-out infinite 1.33s;
}

@keyframes calmPulse {
  0% {
    transform: scale(0.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

.progress-dots {
  position: absolute;
  top: -20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.progress-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4F8A8B, #9F7AEA);
  animation: dotBounce 1.5s ease-in-out infinite;
}

@keyframes dotBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

.mindful-message h3 {
  background: linear-gradient(135deg, #4F8A8B, #9F7AEA);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.75rem;
  font-size: 1.8rem;
}

.loading-subtitle {
  color: #6B7280;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.mindful-steps {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 2.5rem 0;
  flex-wrap: wrap;
}

.mindful-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  min-width: 100px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid rgba(79, 138, 139, 0.1);
  transition: all 0.3s ease;
  opacity: 0.6;
}

.mindful-step.active {
  background: linear-gradient(135deg, rgba(79, 138, 139, 0.1), rgba(159, 122, 234, 0.1));
  border-color: rgba(79, 138, 139, 0.3);
  opacity: 1;
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(79, 138, 139, 0.15);
}

.step-icon {
  font-size: 1.8rem;
  animation: gentleSway 3s infinite ease-in-out;
}

.mindful-step.active .step-icon {
  animation: activeIcon 2s infinite ease-in-out;
}

@keyframes gentleSway {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}

@keyframes activeIcon {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.step-text {
  color: #4A5568;
  font-weight: 600;
  font-size: 0.9rem;
}

.mindful-step.active .step-text {
  color: #4F8A8B;
}

.affirmation {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, 
    rgba(79, 138, 139, 0.1), 
    rgba(159, 122, 234, 0.1));
  border-radius: 25px;
  margin-top: 1.5rem;
  animation: affirmationPulse 4s infinite alternate;
}

@keyframes affirmationPulse {
  0% {
    box-shadow: 0 5px 20px rgba(79, 138, 139, 0.1);
  }
  100% {
    box-shadow: 0 10px 30px rgba(159, 122, 234, 0.15);
  }
}

.affirmation-icon {
  font-size: 1.5rem;
  animation: heartbeat 1.5s infinite ease-in-out;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.1); }
  50% { transform: scale(1); }
  75% { transform: scale(1.05); }
}

.affirmation p {
  color: #4F8A8B;
  margin: 0;
  font-style: italic;
  font-weight: 500;
}
        /* Sidebar Header */
        .sidebar-header {
          margin-bottom: 2.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid rgba(255, 126, 179, 0.1);
        }
        
        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .logo-icon {
          font-size: 2.5rem;
          background: linear-gradient(135deg, #FF7EB3, #7AF2FF);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gentleBounce 4s infinite;
        }
        
        .logo-text h3 {
          color: #1F2937;
          margin: 0;
          font-size: 1.4rem;
          font-weight: 700;
          background: linear-gradient(135deg, #471c2eff, #2b484bff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .logo-text p {
          color: #062564ff;
          margin: 0.25rem 0 0;
          font-size: 0.9rem;
          font-weight: 500;
        }
        
        /* Status Indicator */
        .sidebar-status {
          margin-top: 1rem;
        }
        
        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 20px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
        }
        
        .status-indicator.healthy {
          border-color: rgba(107, 239, 201, 0.3);
          background: rgba(107, 239, 201, 0.1);
        }
        
        .status-indicator.unreachable {
          border-color: rgba(255, 222, 89, 0.3);
          background: rgba(255, 222, 89, 0.1);
        }
        
        .status-indicator.checking {
          border-color: rgba(122, 242, 255, 0.3);
          background: rgba(122, 242, 255, 0.1);
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #6BEFC9;
        }
        
        .status-indicator.healthy .status-dot {
          background: #6BEFC9;
          animation: pulse 2s infinite;
        }
        
        .status-indicator.unreachable .status-dot {
          background: #FFDE59;
        }
        
        .status-indicator.checking .status-dot {
          background: #7AF2FF;
          animation: pulse 1s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .status-text {
          font-size: 0.85rem;
          font-weight: 500;
          color: #4B5563;
        }
        
        /* Progress Indicator */
        .sidebar-progress {
          margin-bottom: 2.5rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8));
          border-radius: 20px;
          border: 1px solid rgba(255, 126, 179, 0.2);
          box-shadow: 0 10px 30px rgba(255, 126, 179, 0.1);
        }
        
        .progress-label {
          font-weight: 600;
          color: #1F2937;
          margin-bottom: 1rem;
          font-size: 1rem;
        }
        
        .progress-bar {
          height: 6px;
          background: rgba(255, 126, 179, 0.1);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 1.5rem;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #FF7EB3, #7AF2FF);
          border-radius: 3px;
          transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
        }
        
        .progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, 
            transparent, 
            rgba(255, 255, 255, 0.5), 
            transparent);
          animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .progress-steps {
          display: flex;
          justify-content: space-between;
          position: relative;
        }
        
        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 2;
        }
        
        .step-number {
          width: 28px;
          height: 28px;
          background: white;
          border: 2px solid rgba(255, 126, 179, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 600;
          color: #6B7280;
          margin-bottom: 0.5rem;
          transition: all 0.3s ease;
        }
        
        .step.active .step-number {
          background: linear-gradient(135deg, #FF7EB3, #7AF2FF);
          color: white;
          border-color: #FF7EB3;
          transform: scale(1.2);
          box-shadow: 0 5px 15px rgba(255, 126, 179, 0.3);
        }
        
        .step-name {
          font-size: 0.8rem;
          color: #6B7280;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .step.active .step-name {
          color: #FF7EB3;
          font-weight: 600;
        }
        
        /* Navigation */
        .sidebar-nav {
          flex: 1;
          margin-bottom: 2rem;
        }
        
        .nav-item {
          width: 100%;
          margin-bottom: 0.75rem;
          padding: 1.25rem 1.5rem;
          background: white;
          border: 2px solid rgba(255, 126, 179, 0.1);
          border-radius: 16px;
          text-align: left;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .nav-item:hover {
          transform: translateX(5px);
          border-color: rgba(255, 126, 179, 0.3);
          box-shadow: 0 10px 30px rgba(255, 126, 179, 0.15);
        }
        
        .nav-item.active {
          background: linear-gradient(135deg, rgba(255, 126, 179, 0.1), rgba(122, 242, 255, 0.1));
          border-color: #FF7EB3;
          transform: translateX(10px);
          box-shadow: 0 15px 40px rgba(255, 126, 179, 0.2);
        }
        
        .nav-item-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          position: relative;
          z-index: 2;
        }
        
        .nav-icon {
          font-size: 1.5rem;
          min-width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #FF7EB3, #7AF2FF);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .nav-item.active .nav-icon {
          animation: gentleBounce 2s infinite;
        }
        
        .nav-text {
          flex: 1;
        }
      /* Particles Background - Fixed */
.particles-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  border-radius: 50%;
  animation: particleFloat 20s infinite ease-in-out;
  box-shadow: 
    0 0 20px rgba(255, 255, 255, 0.3),
    0 0 40px rgba(255, 126, 179, 0.2);
}

@keyframes particleFloat {
  0%, 100% { 
    transform: translateY(0) rotate(0deg);
    opacity: 0.4;
  }
  25% { 
    transform: translateY(-20px) rotate(90deg);
    opacity: 0.6;
  }
  50% { 
    transform: translateY(0) rotate(180deg);
    opacity: 0.4;
  }
  75% { 
    transform: translateY(20px) rotate(270deg);
    opacity: 0.6;
  }
}

/* Make sure content is above particles */
.content-wrapper {
  position: relative;
  z-index: 1;
}  
        .nav-title {
          font-weight: 600;
          color: #1F2937;
          margin-bottom: 0.25rem;
          font-size: 1rem;
        }
        
        .nav-subtitle {
          font-size: 0.85rem;
          color: #6B7280;
        }
        
        .nav-arrow, .nav-badge {
          font-size: 0.9rem;
          color: #FF7EB3;
          font-weight: 600;
        }
        
        .nav-badge {
          background: linear-gradient(135deg, #FF7EB3, #7AF2FF);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          animation: badgePulse 2s infinite;
        }
        
        @keyframes badgePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        /* Stats Card */
        .sidebar-stats {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85));
          border-radius: 20px;
          border: 1px solid rgba(178, 141, 255, 0.2);
          box-shadow: 0 10px 30px rgba(178, 141, 255, 0.1);
        }
        
        .stats-header {
          font-weight: 600;
          color: #1F2937;
          margin-bottom: 1rem;
          font-size: 0.95rem;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        
        .stat-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: white;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
        }
        
        .stat-icon {
          font-size: 1.5rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #B28DFF, #6BEFC9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .stat-value {
          font-weight: 700;
          color: #1F2937;
          font-size: 1rem;
        }
        
        .stat-label {
          font-size: 0.8rem;
          color: #6B7280;
        }
        
        /* Sidebar Footer */
        .sidebar-footer {
          padding-top: 1.5rem;
          border-top: 2px solid rgba(255, 126, 179, 0.1);
        }
        
        .motivation-quote {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: rgba(255, 126, 179, 0.05);
          border-radius: 12px;
          border-left: 4px solid #FF7EB3;
        }
        
        .quote-icon {
          font-size: 1.2rem;
          color: #FF7EB3;
        }
        
        .motivation-quote p {
          margin: 0;
          font-size: 0.9rem;
          color: #4B5563;
          font-style: italic;
          line-height: 1.4;
        }
        
        .sidebar-actions {
          display: flex;
          gap: 0.75rem;
        }
        
        .reset-btn, .help-btn {
          flex: 1;
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        
        .reset-btn {
          background: linear-gradient(135deg, #FF7EB3, #FF4D94);
          color: white;
        }
        
        .reset-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(255, 126, 179, 0.4);
        }
        
        .help-btn {
          background: rgba(122, 242, 255, 0.1);
          color: #06B6D4;
          border: 1px solid rgba(122, 242, 255, 0.3);
        }
        
        .help-btn:hover {
          background: rgba(122, 242, 255, 0.2);
          transform: translateY(-2px);
        }
        
        .reset-icon, .help-icon {
          font-size: 1.1rem;
        }
        
        /* Main Content Area */
        .dashboard-main {
          flex: 1;
          padding: 2rem 3rem;
          overflow-y: auto;
          height: calc(100vh - 80px);
          position: relative;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 35px 0 0 35px;
          margin-left: -35px;
          padding-left: calc(3rem + 35px);
        }
        
        /* Ensure the main content respects the footer */
        .dashboard-main::-webkit-scrollbar {
          width: 8px;
        }
        
        .dashboard-main::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        
        .dashboard-main::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #FF7EB3, #7AF2FF);
          border-radius: 4px;
        }
        
        .dashboard-main::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #FF4D94, #2BD2FF);
        }
        
        /* The rest of your existing CSS for welcome box, features, etc. */
        /* Keep all the existing CSS from .home-garden downwards... */
        
        .home-garden {
        
          min-height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        @keyframes gardenGrow {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        /* WELCOME BOX - WIDER AND MORE VIBRANT */
        .welcome-box-wide {
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.95) 0%,
            rgba(255, 255, 255, 0.85) 100%);
          border-radius: 35px;
          padding: 4rem;
          margin: 0 auto 4rem;
          max-width: 1200px;
          width: 90%;
          box-shadow: 
            0 25px 80px rgba(255, 126, 179, 0.25),
            0 10px 40px rgba(122, 242, 255, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          border: 3px solid rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(30px);
          position: relative;
          overflow: hidden;
          animation: welcomeFloat 1s ease-out;
        }
        
        @keyframes welcomeFloat {
          0% {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
          
          .welcome-header {
            text-align: center;
            margin-bottom: 3rem;
            position: relative;
            z-index: 2;
          }
          
          .welcome-title {
            font-size: 3.2rem;
            font-weight: 800;
            margin: 0 0 1.5rem;
            background: linear-gradient(135deg, 
              #FF7EB3 0%, 
              #FF4D94 25%, 
              #bd3a77ff 50%, 
              #8b118bff 75%, 
              #5a0b36ff 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            line-height: 1.2;
            animation: titleShimmer 3s infinite alternate;
          }
          
          @keyframes titleShimmer {
            0% {
              background-position: 0% 50%;
            }
            100% {
              background-position: 100% 50%;
            }
          }
          
          .title-sparkle {
            display: inline-block;
            margin: 0 1rem;
            animation: sparkleSpin 4s infinite linear;
            font-size: 2.5rem;
          }
          
          @keyframes sparkleSpin {
            0% { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(180deg) scale(1.3); }
            100% { transform: rotate(360deg) scale(1); }
          }
          
          .welcome-subtitle {
            font-size: 1.6rem;
            color: #4B5563;
            font-weight: 500;
            margin: 0;
            position: relative;
            display: inline-block;
          }
          
          .welcome-subtitle:after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 20%;
            right: 20%;
            height: 4px;
            background: linear-gradient(90deg, 
              transparent, 
              #FF7EB3, 
              #7AF2FF, 
              #FFDE59, 
              transparent);
            border-radius: 2px;
            animation: subtitleGlow 3s infinite alternate;
          }
          
          @keyframes subtitleGlow {
            0% { opacity: 0.5; }
            100% { opacity: 1; }
          }
          
          .welcome-features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2.5rem;
            margin: 3rem 0;
          }
          
          .welcome-feature {
            display: flex;
            align-items: flex-start;
            gap: 1.5rem;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.7);
            border-radius: 25px;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
            overflow: hidden;
            border: 2px solid transparent;
          }
          
          .welcome-feature:hover {
            transform: translateY(-10px);
            background: rgba(255, 255, 255, 0.9);
            border-color: #FF7EB3;
            box-shadow: 0 20px 50px rgba(255, 126, 179, 0.2);
          }
          
          .welcome-feature:before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 5px;
            background: linear-gradient(90deg, #FF7EB3, #7AF2FF, #FFDE59);
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          
          .welcome-feature:hover:before {
            opacity: 1;
          }
          
          .feature-icon {
            font-size: 3.5rem;
            background: linear-gradient(135deg, #FF7EB3, #7AF2FF);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            flex-shrink: 0;
            animation: iconFloat 3s infinite ease-in-out;
          }
          
          @keyframes iconFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          
          .feature-content h3 {
            color: #1F2937;
            margin: 0 0 0.8rem;
            font-size: 1.4rem;
          }
          
          .feature-content p {
            color: #6B7280;
            margin: 0;
            line-height: 1.6;
            font-size: 1.05rem;
          }
          
          .welcome-cta {
            text-align: center;
            margin-top: 3rem;
          }
          
          .cta-flower {
            display: inline-flex;
            align-items: center;
            gap: 1.5rem;
            padding: 1.5rem 3rem;
            background: linear-gradient(135deg, 
              rgba(255, 126, 179, 0.15), 
              rgba(122, 242, 255, 0.15),
              rgba(255, 222, 89, 0.15));
            border-radius: 50px;
            backdrop-filter: blur(20px);
            border: 2px solid rgba(255, 126, 179, 0.3);
            animation: ctaPulse 2s infinite alternate;
          }
          
          @keyframes ctaPulse {
            0% {
              box-shadow: 0 10px 40px rgba(255, 126, 179, 0.2);
              border-color: rgba(255, 126, 179, 0.3);
            }
            100% {
              box-shadow: 0 15px 50px rgba(122, 242, 255, 0.3);
              border-color: rgba(122, 242, 255, 0.4);
            }
          }
          
          .flower-icon {
            font-size: 2rem;
            animation: flowerBlink 2s infinite;
          }
          
          @keyframes flowerBlink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          
          .cta-flower p {
            color: #1F2937;
            font-weight: 600;
            font-size: 1.2rem;
            margin: 0;
          }
          
          /* Start Assessment Button */
          .start-assessment-btn {
            padding: 1.2rem 3rem;
            background: linear-gradient(135deg, #FF7EB3, #7AF2FF);
            border: none;
            border-radius: 50px;
            color: white;
            font-weight: 600;
            font-size: 1.2rem;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 10px 30px rgba(255, 126, 179, 0.3);
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
          }
          
          .start-assessment-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 40px rgba(255, 126, 179, 0.4);
          }
          
          /* Features Container */
          .features-container {
            max-width: 1500px;
            margin: 0 auto 4rem;
            width: 100%;
          }
          
          .features-title {
            text-align: center;
            font-size: 2.8rem;
            margin: 0 0 3rem;
            background: linear-gradient(135deg, #162a61ff, #700e70ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2.5rem;
          }
          
          .feature-card {
            background: linear-gradient(135deg, 
              rgba(255, 255, 255, 0.95),
              rgba(230, 141, 168, 0.85));
            border-radius: 30px;
            padding: 2.5rem;
            position: relative;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.6);
            transition: all 0.4s ease;
            opacity: 0;
            animation: cardSlide 0.6s ease-out forwards;
          }
          
          .feature-card:hover {
            transform: translateY(-15px);
            box-shadow: 0 30px 80px rgba(255, 126, 179, 0.25);
          }
          
          @keyframes cardSlide {
            from {
              opacity: 0;
              transform: translateY(40px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .feature-card[data-delay="0"] { animation-delay: 0.1s; }
          .feature-card[data-delay="200"] { animation-delay: 0.3s; }
          .feature-card[data-delay="400"] { animation-delay: 0.5s; }
          
          .feature-number {
            position: absolute;
            top: -20px;
            left: 30px;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #FF7EB3, #7AF2FF);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8rem;
            font-weight: bold;
            box-shadow: 0 10px 30px rgba(255, 126, 179, 0.4);
            z-index: 2;
          }
          
          .feature-details h3 {
            color: #1F2937;
            margin: 1rem 0 1rem;
            font-size: 1.5rem;
          }
          
          .feature-details p {
            color: #6B7280;
            line-height: 1.7;
            font-size: 1.1rem;
            margin: 0;
          }
          
          .feature-wave {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 5px;
            background: linear-gradient(90deg, #FF7EB3, #7AF2FF, #FFDE59);
            border-radius: 0 0 30px 30px;
            opacity: 0.7;
          }
          
          /* How It Works CTA */
          .how-it-works-cta {
            text-align: center;
            margin-top: 4rem;
            padding-top: 3rem;
            border-top: 2px solid rgba(255, 126, 179, 0.1);
          }
          
          /* Assessment Container */
          .assessment-container-wide {
           
            background: linear-gradient(180deg, 
             rgba(174, 126, 184, 0.98) 10%,
             rgba(141, 169, 247, 0.6) 90%);
            border-radius: 35px;
            padding: 4rem;
            margin: 0 auto;
            max-width: 1200px;
            width: 90%;
            box-shadow: 
              0 25px 80px rgba(122, 242, 255, 0.25),
              0 10px 40px rgba(255, 222, 89, 0.2);
            border: 3px solid rgba(122, 242, 255, 0.4);
            backdrop-filter: blur(30px);
            animation: assessmentBloom 0.8s ease-out;
          }
          
          @keyframes assessmentBloom {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .assessment-header {
            text-align: center;
            margin-bottom: 3rem;
          }
          
          .assessment-header h2 {
            font-size: 2.5rem;
            margin: 0 0 1rem;
            background: linear-gradient(135deg, #1d1317ff 50%, #0a334bff 50%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .assessment-header p {
            color: #240844ff;
            font-size: 1.5rem;
            margin: 0;
          }
          
          /* API Status Cards */
          .api-status-card {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85));
            border-radius: 25px;
            padding: 2.5rem;
            margin: 2rem auto;
            max-width: 500px;
            text-align: center;
            box-shadow: 0 15px 50px rgba(255, 126, 179, 0.2);
            border: 3px solid rgba(255, 126, 179, 0.3);
            backdrop-filter: blur(20px);
          }
          
          .glow {
            animation: glowPulse 2.5s infinite alternate;
          }
          
          @keyframes glowPulse {
            0% {
              box-shadow: 0 15px 40px rgba(255, 126, 179, 0.3);
              border-color: rgba(255, 126, 179, 0.3);
            }
            50% {
              box-shadow: 0 20px 60px rgba(122, 242, 255, 0.4);
              border-color: rgba(122, 242, 255, 0.4);
            }
            100% {
              box-shadow: 0 15px 50px rgba(255, 222, 89, 0.3);
              border-color: rgba(255, 222, 89, 0.3);
            }
          }
          
          .status-loader {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1.5rem;
          }
          
          .spinner {
            width: 60px;
            height: 60px;
            border: 4px solid rgba(255, 255, 255, 0.8);
            border-top: 4px solid #FF7EB3;
            border-right: 4px solid #7AF2FF;
            border-bottom: 4px solid #FFDE59;
            border-radius: 50%;
            animation: spin 1.2s linear infinite;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .api-warning-card {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85));
            border: 3px solid #FFDE59;
            border-radius: 25px;
            padding: 2rem;
            margin: 2rem auto;
            max-width: 700px;
            animation: bloomIn 0.8s ease-out;
            box-shadow: 0 15px 40px rgba(255, 222, 89, 0.25);
            backdrop-filter: blur(20px);
          }
          
          @keyframes bloomIn {
            from {
              opacity: 0;
              transform: scale(0.9) translateY(20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
          
          .warning-content {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            color: #D97706;
          }
          
          .warning-icon {
            font-size: 3rem;
            animation: gentleBounce 3s infinite;
          }
          
          @keyframes gentleBounce {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-10px) rotate(-10deg); }
            50% { transform: translateY(0) rotate(0deg); }
            75% { transform: translateY(-5px) rotate(10deg); }
          }
          
          /* Loading Garden */
          .loading-garden {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 500px;
            padding: 3rem;
          }
          
          .garden-spinner {
            text-align: center;
            max-width: 600px;
            margin: 0 auto;
          }
          
          .flower-spinner {
            width: 120px;
            height: 120px;
            margin: 0 auto 3rem;
            position: relative;
          }
          
          .flower-spinner:before {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 10px solid transparent;
            border-top-color: #FF7EB3;
            border-right-color: #7AF2FF;
            border-bottom-color: #FFDE59;
            border-left-color: #B28DFF;
            animation: flowerSpin 2.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
          }
          
          @keyframes flowerSpin {
            0% {
              transform: rotate(0deg);
              border-top-color: #FF7EB3;
              border-right-color: #7AF2FF;
            }
            33% {
              border-top-color: #7AF2FF;
              border-right-color: #FFDE59;
            }
            66% {
              border-top-color: #FFDE59;
              border-right-color: #B28DFF;
            }
            100% {
              transform: rotate(360deg);
              border-top-color: #FF7EB3;
              border-right-color: #7AF2FF;
            }
          }
          
          .loading-message h3 {
            background: linear-gradient(135deg, #FF7EB3, #7AF2FF, #FFDE59);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 1rem;
            font-size: 2rem;
          }
          
          .loading-steps {
            display: flex;
            justify-content: center;
            gap: 1.5rem;
            margin-top: 3rem;
            flex-wrap: wrap;
          }
          
          .step {
            padding: 0.8rem 1.5rem;
            border-radius: 25px;
            background: rgba(255, 255, 255, 0.9);
            color: #4B5563;
            font-weight: 600;
            font-size: 1rem;
            transition: all 0.4s ease;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
            border: 2px solid transparent;
          }
          
          .step.active {
            background: linear-gradient(135deg, #FF7EB3, #7AF2FF);
            color: white;
            transform: scale(1.15);
            border-color: white;
            animation: stepPulse 2s infinite;
            box-shadow: 0 10px 30px rgba(255, 126, 179, 0.4);
          }
          
          @keyframes stepPulse {
            0%, 100% { 
              box-shadow: 0 10px 30px rgba(255, 126, 179, 0.4);
            }
            50% { 
              box-shadow: 0 15px 40px rgba(122, 242, 255, 0.5);
            }
          }
          
          /* Floating Action Button */
          .garden-fab {
            position: fixed;
            bottom: 2.5rem;
            right: 2.5rem;
            width: 75px;
            height: 75px;
            background: linear-gradient(135deg, #FF7EB3, #7AF2FF);
            border: none;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 
              0 15px 40px rgba(255, 126, 179, 0.5),
              0 5px 15px rgba(122, 242, 255, 0.3);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            z-index: 100;
            animation: fabBounce 2s infinite ease-in-out;
          }
          
          @keyframes fabBounce {
            0%, 100% { 
              transform: translateY(0) scale(1);
              box-shadow: 
                0 15px 40px rgba(255, 126, 179, 0.5),
                0 5px 15px rgba(122, 242, 255, 0.3);
            }
            50% { 
              transform: translateY(-15px) scale(1.1);
              box-shadow: 
                0 25px 60px rgba(255, 126, 179, 0.6),
                0 10px 30px rgba(122, 242, 255, 0.4);
            }
          }
          
          .garden-fab:hover {
            transform: scale(1.2) rotate(180deg);
            animation: none;
            box-shadow: 
              0 25px 60px rgba(255, 126, 179, 0.7),
              0 10px 30px rgba(122, 242, 255, 0.5);
          }
          
          .fab-icon {
            font-size: 2.2rem;
            transition: transform 0.3s ease;
          }
          
          .garden-fab:hover .fab-icon {
            transform: scale(1.3);
          }
          
          /* Responsive Design */
         /* Responsive Design */
        @media (max-width: 1200px) {
          .dashboard-container {
            flex-direction: column;
          }
          
          .dashboard-sidebar {
            width: 100%;
            height: auto;
            min-width: auto;
            position: static;
            border-right: none;
            border-bottom: 2px solid rgba(255, 126, 179, 0.1);
            border-radius: 0 0 35px 35px;
            margin-bottom: 2rem;
          }
          
          .dashboard-main {
            margin-left: 0;
            padding-left: 2rem;
            padding-right: 2rem;
            border-radius: 35px;
            height: auto;
            min-height: auto;
          }
          
          .sidebar-nav {
            display: flex;
            gap: 1rem;
          }
          
          .nav-item {
            flex: 1;
          }
          
          .stats-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .dashboard-main {
            padding: 1.5rem;
          }
          
          .dashboard-sidebar {
            padding: 1.5rem;
          }
          
          .sidebar-nav {
            flex-direction: column;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .sidebar-actions {
            flex-direction: column;
          }
          
          .welcome-box-wide,
          .features-container,
          .assessment-container-wide {
            padding: 2.5rem;
            margin-bottom: 3rem;
          }
          
          .welcome-title {
            font-size: 2.2rem;
          }
          
          .welcome-features {
            grid-template-columns: 1fr;
          }
          
          .features-grid {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 480px) {
          .dashboard-main {
            padding: 1rem;
          }
          
          .welcome-box-wide {
            padding: 1.5rem;
          }
          
          .sidebar-logo {
            flex-direction: column;
            text-align: center;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
        
        /* Add smooth transitions */
        * {
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }
        `}</style>
      </div>
    </Router>
  );
}

export default App;