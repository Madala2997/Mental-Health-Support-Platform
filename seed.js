const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Resource = require('./models/Resource');

// Sample data
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@mindmitra.com',
    password: 'admin123',
    role: 'admin',
    isVerified: true
  },
  {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@mindmitra.com',
    password: 'counselor123',
    role: 'counselor',
    isVerified: true,
    profile: {
      bio: 'Licensed clinical psychologist with 10+ years of experience in student mental health.',
      specializations: ['anxiety', 'depression', 'academic-stress']
    }
  },
  {
    name: 'John Student',
    email: 'john@student.edu',
    password: 'student123',
    role: 'student',
    profile: {
      year: '3rd',
      department: 'Computer Science',
      bio: 'CS student passionate about mental health awareness.'
    }
  }
];

const sampleResources = [
  {
    title: 'Managing Academic Stress: A Student\'s Guide',
    description: 'Comprehensive guide to understanding and managing academic pressure effectively.',
    content: `Academic stress is a common experience for students at all levels. This guide provides practical strategies to help you manage stress and maintain your mental well-being.

## Understanding Academic Stress

Academic stress can manifest in various ways:
- Feeling overwhelmed by coursework
- Anxiety about exams and deadlines
- Pressure to achieve high grades
- Difficulty balancing studies with other responsibilities

## Effective Stress Management Strategies

### 1. Time Management
- Create a realistic study schedule
- Break large tasks into smaller, manageable chunks
- Use tools like calendars and to-do lists
- Prioritize tasks based on importance and deadlines

### 2. Self-Care Practices
- Maintain a regular sleep schedule
- Exercise regularly, even if it's just a short walk
- Eat nutritious meals and stay hydrated
- Practice relaxation techniques like deep breathing

### 3. Seek Support
- Talk to friends, family, or counselors
- Join study groups or peer support networks
- Don't hesitate to ask for help when needed
- Utilize campus mental health resources

### 4. Maintain Perspective
- Remember that grades don't define your worth
- Focus on learning and personal growth
- Celebrate small achievements
- Practice self-compassion

## When to Seek Professional Help

Consider reaching out to a mental health professional if you experience:
- Persistent feelings of anxiety or depression
- Difficulty sleeping or changes in appetite
- Thoughts of self-harm
- Inability to function in daily activities

Remember, seeking help is a sign of strength, not weakness.`,
    type: 'article',
    category: 'academic-pressure',
    tags: ['stress', 'time-management', 'self-care', 'study-tips'],
    readTime: 8,
    difficulty: 'beginner',
    isPublished: true
  },
  {
    title: 'Breathing Exercises for Anxiety Relief',
    description: 'Simple breathing techniques to help calm anxiety and reduce stress in the moment.',
    content: `Breathing exercises are powerful tools for managing anxiety and stress. These techniques can be done anywhere, anytime, and provide immediate relief.

## Why Breathing Exercises Work

When we're anxious, our breathing becomes shallow and rapid. This can worsen anxiety symptoms. Controlled breathing helps:
- Activate the body's relaxation response
- Reduce heart rate and blood pressure
- Improve focus and mental clarity
- Provide a sense of control

## Basic Breathing Techniques

### 1. Box Breathing (4-4-4-4)
- Inhale for 4 counts
- Hold for 4 counts
- Exhale for 4 counts
- Hold empty for 4 counts
- Repeat 4-8 times

### 2. Deep Belly Breathing
- Place one hand on chest, one on belly
- Breathe in slowly through nose, expanding belly
- Exhale slowly through mouth, belly falls
- Continue for 5-10 minutes

### 3. 4-7-8 Technique
- Inhale through nose for 4 counts
- Hold breath for 7 counts
- Exhale through mouth for 8 counts
- Repeat 3-4 times

## Tips for Success

- Practice regularly, not just during anxiety
- Find a quiet, comfortable space
- Start with shorter sessions and build up
- Be patient with yourself as you learn

These exercises become more effective with regular practice. Consider incorporating them into your daily routine for best results.`,
    type: 'exercise',
    category: 'anxiety',
    tags: ['breathing', 'anxiety-relief', 'mindfulness', 'relaxation'],
    readTime: 5,
    difficulty: 'beginner',
    isPublished: true
  },
  {
    title: 'Building Resilience: Bouncing Back from Setbacks',
    description: 'Learn how to develop mental resilience and recover stronger from life\'s challenges.',
    content: `Resilience is the ability to bounce back from adversity, adapt to challenge, and grow stronger through difficult experiences. It's a skill that can be developed and strengthened over time.

## What is Resilience?

Resilience involves:
- Emotional regulation during stress
- Maintaining hope and optimism
- Problem-solving under pressure
- Learning and growing from setbacks
- Building strong support networks

## Building Blocks of Resilience

### 1. Develop Self-Awareness
- Recognize your emotions and triggers
- Understand your strengths and limitations
- Practice mindfulness and self-reflection
- Keep a journal to track patterns

### 2. Cultivate Optimism
- Focus on what you can control
- Reframe negative thoughts positively
- Practice gratitude daily
- Visualize positive outcomes

### 3. Build Strong Relationships
- Maintain connections with family and friends
- Seek support when needed
- Offer help to others
- Join communities with shared interests

### 4. Take Care of Yourself
- Prioritize physical health
- Get adequate sleep and exercise
- Eat nutritious foods
- Engage in activities you enjoy

### 5. Develop Problem-Solving Skills
- Break problems into manageable parts
- Brainstorm multiple solutions
- Learn from past experiences
- Stay flexible and adaptable

## Resilience in Action

When facing setbacks:
1. Allow yourself to feel the emotions
2. Seek perspective from trusted friends
3. Focus on what you can learn
4. Take small steps forward
5. Celebrate progress, no matter how small

Remember, building resilience is a journey, not a destination. Be patient with yourself as you develop these skills.`,
    type: 'guide',
    category: 'motivation',
    tags: ['resilience', 'mental-strength', 'personal-growth', 'coping-skills'],
    readTime: 10,
    difficulty: 'intermediate',
    isPublished: true
  },
  {
    title: 'Creating a Self-Care Routine That Works',
    description: 'Practical tips for developing and maintaining a personalized self-care routine.',
    content: `Self-care isn't selfish—it's essential for maintaining your mental, emotional, and physical well-being. A good self-care routine helps you recharge and face life's challenges with renewed energy.

## Understanding Self-Care

Self-care includes activities that:
- Reduce stress and promote relaxation
- Support your physical health
- Nurture your emotional well-being
- Align with your values and interests
- Are sustainable long-term

## Types of Self-Care

### Physical Self-Care
- Regular exercise or movement
- Adequate sleep (7-9 hours nightly)
- Nutritious meals and hydration
- Medical and dental check-ups
- Relaxation and rest

### Emotional Self-Care
- Journaling or expressive writing
- Therapy or counseling
- Practicing self-compassion
- Setting healthy boundaries
- Engaging in hobbies you love

### Social Self-Care
- Spending time with loved ones
- Building supportive relationships
- Participating in community activities
- Seeking help when needed
- Contributing to causes you care about

### Mental Self-Care
- Learning new skills
- Reading for pleasure
- Practicing mindfulness or meditation
- Limiting negative media consumption
- Engaging in creative activities

## Creating Your Routine

### Step 1: Assess Your Needs
- Identify areas of stress in your life
- Notice when you feel most depleted
- Consider what activities energize you
- Think about your available time and resources

### Step 2: Start Small
- Choose 2-3 activities to begin with
- Schedule them at realistic times
- Start with short durations (10-15 minutes)
- Be consistent rather than perfect

### Step 3: Make It Personal
- Choose activities you genuinely enjoy
- Consider your personality and preferences
- Adapt activities to fit your lifestyle
- Include both daily and weekly practices

### Step 4: Stay Flexible
- Adjust your routine as needed
- Try new activities periodically
- Don't judge yourself for missing days
- Focus on progress, not perfection

## Sample Daily Self-Care Routine

**Morning (10 minutes):**
- 5 minutes of deep breathing or meditation
- Write down 3 things you're grateful for

**Midday (5 minutes):**
- Take a short walk outside
- Eat lunch mindfully without distractions

**Evening (15 minutes):**
- Reflect on the day in a journal
- Do a relaxing activity (reading, bath, music)
- Prepare for restful sleep

Remember, self-care looks different for everyone. The key is finding what works for you and making it a consistent part of your life.`,
    type: 'guide',
    category: 'self-care',
    tags: ['self-care', 'wellness', 'routine', 'mental-health', 'lifestyle'],
    readTime: 12,
    difficulty: 'beginner',
    isPublished: true
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Resource.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const users = [];
    for (const userData of sampleUsers) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
      const user = new User(userData);
      await user.save();
      users.push(user);
      console.log(`Created user: ${user.name}`);
    }

    // Create resources (assign to admin user)
    const adminUser = users.find(u => u.role === 'admin');
    for (const resourceData of sampleResources) {
      resourceData.author = adminUser._id;
      const resource = new Resource(resourceData);
      await resource.save();
      console.log(`Created resource: ${resource.title}`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Sample Login Credentials:');
    console.log('Admin: admin@mindmitra.com / admin123');
    console.log('Counselor: sarah.johnson@mindmitra.com / counselor123');
    console.log('Student: john@student.edu / student123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeder
seedDatabase();
