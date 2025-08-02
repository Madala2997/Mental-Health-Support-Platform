const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mindmitra';

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('Connection URI:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); // Hide credentials
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Successfully connected to MongoDB!');
    console.log('Database name:', mongoose.connection.name);
    console.log('Connection state:', mongoose.connection.readyState);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nExisting collections:');
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });
    
    if (collections.length === 0) {
      console.log('  No collections found. Database is empty.');
      console.log('  Run "npm run seed" to populate with sample data.');
    }
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error(error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Make sure MongoDB is installed and running');
      console.log('2. Check if MongoDB service is started');
      console.log('3. Verify the connection URI in your .env file');
      console.log('4. For local MongoDB, try: mongod --dbpath ./data');
    }
  } finally {
    await mongoose.connection.close();
    console.log('\nConnection closed.');
  }
}

testConnection();
