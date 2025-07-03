#!/bin/bash
# Quick deployment script for AgriLink

echo "🚀 Starting AgriLink Deployment..."

# Check if environment variables are set
if [ -z "$MONGODB_URI" ]; then
    echo "❌ Error: MONGODB_URI environment variable is not set"
    echo "Please set your MongoDB connection string:"
    echo "export MONGODB_URI='mongodb+srv://username:password@cluster.mongodb.net/Agrilink'"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Start the application
echo "✅ Starting application..."
npm start

echo "🎉 Deployment complete! Visit http://localhost:3000"
