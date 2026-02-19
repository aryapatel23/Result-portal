#!/usr/bin/env node

/**
 * Cron Job Verification Script
 * Run this after deployment to verify cron jobs are working
 */

const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:5000';

console.log('\n🔍 Verifying Cron Job Configuration...\n');
console.log(`Testing server: ${BASE_URL}\n`);

async function verifyCronJobs() {
    try {
        // 1. Check server health
        console.log('1️⃣  Checking server health...');
        const healthResponse = await axios.get(`${BASE_URL}/api/health/ping`);
        if (healthResponse.data === 'pong') {
            console.log('   ✅ Server is reachable\n');
        }

        // 2. Check cron status
        console.log('2️⃣  Checking cron job status...');
        const cronResponse = await axios.get(`${BASE_URL}/api/health/cron-status`);
        const cronData = cronResponse.data;
        
        console.log(`   ✅ Cron jobs configured`);
        console.log(`   📅 Server Time (IST): ${cronData.serverTime.ist}`);
        console.log(`   🕐 Timezone: ${cronData.serverTime.timezone}`);
        console.log(`   ⏱️  Uptime: ${cronData.uptime}\n`);
        
        // 3. Display cron job details
        console.log('3️⃣  Cron Job Details:');
        console.log('\n   📚 Student Attendance:');
        console.log(`      Schedule: ${cronData.cronJobs.studentAttendance.schedule}`);
        console.log(`      Status: ${cronData.cronJobs.studentAttendance.enabled ? '✅ Enabled' : '❌ Disabled'}`);
        
        console.log('\n   👨‍🏫 Teacher Attendance:');
        console.log(`      Schedule: ${cronData.cronJobs.teacherAttendance.schedule}`);
        console.log(`      Status: ${cronData.cronJobs.teacherAttendance.enabled ? '✅ Enabled' : '❌ Disabled'}`);
        
        if (cronData.cronJobs.teacherAttendance.isRunning !== undefined) {
            console.log(`      Running: ${cronData.cronJobs.teacherAttendance.isRunning ? '✅ Yes' : '❌ No'}`);
            console.log(`      Last Run: ${cronData.cronJobs.teacherAttendance.lastRun}`);
            console.log(`      Next Run: ${cronData.cronJobs.teacherAttendance.nextScheduledRun}`);
        }
        
        // 4. Check troubleshooting info
        if (cronData.troubleshooting) {
            console.log('\n4️⃣  Troubleshooting Info:');
            if (cronData.troubleshooting.uptimeLessThan1Hour) {
                console.log('   ⚠️  ' + cronData.troubleshooting.message);
                console.log('   💡 Recommendation: Set up UptimeRobot to ping /api/health/ping every 10 minutes');
            } else {
                console.log('   ✅ ' + cronData.troubleshooting.message);
            }
        }
        
        console.log('\n✅ Verification Complete!\n');
        console.log('📝 Next Steps:');
        console.log('   1. Set up UptimeRobot to monitor: ' + BASE_URL + '/api/health/ping');
        console.log('   2. Add TZ=Asia/Kolkata to environment variables');
        console.log('   3. Monitor logs for cron execution messages\n');
        
    } catch (error) {
        console.error('\n❌ Verification Failed!\n');
        
        if (error.code === 'ECONNREFUSED') {
            console.error('   Server is not running or not reachable');
            console.error(`   Make sure server is running at: ${BASE_URL}`);
        } else if (error.response) {
            console.error(`   HTTP Error: ${error.response.status}`);
            console.error(`   Message: ${error.response.data?.message || 'Unknown error'}`);
        } else {
            console.error(`   Error: ${error.message}`);
        }
        
        console.log('\n📝 Troubleshooting:');
        console.log('   1. Check if server is running');
        console.log('   2. Verify API_URL environment variable');
        console.log('   3. Check network connectivity');
        console.log('   4. Review server logs for errors\n');
        
        process.exit(1);
    }
}

// Run verification
verifyCronJobs();
