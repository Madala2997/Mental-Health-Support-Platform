const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Resource = require('../models/Resource');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mindmitra';

async function quickSeed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB successfully!');

    // Create sample users
    console.log('Creating sample users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Check if users already exist
    const existingUser = await User.findOne({ email: 'john@student.edu' });
    if (!existingUser) {
      const users = await User.create([
        {
          name: 'John Smith',
          email: 'john@student.edu',
          password: hashedPassword,
          role: 'student',
          isVerified: true,
          profile: {
            bio: 'Computer Science student',
            avatar: 'https://via.placeholder.com/150/6c757d/ffffff?text=JS'
          }
        },
        {
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@mindmitra.com',
          password: await bcrypt.hash('counselor123', 10),
          role: 'counselor',
          isVerified: true,
          profile: {
            bio: 'Licensed Clinical Psychologist',
            avatar: 'https://via.placeholder.com/150/28a745/ffffff?text=Dr.S',
            specializations: ['Anxiety', 'Depression', 'Stress Management']
          }
        }
      ]);
      console.log('Sample users created successfully!');
    } else {
      console.log('Users already exist, skipping user creation...');
    }

    // Create sample resources
    console.log('Creating sample resources...');
    const existingResource = await Resource.findOne({ title: 'Managing Academic Stress' });
    if (!existingResource) {
      const admin = await User.findOne({ role: 'counselor' }) || await User.findOne();
      
      await Resource.create([
        {
          title: 'Managing Academic Stress',
          description: 'Learn effective strategies to manage academic pressure and maintain mental well-being during your studies.',
          content: 'Academic stress is common among students. Here are some effective strategies: 1) Create a study schedule and stick to it, 2) Take regular breaks every 45-60 minutes, 3) Practice deep breathing exercises, 4) Get 7-9 hours of sleep nightly, 5) Seek support from friends, family, or counselors when needed. Remember, it\'s okay to ask for help!',
          category: 'stress-management',
          type: 'article',
          author: admin._id,
          tags: ['stress', 'academic', 'study-tips'],
          readTime: 5,
          difficulty: 'beginner',
          isPublished: true
        },
        {
          title: 'Deep Breathing Exercise',
          description: 'A simple 5-minute breathing technique to reduce anxiety and promote relaxation.',
          content: 'This 5-minute breathing exercise can help reduce anxiety and stress: 1) Find a comfortable seated position, 2) Close your eyes and relax your shoulders, 3) Breathe in slowly through your nose for 4 counts, 4) Hold your breath for 4 counts, 5) Breathe out slowly through your mouth for 6 counts, 6) Repeat this cycle 10 times. Practice this daily for best results.',
          category: 'stress-management',
          type: 'exercise',
          author: admin._id,
          tags: ['breathing', 'relaxation', 'anxiety'],
          readTime: 3,
          difficulty: 'beginner',
          isPublished: true
        },
        {
          title: 'Building Healthy Sleep Habits',
          description: 'Essential tips for improving sleep quality and establishing a healthy bedtime routine.',
          content: 'Good sleep is crucial for mental health and academic performance: 1) Maintain a consistent sleep schedule - go to bed and wake up at the same time daily, 2) Create a relaxing bedtime routine (reading, gentle stretching, meditation), 3) Avoid screens 1 hour before bed, 4) Keep your bedroom cool (65-68°F), dark, and quiet, 5) Avoid caffeine after 2 PM, 6) Exercise regularly but not close to bedtime.',
          category: 'self-care',
          type: 'guide',
          author: admin._id,
          tags: ['sleep', 'health', 'routine'],
          readTime: 7,
          difficulty: 'beginner',
          isPublished: true
        },
        {
          title: 'Mindfulness Meditation for Beginners',
          description: 'Start your mindfulness journey with this simple 10-minute meditation guide.',
          content: 'Mindfulness meditation can help reduce stress and improve focus: 1) Find a quiet space and sit comfortably, 2) Close your eyes and focus on your breath, 3) When your mind wanders, gently bring attention back to breathing, 4) Start with 5 minutes and gradually increase, 5) Practice daily for best results. Remember, there\'s no "perfect" meditation - it\'s about awareness and practice.',
          category: 'mindfulness',
          type: 'exercise',
          author: admin._id,
          tags: ['mindfulness', 'meditation', 'beginner'],
          readTime: 4,
          difficulty: 'beginner',
          isPublished: true
        }
      ]);
      console.log('Sample resources created successfully!');
    } else {
      console.log('Resources already exist, skipping resource creation...');
    }

    console.log('\n✅ Quick database seeding completed!');
    console.log('\nSample accounts:');
    console.log('👨‍🎓 Student: john@student.edu / password123');
    console.log('👩‍⚕️ Counselor: sarah.johnson@mindmitra.com / counselor123');
    console.log('\nYou can now test the application!');

  } catch (error) {
    console.error('Error seeding database:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

quickSeed();
