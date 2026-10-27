@echo off
setlocal
cd /d "%~dp0"

echo ==============================================================================
echo    Absence App - UPF GI4 (Amine NAHLI et Aya BOUHSINI)
echo ==============================================================================
echo.
echo [*] Demarrage des deux services...
echo.

REM 1. Lancement du Backend Spring Boot
echo [1/2] Lancement du Backend Spring Boot sur le port 8080...
start "Backend Spring Boot" cmd /k "cd /d "%~dp0backend" && if exist mvnw.cmd (mvnw.cmd spring-boot:run) else (mvn spring-boot:run)"

REM 2. Lancement du Frontend Expo
echo [2/2] Lancement du Frontend Expo Mobile (Metro Bundler)...
start "Frontend Expo" cmd /k "cd /d "%~dp0frontend" && npm start"

echo.
echo ==============================================================================
echo   Deux fenetres ont ete ouvertes :
echo   - Fenetre 1 : Backend Spring Boot (connecte a Neon PostgreSQL)
echo   - Fenetre 2 : Frontend Expo Mobile (Scannez le QR Code avec Expo Go)
echo.
echo   Astuce : Tapez 'w' dans la fenetre Frontend pour ouvrir dans le navigateur.
echo ==============================================================================
echo.
pause
