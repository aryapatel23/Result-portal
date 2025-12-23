// EXAMPLE: Quick test to assign Rajesh as class teacher of STD 9
// Run this directly to test the system immediately

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

const quickTest = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Update Rajesh Kumar to be class teacher of STD 9
    const rajesh = await User.findOne({ email: 'rajesh.kumar@school.com', role: 'teacher' });
    
    if (rajesh) {
      rajesh.classTeacher = 'STD 9';
      rajesh.assignedClasses = ['STD 9', 'STD 10', 'STD 11'];
      rajesh.subjects = ['Mathematics', 'Physics'];
      await rajesh.save();
      
      console.log('\n✅ Updated Rajesh Kumar:');
      console.log('   Class Teacher: STD 9');
      console.log('   Also teaches in: STD 9, STD 10, STD 11');
      console.log('   Subjects: Mathematics, Physics');
      console.log('\n🎉 Rajesh can now upload results for STD 9 students!');
      console.log('\n📝 Next steps:');
      console.log('   1. Login as: rajesh.kumar@school.com / teacher123');
      console.log('   2. Go to Upload Result');
      console.log('   3. You should only see "STD 9" in the dropdown');
      console.log('   4. Upload a result - it should work!');
    } else {
      console.log('⚠️ Rajesh Kumar not found in database');
      console.log('   Make sure the teacher account exists with email: rajesh.kumar@school.com');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

quickTest();
