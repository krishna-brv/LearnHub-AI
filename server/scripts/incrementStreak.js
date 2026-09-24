const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function updateStreaks() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/learnhub_ai');
  const users = await User.find({});
  for (const s of users) {
    if (!s.streak || s.streak.current < 1) {
      s.streak = { current: 1, longest: 1, lastActivityDate: new Date() };
      await s.save();
    } else {
      s.streak.current += 1;
      s.streak.longest = Math.max(s.streak.longest, s.streak.current);
      s.streak.lastActivityDate = new Date();
      await s.save();
    }
    console.log(`✅ Student ${s.email} streak incremented to: ${s.streak.current} Days!`);
  }
  process.exit(0);
}
updateStreaks();
