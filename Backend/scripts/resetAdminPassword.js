const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// User Schema (minimal for this script)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  employeeId: String,
  subjects: [String],
  classTeacher: String,
  assignedClasses: [String],
  phone: String,
  isActive: Boolean,
  faceRegistered: Boolean
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const resetAdminPassword = async () => {
  try {
    await connectDB();

    const adminEmail = 'vipulunjha@gmail.com';
    const newPassword = 'Kamli@0409'; // The password from your .env file

    console.log('\n🔍 Searching for admin user...');
    const admin = await User.findOne({ email: adminEmail, role: 'admin' });

    if (!admin) {
      console.log('❌ Admin user not found with email:', adminEmail);
      process.exit(1);
    }

    console.log('✅ Admin found:', admin.name);
    console.log('📧 Email:', admin.email);
    console.log('👤 Role:', admin.role);
    console.log('🆔 Employee ID:', admin.employeeId);

    // Hash the new password
    console.log('\n🔐 Hashing new password...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    console.log('💾 Updating password in database...');
    admin.password = hashedPassword;
    await admin.save();

    console.log('\n✅ SUCCESS! Admin password has been reset.');
    console.log('\n📋 Login Credentials:');
    console.log('   Email:', adminEmail);
    console.log('   Password:', newPassword);
    console.log('\n💡 You can now login with these credentials!');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
};

resetAdminPassword();
