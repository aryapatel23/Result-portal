const mongoose = require('mongoose');
require('dotenv').config();
const {autoMarkTeacherAttendance} = require('../cron/teacherAttendanceCron');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log('✅ Connected to database\n');
    
    console.log('🧪 Running Force Test...\n');
    const result = await autoMarkTeacherAttendance(true);
    
    console.log('\n📊 TEST RESULT:');
    console.log('═'.repeat(50));
    console.log(JSON.stringify(result, null, 2));
    console.log('═'.repeat(50));
    
    process.exit(0);
}).catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});
