const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Resource = require('../models/Resource');
const Journal = require('../models/Journal');
const Forum = require('../models/Forum');
const Mood = require('../models/Mood');
const Chat = require('../models/Chat');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mindmitra';

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB successfully!');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Resource.deleteMany({});
    await Journal.deleteMany({});
    await Forum.deleteMany({});
    await Mood.deleteMany({});
    await Chat.deleteMany({});

    // Create sample users
    console.log('Creating sample users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@mindmitra.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        isVerified: true,
        profile: {
          bio: 'System Administrator',
          avatar: 'https://via.placeholder.com/150/007bff/ffffff?text=Admin'
        }
      },
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@mindmitra.com',
        password: await bcrypt.hash('counselor123', 10),
        role: 'counselor',
        isVerified: true,
        profile: {
          bio: 'Licensed Clinical Psychologist specializing in anxiety and depression',
          avatar: 'https://via.placeholder.com/150/28a745/ffffff?text=Dr.S',
          specializations: ['Anxiety', 'Depression', 'Stress Management']
        }
      },
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
        name: 'Emily Davis',
        email: 'emily@student.edu',
        password: hashedPassword,
        role: 'student',
        isVerified: true,
        profile: {
          bio: 'Psychology major',
          avatar: 'https://via.placeholder.com/150/dc3545/ffffff?text=ED'
        }
      }
    ]);

    console.log('Sample users created successfully!');

    // Create sample resources
    console.log('Creating sample resources...');
    const resources = await Resource.create([
      {
        title: 'Managing Academic Stress',
        content: 'Academic stress is common among students. Here are some effective strategies to manage it...',
        category: 'stress-management',
        type: 'article',
        author: users[0]._id,
        tags: ['stress', 'academic', 'study-tips'],
        isPublished: true
      },
      {
        title: 'Deep Breathing Exercise',
        content: 'This guided breathing exercise can help reduce anxiety and promote relaxation...',
        category: 'exercises',
        type: 'exercise',
        author: users[1]._id,
        tags: ['breathing', 'relaxation', 'anxiety'],
        isPublished: true
      },
      {
        title: 'Building Healthy Sleep Habits',
        content: 'Good sleep is crucial for mental health. Learn how to improve your sleep quality...',
        category: 'self-care',
        type: 'guide',
        author: users[1]._id,
        tags: ['sleep', 'health', 'routine'],
        isPublished: true
      },
      {
        title: 'Mindfulness Meditation for Beginners',
        content: 'Start your mindfulness journey with this simple 10-minute meditation guide...',
        category: 'mindfulness',
        type: 'exercise',
        author: users[1]._id,
        tags: ['mindfulness', 'meditation', 'beginner'],
        isPublished: true
      }
    ]);

    console.log('Sample resources created successfully!');

    // Create sample journal entries
    console.log('Creating sample journal entries...');
    const journals = await Journal.create([
      {
        title: 'First Day of College',
        content: 'Today was my first day at college. I felt nervous but excited about this new chapter...',
        mood: 'happy',
        author: users[2]._id,
        isAnonymous: false,
        tags: ['college', 'new-beginning']
      },
      {
        title: 'Dealing with Exam Anxiety',
        content: 'I have been feeling really anxious about my upcoming exams. The pressure is overwhelming...',
        mood: 'anxious',
        author: users[3]._id,
        isAnonymous: true,
        tags: ['anxiety', 'exams']
      }
    ]);

    console.log('Sample journal entries created successfully!');

    // Create sample forum posts
    console.log('Creating sample forum posts...');
    const forumPosts = await Forum.create([
      {
        title: 'How do you deal with procrastination?',
        content: 'I struggle with procrastination especially during exam season. What strategies work for you?',
        category: 'academic-stress',
        author: users[2]._id,
        isAnonymous: false,
        replies: [
          {
            author: users[3]._id,
            content: 'I use the Pomodoro technique - 25 minutes of focused work followed by a 5-minute break.',
            isAnonymous: false
          }
        ]
      },
      {
        title: 'Feeling overwhelmed with coursework',
        content: 'This semester has been particularly challenging. Anyone else feeling the same way?',
        category: 'general',
        author: users[3]._id,
        isAnonymous: true,
        replies: [
          {
            author: users[2]._id,
            content: 'You\'re not alone! I find talking to friends and taking breaks helps.',
            isAnonymous: false
          }
        ]
      }
    ]);

    console.log('Sample forum posts created successfully!');

    // Create sample mood entries
    console.log('Creating sample mood entries...');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const moods = await Mood.create([
      {
        user: users[2]._id,
        mood: 'happy',
        moodValue: 4,
        date: today,
        notes: 'Had a great day with friends',
        factors: ['social', 'exercise']
      },
      {
        user: users[2]._id,
        mood: 'neutral',
        moodValue: 3,
        date: yesterday,
        notes: 'Regular day, nothing special',
        factors: ['academic']
      },
      {
        user: users[3]._id,
        mood: 'sad',
        moodValue: 2,
        date: today,
        notes: 'Feeling stressed about assignments',
        factors: ['academic', 'stress']
      }
    ]);

    console.log('Sample mood entries created successfully!');

    // Create sample chat
    console.log('Creating sample chat...');
    const chat = await Chat.create({
      participants: [users[2]._id, users[1]._id],
      type: 'counselor',
      messages: [
        {
          sender: users[2]._id,
          content: 'Hi, I would like to talk about managing stress.',
          type: 'text'
        },
        {
          sender: users[1]._id,
          content: 'Hello! I\'m here to help. What specific aspects of stress are you dealing with?',
          type: 'text'
        }
      ],
      isActive: true
    });

    console.log('Sample chat created successfully!');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nSample accounts created:');
    console.log('👤 Admin: admin@mindmitra.com / admin123');
    console.log('👩‍⚕️ Counselor: sarah.johnson@mindmitra.com / counselor123');
    console.log('👨‍🎓 Student 1: john@student.edu / password123');
    console.log('👩‍🎓 Student 2: emily@student.edu / password123');
    console.log('\nYou can now test the application with these accounts!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

// Run the seeding function
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
