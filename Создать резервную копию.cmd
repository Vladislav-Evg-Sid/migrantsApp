@echo off
setlocal
chcp 65001 >nul
title Migrants App - backup

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\backup-app.ps1"
if errorlevel 1 (
    echo.
    pause
    exit /b 1
)
echo.
pause
