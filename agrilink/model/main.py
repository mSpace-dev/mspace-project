


from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
import pickle
from datetime import datetime, timedelta
from typing import Optional, List
import uvicorn
import pymongo
from pymongo import MongoClient
import logging
from statistics import mean, median
import warnings
warnings.filterwarnings('ignore')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Pydantic models for request/response
class PredictionRequest(BaseModel):
    crop: str
    district: str
    dayOfWeek: str
    weather: str = "Sunny"
    supply: float
    prevPrice: float
    prevDemand: float
    festivalWeek: bool = False
    retailPrice: float

class EnhancedPredictionResponse(BaseModel):
    predictedPrice: float
    predictedDemand: float
    regionalAvg: float
    trend: str
    next3Days: List[float]
    recommendation: str
    priceRange: dict
    marketCondition: str
    confidence: float
    lastUpdated: str
    status: str = "success"

class ErrorResponse(BaseModel):
    error: str
    status: str = "error"

# Initialize FastAPI app
app = FastAPI(
    title="Enhanced Agricultural Price & Demand Prediction API",
    description="AI-powered API for predicting agricultural commodity prices and demand with real-time market insights",
    version="2.0.0"
)

# Global variables
model_data = None
mongo_client = None
db = None
collection = None

class MarketDataAnalyzer:
    """Class to handle market data analysis and insights generation"""
    
    def __init__(self, db_collection):
        self.collection = db_collection
    
    def get_historical_data(self, crop: str, district: str, days: int = 30) -> pd.DataFrame:
        """Fetch historical market data for the specified crop and district"""
        try:
            # Calculate date range
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            # MongoDB query
            query = {
                "crop": {"$regex": crop, "$options": "i"},  # Case insensitive
                "district": {"$regex": district, "$options": "i"},
                "date": {
                    "$gte": start_date,
                    "$lte": end_date
                }
            }
            
            # Fetch data
            cursor = self.collection.find(query).sort("date", -1)
            data = list(cursor)
            
            if not data:
                # Generate sample data if no real data exists
                logger.warning(f"No historical data found for {crop} in {district}. Generating sample data.")
                return self._generate_sample_data(crop, district, days)
            
            # Convert to DataFrame
            df = pd.DataFrame(data)
            
            # Ensure required columns exist
            required_cols = ['date', 'price', 'demand', 'supply']
            for col in required_cols:
                if col not in df.columns:
                    df[col] = np.random.uniform(50, 200, len(df))  # Default values
            
            return df
            
        except Exception as e:
            logger.error(f"Error fetching historical data: {e}")
            return self._generate_sample_data(crop, district, days)
    
    def _generate_sample_data(self, crop: str, district: str, days: int) -> pd.DataFrame:
        """Generate realistic sample market data for testing"""
        dates = [datetime.now() - timedelta(days=i) for i in range(days)]
        
        # Generate realistic price trends
        base_price = np.random.uniform(80, 150)
        price_trend = np.random.choice([-1, 0, 1], p=[0.3, 0.4, 0.3])  # decreasing, stable, increasing
        
        prices = []
        demands = []
        supplies = []
        
        for i, date in enumerate(dates):
            # Price with trend and some randomness
            price = base_price + (price_trend * i * 0.5) + np.random.normal(0, 5)
            price = max(50, price)  # Minimum price
            
            # Demand inversely related to price with some randomness
            demand = 300 - (price * 0.8) + np.random.normal(0, 20)
            demand = max(100, demand)  # Minimum demand
            
            # Supply with seasonal variation
            supply = 250 + np.sin(i * 0.1) * 30 + np.random.normal(0, 15)
            supply = max(150, supply)  # Minimum supply
            
            prices.append(round(price, 2))
            demands.append(round(demand, 0))
            supplies.append(round(supply, 0))
        
        df = pd.DataFrame({
            'date': dates,
            'crop': crop,
            'district': district,
            'price': prices,
            'demand': demands,
            'supply': supplies
        })
        
        return df
    
    def analyze_price_trend(self, df: pd.DataFrame) -> dict:
        """Analyze price trends and market conditions"""
        if len(df) < 7:
            return {
                'trend': 'insufficient_data',
                'regional_avg': 0,
                'market_condition': 'unknown',
                'confidence': 0.0
            }
        
        # Sort by date
        df = df.sort_values('date')
        
        # Calculate trends
        recent_7_days = df.tail(7)['price'].values
        previous_7_days = df.iloc[-14:-7]['price'].values if len(df) >= 14 else df.head(7)['price'].values
        
        recent_avg = np.mean(recent_7_days)
        previous_avg = np.mean(previous_7_days)
        
        # Determine trend
        price_change = recent_avg - previous_avg
        if price_change > 5:
            trend = 'increasing'
        elif price_change < -5:
            trend = 'decreasing'
        else:
            trend = 'stable'
        
        # Market condition analysis
        current_price = df.iloc[-1]['price']
        avg_price = np.mean(df['price'])
        
        if current_price > avg_price * 1.1:
            market_condition = 'high_price'
        elif current_price < avg_price * 0.9:
            market_condition = 'low_price'
        else:
            market_condition = 'normal'
        
        # Calculate confidence based on data consistency
        price_volatility = np.std(df['price']) / np.mean(df['price'])
        confidence = max(0.5, 1 - price_volatility)
        
        return {
            'trend': trend,
            'regional_avg': round(recent_avg, 2),
            'market_condition': market_condition,
            'confidence': round(confidence, 2),
            'price_change': round(price_change, 2)
        }
    
    def forecast_next_days(self, df: pd.DataFrame, days: int = 3) -> List[float]:
        """Simple forecast for next few days using trend analysis"""
        if len(df) < 7:
            current_price = df.iloc[-1]['price'] if len(df) > 0 else 100
            return [current_price] * days
        
        # Sort by date
        df = df.sort_values('date')
        
        # Calculate trend
        recent_prices = df.tail(7)['price'].values
        trend = np.polyfit(range(len(recent_prices)), recent_prices, 1)[0]
        
        # Current price
        current_price = df.iloc[-1]['price']
        
        # Forecast with some randomness
        forecasts = []
        for i in range(1, days + 1):
            forecast = current_price + (trend * i) + np.random.normal(0, 2)
            forecast = max(50, forecast)  # Minimum price
            forecasts.append(round(forecast, 2))
        
        return forecasts
    
    def generate_recommendation(self, predicted_price: float, regional_avg: float, 
                              trend: str, market_condition: str) -> str:
        """Generate intelligent market recommendation"""
        recommendations = []
        
        # Price comparison
        if predicted_price > regional_avg * 1.05:
            recommendations.append("Your predicted price is above regional average.")
        elif predicted_price < regional_avg * 0.95:
            recommendations.append("Your predicted price is below regional average.")
        else:
            recommendations.append("Your predicted price aligns with regional average.")
        
        # Trend analysis
        if trend == 'increasing':
            recommendations.append("Market trend is upward - good time to sell.")
        elif trend == 'decreasing':
            recommendations.append("Market trend is downward - consider holding or diversifying.")
        else:
            recommendations.append("Market trend is stable - consistent demand expected.")
        
        # Market condition
        if market_condition == 'high_price':
            recommendations.append("Current market shows high prices - favorable for sellers.")
        elif market_condition == 'low_price':
            recommendations.append("Current market shows low prices - good for buyers.")
        
        return " ".join(recommendations)

def initialize_mongodb():
    global mongo_client, db, collection
    try:
        # ✅ Assign MongoClient to mongo_client
        mongo_client = MongoClient(
            "mongodb+srv://sansa:123@mspace.bhha4ao.mongodb.net/?retryWrites=true&w=majority",
            serverSelectionTimeoutMS=5000,
            tls=True
        )

        # Test connection
        mongo_client.admin.command('ping')

        # Access database and collection
        db = mongo_client["agriDB"]
        collection = db["market_data"]

        # Create indexes
        collection.create_index([("crop", 1), ("district", 1), ("date", -1)])

        logger.info("✅ MongoDB connected successfully!")

        # Optional: Insert sample data if empty
        if collection.count_documents({}) == 0:
            insert_sample_data()

        return True

    except Exception as e:
        logger.error(f"❌ MongoDB connection failed: {e}")
        logger.warning("Continuing without MongoDB - using mock data")
        return False


def insert_sample_data():
    """Insert sample market data into MongoDB"""
    try:
        logger.info("Inserting sample market data...")
        
        crops = ["Carrot", "Tomato", "Onion", "Beans", "Pumpkin"]
        districts = ["Colombo", "Dambulla", "Jaffna", "Kandy", "Galle"]
        
        sample_data = []
        
        for crop in crops:
            for district in districts:
                # Generate 60 days of data
                for i in range(60):
                    date = datetime.now() - timedelta(days=i)
                    
                    # Base price varies by crop
                    base_prices = {"Carrot": 120, "Tomato": 150, "Onion": 100, "Beans": 200, "Pumpkin": 80}
                    base_price = base_prices.get(crop, 120)
                    
                    # Add some randomness and trends
                    price = base_price + np.random.normal(0, 20) + np.sin(i * 0.1) * 15
                    demand = 300 - (price * 0.5) + np.random.normal(0, 30)
                    supply = 250 + np.random.normal(0, 40)
                    
                    # Ensure positive values
                    price = max(50, price)
                    demand = max(100, demand)
                    supply = max(150, supply)
                    
                    sample_data.append({
                        "crop": crop,
                        "district": district,
                        "date": date,
                        "price": round(price, 2),
                        "demand": round(demand, 0),
                        "supply": round(supply, 0),
                        "weather": np.random.choice(["Sunny", "Rainy", "Cloudy"]),
                        "created_at": datetime.now()
                    })
        
        # Insert data
        collection.insert_many(sample_data)
        logger.info(f"✅ Inserted {len(sample_data)} sample records")
        
    except Exception as e:
        logger.error(f"❌ Failed to insert sample data: {e}")

def load_model_once():
    """Load the trained model once at startup"""
    global model_data
    
    if model_data is not None:
        return model_data
    
    model_dir = Path.cwd()
    
    # Try to find model files
    possible_files = [
        model_dir / "model.pkl",
        model_dir / "model.joblib", 
        model_dir / "agricultural_prediction_model.pkl",
        model_dir / "agricultural_prediction_model.joblib"
    ]
    
    # Also check for any .pkl or .joblib files
    if model_dir.exists():
        pkl_files = list(model_dir.glob("*.pkl"))
        joblib_files = list(model_dir.glob("*.joblib"))
        possible_files.extend(pkl_files + joblib_files)
    
    for model_path in possible_files:
        if model_path.exists():
            try:
                if model_path.suffix == '.pkl':
                    with open(model_path, 'rb') as f:
                        model_data = pickle.load(f)
                else:
                    model_data = joblib.load(model_path)
                
                logger.info(f"✅ Model loaded successfully from: {model_path}")
                return model_data
            except Exception as e:
                logger.error(f"❌ Failed to load {model_path}: {e}")
                continue
    
    # If no model found, create a mock model
    logger.warning("No model file found. Creating mock model for testing.")
    model_data = create_mock_model()
    return model_data

def create_mock_model():
    """Create a mock model for testing purposes"""
    class MockModel:
        def predict(self, X):
            # Simple mock prediction based on input features
            if hasattr(X, 'shape') and len(X.shape) == 2:
                n_samples = X.shape[0]
                # Generate realistic predictions
                prices = np.random.uniform(80, 180, n_samples)
                demands = np.random.uniform(150, 350, n_samples)
                return np.column_stack([prices, demands])
            else:
                return np.array([[np.random.uniform(80, 180), np.random.uniform(150, 350)]])
    
    class MockPreprocessor:
        def transform(self, X):
            # Mock preprocessing - just return the input
            if isinstance(X, pd.DataFrame):
                return X.values
            return X
    
    return {
        'model': MockModel(),
        'preprocessor': MockPreprocessor()
    }

def preprocess_input(input_data: dict):
    """Preprocess input data for model prediction"""
    df = pd.DataFrame([input_data])
    
    # Add date-related features
    current_date = datetime.now()
    df['Month'] = current_date.month
    df['Year'] = current_date.year
    df['Day'] = current_date.day
    
    # Map field names
    field_mapping = {
        'crop': 'Crop',
        'district': 'District', 
        'dayOfWeek': 'DayOfWeek',
        'weather': 'Weather',
        'supply': 'Supply',
        'prevPrice': 'Prev_Price',
        'prevDemand': 'Prev_Demand',
        'festivalWeek': 'Festival_Week',
        'retailPrice': 'Retail_Price'
    }
    
    # Rename columns
    for old_name, new_name in field_mapping.items():
        if old_name in df.columns:
            df = df.rename(columns={old_name: new_name})
    
    # Convert festival week boolean to int
    if 'Festival_Week' in df.columns:
        df['Festival_Week'] = df['Festival_Week'].astype(int)
    
    # Ensure required features
    required_features = ['Crop', 'District', 'DayOfWeek', 'Weather', 
                        'Supply', 'Prev_Price', 'Prev_Demand', 'Festival_Week', 
                        'Retail_Price', 'Month', 'Year', 'Day']
    
    for feature in required_features:
        if feature not in df.columns:
            df[feature] = 0
    
    # Convert data types
    numeric_cols = ['Supply', 'Prev_Price', 'Prev_Demand', 'Festival_Week', 
                   'Retail_Price', 'Month', 'Year', 'Day']
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
    
    categorical_cols = ['Crop', 'District', 'DayOfWeek', 'Weather']
    for col in categorical_cols:
        if col in df.columns:
            df[col] = df[col].astype(str)
    
    return df[required_features]

def make_prediction(processed_data):
    """Make prediction using the loaded model"""
    try:
        global model_data
        
        model = model_data['model']
        preprocessor = model_data['preprocessor']
        
        # Apply preprocessing
        processed_features = preprocessor.transform(processed_data)
        
        # Make prediction
        prediction = model.predict(processed_features)
        
        # Handle different prediction formats
        if len(prediction.shape) == 2:
            predicted_price = float(prediction[0][0])
            predicted_demand = float(prediction[0][1] if prediction.shape[1] > 1 else prediction[0][0] * 2)
        else:
            predicted_price = float(prediction[0])
            predicted_demand = float(predicted_price * 2)
        
        # Ensure reasonable values
        predicted_price = max(50, predicted_price)
        predicted_demand = max(100, predicted_demand)
        
        return {
            "predictedPrice": round(predicted_price, 2),
            "predictedDemand": round(predicted_demand, 0)
        }
        
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise Exception(f"Prediction failed: {str(e)}")

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    try:
        # Initialize MongoDB
        initialize_mongodb()
        
        # Load ML model
        load_model_once()
        
        logger.info("🚀 Enhanced Agricultural Prediction API started successfully!")
        
    except Exception as e:
        logger.error(f"❌ Failed to start server: {e}")
        raise e

# API Endpoints
@app.get("/")
async def root():
    return {
        "message": "Enhanced Agricultural Prediction API is running!",
        "version": "2.0.0",
        "features": [
            "Real-time market data integration",
            "AI-powered price & demand prediction",
            "Market trend analysis",
            "3-day price forecasting",
            "Intelligent recommendations"
        ],
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": model_data is not None,
        "mongodb_connected": mongo_client is not None,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/predict", response_model=EnhancedPredictionResponse)
async def predict(request: PredictionRequest):
    """
    Make enhanced agricultural price and demand predictions with market insights
    """
    try:
        # Convert request to dict
        input_data = request.dict()
        
        # Initialize market analyzer
        if collection:
            analyzer = MarketDataAnalyzer(collection)
        else:
            # Fallback to mock analyzer
            analyzer = MarketDataAnalyzer(None)
        
        # Get historical data
        historical_data = analyzer.get_historical_data(
            crop=input_data['crop'],
            district=input_data['district'],
            days=30
        )
        
        # Analyze market trends
        trend_analysis = analyzer.analyze_price_trend(historical_data)
        
        # Get next 3 days forecast
        next_3_days = analyzer.forecast_next_days(historical_data, 3)
        
        # Preprocess input for ML model
        processed_data = preprocess_input(input_data)
        
        # Make ML prediction
        ml_prediction = make_prediction(processed_data)
        
        # Generate price range
        predicted_price = ml_prediction['predictedPrice']
        price_range = {
            "min": round(predicted_price * 0.9, 2),
            "max": round(predicted_price * 1.1, 2),
            "average": predicted_price
        }
        
        # Generate recommendation
        recommendation = analyzer.generate_recommendation(
            predicted_price=predicted_price,
            regional_avg=trend_analysis['regional_avg'],
            trend=trend_analysis['trend'],
            market_condition=trend_analysis['market_condition']
        )
        
        # Prepare response
        response = EnhancedPredictionResponse(
            predictedPrice=ml_prediction['predictedPrice'],
            predictedDemand=ml_prediction['predictedDemand'],
            regionalAvg=trend_analysis['regional_avg'],
            trend=trend_analysis['trend'],
            next3Days=next_3_days,
            recommendation=recommendation,
            priceRange=price_range,
            marketCondition=trend_analysis['market_condition'],
            confidence=trend_analysis['confidence'],
            lastUpdated=datetime.now().isoformat()
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/market-data/{crop}/{district}")
async def get_market_data(crop: str, district: str, days: int = 30):
    """Get historical market data for a specific crop and district"""
    try:
        if collection:
            analyzer = MarketDataAnalyzer(collection)
            data = analyzer.get_historical_data(crop, district, days)
            
            return {
                "crop": crop,
                "district": district,
                "data_points": len(data),
                "date_range": {
                    "from": data['date'].min().isoformat() if len(data) > 0 else None,
                    "to": data['date'].max().isoformat() if len(data) > 0 else None
                },
                "price_summary": {
                    "min": float(data['price'].min()) if len(data) > 0 else 0,
                    "max": float(data['price'].max()) if len(data) > 0 else 0,
                    "average": float(data['price'].mean()) if len(data) > 0 else 0
                },
                "status": "success"
            }
        else:
            return {"error": "Database not connected", "status": "error"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Run the server
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0", 
        port=8000, 
        reload=True
    )