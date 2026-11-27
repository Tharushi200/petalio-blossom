@echo off
title Petalio Blossom - USB Port Forwarding
echo ========================================================
echo  🌸 Petalio Blossom - Android USB Reverse Port
echo  Forwarding Port 5000 from Phone to Laptop over USB...
echo ========================================================
"C:\AndroidSDK\platform-tools\adb.exe" reverse tcp:5000 tcp:5000
echo.
echo If your phone is connected with USB Debugging enabled,
echo port 5000 is now accessible directly at http://127.0.0.1:5000 !
echo.
pause

