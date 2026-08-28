@echo off
setlocal
chcp 65001 >nul
title Migrants App - stop

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\stop-app.ps1"
if errorlevel 1 (
    echo.
    pause
)
