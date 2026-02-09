const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config();

const User = require('../models/User');

/**
 * Initial Admin Setup Script
 * Run this once to create the first admin account
 * Usage: node scripts/createAdmin.js
 */

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createAdminAccount() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/job-portal');
    console.log('✓ Connected to MongoDB\n');

    // Check if any admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠ An admin account already exists!');
      console.log(`Admin: ${existingAdmin.name} (${existingAdmin.email})\n`);
      
      const proceed = await question('Do you want to create another admin? (yes/no): ');
      if (proceed.toLowerCase() !== 'yes' && proceed.toLowerCase() !== 'y') {
        console.log('Setup cancelled.');
        process.exit(0);
      }
    }

    console.log('=== Create New Admin Account ===\n');

    // Get admin details
    const name = await question('Admin Name: ');
    if (!name || name.trim() === '') {
      throw new Error('Name is required');
    }

    const email = await question('Admin Email: ');
    if (!email || !email.match(/^\S+@\S+\.\S+$/)) {
      throw new Error('Valid email is required');
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error(`Email ${email} is already registered`);
    }

    const password = await question('Admin Password (min 6 characters): ');
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const phone = await question('Phone Number (optional): ');

    // Create admin user
    const adminData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      role: 'admin',
      isApproved: true,
      isActive: true
    };

    if (phone && phone.trim() !== '') {
      adminData.phone = phone.trim();
    }

    const admin = await User.create(adminData);

    console.log('\n✓ Admin account created successfully!\n');
    console.log('=== Admin Details ===');
    console.log(`Name: ${admin.name}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);
    console.log(`ID: ${admin._id}`);
    console.log('\nYou can now login at: http://localhost:3000/admin/login\n');

  } catch (error) {
    console.error('\n✗ Error creating admin account:');
    console.error(error.message);
    process.exit(1);
  } finally {
    rl.close();
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  }
}

// Run the script
createAdminAccount();
