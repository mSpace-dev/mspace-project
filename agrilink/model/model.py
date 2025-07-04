import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.impute import SimpleImputer
import joblib
from pymongo import MongoClient
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Tuple, Optional
import warnings
import os
from urllib.parse import quote_plus
warnings.filterwarnings('ignore')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MongoDBPriceDemandPredictor:
    def __init__(self, connection_string: str = None, database_name: str = None):
        self.connection_string = connection_string or os.getenv('MONGODB_URI')
        self.database_name = database_name or os.getenv('DB_NAME', 'Agrilink')
        self.client = None
        self.db = None
        self.price_model = None
        self.demand_model = None
        self.label_encoders = {}
        self.scaler = StandardScaler()
        self.imputer = SimpleImputer(strategy='median')
        self.feature_columns = []
        self.last_update = None
        self.target_price_column = None
        self.target_demand_column = None
        self.item_identifier_column = None  # To identify unique items
        self.historical_data = None  # Store historical data for trend analysis

    def connect_to_database(self):
        """Connect to MongoDB Atlas"""
        try:
            if not self.connection_string:
                raise ValueError("MongoDB connection string not provided")

            self.client = MongoClient(self.connection_string)
            self.client.admin.command('ping')
            logger.info("Connected to MongoDB Atlas successfully")
            self.db = self.client[self.database_name]
            return self.client

        except Exception as e:
            logger.error(f"MongoDB connection error: {e}")
            raise

    def inspect_database_structure(self):
        """Inspect the database structure to understand available collections and fields"""
        if not self.client:
            self.connect_to_database()
        
        try:
            collections = self.db.list_collection_names()
            logger.info(f"Available collections: {collections}")
            
            for collection_name in collections:
                collection = self.db[collection_name]
                sample_doc = collection.find_one()
                if sample_doc:
                    logger.info(f"Collection '{collection_name}' sample fields: {list(sample_doc.keys())}")
                    logger.info(f"Collection '{collection_name}' document count: {collection.count_documents({})}")
                else:
                    logger.info(f"Collection '{collection_name}' is empty")
        
        except Exception as e:
            logger.error(f"Error inspecting database structure: {e}")

    def get_primary_data(self, days: int = 30) -> pd.DataFrame:
        """Get primary data from the most relevant collections"""
        if not self.client:
            self.connect_to_database()

        try:
            # Focus on collections that are most likely to have price/demand data
            primary_collections = ['price_records', 'price_changes', 'products', 'market_data']
            
            df_main = pd.DataFrame()
            
            for collection_name in primary_collections:
                try:
                    if collection_name in self.db.list_collection_names():
                        collection = self.db[collection_name]
                        
                        # Get all data from the collection
                        data = list(collection.find().limit(5000))  # Limit to prevent memory issues
                        
                        if data:
                            df = pd.DataFrame(data)
                            logger.info(f"Loaded {len(df)} records from {collection_name}")
                            
                            # Use the largest dataset as main
                            if len(df) > len(df_main):
                                df_main = df
                                logger.info(f"Using {collection_name} as primary dataset")
                            
                except Exception as e:
                    logger.error(f"Error loading collection {collection_name}: {e}")
                    continue
            
            # If no primary data found, try other collections
            if df_main.empty:
                logger.warning("No primary data found, trying other collections...")
                collections = self.db.list_collection_names()
                for collection_name in collections:
                    try:
                        collection = self.db[collection_name]
                        data = list(collection.find().limit(1000))
                        if data:
                            df = pd.DataFrame(data)
                            if len(df) > len(df_main):
                                df_main = df
                                logger.info(f"Using {collection_name} as fallback dataset")
                    except Exception as e:
                        continue
            
            # Remove MongoDB _id column if present
            if '_id' in df_main.columns:
                df_main = df_main.drop('_id', axis=1)
                
            # Store historical data for trend analysis
            self.historical_data = df_main.copy()
                
            logger.info(f"Primary dataset shape: {df_main.shape}")
            logger.info(f"Primary dataset columns: {list(df_main.columns)}")
            
            return df_main

        except Exception as e:
            logger.error(f"Error fetching primary data: {e}")
            raise

    def preprocess_data(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series, pd.Series]:
        """Preprocess data for training with better missing value handling"""
        if df.empty:
            raise ValueError("No data available for preprocessing")
        
        logger.info(f"Preprocessing data with shape: {df.shape}")
        logger.info(f"Available columns: {list(df.columns)}")
        
        # Check data quality
        missing_percentage = (df.isnull().sum() / len(df)) * 100
        logger.info(f"Missing data percentage per column:\n{missing_percentage[missing_percentage > 0]}")
        
        # Remove columns with too many missing values (>80%)
        columns_to_keep = missing_percentage[missing_percentage <= 80].index.tolist()
        df = df[columns_to_keep]
        logger.info(f"Kept {len(columns_to_keep)} columns after removing high-missing columns")
        
        if df.empty:
            raise ValueError("No columns remaining after removing high-missing columns")
        
        # Identify item identifier column
        item_candidates = ['name', 'product_name', 'commodity_name', 'item_name', 'product', 'commodity', 'item']
        for col in item_candidates:
            if col in df.columns:
                self.item_identifier_column = col
                break
        
        if not self.item_identifier_column:
            # Create a generic item identifier if none found
            df['item_name'] = 'Generic_Item'
            self.item_identifier_column = 'item_name'
        
        logger.info(f"Item identifier column: {self.item_identifier_column}")
        
        # Feature engineering based on available columns
        date_columns = ['date', 'createdAt', 'timestamp', 'date_recorded', 'created_at']
        date_col = None
        for col in date_columns:
            if col in df.columns:
                date_col = col
                break
        
        if date_col:
            try:
                df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
                df['month'] = df[date_col].dt.month
                df['quarter'] = df[date_col].dt.quarter
                df['day_of_month'] = df[date_col].dt.day
                df['year'] = df[date_col].dt.year
                df['day_of_week'] = df[date_col].dt.dayofweek
                logger.info(f"Created time features from {date_col}")
            except Exception as e:
                logger.warning(f"Error creating time features: {e}")
        
        # Add current time features if no date column
        if date_col is None or 'month' not in df.columns:
            current_date = datetime.now()
            df['month'] = current_date.month
            df['quarter'] = (current_date.month - 1) // 3 + 1
            df['day_of_month'] = current_date.day
            df['year'] = current_date.year
            df['day_of_week'] = current_date.weekday()
            logger.info("Added current time features")
        
        # Identify categorical and numerical columns
        categorical_cols = []
        numerical_cols = []
        
        for col in df.columns:
            if df[col].dtype in ['object', 'string']:
                # Check if it's actually categorical (not too many unique values)
                if df[col].nunique() < len(df) * 0.5:  # Less than 50% unique values
                    categorical_cols.append(col)
            elif df[col].dtype in ['int64', 'float64']:
                numerical_cols.append(col)
        
        logger.info(f"Categorical columns: {categorical_cols}")
        logger.info(f"Numerical columns: {numerical_cols}")
        
        # Handle categorical variables
        for col in categorical_cols:
            try:
                # Fill missing values in categorical columns
                df[col] = df[col].fillna('unknown')
                
                if col not in self.label_encoders:
                    self.label_encoders[col] = LabelEncoder()
                    df[f'{col}_encoded'] = self.label_encoders[col].fit_transform(df[col].astype(str))
                else:
                    # Handle new categories
                    le = self.label_encoders[col]
                    df[f'{col}_encoded'] = df[col].astype(str).apply(
                        lambda x: le.transform([x])[0] if x in le.classes_ else -1
                    )
                logger.info(f"Encoded categorical column: {col}")
            except Exception as e:
                logger.warning(f"Error encoding {col}: {e}")
                continue
        
        # Prepare feature columns
        feature_cols = []
        
        # Add encoded categorical features
        for col in categorical_cols:
            if f'{col}_encoded' in df.columns:
                feature_cols.append(f'{col}_encoded')
        
        # Add numerical features (exclude ID-like columns)
        for col in numerical_cols:
            if not any(keyword in col.lower() for keyword in ['id', '_id', 'index']):
                feature_cols.append(col)
        
        # Add time-based features
        time_features = ['month', 'quarter', 'day_of_month', 'year', 'day_of_week']
        for col in time_features:
            if col in df.columns:
                feature_cols.append(col)
        
        # Remove duplicates
        feature_cols = list(set(feature_cols))
        logger.info(f"Initial feature columns: {feature_cols}")
        
        # Ensure we have features
        if not feature_cols:
            raise ValueError("No suitable feature columns found")
        
        # Identify target columns
        price_candidates = []
        demand_candidates = []
        
        for col in df.columns:
            col_lower = col.lower()
            if any(keyword in col_lower for keyword in ['price', 'cost', 'rate', 'value', 'amount']) and col in numerical_cols:
                price_candidates.append(col)
            if any(keyword in col_lower for keyword in ['demand', 'quantity', 'volume', 'supply', 'available']) and col in numerical_cols:
                demand_candidates.append(col)
        
        logger.info(f"Price candidates: {price_candidates}")
        logger.info(f"Demand candidates: {demand_candidates}")
        
        # Select target columns
        if price_candidates:
            self.target_price_column = price_candidates[0]
            # Remove target from features
            if self.target_price_column in feature_cols:
                feature_cols.remove(self.target_price_column)
        else:
            # Use first numerical column as price target
            available_numerical = [col for col in numerical_cols if col not in feature_cols]
            if available_numerical:
                self.target_price_column = available_numerical[0]
                logger.warning(f"No price column found, using {self.target_price_column} as price target")
            else:
                raise ValueError("No suitable numerical column found for price target")
        
        if demand_candidates:
            self.target_demand_column = demand_candidates[0]
            # Remove target from features
            if self.target_demand_column in feature_cols:
                feature_cols.remove(self.target_demand_column)
        else:
            # Use second numerical column or create synthetic
            available_numerical = [col for col in numerical_cols if col not in feature_cols and col != self.target_price_column]
            if available_numerical:
                self.target_demand_column = available_numerical[0]
                logger.warning(f"No demand column found, using {self.target_demand_column} as demand target")
            else:
                # Create synthetic demand
                df['synthetic_demand'] = pd.to_numeric(df[self.target_price_column], errors='coerce') * np.random.uniform(0.8, 1.2, len(df))
                self.target_demand_column = 'synthetic_demand'
                logger.warning("Created synthetic demand column")
        
        logger.info(f"Target price column: {self.target_price_column}")
        logger.info(f"Target demand column: {self.target_demand_column}")
        
        # Prepare feature matrix
        X = df[feature_cols].copy()
        
        # Handle missing values in features using imputation
        if X.isnull().any().any():
            logger.info("Imputing missing values in features...")
            X_imputed = self.imputer.fit_transform(X)
            X = pd.DataFrame(X_imputed, columns=feature_cols, index=X.index)
        
        # Prepare targets
        y_price = pd.to_numeric(df[self.target_price_column], errors='coerce')
        y_demand = pd.to_numeric(df[self.target_demand_column], errors='coerce')
        
        # Handle missing values in targets
        price_median = y_price.median()
        demand_median = y_demand.median()
        
        y_price = y_price.fillna(price_median)
        y_demand = y_demand.fillna(demand_median)
        
        # Ensure positive values
        y_price = y_price.abs()
        y_demand = y_demand.abs()
        
        # Remove any remaining invalid rows
        valid_indices = ~(y_price.isna() | y_demand.isna()) & (y_price > 0) & (y_demand > 0)
        X = X[valid_indices]
        y_price = y_price[valid_indices]
        y_demand = y_demand[valid_indices]
        
        if len(X) == 0:
            raise ValueError("No valid data after preprocessing")
        
        self.feature_columns = feature_cols
        logger.info(f"Final dataset shape: X={X.shape}, y_price={y_price.shape}, y_demand={y_demand.shape}")
        logger.info(f"Final feature columns: {self.feature_columns}")
        
        return X, y_price, y_demand
    
    def train_models(self, retrain: bool = False) -> Dict:
        """Train models with MongoDB data"""
        logger.info("Starting model training with MongoDB Atlas data...")
        
        # Get data from MongoDB
        df = self.get_primary_data()
        
        if df.empty:
            raise ValueError("No data available for training from MongoDB")
        
        # Preprocess data
        X, y_price, y_demand = self.preprocess_data(df)
        
        if len(X) < 5:
            raise ValueError(f"Insufficient data for training: {len(X)} samples")
        
        logger.info(f"Training with {len(X)} samples and {len(X.columns)} features")
        
        # Split data (adjust test size for small datasets)
        test_size = min(0.3, max(0.1, 5 / len(X)))
        if len(X) < 10:
            test_size = 0.2
        
        X_train, X_test, y_price_train, y_price_test, y_demand_train, y_demand_test = train_test_split(
            X, y_price, y_demand, test_size=test_size, random_state=42
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train price model with adjusted parameters for small datasets
        n_estimators = min(50, max(5, len(X_train) // 2))
        max_depth = min(6, max(2, len(X.columns) // 2))
        
        self.price_model = RandomForestRegressor(
            n_estimators=n_estimators,
            max_depth=max_depth,
            min_samples_split=max(2, len(X_train) // 20),
            min_samples_leaf=1,
            random_state=42
        )
        self.price_model.fit(X_train_scaled, y_price_train)
        
        # Train demand model
        self.demand_model = RandomForestRegressor(
            n_estimators=n_estimators,
            max_depth=max_depth,
            min_samples_split=max(2, len(X_train) // 20),
            min_samples_leaf=1,
            random_state=42
        )
        self.demand_model.fit(X_train_scaled, y_demand_train)
        
        # Evaluate models
        price_pred = self.price_model.predict(X_test_scaled)
        demand_pred = self.demand_model.predict(X_test_scaled)
        
        # Calculate metrics
        price_mae = mean_absolute_error(y_price_test, price_pred) if len(y_price_test) > 0 else 0
        price_r2 = r2_score(y_price_test, price_pred) if len(y_price_test) > 0 else 0
        demand_mae = mean_absolute_error(y_demand_test, demand_pred) if len(y_demand_test) > 0 else 0
        demand_r2 = r2_score(y_demand_test, demand_pred) if len(y_demand_test) > 0 else 0
        
        metrics = {
            'price_mae': price_mae,
            'price_r2': price_r2,
            'demand_mae': demand_mae,
            'demand_r2': demand_r2,
            'training_samples': len(X_train),
            'test_samples': len(X_test),
            'features_used': self.feature_columns,
            'target_price_column': self.target_price_column,
            'target_demand_column': self.target_demand_column,
            'n_estimators': n_estimators,
            'max_depth': max_depth
        }
        
        self.last_update = datetime.now()
        logger.info(f"Model training completed. Metrics: {metrics}")
        
        return metrics
    
    def calculate_item_statistics(self) -> Dict:
        """Calculate average prices and demand trends for each item with accurate trend detection"""
        if self.historical_data is None or self.historical_data.empty:
            raise ValueError("No historical data available for analysis")
        
        df = self.historical_data.copy()
        
        # Identify date column for trend analysis
        date_columns = ['date', 'createdAt', 'timestamp', 'date_recorded', 'created_at']
        date_col = None
        for col in date_columns:
            if col in df.columns:
                date_col = col
                break
        
        if date_col:
            try:
                df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
                df = df.dropna(subset=[date_col])
                df = df.sort_values(date_col)
            except Exception as e:
                logger.warning(f"Error processing date column: {e}")
                date_col = None
        
        # Get unique items
        if self.item_identifier_column not in df.columns:
            return {"error": "No item identifier column found"}
        
        unique_items = df[self.item_identifier_column].unique()
        item_stats = {}
        
        for item in unique_items:
            if pd.isna(item) or item == 'unknown':
                continue
                
            item_data = df[df[self.item_identifier_column] == item]
            
            if len(item_data) == 0:
                continue
            
            # Calculate average price
            if self.target_price_column and self.target_price_column in item_data.columns:
                prices = pd.to_numeric(item_data[self.target_price_column], errors='coerce')
                prices = prices.dropna()
                avg_price = prices.mean() if len(prices) > 0 else 0
            else:
                avg_price = 0
            
            # Calculate demand trend with improved logic
            if self.target_demand_column and self.target_demand_column in item_data.columns:
                demands = pd.to_numeric(item_data[self.target_demand_column], errors='coerce')
                demands = demands.dropna()
                
                if len(demands) >= 3 and date_col:
                    # Sort by date for time series analysis
                    item_data_sorted = item_data.sort_values(date_col)
                    sorted_demands = pd.to_numeric(item_data_sorted[self.target_demand_column], errors='coerce').dropna()
                    
                    if len(sorted_demands) >= 3:
                        # Method 1: Linear regression for trend detection (most accurate)
                        try:
                            from sklearn.linear_model import LinearRegression
                            import numpy as np
                            
                            X = np.arange(len(sorted_demands)).reshape(-1, 1)
                            y = sorted_demands.values
                            
                            lr = LinearRegression()
                            lr.fit(X, y)
                            
                            slope = lr.coef_[0]
                            r_squared = lr.score(X, y)
                            
                            # Calculate percentage change over the entire period
                            if sorted_demands.iloc[0] > 0:
                                total_change = ((sorted_demands.iloc[-1] - sorted_demands.iloc[0]) / sorted_demands.iloc[0]) * 100
                            else:
                                total_change = 0
                            
                            # Determine trend based on slope and R-squared (confidence)
                            if r_squared > 0.1:  # Only if trend is somewhat reliable
                                mean_demand = sorted_demands.mean()
                                # Normalize slope by mean to get percentage change per period
                                slope_percentage = (slope / mean_demand * 100) if mean_demand > 0 else 0
                                
                                if abs(slope_percentage) < 5:  # Less than 5% change per period
                                    trend = "Stable"
                                    change_percent = total_change
                                elif slope_percentage > 0:
                                    trend = "Increasing"
                                    change_percent = abs(total_change)
                                else:
                                    trend = "Decreasing"
                                    change_percent = -abs(total_change)
                            else:
                                # Low confidence in trend, fall back to variance analysis
                                cv = (sorted_demands.std() / sorted_demands.mean()) * 100 if sorted_demands.mean() > 0 else 0
                                if cv < 15:  # Low coefficient of variation
                                    trend = "Stable"
                                    change_percent = total_change
                                else:
                                    trend = "Variable"
                                    change_percent = total_change
                                    
                        except ImportError:
                            # Fallback method if sklearn is not available
                            # Method 2: Compare first third vs last third
                            third = len(sorted_demands) // 3
                            if third > 0:
                                first_third = sorted_demands.iloc[:third]
                                last_third = sorted_demands.iloc[-third:]
                                
                                first_avg = first_third.mean()
                                last_avg = last_third.mean()
                                
                                if first_avg > 0:
                                    change_percent = ((last_avg - first_avg) / first_avg) * 100
                                else:
                                    change_percent = 0
                                
                                if abs(change_percent) < 10:  # 10% threshold
                                    trend = "Stable"
                                elif change_percent > 0:
                                    trend = "Increasing"
                                else:
                                    trend = "Decreasing"
                            else:
                                # Very few data points, compare first and last
                                first_val = sorted_demands.iloc[0]
                                last_val = sorted_demands.iloc[-1]
                                
                                if first_val > 0:
                                    change_percent = ((last_val - first_val) / first_val) * 100
                                else:
                                    change_percent = 0
                                
                                if abs(change_percent) < 15:  # More lenient for small datasets
                                    trend = "Stable"
                                elif change_percent > 0:
                                    trend = "Increasing"
                                else:
                                    trend = "Decreasing"
                    else:
                        # Less than 3 data points
                        trend = "Insufficient Data"
                        change_percent = 0
                        
                elif len(demands) == 2:
                    # Only 2 data points, simple comparison
                    first_val = demands.iloc[0]
                    last_val = demands.iloc[-1]
                    
                    if first_val > 0:
                        change_percent = ((last_val - first_val) / first_val) * 100
                    else:
                        change_percent = 0
                    
                    if abs(change_percent) < 20:  # More lenient for just 2 points
                        trend = "Stable"
                    elif change_percent > 0:
                        trend = "Increasing"
                    else:
                        trend = "Decreasing"
                        
                elif len(demands) == 1:
                    # Only 1 data point
                    trend = "Single Data Point"
                    change_percent = 0
                    
                else:
                    # No valid demand data
                    trend = "No Data"
                    change_percent = 0
                    
            else:
                # No demand column found
                trend = "No Demand Data"
                change_percent = 0
            
            item_stats[str(item)] = {
                "average_price": round(avg_price, 2),
                "demand_trend": trend,
                "demand_change_percentage": round(change_percent, 2),
                "data_points": len(item_data),
                "price_data_points": len(pd.to_numeric(item_data[self.target_price_column], errors='coerce').dropna()) if self.target_price_column and self.target_price_column in item_data.columns else 0,
                "demand_data_points": len(pd.to_numeric(item_data[self.target_demand_column], errors='coerce').dropna()) if self.target_demand_column and self.target_demand_column in item_data.columns else 0
            }
        
        return item_stats
    
    def prepare_prediction_features(self, input_data: Dict) -> np.ndarray:
        """Prepare features for prediction from API input"""
        if not self.feature_columns:
            raise ValueError("Model not trained. Feature columns not available.")
        
        features = {}
        
        # Initialize all features with default values
        for col in self.feature_columns:
            features[col] = 0
        
        # Map input data to features
        for key, value in input_data.items():
            if key in self.feature_columns:
                features[key] = value
            elif f'{key}_encoded' in self.feature_columns:
                # Handle categorical encoding
                if key in self.label_encoders:
                    le = self.label_encoders[key]
                    if str(value) in le.classes_:
                        features[f'{key}_encoded'] = le.transform([str(value)])[0]
                    else:
                        features[f'{key}_encoded'] = -1
        
        # Add time-based features
        current_date = datetime.now()
        time_feature_mapping = {
            'month': current_date.month,
            'quarter': (current_date.month - 1) // 3 + 1,
            'day_of_month': current_date.day,
            'year': current_date.year,
            'day_of_week': current_date.weekday()
        }
        
        for feature, value in time_feature_mapping.items():
            if feature in self.feature_columns:
                features[feature] = value
        
        # Create feature array in correct order
        feature_array = []
        for col in self.feature_columns:
            features[col] = features.get(col, 0)
            feature_array.append(features[col])
        
        return np.array(feature_array).reshape(1, -1)
    
    def predict(self, input_data: Dict) -> Dict:
        """Make predictions using trained models and return item statistics"""
        if self.price_model is None or self.demand_model is None:
            raise ValueError("Models not trained. Please train models first.")
        
        # Calculate item statistics
        item_stats = self.calculate_item_statistics()
        
        # Prepare features for individual prediction if needed
        if input_data:
            X = self.prepare_prediction_features(input_data)
            X_scaled = self.scaler.transform(X)
            
            # Make predictions
            predicted_price = float(self.price_model.predict(X_scaled)[0])
            predicted_demand = float(self.demand_model.predict(X_scaled)[0])
            
            # Ensure positive predictions
            predicted_price = max(0, predicted_price)
            predicted_demand = max(0, predicted_demand)
        else:
            predicted_price = 0
            predicted_demand = 0
        
        return {
            "items_analysis": item_stats,
            "individual_prediction": {
                "predictedPrice": round(predicted_price, 2),
                "predictedDemand": round(predicted_demand, 2)
            } if input_data else None,
            "summary": {
                "total_items_analyzed": len(item_stats),
                "items_with_increasing_demand": len([item for item in item_stats.values() if item["demand_trend"] == "Increasing"]),
                "items_with_decreasing_demand": len([item for item in item_stats.values() if item["demand_trend"] == "Decreasing"]),
                "items_with_stable_demand": len([item for item in item_stats.values() if item["demand_trend"] == "Stable"])
            },
            "lastUpdated": datetime.now().isoformat(),
            "status": "success",
            "modelInfo": {
                "features_used": len(self.feature_columns),
                "target_price_column": self.target_price_column,
                "target_demand_column": self.target_demand_column,
                "item_identifier_column": self.item_identifier_column
            }
        }
    
    def save_model(self, filepath: str = "mongodb_price_demand_model.joblib"):
        """Save the trained model"""
        if self.price_model is None or self.demand_model is None:
            raise ValueError("No trained models to save")
        
        model_data = {
            'price_model': self.price_model,
            'demand_model': self.demand_model,
            'label_encoders': self.label_encoders,
            'scaler': self.scaler,
            'imputer': self.imputer,
            'feature_columns': self.feature_columns,
            'last_update': self.last_update,
            'target_price_column': self.target_price_column,
            'target_demand_column': self.target_demand_column,
            'item_identifier_column': self.item_identifier_column,
            'historical_data': self.historical_data
        }
        joblib.dump(model_data, filepath)
        logger.info(f"Model saved to {filepath}")
    
    def load_model(self, filepath: str = "mongodb_price_demand_model.joblib"):
        """Load a pre-trained model"""
        try:
            model_data = joblib.load(filepath)
            self.price_model = model_data['price_model']
            self.demand_model = model_data['demand_model']
            self.label_encoders = model_data['label_encoders']
            self.scaler = model_data['scaler']
            self.imputer = model_data.get('imputer', SimpleImputer(strategy='median'))
            self.feature_columns = model_data['feature_columns']
            self.last_update = model_data.get('last_update')
            self.target_price_column = model_data.get('target_price_column')
            self.target_demand_column = model_data.get('target_demand_column')
            self.item_identifier_column = model_data.get('item_identifier_column')
            self.historical_data = model_data.get('historical_data')
            logger.info(f"Model loaded from {filepath}")
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            raise
    
    def close_connection(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()
            logger.info("MongoDB connection closed")

# Training script
def main():
    """Main training function"""
    # Load environment variables
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://sandali:Sandali6254560@mspace.bhha4ao.mongodb.net/Agrilink?retryWrites=true&w=majority&appName=mSpace")
    DB_NAME = os.getenv("DB_NAME", "Agrilink")
    
    # Initialize predictor
    predictor = MongoDBPriceDemandPredictor(
        connection_string=MONGODB_URI,
        database_name=DB_NAME
    )
    
    try:
        # Inspect database structure
        print("=== Inspecting MongoDB Database Structure ===")
        predictor.inspect_database_structure()
        
        # Train model
        print("\n=== Training Model with MongoDB Data ===")
        metrics = predictor.train_models()
        print(f"Training completed! Metrics: {metrics}")
        
        # Save model
        print("\n=== Saving Model ===")
        predictor.save_model("agrilink_price_demand_model.joblib")
        print("Model saved successfully!")
        
        # Test prediction with item analysis
        print("\n=== Testing Prediction with Item Analysis ===")
        test_input = {
            "commodity_name": "Tomato",
            "market_name": "Colombo",
            "category": "Vegetable",
            "quantity": 200
        }
        
        prediction = predictor.predict(test_input)
        print(f"Test prediction: {prediction}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        predictor.close_connection()

if __name__ == "__main__":
    main()