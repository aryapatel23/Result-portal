const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Result = require('./models/Result');
const TeacherPerformance = require('./models/Teacher');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    console.log('🗑️  Clearing existing data...');
    
    // Clear existing data (optional - comment out if you want to keep existing data)
    // await User.deleteMany({ role: { $in: ['teacher', 'student'] } });
    // await Result.deleteMany({});
    // await TeacherPerformance.deleteMany({});

    console.log('👨‍🏫 Creating teacher accounts...');
    
    // Create teachers
    const teachers = [
      {
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@school.com',
        password: await bcrypt.hash('teacher123', 10),
        role: 'teacher',
        employeeId: 'EMP001',
        subjects: ['Mathematics', 'Physics'],
        assignedClasses: ['Grade 9', 'Grade 10'],
        phone: '9876543210',
        isActive: true
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@school.com',
        password: await bcrypt.hash('teacher123', 10),
        role: 'teacher',
        employeeId: 'EMP002',
        subjects: ['English', 'Hindi'],
        assignedClasses: ['Grade 8', 'Grade 9'],
        phone: '9876543211',
        isActive: true
      },
      {
        name: 'Amit Patel',
        email: 'amit.patel@school.com',
        password: await bcrypt.hash('teacher123', 10),
        role: 'teacher',
        employeeId: 'EMP003',
        subjects: ['Science', 'Chemistry'],
        assignedClasses: ['Grade 10', 'Grade 11'],
        phone: '9876543212',
        isActive: true
      }
    ];

    const createdTeachers = await User.insertMany(teachers);
    console.log(`✅ Created ${createdTeachers.length} teachers`);

    console.log('👨‍🎓 Creating student accounts...');
    
    // Create students
    const students = [
      {
        name: 'Aryan Shah',
        grNumber: 'GR001',
        dateOfBirth: new Date('2010-05-15'),
        standard: 'Grade 10',
        email: 'aryan@student.com',
        role: 'student',
        password: 'student123' // In real app, this should be hashed
      },
      {
        name: 'Diya Mehta',
        grNumber: 'GR002',
        dateOfBirth: new Date('2010-08-22'),
        standard: 'Grade 10',
        email: 'diya@student.com',
        role: 'student',
        password: 'student123'
      },
      {
        name: 'Rohan Desai',
        grNumber: 'GR003',
        dateOfBirth: new Date('2011-03-10'),
        standard: 'Grade 9',
        email: 'rohan@student.com',
        role: 'student',
        password: 'student123'
      },
      {
        name: 'Ananya Singh',
        grNumber: 'GR004',
        dateOfBirth: new Date('2011-07-18'),
        standard: 'Grade 9',
        email: 'ananya@student.com',
        role: 'student',
        password: 'student123'
      },
      {
        name: 'Kabir Joshi',
        grNumber: 'GR005',
        dateOfBirth: new Date('2012-01-25'),
        standard: 'Grade 8',
        email: 'kabir@student.com',
        role: 'student',
        password: 'student123'
      }
    ];

    const createdStudents = await User.insertMany(students);
    console.log(`✅ Created ${createdStudents.length} students`);

    console.log('📊 Creating sample results...');
    
    // Create sample results
    const results = [
      {
        studentName: 'Aryan Shah',
        grNumber: 'GR001',
        dateOfBirth: new Date('2010-05-15'),
        standard: 'Grade 10',
        term: 'Term-1',
        academicYear: '2024-25',
        subjects: [
          { name: 'Mathematics', marks: 85, maxMarks: 100 },
          { name: 'Physics', marks: 90, maxMarks: 100 },
          { name: 'Chemistry', marks: 82, maxMarks: 100 },
          { name: 'English', marks: 78, maxMarks: 100 },
          { name: 'Hindi', marks: 88, maxMarks: 100 }
        ],
        remarks: 'Excellent performance. Keep it up!',
        uploadedBy: createdTeachers[0]._id,
        uploadedByRole: 'teacher',
        status: 'published'
      },
      {
        studentName: 'Diya Mehta',
        grNumber: 'GR002',
        dateOfBirth: new Date('2010-08-22'),
        standard: 'Grade 10',
        term: 'Term-1',
        academicYear: '2024-25',
        subjects: [
          { name: 'Mathematics', marks: 92, maxMarks: 100 },
          { name: 'Physics', marks: 88, maxMarks: 100 },
          { name: 'Chemistry', marks: 90, maxMarks: 100 },
          { name: 'English', marks: 85, maxMarks: 100 },
          { name: 'Hindi', marks: 87, maxMarks: 100 }
        ],
        remarks: 'Outstanding performance!',
        uploadedBy: createdTeachers[0]._id,
        uploadedByRole: 'teacher',
        status: 'published'
      },
      {
        studentName: 'Rohan Desai',
        grNumber: 'GR003',
        dateOfBirth: new Date('2011-03-10'),
        standard: 'Grade 9',
        term: 'Term-1',
        academicYear: '2024-25',
        subjects: [
          { name: 'Mathematics', marks: 75, maxMarks: 100 },
          { name: 'Science', marks: 80, maxMarks: 100 },
          { name: 'English', marks: 72, maxMarks: 100 },
          { name: 'Hindi', marks: 78, maxMarks: 100 },
          { name: 'Social Studies', marks: 82, maxMarks: 100 }
        ],
        remarks: 'Good effort. Focus on English.',
        uploadedBy: createdTeachers[1]._id,
        uploadedByRole: 'teacher',
        status: 'published'
      },
      {
        studentName: 'Ananya Singh',
        grNumber: 'GR004',
        dateOfBirth: new Date('2011-07-18'),
        standard: 'Grade 9',
        term: 'Term-1',
        academicYear: '2024-25',
        subjects: [
          { name: 'Mathematics', marks: 88, maxMarks: 100 },
          { name: 'Science', marks: 85, maxMarks: 100 },
          { name: 'English', marks: 90, maxMarks: 100 },
          { name: 'Hindi', marks: 92, maxMarks: 100 },
          { name: 'Social Studies', marks: 87, maxMarks: 100 }
        ],
        remarks: 'Excellent all-round performance!',
        uploadedBy: createdTeachers[1]._id,
        uploadedByRole: 'teacher',
        status: 'published'
      },
      {
        studentName: 'Kabir Joshi',
        grNumber: 'GR005',
        dateOfBirth: new Date('2012-01-25'),
        standard: 'Grade 8',
        term: 'Term-1',
        academicYear: '2024-25',
        subjects: [
          { name: 'Mathematics', marks: 68, maxMarks: 100 },
          { name: 'Science', marks: 72, maxMarks: 100 },
          { name: 'English', marks: 75, maxMarks: 100 },
          { name: 'Hindi', marks: 80, maxMarks: 100 },
          { name: 'Social Studies', marks: 70, maxMarks: 100 }
        ],
        remarks: 'Good progress. Keep working hard.',
        uploadedBy: createdTeachers[1]._id,
        uploadedByRole: 'teacher',
        status: 'published'
      }
    ];

    const createdResults = await Result.insertMany(results);
    console.log(`✅ Created ${createdResults.length} results`);

    console.log('\n📋 Sample Login Credentials:');
    console.log('\n--- ADMIN ---');
    console.log('Email: Kamliprischool');
    console.log('Password: Kamli@0409');
    
    console.log('\n--- TEACHERS ---');
    console.log('1. Email: rajesh.kumar@school.com | Password: teacher123');
    console.log('   Subjects: Mathematics, Physics | Classes: Grade 9, 10');
    console.log('\n2. Email: priya.sharma@school.com | Password: teacher123');
    console.log('   Subjects: English, Hindi | Classes: Grade 8, 9');
    console.log('\n3. Email: amit.patel@school.com | Password: teacher123');
    console.log('   Subjects: Science, Chemistry | Classes: Grade 10, 11');
    
    console.log('\n--- STUDENTS (Login with GR Number + DOB) ---');
    console.log('1. GR Number: GR001 | DOB: 2010-05-15 | Name: Aryan Shah');
    console.log('2. GR Number: GR002 | DOB: 2010-08-22 | Name: Diya Mehta');
    console.log('3. GR Number: GR003 | DOB: 2011-03-10 | Name: Rohan Desai');
    console.log('4. GR Number: GR004 | DOB: 2011-07-18 | Name: Ananya Singh');
    console.log('5. GR Number: GR005 | DOB: 2012-01-25 | Name: Kabir Joshi');

    console.log('\n✅ Seed data created successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
};

// Run the seed
connectDB().then(() => {
  seedData();
});
