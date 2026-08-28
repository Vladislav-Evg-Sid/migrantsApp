@echo off
setlocal
chcp 65001 >nul
title Backup migrants_db

echo Creating database backup...
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0..\backup-db.ps1" -OutputPath "%~dp0migrants_db.dump"
if errorlevel 1 (
    echo.
    echo ERROR: backup was not created.
    if not defined NO_PAUSE pause
    exit /b 1
)

echo.
echo DONE: migrants_db.dump was created next to this script.
echo Copy it to the scripts\restore folder on the other computer.
if not defined NO_PAUSE pause
