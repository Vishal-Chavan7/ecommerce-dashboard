@echo off
REM Dashboard Deployment Script for Vercel

echo ========================================
echo     Dashboard Vercel Deployment
echo ========================================
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Vercel CLI not found!
    echo Please install it first: npm install -g vercel
    echo.
    pause
    exit /b 1
)

echo [✓] Vercel CLI found
echo.

REM Navigate to dashboard directory
cd /d "c:\Users\visha\OneDrive\Desktop\Backend API\dashboard\file"

echo Current directory: %CD%
echo.

REM Display options
echo Choose deployment type:
echo [1] Development/Preview (vercel)
echo [2] Production (vercel --prod)
echo [3] Login to Vercel
echo [4] Check deployments
echo [5] Exit
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo.
    echo [INFO] Starting preview deployment...
    echo.
    vercel
) else if "%choice%"=="2" (
    echo.
    echo [INFO] Starting production deployment...
    echo.
    vercel --prod
) else if "%choice%"=="3" (
    echo.
    echo [INFO] Opening Vercel login...
    echo.
    vercel login
) else if "%choice%"=="4" (
    echo.
    echo [INFO] Listing deployments...
    echo.
    vercel list
) else if "%choice%"=="5" (
    echo.
    echo Exiting...
    exit /b 0
) else (
    echo.
    echo [ERROR] Invalid choice!
    pause
    exit /b 1
)

echo.
echo ========================================
echo      Deployment Complete!
echo ========================================
echo.
pause
