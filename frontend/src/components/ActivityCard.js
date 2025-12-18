import React, { useState, useEffect } from 'react';
import { FiPlay, FiClock, FiActivity, FiAlertCircle, FiCheck, FiStar, FiThumbsUp, FiThumbsDown, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { INTENSITY_LEVELS } from '../utils/constants';
import { api } from '../utils/api';

const ActivityCard = ({ activity, user_id, assessmentData }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRatedRecently, setHasRatedRecently] = useState(false);
  
  // Temporary disable rating after submission
  const [ratingCooldown, setRatingCooldown] = useState(false);
  
  const handleVideoClick = (e) => {
    e.preventDefault();
    if (activity.video_link) {
      window.open(activity.video_link, '_blank');
    }
  };
  
  const getIntensityColor = (intensity) => {
    return INTENSITY_LEVELS[intensity]?.color || '#64748b';
  };
  
  const handleRating = async () => {
    if (rating === 0) {
      alert('Please select a rating before submitting');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Get assessment data from parent
      const assessmentScores = {
        stress_level: assessmentData?.assessment_scores?.Stress_Level || 5.0,
        anxiety_score: assessmentData?.assessment_scores?.Anxiety_Score || 5.0,
        depression_score: assessmentData?.assessment_scores?.Depression_Score || 5.0,
        sleep_hours: assessmentData?.user_input?.Sleep_Hours || 7.0,
        steps_per_day: assessmentData?.user_input?.Steps_Per_Day || 8000,
        mood_description: assessmentData?.user_input?.Mood || 'Neutral'
      };
      
      // Prepare feedback data
      const feedbackData = {
        user_id: user_id || 'auto',
        recommended_activity_id: activity.id || activity.activity_id || 0,
        activity_rating: rating,
        feedback_comment: feedbackText,
        timestamp: new Date().toISOString(),
        ...assessmentScores
      };
      
      console.log('📤 Submitting rating:', feedbackData);
      
      // Call API
      const response = await api.submitActivityFeedback(feedbackData);
      
      console.log('✅ Rating submitted successfully:', response);
      
      if (response.success) {
        // Temporarily disable rating button for this session
        setHasRatedRecently(true);
        setRatingCooldown(true);
        
        // Store the user_id if it was auto-generated
        if (response.user_id) {
          localStorage.setItem('mental_health_user_id', response.user_id);
        }
        
        alert('Thank you for your feedback!');
        setShowFeedback(false);
        setRating(0);
        setFeedbackText('');
        
        // Remove cooldown after 30 seconds (optional)
        setTimeout(() => {
          setRatingCooldown(false);
        }, 30000);
      }
    } catch (error) {
      console.error('❌ Error submitting feedback:', error);
      alert(`Failed to submit feedback: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If user has recently rated, don't show the feedback form
  useEffect(() => {
    if (hasRatedRecently && showFeedback) {
      setShowFeedback(false);
    }
  }, [hasRatedRecently, showFeedback]);
  
  return (
    <div className={`activity-card medium ${showDetails ? 'expanded' : ''} ${showFeedback ? 'feedback-open' : ''}`}>
      <div className="activity-header">
        <div className="activity-title-section">
          
          <h3>{activity.name}</h3>
          <div className="activity-meta">
            <span className="duration">
              <FiClock />
              {activity.duration} mins
            </span>
            <span className="intensity" style={{ '--intensity-color': getIntensityColor(activity.intensity) }}>
              <FiActivity />
              {activity.intensity}
            </span>
          
          </div>
        </div>
      </div>
      
      <div className="activity-content">
        <div className="activity-summary">
          <p className="description">
            {activity.description || `A ${activity.type.toLowerCase()} activity designed for ${activity.category.toLowerCase()}.`}
          </p>
          
          <div className="action-buttons">
            {activity.video_link && (
              <button
                className="btn btn-primary video-btn"
                onClick={handleVideoClick}
              >
                <FiPlay />
                Watch Guide
              </button>
            )}
            
            <button
              className={`btn btn-secondary ${showDetails ? 'active' : ''}`}
              onClick={() => {
                setShowDetails(!showDetails);
                setShowFeedback(false);
              }}
            >
              {showDetails ? (
                <>
                  <FiChevronUp />
                  Hide Details
                </>
              ) : (
                <>
                  <FiChevronDown />
                  View Details
                </>
              )}
            </button>
            
            <button
              className={`btn btn-outline ${showFeedback ? 'active' : ''} ${hasRatedRecently ? 'rated-disabled' : ''}`}
              onClick={() => {
                if (!hasRatedRecently && !ratingCooldown) {
                  setShowFeedback(!showFeedback);
                  setShowDetails(false);
                }
              }}
              disabled={ratingCooldown}
              title={ratingCooldown ? "Rating option will be available soon" : ""}
            >
              <FiStar />
              {ratingCooldown ? 'Rating Submitted' : (showFeedback ? 'Hide Rating' : 'Rate Activity')}
            </button>
          </div>
        </div>
        
        {/* Details Section - Accordion Style */}
        <div className={`details-section ${showDetails ? 'expanded' : ''}`}>
          <div className="details-content">
            <div className="info-badges">
              <span className="badge">{activity.type}</span>
              <span className="badge">
                <FiClock /> {activity.duration} mins
              </span>
              <span className="badge" style={{ color: getIntensityColor(activity.intensity) }}>
                <FiActivity /> {activity.intensity} Intensity
              </span>
              {activity.equipment && activity.equipment !== 'None' && (
                <span className="badge">
                  🧰 {activity.equipment}
                </span>
              )}
              {hasRatedRecently && !ratingCooldown && (
                <span className="badge rating-badge">
                  <FiStar /> Feedback Submitted
                </span>
              )}
            </div>
            
            <div className="details-columns">
              <div className="details-left">
                <div className="details-group">
                  <h4>
                    <FiCheck />
                    Benefits
                  </h4>
                  <ul className="benefits-list">
                    {activity.benefits && activity.benefits.split('\n').map((benefit, index) => (
                      <li key={index}>{benefit.replace('- ', '')}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="details-group">
                  <h4>Recommended When</h4>
                  <p className="recommended-when">{activity.recommended_when}</p>
                </div>
                
                <div className="details-group">
                  <h4>Step-by-Step Instructions</h4>
                  <ol className="instructions-list">
                    {activity.instructions && activity.instructions.split('\n').map((step, index) => (
                      <li key={index}>{step.replace(/^\d+\.\s*/, '')}</li>
                    ))}
                  </ol>
                </div>
              </div>
              
              <div className="details-right">
                <div className="details-card tips-card">
                  <h5>
                    <FiCheck />
                    Tips
                  </h5>
                  <ul className="tips-list">
                    {activity.tips && activity.tips.split('\n').map((tip, index) => (
                      <li key={index}>{tip.replace('- ', '')}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="details-card precautions-card">
                  <h5>
                    <FiAlertCircle />
                    Precautions
                  </h5>
                  <ul className="precautions-list">
                    {activity.precautions && activity.precautions.split('\n').map((precaution, index) => (
                      <li key={index}>{precaution.replace('- ', '')}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Feedback Section - Accordion Style - Show if not recently rated and not in cooldown */}
        {!hasRatedRecently && !ratingCooldown && (
          <div className={`feedback-section ${showFeedback ? 'expanded' : ''}`}>
            <div className="feedback-content">
              <h4>Rate this Activity</h4>
              
              <div className="rating-section">
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className={`star-btn ${rating >= star ? 'active' : ''}`}
                      onClick={() => setRating(star)}
                    >
                      <FiStar />
                    </button>
                  ))}
                </div>
                <div className="rating-labels">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>
              
              
              <div className="feedback-actions">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowFeedback(false);
                    setRating(0);
                    setFeedbackText('');
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleRating}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .activity-card.medium {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 2px solid transparent;
          margin-bottom: 16px;
          position: relative;
          z-index: 1;
        }
        
        .activity-card.medium:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
          border-color: var(--primary-light);
        }
        
        .activity-card.medium.expanded {
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          z-index: 10;
        }
        
        .activity-card.medium.feedback-open {
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          z-index: 10;
        }
        
        .activity-header {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
          color: white;
          padding: 1.5rem;
        }
        
        .activity-title-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .activity-badge {
          display: inline-block;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.4rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          backdrop-filter: blur(10px);
          align-self: flex-start;
        }
        
        .activity-title-section h3 {
          font-size: 1.3rem;
          font-weight: 600;
          margin: 0;
          line-height: 1.3;
        }
        
        .activity-meta {
          display: flex;
          gap: 1.25rem;
          font-size: 0.85rem;
          opacity: 0.9;
          flex-wrap: wrap;
        }
        
        .duration, .intensity, .user-rating {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .intensity {
          color: var(--intensity-color);
        }
        
        .user-rating {
          color: #ffb300;
        }
        
        .activity-content {
          padding: 0;
        }
        
        .activity-summary {
          padding: 1.5rem;
        }
        
        .description {
          color: var(--gray-700);
          line-height: 1.6;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
        }
        
        .action-buttons {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        
        .btn {
          padding: 0.7rem 1.25rem;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        
        .btn-secondary {
          background: var(--gray-100);
          color: var(--gray-700);
          border: 2px solid var(--gray-300);
        }
        
        .btn-secondary:hover, .btn-secondary.active {
          background: var(--gray-200);
          transform: translateY(-2px);
        }
        
        .btn-outline {
          background: transparent;
          color: var(--primary);
          border: 2px solid var(--primary);
        }
        
        .btn-outline:hover, .btn-outline.active {
          background: var(--primary);
          color: white;
          transform: translateY(-2px);
        }
        
        .btn-outline:disabled {
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
          color: white;
          border-color: #4CAF50;
          cursor: not-allowed;
          opacity: 0.8;
        }
        
        .btn-outline:disabled:hover {
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
          color: white;
          border-color: #4CAF50;
          transform: none;
          box-shadow: none;
        }
        
        .btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none !important;
        }
        
        /* Details Section - Accordion Style */
        .details-section {
          max-height: 0;
          overflow: hidden;
          background: var(--gray-50);
          transition: max-height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          border-top: 1px solid var(--gray-200);
        }
        
        .details-section.expanded {
          max-height: 2000px;
        }
        
        .details-content {
          padding: 2rem;
          opacity: 0;
          transform: translateY(-10px);
          transition: all 0.4s ease 0.1s;
        }
        
        .details-section.expanded .details-content {
          opacity: 1;
          transform: translateY(0);
        }
        
        .info-badges {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }
        
        .badge {
          padding: 0.5rem 1rem;
          background: white;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--gray-700);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        
        .rating-badge {
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
          color: white;
          font-weight: 700;
        }
        
        .details-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }
        
        @media (max-width: 992px) {
          .details-columns {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }
        
        .details-group {
          margin-bottom: 1.5rem;
        }
        
        .details-group h4 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          color: var(--primary);
          font-size: 1.2rem;
          font-weight: 600;
        }
        
        .benefits-list, .tips-list, .precautions-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .benefits-list li, .tips-list li, .precautions-list li {
          padding: 0.75rem;
          padding-left: 2.5rem;
          position: relative;
          line-height: 1.5;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        
        .benefits-list li:before {
          content: "✓";
          color: var(--success);
          position: absolute;
          left: 1rem;
          font-weight: bold;
          font-size: 1.1rem;
        }
        
        .tips-list li:before {
          content: "💡";
          position: absolute;
          left: 1rem;
          font-size: 1.1rem;
        }
        
        .precautions-list li:before {
          content: "⚠️";
          color: var(--warning);
          position: absolute;
          left: 1rem;
          font-size: 1.1rem;
        }
        
        .instructions-list {
          padding-left: 1.5rem;
          margin: 0;
        }
        
        .instructions-list li {
          margin-bottom: 1rem;
          line-height: 1.6;
          padding-left: 0.5rem;
        }
        
        .details-card {
          background: white;
          padding: 1.5rem;
          border-radius: 15px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          margin-bottom: 1.5rem;
        }
        
        .details-card h5 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          color: var(--gray-900);
          font-size: 1.1rem;
          font-weight: 600;
        }
        
        .tips-card {
          border-left: 4px solid #4CAF50;
        }
        
        .precautions-card {
          border-left: 4px solid #FF9800;
        }
        
        /* Feedback Section - Accordion Style */
        .feedback-section {
          max-height: 0;
          overflow: hidden;
          background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
          transition: max-height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          border-top: 1px solid var(--gray-200);
        }
        
        .feedback-section.expanded {
          max-height: 1000px;
        }
        
        .feedback-content {
          padding: 2rem;
          opacity: 0;
          transform: translateY(-10px);
          transition: all 0.4s ease 0.1s;
        }
        
        .feedback-section.expanded .feedback-content {
          opacity: 1;
          transform: translateY(0);
        }
        
        .feedback-content h4 {
          margin: 0 0 0.5rem 0;
          color: var(--gray-900);
          font-size: 1.3rem;
          font-weight: 600;
        }
        
        .activity-type {
          color: var(--gray-600);
          margin-bottom: 2rem;
          font-size: 0.95rem;
        }
        
        .rating-section {
          text-align: center;
          margin: 2rem 0;
        }
        
        .stars {
          display: flex;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        
        .star-btn {
          background: none;
          border: none;
          font-size: 2.5rem;
          color: var(--gray-300);
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0.5rem;
        }
        
        .star-btn:hover {
          transform: scale(1.2);
        }
        
        .star-btn.active {
          color: #ffb300;
        }
        
        .rating-labels {
          display: flex;
          justify-content: space-between;
          color: var(--gray-600);
          font-size: 0.9rem;
          max-width: 400px;
          margin: 0 auto;
        }
        
        .feedback-textarea {
          margin: 2rem 0;
        }
        
        .feedback-textarea label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--gray-700);
          font-weight: 600;
        }
        
        .feedback-textarea textarea {
          width: 100%;
          padding: 1rem;
          border: 2px solid var(--gray-300);
          border-radius: 10px;
          font-size: 1rem;
          font-family: inherit;
          resize: vertical;
          transition: border-color 0.3s ease;
          background: white;
        }
        
        .feedback-textarea textarea:focus {
          outline: none;
          border-color: var(--primary);
        }
        
        .quick-feedback {
          margin: 2rem 0;
        }
        
        .quick-feedback p {
          margin-bottom: 0.75rem;
          color: var(--gray-700);
          font-weight: 600;
        }
        
        .quick-buttons {
          display: flex;
          gap: 1rem;
        }
        
        .quick-btn {
          padding: 0.75rem 1.25rem;
          border: 2px solid var(--gray-300);
          background: white;
          border-radius: 10px;
          color: var(--gray-700);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.95rem;
          flex: 1;
        }
        
        .quick-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
        }
        
        .quick-btn.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }
        
        .feedback-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding-top: 1.5rem;
          border-top: 2px solid var(--gray-200);
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          .action-buttons {
            flex-direction: column;
          }
          
          .action-buttons .btn {
            width: 100%;
            justify-content: center;
          }
          
          .details-content,
          .feedback-content {
            padding: 1.5rem;
          }
          
          .quick-buttons {
            flex-direction: column;
          }
          
          .feedback-actions {
            flex-direction: column;
          }
          
          .feedback-actions .btn {
            width: 100%;
            justify-content: center;
          }
          
          .star-btn {
            font-size: 2rem;
          }
        }
        
        @media (max-width: 480px) {
          .activity-meta {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .info-badges {
            justify-content: center;
          }
          
          .badge {
            font-size: 0.8rem;
            padding: 0.4rem 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ActivityCard;