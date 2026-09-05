@echo off
title 工作管理系统 - 一键关闭

echo ========================================
echo   工作管理系统 - 一键关闭
echo ========================================
echo.

echo 正在关闭后端服务 (端口 3001)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001" ^| findstr "LISTENING"') do (
    taskkill /f /t /pid %%a >nul 2>&1
)

echo 正在关闭前端服务 (端口 5173)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do (
    taskkill /f /t /pid %%a >nul 2>&1
)

echo.
echo 已关闭所有服务。
pause