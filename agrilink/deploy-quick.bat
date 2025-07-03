@echo off
REM Quick deployment script for AgriLink (Windows)

echo 🚀 Starting AgriLink Deployment...

REM Check if environment variables are set
if "%MONGODB_URI%"=="" (
    echo ❌ Error: MONGODB_URI environment variable is not set
    echo Please set your MongoDB connection string:
    echo set MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/Agrilink
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Build the application
echo 🔨 Building application...
npm run build

REM Start the application
echo ✅ Starting application...
npm start

echo 🎉 Deployment complete! Visit http://localhost:3000
pause
