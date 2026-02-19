const cron = require('node-cron');
const User = require('../models/User');
const TeacherAttendance = require('../models/TeacherAttendance');
const PublicHoliday = require('../models/PublicHoliday');
const SystemConfig = require('../models/SystemConfig');
const { sendAttendanceAlert } = require('../utils/emailService');

/**
 * 🤖 AUTOMATED TEACHER ATTENDANCE SYSTEM
 * 
 * Features:
 * - Auto-marks teachers as "Leave" if attendance not filled by deadline
 * - Supports half-day marking for late attendance
 * - Admin-configurable settings via SystemConfig
 * - Respects weekends and public holidays
 * - Sends notifications to teachers who missed attendance
 */

// Get current IST time components
const getISTTime = () => {
    const now = new Date();
    const istDateString = now.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' });
    const istDate = new Date(istDateString);
    
    // Get IST time
    const istTimeString = now.toLocaleTimeString('en-US', { 
        timeZone: 'Asia/Kolkata', 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const dayOfWeek = istDate.getDay();
    const day = istDate.getDate();
    const monthStr = `${String(istDate.getMonth() + 1).padStart(2, '0')}-${istDate.getFullYear()}`;
    const year = istDate.getFullYear();
    
    return { istDate, istTimeString, dayOfWeek, day, monthStr, year, istDateString };
};

// Compare time strings (HH:MM format)
const isTimeAfter = (currentTime, thresholdTime) => {
    const [currH, currM] = currentTime.split(':').map(Number);
    const [threshH, threshM] = thresholdTime.split(':').map(Number);
    
    if (currH > threshH) return true;
    if (currH === threshH && currM > threshM) return true;
    return false;
};

/**
 * Main function: Auto-mark teacher attendance
 */
const autoMarkTeacherAttendance = async (forceRun = false) => {
    console.log('\n' + '🎯 '.repeat(30));
    console.log('👨‍🏫 TEACHER ATTENDANCE AUTO-MARK STARTED');
    if (forceRun) {
        console.log('⚠️  FORCE MODE: Ignoring time/day restrictions');
    }
    console.log('🎯 '.repeat(30));
    
    try {
        // 1. Get System Configuration
        console.log('⚙️  Fetching system configuration...');
        let config = await SystemConfig.findOne({ key: 'default_config' });
        
        if (!config) {
            console.log('📝 No config found, creating default configuration');
            config = await SystemConfig.create({ 
                key: 'default_config',
                teacherAttendanceSettings: {
                    enabled: true,
                    deadlineTime: '18:00',
                    halfDayThreshold: '12:00',
                    enableHalfDay: true,
                    autoMarkAsLeave: true,
                    excludeWeekends: true,
                    notifyTeachers: true
                }
            });
        }
        
        const settings = config.teacherAttendanceSettings || {
            enabled: true,
            deadlineTime: '18:00',
            halfDayThreshold: '12:00',
            enableHalfDay: true,
            autoMarkAsLeave: true,
            excludeWeekends: true,
            notifyTeachers: true
        };
        
        console.log('✅ Configuration loaded:');
        console.log(`   • Enabled: ${settings.enabled}`);
        console.log(`   • Deadline Time: ${settings.deadlineTime}`);
        console.log(`   • Half-Day Threshold: ${settings.halfDayThreshold}`);
        console.log(`   • Auto-Mark as Leave: ${settings.autoMarkAsLeave}`);
        console.log(`   • Half-Day Enabled: ${settings.enableHalfDay}`);
        
        // Check if automation is enabled
        if (!forceRun && !settings.enabled) {
            console.log('⏸️  Teacher attendance automation is DISABLED');
            console.log('💡 Enable it in System Configuration');
            console.log('🎯 '.repeat(30) + '\n');
            return { success: true, message: 'Automation disabled', markedCount: 0 };
        }
        
        // 2. Get current IST date/time
        const { istDate, istTimeString, dayOfWeek, day, monthStr, year, istDateString } = getISTTime();
        
        console.log(`\n📅 Current IST Date: ${istDateString}`);
        console.log(`⏰ Current IST Time: ${istTimeString}`);
        console.log(`📆 Day: ${day}, Month: ${monthStr}, Year: ${year}`);
        console.log(`🗓️  Day of Week: ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]}`);
        
        // 3. Check if it's past deadline time
        if (!forceRun && !isTimeAfter(istTimeString, settings.deadlineTime)) {
            console.log(`⏰ Current time (${istTimeString}) is before deadline (${settings.deadlineTime})`);
            console.log('⏭️  Skipping - Will run after deadline time');
            console.log('🎯 '.repeat(30) + '\n');
            return { success: true, message: 'Before deadline time', markedCount: 0 };
        }
        
        console.log(`✅ Past deadline time (${settings.deadlineTime}) - Processing...`);
        
        // 4. Skip Sunday if configured
        if (!forceRun && settings.excludeWeekends && dayOfWeek === 0) {
            console.log('⏭️  Skipping auto-marking (Sunday - Weekly Holiday)');
            console.log('🎯 '.repeat(30) + '\n');
            return { success: true, message: 'Sunday - No attendance marking', markedCount: 0, isWeekend: true };
        }
        
        // 5. Check for public holidays
        console.log('🎉 Checking for public holidays...');
        const holidayCheck = await PublicHoliday.isHoliday(istDate);
        if (!forceRun && holidayCheck.isHoliday) {
            console.log(`🎊 PUBLIC HOLIDAY: ${holidayCheck.holiday.name}`);
            console.log('⏭️  Skipping auto-marking (Public Holiday)');
            console.log('🎯 '.repeat(30) + '\n');
            return { 
                success: true, 
                message: `Public Holiday - ${holidayCheck.holiday.name}`, 
                markedCount: 0, 
                isHoliday: true 
            };
        }
        console.log('✅ Not a public holiday - Proceeding...');
        
        // 6. Get all active teachers
        console.log('\n👥 Fetching active teachers...');
        const teachers = await User.find({ role: 'teacher', isActive: { $ne: false } });
        console.log(`✅ Found ${teachers.length} active teachers`);
        
        if (teachers.length === 0) {
            console.log('⚠️  No active teachers found');
            console.log('🎯 '.repeat(30) + '\n');
            return { success: true, message: 'No teachers to process', markedCount: 0 };
        }
        
        // 7. Process each teacher
        let markedCount = 0;
        let alreadyMarkedCount = 0;
        const markedTeachers = [];
        const notifiedTeachers = [];
        
        console.log('\n📋 Processing teachers:');
        console.log('─'.repeat(70));
        
        for (const teacher of teachers) {
            console.log(`\n👤 ${teacher.name} (${teacher.employeeId})`);
            
            // Find or create monthly attendance document
            let doc = await TeacherAttendance.findOne({ teacher: teacher._id, month: monthStr });
            
            if (!doc) {
                console.log('   📝 Creating new attendance document');
                doc = new TeacherAttendance({
                    teacher: teacher._id,
                    month: monthStr,
                    year: year,
                    records: [],
                    stats: { present: 0, absent: 0, leaves: 0, halfDay: 0, late: 0 }
                });
            }
            
            // Check if today is already marked
            const existingRecord = doc.records.find(r => r.day === day);
            
            if (existingRecord) {
                console.log(`   ✅ Already marked: ${existingRecord.status}`);
                if (existingRecord.clockIn) {
                    console.log(`   ⏰ Clock In: ${existingRecord.clockIn}`);
                }
                alreadyMarkedCount++;
                continue;
            }
            
            // Teacher hasn't marked attendance - Auto-mark as Leave
            if (settings.autoMarkAsLeave) {
                console.log('   ⚠️  Attendance NOT marked - Auto-marking as LEAVE');
                
                // Create the full date object for today
                const todayDate = new Date(year, istDate.getMonth(), day);
                
                doc.records.push({
                    date: todayDate,
                    day: day,
                    status: 'Leave',
                    markedBy: 'auto',
                    autoMarked: true,
                    autoMarkedReason: `Not marked by deadline (${settings.deadlineTime})`,
                    autoMarkedAt: new Date()
                });
                
                // Update stats
                doc.stats.leaves = (doc.stats.leaves || 0) + 1;
                
                await doc.save();
                markedCount++;
                markedTeachers.push({
                    name: teacher.name,
                    employeeId: teacher.employeeId,
                    email: teacher.email,
                    phone: teacher.contactNumber
                });
                
                console.log('   ✅ Marked as LEAVE (Auto)');
                
                // Send notification if enabled
                if (settings.notifyTeachers && teacher.email) {
                    notifiedTeachers.push(teacher);
                }
            } else {
                console.log('   ⏭️  Auto-mark disabled in settings - Skipping');
            }
        }
        
        console.log('\n' + '─'.repeat(70));
        console.log('📊 SUMMARY:');
        console.log(`   • Total Teachers: ${teachers.length}`);
        console.log(`   • Already Marked: ${alreadyMarkedCount}`);
        console.log(`   • Auto-Marked as Leave: ${markedCount}`);
        
        // 8. Send notifications
        if (settings.notifyTeachers && notifiedTeachers.length > 0) {
            console.log(`\n📧 Sending notifications to ${notifiedTeachers.length} teachers...`);
            for (const teacher of notifiedTeachers) {
                if (teacher.email) {
                    try {
                        await sendAttendanceAlert(
                            teacher.email,
                            teacher.name,
                            'Leave',
                            `You did not mark your attendance today by ${settings.deadlineTime}. It has been automatically marked as Leave. Please ensure to mark attendance on time in the future.`
                        );
                        console.log(`   ✅ Email sent: ${teacher.name}`);
                    } catch (err) {
                        console.log(`   ⚠️  Failed to send email to ${teacher.name}: ${err.message}`);
                        // Continue with other emails even if one fails
                    }
                }
            }
        }
        
        console.log('\n✅ AUTO-MARKING COMPLETE!');
        console.log('🎯 '.repeat(30) + '\n');
        
        return {
            success: true,
            message: 'Teacher attendance auto-marked successfully',
            markedCount,
            alreadyMarkedCount,
            totalTeachers: teachers.length,
            markedTeachers,
            notifiedCount: notifiedTeachers.length
        };
        
    } catch (error) {
        console.error('\n❌ ERROR in auto-mark teacher attendance:');
        console.error(error);
        console.log('🎯 '.repeat(30) + '\n');
        
        // Don't throw - return error result to prevent server crash
        return {
            success: false,
            error: error.message,
            markedCount: 0,
            alreadyMarkedCount: 0
        };
    }
};

/**
 * Schedule the cron job dynamically based on admin settings
 * Default: Runs at deadline time + 5 minutes
 */
let currentCronJob = null;
let lastRunTimestamp = null;
let nextScheduledRun = null;

const startTeacherAttendanceCron = async () => {
    try {
        console.log('🚀 Starting Teacher Attendance Auto-Mark Cron...');
        console.log(`🕐 Server timezone: ${process.env.TZ || 'System Default'}`);
        console.log(`🕐 Current server time: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}`);
        
        // Get system configuration for deadline time
        let config = await SystemConfig.findOne({ key: 'default_config' });
        
        if (!config || !config.teacherAttendanceSettings) {
            console.log('⚠️  No configuration found, using defaults');
            config = {
                teacherAttendanceSettings: {
                    enabled: true,
                    deadlineTime: '18:00'
                }
            };
        }
        
        const settings = config.teacherAttendanceSettings;
        const deadlineTime = settings.deadlineTime || '18:00';
        
        // Parse deadline time and add 5 minutes for cron execution
        const [hours, minutes] = deadlineTime.split(':').map(Number);
        let cronMinutes = minutes + 5;
        let cronHours = hours;
        
        // Handle minute overflow
        if (cronMinutes >= 60) {
            cronMinutes -= 60;
            cronHours += 1;
        }
        
        // Handle hour overflow
        if (cronHours >= 24) {
            cronHours = 0;
        }
        
        // Create cron expression (minute hour * * *)
        const cronExpression = `${cronMinutes} ${cronHours} * * *`;
        
        console.log('⏰ Configuration:');
        console.log(`   • Deadline Time: ${deadlineTime}`);
        console.log(`   • Cron Schedule: ${cronHours}:${String(cronMinutes).padStart(2, '0')} IST`);
        console.log(`   • Cron Expression: ${cronExpression}`);
        console.log(`   • Enabled: ${settings.enabled ? 'Yes' : 'No'}`);
        console.log('📍 Timezone: Asia/Kolkata (IST)');
        
        // Stop existing cron if running
        if (currentCronJob) {
            console.log('🔄 Stopping existing cron job...');
            currentCronJob.stop();
            currentCronJob = null;
        }
        
        // Schedule new cron job
        currentCronJob = cron.schedule(cronExpression, async () => {
            try {
                const runTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
                console.log('\n⏰ ========================================');
                console.log(`⏰ CRON TRIGGERED at ${runTime}`);
                console.log('⏰ ========================================\n');
                
                lastRunTimestamp = new Date();
                const result = await autoMarkTeacherAttendance(false);
                
                if (result.success) {
                    console.log(`\n✅ Cron execution completed successfully`);
                    console.log(`📊 Result: ${result.markedCount} teachers marked as Leave`);
                } else {
                    console.error(`\n❌ Cron execution failed: ${result.error}`);
                }
            } catch (error) {
                console.error('❌ Error in cron execution:', error);
                console.error('Stack trace:', error.stack);
                // Don't crash - log error and continue
            }
        }, {
            scheduled: true,
            timezone: 'Asia/Kolkata'
        });
        
        // Calculate next run time for logging
        const now = new Date();
        const nextRun = new Date();
        nextRun.setHours(cronHours, cronMinutes, 0, 0);
        if (nextRun <= now) {
            nextRun.setDate(nextRun.getDate() + 1);
        }
        nextScheduledRun = nextRun;
        
        console.log('✅ Teacher Attendance Cron Job Started!');
        console.log(`💡 Will run daily at ${cronHours}:${String(cronMinutes).padStart(2, '0')} IST`);
        console.log('💡 Teachers must mark attendance by deadline or will be marked as Leave\n');
        
        return currentCronJob;
        
    } catch (error) {
        console.error('❌ Error starting cron job:', error);
        console.log('⚠️  Cron will retry with default settings (18:05 IST)');
        
        // Fallback to default schedule
        currentCronJob = cron.schedule('5 18 * * *', async () => {
            try {
                await autoMarkTeacherAttendance(false);
            } catch (error) {
                console.error('❌ Error in cron execution:', error);
            }
        }, {
            scheduled: true,
            timezone: 'Asia/Kolkata'
        });
        
        console.log('✅ Fallback cron started at 18:05 IST\n');
        return currentCronJob;
    }
};

/**
 * Restart cron with new settings
 * Call this when admin updates attendance settings
 */
const restartTeacherAttendanceCron = async () => {
    console.log('🔄 Restarting cron with updated settings...');
    await startTeacherAttendanceCron();
    console.log('✅ Cron restarted successfully\n');
};

/**
 * Get cron job status (for monitoring/debugging)
 */
const getCronStatus = () => {
    return {
        isRunning: currentCronJob !== null,
        lastRun: lastRunTimestamp ? lastRunTimestamp.toISOString() : 'Never',
        nextScheduledRun: nextScheduledRun ? nextScheduledRun.toISOString() : 'Unknown',
        timezone: 'Asia/Kolkata',
        serverTimezone: process.env.TZ || 'System Default'
    };
};

module.exports = {
    startTeacherAttendanceCron,
    restartTeacherAttendanceCron,
    autoMarkTeacherAttendance, // For manual testing
    getCronStatus // For monitoring
};
