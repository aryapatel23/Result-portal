# Database Verification and Initialization Script
# Run this to check if the automation system is properly set up

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEACHER ATTENDANCE AUTOMATION SETUP" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000"
$adminToken = Read-Host "Enter your admin token (from localStorage after login)"

if ([string]::IsNullOrWhiteSpace($adminToken)) {
    Write-Host "❌ Error: Admin token is required`n" -ForegroundColor Red
    Write-Host "How to get your token:" -ForegroundColor Yellow
    Write-Host "1. Login to the web app as admin" -ForegroundColor Yellow
    Write-Host "2. Open browser DevTools (F12)" -ForegroundColor Yellow
    Write-Host "3. Go to Console tab" -ForegroundColor Yellow
    Write-Host "4. Type: localStorage.getItem('token')" -ForegroundColor Yellow
    Write-Host "5. Copy the token (without quotes)`n" -ForegroundColor Yellow
    exit
}

$headers = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}

# ==========================================
# STEP 1: Check Backend Server
# ==========================================
Write-Host "STEP 1: Checking backend server..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/system-config" -Method GET -Headers $headers -ErrorAction Stop
    Write-Host "✅ Backend server is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend server is NOT running or not accessible" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nPlease start the backend server first:" -ForegroundColor Yellow
    Write-Host "cd Backend" -ForegroundColor Yellow
    Write-Host "npm start`n" -ForegroundColor Yellow
    exit
}

# ==========================================
# STEP 2: Verify Database Configuration
# ==========================================
Write-Host "`nSTEP 2: Checking database configuration..." -ForegroundColor Yellow
try {
    $config = Invoke-RestMethod -Uri "$baseUrl/api/system-config" -Method GET -Headers $headers -ErrorAction Stop
    
    if ($config) {
        Write-Host "✅ Database configuration found!" -ForegroundColor Green
        Write-Host "`nCurrent Settings:" -ForegroundColor Cyan
        Write-Host "  📅 Academic Year: $($config.academicYear)" -ForegroundColor White
        Write-Host "  📋 Yearly Leave Limit: $($config.yearlyLeaveLimit) days" -ForegroundColor White
        
        if ($config.teacherAttendanceSettings) {
            Write-Host "`n  🤖 Automation Settings:" -ForegroundColor Cyan
            Write-Host "    • Enabled: $($config.teacherAttendanceSettings.enabled)" -ForegroundColor $(if ($config.teacherAttendanceSettings.enabled) { "Green" } else { "Red" })
            Write-Host "    • Deadline Time: $($config.teacherAttendanceSettings.deadlineTime)" -ForegroundColor White
            Write-Host "    • Half-Day Threshold: $($config.teacherAttendanceSettings.halfDayThreshold)" -ForegroundColor White
            Write-Host "    • Half-Day Feature: $($config.teacherAttendanceSettings.enableHalfDay)" -ForegroundColor White
            Write-Host "    • Auto-Mark Leave: $($config.teacherAttendanceSettings.autoMarkAsLeave)" -ForegroundColor White
            Write-Host "    • Exclude Sundays: $($config.teacherAttendanceSettings.excludeWeekends)" -ForegroundColor White
            Write-Host "    • Email Notifications: $($config.teacherAttendanceSettings.notifyTeachers)" -ForegroundColor White
        } else {
            Write-Host "  ⚠️  Attendance automation settings not found" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  Configuration is empty (this should auto-create on first access)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error fetching configuration" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# ==========================================
# STEP 3: Test Automation (Optional)
# ==========================================
Write-Host "`nSTEP 3: Test automation now? (This will mark absent teachers)" -ForegroundColor Yellow
$test = Read-Host "Run test? (y/n)"

if ($test -eq 'y' -or $test -eq 'Y') {
    Write-Host "`nRunning automation test..." -ForegroundColor Yellow
    try {
        $testResult = Invoke-RestMethod -Uri "$baseUrl/api/system-config/test-teacher-attendance" -Method POST -Headers $headers -ErrorAction Stop
        Write-Host "✅ Test completed!" -ForegroundColor Green
        Write-Host "`nResults:" -ForegroundColor Cyan
        Write-Host $($testResult | ConvertTo-Json -Depth 10) -ForegroundColor White
    } catch {
        Write-Host "❌ Test failed" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "Skipping test. You can run it later from the web UI." -ForegroundColor Gray
}

# ==========================================
# STEP 4: Verify Attendance Settings Endpoint
# ==========================================
Write-Host "`nSTEP 4: Checking attendance settings endpoint..." -ForegroundColor Yellow
try {
    $attendanceSettings = Invoke-RestMethod -Uri "$baseUrl/api/system-config/teacher-attendance-settings" -Method GET -Headers $headers -ErrorAction Stop
    Write-Host "✅ Attendance settings endpoint working" -ForegroundColor Green
    Write-Host $($attendanceSettings | ConvertTo-Json -Depth 10) -ForegroundColor White
} catch {
    Write-Host "❌ Attendance settings endpoint failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# ==========================================
# SUMMARY
# ==========================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  SETUP VERIFICATION COMPLETE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "✅ Checklist:" -ForegroundColor Green
Write-Host "  [✓] Backend server running" -ForegroundColor Green
Write-Host "  [✓] Database configuration exists" -ForegroundColor Green
if ($config.teacherAttendanceSettings.enabled) {
    Write-Host "  [✓] Automation is ENABLED" -ForegroundColor Green
} else {
    Write-Host "  [✗] Automation is DISABLED (enable it in the web UI)" -ForegroundColor Yellow
}

Write-Host "`n📚 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Access web app and login as admin" -ForegroundColor White
Write-Host "  2. Go to 'Teacher Attendance' page" -ForegroundColor White
Write-Host "  3. Click 'Automation Settings' button" -ForegroundColor White
Write-Host "  4. Verify/adjust settings" -ForegroundColor White
Write-Host "  5. Click 'Save Settings'" -ForegroundColor White
Write-Host "  6. Click 'Test Now' to verify" -ForegroundColor White

Write-Host "`n⏰ Automation will run daily at: 6:05 PM IST" -ForegroundColor Cyan
Write-Host "📄 Full documentation: AUTOMATION_WORKFLOW.md`n" -ForegroundColor Cyan
