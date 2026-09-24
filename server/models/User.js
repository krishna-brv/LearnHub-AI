/**
 * User Model
 * Central model for LearnHub AI users, handling authentication, profile data,
 * roles, gamification, and preferences.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Authentication
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters'],
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters'],
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain alphanumeric characters and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  role: {
    type: String,
    enum: {
      values: ['student', 'instructor', 'reviewer', 'mentor', 'admin'],
      message: '{VALUE} is not a supported role'
    },
    default: 'student'
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  authProvider: {
    type: String,
    enum: {
      values: ['local', 'google'],
      message: '{VALUE} is not a supported auth provider'
    },
    default: 'local'
  },

  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationOTP: {
    type: String,
    select: false
  },
  verificationOTPExpires: {
    type: Date,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  passwordChangedAt: {
    type: Date
  },
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },

  // Refresh Tokens
  refreshTokens: {
    type: [{
      token: String,
      device: String,
      ip: String,
      createdAt: Date,
      expiresAt: Date
    }],
    select: false
  },

  // Profile
  profile: {
    avatar: {
      type: String,
      default: '/default-avatar.png'
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    headline: {
      type: String,
      maxlength: [100, 'Headline cannot exceed 100 characters']
    },
    phone: String,
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: {
        values: ['male', 'female', 'other', 'prefer_not_to_say'],
        message: '{VALUE} is not a valid gender option'
      }
    },
    location: String,
    website: String,
    githubUrl: String,
    linkedinUrl: String,
    portfolioUrl: String
  },

  // Student-specific fields
  studentProfile: {
    skills: [String],
    interests: [String],
    careerGoal: String,
    currentLearningGoals: [String],
    education: [{
      institution: String,
      degree: String,
      field: String,
      startYear: Number,
      endYear: Number,
      current: Boolean
    }]
  },

  // Learning Preferences
  learningPreferences: {
    dailyStudyTime: {
      type: Number,
      default: 60
    },
    preferredLearningTime: {
      type: String,
      enum: {
        values: ['morning', 'afternoon', 'evening', 'night'],
        message: '{VALUE} is not a valid learning time'
      },
      default: 'evening'
    },
    difficultyPreference: {
      type: String,
      enum: {
        values: ['beginner', 'intermediate', 'advanced', 'mixed'],
        message: '{VALUE} is not a valid difficulty preference'
      },
      default: 'mixed'
    },
    targetCareer: String,
    targetCompletionDate: Date
  },

  // Gamification
  xp: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  streak: {
    current: {
      type: Number,
      default: 0
    },
    longest: {
      type: Number,
      default: 0
    },
    lastActivityDate: Date
  },

  // Instructor-specific
  instructorProfile: {
    specialization: [String],
    experience: String,
    courseCount: {
      type: Number,
      default: 0
    },
    totalStudents: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    }
  },

  // Portfolio settings
  portfolioSettings: {
    isPublic: {
      type: Boolean,
      default: true
    },
    showCourses: {
      type: Boolean,
      default: true
    },
    showCertificates: {
      type: Boolean,
      default: true
    },
    showSkills: {
      type: Boolean,
      default: true
    },
    showAchievements: {
      type: Boolean,
      default: true
    },
    projects: [{
      title: String,
      description: String,
      url: String,
      githubUrl: String,
      technologies: [String],
      image: String
    }]
  },

  // Notification preferences
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    inApp: {
      type: Boolean,
      default: true
    },
    courseUpdates: {
      type: Boolean,
      default: true
    },
    assignmentReminders: {
      type: Boolean,
      default: true
    },
    mentorMessages: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ role: 1 });
userSchema.index({ 'studentProfile.skills': 1 });

// Virtuals
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save hook
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  
  if (this.password) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

userSchema.methods.incrementLoginAttempts = async function() {
  // If lock expired, reset attempts
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }

  // Otherwise increment
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock the account if attempts > 5
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // lock for 2 hours
  }
  
  return this.updateOne(updates);
};

userSchema.methods.generateVerificationOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
  this.verificationOTP = otp;
  this.verificationOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return otp;
};

userSchema.methods.clearVerificationOTP = function() {
  this.verificationOTP = undefined;
  this.verificationOTPExpires = undefined;
};

userSchema.methods.recordDailyActivity = async function() {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  if (!this.streak || (this.streak.current || 0) < 1) {
    const cur = Math.max(1, (this.streak?.current || 0) + 1);
    this.streak = {
      current: cur,
      longest: Math.max(this.streak?.longest || 0, cur),
      lastActivityDate: now
    };
    await this.save();
    return;
  }

  let lastStr = null;
  if (this.streak.lastActivityDate) {
    lastStr = new Date(this.streak.lastActivityDate).toISOString().split('T')[0];
  }

  if (lastStr === todayStr) {
    return;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let currentStreak = this.streak.current || 0;
  let longestStreak = this.streak.longest || 0;

  if (lastStr === yesterdayStr) {
    currentStreak += 1;
  } else {
    currentStreak = 1;
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  this.streak = {
    current: currentStreak,
    longest: longestStreak,
    lastActivityDate: now
  };

  await this.save();
};

// Statics
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByUsername = function(username) {
  return this.findOne({ username: username.toLowerCase() });
};

module.exports = mongoose.model('User', userSchema);
