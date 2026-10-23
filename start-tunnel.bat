@echo off
setlocal
cd /d "%~dp0"

echo ==============================================================================
echo    Absence App - Mode TUNNEL (Bypass Pare-feu et Wi-Fi)
echo ==============================================================================
echo.
echo [*] Demarrage du Backend et du Frontend en mode TUNNEL...
echo.

REM 1. Lancement du Backend
start "Backend Spring Boot" cmd /k "cd /d "%~dp0backend" && mvn spring-boot:run"

REM 2. Lancement du Frontend avec Tunnel
start "Frontend Expo (Tunnel)" cmd /k "cd /d "%~dp0frontend" && npx expo start --tunnel"

echo.
echo ==============================================================================
echo   Le mode TUNNEL permet a votre telephone de se connecter meme si :
echo   - Votre pare-feu Windows bloque le port 8081
echo   - Votre telephone est sur la 4G et le PC sur le Wi-Fi
echo   - Le Wi-Fi de l'universite isole les appareils
echo ==============================================================================
echo.
pause
