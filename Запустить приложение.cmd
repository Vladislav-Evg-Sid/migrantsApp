@echo off
setlocal
chcp 65001 >nul
title Migrants App - start

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-app.ps1"
if errorlevel 1 (
    echo.
    pause
)
