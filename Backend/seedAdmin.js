const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const adminEmail = 'vipulunjha@gmail.com';
        const adminPassword = 'Kamli@0409';

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('Admin already exists. Updating password and role...');
            const salt = await bcrypt.genSalt(10);
            existingAdmin.password = await bcrypt.hash(adminPassword, salt);
            existingAdmin.role = 'admin';
            existingAdmin.name = 'Vipul Patel';
            await existingAdmin.save();
            console.log('Admin updated successfully');
        } else {
            console.log('Creating new Admin...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            const newAdmin = new User({
                name: 'Vipul Patel',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                isActive: true
            });

            await newAdmin.save();
            console.log('Admin created successfully');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
