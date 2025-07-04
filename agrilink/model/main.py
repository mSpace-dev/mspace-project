

from flask import Flask, jsonify, request
from model import MongoDBPriceDemandPredictor
import os
from datetime import datetime
from pymongo import MongoClient
import logging

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load MongoDB URI and database name from environment or fallback
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://sandali:Sandali6254560@mspace.bhha4ao.mongodb.net/Agrilink?retryWrites=true&w=majority&appName=mSpace")
DB_NAME = os.getenv("DB_NAME", "Agrilink")
MODEL_PATH = "agrilink_price_demand_model.joblib"

# Initialize the model class
predictor = MongoDBPriceDemandPredictor(
    connection_string=MONGODB_URI,
    database_name=DB_NAME
)

# Load model if exists, else train
if os.path.exists(MODEL_PATH):
    predictor.load_model(MODEL_PATH)
else:
    predictor.connect_to_database()
    predictor.train_models()
    predictor.save_model(MODEL_PATH)

def save_predictions_to_database(prediction_data, prediction_type="auto"):
    """Save prediction results to MongoDB collection"""
    try:
        if not predictor.client:
            predictor.connect_to_database()
        
        # Collection name for storing predictions
        predictions_collection = predictor.db['ml_predictions']
        
        # Prepare document to save
        prediction_document = {
            "prediction_type": prediction_type,
            "timestamp": datetime.now(),
            "prediction_data": prediction_data,
            "model_info": {
                "features_used": len(predictor.feature_columns) if predictor.feature_columns else 0,
                "target_price_column": predictor.target_price_column,
                "target_demand_column": predictor.target_demand_column,
                "item_identifier_column": predictor.item_identifier_column
            },
            "created_at": datetime.now().isoformat(),
            "status": "active"
        }
        
        # Insert the prediction
        result = predictions_collection.insert_one(prediction_document)
        logger.info(f"Prediction saved to database with ID: {result.inserted_id}")
        
        return str(result.inserted_id)
    
    except Exception as e:
        logger.error(f"Error saving prediction to database: {e}")
        raise

def clear_old_predictions():
    """Clear old predictions when retraining"""
    try:
        if not predictor.client:
            predictor.connect_to_database()
        
        predictions_collection = predictor.db['ml_predictions']
        
        # Mark old predictions as inactive instead of deleting
        # This preserves historical prediction data
        update_result = predictions_collection.update_many(
            {"status": "active"},
            {
                "$set": {
                    "status": "inactive",
                    "deactivated_at": datetime.now().isoformat()
                }
            }
        )
        
        logger.info(f"Marked {update_result.modified_count} old predictions as inactive")
        
        return update_result.modified_count
    
    except Exception as e:
        logger.error(f"Error clearing old predictions: {e}")
        raise

def save_item_analysis_to_database(item_stats):
    """Save detailed item analysis to separate collection"""
    try:
        if not predictor.client:
            predictor.connect_to_database()
        
        # Collection for item analysis
        item_analysis_collection = predictor.db['item_analysis']
        
        # Clear old analysis
        item_analysis_collection.update_many(
            {"status": "active"},
            {
                "$set": {
                    "status": "inactive",
                    "deactivated_at": datetime.now().isoformat()
                }
            }
        )
        
        # Save each item's analysis
        documents_to_insert = []
        for item_name, item_data in item_stats.items():
            document = {
                "item_name": item_name,
                "average_price": item_data["average_price"],
                "demand_trend": item_data["demand_trend"],
                "demand_change_percentage": item_data["demand_change_percentage"],
                "data_points": item_data["data_points"],
                "price_data_points": item_data["price_data_points"],
                "demand_data_points": item_data["demand_data_points"],
                "timestamp": datetime.now(),
                "created_at": datetime.now().isoformat(),
                "status": "active"
            }
            documents_to_insert.append(document)
        
        if documents_to_insert:
            result = item_analysis_collection.insert_many(documents_to_insert)
            logger.info(f"Saved {len(result.inserted_ids)} item analyses to database")
            return len(result.inserted_ids)
        
        return 0
    
    except Exception as e:
        logger.error(f"Error saving item analysis to database: {e}")
        raise

def get_prediction_history(limit=10):
    """Get recent prediction history from database"""
    try:
        if not predictor.client:
            predictor.connect_to_database()
        
        predictions_collection = predictor.db['ml_predictions']
        
        # Get recent predictions
        recent_predictions = list(predictions_collection.find(
            {"status": "active"},
            {"_id": 0, "prediction_data.items_analysis": 0}  # Exclude large item analysis data
        ).sort("timestamp", -1).limit(limit))
        
        return recent_predictions
    
    except Exception as e:
        logger.error(f"Error getting prediction history: {e}")
        return []

@app.route("/predict-auto", methods=["GET"])
def predict_auto():
    """Auto prediction with complete item analysis"""
    try:
        # Always fetch the latest data
        df = predictor.get_primary_data()
        
        if df.empty:
            return jsonify({"error": "No data found in MongoDB"}), 404
        
        # Preprocess and re-train every time based on new data
        predictor.train_models()  # retrain on latest data
        predictor.save_model(MODEL_PATH)
        
        # Clear old predictions when retraining
        cleared_count = clear_old_predictions()
        
        # Get comprehensive item analysis (no individual prediction needed)
        prediction = predictor.predict({})
        
        # Save predictions to database
        prediction_id = save_predictions_to_database(prediction, "auto")
        
        # Save item analysis to separate collection
        items_saved = save_item_analysis_to_database(prediction["items_analysis"])
        
        # Add database storage info to response
        prediction["database_info"] = {
            "prediction_id": prediction_id,
            "items_saved": items_saved,
            "old_predictions_cleared": cleared_count,
            "saved_at": datetime.now().isoformat()
        }
        
        return jsonify(prediction)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/predict-item", methods=["POST"])
def predict_item():
    """Predict for a specific item with complete analysis"""
    try:
        # Get request data
        input_data = request.get_json()
        
        if not input_data:
            return jsonify({"error": "No input data provided"}), 400
        
        # Always fetch the latest data and retrain
        df = predictor.get_primary_data()
        
        if df.empty:
            return jsonify({"error": "No data found in MongoDB"}), 404
        
        # Retrain model with latest data
        predictor.train_models()
        predictor.save_model(MODEL_PATH)
        
        # Clear old predictions when retraining
        cleared_count = clear_old_predictions()
        
        # Get prediction with item analysis
        prediction = predictor.predict(input_data)
        
        # Save predictions to database
        prediction_id = save_predictions_to_database(prediction, "item_specific")
        
        # Save item analysis to separate collection
        items_saved = save_item_analysis_to_database(prediction["items_analysis"])
        
        # Add database storage info to response
        prediction["database_info"] = {
            "prediction_id": prediction_id,
            "items_saved": items_saved,
            "old_predictions_cleared": cleared_count,
            "saved_at": datetime.now().isoformat(),
            "input_data": input_data
        }
        
        return jsonify(prediction)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/items-analysis", methods=["GET"])
def items_analysis():
    """Get detailed analysis of all items without individual prediction"""
    try:
        # Always fetch the latest data
        df = predictor.get_primary_data()
        
        if df.empty:
            return jsonify({"error": "No data found in MongoDB"}), 404
        
        # Retrain model with latest data
        predictor.train_models()
        predictor.save_model(MODEL_PATH)
        
        # Clear old predictions when retraining
        cleared_count = clear_old_predictions()
        
        # Get only item statistics
        item_stats = predictor.calculate_item_statistics()
        
        # Save item analysis to database
        items_saved = save_item_analysis_to_database(item_stats)
        
        # Format response
        total_items = len(item_stats)
        increasing_items = len([item for item in item_stats.values() if item["demand_trend"] == "Increasing"])
        decreasing_items = len([item for item in item_stats.values() if item["demand_trend"] == "Decreasing"])
        stable_items = len([item for item in item_stats.values() if item["demand_trend"] == "Stable"])
        
        response = {
            "items_analysis": item_stats,
            "summary": {
                "total_items_analyzed": total_items,
                "items_with_increasing_demand": increasing_items,
                "items_with_decreasing_demand": decreasing_items,
                "items_with_stable_demand": stable_items,
                "increasing_demand_percentage": round((increasing_items / total_items * 100), 2) if total_items > 0 else 0,
                "decreasing_demand_percentage": round((decreasing_items / total_items * 100), 2) if total_items > 0 else 0,
                "stable_demand_percentage": round((stable_items / total_items * 100), 2) if total_items > 0 else 0
            },
            "lastUpdated": predictor.last_update.isoformat() if predictor.last_update else None,
            "status": "success",
            "modelInfo": {
                "features_used": len(predictor.feature_columns) if predictor.feature_columns else 0,
                "target_price_column": predictor.target_price_column,
                "target_demand_column": predictor.target_demand_column,
                "item_identifier_column": predictor.item_identifier_column
            },
            "database_info": {
                "items_saved": items_saved,
                "old_predictions_cleared": cleared_count,
                "saved_at": datetime.now().isoformat()
            }
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/item-details/<item_name>", methods=["GET"])
def item_details(item_name):
    """Get detailed analysis for a specific item"""
    try:
        # Always fetch the latest data
        df = predictor.get_primary_data()
        
        if df.empty:
            return jsonify({"error": "No data found in MongoDB"}), 404
        
        # Retrain model with latest data
        predictor.train_models()
        predictor.save_model(MODEL_PATH)
        
        # Get item statistics
        item_stats = predictor.calculate_item_statistics()
        
        # Find the specific item
        item_info = None
        for item_key, item_data in item_stats.items():
            if item_key.lower() == item_name.lower():
                item_info = item_data
                break
        
        if not item_info:
            return jsonify({"error": f"Item '{item_name}' not found in database"}), 404
        
        response = {
            "item_name": item_name,
            "item_details": item_info,
            "lastUpdated": predictor.last_update.isoformat() if predictor.last_update else None,
            "status": "success"
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/retrain", methods=["POST"])
def manual_retrain():
    """Manually retrain the model"""
    try:
        # Force retrain
        metrics = predictor.train_models(retrain=True)
        predictor.save_model(MODEL_PATH)
        
        # Clear old predictions when retraining
        cleared_count = clear_old_predictions()
        
        # Get fresh item analysis
        item_stats = predictor.calculate_item_statistics()
        
        # Save new item analysis
        items_saved = save_item_analysis_to_database(item_stats)
        
        # Create comprehensive prediction data
        prediction_data = {
            "items_analysis": item_stats,
            "summary": {
                "total_items_analyzed": len(item_stats),
                "items_with_increasing_demand": len([item for item in item_stats.values() if item["demand_trend"] == "Increasing"]),
                "items_with_decreasing_demand": len([item for item in item_stats.values() if item["demand_trend"] == "Decreasing"]),
                "items_with_stable_demand": len([item for item in item_stats.values() if item["demand_trend"] == "Stable"])
            },
            "lastUpdated": datetime.now().isoformat(),
            "status": "success",
            "modelInfo": {
                "features_used": len(predictor.feature_columns) if predictor.feature_columns else 0,
                "target_price_column": predictor.target_price_column,
                "target_demand_column": predictor.target_demand_column,
                "item_identifier_column": predictor.item_identifier_column
            }
        }
        
        # Save retrain predictions
        prediction_id = save_predictions_to_database(prediction_data, "manual_retrain")
        
        return jsonify({
            "message": "Model retrained successfully",
            "metrics": metrics,
            "status": "success",
            "database_info": {
                "prediction_id": prediction_id,
                "items_saved": items_saved,
                "old_predictions_cleared": cleared_count,
                "retrained_at": datetime.now().isoformat()
            }
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/prediction-history", methods=["GET"])
def prediction_history():
    """Get recent prediction history from database"""
    try:
        # Get limit from query parameter
        limit = request.args.get('limit', 10, type=int)
        limit = max(1, min(limit, 100))  # Ensure limit is between 1 and 100
        
        history = get_prediction_history(limit)
        
        return jsonify({
            "prediction_history": history,
            "count": len(history),
            "status": "success"
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/database-collections", methods=["GET"])
def database_collections():
    """Get information about database collections"""
    try:
        if not predictor.client:
            predictor.connect_to_database()
        
        collections = predictor.db.list_collection_names()
        collection_info = {}
        
        for collection_name in collections:
            collection = predictor.db[collection_name]
            count = collection.count_documents({})
            
            # Get sample document to show structure
            sample = collection.find_one({}, {"_id": 0})
            
            collection_info[collection_name] = {
                "document_count": count,
                "sample_fields": list(sample.keys()) if sample else []
            }
        
        return jsonify({
            "collections": collection_info,
            "total_collections": len(collections),
            "status": "success"
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/", methods=["GET"])
def home():
    """API documentation"""
    return jsonify({
        "message": "Welcome to AgriLink Price-Demand Predictor API",
        "description": "This API provides agricultural price and demand analysis with item-specific insights and database storage",
        "endpoints": {
            "/predict-auto": "GET - Auto prediction with complete item analysis",
            "/predict-item": "POST - Predict for specific item with complete analysis",
            "/items-analysis": "GET - Get detailed analysis of all items",
            "/item-details/<item_name>": "GET - Get detailed analysis for specific item",
            "/retrain": "POST - Manually retrain the model",
            "/prediction-history": "GET - Get recent prediction history from database",
            "/database-collections": "GET - Get information about database collections"
        },
        "features": [
            "Average price calculation per item",
            "Demand trend analysis (Increasing/Decreasing/Stable)",
            "Percentage change in demand",
            "Historical data analysis",
            "Auto-retraining with latest data",
            "Database storage of predictions",
            "Prediction history tracking",
            "Item analysis persistence"
        ],
        "new_collections": {
            "ml_predictions": "Stores all prediction results with timestamps",
            "item_analysis": "Stores detailed item analysis data"
        }
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)