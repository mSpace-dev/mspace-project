#!/bin/bash

# AgriLink Deployment Script
echo "🚀 Starting AgriLink deployment..."

# Check if required tools are installed
check_tool() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is not installed. Please install it first."
        exit 1
    fi
}

# Function to deploy to Vercel
deploy_vercel() {
    echo "📦 Deploying to Vercel..."
    
    # Check if vercel CLI is installed
    check_tool "vercel"
    
    # Build the project
    echo "🔨 Building project..."
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Build successful!"
        
        # Deploy to Vercel
        echo "🚀 Deploying to Vercel..."
        vercel --prod
        
        if [ $? -eq 0 ]; then
            echo "🎉 Deployment successful!"
        else
            echo "❌ Deployment failed!"
            exit 1
        fi
    else
        echo "❌ Build failed! Please fix the errors and try again."
        exit 1
    fi
}

# Function to deploy to Railway
deploy_railway() {
    echo "🚂 Deploying to Railway..."
    
    # Check if railway CLI is installed
    check_tool "railway"
    
    # Deploy to Railway
    railway up
    
    if [ $? -eq 0 ]; then
        echo "🎉 Railway deployment successful!"
    else
        echo "❌ Railway deployment failed!"
        exit 1
    fi
}

# Main menu
echo "Choose deployment method:"
echo "1) Vercel (Recommended)"
echo "2) Railway"
echo "3) Run pre-deployment checks only"
echo ""

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        deploy_vercel
        ;;
    2)
        deploy_railway
        ;;
    3)
        echo "🔍 Running pre-deployment checks..."
        
        # Check if .env file exists
        if [ -f .env ]; then
            echo "✅ .env file found"
        else
            echo "⚠️  .env file not found. You may need to set up environment variables in your deployment platform."
        fi
        
        # Check if build works
        echo "🔨 Testing build..."
        npm run build
        
        if [ $? -eq 0 ]; then
            echo "✅ Build test successful!"
        else
            echo "❌ Build test failed!"
        fi
        
        # Check dependencies
        echo "📦 Checking dependencies..."
        npm audit --audit-level moderate
        
        echo "✅ Pre-deployment checks completed!"
        ;;
    *)
        echo "❌ Invalid choice!"
        exit 1
        ;;
esac
