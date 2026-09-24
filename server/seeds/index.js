const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const Category = require('../models/Category');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Assignment = require('../models/Assignment');
const Achievement = require('../models/Achievement');
const Skill = require('../models/Skill');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/learnhub_ai';
    await mongoose.connect(mongoUri);
    console.log('🌱 Connected to MongoDB for seeding...');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Course.deleteMany({}),
      Module.deleteMany({}),
      Lesson.deleteMany({}),
      Quiz.deleteMany({}),
      Question.deleteMany({}),
      Assignment.deleteMany({}),
      Achievement.deleteMany({}),
      Skill.deleteMany({})
    ]);

    console.log('🧹 Existing data cleared.');

    // 1. Create Admin, Reviewer & Default Student Users
    const admin = await User.create({
      firstName: 'System',
      lastName: 'Admin',
      username: 'admin',
      email: 'admin@learnhub.ai',
      password: 'password123',
      role: 'admin',
      isVerified: true,
      isActive: true,
      profile: { headline: 'Platform Administrator', avatar: '/default-avatar.png' }
    });

    const reviewer = await User.create({
      firstName: 'Curriculum',
      lastName: 'Reviewer',
      username: 'reviewer',
      email: 'reviewer@learnhub.ai',
      password: 'password123',
      role: 'reviewer',
      isVerified: true,
      isActive: true,
      profile: { headline: 'Curriculum & Content Acceptor', avatar: '/default-avatar.png' }
    });

    const student = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'student@learnhub.ai',
      password: 'password123',
      role: 'student',
      isVerified: true,
      isActive: true,
      xp: 0,
      level: 1,
      streak: { current: 1, longest: 1, lastActivityDate: new Date() },
      studentProfile: { careerGoal: 'Software Engineer', skills: ['JavaScript'] },
      profile: { headline: 'Learner', avatar: '/default-avatar.png' }
    });

    console.log('👤 Clean admin, reviewer, and student users created.');

    // 2. Create Categories
    const catWeb = await Category.create({
      name: 'Web Development',
      slug: 'web-development',
      description: 'Master HTML, CSS, JavaScript, React, Node.js, and Full-Stack MERN development.',
      icon: 'Code2',
      color: '#00A76F',
      order: 1
    });

    const catCS = await Category.create({
      name: 'Computer Science',
      slug: 'computer-science',
      description: 'Core CS fundamentals: Data Structures, Algorithms, DBMS, Operating Systems, Networks.',
      icon: 'Cpu',
      color: '#00B8D9',
      order: 2
    });

    console.log('📁 Categories created.');

    console.log('📚 Seed data initialized cleanly without hardcoded courses.');

    // 6. Create Seed Achievements
    await Achievement.create({
      name: 'First Steps',
      slug: 'first-steps',
      description: 'Completed your first course lesson on LearnHub AI.',
      icon: 'Rocket',
      category: 'learning',
      xpReward: 50,
      rarity: 'common'
    });

    await Achievement.create({
      name: 'Quiz Master',
      slug: 'quiz-master',
      description: 'Scored 100% on any course quiz.',
      icon: 'Trophy',
      category: 'quiz',
      xpReward: 100,
      rarity: 'rare'
    });

    // 7. Create Seed Skill Tree
    const skillJS = await Skill.create({
      name: 'JavaScript Fundamentals',
      slug: 'javascript-fundamentals',
      description: 'ES6+, closures, promises, async/await, prototypes.',
      category: 'Web Development',
      level: 0,
      color: '#00A76F',
      order: 1
    });

    await Skill.create({
      name: 'React 18 & Redux',
      slug: 'react-redux',
      description: 'Hooks, virtual DOM, JSX, Redux Toolkit, TanStack Query.',
      category: 'Web Development',
      parent: skillJS._id,
      level: 1,
      color: '#00B8D9',
      order: 2
    });

    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
};

seedData();
