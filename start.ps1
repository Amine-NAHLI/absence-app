# Script de lancement global pour PowerShell
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "   🎓 ABSENCE APP — Université Privée de Fès (UPF) - GI4" -ForegroundColor Cyan
Write-Host "   Amine NAHLI & Aya BOUHSINI" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Lancement du Backend
Write-Host "[1/2] Lancement du Backend Spring Boot (Port 8080)..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k", "cd /d `"$rootDir\backend`" && mvn spring-boot:run"

Start-Sleep -Seconds 2

# 2. Lancement du Frontend Expo
Write-Host "[2/2] Lancement du Frontend Expo Mobile (Metro Bundler)..." -ForegroundColor Green
Start-Process cmd.exe -ArgumentList "/k", "cd /d `"$rootDir\frontend`" && npm start"

Write-Host ""
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "  ✅ Les 2 fenêtres ont été lancées !" -ForegroundColor Green
Write-Host "  - Fenêtre 1 : Backend Spring Boot (connecté à Neon)" -ForegroundColor White
Write-Host "  - Fenêtre 2 : Frontend Expo (Scannez le QR Code avec Expo Go)" -ForegroundColor White
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""
