const cron = require('node-cron');
const User = require('../models/User');
const TeacherAttendance = require('../models/TeacherAttendance');
const PublicHoliday = require('../models/PublicHoliday');
const { sendAttendanceAlert } = require('../utils/emailService');

// Core Logic: Auto-mark absent teachers as Leave
const autoMarkAbsentTeachers = async (forceRun = false) => {
    console.log('\n' + '🔄 '.repeat(30));
    console.log('🤖 AUTO-ATTENDANCE PROCESS STARTED');
    if (forceRun) {
        console.log('⚠️  FORCE MODE: Running even on weekends');
    }
    console.log('🔄 '.repeat(30));
    
    try {
        // 1. Get Today's Date in IST
        const now = new Date();
        const istDateString = now.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' });
        const istDate = new Date(istDateString);
        const dayOfWeek = istDate.getDay(); // 0 = Sunday, 6 = Saturday

        const day = istDate.getDate();
        const monthStr = `${String(istDate.getMonth() + 1).padStart(2, '0')}-${istDate.getFullYear()}`;
        const year = istDate.getFullYear();

        console.log(`📅 Date: ${istDateString}`);
        console.log(`📆 Day: ${day}, Month: ${monthStr}, Year: ${year}`);
        console.log(`🗓️  Day of Week: ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]}`);

        // Skip Sunday only (day 0) - School is open on Saturday
        if (!forceRun && dayOfWeek === 0) {
            console.log('⏭️  Skipping auto-attendance (Sunday - Weekly Holiday)');
            console.log('💡 TIP: School is open on Saturday. Use force=true to test on Sunday.');
            console.log('🔄 '.repeat(30) + '\n');
            return { success: true, message: 'Sunday - No attendance marking', markedCount: 0, skippedCount: 0, isWeekend: true };
        }

        // Check for public holidays
        console.log('🎉 Checking for public holidays...');
        const holidayCheck = await PublicHoliday.isHoliday(istDate);
        if (!forceRun && holidayCheck.isHoliday) {
            console.log(`🎊 PUBLIC HOLIDAY DETECTED: ${holidayCheck.holiday.name}`);
            console.log(`📝 Description: ${holidayCheck.holiday.description || 'N/A'}`);
            console.log(`🔁 Recurring: ${holidayCheck.holiday.isRecurring ? 'Yes (Annual)' : 'No'}`);
            console.log('⏭️  Skipping auto-attendance (Public Holiday)');
            console.log('💡 TIP: Use force=true parameter to test on holidays');
            console.log('🔄 '.repeat(30) + '\n');
            return { 
                success: true, 
                message: `Public Holiday - No attendance marking (${holidayCheck.holiday.name})`, 
                markedCount: 0, 
                skippedCount: 0, 
                isHoliday: true,
                holiday: holidayCheck.holiday
            };
        }
        console.log('✅ Not a public holiday - Proceeding with attendance check');

        // 2. Get all active teachers
        console.log('👥 Fetching active teachers...');
        const teachers = await User.find({ role: 'teacher', isActive: { $ne: false } });
        console.log(`✅ Found ${teachers.length} active teachers`);

        if (teachers.length === 0) {
            console.log('⚠️  No active teachers found in database');
            console.log('🔄 '.repeat(30) + '\n');
            return { success: true, message: 'No teachers to process', markedCount: 0 };
        }

        // 3. Process each teacher
        let markedCount = 0;
        let skippedCount = 0;
        const markedTeachers = [];

        console.log('\n📋 Processing teachers:');
        console.log('─'.repeat(60));

        for (const teacher of teachers) {
            console.log(`\n👤 Teacher: ${teacher.name} (${teacher.employeeId})`);
            
            // Find monthly doc
            let doc = await TeacherAttendance.findOne({ teacher: teacher._id, month: monthStr });

            // If no doc exists at all, create one
            if (!doc) {
                console.log('   📝 Creating new attendance document for this month');
                doc = new TeacherAttendance({
                    teacher: teacher._id,
                    month: monthStr,
                    year: year,
                    records: [],
                    stats: { present: 0, absent: 0, leaves: 0, halfDay: 0, late: 0 }
                });
            }

            // Check if today is already marked
            const isMarked = doc.records.some(r => r.day === day);

            if (!isMarked) {
                console.log('   ❌ NOT marked today - Marking as Leave');
                
                // Mark as Leave (Auto-marked)
                const leaveRecord = {
                    date: istDate,
                    day: day,
                    status: 'Leave',
                    checkInTime: null,
                    checkOutTime: null,
                    location: { latitude: 0, longitude: 0, address: 'System Auto-marked' },
                    remarks: 'Automatically marked as Leave - No attendance submitted',
                    markedBy: 'admin',
                    workingHours: 0
                };

                doc.records.push(leaveRecord);
                doc.stats.leaves = (doc.stats.leaves || 0) + 1;
                markedCount++;

                await doc.save();
                console.log('   ✅ Marked as Leave successfully');

                markedTeachers.push({
                    name: teacher.name,
                    employeeId: teacher.employeeId,
                    email: teacher.email
                });

                // Send Email Alert (non-blocking)
                if (teacher.email) {
                    console.log(`   📧 Sending email to: ${teacher.email}`);
                    sendAttendanceAlert({
                        email: teacher.email,
                        name: teacher.name,
                        date: istDate,
                        status: 'Leave'
                    }).catch(err => {
                        console.error(`   ❌ Email failed: ${err.message}`);
                    });
                } else {
                    console.log('   ⚠️  No email address - skipping notification');
                }
            } else {
                console.log('   ✅ Already marked today - skipping');
                skippedCount++;
            }
        }

        console.log('\n' + '─'.repeat(60));

        const result = {
            success: true,
            date: istDateString,
            totalTeachers: teachers.length,
            markedCount,
            skippedCount,
            markedTeachers
        };

        console.log('\n📊 SUMMARY:');
        console.log(`   Total Teachers: ${result.totalTeachers}`);
        console.log(`   Marked as Leave: ${result.markedCount}`);
        console.log(`   Already Marked: ${result.skippedCount}`);
        console.log('\n✅ AUTO-ATTENDANCE PROCESS COMPLETED');
        console.log('🔄 '.repeat(30) + '\n');

        return result;

    } catch (error) {
        console.error('\n❌ AUTO-ATTENDANCE ERROR:', error);
        console.error('Stack trace:', error.stack);
        console.log('🔄 '.repeat(30) + '\n');
        return { success: false, error: error.message };
    }
};

// Initialize Cron Job
const initAttendanceCron = () => {
    // Run every day at 8:00 PM (20:00) Asia/Kolkata time
    cron.schedule('0 20 * * *', async () => {
        console.log('🤖 Cron Job: Starting automated attendance check at 8:00 PM IST...');
        console.log('⏰ Current Time:', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        const result = await autoMarkAbsentTeachers();
        if (result.success) {
            console.log(`📋 Summary: ${result.markedCount} teachers auto-marked as Leave`);
        } else {
            console.error('❌ Cron failed:', result.error);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });

    console.log('\n' + '='.repeat(60));
    console.log('⏰ ATTENDANCE AUTO-MARK CRON JOB INITIALIZED');
    console.log('='.repeat(60));
    console.log('📅 Schedule: Daily at 8:00 PM IST (Asia/Kolkata)');
    console.log('📌 Action: Auto-mark absent teachers as Leave');
    console.log('🚫 Weekends: Automatically skipped (Sat/Sun)');
    console.log('✅ Status: ACTIVE AND RUNNING');
    console.log('🕐 Current IST Time:', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    console.log('💡 Test manually: POST /api/admin/attendance/auto-mark-leaves');
    console.log('='.repeat(60) + '\n');
};

module.exports = { initAttendanceCron, autoMarkAbsentTeachers };
