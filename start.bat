@echo off
chcp 65001 > nul
title Absence App - Lanceur Global (UPF GI4)
color 0B

echo ==============================================================================
echo    🎓 ABSENCE APP — Université Privée de Fès (UPF) - GI4
echo    Amine NAHLI & Aya BOUHSINI
echo ==============================================================================
echo.
echo [*] Démarrage des deux services en parallèle...
echo.

:: 1. Lancement du Backend Spring Boot
echo [1/2] Démarrage du Backend Spring Boot (API REST + Neon PostgreSQL)...
start "Backend Spring Boot - Port 8080" cmd /k "cd /d "%~dp0backend" && title Backend Spring Boot [Port 8080] && mvn spring-boot:run"

:: Petite pause de 2 secondes
timeout /t 2 /nobreak > nul

:: 2. Lancement du Frontend Expo
echo [2/2] Démarrage du Frontend Expo Mobile (Metro Bundler + QR Code)...
start "Frontend Expo - Mobile App" cmd /k "cd /d "%~dp0frontend" && title Frontend Expo [Mobile App] && npm start"

echo.
echo ==============================================================================
echo  ✅ Les deux fenêtres ont été lancées avec succès :
echo.
echo   1. FENÊTRE 1 [BACKEND]  : http://localhost:8080/api (Neon Cloud)
echo   2. FENÊTRE 2 [FRONTEND] : Scannez le QR Code avec l'application Expo Go !
echo.
echo  💡 Astuce : Tapez 'w' dans la fenêtre Frontend pour ouvrir dans le navigateur.
echo ==============================================================================
echo.
pause
