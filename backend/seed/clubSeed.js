const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mern').then(() => console.log('MongoDB connected for seeding clubs'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const clubsList = [
  "0x1337: The Hacking Club",
  "Amateur Sports Enthusiasts Club",
  "Apex Body",
  "Astronautics Club",
  "Campus Life Council",
  "Campus Mental Health Support",
  "Clubs Council",
  "Cultural Council",
  "Cyclorama",
  "Decore - The Design Club",
  "Developer Student Club",
  "Election Commission",
  "Electronics and Robotics Club",
  "Entrepreneurship Cell",
  "Felicity Taskforce",
  "Finance Council",
  "Frivolous Humour Club",
  "ISAQC: IIIT Society for Applied Quantum Computing",
  "LeanIn Chapter IIITH",
  "Literary Club",
  "National Service Scheme",
  "Open-Source Developers Group",
  "Pentaprism",
  "Placement Cell",
  "Programming Club",
  "Rouge - The Fashion Club",
  "Skateboarding Club",
  "Sports Council",
  "Student Alumni Connect Cell",
  "Student Life Office",
  "Student Parliament",
  "Students Queer Club",
  "The Art Society",
  "The Chess Club",
  "The Dance Crew",
  "The Debate Society",
  "The Gaming Club",
  "The Language Club",
  "The Music Club",
  "The TV Room Quiz Club",
  "Theory Group"
];

const seedClubs = async () => {
  try {
    let createdCount = 0;
    
    for (const clubName of clubsList) {
      const email = clubName.toLowerCase().replace(/[^a-z0-9]/g, '') + '@iiit.ac.in';
      const passwordStr = `${clubName}@123`;
      
      const existing = await User.findOne({ email });
      if (!existing) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(passwordStr, salt);
        
        await User.create({
          email: email,
          password: hashedPassword,
          role: 'Organizer',
          organizerProfile: {
            organizerName: clubName,
            category: 'Club/Body'
          }
        });
        console.log(`Created: ${clubName} (${email})`);
        createdCount++;
      }
    }
    
    console.log(`\nSuccessfully seeded ${createdCount} new clubs.`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding clubs:', error);
    process.exit(1);
  }
};

seedClubs();
