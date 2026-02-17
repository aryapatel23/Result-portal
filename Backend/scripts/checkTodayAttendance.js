const mongoose = require('mongoose');
require('dotenv').config();
const TeacherAttendance = require('../models/TeacherAttendance');
const User = require('../models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log('Connected to database\n');
    
    // Get current IST date
    const now = new Date();
    const istDateString = now.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' });
    const istDate = new Date(istDateString);
    const day = istDate.getDate();
    const monthStr = `${String(istDate.getMonth() + 1).padStart(2, '0')}-${istDate.getFullYear()}`;
    const year = istDate.getFullYear();
    
    console.log('Current IST Date:', istDate.toDateString());
    console.log('Day:', day);
    console.log('Month:', monthStr);
    console.log('Year:', year);
    
    // Get all active teachers
    const teachers = await User.find({ role: 'teacher', isActive: { $ne: false } });
    console.log(`\n📊 Total Active Teachers: ${teachers.length}\n`);
    
    // Check attendance for each teacher
    for (const teacher of teachers) {
        const doc = await TeacherAttendance.findOne({ 
            teacher: teacher._id, 
            month: monthStr 
        });
        
        console.log(`👤 ${teacher.name} (${teacher.employeeId})`);
        
        if (!doc) {
            console.log('   ❌ No attendance document for this month');
        } else {
            const todayRecord = doc.records.find(r => r.day === day);
            if (todayRecord) {
                console.log(`   ✅ Today (${day}): ${todayRecord.status}`);
                console.log(`       Auto-marked: ${todayRecord.autoMarked ? 'Yes' : 'No'}`);
                if (todayRecord.clockIn) {
                    console.log(`       Clock In: ${todayRecord.clockIn}`);
                }
            } else {
                console.log(`   ⚠️  Today (${day}): NOT MARKED`);
            }
        }
        console.log('');
    }
    
    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
