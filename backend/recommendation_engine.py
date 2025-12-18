import pandas as pd
import random
import math
import os
import pickle
import traceback
import numpy as np
import json
import sqlite3
from datetime import datetime, timedelta
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error

class MentalHealthRecommender:
    def create_minimal_ml_model(self):
        """Create a minimal working ML model that always works"""
        print("\n🔧 Creating MINIMAL ML model...")
        
        try:
            # Create simple scalers
            self.scaler_cluster = StandardScaler()
            self.scaler_ml = StandardScaler()
            
            # Create simple synthetic training data
            print("   Generating synthetic training data...")
            synthetic_data = []
            
            # Generate 50 synthetic samples
            for i in range(50):
                stress = random.uniform(1, 10)
                anxiety = random.uniform(1, 10)
                depression = random.uniform(1, 10)
                sleep = random.uniform(4, 10)
                steps = random.uniform(1000, 15000)
                cluster = random.randint(0, 3)
                
                # Base rating with some logic
                base_rating = 3.5
                if stress > 7:
                    base_rating += 0.3
                if anxiety > 7:
                    base_rating += 0.2
                if depression > 7:
                    base_rating += 0.2
                
                # Add randomness
                base_rating += random.uniform(-0.5, 0.5)
                base_rating = max(1.0, min(5.0, base_rating))
                
                synthetic_data.append([stress, anxiety, depression, sleep, steps, cluster, base_rating])
            
            # Convert to DataFrame
            columns = ['stress', 'anxiety', 'depression', 'sleep', 'steps', 'cluster', 'rating']
            df = pd.DataFrame(synthetic_data, columns=columns)
            
            # Fit scalers
            X = df.drop('rating', axis=1)
            y = df['rating']
            
            X_scaled = self.scaler_ml.fit_transform(X)
            
            # Create and train simple ML model
            print("   Training Random Forest...")
            self.ml_model = RandomForestRegressor(
                n_estimators=30,
                max_depth=8,
                min_samples_split=4,
                random_state=42
            )
            self.ml_model.fit(X_scaled, y)
            
            # Create KMeans model
            print("   Creating KMeans clusters...")
            self.kmeans_model = KMeans(
                n_clusters=3,
                random_state=42,
                n_init=10
            )
            
            # Fit cluster scaler with some data
            cluster_data = []
            for i in range(20):
                cluster_data.append([
                    random.uniform(1, 10),
                    random.uniform(1, 10),
                    random.uniform(1, 10),
                    random.uniform(4, 10),
                    random.uniform(1000, 15000)
                ])
            
            self.scaler_cluster.fit(cluster_data)
            self.kmeans_model.fit(self.scaler_cluster.transform(cluster_data))
            
            print("   ✅ MINIMAL ML model created successfully!")
            print(f"   ML Model: {type(self.ml_model).__name__}")
            print(f"   KMeans Model: {type(self.kmeans_model).__name__}")
            print(f"   Scaler fitted: {hasattr(self.scaler_cluster, 'mean_')}")
            
            return True
            
        except Exception as e:
            print(f"   ❌ Failed to create minimal ML model: {e}")
            traceback.print_exc()
            return False
        
    def ensure_basic_models(self):
        """Ensure basic models exist even if full training fails"""
        print("\n🛠️ Ensuring basic ML models exist...")
        
        try:
            # If no ML model, create a simple one
            if self.ml_model is None:
                print("   Creating basic ML model...")
                self.ml_model = RandomForestRegressor(
                    n_estimators=50,
                    max_depth=10,
                    random_state=42
                )
                
                # Create simple synthetic training data
                synthetic_data = []
                for i in range(100):
                    stress = random.uniform(1, 10)
                    anxiety = random.uniform(1, 10)
                    depression = random.uniform(1, 10)
                    sleep = random.uniform(4, 10)
                    steps = random.uniform(1000, 15000)
                    cluster = random.randint(0, 3)
                    rating = random.uniform(3, 5)
                    
                    synthetic_data.append([stress, anxiety, depression, sleep, steps, cluster, rating])
                
                columns = ['stress', 'anxiety', 'depression', 'sleep', 'steps', 'cluster', 'rating']
                df = pd.DataFrame(synthetic_data, columns=columns)
                
                X = df.drop('rating', axis=1)
                y = df['rating']
                
                X_scaled = self.scaler_ml.fit_transform(X)
                self.ml_model.fit(X_scaled, y)
                print("   ✅ Created basic ML model")
            
            # If no KMeans, create a simple one
            if self.kmeans_model is None:
                print("   Creating basic KMeans model...")
                self.kmeans_model = KMeans(n_clusters=3, random_state=42, n_init=10)
                
                # Create simple synthetic cluster data
                synthetic_clusters = []
                for i in range(50):
                    synthetic_clusters.append([
                        random.uniform(1, 10),
                        random.uniform(1, 10),
                        random.uniform(1, 10),
                        random.uniform(4, 10),
                        random.uniform(1000, 15000)
                    ])
                
                cluster_features_scaled = self.scaler_cluster.fit_transform(synthetic_clusters)
                self.kmeans_model.fit(cluster_features_scaled)
                print("   ✅ Created basic KMeans model")
            
            return True
            
        except Exception as e:
            print(f"   ❌ Failed to create basic models: {e}")
            return False
    def __init__(self, activities_path, interactions_path):
        self.activities = self._safe_read_csv(activities_path)
        self.interactions = self._safe_read_csv(interactions_path)
        self.ratings_db_path = None  # Will be set for real ratings

        # ML model components
        self.kmeans_model = None
        self.ml_model = None
        self.scaler_cluster = StandardScaler()
        self.scaler_ml = StandardScaler()
        self.model_path = os.path.join(os.path.dirname(__file__), 'models')
        os.makedirs(self.model_path, exist_ok=True)

        # Pre-process data
        self._prepare_activities()
        self._prepare_interactions()
        
        # Setup ratings database
        self._setup_ratings_database()
        
        # Check for real ratings
        self.real_ratings_count = self._count_ratings()
        
        print(f"\n📊 Data Loaded:")
        print(f"   Activities: {len(self.activities)} rows")
        print(f"   Interactions: {len(self.interactions)} rows")
        print(f"   Real Ratings Available: {self.real_ratings_count}")
        
        if not self.activities.empty:
            print(f"\n📋 Activity columns: {list(self.activities.columns)}")
            video_columns = [col for col in self.activities.columns if 'video' in col.lower() or 'link' in col.lower()]
            print(f"   Video-related columns found: {video_columns}")
    
    def _setup_ratings_database(self):
        """Setup SQLite database for real ratings"""
        try:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            data_dir = os.path.join(base_dir, 'data')
            os.makedirs(data_dir, exist_ok=True)
            
            self.ratings_db_path = os.path.join(data_dir, 'user_ratings.db')
            
            # Initialize database
            conn = sqlite3.connect(self.ratings_db_path)
            cursor = conn.cursor()
            
            # Create ratings table
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS activity_ratings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                activity_id INTEGER NOT NULL,
                rating REAL NOT NULL,
                stress_level REAL,
                anxiety_score REAL,
                depression_score REAL,
                sleep_hours REAL,
                steps_per_day REAL,
                mood_description TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, activity_id)
            )
            ''')
            
            # Create index for faster queries
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_user_activity ON activity_ratings(user_id, activity_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_activity ON activity_ratings(activity_id)')
            
            conn.commit()
            conn.close()
            
            print(f"✅ Ratings database initialized: {self.ratings_db_path}")
            
        except Exception as e:
            print(f"⚠️ Could not initialize ratings database: {e}")
            self.ratings_db_path = None
    
    def _save_real_rating(self, user_id, activity_id, rating, user_profile=None):
        """Save a real user rating to the database"""
        try:
            if not self.ratings_db_path:
                print("⚠️ No ratings database available")
                return False
            
            conn = sqlite3.connect(self.ratings_db_path)
            cursor = conn.cursor()
            
            # Prepare data
            stress = user_profile.get('Stress_Level', 0) if user_profile else 0
            anxiety = user_profile.get('Anxiety_Score', 0) if user_profile else 0
            depression = user_profile.get('Depression_Score', 0) if user_profile else 0
            sleep = user_profile.get('Sleep_Hours', 7) if user_profile else 7
            steps = user_profile.get('Steps_Per_Day', 5000) if user_profile else 5000
            mood = user_profile.get('Mood_Description', '') if user_profile else ''
            
            # Insert or update rating
            cursor.execute('''
            INSERT OR REPLACE INTO activity_ratings 
            (user_id, activity_id, rating, stress_level, anxiety_score, depression_score, 
             sleep_hours, steps_per_day, mood_description, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ''', (user_id, activity_id, rating, stress, anxiety, depression, sleep, steps, mood))
            
            conn.commit()
            conn.close()
            
            print(f"✅ Saved real rating: User {user_id}, Activity {activity_id}, Rating {rating}")
            return True
            
        except Exception as e:
            print(f"❌ Error saving real rating: {e}")
            return False
    
    def _load_ratings(self):
        """Load real user ratings from database"""
        try:
            if not self.ratings_db_path or not os.path.exists(self.ratings_db_path):
                return pd.DataFrame()
            
            conn = sqlite3.connect(self.ratings_db_path)
            query = '''
            SELECT user_id, activity_id, rating, stress_level, anxiety_score, 
                   depression_score, sleep_hours, steps_per_day, mood_description, 
                   timestamp
            FROM activity_ratings
            WHERE rating IS NOT NULL
            ORDER BY timestamp DESC
            '''
            
            ratings_df = pd.read_sql_query(query, conn)
            conn.close()
            
            print(f"📊 Loaded {len(ratings_df)} real ratings from database")
            return ratings_df
            
        except Exception as e:
            print(f"⚠️ Error loading ratings: {e}")
            return pd.DataFrame()
    
    def _count_ratings(self):
        """Count total real ratings available"""
        try:
            if not self.ratings_db_path or not os.path.exists(self.ratings_db_path):
                return 0
            
            conn = sqlite3.connect(self.ratings_db_path)
            cursor = conn.cursor()
            cursor.execute('SELECT COUNT(*) FROM activity_ratings')
            count = cursor.fetchone()[0]
            conn.close()
            
            return count
            
        except Exception as e:
            print(f"⚠️ Error counting ratings: {e}")
            return 0
    
    def _get_user_profile_from_interactions(self, user_id):
        """Get user profile from interactions CSV"""
        try:
            if self.interactions.empty or 'User_ID' not in self.interactions.columns:
                return None
            
            # Convert User_ID to numeric
            self.interactions['User_ID'] = pd.to_numeric(self.interactions['User_ID'], errors='coerce')
            user_data = self.interactions[self.interactions['User_ID'] == user_id]
            
            if user_data.empty:
                return None
            
            return {
                'Stress_Level': float(user_data.iloc[0].get('Stress_Level', 0)),
                'Anxiety_Score': float(user_data.iloc[0].get('Anxiety_Score', 0)),
                'Depression_Score': float(user_data.iloc[0].get('Depression_Score', 0)),
                'Sleep_Hours': float(user_data.iloc[0].get('Sleep_Hours', 7)),
                'Steps_Per_Day': float(user_data.iloc[0].get('Steps_Per_Day', 5000))
            }
            
        except Exception as e:
            print(f"⚠️ Error getting user profile for {user_id}: {e}")
            return None
    
    def _get_real_rating(self, user_id, activity_id):
        """Get real rating for a user-activity pair"""
        try:
            if not self.ratings_db_path:
                return None
            
            conn = sqlite3.connect(self.ratings_db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
            SELECT rating FROM activity_ratings 
            WHERE user_id = ? AND activity_id = ?
            ''', (user_id, activity_id))
            
            result = cursor.fetchone()
            conn.close()
            
            if result:
                return float(result[0])
            return None
            
        except Exception as e:
            print(f"⚠️ Error getting real rating: {e}")
            return None
    
    def _prepare_activities(self):
        """Pre-process activities data"""
        if self.activities.empty:
            return
        
        self.activities = self.activities.copy()
        
        # Create standardized activity ID column
        self.activities['_activity_id'] = None
        id_columns = ['Activity_ID', 'activity_id', 'ID', 'id', 'ActivityID']
        
        for id_col in id_columns:
            if id_col in self.activities.columns:
                numeric_ids = pd.to_numeric(self.activities[id_col], errors='coerce')
                mask = numeric_ids.notna() & self.activities['_activity_id'].isna()
                self.activities.loc[mask, '_activity_id'] = numeric_ids[mask].astype(int)
        
        # Fill remaining with index + 1
        mask = self.activities['_activity_id'].isna()
        self.activities.loc[mask, '_activity_id'] = self.activities[mask].index + 1
        self.activities['_activity_id'] = self.activities['_activity_id'].astype(int)
        
        # Convert all numeric columns to Python int/float
        numeric_cols = self.activities.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            self.activities[col] = self.activities[col].apply(lambda x: int(x) if pd.notna(x) and not isinstance(x, bool) else x)
    
    def _prepare_interactions(self):
        """Pre-process interactions data"""
        if self.interactions.empty:
            return
        
        self.interactions = self.interactions.copy()
        
        # Ensure numeric columns are Python types
        score_columns = ['Stress_Level', 'Anxiety_Score', 'Depression_Score', 'Sleep_Hours', 'Steps_Per_Day']
        for col in score_columns:
            if col in self.interactions.columns:
                self.interactions[col] = pd.to_numeric(self.interactions[col], errors='coerce').fillna(0).astype(float)
        
        # Convert all numeric columns to Python types
        numeric_cols = self.interactions.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            self.interactions[col] = self.interactions[col].apply(lambda x: float(x) if pd.notna(x) else x)
    
    def _safe_read_csv(self, filepath):
        """Read CSV with multiple encoding attempts"""
        if not os.path.exists(filepath):
            print(f"❌ File not found: {filepath}")
            return pd.DataFrame()
        
        print(f"\n📂 Loading {os.path.basename(filepath)}...")
        
        encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
        
        for encoding in encodings:
            try:
                print(f"   Trying {encoding} encoding...")
                df = pd.read_csv(filepath, encoding=encoding, on_bad_lines='skip')
                if not df.empty:
                    print(f"   ✅ Successfully loaded with {encoding}")
                    df.columns = df.columns.str.strip()
                    return df
            except Exception as e:
                print(f"   ❌ {encoding} failed: {str(e)[:50]}...")
                continue
        
        print(f"⚠️ All encodings failed for {filepath}")
        return pd.DataFrame()
    
    def calculate_user_scores(self, assessment_data):
        """Calculate scores from assessment answers"""
        response_map = {
            'Never': 0,
            'Sometimes': 0.5,
            'Often': 0.75,
            'Almost Always': 1
        }
        
        stress_score = 0
        anxiety_score = 0
        depression_score = 0
        
        print(f"\n📊 Calculating scores...")
        
        for i in range(1, 11):
            stress_key = f'stress_{i}'
            anxiety_key = f'anxiety_{i}'
            depression_key = f'depression_{i}'
            
            stress_response = assessment_data.get(stress_key, 'Never')
            anxiety_response = assessment_data.get(anxiety_key, 'Never')
            depression_response = assessment_data.get(depression_key, 'Never')
            
            stress_score += response_map.get(stress_response, 0)
            anxiety_score += response_map.get(anxiety_response, 0)
            depression_score += response_map.get(depression_response, 0)
        
        print(f"   Raw scores: Stress={stress_score:.2f}, Anxiety={anxiety_score:.2f}, Depression={depression_score:.2f}")
        
        stress_score = min(10, round(stress_score, 2))
        anxiety_score = min(10, round(anxiety_score, 2))
        depression_score = min(10, round(depression_score, 2))
        
        print(f"   Final scores: Stress={stress_score}, Anxiety={anxiety_score}, Depression={depression_score}")
        
        return {
            'Stress_Level': stress_score,
            'Anxiety_Score': anxiety_score,
            'Depression_Score': depression_score
        }
    
    def cluster_users(self, n_clusters=5):
        """Cluster users based on mental health profiles"""
        if self.interactions.empty:
            print("   ⚠️ No interactions data available for clustering")
            return None

        print(f"\n🎯 Clustering users into {n_clusters} groups...")

        features = []
        valid_indices = []

        for idx, interaction in self.interactions.iterrows():
            try:
                user_features = [
                    float(interaction.get('Stress_Level', 0)),
                    float(interaction.get('Anxiety_Score', 0)),
                    float(interaction.get('Depression_Score', 0)),
                    float(interaction.get('Sleep_Hours', 7)),
                    float(interaction.get('Steps_Per_Day', 5000))
                ]
                features.append(user_features)
                valid_indices.append(idx)
            except Exception as e:
                continue

        if len(features) < n_clusters:
            print(f"   ⚠️ Not enough data for clustering")
            return None

        features_scaled = self.scaler_cluster.fit_transform(features)
        
        self.kmeans_model = KMeans(n_clusters=n_clusters, random_state=42, n_init=10, max_iter=200)
        cluster_labels = self.kmeans_model.fit_predict(features_scaled)

        # Add cluster labels
        for i, idx in enumerate(valid_indices):
            self.interactions.at[idx, 'cluster_label'] = int(cluster_labels[i])

        print(f"   ✅ Clustered {len(features)} users into {n_clusters} groups")
        
        return cluster_labels
    
    def _get_user_clusters(self):
        """Get user_id to cluster mapping"""
        user_clusters = {}
        
        if self.interactions.empty or 'cluster_label' not in self.interactions.columns:
            return user_clusters
        
        for idx, row in self.interactions.iterrows():
            user_id = row.get('User_ID')
            cluster = row.get('cluster_label')
            
            if pd.notna(user_id) and pd.notna(cluster):
                user_clusters[int(user_id)] = int(cluster)
        
        return user_clusters
    
    def _get_user_cluster(self, user_id):
        """Get cluster for a specific user"""
        user_clusters = self._get_user_clusters()
        return user_clusters.get(int(user_id), 0)
    
    def train_ml_model_with_real_ratings(self, n_clusters=5):
        """Train ML model using REAL user ratings"""
        print(f"\n🤖 Training ML model with REAL user ratings...")
        
        # Load real ratings
        ratings_df = self._load_ratings()
        
        if ratings_df.empty or len(ratings_df) < 10:
            print(f"   ⚠️ Not enough real ratings ({len(ratings_df)}), using enhanced synthetic")
            return self.train_ml_model_enhanced()
        
        print(f"   📊 Using {len(ratings_df)} REAL user ratings")
        
        # Ensure we have clusters
        if self.kmeans_model is None:
            self.cluster_users(n_clusters)
        
        if self.kmeans_model is None:
            print("   ❌ Clustering failed")
            return False
        
        # Get user clusters
        user_clusters = self._get_user_clusters()
        
        # Prepare training data from real ratings
        training_data = []
        
        for idx, rating_row in ratings_df.iterrows():
            try:
                user_id = int(rating_row['user_id'])
                activity_id = int(rating_row['activity_id'])
                real_rating = float(rating_row['rating'])
                
                # Get user's cluster
                user_cluster = user_clusters.get(user_id, 0)
                
                # Get user profile from ratings or interactions
                stress = float(rating_row.get('stress_level', 0))
                anxiety = float(rating_row.get('anxiety_score', 0))
                depression = float(rating_row.get('depression_score', 0))
                sleep = float(rating_row.get('sleep_hours', 7))
                steps = float(rating_row.get('steps_per_day', 5000))
                
                # Create feature vector
                features = [
                    stress,
                    anxiety,
                    depression,
                    sleep,
                    steps,
                    float(user_cluster)
                ]
                
                training_data.append(features + [real_rating])
                
            except Exception as e:
                continue
        
        if len(training_data) < 20:
            print(f"   ⚠️ Not enough training data from real ratings ({len(training_data)} samples)")
            return self.train_ml_model_enhanced()
        
        # Continue with training
        return self._train_with_data(training_data, "real ratings")
    
    def train_ml_model_enhanced(self, n_clusters=5):
        """Train ML model with enhanced synthetic ratings"""
        print(f"\n🤖 Training ML model with enhanced synthetic ratings...")
        
        if self.interactions.empty or self.activities.empty:
            print("   ⚠️ No data available for training")
            return False
        
        if self.kmeans_model is None:
            self.cluster_users(n_clusters)
        
        if self.kmeans_model is None:
            print("   ❌ Clustering failed")
            return False
        
        # Prepare enhanced synthetic training data
        training_data = []
        
        for idx, interaction in self.interactions.iterrows():
            try:
                if pd.isna(interaction.get('cluster_label')):
                    continue
                
                user_cluster = int(interaction.get('cluster_label', 0))
                
                # Sample activities
                n_samples = min(15, len(self.activities))
                sample_activities = self.activities.sample(n_samples, random_state=idx).iterrows()
                
                for act_idx, activity in sample_activities:
                    activity_id = self._get_activity_id_from_activity(activity)
                    
                    # Create features
                    features = [
                        float(interaction.get('Stress_Level', 0)),
                        float(interaction.get('Anxiety_Score', 0)),
                        float(interaction.get('Depression_Score', 0)),
                        float(interaction.get('Sleep_Hours', 7)),
                        float(interaction.get('Steps_Per_Day', 5000)),
                        float(user_cluster)
                    ]
                    
                    # Get rating - try real first, then enhanced synthetic
                    user_id = interaction.get('User_ID')
                    if user_id and pd.notna(user_id):
                        real_rating = self._get_real_rating(int(user_id), activity_id)
                        if real_rating is not None:
                            rating = real_rating
                        else:
                            rating = self._calculate_enhanced_synthetic_rating(interaction, activity)
                    else:
                        rating = self._calculate_enhanced_synthetic_rating(interaction, activity)
                    
                    training_data.append(features + [rating])
                    
            except Exception as e:
                continue
        
        if len(training_data) < 20:
            print(f"   ⚠️ Not enough training data ({len(training_data)} samples)")
            return False
        
        return self._train_with_data(training_data, "enhanced synthetic")
    
    def train_ml_model_hybrid(self, n_clusters=5):
        """Train ML model with hybrid approach (real + synthetic)"""
        print(f"\n🤖 Training ML model with HYBRID approach...")
        
        # Load real ratings
        real_ratings_df = self._load_ratings()
        
        if real_ratings_df.empty or len(real_ratings_df) < 5:
            print("   ⚠️ Very few real ratings, using enhanced synthetic")
            return self.train_ml_model_enhanced()
        
        # Get user clusters
        if self.kmeans_model is None:
            self.cluster_users(n_clusters)
        
        user_clusters = self._get_user_clusters()
        
        # Combine real and synthetic data
        all_training_data = []
        
        # Add real ratings
        real_count = 0
        for idx, rating_row in real_ratings_df.iterrows():
            try:
                user_id = int(rating_row['user_id'])
                user_cluster = user_clusters.get(user_id, 0)
                
                features = [
                    float(rating_row.get('stress_level', 0)),
                    float(rating_row.get('anxiety_score', 0)),
                    float(rating_row.get('depression_score', 0)),
                    float(rating_row.get('sleep_hours', 7)),
                    float(rating_row.get('steps_per_day', 5000)),
                    float(user_cluster)
                ]
                
                all_training_data.append(features + [float(rating_row['rating'])])
                real_count += 1
            except Exception as e:
                continue
        
        # Add synthetic ratings to reach minimum
        synthetic_needed = max(0, 50 - real_count)
        if synthetic_needed > 0 and not self.interactions.empty:
            print(f"   Adding {synthetic_needed} synthetic ratings for balance")
            
            for i in range(synthetic_needed):
                try:
                    # Random interaction
                    interaction = self.interactions.sample(1).iloc[0]
                    user_cluster = int(interaction.get('cluster_label', 0))
                    
                    # Random activity
                    activity = self.activities.sample(1).iloc[0]
                    
                    features = [
                        float(interaction.get('Stress_Level', 0)),
                        float(interaction.get('Anxiety_Score', 0)),
                        float(interaction.get('Depression_Score', 0)),
                        float(interaction.get('Sleep_Hours', 7)),
                        float(interaction.get('Steps_Per_Day', 5000)),
                        float(user_cluster)
                    ]
                    
                    rating = self._calculate_enhanced_synthetic_rating(interaction, activity)
                    all_training_data.append(features + [rating])
                    
                except Exception as e:
                    continue
        
        print(f"   📊 Training with {real_count} real + {len(all_training_data)-real_count} synthetic ratings")
        return self._train_with_data(all_training_data, "hybrid")
    
    def _train_with_data(self, training_data, data_type):
        """Common training logic"""
        if len(training_data) < 20:
            print(f"   ⚠️ Not enough training data ({len(training_data)} samples)")
            return False
        
        # Convert to DataFrame
        columns = ['stress', 'anxiety', 'depression', 'sleep', 'steps', 'cluster', 'rating']
        df_train = pd.DataFrame(training_data, columns=columns)
        
        # Ensure rating variation
        rating_std = df_train['rating'].std()
        if rating_std < 0.3:
            print(f"   ⚠️ Ratings have low variation (std={rating_std:.3f}), adding noise")
            df_train['rating'] += np.random.normal(0, 0.3, len(df_train))
            df_train['rating'] = df_train['rating'].clip(1, 5)
        
        print(f"   📊 {data_type.capitalize()} training: {len(df_train)} samples, rating std={df_train['rating'].std():.3f}")
        
        # Prepare features and target
        X = df_train.drop('rating', axis=1)
        y = df_train['rating']
        
        # Scale features for ML
        X_scaled = self.scaler_ml.fit_transform(X)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42
        )
        
        # Train Random Forest
        self.ml_model = RandomForestRegressor(
            n_estimators=200,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        
        self.ml_model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = self.ml_model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        rmse = math.sqrt(mse)
        
        print(f"   ✅ {data_type.capitalize()} ML model trained")
        print(f"   Model RMSE: {rmse:.3f}")
        print(f"   Prediction range: {y_pred.min():.2f} - {y_pred.max():.2f}")
        print(f"   Rating std in predictions: {y_pred.std():.3f}")
        
        # Save models
        self._save_models()
        
        return True
    
    def _calculate_enhanced_synthetic_rating(self, interaction, activity):
        """Enhanced synthetic rating calculation"""
        try:
            if isinstance(activity, pd.Series):
                activity_dict = activity.to_dict()
            else:
                activity_dict = self._activity_to_dict(activity)
            
            # User scores
            stress = float(interaction.get('Stress_Level', 0))
            anxiety = float(interaction.get('Anxiety_Score', 0))
            depression = float(interaction.get('Depression_Score', 0))
            sleep = float(interaction.get('Sleep_Hours', 7))
            steps = float(interaction.get('Steps_Per_Day', 5000))
            
            # Activity attributes
            benefits = str(activity_dict.get('Benefits', activity_dict.get('benefits', ''))).lower()
            category = str(activity_dict.get('Category', activity_dict.get('category', ''))).lower()
            activity_type = str(activity_dict.get('Activity_Type', activity_dict.get('type', ''))).lower()
            duration = float(activity_dict.get('Duration_Minutes', activity_dict.get('duration', 20)))
            intensity = str(activity_dict.get('Intensity_Level', activity_dict.get('intensity', 'Medium'))).lower()
            
            # Base rating with more sophisticated calculation
            base_rating = 3.0
            adjustment = 0
            
            # Score-based matching with weights
            weights = {
                'stress': 1.2 if stress > 7 else 1.0,
                'anxiety': 1.3 if anxiety > 7 else 1.0,
                'depression': 1.1 if depression > 7 else 1.0
            }
            
            # Check each benefit
            if 'stress' in benefits and stress > 5:
                adjustment += (stress - 5) * 0.1 * weights['stress']
            if 'anxiety' in benefits and anxiety > 5:
                adjustment += (anxiety - 5) * 0.12 * weights['anxiety']
            if 'depression' in benefits and depression > 5:
                adjustment += (depression - 5) * 0.1 * weights['depression']
            if 'mood' in benefits and depression > 4:
                adjustment += 0.3
            if 'sleep' in benefits and sleep < 6:
                adjustment += 0.4
            if 'energy' in benefits and steps < 4000:
                adjustment += 0.3
            
            # Activity type matching
            if 'meditation' in activity_type and anxiety > 6:
                adjustment += 0.5
            if 'yoga' in activity_type and stress > 5:
                adjustment += 0.4
            if 'exercise' in activity_type and depression > 5:
                adjustment += 0.4
            if 'breathing' in activity_type and (anxiety > 6 or stress > 6):
                adjustment += 0.5
            
            # Duration consideration
            if sleep < 6 and duration > 30:  # Tired users prefer shorter activities
                adjustment -= 0.3
            if steps > 10000 and duration < 15:  # Active users might prefer longer
                adjustment -= 0.2
            
            # Intensity consideration
            if intensity == 'high' and (stress > 8 or anxiety > 8):
                adjustment -= 0.4  # High intensity might be too much
            if intensity == 'low' and depression > 7:
                adjustment -= 0.2  # Low intensity might not help depression
            
            # Add controlled randomness
            adjustment += random.uniform(-0.2, 0.2)
            
            # Calculate final rating
            final_rating = base_rating + adjustment
            final_rating = min(5.0, max(1.0, final_rating))
            
            return round(final_rating, 2)
            
        except Exception as e:
            return random.uniform(2.5, 3.5)
    
    def train_ml_model(self, n_clusters=5):
        """Main training method - chooses best approach based on available data"""
        print(f"\n🤖 Training ML model with optimal approach...")
        
        # Check how many real ratings we have
        ratings_count = self._count_ratings()
        print(f"   Available real ratings: {ratings_count}")
        
        if ratings_count >= 50:
            print("   ✅ Using REAL ratings training (≥50 ratings)")
            return self.train_ml_model_with_real_ratings(n_clusters)
        elif ratings_count >= 10:
            print("   ⚡ Using HYBRID training (10-49 ratings)")
            return self.train_ml_model_hybrid(n_clusters)
        else:
            print("   🔄 Using ENHANCED synthetic training (<10 ratings)")
            return self.train_ml_model_enhanced(n_clusters)
    
    def _calculate_synthetic_rating(self, interaction, activity_id):
        """Legacy method - use enhanced version"""
        activity = self.get_activity_by_id(activity_id)
        if activity is None:
            return random.uniform(2.5, 3.5)
        
        return self._calculate_enhanced_synthetic_rating(interaction, activity)
    
    def _activity_to_dict(self, activity):
        """Safely convert activity to dictionary with Python types"""
        if isinstance(activity, dict):
            result = activity.copy()
        elif hasattr(activity, 'to_dict'):
            result = activity.to_dict()
        elif isinstance(activity, pd.Series):
            result = activity.to_dict()
        else:
            result = dict(activity)
        
        # Convert numpy types to Python types
        for key, value in result.items():
            if isinstance(value, (np.integer, np.int32, np.int64)):
                result[key] = int(value)
            elif isinstance(value, (np.floating, np.float32, np.float64)):
                result[key] = float(value)
            elif isinstance(value, np.ndarray):
                result[key] = value.tolist()
            elif pd.isna(value):
                result[key] = None
        
        return result
    
    def _save_models(self):
        """Save trained models to disk"""
        try:
            models_to_save = {
                'kmeans_model.pkl': self.kmeans_model,
                'ml_model.pkl': self.ml_model,
                'scaler_cluster.pkl': self.scaler_cluster,
                'scaler_ml.pkl': self.scaler_ml
            }
            
            for filename, model in models_to_save.items():
                if model is not None:
                    with open(os.path.join(self.model_path, filename), 'wb') as f:
                        pickle.dump(model, f)
            
            print("   💾 Models saved")
            
        except Exception as e:
            print(f"   ❌ Error saving models: {e}")
    
    def load_models(self):
        """Load trained models from disk"""
        try:
            models_to_load = {
                'kmeans_model.pkl': 'kmeans_model',
                'ml_model.pkl': 'ml_model',
                'scaler_cluster.pkl': 'scaler_cluster',
                'scaler_ml.pkl': 'scaler_ml'
            }
            
            for filename, attr_name in models_to_load.items():
                filepath = os.path.join(self.model_path, filename)
                if os.path.exists(filepath):
                    with open(filepath, 'rb') as f:
                        setattr(self, attr_name, pickle.load(f))
                    print(f"   📂 Loaded {filename}")
                else:
                    return False
            
            return True
            
        except Exception as e:
            print(f"   ❌ Error loading models: {e}")
            return False
    
    def initialize_ml_models(self, n_clusters=5):
        """Initialize and train ML models - FIXED VERSION"""
        print(f"\n🚀 Initializing ML models...")
        
        if self.load_models():
            print("   ✅ Loaded existing models")
            # Check if scalers are fitted
            if (hasattr(self.scaler_cluster, 'mean_') and self.scaler_cluster.mean_ is not None and
                hasattr(self.scaler_ml, 'mean_') and self.scaler_ml.mean_ is not None):
                print("   ✅ Scaler components are fitted")
                return True
            else:
                print("   ⚠️ Models loaded but scalers not fitted properly")
        
        print("   📚 Training new models with optimal approach...")
        success = self.train_ml_model(n_clusters)
        
        if success:
            print("   ✅ ML models initialized")
            # Verify scalers are fitted
            if (hasattr(self.scaler_cluster, 'mean_') and self.scaler_cluster.mean_ is not None):
                print(f"   ✅ Cluster scaler fitted with {len(self.scaler_cluster.mean_)} features")
            if (hasattr(self.scaler_ml, 'mean_') and self.scaler_ml.mean_ is not None):
                print(f"   ✅ ML scaler fitted with {len(self.scaler_ml.mean_)} features")
            
            # Generate insights if we have real ratings
            if self._count_ratings() >= 5:
                self.generate_learning_insights()
        else:
            print("   ❌ Failed to initialize ML models")
        
        return success
    
    def predict_activity_ratings(self, user_profile):
        """Predict ratings for all activities - FIXED VERSION"""
        if self.ml_model is None or self.kmeans_model is None or self.activities.empty:
            print("   ⚠️ Cannot make predictions")
            return {}
        
        print("   🔮 Predicting activity ratings...")
        
        try:
            # Prepare features
            stress = float(user_profile.get('Stress_Level', 0))
            anxiety = float(user_profile.get('Anxiety_Score', 0))
            depression = float(user_profile.get('Depression_Score', 0))
            sleep = float(user_profile.get('Sleep_Hours', 7))
            steps = float(user_profile.get('Steps_Per_Day', 5000))
            
            # Predict cluster - FIX: Check if scaler is fitted
            cluster_features = [stress, anxiety, depression, sleep, steps]
            
            # FIX: Check if scaler_cluster is fitted
            if not hasattr(self.scaler_cluster, 'mean_') or self.scaler_cluster.mean_ is None:
                print("   ⚠️ Cluster scaler not fitted, using default cluster 0")
                cluster_label = 0
            else:
                cluster_features_scaled = self.scaler_cluster.transform([cluster_features])
                cluster_label = int(self.kmeans_model.predict(cluster_features_scaled)[0])
            
            # Prepare ML features - FIX: Check if ML scaler is fitted
            ml_features = cluster_features + [float(cluster_label)]
            
            if not hasattr(self.scaler_ml, 'mean_') or self.scaler_ml.mean_ is None:
                print("   ⚠️ ML scaler not fitted, cannot make predictions")
                return {}
            
            ml_features_scaled = self.scaler_ml.transform([ml_features])
            
            # Predict for all activities
            activity_predictions = {}
            
            for idx, activity in self.activities.iterrows():
                try:
                    activity_id = self._get_activity_id_from_activity(activity)
                    
                    # Predict rating
                    predicted_rating = float(self.ml_model.predict(ml_features_scaled.reshape(1, -1))[0])
                    
                    activity_predictions[activity_id] = {
                        'predicted_rating': predicted_rating,
                        'activity_data': activity,
                        'cluster': cluster_label
                    }
                    
                except Exception as e:
                    print(f"   ⚠️ Error predicting for activity {activity_id}: {e}")
                    continue
            
            print(f"   ✅ Predicted ratings for {len(activity_predictions)} activities")
            
            if activity_predictions:
                ratings = [pred['predicted_rating'] for pred in activity_predictions.values()]
                if len(ratings) > 0:
                    print(f"   📊 Rating range: {min(ratings):.2f} - {max(ratings):.2f}, std: {np.std(ratings):.3f}")
            
            return activity_predictions
            
        except Exception as e:
            print(f"   ❌ ML prediction failed: {e}")
            traceback.print_exc()
            return {}
    
    def get_recommendations(self, user_input, top_n=5, use_ml=True):
        """Get activity recommendations - ULTRA ROBUST VERSION"""
        print(f"\n🎯 Getting recommendations...")
        
        # Calculate scores
        assessment_scores = self.calculate_user_scores(user_input)
        
        # Create user profile
        user_profile = {
            'Stress_Level': assessment_scores['Stress_Level'],
            'Anxiety_Score': assessment_scores['Anxiety_Score'],
            'Depression_Score': assessment_scores['Depression_Score'],
            'Sleep_Hours': float(user_input.get('Sleep_Hours', 7)),
            'Steps_Per_Day': float(user_input.get('Steps_Per_Day', 5000))
        }
        
        print(f"   User profile: {user_profile}")
        
        # Try ML recommendations
        if use_ml:
            print("   🤖 Using ML-based recommendations...")
            try:
                # Ensure basic models exist
                if self.ml_model is None or self.kmeans_model is None:
                    print("   ⚠️ Models missing, creating basic ones...")
                    self.ensure_basic_models()
                
                # Check if scalers are fitted
                if not hasattr(self.scaler_cluster, 'mean_') or self.scaler_cluster.mean_ is None:
                    print("   ⚠️ Cluster scaler not fitted, fitting with defaults...")
                    # Fit with some default data
                    default_data = [[5.0, 5.0, 5.0, 7.0, 5000.0]]
                    self.scaler_cluster.fit(default_data)
                
                activity_predictions = self.predict_activity_ratings(user_profile)
                
                if activity_predictions:
                    # Sort by rating
                    sorted_predictions = sorted(
                        activity_predictions.items(),
                        key=lambda x: x[1]['predicted_rating'],
                        reverse=True
                    )
                    
                    # Get top activities
                    activities = []
                    for activity_id, prediction_data in sorted_predictions[:top_n]:
                        activity = self.get_activity_by_id(activity_id)
                        if activity is not None:
                            formatted_activity = self.format_activity(activity)
                            formatted_activity['predicted_rating'] = float(prediction_data['predicted_rating'])
                            formatted_activity['predicted_cluster'] = int(prediction_data['cluster'])
                            activities.append(formatted_activity)
                    
                    if activities:
                        print(f"   ✅ ML model recommended {len(activities)} activities")
                        return activities, assessment_scores
                        
            except Exception as e:
                print(f"   ⚠️ ML prediction failed: {e}")
                print("   🔄 Using similarity-based recommendations...")
        
        # Fallback to similarity-based
        print("   🔄 Using similarity-based recommendations...")
        activities = self.get_fallback_recommendations_based_on_scores(assessment_scores, top_n)
        return activities, assessment_scores
    
    def generate_learning_insights(self):
        """Generate insights from real ratings"""
        print(f"\n📊 GENERATING LEARNING INSIGHTS FROM REAL RATINGS")
        
        ratings_df = self._load_ratings()
        
        if ratings_df.empty or len(ratings_df) < 5:
            print("   ⚠️ Not enough ratings for insights")
            return
        
        print(f"\n⭐ TOP RATED ACTIVITIES (from {len(ratings_df)} ratings):")
        avg_ratings = ratings_df.groupby('activity_id')['rating'].agg(['mean', 'count'])
        avg_ratings = avg_ratings[avg_ratings['count'] >= 2]  # Only include activities with multiple ratings
        
        if not avg_ratings.empty:
            top_activities = avg_ratings.nlargest(5, 'mean')
            for idx, (activity_id, row) in enumerate(top_activities.iterrows(), 1):
                activity = self.get_activity_by_id(activity_id)
                if activity is not None:
                    activity_name = self._activity_to_dict(activity).get('Activity_Type', f'Activity {activity_id}')
                    print(f"   {idx}. {activity_name}: {row['mean']:.2f}/5 ({int(row['count'])} ratings)")
        
        # What works for different user types
        print(f"\n🎯 WHAT WORKS FOR DIFFERENT USER PROFILES:")
        
        # High anxiety users
        high_anxiety = ratings_df[ratings_df['anxiety_score'] > 7]
        if len(high_anxiety) >= 3:
            anxiety_best = high_anxiety.groupby('activity_id')['rating'].mean().nlargest(3)
            print(f"   😰 High Anxiety Users (anxiety > 7):")
            for activity_id, rating in anxiety_best.items():
                activity = self.get_activity_by_id(activity_id)
                if activity is not None:
                    activity_name = self._activity_to_dict(activity).get('Activity_Type', f'Activity {activity_id}')
                    print(f"      • {activity_name}: {rating:.2f}/5")
        
        # High stress users
        high_stress = ratings_df[ratings_df['stress_level'] > 7]
        if len(high_stress) >= 3:
            stress_best = high_stress.groupby('activity_id')['rating'].mean().nlargest(3)
            print(f"   😫 High Stress Users (stress > 7):")
            for activity_id, rating in stress_best.items():
                activity = self.get_activity_by_id(activity_id)
                if activity is not None:
                    activity_name = self._activity_to_dict(activity).get('Activity_Type', f'Activity {activity_id}')
                    print(f"      • {activity_name}: {rating:.2f}/5")
        
        # Time patterns
        if 'timestamp' in ratings_df.columns:
            try:
                ratings_df['hour'] = pd.to_datetime(ratings_df['timestamp']).dt.hour
                ratings_df['is_morning'] = ratings_df['hour'].between(5, 11)
                ratings_df['is_evening'] = ratings_df['hour'].between(18, 23)
                
                morning_avg = ratings_df[ratings_df['is_morning']]['rating'].mean()
                evening_avg = ratings_df[ratings_df['is_evening']]['rating'].mean()
                
                if not pd.isna(morning_avg) and not pd.isna(evening_avg):
                    print(f"\n⏰ TIME-BASED PATTERNS:")
                    print(f"   🌅 Morning ratings (5-11 AM): {morning_avg:.2f}/5")
                    print(f"   🌙 Evening ratings (6-11 PM): {evening_avg:.2f}/5")
                    
            except Exception as e:
                print(f"   ⚠️ Could not analyze time patterns: {e}")
        
        # Overall statistics
        print(f"\n📈 OVERALL STATISTICS:")
        print(f"   Average rating: {ratings_df['rating'].mean():.2f}/5")
        print(f"   Rating distribution: 1⭐ {len(ratings_df[ratings_df['rating'] <= 2])} | "
              f"2-3⭐ {len(ratings_df[(ratings_df['rating'] > 2) & (ratings_df['rating'] <= 4)])} | "
              f"4-5⭐ {len(ratings_df[ratings_df['rating'] > 4])}")
        
        # Most rated activities
        most_rated = ratings_df['activity_id'].value_counts().head(3)
        print(f"\n🔥 MOST POPULAR ACTIVITIES (by rating count):")
        for activity_id, count in most_rated.items():
            activity = self.get_activity_by_id(activity_id)
            if activity is not None:
                activity_name = self._activity_to_dict(activity).get('Activity_Type', f'Activity {activity_id}')
                avg_rating = ratings_df[ratings_df['activity_id'] == activity_id]['rating'].mean()
                print(f"   • {activity_name}: {count} ratings, avg {avg_rating:.2f}/5")
    
    def continuous_learning_check(self):
        """Check if we should retrain with new ratings"""
        try:
            if not self.ratings_db_path:
                return False
            
            # Check when models were last trained
            model_time = os.path.getmtime(os.path.join(self.model_path, 'ml_model.pkl')) if os.path.exists(os.path.join(self.model_path, 'ml_model.pkl')) else 0
            
            # Check for new ratings since last training
            conn = sqlite3.connect(self.ratings_db_path)
            cursor = conn.cursor()
            
            if model_time > 0:
                last_train_time = datetime.fromtimestamp(model_time)
                cursor.execute('''
                SELECT COUNT(*) FROM activity_ratings 
                WHERE timestamp > ?
                ''', (last_train_time.isoformat(),))
            else:
                cursor.execute('SELECT COUNT(*) FROM activity_ratings')
            
            new_ratings = cursor.fetchone()[0]
            conn.close()
            
            if new_ratings >= 10:
                print(f"\n🔄 {new_ratings} new ratings detected, triggering retraining...")
                success = self.train_ml_model()
                if success:
                    print("✅ Models updated with new learnings")
                    self.generate_learning_insights()
                return success
            
            return False
            
        except Exception as e:
            print(f"⚠️ Error in continuous learning check: {e}")
            return False
    
    def save_user_rating(self, user_id, activity_id, rating, user_profile=None):
        """Save a user rating and trigger learning if needed"""
        success = self._save_real_rating(user_id, activity_id, rating, user_profile)
        
        if success:
            # Check if we should retrain
            self.continuous_learning_check()
        
        return success
    
    def get_activity_by_id(self, activity_id):
        """Get activity by ID"""
        if self.activities.empty:
            return None
        
        try:
            activity_id_int = int(activity_id)
            
            if '_activity_id' in self.activities.columns:
                activity_match = self.activities[self.activities['_activity_id'] == activity_id_int]
                if not activity_match.empty:
                    return activity_match.iloc[0]
            
            if 0 <= activity_id_int - 1 < len(self.activities):
                return self.activities.iloc[activity_id_int - 1]
            
            if len(self.activities) > 0:
                return self.activities.iloc[0]
            
        except Exception as e:
            print(f"   ⚠️ Error getting activity: {e}")
        
        return None
    
    def _get_activity_id_from_activity(self, activity):
        """Extract activity ID from activity"""
        if '_activity_id' in activity:
            return int(activity['_activity_id'])
        
        id_columns = ['Activity_ID', 'activity_id', 'ID', 'id', 'ActivityID']
        for col in id_columns:
            if col in activity and pd.notna(activity[col]):
                try:
                    return int(float(activity[col]))
                except:
                    continue
        
        try:
            if hasattr(activity, 'name'):
                return int(activity.name) + 1
            return 1
        except:
            return 1
    
    def get_fallback_recommendations_based_on_scores(self, scores, n):
        """Fallback recommendations based on scores"""
        print(f"\n🔄 Getting fallback recommendations...")
        
        if not self.activities.empty:
            # Sort by relevance to user's scores
            activities_with_scores = []
            
            for idx, activity in self.activities.iterrows():
                score = 0
                benefits = str(activity.get('Benefits', '')).lower()
                
                if scores['Stress_Level'] > 5 and 'stress' in benefits:
                    score += scores['Stress_Level']
                if scores['Anxiety_Score'] > 5 and 'anxiety' in benefits:
                    score += scores['Anxiety_Score']
                if scores['Depression_Score'] > 5 and ('depression' in benefits or 'mood' in benefits):
                    score += scores['Depression_Score']
                
                # Add some randomness for diversity
                score += random.uniform(0, 1)
                
                activities_with_scores.append({
                    'activity': activity,
                    'score': score
                })
            
            # Sort and get top n
            activities_with_scores.sort(key=lambda x: x['score'], reverse=True)
            activities = []
            for item in activities_with_scores[:n]:
                activities.append(self.format_activity(item['activity']))
            
            return activities[:n]
        else:
            # Create mock activities
            activities = []
            for i in range(min(n, 5)):
                activities.append(self.create_mock_activity(i + 1, scores))
            return activities
    
    def create_mock_activity(self, index, scores):
        """Create a mock activity"""
        categories = ['Stress Relief', 'Anxiety Reduction', 'Mood Enhancement', 'Sleep Improvement', 'General Wellness']
        types = ['Yoga', 'Meditation', 'Breathing Exercise', 'Walking', 'Journaling']
        
        # Choose category based on highest score
        if scores['Stress_Level'] > scores['Anxiety_Score'] and scores['Stress_Level'] > scores['Depression_Score']:
            category = 'Stress Relief'
        elif scores['Anxiety_Score'] > scores['Depression_Score']:
            category = 'Anxiety Reduction'
        else:
            category = 'Mood Enhancement'
        
        return {
            'id': int(index),
            'name': f'{random.choice(types)} - {category}',
            'type': random.choice(types),
            'category': category,
            'duration': random.choice([10, 15, 20, 30]),
            'intensity': random.choice(['Low', 'Medium']),
            'benefits': f'- Helps with {category.lower()}\n- Improves mental clarity',
            'recommended_when': f'When feeling {category.lower().replace("relief", "stressed").replace("reduction", "anxious").replace("enhancement", "down")}',
            'instructions': '1. Find a comfortable space\n2. Follow the instructions\n3. Focus on your breathing',
            'tips': '- Practice consistently\n- Create a peaceful environment',
            'precautions': '- Stop if uncomfortable\n- Consult professional if needed',
            'equipment': 'None required',
            'video_link': f'https://www.youtube.com/results?search_query={category.replace(" ", "+")}+for+mental+health',
            'description': f'A wellness activity designed to help with {category.lower()}.'
        }
    
    def format_activity(self, activity):
        """Format activity for frontend - ensure JSON serializable"""
        try:
            # Convert to dict with Python types
            activity_dict = self._activity_to_dict(activity)
            
            # Get activity ID
            activity_id = self._get_activity_id_from_activity(activity)
            
            # Get activity name
            activity_type = str(activity_dict.get('Activity_Type', activity_dict.get('type', 'Wellness Activity'))).strip()
            
            # Determine category
            benefits = str(activity_dict.get('Benefits', activity_dict.get('benefits', ''))).lower()
            category = 'General Wellness'
            if 'stress' in benefits:
                category = 'Stress Relief'
            elif 'anxiety' in benefits:
                category = 'Anxiety Reduction'
            elif 'depression' in benefits or 'mood' in benefits:
                category = 'Mood Enhancement'
            elif 'sleep' in benefits:
                category = 'Sleep Improvement'
            
            # Get duration
            duration = activity_dict.get('Duration_Minutes', activity_dict.get('duration', 20))
            if isinstance(duration, str):
                try:
                    duration = int(float(duration))
                except:
                    duration = 20
            duration = int(duration)
            
            # Format benefits
            benefits = str(activity_dict.get('Benefits', activity_dict.get('benefits', '- Promotes wellness\n- Reduces stress')))
            
            # Get video link
            video_link = ''
            video_link_columns = ['Video Link', 'Video_Link', 'VideoLink', 'Video URL', 'Video_URL', 'video_link']
            for col in video_link_columns:
                if col in activity_dict and activity_dict[col] and str(activity_dict[col]).strip():
                    video_link = str(activity_dict[col]).strip()
                    break
            
            if not video_link:
                video_link = f'https://www.youtube.com/results?search_query={activity_type.replace(" ", "+")}+for+mental+health'
            
            # Create result with all Python types
            result = {
                'id': int(activity_id),
                'name': str(f"{activity_type} - {category}"),
                'type': str(activity_type),
                'category': str(category),
                'duration': int(duration),
                'intensity': str(activity_dict.get('Intensity_Level', activity_dict.get('intensity', 'Medium'))).strip(),
                'benefits': str(benefits),
                'recommended_when': str(activity_dict.get('Recommended_When', activity_dict.get('recommended_when', 'When needing relaxation'))).strip(),
                'instructions': str(activity_dict.get('Step_By_Step_Instructions', activity_dict.get('instructions', '1. Find a comfortable space\n2. Follow the instructions'))).strip(),
                'tips': str(activity_dict.get('Tips', activity_dict.get('tips', '- Practice consistently\n- Create a peaceful environment'))).strip(),
                'precautions': str(activity_dict.get('Precautions', activity_dict.get('precautions', '- Consult a doctor if needed\n- Stop if uncomfortable'))).strip(),
                'equipment': str(activity_dict.get('Required_Equipment', activity_dict.get('equipment', 'None'))).strip(),
                'video_link': str(video_link),
                'description': str(f"A {activity_type.lower()} activity for {category.lower()}.")
            }
            
            # Remove any None values
            for key in list(result.keys()):
                if result[key] is None:
                    result[key] = ''
            
            return result
            
        except Exception as e:
            print(f"   ⚠️ Error formatting activity: {e}")
            # Return safe default
            return {
                'id': 1,
                'name': 'Wellness Activity',
                'type': 'General',
                'category': 'Wellness',
                'duration': 20,
                'intensity': 'Medium',
                'benefits': '- Promotes relaxation\n- Reduces stress',
                'recommended_when': 'When feeling stressed',
                'instructions': '1. Find a quiet space\n2. Follow the instructions',
                'tips': '- Practice regularly',
                'precautions': '- Stop if uncomfortable',
                'equipment': 'None',
                'video_link': 'https://www.youtube.com/results?search_query=mental+health',
                'description': 'A wellness activity for mental health'
            }