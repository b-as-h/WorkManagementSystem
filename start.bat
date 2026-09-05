@echo off
title 工作管理系统 - 一键启动

echo ========================================
echo   工作管理系统 - 一键启动
echo ========================================
echo.

REM 首次启动时自动安装依赖
if not exist "%~dp0server\node_modules" (
    echo [依赖] 首次运行，正在安装后端依赖...
    cd /d "%~dp0server"
    call npm install
)
if not exist "%~dp0node_modules" (
    echo [依赖] 首次运行，正在安装前端依赖...
    cd /d "%~dp0"
    call npm install
)

echo [1/2] 启动后端服务 (端口 3001)...
start "WMS-后端-3001" cmd /k "cd /d %~dp0server && npm start"

echo [2/2] 启动前端服务 (端口 5173)...
start "WMS-前端-5173" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo 等待服务启动后自动打开浏览器...
ping -n 7 127.0.0.1 >nul
start http://localhost:5173

echo.
echo ========================================
echo   启动完成！
echo   前端: http://localhost:5173
echo   后端: http://localhost:3001
echo   默认账号: admin / admin123
echo ========================================
echo   关闭服务请运行 stop.bat
echo ========================================
pause