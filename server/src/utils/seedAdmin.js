const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User.js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI_DEV);
    console.log('Connected to DB for seeding');

    // Admin credentials from environmental variables
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminEmail || !adminPassword) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin already exists');
      return;
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

    const adminUser = new User({
      username: 'admin',
      email: adminEmail,
      passwordHash,
      role: 'admin',
      userType: 'individual',
      isVerified: true, // Admin is verified by default
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.connection.close();
  }
};

seedAdmin();