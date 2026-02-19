/**
 * 🧪 TEST SCRIPT: Verify Cron Job Dynamic Scheduling
 * 
 * This script tests that the cron job properly updates
 * when admin changes the deadline time setting.
 */

const axios = require('axios');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:5000';
const ADMIN_EMAIL = 'admin@example.com'; // Update with your admin email
const ADMIN_PASSWORD = 'admin123'; // Update with your admin password

let authToken = '';

// Helper to format time nicely
const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
};

// Test 1: Login as Admin
async function loginAsAdmin() {
    console.log('\n🔐 Step 1: Logging in as Admin...');
    try {
        const response = await axios.post(`${API_URL}/api/auth/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            role: 'admin'
        });
        
        authToken = response.data.token;
        console.log('✅ Admin login successful');
        return true;
    } catch (error) {
        console.error('❌ Admin login failed:', error.response?.data?.message || error.message);
        return false;
    }
}

// Test 2: Get Current Settings
async function getCurrentSettings() {
    console.log('\n📖 Step 2: Getting current attendance settings...');
    try {
        const response = await axios.get(
            `${API_URL}/api/system-config/teacher-attendance-settings`,
            {
                headers: { Authorization: `Bearer ${authToken}` }
            }
        );
        
        const settings = response.data;
        console.log('✅ Current Settings:');
        console.log(`   • Enabled: ${settings.enabled}`);
        console.log(`   • Deadline Time: ${settings.deadlineTime}`);
        console.log(`   • Auto-Mark as Leave: ${settings.autoMarkAsLeave}`);
        console.log(`   • Exclude Weekends: ${settings.excludeWeekends}`);
        
        return settings;
    } catch (error) {
        console.error('❌ Failed to get settings:', error.response?.data?.message || error.message);
        return null;
    }
}

// Test 3: Check Cron Status
async function checkCronStatus(label = '') {
    console.log(`\n🔍 ${label}Checking cron job status...`);
    try {
        const response = await axios.get(`${API_URL}/api/health/cron-status`);
        
        const cronData = response.data;
        console.log('✅ Cron Status:');
        console.log(`   • Status: ${cronData.status}`);
        
        if (cronData.cronJobs?.teacherAttendanceCron) {
            const teacherCron = cronData.cronJobs.teacherAttendanceCron;
            console.log(`   • Schedule: ${teacherCron.schedule || 'N/A'}`);
            console.log(`   • Description: ${teacherCron.description || 'N/A'}`);
            console.log(`   • Configured: ${teacherCron.configured ? 'Yes' : 'No'}`);
            
            if (teacherCron.lastRun && teacherCron.lastRun !== 'Never') {
                console.log(`   • Last Run: ${formatTime(teacherCron.lastRun)}`);
            } else {
                console.log(`   • Last Run: Never`);
            }
            
            if (teacherCron.nextRun) {
                console.log(`   • Next Run: ${formatTime(teacherCron.nextRun)}`);
            }
            
            return teacherCron;
        }
        
        return null;
    } catch (error) {
        console.error('❌ Failed to check cron status:', error.message);
        return null;
    }
}

// Test 4: Update Deadline Time
async function updateDeadlineTime(newDeadlineTime) {
    console.log(`\n⚙️  Step 3: Updating deadline time to ${newDeadlineTime}...`);
    try {
        const response = await axios.put(
            `${API_URL}/api/system-config/teacher-attendance-settings`,
            {
                deadlineTime: newDeadlineTime
            },
            {
                headers: { Authorization: `Bearer ${authToken}` }
            }
        );
        
        console.log('✅ Settings updated successfully');
        console.log(`   • Cron Restarted: ${response.data.cronRestarted ? 'Yes' : 'No'}`);
        
        return response.data.settings;
    } catch (error) {
        console.error('❌ Failed to update settings:', error.response?.data?.message || error.message);
        return null;
    }
}

// Test 5: Trigger Test Run
async function triggerTestRun() {
    console.log('\n🧪 Step 4: Triggering test run (dry run)...');
    try {
        const response = await axios.post(
            `${API_URL}/api/system-config/test-teacher-attendance`,
            {},
            {
                headers: { Authorization: `Bearer ${authToken}` }
            }
        );
        
        const result = response.data;
        console.log('✅ Test execution completed');
        console.log(`   • Total Teachers: ${result.details?.totalTeachers || 0}`);
        console.log(`   • Would Mark: ${result.details?.markedCount || 0}`);
        console.log(`   • Already Marked: ${result.details?.alreadyMarkedCount || 0}`);
        
        return result;
    } catch (error) {
        console.error('❌ Test execution failed:', error.response?.data?.message || error.message);
        return null;
    }
}

// Main Test Flow
async function runTests() {
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║  🧪 TEACHER ATTENDANCE CRON - END-TO-END TEST  ║');
    console.log('╚═══════════════════════════════════════════════════════╝');
    console.log(`\n🌐 Testing against: ${API_URL}`);
    
    // Step 1: Login
    const loginSuccess = await loginAsAdmin();
    if (!loginSuccess) {
        console.log('\n❌ Test failed: Could not login as admin');
        process.exit(1);
    }
    
    // Step 2: Get current settings
    const originalSettings = await getCurrentSettings();
    if (!originalSettings) {
        console.log('\n❌ Test failed: Could not fetch settings');
        process.exit(1);
    }
    
    const originalDeadline = originalSettings.deadlineTime;
    
    // Step 3: Check cron before update
    await checkCronStatus('BEFORE UPDATE: ');
    
    // Step 4: Update to a new deadline time
    const newDeadlineTime = '17:30'; // Change to test time
    console.log(`\n📝 Will change deadline from ${originalDeadline} to ${newDeadlineTime}`);
    
    const updatedSettings = await updateDeadlineTime(newDeadlineTime);
    if (!updatedSettings) {
        console.log('\n❌ Test failed: Could not update settings');
        process.exit(1);
    }
    
    // Wait a moment for cron to restart
    console.log('\n⏳ Waiting 2 seconds for cron to restart...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 5: Check cron after update
    const cronAfterUpdate = await checkCronStatus('AFTER UPDATE: ');
    
    // Step 6: Verify the schedule changed
    console.log('\n📊 VERIFICATION:');
    if (cronAfterUpdate && cronAfterUpdate.schedule) {
        const expectedTime = '17:35'; // newDeadlineTime + 5 minutes
        if (cronAfterUpdate.schedule.includes(expectedTime)) {
            console.log(`✅ SUCCESS: Cron schedule updated correctly to ${expectedTime} IST`);
        } else {
            console.log(`❌ FAILED: Cron schedule is "${cronAfterUpdate.schedule}", expected to include "${expectedTime}"`);
        }
    }
    
    // Step 7: Test execution (dry run)
    await triggerTestRun();
    
    // Step 8: Restore original settings
    console.log(`\n🔄 Restoring original deadline time (${originalDeadline})...`);
    await updateDeadlineTime(originalDeadline);
    
    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║          ✅ END-TO-END TEST COMPLETED          ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');
}

// Run the tests
runTests().catch(error => {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
});
