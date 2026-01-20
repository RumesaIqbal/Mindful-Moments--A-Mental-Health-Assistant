const API_BASE_URL = 'https://mindful-moments-a-mental-health-assistant.onrender.com';

export const api = {
  async submitAssessment(data) {
    const response = await fetch(`${API_BASE_URL}/assess`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit assessment');
    }
    
    return await response.json();
  },
  
  async getAllActivities() {
    const response = await fetch(`${API_BASE_URL}/activities`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch activities');
    }
    
    return await response.json();
  },
  
  async submitActivityFeedback(data) {
    const response = await fetch(`${API_BASE_URL}/activity-feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit feedback');
    }
    
    return await response.json();
  },
  
  async getUserFeedback(userId) {
    const response = await fetch(`${API_BASE_URL}/user-feedback/${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user feedback');
    }
    
    return await response.json();
  },
  
  async getActivityRatings(activityId) {
    const response = await fetch(`${API_BASE_URL}/activity-ratings/${activityId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch activity ratings');
    }
    
    return await response.json();
  },
  
  async getHealth() {
    const response = await fetch(`${API_BASE_URL}/health`);
    
    if (!response.ok) {
      throw new Error('API is not healthy');
    }
    
    return await response.json();
  }
};

export const calculateScoreColor = (score) => {
  if (score <= 3) return '#10b981'; // Green
  if (score <= 6) return '#f59e0b'; // Yellow
  if (score <= 8) return '#ef4444'; // Red
  return '#7c3aed'; // Purple for very high
};

export const getScoreInterpretation = (score, type) => {
  if (score <= 3) return 'Low';
  if (score <= 6) return 'Moderate';
  if (score <= 8) return 'High';
  return 'Very High';
};
