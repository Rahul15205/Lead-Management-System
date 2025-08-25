const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Lead = require('../models/Lead');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lead_management');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Lead.deleteMany({});
    console.log('Cleared existing data');

    // Create test user
    const testUser = new User({
      email: 'test@example.com',
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User'
    });

    await testUser.save();
    console.log('Created test user');

    // Generate 150 sample leads
    const sources = ['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'];
    const statuses = ['new', 'contacted', 'qualified', 'lost', 'won'];
    const companies = [
      'TechCorp Inc', 'Digital Solutions Ltd', 'Innovation Labs', 'Future Systems',
      'Smart Tech Co', 'Global Dynamics', 'NextGen Solutions', 'Quantum Corp',
      'Alpha Technologies', 'Beta Industries', 'Gamma Enterprises', 'Delta Systems',
      'Epsilon Group', 'Zeta Solutions', 'Eta Innovations', 'Theta Corp'
    ];
    const cities = [
      'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
      'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
      'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis',
      'Seattle', 'Denver', 'Washington', 'Boston', 'Nashville', 'Detroit', 'Portland'
    ];
    const states = [
      'NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'FL', 'OH', 'NC', 'WA', 'CO', 'DC',
      'MA', 'TN', 'MI', 'OR', 'GA', 'VA', 'NJ', 'MD', 'NV', 'CT', 'UT', 'AL'
    ];

    const firstNames = [
      'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Jessica',
      'William', 'Ashley', 'James', 'Amanda', 'Christopher', 'Stephanie', 'Daniel',
      'Melissa', 'Matthew', 'Nicole', 'Anthony', 'Elizabeth', 'Mark', 'Helen',
      'Donald', 'Deborah', 'Steven', 'Rachel', 'Paul', 'Carolyn', 'Andrew', 'Janet'
    ];

    const lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
      'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
      'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
      'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
    ];

    const leads = [];
    const usedEmails = new Set();

    for (let i = 0; i < 150; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      let email;
      
      // Ensure unique emails
      do {
        email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}@example.com`;
      } while (usedEmails.has(email));
      usedEmails.add(email);

      const lead = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        company: companies[Math.floor(Math.random() * companies.length)],
        city: cities[Math.floor(Math.random() * cities.length)],
        state: states[Math.floor(Math.random() * states.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        score: Math.floor(Math.random() * 101), // 0-100
        lead_value: Math.floor(Math.random() * 50000) + 1000, // $1000-$51000
        is_qualified: Math.random() > 0.7, // 30% chance of being qualified
        last_activity_at: Math.random() > 0.5 ? new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)) : null,
        user: testUser._id,
        created_at: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)), // Random date within last 90 days
        updated_at: new Date()
      };

      leads.push(lead);
    }

    await Lead.insertMany(leads);
    console.log(`Created ${leads.length} sample leads`);

    console.log('\n=== SEED DATA COMPLETE ===');
    console.log('Test User Credentials:');
    console.log('Email: test@example.com');
    console.log('Password: testpassword123');
    console.log(`Total Leads: ${leads.length}`);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

const runSeed = async () => {
  await connectDB();
  await seedData();
};

runSeed();
