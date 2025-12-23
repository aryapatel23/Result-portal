// Script to update existing teachers with classTeacher field
// This assigns each teacher to be class teacher of one specific class

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

const updateTeachers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Example teacher assignments - UPDATE THESE BASED ON YOUR ACTUAL TEACHERS
    const teacherAssignments = [
      {
        email: 'rajesh.kumar@school.com',
        classTeacher: 'STD 9', // Rajesh is class teacher of STD 9
        assignedClasses: ['STD 9', 'STD 10', 'STD 11'], // Also teaches in these classes
        subjects: ['Mathematics', 'Physics']
      },
      {
        email: 'priya.sharma@school.com',
        classTeacher: 'STD 8',
        assignedClasses: ['STD 8', 'STD 9', 'STD 10'],
        subjects: ['English', 'Hindi']
      },
      {
        email: 'amit.patel@school.com',
        classTeacher: 'STD 10',
        assignedClasses: ['STD 10', 'STD 11', 'STD 12'],
        subjects: ['Chemistry', 'Biology']
      },
      // Add more teachers as needed
    ];

    for (const assignment of teacherAssignments) {
      const teacher = await User.findOne({ email: assignment.email, role: 'teacher' });
      
      if (teacher) {
        teacher.classTeacher = assignment.classTeacher;
        teacher.assignedClasses = assignment.assignedClasses;
        teacher.subjects = assignment.subjects;
        await teacher.save();
        console.log(`✅ Updated ${teacher.name} - Class Teacher of ${assignment.classTeacher}`);
      } else {
        console.log(`⚠️ Teacher not found: ${assignment.email}`);
      }
    }

    console.log('\n✅ All teachers updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating teachers:', error);
    process.exit(1);
  }
};

updateTeachers();
