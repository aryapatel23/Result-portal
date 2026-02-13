const cron = require('node-cron');
const User = require('../models/User');
const TeacherAttendance = require('../models/TeacherAttendance');
const { sendAttendanceAlert } = require('../utils/emailService');

// Initialize Cron Job
const initAttendanceCron = () => {
    // Run every day at 23:59 Asia/Kolkata time
    cron.schedule('59 23 * * *', async () => {
        console.log('🤖 Cron Job: Starting automated attendance check...');

        try {
            // 1. Get Today's Date in IST
            const now = new Date();
            const istDateString = now.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' });
            const istDate = new Date(istDateString);

            const day = istDate.getDate();
            const monthStr = `${String(istDate.getMonth() + 1).padStart(2, '0')}-${istDate.getFullYear()}`;
            const year = istDate.getFullYear();

            // 2. Get all teachers
            const teachers = await User.find({ role: 'teacher' });

            // 3. Process each teacher
            let markedCount = 0;

            for (const teacher of teachers) {
                // Find monthly doc
                let doc = await TeacherAttendance.findOne({ teacher: teacher._id, month: monthStr });

                // If no doc exists at all, creates one
                if (!doc) {
                    doc = new TeacherAttendance({
                        teacher: teacher._id,
                        month: monthStr,
                        year: year,
                        records: [],
                        stats: { present: 0, absent: 0, leaves: 0, halfDay: 0, late: 0 }
                    });
                }

                // Check if today is marked
                const isMarked = doc.records.some(r => r.day === day);

                if (!isMarked) {
                    // Mark as Absent
                    const absentRecord = {
                        date: istDate,
                        day: day,
                        status: 'Absent',
                        checkInTime: null,
                        location: { latitude: 0, longitude: 0, address: 'Auto-marked by System' },
                        remarks: 'System: Auto-marked as Absent (No record found by EOD)',
                        markedBy: 'admin'
                    };

                    doc.records.push(absentRecord);
                    doc.stats.absent++;
                    markedCount++;

                    await doc.save();

                    // Send Email Alert
                    if (teacher.email) {
                        await sendAttendanceAlert({
                            email: teacher.email,
                            name: teacher.name,
                            date: istDate,
                            status: 'Absent'
                        });
                    }
                }
            }

            console.log(`✅ Cron Job: Auto-marked ${markedCount} teachers as Absent.`);

        } catch (error) {
            console.error('❌ Cron Job Error:', error);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });

    console.log('⏰ Attendance Cron Job scheduled for 23:59 IST daily.');
};

module.exports = initAttendanceCron;
