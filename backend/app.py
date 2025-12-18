from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
import sys
import threading
import json
from datetime import datetime
import traceback
import re
import numpy as np
import chardet
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import random

# Add the current directory to path to import our module
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Global variables for user ID management
user_id_lock = threading.Lock()

# Path configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ACTIVITIES_PATH = os.path.join(BASE_DIR, 'data', 'activities_steps_improved.csv')
INTERACTIONS_PATH = os.path.join(BASE_DIR, 'data', 'user_dataset_interlinked.csv')

print(f"\n" + "="*60)
print("🚀 Starting Mental Health Recommender API v4.0")
print("="*60)
print(f"📁 Looking for data files:")
print(f"   Activities: {ACTIVITIES_PATH}")
print(f"   Interactions: {INTERACTIONS_PATH}")
print(f"   Files exist: Activities={os.path.exists(ACTIVITIES_PATH)}, Interactions={os.path.exists(INTERACTIONS_PATH)}")

# ============================================================
# UTILITY FUNCTIONS
# ============================================================

def detect_encoding(filepath):
    """Detect file encoding"""
    try:
        with open(filepath, 'rb') as f:
            raw_data = f.read(10000)
        result = chardet.detect(raw_data)
        encoding = result['encoding']
        confidence = result['confidence']
        return encoding if confidence > 0.7 else 'utf-8'
    except Exception as e:
        return 'utf-8'

def safe_read_csv(filepath, encoding=None):
    """Safely read CSV file with multiple encoding attempts"""
    print(f"\n📖 Reading: {os.path.basename(filepath)}")
    
    if not os.path.exists(filepath):
        print(f"   ⚠ File not found")
        return pd.DataFrame()
    
    # Try multiple encodings
    encodings_to_try = []
    
    if encoding:
        encodings_to_try.append(encoding)
    
    detected_encoding = detect_encoding(filepath)
    if detected_encoding not in encodings_to_try:
        encodings_to_try.append(detected_encoding)
    
    common_encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252', 'windows-1252']
    for enc in common_encodings:
        if enc not in encodings_to_try:
            encodings_to_try.append(enc)
    
    for enc in encodings_to_try:
        try:
            df = pd.read_csv(filepath, encoding=enc)
            print(f"   ✅ Read with {enc}: {len(df)} rows")
            return df
        except:
            continue
    
    try:
        df = pd.read_csv(filepath, encoding='utf-8', errors='replace')
        print(f"   ⚠ Read with error replacement: {len(df)} rows")
        return df
    except Exception as e:
        print(f"   ❌ Failed to read: {e}")
        return pd.DataFrame()

def get_next_user_id():
    """Get the next available user ID from the CSV file"""
    with user_id_lock:
        try:
            if os.path.exists(INTERACTIONS_PATH):
                df = safe_read_csv(INTERACTIONS_PATH)
                if 'User_ID' in df.columns and len(df) > 0:
                    df['User_ID'] = pd.to_numeric(df['User_ID'], errors='coerce')
                    max_id = df['User_ID'].max()
                    if pd.isna(max_id):
                        return 1
                    return int(max_id) + 1
            return 1
        except Exception as e:
            print(f"⚠ Error getting next user ID: {e}")
            return 1

def insert_activity_rating(stress_level, anxiety_score, depression_score, sleep_hours, 
                          steps_per_day, mood_description, recommended_activity_id, activity_rating):
    """Insert a new activity rating into the CSV file"""
    try:
        user_id = get_next_user_id()
        
        new_row = {
            'User_ID': user_id,
            'Stress_Level': float(stress_level),
            'Anxiety_Score': float(anxiety_score),
            'Depression_Score': float(depression_score),
            'Sleep_Hours': float(sleep_hours),
            'Steps_Per_Day': float(steps_per_day),
            'Mood_Description': str(mood_description),
            'Recommended_Activity_ID': int(recommended_activity_id),
            'Activity_Rating': float(activity_rating),
            'Timestamp': datetime.now().isoformat()
        }
        
        new_df = pd.DataFrame([new_row])
        
        if os.path.exists(INTERACTIONS_PATH):
            try:
                existing_df = safe_read_csv(INTERACTIONS_PATH)
                combined_df = pd.concat([existing_df, new_df], ignore_index=True)
            except Exception as e:
                print(f"⚠ Error reading existing CSV: {e}")
                combined_df = new_df
        else:
            combined_df = new_df
        
        combined_df.to_csv(INTERACTIONS_PATH, index=False, encoding='utf-8')
        
        print(f"✅ Saved rating for user {user_id}, activity {recommended_activity_id}")
        return True, "Rating saved successfully", user_id
        
    except Exception as e:
        print(f"❌ Error saving rating: {e}")
        return False, f"Error saving rating: {str(e)}", None

def create_sample_activities():
    """Create sample activities in the correct format"""
    print("\n📝 Creating sample activities...")
    
    sample_activities = [
        {
            'Activity_ID': 1,
            'Activity_Type': 'Cognitive Exercise',
            'Activity_Category': 'Brain Health',
            'Duration_Minutes': 25,
            'Intensity_Level': 'Medium',
            'Benefits': 'Improves focus, enhances memory, reduces stress, boosts mood',
            'Short_Description': 'Brain training exercises to improve cognitive function and reduce stress',
            'Recommended_When': 'When feeling mentally fatigued or stressed',
            'Step_By_Step_Instructions': '1. Choose a cognitive exercise like puzzles or memory games\n2. Set timer for 25 minutes\n3. Focus completely on the task\n4. Take short breaks if needed\n5. Track your progress',
            'Tips': 'Practice daily for best results, vary exercises to challenge different cognitive skills',
            'Precautions': 'Stop if experiencing headaches, take breaks to avoid eye strain',
            'Required_Equipment': 'Puzzle book or cognitive training app',
            'Video_Link': 'https://www.youtube.com/watch?v=q6b6fz9Jh1A'
        },
        {
            'Activity_ID': 2,
            'Activity_Type': 'Deep Breathing',
            'Activity_Category': 'Stress Relief',
            'Duration_Minutes': 10,
            'Intensity_Level': 'Low',
            'Benefits': 'Reduces anxiety, lowers blood pressure, promotes relaxation, improves focus',
            'Short_Description': 'Controlled breathing techniques to calm the nervous system',
            'Recommended_When': 'When feeling anxious or overwhelmed',
            'Step_By_Step_Instructions': '1. Sit comfortably with straight back\n2. Inhale deeply through nose for 4 counts\n3. Hold breath for 4 counts\n4. Exhale slowly through mouth for 6 counts\n5. Repeat for 10 minutes',
            'Tips': 'Practice in quiet environment, focus on belly breathing',
            'Precautions': 'Stop if feeling dizzy',
            'Required_Equipment': 'None',
            'Video_Link': 'https://www.youtube.com/watch?v=tEmt1Znux58'
        },
        {
            'Activity_ID': 3,
            'Activity_Type': 'Mindful Walking',
            'Activity_Category': 'Mindfulness',
            'Duration_Minutes': 20,
            'Intensity_Level': 'Low',
            'Benefits': 'Reduces stress, improves mood, increases mindfulness, connects with nature',
            'Short_Description': 'Walking meditation to bring awareness to the present moment',
            'Recommended_When': 'When feeling disconnected or need mental clarity',
            'Step_By_Step_Instructions': '1. Walk at natural pace\n2. Notice sensations in feet\n3. Pay attention to breathing\n4. Observe surroundings without judgment\n5. Continue for 20 minutes',
            'Tips': 'Walk in nature if possible, leave phone behind',
            'Precautions': 'Stay aware of surroundings',
            'Required_Equipment': 'Comfortable shoes',
            'Video_Link': 'https://www.youtube.com/watch?v=5TiGackg35s'
        },
        {
            'Activity_ID': 4,
            'Activity_Type': 'Progressive Muscle Relaxation',
            'Activity_Category': 'Anxiety Relief',
            'Duration_Minutes': 15,
            'Intensity_Level': 'Low',
            'Benefits': 'Releases tension, reduces anxiety symptoms, promotes better sleep',
            'Short_Description': 'Systematic tensing and relaxing of muscle groups to relieve tension',
            'Recommended_When': 'When feeling physically tense or anxious',
            'Step_By_Step_Instructions': '1. Lie down comfortably\n2. Tense feet muscles for 5 seconds\n3. Release and notice relaxation\n4. Move upward through body\n5. End with facial muscles',
            'Tips': 'Practice before bed for better sleep',
            'Precautions': 'Avoid over-tensing',
            'Required_Equipment': 'Yoga mat or comfortable surface',
            'Video_Link': 'https://www.youtube.com/watch?v=86HUcX8ZtAk'
        },
        {
            'Activity_ID': 5,
            'Activity_Type': 'Gratitude Journaling',
            'Activity_Category': 'Positive Psychology',
            'Duration_Minutes': 10,
            'Intensity_Level': 'Low',
            'Benefits': 'Increases happiness, reduces depression, improves outlook on life',
            'Short_Description': 'Writing down things you are grateful for to boost positivity',
            'Recommended_When': 'When feeling negative or pessimistic',
            'Step_By_Step_Instructions': '1. Write date and time\n2. List 3 specific things grateful for\n3. Describe why grateful for each\n4. Reflect on feelings',
            'Tips': 'Be specific rather than general',
            'Precautions': 'None',
            'Required_Equipment': 'Journal and pen',
            'Video_Link': 'https://www.youtube.com/watch?v=WPPPFqsECz0'
        },
        {
            'Activity_ID': 6,
            'Activity_Type': 'Gentle Yoga',
            'Activity_Category': 'Stress Management',
            'Duration_Minutes': 20,
            'Intensity_Level': 'Medium',
            'Benefits': 'Reduces stress, improves flexibility, increases body awareness',
            'Short_Description': 'Gentle yoga poses to relax body and calm mind',
            'Recommended_When': 'When feeling stiff or mentally fatigued',
            'Step_By_Step_Instructions': '1. Start with child pose\n2. Move to cat-cow\n3. Practice downward dog\n4. End with corpse pose\n5. Focus on deep breathing',
            'Tips': 'Move slowly and mindfully',
            'Precautions': 'Modify poses as needed',
            'Required_Equipment': 'Yoga mat',
            'Video_Link': 'https://www.youtube.com/watch?v=v7AYKMP6rOE'
        },
        {
            'Activity_ID': 7,
            'Activity_Type': 'Guided Meditation',
            'Activity_Category': 'Meditation',
            'Duration_Minutes': 15,
            'Intensity_Level': 'Low',
            'Benefits': 'Reduces anxiety, improves focus, promotes emotional health',
            'Short_Description': 'Audio-guided meditation for relaxation and mindfulness',
            'Recommended_When': 'When mind is racing or anxious',
            'Step_By_Step_Instructions': '1. Find quiet space\n2. Follow guided audio\n3. Focus on breath\n4. Observe thoughts without judgment',
            'Tips': 'Use headphones for better immersion',
            'Precautions': 'Stop if feeling uncomfortable',
            'Required_Equipment': 'Headphones (optional)',
            'Video_Link': 'https://www.youtube.com/watch?v=inpok4MKVLM'
        },
        {
            'Activity_ID': 8,
            'Activity_Type': 'Nature Connection',
            'Activity_Category': 'Eco Therapy',
            'Duration_Minutes': 30,
            'Intensity_Level': 'Low',
            'Benefits': 'Reduces stress, improves mood, increases vitamin D, connects with nature',
            'Short_Description': 'Spending time in nature to reduce stress and improve wellbeing',
            'Recommended_When': 'When feeling indoor fatigue or disconnected',
            'Step_By_Step_Instructions': '1. Go to park or natural area\n2. Leave devices behind\n3. Engage all five senses\n4. Walk slowly and mindfully',
            'Tips': 'Touch plants gently, listen to natural sounds',
            'Precautions': 'Be aware of allergies',
            'Required_Equipment': 'None',
            'Video_Link': 'https://www.youtube.com/watch?v=iwQkHQmB-6s'
        },
        {
            'Activity_ID': 9,
            'Activity_Type': 'Dance Movement',
            'Activity_Category': 'Mood Enhancement',
            'Duration_Minutes': 15,
            'Intensity_Level': 'High',
            'Benefits': 'Boosts mood, increases energy, reduces stress, improves coordination',
            'Short_Description': 'Free-form dance to music for emotional expression and mood boost',
            'Recommended_When': 'When feeling low energy or need mood lift',
            'Step_By_Step_Instructions': '1. Play favorite music\n2. Start with simple movements\n3. Gradually increase intensity\n4. Express emotions through movement',
            'Tips': 'No need to be perfect, focus on enjoyment',
            'Precautions': 'Clear space for safety',
            'Required_Equipment': 'Music player',
            'Video_Link': 'https://www.youtube.com/watch?v=Zy6vBxqlapw'
        },
        {
            'Activity_ID': 10,
            'Activity_Type': 'Self-Compassion Break',
            'Activity_Category': 'Emotional Health',
            'Duration_Minutes': 5,
            'Intensity_Level': 'Low',
            'Benefits': 'Reduces self-criticism, increases self-worth, improves emotional resilience',
            'Short_Description': 'Brief practice of self-kindness during difficult moments',
            'Recommended_When': 'When being self-critical or experiencing shame',
            'Step_By_Step_Instructions': '1. Place hand on heart\n2. Acknowledge your suffering\n3. Remind yourself all humans suffer\n4. Offer kind words to yourself',
            'Tips': 'Use loving-kindness phrases',
            'Precautions': 'None',
            'Required_Equipment': 'None',
            'Video_Link': 'https://www.youtube.com/watch?v=IvtZBUSplr4'
        }
    ]
    
    return pd.DataFrame(sample_activities)

# ============================================================
# ACTIVITY FORMATTER - FIXED FOR CORRECT CARD FORMAT
# ============================================================

class ActivityFormatter:
    """Formats activities for the correct card display format"""
    
    @staticmethod
    def extract_main_benefit(benefits_text, activity_type):
        """Extract the main benefit from benefits text - STRICT VERSION"""
        if not benefits_text or pd.isna(benefits_text):
            return 'General Wellness'
        
        benefits = str(benefits_text).lower()
        
        # STRICT: Only return if keyword is found
        benefit_keywords = {
            'stress': 'Stress Relief',
            'anxiety': 'Anxiety Reduction',
            'depress': 'Mood Enhancement',
            'mood': 'Mood Boost',
            'sleep': 'Sleep Improvement',
            'energy': 'Energy Boost',
            'focus': 'Focus Improvement',
            'relax': 'Relaxation',
            'calm': 'Calmness',
            'tension': 'Tension Release',
            'peace': 'Inner Peace',
            'happiness': 'Happiness',
            'motivation': 'Motivation',
            'clarity': 'Mental Clarity'
        }
        
        for keyword, category in benefit_keywords.items():
            if keyword in benefits:
                return category
        
        # If nothing specific found
        return 'General Wellness'
    
    @staticmethod
    def create_one_line_description(activity_row):
        """Create a one-line description about the activity itself"""
        activity_type = str(activity_row.get('Activity_Type', 'Activity'))
        short_desc = str(activity_row.get('Short_Description', ''))
        
        # Use short description if available and meaningful
        if short_desc and pd.notna(short_desc) and len(short_desc.strip()) > 20:
            return short_desc.strip()
        
        # If we have Benefits text, use the first meaningful sentence
        benefits = str(activity_row.get('Benefits', ''))
        if benefits and pd.notna(benefits) and benefits.strip():
            # Clean the benefits text
            benefits = benefits.replace(';', '.').replace(':', '.')
            sentences = [s.strip() for s in benefits.split('.') if s.strip()]
            
            # Find first meaningful sentence
            for sentence in sentences:
                if len(sentence) > 15:  # Only use sentences that are long enough
                    # Remove bullet points or special characters
                    sentence = sentence.strip('-•* ')
                    return sentence
        
        # Default descriptions based on activity type
        type_lower = activity_type.lower()
        if 'breath' in type_lower:
            return 'Deep breathing techniques to calm your nervous system'
        elif 'meditat' in type_lower:
            return 'Mindfulness meditation practice for inner peace'
        elif 'exercise' in type_lower:
            return 'Cognitive exercises to improve mental function'
        elif 'yoga' in type_lower:
            return 'Gentle yoga poses for relaxation and flexibility'
        elif 'walk' in type_lower:
            return 'Mindful walking to connect with the present moment'
        elif 'journal' in type_lower:
            return 'Writing practice to cultivate gratitude and positivity'
        elif 'dance' in type_lower:
            return 'Free movement to express emotions and boost energy'
        elif 'nature' in type_lower:
            return 'Connecting with nature to reduce stress and improve mood'
        else:
            return f'{activity_type} activity for overall mental wellbeing'
    
    @staticmethod
    def format_activity(activity_row, match_score=None, method='ml'):
        """Format activity row for correct card display"""
        
        # Get basic info
        activity_id = int(activity_row.get('Activity_ID', 0))
        activity_type = str(activity_row.get('Activity_Type', 'Activity')).strip()
        duration = int(float(activity_row.get('Duration_Minutes', 20)))
        intensity = str(activity_row.get('Intensity_Level', 'Medium')).strip()
        
        # Extract main benefit for the title
        benefits = str(activity_row.get('Benefits', ''))
        main_benefit = ActivityFormatter.extract_main_benefit(benefits, activity_type)
        
        # Create the title in format: "Activity Type - Main Benefit"
        # Remove any existing dash in activity_type to avoid double dashes
        if ' - ' in activity_type:
            activity_type = activity_type.split(' - ')[0].strip()
        
        activity_name = f"{activity_type} - {main_benefit}"
        
        # Create one-line description about the activity
        one_line_description = ActivityFormatter.create_one_line_description(activity_row)
        
        # Get video link
        video_link = ''
        video_columns = ['Video Link', 'Video_Link', 'VideoLink', 'Video_URL', 'Video URL']
        
        for col in video_columns:
            if col in activity_row:
                val = activity_row[col]
                if pd.notna(val) and str(val).strip() and str(val).strip().lower() not in ['none', 'nan']:
                    video_link = str(val).strip()
                    break
        
        if not video_link:
            search_query = activity_type.replace(' ', '+')
            video_link = f"https://www.youtube.com/results?search_query={search_query}+mental+health"
        
        # Format benefits with bullet points
        formatted_benefits = ''
        if benefits and pd.notna(benefits):
            # Clean and format benefits
            benefits_text = benefits.replace(';', '.').replace(':', '.')
            sentences = [s.strip() for s in benefits_text.split('.') if s.strip()]
            formatted_benefits = '\n'.join([f'- {sentence}' for sentence in sentences[:5] if sentence])
        else:
            formatted_benefits = '- Promotes mental wellness\n- Reduces stress\n- Improves mood'
        
        # Calculate match percentage
        if match_score is None:
            match_percentage = 80.0
        elif isinstance(match_score, (int, float)):
            match_percentage = float(match_score)
        else:
            match_percentage = 80.0
        
        # Ensure match is reasonable
        match_percentage = max(65.0, min(98.0, match_percentage))
        
        # Create the formatted activity object
        formatted = {
            'id': activity_id,
            'name': activity_name,  # This will display as title
            'type': activity_type,  # Original type without benefit
            'category': str(activity_row.get('Activity_Category', 'Wellness')),
            'duration': duration,  # In minutes
            'intensity': intensity,
            'benefits': formatted_benefits,  # Full benefits with bullet points
            'one_line_description': one_line_description,  # NEW: One line about activity
            'recommended_when': str(activity_row.get('Recommended_When', 'When you need mental support')),
            'instructions': str(activity_row.get('Step_By_Step_Instructions', 'Follow the guided instructions.')),
            'tips': str(activity_row.get('Tips', 'Practice regularly for best results.')),
            'precautions': str(activity_row.get('Precautions', 'Consult healthcare provider if needed.')),
            'equipment': str(activity_row.get('Required_Equipment', 'None required')),
            'video_link': video_link,
            'match_score': match_percentage,  # For backend use
            'match_percentage': f"{match_percentage:.1f}%",  # For display
            'method': method,
            # Frontend will use: name, one_line_description, duration, intensity, match_percentage
        }
        
        # Add cosine similarity if method is cosine
        if method == 'cosine' and 'cosine_similarity' in activity_row:
            formatted['cosine_similarity'] = float(activity_row.get('cosine_similarity', 0))
        
        return formatted

# ============================================================
# UPDATED COSINE RECOMMENDER WITH SCORE-BASED PERSONALIZATION
# ============================================================

class ImprovedCosineRecommender:
    """Cosine similarity recommender with correct formatting and score-based personalization"""
    
    def __init__(self, activities_df):
        self.activities = activities_df
        self.vectorizer = None
        self.activity_vectors = None
        self.formatter = ActivityFormatter()
        self._prepare_features()
    
    def _prepare_features(self):
        """Prepare TF-IDF features"""
        print("\n🔍 Preparing cosine similarity features...")
        
        if self.activities.empty:
            print("   ⚠️ No activities available")
            return
        
        text_features = []
        
        for idx, row in self.activities.iterrows():
            activity_type = str(row.get('Activity_Type', ''))
            benefits = str(row.get('Benefits', ''))
            short_desc = str(row.get('Short_Description', ''))
            category = str(row.get('Activity_Category', ''))
            intensity = str(row.get('Intensity_Level', ''))
            
            # Enhanced text features including category and intensity
            combined_text = f"{activity_type} {category} {intensity} {benefits} {short_desc}"
            combined_text = re.sub(r'[^\w\s-]', ' ', combined_text)
            combined_text = ' '.join(combined_text.split())
            
            text_features.append(combined_text.lower())
        
        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            max_features=500,
            ngram_range=(1, 2)
        )
        self.activity_vectors = self.vectorizer.fit_transform(text_features)
        
        print(f"   ✅ Created vectors for {len(self.activities)} activities")
    
    def get_recommendations(self, user_profile, top_n=5):
        """Get cosine similarity recommendations with score-based personalization"""
        if self.activity_vectors is None:
            return []
        
        # Ensure all values are floats
        stress = float(user_profile.get('Stress_Level', 5))
        anxiety = float(user_profile.get('Anxiety_Score', 5))
        depression = float(user_profile.get('Depression_Score', 5))
        sleep = float(user_profile.get('Sleep_Hours', 7))
        steps = float(user_profile.get('Steps_Per_Day', 5000))
        
        print(f"   Creating personalized vector for Stress={stress}, Anxiety={anxiety}, Depression={depression}")
        
        # Add keywords based on SCORE VALUES (not just thresholds)
        user_keywords = []
        
        # Stress keywords (weighted by stress level)
        if stress > 4:
            user_keywords.extend(['stress relief'] * int(stress))
            user_keywords.extend(['calm'] * int(stress))
            user_keywords.extend(['relaxation', 'tension release'])
        
        # Anxiety keywords (weighted by anxiety level)
        if anxiety > 4:
            user_keywords.extend(['anxiety relief'] * int(anxiety))
            user_keywords.extend(['calm mind'] * int(anxiety))
            user_keywords.extend(['grounding', 'worried', 'panic'])
        
        # Depression keywords (weighted by depression level)
        if depression > 4:
            user_keywords.extend(['mood boost'] * int(depression))
            user_keywords.extend(['energy'] * int(depression))
            user_keywords.extend(['motivation', 'depression', 'sad'])
        
        # Sleep keywords
        if sleep < 6:
            user_keywords.extend(['sleep improvement', 'insomnia', 'rest', 'relax'])
        
        # Activity level keywords
        if steps < 3000:
            user_keywords.extend(['gentle exercise', 'walking', 'beginner', 'low impact'])
        else:
            user_keywords.extend(['active', 'energetic', 'vigorous', 'challenging'])
        
        # Add mood keywords based on scores
        if stress > 7 or anxiety > 7 or depression > 7:
            user_keywords.extend(['mental health support', 'emotional wellness', 'self-care'])
        
        if not user_keywords:
            user_keywords = ['mental health', 'wellness', 'self-care']
        
        # Create weighted user document
        user_doc = ' '.join(user_keywords)
        print(f"   User document keywords: {set(user_keywords)}")
        
        user_vector = self.vectorizer.transform([user_doc])
        
        # Calculate similarities
        similarities = cosine_similarity(user_vector, self.activity_vectors)[0]
        
        # Apply score-based adjustments to similarities
        for i in range(len(similarities)):
            activity = self.activities.iloc[i]
            benefits = str(activity.get('Benefits', '')).lower()
            intensity = str(activity.get('Intensity_Level', '')).lower()
            category = str(activity.get('Activity_Category', '')).lower()
            
            adjustment = 1.0
            
            # Adjust based on user scores
            if stress > 5:
                if 'stress' in benefits:
                    adjustment *= (1.0 + (stress * 0.05))
                if 'stress' in category:
                    adjustment *= (1.0 + (stress * 0.03))
            
            if anxiety > 5:
                if 'anxiety' in benefits:
                    adjustment *= (1.0 + (anxiety * 0.04))
                if 'anxiety' in category:
                    adjustment *= (1.0 + (anxiety * 0.03))
            
            if depression > 5:
                if 'depression' in benefits or 'mood' in benefits:
                    adjustment *= (1.0 + (depression * 0.05))
                if 'mood' in category or 'depression' in category:
                    adjustment *= (1.0 + (depression * 0.03))
            
            # Adjust for sleep
            if sleep < 6 and 'sleep' in benefits:
                adjustment *= 1.3
            
            # Adjust intensity preferences
            if depression > 6 and 'high' in intensity:
                adjustment *= 1.2  # High energy for depression
            if anxiety > 6 and 'low' in intensity:
                adjustment *= 1.2  # Low intensity for anxiety
            if stress > 6 and 'low' in intensity or 'medium' in intensity:
                adjustment *= 1.1
            
            # Apply adjustment
            similarities[i] *= adjustment
        
        # Get top N activities
        top_indices = np.argsort(similarities)[::-1][:top_n]
        
        recommendations = []
        for idx in top_indices:
            activity = self.activities.iloc[idx]
            similarity = float(similarities[idx])
            
            # Calculate match score (65-95%)
            match_score = 65 + (similarity * 30)
            match_score = min(95, max(65, match_score))
            
            # Format the activity
            formatted = self.formatter.format_activity(activity, match_score, method='cosine')
            formatted['cosine_similarity'] = similarity
            
            recommendations.append(formatted)
        
        print(f"   ✅ Generated {len(recommendations)} cosine recommendations")
        if recommendations:
            print(f"   Top cosine: {recommendations[0]['name']} (similarity: {recommendations[0]['cosine_similarity']:.3f})")
        
        return recommendations

# ============================================================
# UPDATED SIMPLE ML RECOMMENDER WITH SCORE-BASED PERSONALIZATION
# ============================================================

class SimpleMentalHealthRecommender:
    """Simple ML recommender with correct formatting and score-based personalization"""
    
    def __init__(self, activities_path, interactions_path):
        print("\n🧠 Initializing Simple ML Recommender...")
        
        self.activities = safe_read_csv(activities_path)
        
        if self.activities.empty:
            print("   ⚠ Could not read activities CSV, creating sample activities")
            self.activities = create_sample_activities()
        
        print(f"   ✅ Loaded {len(self.activities)} activities")
        
        self.interactions = safe_read_csv(interactions_path)
        if not self.interactions.empty:
            print(f"   ✅ Loaded {len(self.interactions)} interactions")
        
        self.formatter = ActivityFormatter()
    
    def get_recommendations(self, user_input, top_n=5):
        """Get recommendations based on user scores"""
        print(f"\n📝 Processing user input for recommendations...")
        
        # Extract user scores and ensure they are floats
        stress = float(user_input.get('Stress_Level', 5))
        anxiety = float(user_input.get('Anxiety_Score', 5))
        depression = float(user_input.get('Depression_Score', 5))
        sleep = float(user_input.get('Sleep_Hours', 7))
        steps = float(user_input.get('Steps_Per_Day', 5000))
        
        scores = {
            'Stress_Level': stress,
            'Anxiety_Score': anxiety,
            'Depression_Score': depression
        }
        
        print(f"   User scores: Stress={stress}, Anxiety={anxiety}, Depression={depression}")
        
        # Calculate activity scores BASED ON USER SCORES
        activity_scores = []
        
        for idx, row in self.activities.iterrows():
            score = 0
            benefits = str(row.get('Benefits', '')).lower()
            activity_type = str(row.get('Activity_Type', '')).lower()
            category = str(row.get('Activity_Category', '')).lower()
            intensity = str(row.get('Intensity_Level', '')).lower()
            
            # SCORE BASED ON USER'S SPECIFIC NEEDS
            
            # 1. Stress-based scoring
            if stress > 4:
                if 'stress' in benefits:
                    score += stress * 4  # Higher stress = more points for stress relief
                if 'calm' in benefits or 'relax' in benefits:
                    score += stress * 3
                if 'stress' in category:
                    score += stress * 2
                    
            # 2. Anxiety-based scoring  
            if anxiety > 4:
                if 'anxiety' in benefits or 'worry' in benefits:
                    score += anxiety * 4
                if 'calm' in benefits or 'grounding' in benefits:
                    score += anxiety * 3
                if 'anxiety' in category:
                    score += anxiety * 2
            
            # 3. Depression-based scoring
            if depression > 4:
                if 'depression' in benefits or 'mood' in benefits:
                    score += depression * 4
                if 'energy' in benefits or 'motivation' in benefits:
                    score += depression * 3
                if 'mood' in category or 'depression' in category:
                    score += depression * 2
            
            # 4. Sleep-based scoring (if poor sleep)
            if sleep < 6:
                if 'sleep' in benefits or 'rest' in benefits:
                    score += 25
                if 'relax' in benefits:
                    score += 15
            
            # 5. Activity level scoring (if low activity)
            if steps < 3000:
                if any(word in activity_type for word in ['gentle', 'walking', 'yoga', 'stretch', 'breathing']):
                    score += 20
                if 'low' in intensity:
                    score += 15
            
            # 6. Activity category bonus
            if 'stress' in category and stress > 5:
                score += 15
            if 'anxiety' in category and anxiety > 5:
                score += 15
            if 'depression' in category or 'mood' in category and depression > 5:
                score += 15
            
            # 7. Intensity adjustment based on scores
            if depression > 6 and 'high' in intensity:
                score += 20  # High energy for depression
            if anxiety > 6 and 'low' in intensity:
                score += 20  # Low intensity for anxiety
            if stress > 6 and ('low' in intensity or 'medium' in intensity):
                score += 15
            
            # 8. Base score for all activities (ensures some score even without matches)
            score += 10
            
            # Add some randomness to avoid same order every time
            score += random.uniform(0, 8)
            
            activity_scores.append((row, score))
        
        # Sort by score (highest first)
        activity_scores.sort(key=lambda x: x[1], reverse=True)
        
        # Get max score for normalization
        max_score = max([s for _, s in activity_scores]) if activity_scores else 1
        
        # Get top N
        recommendations = []
        for activity, score in activity_scores[:top_n]:
            # Convert raw score to match percentage (65-95%)
            match_percentage = 65 + ((score / max_score) * 30)
            match_percentage = min(95, max(65, match_percentage))
            
            formatted = self.formatter.format_activity(activity, match_percentage, method='simple_ml')
            recommendations.append(formatted)
        
        print(f"   ✅ Generated {len(recommendations)} recommendations")
        if recommendations:
            print(f"   Top recommendations:")
            for i, rec in enumerate(recommendations[:3]):
                print(f"   {i+1}. {rec['name']} - Score: {rec['match_score']:.1f}%")
        
        return recommendations, scores

# ============================================================
# HYBRID RECOMMENDER
# ============================================================

class HybridRecommender:
    """Hybrid recommender combining ML and Cosine methods"""
    
    def __init__(self, ml_recommender, cosine_recommender):
        self.ml_recommender = ml_recommender
        self.cosine_recommender = cosine_recommender
        self.formatter = ActivityFormatter()
    
    def get_recommendations(self, user_input, top_n=5):
        """Get hybrid recommendations"""
        print(f"\n🧬 Generating hybrid recommendations...")
        
        # Extract scores and ensure they are floats
        stress = float(user_input.get('Stress_Level', 5))
        anxiety = float(user_input.get('Anxiety_Score', 5))
        depression = float(user_input.get('Depression_Score', 5))
        sleep = float(user_input.get('Sleep_Hours', 7))
        steps = float(user_input.get('Steps_Per_Day', 5000))
        
        print(f"   User scores: Stress={stress}, Anxiety={anxiety}, Depression={depression}")
        
        # Get recommendations from both methods
        ml_recs, scores = self.ml_recommender.get_recommendations(user_input, top_n=8)
        cosine_recs = self.cosine_recommender.get_recommendations({
            'Stress_Level': stress,
            'Anxiety_Score': anxiety,
            'Depression_Score': depression,
            'Sleep_Hours': sleep,
            'Steps_Per_Day': steps
        }, top_n=8)
        
        # Combine and deduplicate
        combined = {}
        
        # Add ML recommendations with weight 1.0
        for rec in ml_recs:
            key = rec['id']
            if key not in combined:
                rec['source'] = 'ml'
                combined[key] = rec
        
        # Add cosine recommendations with weight adjustment
        for rec in cosine_recs:
            key = rec['id']
            if key in combined:
                # Both methods recommend same activity - boost score
                combined[key]['match_score'] = (combined[key]['match_score'] + rec['match_score']) / 2
                combined[key]['source'] = 'hybrid'
                combined[key]['match_score'] = min(95, combined[key]['match_score'] + 5)  # Bonus for being recommended by both
            else:
                rec['source'] = 'cosine'
                combined[key] = rec
        
        # Apply user score-based final adjustments
        for key, rec in combined.items():
            # Boost activities that match high scores
            if stress > 6 and ('stress' in rec['name'].lower() or 'stress' in rec.get('benefits', '').lower()):
                rec['match_score'] = min(95, rec['match_score'] + 8)
            
            if anxiety > 6 and ('anxiety' in rec['name'].lower() or 'anxiety' in rec.get('benefits', '').lower()):
                rec['match_score'] = min(95, rec['match_score'] + 8)
            
            if depression > 6 and ('mood' in rec['name'].lower() or 'depress' in rec.get('benefits', '').lower() or 'mood' in rec.get('benefits', '').lower()):
                rec['match_score'] = min(95, rec['match_score'] + 8)
            
            # Update match percentage for display
            rec['match_percentage'] = f"{rec['match_score']:.1f}%"
        
        # Sort by weighted score
        sorted_recs = sorted(combined.values(), key=lambda x: x['match_score'], reverse=True)
        
        # Take top N
        final_recs = sorted_recs[:top_n]
        
        print(f"   ✅ Generated {len(final_recs)} hybrid recommendations")
        if final_recs:
            print(f"   Top hybrid: {final_recs[0]['name']} ({final_recs[0]['match_score']:.1f}%)")
        
        return final_recs, scores

# ============================================================
# INITIALIZE RECOMMENDERS
# ============================================================

ml_recommender = None
cosine_recommender = None
hybrid_recommender = None

print("\n" + "="*60)
print("Initializing Recommenders...")

# Initialize ML recommender
try:
    ml_recommender = SimpleMentalHealthRecommender(ACTIVITIES_PATH, INTERACTIONS_PATH)
    print(f"✅ Simple ML Recommender initialized")
except Exception as e:
    print(f"❌ Error initializing ML recommender: {e}")
    traceback.print_exc()
    # Create minimal fallback
    class MinimalRecommender:
        def __init__(self):
            self.activities = create_sample_activities()
            self.formatter = ActivityFormatter()
        def get_recommendations(self, user_input, top_n=5):
            scores = {
                'Stress_Level': float(user_input.get('Stress_Level', 5)),
                'Anxiety_Score': float(user_input.get('Anxiety_Score', 5)),
                'Depression_Score': float(user_input.get('Depression_Score', 5))
            }
            recs = []
            activities = self.activities.sample(frac=1).reset_index(drop=True)  # Shuffle
            for i, (_, row) in enumerate(activities.iterrows()):
                if i >= top_n:
                    break
                match_score = 85.0 - (i * 5) + random.uniform(-3, 3)
                formatted = self.formatter.format_activity(row, match_score, method='fallback')
                recs.append(formatted)
            return recs, scores
    ml_recommender = MinimalRecommender()

# Initialize cosine recommender
if ml_recommender and hasattr(ml_recommender, 'activities') and not ml_recommender.activities.empty:
    try:
        cosine_recommender = ImprovedCosineRecommender(ml_recommender.activities)
        print(f"✅ Cosine recommender ready")
    except Exception as e:
        print(f"⚠ Cosine recommender failed: {e}")
        traceback.print_exc()
        cosine_recommender = None
else:
    print("⚠ No activities for cosine recommender")

# Initialize hybrid recommender
if ml_recommender and cosine_recommender:
    try:
        hybrid_recommender = HybridRecommender(ml_recommender, cosine_recommender)
        print(f"✅ Hybrid recommender ready")
    except Exception as e:
        print(f"⚠ Hybrid recommender failed: {e}")
        hybrid_recommender = None

# ============================================================
# CREATE FLASK APP
# ============================================================

app = Flask(__name__)
CORS(app, origins=["*"])

# ============================================================
# ENDPOINTS
# ============================================================

@app.route('/')
def home():
    return jsonify({
        'message': 'Mental Health Recommender API v4.0',
        'status': 'active',
        'version': '4.0',
        'card_format': 'Activity Type - Main Benefit with one-line description',
        'recommenders_available': {
            'ml': ml_recommender is not None,
            'cosine': cosine_recommender is not None,
            'hybrid': hybrid_recommender is not None
        },
        'endpoints': {
            '/': 'This info page',
            '/health': 'GET - Health check',
            '/assess': 'POST - Get hybrid recommendations (default)',
            '/recommend': 'POST - Cosine recommendations',
            '/ml-recommend': 'POST - ML recommendations',
            '/hybrid-recommend': 'POST - Hybrid recommendations',
            '/activity-feedback': 'POST - Submit rating',
            '/activities': 'GET - List activities',
            '/test-format': 'GET - Test activity format'
        }
    })

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'ml_recommender_ready': ml_recommender is not None,
        'cosine_recommender_ready': cosine_recommender is not None,
        'hybrid_recommender_ready': hybrid_recommender is not None,
        'activities_count': len(ml_recommender.activities) if ml_recommender and hasattr(ml_recommender, 'activities') else 0,
        'format': 'Correct card format enabled'
    })

@app.route('/assess', methods=['POST'])
def assess():
    """Main recommendation endpoint - uses hybrid by default"""
    try:
        data = request.json
        
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        print(f"\n📝 Received assessment request:")
        print(f"   Stress: {data.get('Stress_Level', 'N/A')}")
        
        # Use hybrid recommender if available, otherwise fall back
        if hybrid_recommender is not None:
            return hybrid_recommend()
        elif ml_recommender is not None:
            return ml_recommend()
        else:
            return jsonify({'success': False, 'error': 'No recommender available'}), 500
        
    except Exception as e:
        print(f"❌ Error in /assess: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'details': str(e)
        }), 500

@app.route('/hybrid-recommend', methods=['POST'])
def hybrid_recommend():
    """Hybrid recommendations endpoint"""
    try:
        data = request.json
        
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        if hybrid_recommender is None:
            return jsonify({'success': False, 'error': 'Hybrid recommender not available'}), 500
        
        # Get hybrid recommendations
        recommendations, scores = hybrid_recommender.get_recommendations(data, top_n=5)
        
        # Get next user ID
        next_user_id = get_next_user_id()
        
        response = {
            'success': True,
            'next_available_user_id': next_user_id,
            'assessment_scores': scores,
            'recommendations': recommendations,
            'recommendations_count': len(recommendations),
            'method': 'hybrid',
            'message': 'Hybrid recommendations generated with correct card format.'
        }
        
        # Show sample of what was sent
        if recommendations:
            print(f"\n📤 Sample hybrid recommendation:")
            print(f"   Title: {recommendations[0]['name']}")
            print(f"   Description: {recommendations[0]['one_line_description']}")
            print(f"   Duration: {recommendations[0]['duration']} mins")
            print(f"   Intensity: {recommendations[0]['intensity']}")
            print(f"   Match: {recommendations[0]['match_percentage']}")
        
        return jsonify(response)
        
    except Exception as e:
        print(f"❌ Error in /hybrid-recommend: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'details': str(e)
        }), 500

@app.route('/ml-recommend', methods=['POST'])
def ml_recommend():
    """ML recommendations endpoint"""
    try:
        data = request.json
        
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        if ml_recommender is None:
            return jsonify({'success': False, 'error': 'ML recommender not available'}), 500
        
        # Get ML recommendations
        recommendations, scores = ml_recommender.get_recommendations(data, top_n=5)
        
        # Get next user ID
        next_user_id = get_next_user_id()
        
        response = {
            'success': True,
            'next_available_user_id': next_user_id,
            'assessment_scores': scores,
            'recommendations': recommendations,
            'recommendations_count': len(recommendations),
            'method': 'simple_ml',
            'message': 'ML recommendations generated with correct card format.'
        }
        
        # Show sample of what was sent
        if recommendations:
            print(f"\n📤 Sample ML recommendation:")
            print(f"   Title: {recommendations[0]['name']}")
            print(f"   Description: {recommendations[0]['one_line_description']}")
            print(f"   Duration: {recommendations[0]['duration']} mins")
            print(f"   Intensity: {recommendations[0]['intensity']}")
            print(f"   Match: {recommendations[0]['match_percentage']}")
        
        return jsonify(response)
        
    except Exception as e:
        print(f"❌ Error in /ml-recommend: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'details': str(e)
        }), 500

@app.route('/recommend', methods=['POST'])
def cosine_recommend():
    """Cosine similarity recommendations"""
    try:
        data = request.json
        
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        if cosine_recommender is None:
            return jsonify({'success': False, 'error': 'Cosine recommender not available'}), 500
        
        # Extract scores and ensure they are floats
        user_profile = {
            'Stress_Level': float(data.get('Stress_Level', 5)),
            'Anxiety_Score': float(data.get('Anxiety_Score', 5)),
            'Depression_Score': float(data.get('Depression_Score', 5)),
            'Sleep_Hours': float(data.get('Sleep_Hours', 7)),
            'Steps_Per_Day': float(data.get('Steps_Per_Day', 5000))
        }
        
        # Get recommendations
        recommendations = cosine_recommender.get_recommendations(user_profile, top_n=5)
        
        if not recommendations:
            return jsonify({'success': False, 'error': 'No recommendations generated'}), 500
        
        response = {
            'success': True,
            'assessment_scores': user_profile,
            'recommendations': recommendations,
            'recommendations_count': len(recommendations),
            'method': 'cosine_similarity',
            'message': 'Cosine recommendations generated.'
        }
        
        return jsonify(response)
        
    except Exception as e:
        print(f"❌ Error in /recommend: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'details': str(e)
        }), 500

@app.route('/activity-feedback', methods=['POST'])
def submit_activity_feedback():
    """Submit activity rating"""
    try:
        data = request.json or {}
        
        # Extract data
        activity_id = data.get('activity_id') or data.get('recommended_activity_id') or 1
        rating = data.get('rating') or data.get('activity_rating') or 3.0
        stress = data.get('stress_level') or data.get('Stress_Level') or 5.0
        anxiety = data.get('anxiety_score') or data.get('Anxiety_Score') or 5.0
        depression = data.get('depression_score') or data.get('Depression_Score') or 5.0
        sleep = data.get('sleep_hours') or data.get('Sleep_Hours') or 7.0
        steps = data.get('steps_per_day') or data.get('Steps_Per_Day') or 8000
        mood = data.get('mood_description') or data.get('Mood_Description') or 'Neutral'
        
        # Validate
        try:
            activity_id = int(activity_id)
            rating = float(rating)
            if rating < 1 or rating > 5:
                return jsonify({'success': False, 'error': 'Rating must be 1-5'}), 400
        except ValueError:
            return jsonify({'success': False, 'error': 'Invalid numeric values'}), 400
        
        # Save
        success, message, user_id = insert_activity_rating(
            stress_level=stress,
            anxiety_score=anxiety,
            depression_score=depression,
            sleep_hours=sleep,
            steps_per_day=steps,
            mood_description=mood,
            recommended_activity_id=activity_id,
            activity_rating=rating
        )
        
        if success:
            return jsonify({
                'success': True,
                'message': message,
                'user_id': user_id,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({'success': False, 'error': message}), 500
        
    except Exception as e:
        print(f"❌ Error in /activity-feedback: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'details': str(e)
        }), 500

@app.route('/activities', methods=['GET'])
def get_activities():
    """Get list of activities"""
    try:
        activities = []
        formatter = ActivityFormatter()
        
        if ml_recommender and hasattr(ml_recommender, 'activities'):
            for _, row in ml_recommender.activities.head(10).iterrows():
                activity = formatter.format_activity(row, 80.0, method='list')
                activities.append({
                    'id': activity['id'],
                    'name': activity['name'],
                    'description': activity['one_line_description'],
                    'duration': activity['duration'],
                    'intensity': activity['intensity'],
                    'category': activity['category']
                })
        
        return jsonify({
            'success': True,
            'count': len(activities),
            'activities': activities
        })
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/test-format', methods=['GET'])
def test_format():
    """Test the card format"""
    if ml_recommender and hasattr(ml_recommender, 'activities') and not ml_recommender.activities.empty:
        sample_activity = ml_recommender.activities.iloc[0]
        formatted = ActivityFormatter().format_activity(sample_activity, 85.0, method='test')
        
        return jsonify({
            'success': True,
            'card_display': {
                'title': formatted['name'],
                'description': formatted['one_line_description'],
                'duration': f"{formatted['duration']} mins",
                'intensity': formatted['intensity'],
                'match_percentage': formatted['match_percentage']
            },
            'full_data': formatted
        })
    else:
        return jsonify({'success': False, 'error': 'No activities available'})

# ============================================================
# RUN THE APP
# ============================================================

if __name__ == '__main__':
    print(f"\n" + "="*60)
    print("🚀 Mental Health Recommender API v4.0 READY")
    print("="*60)
    print("✅ CARD FORMAT FIXED:")
    print("   • Title: 'Activity Type - Main Benefit'")
    print("   • One-line description about the activity")
    print("   • Duration and Intensity on separate lines")
    print("   • Match percentage separate from description")
    print("="*60)
    print("✅ RECOMMENDATION METHODS:")
    print(f"   • ML Recommender: {'✓ READY' if ml_recommender else '✗ UNAVAILABLE'}")
    print(f"   • Cosine Recommender: {'✓ READY' if cosine_recommender else '✗ UNAVAILABLE'}")
    print(f"   • Hybrid Recommender: {'✓ READY' if hybrid_recommender else '✗ UNAVAILABLE'}")
    print("="*60)
    print("🎯 PERSONALIZATION FEATURES:")
    print("   • Score-based weighting (higher scores = stronger matches)")
    print("   • Dynamic keyword weighting based on user scores")
    print("   • Hybrid combination of multiple methods")
    print("   • Random variation to prevent identical ordering")
    print("="*60)
    
    # Show example format
    print("\n📋 EXAMPLE CARD FORMAT:")
    print("   Deep Breathing - Stress Relief")
    print("   Controlled breathing techniques to calm the nervous system")
    print("   10 mins    Low")
    print("   Recommended for your profile (88.5% match)")
    print("   [Watch Guide] [View Details] [Rate Activity]")
    print("="*60)
    
    print(f"\n📡 Server starting on http://localhost:5000")
    print("="*60)
    
    app.run(debug=True, port=5000, host='0.0.0.0')