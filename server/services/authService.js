const User = require('../models/User');
const AppError = require('../utils/AppError');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateOTP,
  generateRandomToken,
  hashToken
} = require('../utils/tokenUtils');
const { transporter } = require('../config/email');

class AuthService {
  /**
   * Register new user
   */
  async register(userData) {
    const { firstName, lastName, username, email, password, role } = userData;

    // Check if email or username already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw new AppError('An account with this email address already exists. Would you like to sign in instead?', 400, { code: 'ACCOUNT_EXISTS' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      throw new AppError('This username is already taken. Please choose another username or sign in.', 400, { code: 'USERNAME_TAKEN' });
    }

    // Generate 6-digit OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user document (Auto-verified for immediate seamless login)
    const user = await User.create({
      firstName,
      lastName,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      role: role || 'student',
      isVerified: true,
      isActive: true,
      verificationOTP: otp,
      verificationOTPExpires: otpExpires
    });

    // Send Verification Email (non-blocking in dev if email fails)
    try {
      if (process.env.NODE_ENV !== 'test') {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || 'no-reply@learnhub.ai',
          to: user.email,
          subject: 'LearnHub AI — Verify Your Email OTP',
          html: `
            <div style="font-family: 'Public Sans', sans-serif; padding: 20px; color: #212B36;">
              <h2 style="color: #00A76F;">Welcome to LearnHub AI!</h2>
              <p>Hi ${user.firstName},</p>
              <p>Thank you for registering. Please use the following 6-digit OTP code to verify your email address:</p>
              <div style="font-size: 28px; font-weight: bold; color: #00A76F; letter-spacing: 4px; margin: 20px 0;">
                ${otp}
              </div>
              <p>This code will expire in 10 minutes.</p>
            </div>
          `
        });
      }
    } catch (mailError) {
      console.warn('⚠️ Could not send verification email:', mailError.message);
    }

    // Hide sensitive fields in returned user object
    const userJson = user.toObject();
    delete userJson.password;
    delete userJson.verificationOTP;
    delete userJson.verificationOTPExpires;

    return {
      user: userJson,
      message: 'Registration successful! Please check your email for the OTP verification code.'
    };
  }

  /**
   * Verify Email OTP Code
   */
  async verifyEmailOTP(email, otp) {
    const user = await User.findOne({ email }).select('+verificationOTP +verificationOTPExpires');

    if (!user) {
      throw new AppError('User not found with this email address.', 404);
    }

    if (user.isVerified && user.isActive) {
      throw new AppError('Email is already verified. Please log in.', 400);
    }

    if (!user.verificationOTP || user.verificationOTP !== otp) {
      throw new AppError('Invalid OTP code. Please check and try again.', 400);
    }

    if (user.verificationOTPExpires < new Date()) {
      throw new AppError('OTP code has expired. Please request a new code.', 400);
    }

    // Activate and verify user
    user.isVerified = true;
    user.isActive = true;
    user.verificationOTP = undefined;
    user.verificationOTPExpires = undefined;
    await user.save();

    // Generate Tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token session
    await User.findByIdAndUpdate(user._id, {
      $push: {
        refreshTokens: {
          token: refreshToken,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const userJson = user.toObject();
    delete userJson.password;

    return {
      user: userJson,
      accessToken,
      refreshToken
    };
  }

  /**
   * Resend Verification OTP
   */
  async resendOTP(email) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('No account found with this email address.', 404);
    }

    if (user.isVerified) {
      throw new AppError('This account is already verified.', 400);
    }

    const otp = generateOTP();
    user.verificationOTP = otp;
    user.verificationOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'no-reply@learnhub.ai',
        to: user.email,
        subject: 'LearnHub AI — Resend Email Verification OTP',
        html: `<h3>Your new verification OTP code: <b>${otp}</b></h3>`
      });
    } catch (err) {
      console.warn('⚠️ Mail delivery failed:', err.message);
    }

    return { message: 'A new OTP code has been sent to your email.' };
  }

  /**
   * User Login
   */
  async login(emailOrUsername, password, device = 'Browser', ip = '127.0.0.1') {
    // Find user by email or username, select password field
    const user = await User.findOne({
      $or: [{ email: emailOrUsername.toLowerCase() }, { username: emailOrUsername.toLowerCase() }]
    }).select('+password +refreshTokens');

    if (!user) {
      throw new AppError('No account found with this email or username. Please create a new account to get started.', 404, { code: 'ACCOUNT_NOT_FOUND' });
    }

    // Check account lockout
    if (user.isLocked()) {
      throw new AppError('Account is temporarily locked due to failed login attempts. Please try again later.', 429);
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      throw new AppError('Incorrect password. Please check your password or try resetting it.', 401, { code: 'INCORRECT_PASSWORD' });
    }

    // Check if account is verified
    if (!user.isVerified) {
      throw new AppError('Please verify your email before logging in.', 403);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated.', 403);
    }

    // Reset login attempts & update last login date
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Keep max 5 active refresh tokens per user
    if (!user.refreshTokens) user.refreshTokens = [];
    if (user.refreshTokens.length >= 5) {
      user.refreshTokens.shift(); // remove oldest session
    }

    user.refreshTokens.push({
      token: refreshToken,
      device,
      ip,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    await user.save();

    const userJson = user.toObject();
    delete userJson.password;
    delete userJson.refreshTokens;

    return {
      user: userJson,
      accessToken,
      refreshToken
    };
  }

  /**
   * Refresh Access Token
   */
  async refreshAccessToken(incomingRefreshToken) {
    if (!incomingRefreshToken) {
      throw new AppError('Refresh token is required.', 400);
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(incomingRefreshToken);
    } catch (err) {
      throw new AppError('Invalid or expired refresh token.', 401);
    }

    const user = await User.findById(decoded.id).select('+refreshTokens');
    if (!user || !user.isActive) {
      throw new AppError('User not found or account deactivated.', 401);
    }

    // Verify refresh token exists in user's active session list
    const tokenExists = user.refreshTokens && user.refreshTokens.some((t) => t.token === incomingRefreshToken);
    if (!tokenExists) {
      throw new AppError('Refresh token has been revoked or expired.', 401);
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user);

    return {
      accessToken: newAccessToken
    };
  }

  /**
   * User Logout
   */
  async logout(userId, refreshToken) {
    if (refreshToken) {
      await User.findByIdAndUpdate(userId, {
        $pull: { refreshTokens: { token: refreshToken } }
      });
    }
    return { message: 'Logged out successfully.' };
  }

  /**
   * Forgot Password
   */
  async forgotPassword(email) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new AppError('No account found with that email address.', 404);
    }

    // Generate reset token
    const { rawToken, hashedToken, expiresAt } = generateRandomToken(15);
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = expiresAt;
    await user.save({ validateBeforeSave: false });

    // Send email
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/reset-password/${rawToken}`;

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'no-reply@learnhub.ai',
        to: user.email,
        subject: 'LearnHub AI — Password Reset Request',
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h3>Password Reset Request</h3>
            <p>You requested a password reset for LearnHub AI. Click the link below to reset your password:</p>
            <a href="${resetUrl}" style="background-color: #00A76F; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
            <p style="margin-top: 20px;">This link is valid for 15 minutes. If you did not request this, please ignore this email.</p>
          </div>
        `
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      throw new AppError('Could not send password reset email. Please try again later.', 500);
    }

    return { message: 'Password reset link sent to your email.' };
  }

  /**
   * Reset Password
   */
  async resetPassword(rawToken, newPassword) {
    const hashedToken = hashToken(rawToken);

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() }
    }).select('+password');

    if (!user) {
      throw new AppError('Password reset link is invalid or has expired.', 400);
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = new Date();
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return {
      message: 'Password reset successful! You are now logged in.',
      accessToken,
      refreshToken
    };
  }

  /**
   * Change Password (Authenticated)
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError('Current password is incorrect.', 400);
    }

    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    const accessToken = generateAccessToken(user);

    return {
      message: 'Password updated successfully.',
      accessToken
    };
  }
}

module.exports = new AuthService();
