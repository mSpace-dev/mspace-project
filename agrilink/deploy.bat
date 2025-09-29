@echo off
echo 🚀 Starting AgriLink deployment...

echo Choose deployment method:
echo 1) Vercel (Recommended)
echo 2) Railway
echo 3) Run pre-deployment checks only
echo.

set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" goto vercel
if "%choice%"=="2" goto railway
if "%choice%"=="3" goto checks
echo ❌ Invalid choice!
goto end

:vercel
echo 📦 Deploying to Vercel...

REM Check if vercel CLI is installed
vercel --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Vercel CLI is not installed. Please install it first:
    echo npm i -g vercel
    goto end
)

REM Build the project
echo 🔨 Building project...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed! Please fix the errors and try again.
    goto end
)

echo ✅ Build successful!
echo 🚀 Deploying to Vercel...
call vercel --prod
if errorlevel 1 (
    echo ❌ Deployment failed!
    goto end
)

echo 🎉 Deployment successful!
goto end

:railway
echo 🚂 Deploying to Railway...

REM Check if railway CLI is installed
railway --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Railway CLI is not installed. Please install it first:
    echo npm i -g @railway/cli
    goto end
)

call railway up
if errorlevel 1 (
    echo ❌ Railway deployment failed!
    goto end
)

echo 🎉 Railway deployment successful!
goto end

:checks
echo 🔍 Running pre-deployment checks...

REM Check if .env file exists
if exist .env (
    echo ✅ .env file found
) else (
    echo ⚠️  .env file not found. You may need to set up environment variables in your deployment platform.
)

REM Check if build works
echo 🔨 Testing build...
call npm run build
if errorlevel 1 (
    echo ❌ Build test failed!
    goto end
)

echo ✅ Build test successful!

REM Check dependencies
echo 📦 Checking dependencies...
call npm audit --audit-level moderate

echo ✅ Pre-deployment checks completed!
goto end

:end
pause
