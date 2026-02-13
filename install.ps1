# Quick Installation Script

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Teacher Attendance Face Verification" -ForegroundColor Cyan
Write-Host "Installation Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Install Backend Dependencies
Write-Host "📦 Installing Backend Dependencies..." -ForegroundColor Yellow
Set-Location Backend
npm install
Set-Location ..

# Install Frontend Dependencies
Write-Host ""
Write-Host "📦 Installing Frontend Dependencies..." -ForegroundColor Yellow
Set-Location Frontend
npm install
npm install face-api.js
Set-Location ..

# Download Face Detection Models
Write-Host ""
Write-Host "📥 Downloading Face Detection Models..." -ForegroundColor Yellow
if (Test-Path ".\download-models.bat") {
    .\download-models.bat
} else {
    Write-Host "⚠️  download-models.bat not found. Please download models manually." -ForegroundColor Red
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "✅ Installation Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Configure school location in Backend/controllers/teacherAttendanceController.js"
Write-Host "2. Start Backend:  cd Backend && npm start"
Write-Host "3. Start Frontend: cd Frontend && npm run dev"
Write-Host "4. Open browser: http://localhost:5173"
Write-Host ""
Write-Host "📖 Read FACE_VERIFICATION_README.md for complete guide"
Write-Host ""
