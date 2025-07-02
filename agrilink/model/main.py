from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
import pickle
from datetime import datetime
from typing import Optional
import uvicorn

# Pydantic models for request/response
class PredictionRequest(BaseModel):
    crop: str
    district: str
    dayOfWeek: str
    weather: str = "Sunny"  # Default value
    supply: float
    prevPrice: float
    prevDemand: float
    festivalWeek: int = 0  # Default value
    retailPrice: float

class PredictionResponse(BaseModel):
    predictedPrice: float
    predictedDemand: float
    status: str = "success"

class ErrorResponse(BaseModel):
    error: str
    status: str = "error"

# Initialize FastAPI app
app = FastAPI(
    title="Agricultural Price & Demand Prediction API",
    description="API for predicting agricultural commodity prices and demand",
    version="1.0.0"
)

# Global variable to store loaded model
model_data = None

def load_model_once():
    """Load the trained model once at startup"""
    global model_data
    
    if model_data is not None:
        return model_data
    
    model_dir = Path.cwd()
    
    # Try to find model files in order of preference
    possible_files = [
        model_dir / "model.pkl",
        model_dir / "model.joblib", 
        model_dir / "agricultural_prediction_model.pkl",
        model_dir / "agricultural_prediction_model.joblib"
    ]
    
    # Also check for any .pkl or .joblib files in the model directory
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
                
                print(f"✅ Model loaded successfully from: {model_path}")
                return model_data
            except Exception as e:
                print(f"❌ Failed to load {model_path}: {e}")
                continue
    
    raise Exception(f"❌ No valid model file found in {model_dir}")

def preprocess_input(input_data: dict):
    """Preprocess input data using the same pipeline as training"""
    
    # Create DataFrame with the input data
    df = pd.DataFrame([input_data])
    
    # Add date-related features (use current date as default)
    current_date = datetime.now()
    df['Month'] = current_date.month
    df['Year'] = current_date.year
    df['Day'] = current_date.day
    
    # Map input field names to expected feature names
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
    
    # Rename columns to match training data
    for old_name, new_name in field_mapping.items():
        if old_name in df.columns:
            df = df.rename(columns={old_name: new_name})
    
    # Ensure we have all required features
    required_features = ['Crop', 'District', 'DayOfWeek', 'Weather', 
                        'Supply', 'Prev_Price', 'Prev_Demand', 'Festival_Week', 
                        'Retail_Price', 'Month', 'Year', 'Day']
    
    # Add missing features with default values
    for feature in required_features:
        if feature not in df.columns:
            if feature == 'Weather':
                df[feature] = 'Sunny'  # Default weather
            elif feature in ['Month', 'Year', 'Day']:
                continue  # Already added above
            else:
                df[feature] = 0
    
    # Convert numeric columns
    numeric_cols = ['Supply', 'Prev_Price', 'Prev_Demand', 'Festival_Week', 
                   'Retail_Price', 'Month', 'Year', 'Day']
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
    
    # Ensure categorical columns are strings
    categorical_cols = ['Crop', 'District', 'DayOfWeek', 'Weather']
    for col in categorical_cols:
        if col in df.columns:
            df[col] = df[col].astype(str)
    
    # Reorder columns to match training order
    df = df[required_features]
    
    return df

def make_prediction(processed_data):
    """Make prediction using the loaded model"""
    try:
        global model_data
        
        # Extract model components
        model = model_data['model']
        preprocessor = model_data['preprocessor']
        
        # Apply preprocessing pipeline
        processed_features = preprocessor.transform(processed_data)
        
        # Make prediction
        prediction = model.predict(processed_features)
        
        # Handle prediction output
        if len(prediction.shape) == 2:
            # Multi-output prediction
            predicted_price = float(prediction[0][0])
            predicted_demand = float(prediction[0][1] if prediction.shape[1] > 1 else prediction[0][0] * 5)
        else:
            # Single output - assume it's price, estimate demand
            predicted_price = float(prediction[0])
            predicted_demand = float(predicted_price * 5)  # Rough estimate
        
        # Ensure reasonable values
        predicted_price = max(0, predicted_price)
        predicted_demand = max(0, predicted_demand)
        
        return {
            "predictedPrice": round(predicted_price, 2),
            "predictedDemand": round(predicted_demand, 0)
        }
        
    except Exception as e:
        raise Exception(f"Prediction failed: {str(e)}")

# Startup event to load model
@app.on_event("startup")
async def startup_event():
    """Load model when server starts"""
    try:
        load_model_once()
        print("🚀 Server started successfully!")
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        raise e

# Health check endpoint
@app.get("/")
async def root():
    return {
        "message": "Agricultural Prediction API is running!",
        "status": "healthy",
        "endpoints": {
            "predict": "/predict (POST)",
            "health": "/health (GET)",
            "docs": "/docs (GET)"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": model_data is not None,
        "timestamp": datetime.now().isoformat()
    }

# Main prediction endpoint
@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """
    Make agricultural price and demand predictions
    
    - **crop**: Type of crop (e.g., "Rice", "Wheat")
    - **district**: District name
    - **dayOfWeek**: Day of the week
    - **weather**: Weather condition (default: "Sunny")
    - **supply**: Current supply quantity
    - **prevPrice**: Previous price
    - **prevDemand**: Previous demand
    - **festivalWeek**: Festival week indicator (0 or 1)
    - **retailPrice**: Current retail price
    """
    try:
        # Convert request to dict
        input_data = request.dict()
        
        # Preprocess input
        processed_data = preprocess_input(input_data)
        
        # Make prediction
        result = make_prediction(processed_data)
        
        return PredictionResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Run the server
if __name__ == "__main__":
    uvicorn.run(
        "main:app",  # Change "main" to your filename if different
        host="0.0.0.0", 
        port=8000, 
        reload=True  # Auto-reload on code changes (remove in production)
    )