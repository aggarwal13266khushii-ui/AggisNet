@echo off
title AegisNet: Push to GitHub Helper
cls
echo ========================================================
echo  AegisNet GitHub Push Assistant
echo ========================================================
echo.
echo This script will help you push your local AegisNet code
echo to your GitHub repository.
echo.
set /p REPO_URL="Enter your GitHub Repository URL (e.g., https://github.com/username/repo-name.git): "

if "%REPO_URL%"=="" (
    echo.
    echo [ERROR] Repository URL cannot be empty.
    echo.
    pause
    exit /b
)

echo.
echo [INFO] Configuring remote origin repository...
:: Remove if remote exists, then add new remote
.\mingit\cmd\git.exe remote remove origin >nul 2>&1
.\mingit\cmd\git.exe remote add origin %REPO_URL%
.\mingit\cmd\git.exe branch -M main

echo.
echo [INFO] Pushing files to GitHub...
echo.
echo * Note: A secure Git Credential Manager login window
echo   should pop up. Please log in with your GitHub account
echo   or enter your Personal Access Token (PAT).
echo.

.\mingit\cmd\git.exe push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo  SUCCESS: AegisNet code has been pushed to GitHub!
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo  ERROR: Push failed. Please check your URL/credentials.
    echo ========================================================
)
echo.
pause
