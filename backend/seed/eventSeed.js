const mongoose = require('mongoose');
const User = require('../models/User');
const Event = require('../models/Event');

const eventsData = [
  {
    clubName: "Programming Club",
    event: {
      name: "CodeCraft 2026",
      description: "IIIT Hyderabad's flagship competitive programming contest held during Felicity. Test your algorithmic skills against the best minds in the country!",
      eventType: "Normal",
      eligibility: "Open to all college students",
      registrationDeadline: new Date('2028-01-15T00:00:00Z'),
      startDate: new Date('2028-02-01T10:00:00Z'),
      endDate: new Date('2028-02-01T13:00:00Z'),
      registrationFee: 0,
      registrationLimit: 200,
      tags: ["Programming", "Contest", "Algorithm"],
      status: "Published",
      customFormStructure: [
        {
          fieldName: "Codeforces Handle",
          fieldType: "text",
          required: true
        },
        {
          fieldName: "Preferred Programming Language",
          fieldType: "select",
          options: ["C++", "Python", "Java", "Rust"],
          required: true
        }
      ]
    }
  },
  {
    clubName: "Programming Club",
    event: {
      name: "Decode",
      description: "A unique reverse-engineering and code-breaking challenge. Analyze existing codebases, find vulnerabilities, and break them!",
      eventType: "Normal",
      eligibility: "IIITH Students only",
      registrationDeadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Past deadline
      startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
      registrationFee: 50,
      registrationLimit: 50,
      tags: ["Reverse Engineering", "Hackathon"],
      status: "Closed"
    }
  },
  {
    clubName: "Felicity Taskforce",
    event: {
      name: "Felicity Main Stage: EDM Night",
      description: "The grand finale of Felicity! A massive techno-cultural night featuring top artists, food stalls, and an unforgettable experience.",
      eventType: "Normal",
      eligibility: "Open to all",
      registrationDeadline: new Date('2026-11-20T00:00:00Z'),
      startDate: new Date('2026-12-01T18:00:00Z'),
      endDate: new Date('2026-12-03T02:00:00Z'),
      registrationFee: 500,
      tags: ["Cultural", "Fest", "Music"],
      status: "Published"
    }
  },
  {
    clubName: "Felicity Taskforce",
    event: {
      name: "Official Felicity 2026 T-Shirt",
      description: "Grab the official merchandise of IIIT Hyderabad's annual fest! High-quality cotton t-shirts with the exclusive Felicity '26 design.",
      eventType: "Merchandise",
      eligibility: "Open to all",
      registrationDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      startDate: new Date(Date.now()),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      registrationFee: 450,
      tags: ["Merch", "Apparel"],
      status: "Published",
      merchDetails: {
        stockQuantity: 500,
        purchaseLimit: 3,
        variants: [
          { size: "S", color: "Black", sku: "FEL26-S-BLK" },
          { size: "M", color: "Black", sku: "FEL26-M-BLK" },
          { size: "L", color: "Black", sku: "FEL26-L-BLK" },
          { size: "XL", color: "Black", sku: "FEL26-XL-BLK" }
        ]
      }
    }
  },
  {
    clubName: "0x1337: The Hacking Club",
    event: {
      name: "Capture The Flag (CTF)",
      description: "A 24-hour cybersecurity challenge. Test your skills in cryptography, web exploitation, binary analysis, and forensics.",
      eventType: "Normal",
      eligibility: "IIITH Students only",
      registrationDeadline: new Date('2027-05-10T00:00:00Z'),
      startDate: new Date('2027-06-15T09:00:00Z'),
      endDate: new Date('2027-06-16T09:00:00Z'),
      registrationFee: 0,
      registrationLimit: 100,
      tags: ["Cybersecurity", "CTF", "Hacking"],
      status: "Published"
    }
  },
  {
    clubName: "The Dance Crew",
    event: {
      name: "Zest: Inter-College Dance Battle",
      description: "Showcase your moves at Zest! Participate in solo, duet, or group dance categories and win exciting cash prizes.",
      eventType: "Normal",
      eligibility: "College Students",
      registrationDeadline: new Date('2027-08-01T00:00:00Z'),
      startDate: new Date('2027-08-10T16:00:00Z'),
      endDate: new Date('2027-08-10T20:00:00Z'),
      registrationFee: 150,
      tags: ["Dance", "Cultural", "Competition"],
      status: "Published"
    }
  },
  {
    clubName: "Open-Source Developers Group",
    event: {
      name: "OSDG Hacktoberfest Kickoff",
      description: "Join us for the kickoff of Hacktoberfest! Learn how to make your first open-source contribution and earn exclusive swag.",
      eventType: "Normal",
      eligibility: "Open to all",
      registrationDeadline: new Date('2028-09-15T00:00:00Z'),
      startDate: new Date('2028-10-01T10:00:00Z'),
      endDate: new Date('2028-10-01T18:00:00Z'),
      registrationFee: 0,
      tags: ["Open Source", "Coding", "Workshop"],
      status: "Published"
    }
  },
  {
    clubName: "Pentaprism",
    event: {
      name: "Pentaprism Official Hoodie",
      description: "Represent the photography club with our premium winter hoodie! Made with thick fleece and features the classic Pentaprism lens logo embroidered on the front.",
      eventType: "Merchandise",
      eligibility: "IIITH Students only",
      registrationDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      registrationFee: 850,
      tags: ["Merch", "Apparel", "Winter"],
      status: "Ongoing",
      merchDetails: {
        stockQuantity: 150,
        purchaseLimit: 2,
        variants: [
          { size: "S", color: "Navy Blue", sku: "PENT-HD-S" },
          { size: "M", color: "Navy Blue", sku: "PENT-HD-M" },
          { size: "L", color: "Navy Blue", sku: "PENT-HD-L" },
          { size: "XL", color: "Navy Blue", sku: "PENT-HD-XL" }
        ]
      }
    }
  },
  {
    clubName: "The Chess Club",
    event: {
      name: "IIITH Chess Open",
      description: "An open Blitz chess tournament. Swiss format, 5+3 time control. Cash prizes for the top 3 players!",
      eventType: "Normal",
      eligibility: "Open to all",
      registrationDeadline: new Date('2026-08-20T00:00:00Z'),
      startDate: new Date('2026-08-25T14:00:00Z'),
      endDate: new Date('2026-08-25T20:00:00Z'),
      registrationFee: 50,
      tags: ["Chess", "Sports", "Tournament"],
      status: "Published"
    }
  },
  {
    clubName: "The Music Club",
    event: {
      name: "Symphony Night",
      description: "An acoustic evening under the stars. Relax and listen to amazing covers and original tracks performed by IIITH students.",
      eventType: "Normal",
      eligibility: "Open to all",
      registrationDeadline: new Date('2027-11-05T00:00:00Z'),
      startDate: new Date('2027-11-15T19:00:00Z'),
      endDate: new Date('2027-11-15T22:00:00Z'),
      registrationFee: 0,
      tags: ["Music", "Cultural", "Acoustic"],
      status: "Published"
    }
  },
  {
    clubName: "The Debate Society",
    event: {
      name: "Model United Nations (MUN)",
      description: "Step into the shoes of global diplomats. Discuss, debate, and pass resolutions on pressing international issues.",
      eventType: "Normal",
      eligibility: "College Students",
      registrationDeadline: new Date('2028-03-01T00:00:00Z'),
      startDate: new Date('2028-03-20T09:00:00Z'),
      endDate: new Date('2028-03-22T17:00:00Z'),
      registrationFee: 300,
      tags: ["Debate", "MUN", "Speaking"],
      status: "Published"
    }
  },
  {
    clubName: "Literary Club",
    event: {
      name: "LitClub Poetry Slam",
      description: "Express yourself through spoken word! A cozy evening of poetry reading, storytelling, and open mic.",
      eventType: "Normal",
      eligibility: "Open to all",
      registrationDeadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      startDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      registrationFee: 0,
      tags: ["Literature", "Poetry", "Open Mic"],
      status: "Published",
      customFormStructure: [
        {
          fieldName: "Will you be performing or just attending?",
          fieldType: "radio",
          options: ["Performing", "Attending"],
          required: true
        },
        {
          fieldName: "What theme is your poem? (If performing)",
          fieldType: "textarea",
          required: false
        }
      ]
    }
  }
];

const seedEvents = async () => {
  try {
    let createdCount = 0;

    // Clear existing events for a clean slate
    await Event.deleteMany({});
    console.log("Cleared existing events.");

    for (const item of eventsData) {
      const email = item.clubName.toLowerCase().replace(/[^a-z0-9]/g, '') + '@iiit.ac.in';
      const organizer = await User.findOne({ email });

      if (organizer) {
        const newEvent = new Event({
          ...item.event,
          organizerId: organizer._id
        });
        await newEvent.save();
        console.log(`Created event: ${item.event.name} (Organizer: ${item.clubName})`);
        createdCount++;
      } else {
        console.warn(`Could not find organizer for club: ${item.clubName}`);
      }
    }

    console.log(`\nSuccessfully seeded ${createdCount} events.`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding events:', error);
    process.exit(1);
  }
};

const run = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mern';
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected for seeding events');
    await seedEvents();
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
};

run();
