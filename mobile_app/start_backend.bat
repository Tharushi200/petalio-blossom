@echo off
title Petalio Blossom Node.js Backend Server
echo ========================================================
echo  🌸 Petalio Blossom REST API Server (Node.js + MySQL)
echo  Database: petalio_blossom
echo  Local API: http://localhost:5000/api
echo ========================================================
cd /d "%~dp0backend"
node server.js
pause

