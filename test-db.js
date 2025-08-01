const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Testing MongoDB connection...');
  console.log('Connection String:', process.env.MONGODB_URI ? 'Found' : 'Missing');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
    });
    
    console.log('✅ MongoDB connected successfully!');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    console.log('Ready State:', mongoose.connection.readyState);
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📊 Available collections:', collections.length);
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    
    if (error.message.includes('ReplicaSetNoPrimary')) {
      console.log('\n🔧 Troubleshooting steps:');
      console.log('1. Check MongoDB Atlas cluster status');
      console.log('2. Verify Network Access (IP Whitelist)');
      console.log('3. Ensure cluster is not paused');
      console.log('4. Check database user permissions');
    }
    
    process.exit(1);
  }
}

testConnection();
