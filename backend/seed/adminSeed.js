const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'Admin' });
    
    if (!adminExists) {
      // In production, you would fetch these from process.env securely
      // For this assignment, we'll provision a default one if none exists.
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@system.local';
      const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword';
      
      await User.create({
        email: adminEmail,
        password: adminPassword,
        role: 'Admin',
        participantType: 'N/A'
      });
      console.log(`Admin account provisioned automatically: ${adminEmail}`);
    } else {
      console.log('Admin account already exists.');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
};

module.exports = seedAdmin;
