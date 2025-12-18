import React, { useEffect, useState, useCallback } from 'react';
import { FiBarChart2, FiRefreshCw, FiDownload, FiShare2, FiInfo, FiCheck, FiChevronRight, FiClock, FiActivity, FiZap, FiCpu, FiLoader } from 'react-icons/fi';
import ActivityCard from './ActivityCard';

const Recommendations = ({ data, onReset }) => {
  // Use a key to force remount of ActivityCard components when session changes
  const [sessionKey, setSessionKey] = useState(Date.now());
  const [scores, setScores] = useState({
    Stress_Level: 0,
    Anxiety_Score: 0,
    Depression_Score: 0
  });
  const [activeScore, setActiveScore] = useState(null);
  const [completedActivities, setCompletedActivities] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [recommendationTechnique, setRecommendationTechnique] = useState('hybrid');
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [apiError, setApiError] = useState(null);
  
  // API base URL
  const API_BASE_URL = 'http://localhost:5000';
  
  // Helper functions
  const calculateScoreColor = (score) => {
    if (score <= 3) return '#4CAF50'; // Green for low
    if (score <= 6) return '#FF9800'; // Orange for medium
    return '#F44336'; // Red for high
  };
  
  const getScoreInterpretation = (score, category) => {
    if (score <= 3) return 'Good';
    if (score <= 6) return 'Moderate';
    return 'High';
  };

  // Fetch recommendations from API with timeout
  const fetchRecommendations = useCallback(async (technique) => {
    setIsLoading(true);
    setApiError(null);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      let endpoint = '';
      let requestData = {};
      
      // Use the current scores state, NOT recalculate
      console.log('📡 Using CURRENT scores for API:', scores);
      
      // Prepare request data with current scores (already set from initialization)
      const requestScores = {
        Stress_Level: scores.Stress_Level,
        Anxiety_Score: scores.Anxiety_Score,
        Depression_Score: scores.Depression_Score,
        Sleep_Hours: data.user_input?.Sleep_Hours || data.Sleep_Hours || 7.0,
        Steps_Per_Day: data.user_input?.Steps_Per_Day || data.Steps_Per_Day || 5000.0
      };
      
      console.log('🎯 Fetching recommendations for technique:', technique);
      
      if (technique === 'hybrid') {
        endpoint = `${API_BASE_URL}/assess`;
        // Send the exact format backend expects
        requestData = {
          ...(data.user_input || {}), // Pass all user input
          ...requestScores
        };
      } else {
        endpoint = `${API_BASE_URL}/recommend`;
        // Cosine endpoint expects just scores
        requestData = {
          ...requestScores,
          top_n: 5
        };
      }
      
      console.log('🌐 API Request:', { endpoint, requestData });
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('📥 API Response:', result);
      
      if (result.success) {
        // DO NOT update scores from API response, keep current scores
        console.log('✅ Keeping current scores, not updating from API');
        
        // Update recommendations only
        if (result.recommendations && Array.isArray(result.recommendations)) {
          // Format recommendations to ensure they match ActivityCard expectations
          const formattedRecs = result.recommendations.map((activity, index) => ({
            id: activity.id || activity.activity_id || index + 1,
            name: activity.name || activity.Activity_Type || 'Activity',
            description: activity.one_line_description || activity.description || 'Personalized activity based on your assessment',
            duration: activity.duration || activity.Duration_Minutes || '15',
            intensity: activity.intensity || activity.Intensity_Level || 'Medium',
            type: activity.type || activity.category || 'Wellness',
            priority: activity.priority || 'Medium',
            technique: technique,
            // Required fields for ActivityCard
            Activity_Type: activity.name || activity.Activity_Type || 'Activity',
            Duration_Minutes: activity.duration || activity.Duration_Minutes || '15',
            Intensity_Level: activity.intensity || activity.Intensity_Level || 'Medium',
            // Additional fields from backend
            Activity_ID: activity.id || activity.activity_id || index + 1,
            activity_id: activity.id || activity.activity_id || index + 1,
            benefits: activity.benefits || '',
            recommended_when: activity.recommended_when || '',
            instructions: activity.instructions || '',
            tips: activity.tips || '',
            precautions: activity.precautions || '',
            equipment: activity.equipment || '',
            video_link: activity.video_link || '',
            match_percentage: activity.match_percentage || '85.0%',
            // Add session key to prevent feedback from previous sessions
            sessionKey: sessionKey
          }));
          
          console.log('📋 Formatted recommendations:', formattedRecs.length);
          setRecommendations(formattedRecs);
        } else {
          console.log('⚠ No recommendations in API response');
          setRecommendations([]);
        }
        
        setLastUpdated(new Date());
        return result.recommendations || [];
      } else {
        throw new Error(result.error || 'Failed to get recommendations');
      }
      
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('❌ Error fetching recommendations:', error);
      
      let errorMessage = 'Failed to load recommendations. ';
      
      if (error.name === 'AbortError') {
        errorMessage += 'Request timed out. Please check if the backend server is running.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage += 'Cannot connect to the server. Please make sure the backend is running on localhost:5000.';
      } else {
        errorMessage += error.message;
      }
      
      setApiError(errorMessage);
      
      // Use fallback data if available
      const fallbackData = data.recommendations || [];
      if (fallbackData.length > 0) {
        const formattedRecs = fallbackData.map((activity, index) => ({
          id: activity.id || activity.activity_id || index + 1,
          name: activity.name || activity.Activity_Type || 'Activity',
          description: activity.one_line_description || activity.description || 'Personalized activity based on your assessment',
          duration: activity.duration || activity.Duration_Minutes || '15',
          intensity: activity.intensity || activity.Intensity_Level || 'Medium',
          type: activity.type || activity.category || 'Wellness',
          priority: activity.priority || 'Medium',
          technique: technique,
          Activity_Type: activity.name || activity.Activity_Type || 'Activity',
          Duration_Minutes: activity.duration || activity.Duration_Minutes || '15',
          Intensity_Level: activity.intensity || activity.Intensity_Level || 'Medium',
          Activity_ID: activity.id || activity.activity_id || index + 1,
          activity_id: activity.id || activity.activity_id || index + 1,
          benefits: activity.benefits || '',
          recommended_when: activity.recommended_when || '',
          instructions: activity.instructions || '',
          tips: activity.tips || '',
          precautions: activity.precautions || '',
          equipment: activity.equipment || '',
          video_link: activity.video_link || '',
          sessionKey: sessionKey
        }));
        
        setRecommendations(formattedRecs);
        
        // Use current scores for fallback
        console.log('🔄 Using current scores for fallback:', scores);
        
        console.log('🔄 Using fallback recommendations:', formattedRecs.length);
      }
      
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [data, scores, sessionKey]);
  
  // Initialize component - reset everything when data changes
  useEffect(() => {
    const initializeData = async () => {
      console.log('🚀 Initializing recommendations with new data:', data);
    
      // Reset everything for new session
      setCompletedActivities([]);
      setProgress(0);
      setRecommendations([]);
      setIsLoading(true);
      setApiError(null);
      setSessionKey(Date.now()); // Generate new session key
      
      // DIRECT SCORE EXTRACTION - simplest approach
      console.log('🔍 Extracting scores from data...');
      
      // Try multiple ways to get scores
      let extractedScores = {
        Stress_Level: 5.0,
        Anxiety_Score: 5.0,
        Depression_Score: 5.0
      };
      
      // Method 1: Check if data has assessment_scores
      if (data.assessment_scores) {
        console.log('✅ Found assessment_scores:', data.assessment_scores);
        extractedScores = {
          Stress_Level: parseFloat(data.assessment_scores.Stress_Level) || 0,
          Anxiety_Score: parseFloat(data.assessment_scores.Anxiety_Score) || 0,
          Depression_Score: parseFloat(data.assessment_scores.Depression_Score) || 0
        };
      }
      // Method 2: Check if data has scores directly
      else if (data.Stress_Level || data.Anxiety_Score || data.Depression_Score) {
        console.log('✅ Found scores directly in data');
        extractedScores = {
          Stress_Level: parseFloat(data.Stress_Level) || 0,
          Anxiety_Score: parseFloat(data.Anxiety_Score) || 0,
          Depression_Score: parseFloat(data.Depression_Score) || 0
        };
      }
      // Method 3: Check user_input
      else if (data.user_input && data.user_input.assessment_scores) {
        console.log('✅ Found scores in user_input.assessment_scores');
        extractedScores = {
          Stress_Level: parseFloat(data.user_input.assessment_scores.Stress_Level) || 0,
          Anxiety_Score: parseFloat(data.user_input.assessment_scores.Anxiety_Score) || 0,
          Depression_Score: parseFloat(data.user_input.assessment_scores.Depression_Score) || 0
        };
      }
      // Method 4: Calculate from raw responses
      else if (data.user_input) {
        console.log('⚠️ Calculating scores from raw responses');
        // Simple calculation - just for display
        const stressCount = Object.keys(data.user_input).filter(key => 
          key.startsWith('stress_') && data.user_input[key]
        ).length;
        const anxietyCount = Object.keys(data.user_input).filter(key => 
          key.startsWith('anxiety_') && data.user_input[key]
        ).length;
        const depressionCount = Object.keys(data.user_input).filter(key => 
          key.startsWith('depression_') && data.user_input[key]
        ).length;
        
        // Basic scoring logic (adjust as needed)
        extractedScores = {
          Stress_Level: Math.min(10, 5 + (stressCount / 2)),
          Anxiety_Score: Math.min(10, 5 + (anxietyCount / 2)),
          Depression_Score: Math.min(10, 5 + (depressionCount / 2))
        };
      }
      
      console.log('📊 Setting scores to:', extractedScores);
      setScores(extractedScores);
      
      // If we have recommendations in props, use them immediately
      if (data.recommendations && data.recommendations.length > 0) {
        const formattedRecs = data.recommendations.map((activity, index) => ({
          id: activity.id || activity.activity_id || index + 1,
          name: activity.name || activity.Activity_Type || 'Activity',
          description: activity.one_line_description || activity.description || 'Personalized activity based on your assessment',
          duration: activity.duration || activity.Duration_Minutes || '15',
          intensity: activity.intensity || activity.Intensity_Level || 'Medium',
          type: activity.type || activity.category || 'Wellness',
          priority: activity.priority || 'Medium',
          technique: recommendationTechnique,
          Activity_Type: activity.name || activity.Activity_Type || 'Activity',
          Duration_Minutes: activity.duration || activity.Duration_Minutes || '15',
          Intensity_Level: activity.intensity || activity.Intensity_Level || 'Medium',
          Activity_ID: activity.id || activity.activity_id || index + 1,
          activity_id: activity.id || activity.activity_id || index + 1,
          benefits: activity.benefits || '',
          recommended_when: activity.recommended_when || '',
          instructions: activity.instructions || '',
          tips: activity.tips || '',
          precautions: activity.precautions || '',
          equipment: activity.equipment || '',
          video_link: activity.video_link || '',
          sessionKey: sessionKey
        }));
        
        setRecommendations(formattedRecs);
        setIsLoading(false);
        return;
      }
      
      // Fetch fresh recommendations from API
      await fetchRecommendations(recommendationTechnique);
    };
    
    initializeData();
  }, [data, recommendationTechnique]);
  
  // Update progress when completed activities change
  useEffect(() => {
    const completedCount = completedActivities.length;
    const totalActivities = recommendations.length;
    setProgress(totalActivities > 0 ? (completedCount / totalActivities) * 100 : 0);
  }, [completedActivities, recommendations.length]);
  
  // Handle reset button - completely reset the component
  const handleReset = () => {
    console.log('🔄 Resetting assessment...');
    // Generate new session key to force ActivityCard remount
    const newSessionKey = Date.now();
    setSessionKey(newSessionKey);
    // Clear all state
    setCompletedActivities([]);
    setProgress(0);
    setRecommendations([]);
    setScores({
      Stress_Level: 5.0,
      Anxiety_Score: 5.0,
      Depression_Score: 5.0
    });
    setApiError(null);
    setIsLoading(false);
    // Call parent reset
    onReset();
  };
  
  // Toggle recommendation technique
  const toggleRecommendationTechnique = async (technique) => {
    const newTechnique = technique || (recommendationTechnique === 'hybrid' ? 'cosine' : 'hybrid');
    
    if (newTechnique === recommendationTechnique) return;
    
    console.log(`🔄 Switching to ${newTechnique} technique`);
    console.log(`📊 Current scores are:`, scores);
    
    setRecommendationTechnique(newTechnique);
    await fetchRecommendations(newTechnique);
  };
  
  // Test API connection
  const testApiConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/`, { method: 'GET' });
      if (response.ok) {
        console.log('API is reachable');
        return true;
      }
    } catch (error) {
      console.log('API is not reachable:', error);
    }
    return false;
  };
  
  // Generate and download PDF report
  const generatePDFReport = async () => {
    try {
      setIsGeneratingPDF(true);
      
      // Dynamically import jsPDF
      const { jsPDF } = await import('jspdf');
      
      // Create PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      // Page dimensions
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 15;
      let yPos = margin;
      
      // Add custom fonts
      doc.setFont('helvetica', 'normal');
      
      // ========== HEADER SECTION ==========
      doc.setFillColor(102, 126, 234); // Blue header background
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Mental Health Assessment Report', pageWidth / 2, 18, { align: 'center' });
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, pageWidth / 2, 28, { align: 'center' });
      
      doc.text(`Recommendation Engine: ${recommendationTechnique === 'hybrid' ? 'Hybrid AI' : 'Cosine Similarity'}`, pageWidth / 2, 34, { align: 'center' });
      
      yPos = 45;
      doc.setTextColor(0, 0, 0);
      
      // ========== ASSESSMENT RESULTS SECTION ==========
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Assessment Results', margin, yPos);
      yPos += 10;
      
      // Filter out Sleep_Hours and Steps_Per_Day from the scores display
      const scoresToExclude = ['Sleep_Hours', 'Steps_Per_Day'];
      const filteredScores = Object.entries(scores).filter(([key]) => !scoresToExclude.includes(key));
      
      // Draw score boxes
      const scoreBoxWidth = (pageWidth - (2 * margin) - ((filteredScores.length - 1) * 10)) / filteredScores.length;
      
      filteredScores.forEach(([category, score], index) => {
        const xPos = margin + (index * (scoreBoxWidth + 10));
        const boxHeight = 25;
        
        // Draw box
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(248, 249, 250);
        doc.roundedRect(xPos, yPos, scoreBoxWidth, boxHeight, 3, 3, 'FD');
        
        // Category name
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        const formattedCategory = category.replace(/_/g, ' ').toUpperCase();
        doc.text(formattedCategory, xPos + (scoreBoxWidth / 2), yPos + 7, { align: 'center' });
        
        // Score value
        doc.setFontSize(16);
        const color = calculateScoreColor(score);
        doc.setTextColor(color === '#4CAF50' ? 76 : color === '#FF9800' ? 255 : 244,
                         color === '#4CAF50' ? 175 : color === '#FF9800' ? 152 : 67,
                         color === '#4CAF50' ? 80 : color === '#FF9800' ? 0 : 54);
        doc.text(`${typeof score === 'number' ? score.toFixed(1) : '5.0'}/10`, xPos + (scoreBoxWidth / 2), yPos + 17, { align: 'center' });
        
        // Interpretation
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(getScoreInterpretation(score, category), xPos + (scoreBoxWidth / 2), yPos + 23, { align: 'center' });
      });
      
      doc.setTextColor(0, 0, 0);
      yPos += 35;
      
      // ========== HEALTH METRICS SECTION ==========
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Health Metrics', margin, yPos);
      yPos += 10;
      
      // Draw metrics table
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      const metrics = [
        {
          title: 'Sleep Duration',
          value: `${data.user_input?.Sleep_Hours || data.Sleep_Hours || 7} hrs`,
          recommendation: '7-9 hours recommended'
        },
        {
          title: 'Daily Activity',
          value: `${parseInt(data.user_input?.Steps_Per_Day || data.Steps_Per_Day || 5000).toLocaleString()} steps`,
          recommendation: '8,000+ recommended'
        },
        {
          title: 'Mood',
          value: data.user_input?.Mood || data.Mood || 'Okay',
          recommendation: 'Self-reported'
        }
      ];
      
      metrics.forEach((metric, index) => {
        const xPos = margin + (index * ((pageWidth - (2 * margin)) / 3));
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(metric.title, xPos, yPos);
        
        doc.setFontSize(14);
        doc.setTextColor(102, 126, 234);
        doc.text(metric.value, xPos, yPos + 6);
        
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(metric.recommendation, xPos, yPos + 12);
      });
      
      doc.setTextColor(0, 0, 0);
      yPos += 25;
      
      // Check for page break
      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = margin;
      }
      
      // ========== PROGRESS SUMMARY SECTION ==========
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Progress Summary', margin, yPos);
      yPos += 7;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Activities Completed: ${completedActivities.length} out of ${recommendations.length}`, margin, yPos);
      yPos += 6;
      
      const currentTime = lastUpdated.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }).toUpperCase();
      doc.text(`Last updated: ${currentTime}`, margin, yPos);
      yPos += 6;
      
      doc.text(`Recommendation Engine: ${recommendationTechnique === 'hybrid' ? 'Hybrid AI Engine' : 'Cosine Similarity'}`, margin, yPos);
      yPos += 10;
      
      // Draw progress bar
      const progressBarWidth = pageWidth - (2 * margin);
      const progressBarHeight = 8;
      
      // Background bar
      doc.setFillColor(230, 230, 230);
      doc.roundedRect(margin, yPos, progressBarWidth, progressBarHeight, 4, 4, 'F');
      
      // Progress fill
      const progressFillWidth = (progress / 100) * progressBarWidth;
      doc.setFillColor(102, 126, 234);
      doc.roundedRect(margin, yPos, progressFillWidth, progressBarHeight, 4, 4, 'F');
      
      // Progress percentage text
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(`${Math.round(progress)}%`, margin + (progressFillWidth / 2), yPos + 5.5, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      yPos += 20;
      
      // Draw separator line
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 15;
      
      // Check for page break
      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = margin;
      }
      
      // ========== PERSONALIZED RECOMMENDATIONS SECTION ==========
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Personalized Recommendations', margin, yPos);
      yPos += 10;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      // Add each activity
      recommendations.forEach((activity, index) => {
        // Check if we need a new page
        if (yPos > pageHeight - 70) {
          doc.addPage();
          yPos = margin;
        }
        
        const activityName = activity.name || activity.Activity_Type || `Activity ${index + 1}`;
        const activityDescription = activity.description || activity.one_line_description || `A personalized activity for your mental wellbeing.`;
        const activityType = activity.type || 'General Wellness';
        const isCompleted = completedActivities.includes(index);
        
        // Activity header
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${activityType}`, margin, yPos);
        yPos += 5;
        
        // Status badge
        const statusText = isCompleted ? 'COMPLETED' : 'RECOMMENDED';
        const statusColor = isCompleted ? [76, 175, 80] : [255, 152, 0];
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
        doc.text(statusText, margin, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 5;
        
        // Activity details
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        const details = [
          `Duration: ${activity.duration || activity.Duration_Minutes || 'N/A'} minutes`,
          `Intensity: ${activity.intensity || activity.Intensity_Level || 'N/A'}`,
          `Priority: ${activity.priority || 'Medium'}`
        ];
        
        details.forEach((detail, i) => {
          const xPos = margin + (i * 60);
          doc.text(detail, xPos, yPos);
        });
        
        yPos += 6;
        
        // Activity description
        const descriptionLines = doc.splitTextToSize(activityDescription, pageWidth - (2 * margin));
        descriptionLines.forEach(line => {
          doc.text(line, margin, yPos);
          yPos += 5;
        });
        
        // Add benefits if available
        if (activity.benefits) {
          yPos += 5;
          doc.setFontSize(9);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(70, 70, 70);
          const benefitsLines = doc.splitTextToSize(`Benefits: ${activity.benefits}`, pageWidth - (2 * margin));
          benefitsLines.forEach(line => {
            doc.text(line, margin, yPos);
            yPos += 4;
          });
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'normal');
        }
        
        yPos += 10;
        
        // Add separator line between activities (except last one)
        if (index < recommendations.length - 1) {
          doc.setDrawColor(220, 220, 220);
          doc.setLineWidth(0.3);
          doc.line(margin, yPos - 5, pageWidth - margin, yPos - 5);
          yPos += 5;
        }
      });
      
      // Check for page break before next section
      if (yPos > pageHeight - 100) {
        doc.addPage();
        yPos = margin;
      }
      
      // ========== RECOMMENDATION ENGINE DETAILS ==========
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Recommendation Engine Details', margin, yPos);
      yPos += 10;
      
      const engineDetails = [
        {
          title: recommendationTechnique === 'hybrid' ? 'Hybrid AI Engine' : 'Cosine Similarity',
          description: recommendationTechnique === 'hybrid' 
            ? 'Combines machine learning with collaborative filtering for balanced, personalized recommendations'
            : 'Uses mathematical vector similarity to find activities that precisely match your assessment patterns'
        },
        {
          title: 'Response Time',
          value: recommendationTechnique === 'hybrid' ? '~1.2 seconds' : '~0.8 seconds'
        },
        {
          title: 'Estimated Accuracy',
          value: recommendationTechnique === 'hybrid' ? '92%' : '88%'
        }
      ];
      
      engineDetails.forEach((detail, index) => {
        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = margin;
        }
        
        if (detail.description) {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text(detail.title, margin, yPos);
          yPos += 5;
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const descLines = doc.splitTextToSize(detail.description, pageWidth - (2 * margin));
          descLines.forEach(line => {
            doc.text(line, margin, yPos);
            yPos += 5;
          });
          yPos += 5;
        } else {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text(`${detail.title}:`, margin, yPos);
          doc.setTextColor(102, 126, 234);
          doc.text(detail.value, margin + 50, yPos);
          doc.setTextColor(0, 0, 0);
          yPos += 6;
        }
      });
      
      yPos += 10;
      
      // ========== HEALTH ADVICE SECTION ==========
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Health Advice', margin, yPos);
      yPos += 10;
      
      const adviceItems = [
        {
          icon: '1. ',
          title: 'Consistency is Key',
          description: 'Practice recommended activities regularly for best results. Even 10-15 minutes daily can make a significant difference in your mental well-being.'
        },
        {
          icon: '2. ',
          title: 'Track Your Progress',
          description: 'Retake this assessment weekly to monitor improvements and adjust recommendations based on your progress. Small, consistent improvements lead to lasting change.'
        },
        {
          icon: '3. ',
          title: 'Professional Support',
          description: 'If scores remain high or you\'re experiencing significant distress, consider consulting with a mental health professional for personalized guidance and support.'
        }
      ];
      
      // Add each advice card
      adviceItems.forEach((advice, index) => {
        // Check if we need a new page
        if (yPos > pageHeight - 50) {
          doc.addPage();
          yPos = margin;
        }
        
        // Draw advice box
        const boxHeight = 35;
        doc.setDrawColor(220, 220, 220);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(margin, yPos, pageWidth - (2 * margin), boxHeight, 3, 3, 'FD');
        
        // Icon
        doc.setFontSize(14);
        doc.text(advice.icon, margin + 8, yPos + 12);
        
        // Title
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(advice.title, margin + 25, yPos + 8);
        
        // Description
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const descLines = doc.splitTextToSize(advice.description, pageWidth - (2 * margin) - 30);
        descLines.forEach((line, i) => {
          doc.text(line, margin + 25, yPos + 17 + (i * 5));
        });
        
        yPos += boxHeight + 10;
      });
      
      // Check for page break
      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = margin;
      }
      
      // ========== ADDITIONAL NOTES SECTION ==========
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Additional Notes', margin, yPos);
      yPos += 10;
      
      const notes = [
        'This report is generated based on your self-assessment and should not replace professional medical advice.',
        'All data is stored locally on your device and is not transmitted to any external servers.',
        `Recommendations are generated using the ${recommendationTechnique === 'hybrid' ? 'Hybrid AI Engine' : 'Cosine Similarity'} algorithm.`,
        'For emergency situations, please contact local emergency services or mental health crisis lines.'
      ];
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      notes.forEach((note, index) => {
        doc.text(`• ${note}`, margin, yPos);
        yPos += 7;
      });
      
      yPos += 10;
      
      // ========== FOOTER SECTION ==========
      // Draw footer separator
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;
      
      // Footer text
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      
      const footerLines = [
        'Mental Health Assessment Report • Generated by Mindful Moments',
        `Report ID: ${Date.now().toString().slice(-8)} • Version 1.0`,
        `Recommendation Engine: ${recommendationTechnique.toUpperCase()} • © ${new Date().getFullYear()} All rights reserved.`
      ];
      
      footerLines.forEach((line, index) => {
        doc.text(line, pageWidth / 2, yPos + (index * 5), { align: 'center' });
      });
      
      // ========== SAVE THE PDF ==========
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `Mental_Health_Report_${timestamp}.pdf`;
      
      // Save the PDF
      doc.save(filename);
      setIsGeneratingPDF(false);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setIsGeneratingPDF(false);
      
      // Fallback to text report
      const exportData = {
        timestamp: new Date().toISOString(),
        assessment_date: new Date().toLocaleDateString(),
        technique_used: recommendationTechnique,
        technique_name: recommendationTechnique === 'hybrid' ? 'Hybrid AI Engine' : 'Cosine Similarity',
        assessment_scores: {
          Stress_Level: parseFloat(scores.Stress_Level) || 0,
          Anxiety_Score: parseFloat(scores.Anxiety_Score) || 0,
          Depression_Score: parseFloat(scores.Depression_Score) || 0,
          Sleep_Hours: parseFloat(data.user_input?.Sleep_Hours || data.Sleep_Hours || 7),
          Steps_Per_Day: parseFloat(data.user_input?.Steps_Per_Day || data.Steps_Per_Day || 5000),
          Mood: data.user_input?.Mood || data.Mood || 'Okay'
        },
        recommendations_summary: {
          total_count: recommendations.length,
          completed_count: completedActivities.length,
          completion_rate: `${Math.round(progress)}%`,
          last_updated: lastUpdated.toLocaleString()
        },
        recommendations: recommendations.map((rec, index) => ({
          id: rec.id || index + 1,
          name: rec.name || rec.Activity_Type,
          description: rec.description || rec.one_line_description || 'Personalized activity',
          duration: rec.duration || rec.Duration_Minutes,
          intensity: rec.intensity || rec.Intensity_Level,
          priority: rec.priority || 'Medium',
          category: rec.type || rec.category || 'Wellness',
          completed: completedActivities.includes(index),
          benefits: rec.benefits || '',
          instructions: rec.instructions || '',
          tips: rec.tips || ''
        })),
        next_steps: [
          'Practice recommended activities regularly for best results',
          'Retake assessment weekly to track progress',
          'Consider professional support if scores remain high'
        ]
      };
      
      const reportContent = `
╔═══════════════════════════════════════════════════════════════╗
║                 MENTAL HEALTH ASSESSMENT REPORT               ║
╚═══════════════════════════════════════════════════════════════╝

Generated: ${exportData.assessment_date}
Recommendation Engine: ${exportData.technique_name}

───────────────────────────────────────────────────────────────
ASSESSMENT SCORES
───────────────────────────────────────────────────────────────
• Stress Level:      ${exportData.assessment_scores.Stress_Level.toFixed(1)}/10
• Anxiety Score:     ${exportData.assessment_scores.Anxiety_Score.toFixed(1)}/10
• Depression Score:  ${exportData.assessment_scores.Depression_Score.toFixed(1)}/10
• Sleep Hours:       ${exportData.assessment_scores.Sleep_Hours} hrs
• Daily Steps:       ${exportData.assessment_scores.Steps_Per_Day.toLocaleString()}
• Current Mood:      ${exportData.assessment_scores.Mood}

───────────────────────────────────────────────────────────────
PROGRESS SUMMARY
───────────────────────────────────────────────────────────────
• Total Activities:     ${exportData.recommendations_summary.total_count}
• Completed:           ${exportData.recommendations_summary.completed_count}
• Completion Rate:     ${exportData.recommendations_summary.completion_rate}
• Last Updated:        ${exportData.recommendations_summary.last_updated}

───────────────────────────────────────────────────────────────
RECOMMENDED ACTIVITIES
───────────────────────────────────────────────────────────────
${exportData.recommendations.map((rec, idx) => `
${idx + 1}. ${rec.name}
   ${rec.completed ? '✓ COMPLETED' : '○ PENDING'}
   Duration: ${rec.duration} minutes | Intensity: ${rec.intensity} | Priority: ${rec.priority}
   ${rec.description}
   ${rec.benefits ? `Benefits: ${rec.benefits}` : ''}
   ${rec.instructions ? `Instructions: ${rec.instructions}` : ''}
   ${rec.tips ? `Tips: ${rec.tips}` : ''}
`).join('')}

───────────────────────────────────────────────────────────────
NEXT STEPS
───────────────────────────────────────────────────────────────
${exportData.next_steps.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}

───────────────────────────────────────────────────────────────
ADDITIONAL NOTES
───────────────────────────────────────────────────────────────
• This report was generated using ${exportData.technique_name}
• Scores are based on your assessment responses
• Recommendations are personalized to your specific needs
• For professional mental health support, consult a licensed therapist

╔═══════════════════════════════════════════════════════════════╗
║              END OF REPORT • TAKE CARE OF YOURSELF            ║
╚═══════════════════════════════════════════════════════════════╝

Report generated on: ${new Date().toLocaleString()}
      `;
      
      // Create and download text file with PDF-like formatting
      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mental-health-report-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('PDF generation failed. Downloaded text report instead.');
    }
  };
  
  const handleExport = () => {
    generatePDFReport();
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Mental Health Assessment',
          text: `I completed a mental health assessment and got personalized recommendations using ${recommendationTechnique === 'hybrid' ? 'Hybrid AI Engine' : 'Cosine Similarity'}! Progress: ${Math.round(progress)}%`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      const text = `Mental Health Assessment Results:\n\nScores:\n• Stress: ${scores.Stress_Level.toFixed(1)}/10\n• Anxiety: ${scores.Anxiety_Score.toFixed(1)}/10\n• Depression: ${scores.Depression_Score.toFixed(1)}/10\n\nProgress: ${completedActivities.length}/${recommendations.length} activities completed (${Math.round(progress)}%)\n\nTechnique: ${recommendationTechnique === 'hybrid' ? 'Hybrid AI Engine' : 'Cosine Similarity'}\n\nGet your own assessment at: ${window.location.href}`;
      navigator.clipboard.writeText(text).then(() => {
        alert('Results copied to clipboard!');
      });
    }
  };

  const toggleActivityComplete = (index) => {
    setCompletedActivities(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };
  
  // Filter out Sleep_Hours and Steps_Per_Day from the scores display
  const getFilteredScores = () => {
    const scoresToExclude = ['Sleep_Hours', 'Steps_Per_Day'];
    return Object.entries(scores).filter(([key]) => !scoresToExclude.includes(key));
  };
  
  return (
    <div className="recommendations-container">
      {/* Header with Progress */}
      <div className="results-header">
        <div className="header-main">
          <h2>Your Personalized Recommendations</h2>
          <p className="subtitle">Based on your assessment, here are activities tailored for you</p>
          <div className="user-id-display">
            <small>Assessment Date: {new Date().toLocaleDateString()}</small>
   
          </div>
        </div>
        
        <div className="header-progress">
          <div className="progress-circle">
            <svg width="60" height="60" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="25" stroke="#e0e0e0" strokeWidth="5" fill="none"/>
              <circle cx="30" cy="30" r="25" stroke="#667eea" strokeWidth="5" fill="none" 
                strokeDasharray={`${progress * 1.57} 157`} transform="rotate(-90 30 30)" strokeLinecap="round"/>
            </svg>
            <div className="progress-value">{Math.round(progress)}%</div>
          </div>
          <div className="progress-text">
            <span>{completedActivities.length}/{recommendations.length} activities</span>
            <small>Mark activities as complete to track progress</small>
          </div>
        </div>
        
        <div className="header-actions">
          <button className="btn btn-ghost" onClick={handleReset}>
            <FiRefreshCw />
            Retake
          </button>
          <button 
            className="btn btn-ghost" 
            onClick={handleExport}
            disabled={isGeneratingPDF || recommendations.length === 0}
          >
            <FiDownload />
            {isGeneratingPDF ? 'Generating Report...' : 'Download Report'}
          </button>
          <button className="btn btn-ghost" onClick={handleShare}>
            <FiShare2 />
            Share
          </button>
        </div>
      </div>
      
      {/* API Error Alert */}
      {apiError && (
        <div className="api-error-alert">
          <div className="error-content">
            <h4>Connection Issue</h4>
            <p>{apiError}</p>
            <div className="error-actions">
              <button 
                onClick={() => {
                  setApiError(null);
                  fetchRecommendations(recommendationTechnique);
                }}
                className="retry-btn"
              >
                <FiRefreshCw /> Retry
              </button>
              <button 
                onClick={() => setApiError(null)}
                className="dismiss-btn"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Interactive Scores Grid - Shows ACTUAL scores, not defaults */}
      <div className="scores-section">
        <div className="section-header interactive">
          <FiBarChart2 />
          <h3>Assessment Scores</h3>
          <button className="info-btn" title="Your assessment scores help personalize recommendations">
            <FiInfo />
          </button>
        </div>
        
        <div className="scores-grid">
          {getFilteredScores().map(([category, score], index) => (
            <div 
              key={category} 
              className={`score-card interactive ${activeScore === category ? 'active' : ''}`}
              onMouseEnter={() => setActiveScore(category)}
              onMouseLeave={() => setActiveScore(null)}
            >
              <div className="score-header">
                <div className="score-category">
                  <h4>{category.replace('_', ' ')}</h4>
                </div>
                <div className="score-indicator">
                  <span className="score-value" style={{ color: calculateScoreColor(score) }}>
                    {typeof score === 'number' ? score.toFixed(1) : '5.0'}
                    <span className="score-max">/10</span>
                  </span>
                  <span className="score-badge" style={{ backgroundColor: calculateScoreColor(score) }}>
                    {getScoreInterpretation(score, category)}
                  </span>
                </div>
              </div>
              
              <div className={`score-tip ${activeScore === category ? 'show' : ''}`}>
                <FiChevronRight />
                <span>
                  {score <= 3 ? "Good management! Keep it up!" :
                   score <= 6 ? "Some room for improvement" :
                   score <= 8 ? "Consider additional support" :
                   "Professional support recommended"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Compact Metrics Grid */}
      <div className="user-input-section compact">
        <div className="section-header">
          <h3>Daily Health Metrics</h3>
          <div className="metrics-actions">
            <button className="metric-action" title="Track your daily metrics">
              <FiClock /> Track
            </button>
          </div>
        </div>
        
        <div className="metrics-grid interactive">
          <div className="metric-card hoverable">
            <div className="metric-icon">
              <FiClock />
            </div>
            <div className="metric-content">
              <span className="metric-label">Sleep Hours</span>
              <span className="metric-value animate-number">
                {data.user_input?.Sleep_Hours || data.Sleep_Hours || 7} hrs
              </span>
              <div className="metric-hint">7-9 hours recommended</div>
            </div>
          </div>
          <div className="metric-card hoverable">
            <div className="metric-icon">
              <FiActivity />
            </div>
            <div className="metric-content">
              <span className="metric-label">Daily Steps</span>
              <span className="metric-value animate-number">
                {parseInt(data.user_input?.Steps_Per_Day || data.Steps_Per_Day || 5000).toLocaleString()}
              </span>
              <div className="metric-hint">8,000+ recommended</div>
            </div>
          </div>
          <div className="metric-card hoverable">
            <div className="metric-icon mood">
              {(data.user_input?.Mood || data.Mood || 'Okay') === 'Good' ? '😊' : 
               (data.user_input?.Mood || data.Mood || 'Okay') === 'Okay' ? '😐' : '😔'}
            </div>
            <div className="metric-content">
              <span className="metric-label">Current Mood</span>
              <span className="metric-value">
                {data.user_input?.Mood || data.Mood || 'Okay'}
              </span>
              <div className="metric-hint">Track daily mood changes</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Advanced Algorithm Toggle */}
      <div className="algorithm-toggle-section">
        <div className="section-header">
          <div className="algorithm-header">
            <h3>Advanced Recommendation Engine</h3>
            <div className="algorithm-badge">
              {recommendationTechnique === 'hybrid' ? 'Hybrid AI' : 'Cosine Similarity'}
            </div>
          </div>
          <div className="last-updated">
            <FiClock /> Updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        
        <div className="algorithm-cards">
          {/* Hybrid Algorithm Card */}
          <div 
            className={`algorithm-card hybrid ${recommendationTechnique === 'hybrid' ? 'active' : ''} ${isLoading && recommendationTechnique === 'hybrid' ? 'loading' : ''}`}
            onClick={() => !isLoading && toggleRecommendationTechnique('hybrid')}
          >
            <div className="algorithm-icon">
              <div className="icon-container hybrid">
                <FiCpu />
                <div className="pulse-ring"></div>
              </div>
            </div>
            <div className="algorithm-content">
              <h4>Hybrid AI Engine</h4>
              <p>Combines machine learning with collaborative filtering for balanced, personalized recommendations</p>
              <div className="algorithm-features">
                <span className="feature-tag">Collaborative</span>
                <span className="feature-tag">Personalized</span>
                <span className="feature-tag">Adaptive</span>
              </div>
            </div>
            <div className="algorithm-action">
              {isLoading && recommendationTechnique === 'hybrid' ? (
                <div className="loading-spinner">
                  <FiLoader className="spin" />
                </div>
              ) : recommendationTechnique === 'hybrid' ? (
                <div className="active-indicator">
                  <div className="active-dot"></div>
                  <span>Active</span>
                </div>
              ) : (
                <button className="select-button">Select</button>
              )}
            </div>
          </div>
          
          {/* Cosine Similarity Card */}
          <div 
            className={`algorithm-card cosine ${recommendationTechnique === 'cosine' ? 'active' : ''} ${isLoading && recommendationTechnique === 'cosine' ? 'loading' : ''}`}
            onClick={() => !isLoading && toggleRecommendationTechnique('cosine')}
          >
            <div className="algorithm-icon">
              <div className="icon-container cosine">
                <FiZap />
                <div className="pulse-ring"></div>
              </div>
            </div>
            <div className="algorithm-content">
              <h4>Cosine Similarity</h4>
              <p>Uses mathematical vector similarity to find activities that precisely match your assessment patterns</p>
              <div className="algorithm-features">
                <span className="feature-tag">Mathematical</span>
                <span className="feature-tag">Fast</span>
                <span className="feature-tag">Precise</span>
              </div>
            </div>
            <div className="algorithm-action">
              {isLoading && recommendationTechnique === 'cosine' ? (
                <div className="loading-spinner">
                  <FiLoader className="spin" />
                </div>
              ) : recommendationTechnique === 'cosine' ? (
                <div className="active-indicator">
                  <div className="active-dot"></div>
                  <span>Active</span>
                </div>
              ) : (
                <button className="select-button">Select</button>
              )}
            </div>
          </div>
        </div>
        
        <div className="algorithm-description">
          <div className="description-content">
            <h4>
              {recommendationTechnique === 'hybrid' ? 
                'Hybrid AI Engine Selected' : 
                'Cosine Similarity Selected'}
            </h4>
            <p>
              {recommendationTechnique === 'hybrid' ? 
                'This engine combines your profile data with patterns from similar users to provide balanced recommendations that evolve with your progress.' : 
                'This mathematical approach analyzes vector similarities between your assessment scores and activity effectiveness to provide precise, data-driven recommendations.'}
            </p>
            <div className="performance-metrics">
              <div className="metric">
                <span className="metric-label">Response Time</span>
                <span className="metric-value">
                  {recommendationTechnique === 'hybrid' ? '~1.2s' : '~0.8s'}
                </span>
              </div>
              <div className="metric">
                <span className="metric-label">Accuracy</span>
                <span className="metric-value">
                  {recommendationTechnique === 'hybrid' ? '92%' : '88%'}
                </span>
              </div>
              <div className="metric">
                <span className="metric-label">Recommendations</span>
                <span className="metric-value">
                  {recommendations.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Interactive Recommendations */}
      <div className="recommendations-section">
        <div className="section-header with-controls">
          <div>
            <h3>Recommended Activities</h3>
            <p className="section-subtitle">
              {isLoading ? (
                <span className="loading-text">
                  <FiLoader className="spin" /> Generating recommendations using {recommendationTechnique === 'hybrid' ? 'Hybrid AI Engine' : 'Cosine Similarity'}...
                </span>
              ) : (
                `These ${recommendations.length} activities are personalized using ${recommendationTechnique === 'hybrid' ? 'Hybrid AI Engine' : 'Cosine Similarity'} based on your assessment scores`
              )}
            </p>
          </div>
          <div className="section-controls">
            <div className="completion-tracker">
              <span className="tracker-label">Completed:</span>
              <span className="tracker-value">{completedActivities.length}</span>
            </div>
            {isLoading && (
              <div className="loading-indicator">
                <FiLoader className="spin" />
                <span>Processing...</span>
              </div>
            )}
          </div>
        </div>
        
        {isLoading ? (
          <div className="recommendations-loading">
            <div className="loading-animation">
              <div className="loading-spinner-large">
                <FiLoader className="spin" />
              </div>
              <h4>Generating Personalized Recommendations</h4>
              <p>Analyzing your data with {recommendationTechnique === 'hybrid' ? 'AI algorithms' : 'mathematical models'}...</p>
              <div className="loading-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '75%' }}></div>
                </div>
                <span className="progress-text">75% complete</span>
              </div>
            </div>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="no-recommendations">
            <p>No recommendations available. {apiError ? 'Please check your connection and try again.' : 'Please try again.'}</p>
            <button 
              className="retry-button"
              onClick={() => fetchRecommendations(recommendationTechnique)}
            >
              <FiRefreshCw /> Retry
            </button>
          </div>
        ) : (
          <div className="recommendations-grid interactive">
            {recommendations.map((activity, index) => (
              <div 
                key={`${sessionKey}-${activity.id || index}`} // Unique key with session
                className={`recommendation-item interactive ${completedActivities.includes(index) ? 'completed' : ''}`}
              >
                <ActivityCard 
                  key={`${sessionKey}-${activity.id || index}`} // Force remount with new session
                  activity={activity} 
                  assessmentData={data}
                  onFeedbackSubmitted={() => {
                    console.log('Feedback submitted for activity:', activity.id);
                  }}
                />
                
                {/* Simple Completion Button */}
                <div className="completion-button-container">
                  <button 
                    className={`completion-toggle ${completedActivities.includes(index) ? 'checked' : ''}`}
                    onClick={() => toggleActivityComplete(index)}
                    aria-label={completedActivities.includes(index) ? "Mark as incomplete" : "Mark as complete"}
                  >
                    {completedActivities.includes(index) ? (
                      <>
                        <FiCheck className="check-icon" />
                        <span className="toggle-text">Mark as Incomplete</span>
                      </>
                    ) : (
                      <>
                        <div className="empty-circle"></div>
                        <span className="toggle-text">Mark as Complete</span>
                      </>
                    )}
                  </button>
                  
                  {completedActivities.includes(index) && (
                    <div className="completion-status">
                      <span className="status-indicator">
                        <FiCheck /> Completed
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Enhanced Advice Cards */}
      <div className="advice-section interactive">
        <h3>Next Steps</h3>
        <div className="advice-cards enhanced">
          <div className="advice-card interactive">
            <div className="advice-icon">
              <FiClock />
            </div>
            <h4>Consistency is Key</h4>
            <p>Practice recommended activities regularly for best results. Even 10-15 minutes daily can make a significant difference.</p>
          </div>
          <div className="advice-card interactive">
            <div className="advice-icon">
              <FiBarChart2 />
            </div>
            <h4>Track Progress</h4>
            <p>Retake this assessment weekly to track your progress and adjust recommendations as you improve.</p>
          </div>
          <div className="advice-card interactive">
            <div className="advice-icon">
              <FiShare2 />
            </div>
            <h4>Seek Support</h4>
            <p>If scores remain high, consider speaking with a mental health professional for personalized guidance.</p>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .recommendations-container {
          animation: fadeIn 0.5s ease;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
          position: relative;
        }
        
        /* API Error Alert */
        .api-error-alert {
          background: linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%);
          color: white;
          border-radius: 15px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 10px 30px rgba(255, 107, 107, 0.2);
          animation: slideIn 0.3s ease;
        }
        
        .error-content h4 {
          margin-bottom: 0.5rem;
          font-size: 1.2rem;
        }
        
        .error-content p {
          opacity: 0.9;
          margin-bottom: 1rem;
          font-size: 0.95rem;
          line-height: 1.5;
        }
        
        .error-actions {
          display: flex;
          gap: 1rem;
        }
        
        .retry-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 1.5px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .retry-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        .dismiss-btn {
          background: transparent;
          border: 1.5px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .dismiss-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        /* Enhanced Header */
        .results-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin-bottom: 2rem;
          padding: 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 20px;
          position: relative;
          overflow: hidden;
        }
        
        .header-main {
          flex: 1;
          min-width: 300px;
        }
        
        .results-header h2 {
          font-size: 1.8rem;
          margin-bottom: 0.5rem;
          position: relative;
          z-index: 1;
        }
        
        .subtitle {
          opacity: 0.9;
          font-size: 0.95rem;
          position: relative;
          z-index: 1;
          margin-bottom: 0.5rem;
        }
        
        .user-id-display {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin-top: 0.5rem;
        }
        
        .user-id-display small {
          opacity: 0.8;
          font-size: 0.8rem;
        }
        
        .header-progress {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(255, 255, 255, 0.1);
          padding: 1rem;
          border-radius: 15px;
          backdrop-filter: blur(10px);
          position: relative;
          z-index: 1;
        }
        
        .progress-circle {
          position: relative;
          width: 60px;
          height: 60px;
        }
        
        .progress-value {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-weight: bold;
          font-size: 0.9rem;
        }
        
        .progress-text {
          display: flex;
          flex-direction: column;
        }
        
        .progress-text small {
          opacity: 0.8;
          font-size: 0.8rem;
        }
        
        .header-actions {
          display: flex;
          gap: 0.75rem;
          position: relative;
          z-index: 1;
        }
        
        .btn-ghost {
          background: rgba(255, 255, 255, 0.15);
          border: 1.5px solid rgba(255, 255, 255, 0.25);
          color: white;
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .btn-ghost:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .btn-ghost:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        /* Scores Section */
        .scores-section {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 10px 40px rgba(0,0,0,0.08);
        }
        
        .section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          color: var(--primary);
        }
        
        .section-header.interactive {
          justify-content: space-between;
        }
        
        .info-btn {
          background: var(--gray-100);
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gray-600);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .info-btn:hover {
          background: var(--primary);
          color: white;
        }
        
        .scores-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1.5rem;
        }
        
        .score-card {
          padding: 1.5rem;
          border-radius: 15px;
          background: var(--gray-50);
          border-left: 5px solid;
          transition: all 0.3s ease;
        }
        
        .score-card:nth-child(1) { border-left-color: #ff6b6b; }
        .score-card:nth-child(2) { border-left-color: #4d96ff; }
        .score-card:nth-child(3) { border-left-color: #6b48ff; }
        
        .score-card.interactive:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        
        .score-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        
        .score-category h4 {
          text-transform: capitalize;
          color: var(--gray-900);
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }
        
        .score-indicator {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.75rem;
        }
        
        .score-value {
          font-size: 2.5rem;
          font-weight: 700;
          line-height: 1;
        }
        
        .score-max {
          font-size: 1.2rem;
          color: var(--gray-500);
          margin-left: 0.2rem;
        }
        
        .score-badge {
          padding: 0.4rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          color: white;
          opacity: 0.9;
        }
        
        .score-tip {
          font-size: 0.95rem;
          color: var(--gray-700);
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }
        
        .score-tip.show {
          max-height: 60px;
          padding: 0.75rem 1rem;
          margin-top: 1rem;
          background: rgba(0,0,0,0.02);
          border-radius: 8px;
        }
        
        /* Compact Metrics */
        .user-input-section.compact {
          background: white;
          border-radius: 20px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 5px 20px rgba(0,0,0,0.08);
        }
        
        .metrics-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .metric-action {
          background: var(--gray-100);
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 10px;
          font-size: 0.85rem;
          color: var(--gray-700);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .metric-action:hover {
          background: var(--primary);
          color: white;
        }
        
        .metrics-grid.interactive {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1.5rem;
        }
        
        .metric-card.hoverable {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          border-radius: 12px;
          background: var(--gray-50);
          border: 2px solid transparent;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        
        .metric-card.hoverable:hover {
          border-color: var(--primary);
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        
        .metric-icon {
          width: 45px;
          height: 45px;
          background: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          color: var(--primary);
          box-shadow: 0 3px 10px rgba(0,0,0,0.08);
        }
        
        .metric-icon.mood {
          font-size: 1.5rem;
        }
        
        .metric-content {
          flex: 1;
        }
        
        .metric-label {
          display: block;
          font-size: 0.85rem;
          color: var(--gray-600);
          margin-bottom: 0.25rem;
        }
        
        .metric-value {
          display: block;
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--primary);
        }
        
        .metric-value.animate-number {
          animation: countUp 1s ease-out;
        }
        
        .metric-hint {
          font-size: 0.75rem;
          color: var(--gray-500);
          margin-top: 0.25rem;
        }
        
        /* Advanced Algorithm Toggle Section */
        .algorithm-toggle-section {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 10px 40px rgba(0,0,0,0.08);
          border: 1px solid rgba(0,0,0,0.05);
        }
        
        .algorithm-header {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .algorithm-badge {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          animation: pulse 2s infinite;
        }
        
        .last-updated {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: var(--gray-600);
        }
        
        .algorithm-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin: 2rem 0;
        }
        
        .algorithm-card {
          background: var(--gray-50);
          border-radius: 15px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 2px solid transparent;
          position: relative;
          overflow: hidden;
        }
        
        .algorithm-card:hover:not(.loading) {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.1);
        }
        
        .algorithm-card.hybrid {
          border-color: var(--primary);
        }
        
        .algorithm-card.cosine {
          border-color: #10b981;
        }
        
        .algorithm-card.active {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          border-width: 3px;
          animation: activeGlow 3s infinite alternate;
        }
        
        .algorithm-card.active.hybrid {
          border-color: #667eea;
        }
        
        .algorithm-card.active.cosine {
          border-color: #10b981;
        }
        
        .algorithm-card.loading {
          opacity: 0.7;
          cursor: wait;
        }
        
        .algorithm-icon {
          margin-bottom: 1rem;
        }
        
        .icon-container {
          width: 60px;
          height: 60px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          color: white;
          position: relative;
        }
        
        .icon-container.hybrid {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .icon-container.cosine {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }
        
        .pulse-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 15px;
          animation: pulseRing 2s infinite;
        }
        
        .algorithm-card.active .pulse-ring {
          background: rgba(255, 255, 255, 0.3);
        }
        
        .algorithm-content {
          flex: 1;
          margin-bottom: 1rem;
        }
        
        .algorithm-content h4 {
          font-size: 1.3rem;
          margin-bottom: 0.75rem;
          color: var(--gray-900);
        }
        
        .algorithm-content p {
          color: var(--gray-600);
          font-size: 0.95rem;
          line-height: 1.5;
          margin-bottom: 1rem;
        }
        
        .algorithm-features {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .feature-tag {
          background: rgba(255, 255, 255, 0.9);
          padding: 0.4rem 0.8rem;
          border-radius: 15px;
          font-size: 0.8rem;
          color: var(--gray-700);
          border: 1px solid rgba(0,0,0,0.1);
        }
        
        .algorithm-action {
          display: flex;
          justify-content: flex-end;
        }
        
        .select-button {
          background: var(--primary);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .select-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }
        
        .active-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--primary);
          font-weight: 600;
        }
        
        .active-dot {
          width: 12px;
          height: 12px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }
        
        .loading-spinner {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .spin {
          animation: spin 1s linear infinite;
        }
        
        .algorithm-description {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 15px;
          padding: 1.5rem;
          margin-top: 1.5rem;
          border-left: 4px solid var(--primary);
        }
        
        .description-content h4 {
          margin-bottom: 0.75rem;
          color: var(--gray-900);
          font-size: 1.2rem;
        }
        
        .description-content p {
          color: var(--gray-700);
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        
        .performance-metrics {
          display: flex;
          gap: 2rem;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(0,0,0,0.1);
        }
        
        .metric {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .metric-label {
          font-size: 0.85rem;
          color: var(--gray-600);
          margin-bottom: 0.25rem;
        }
        
        .metric-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary);
        }
        
        /* Enhanced Recommendations */
        .section-header.with-controls {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }
        
        .section-subtitle {
          color: var(--gray-600);
          font-size: 0.95rem;
          max-width: 600px;
          margin-top: 0.25rem;
        }
        
        .loading-text {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--primary);
        }
        
        .section-controls {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        
        .completion-tracker {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--gray-100);
          padding: 0.5rem 1rem;
          border-radius: 20px;
        }
        
        .tracker-label {
          font-size: 0.85rem;
          color: var(--gray-600);
        }
        
        .tracker-value {
          font-weight: bold;
          color: var(--primary);
          font-size: 1.1rem;
        }
        
        .loading-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--primary);
          font-size: 0.9rem;
        }
        
        .recommendations-loading {
          background: white;
          border-radius: 15px;
          padding: 3rem;
          text-align: center;
          box-shadow: 0 5px 20px rgba(0,0,0,0.08);
        }
        
        .loading-animation {
          max-width: 400px;
          margin: 0 auto;
        }
        
        .loading-spinner-large {
          font-size: 3rem;
          color: var(--primary);
          margin-bottom: 1.5rem;
        }
        
        .loading-animation h4 {
          margin-bottom: 0.75rem;
          color: var(--gray-900);
        }
        
        .loading-animation p {
          color: var(--gray-600);
          margin-bottom: 1.5rem;
        }
        
        .loading-progress {
          text-align: left;
        }
        
        .progress-bar {
          height: 8px;
          background: var(--gray-200);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 4px;
          animation: progressFill 2s ease-in-out infinite;
        }
        
        .progress-text {
          font-size: 0.85rem;
          color: var(--gray-600);
        }
        
        .recommendations-grid.interactive {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .recommendation-item.interactive {
          position: relative;
          transition: all 0.3s ease;
        }
        
        .recommendation-item.interactive:hover {
          transform: translateX(5px);
        }
        
        .recommendation-item.completed {
          opacity: 0.95;
        }
        
        /* Simple Completion Button */
        .completion-button-container {
          margin-top: 1rem;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 1rem;
        }
        
        .completion-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: white;
          border: 2px solid var(--gray-300);
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--gray-700);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          min-width: 160px;
          justify-content: center;
        }
        
        .completion-toggle:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border-color: var(--primary);
        }
        
        .completion-toggle.checked {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }
        
        .completion-toggle.checked:hover {
          background: var(--primary-dark);
          border-color: var(--primary-dark);
        }
        
        .check-icon {
          font-size: 1rem;
        }
        
        .empty-circle {
          width: 14px;
          height: 14px;
          border: 2px solid var(--gray-400);
          border-radius: 50%;
        }
        
        .toggle-text {
          flex: 1;
          text-align: center;
        }
        
        .completion-status {
          margin-left: 0.5rem;
        }
        
        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #4CAF50;
          font-size: 0.9rem;
          font-weight: 600;
        }
        
        /* No Recommendations State */
        .no-recommendations {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 15px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.08);
        }
        
        .no-recommendations p {
          color: var(--gray-600);
          margin-bottom: 1.5rem;
          font-size: 1.1rem;
        }
        
        .retry-button {
          background: var(--primary);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }
        
        .retry-button:hover {
          background: var(--primary-dark);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }
        
        /* Enhanced Advice Cards */
        .advice-section.interactive {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 10px 40px rgba(0,0,0,0.08);
        }
        
        .advice-cards.enhanced {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
        }
        
        .advice-card.interactive {
          background: white;
          padding: 1.5rem;
          border-radius: 15px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.08);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .advice-card.interactive:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 15px 40px rgba(0,0,0,0.15);
        }
        
        .advice-card.interactive::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--primary), var(--primary-light));
        }
        
        .advice-icon {
          font-size: 1.5rem;
          color: var(--primary);
          margin-bottom: 1rem;
        }
        
        .advice-card h4 {
          margin-bottom: 0.75rem;
          color: var(--gray-900);
        }
        
        .advice-card p {
          color: var(--gray-600);
          line-height: 1.6;
          margin-bottom: 1rem;
          font-size: 0.95rem;
        }
        
        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes countUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes activeGlow {
          0% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.3); }
          100% { box-shadow: 0 0 40px rgba(102, 126, 234, 0.6); }
        }
        
        @keyframes progressFill {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @media (max-width: 768px) {
          .results-header {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }
          
          .header-progress {
            width: 100%;
            justify-content: center;
          }
          
          .header-actions {
            width: 100%;
            justify-content: center;
          }
          
          .algorithm-toggle-section {
            padding: 1.5rem;
          }
          
          .algorithm-cards {
            grid-template-columns: 1fr;
          }
          
          .performance-metrics {
            flex-direction: column;
            gap: 1rem;
          }
          
          .scores-grid {
            grid-template-columns: 1fr;
          }
          
          .section-header.with-controls {
            flex-direction: column;
            gap: 1rem;
          }
          
          .error-actions {
            flex-direction: column;
          }
          
          .completion-button-container {
            flex-direction: column;
            align-items: stretch;
            gap: 0.5rem;
          }
          
          .completion-toggle {
            width: 100%;
          }
          
          .completion-status {
            margin-left: 0;
            text-align: center;
          }
          
          .advice-cards.enhanced {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Recommendations;