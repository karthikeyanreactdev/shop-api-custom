
const jwt = require('jsonwebtoken');
const { User, UserSettings } = require('../models');
const { registerSchema, loginSchema } = require('../validations');

class AuthController {
  // Generate JWT Token
  static generateToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
  }

  // Register user
  static async register(req, res) {
    try {
      const { error } = registerSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const { name, email, password, mobile, gender, referralCode } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // Create user
      const user = await User.create({
        name,
        email,
        password,
        mobile,
        gender,
        referralCode
      });

      // Create default user settings
      await UserSettings.create({
        userId: user._id
      });

      const token = AuthController.generateToken(user._id);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            gender: user.gender,
            role: user.role
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      const { error } = loginSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const { email, password } = req.body;

      // Check if user exists
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      const token = AuthController.generateToken(user._id);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            gender: user.gender,
            role: user.role,
            profilePicture: user.profilePicture
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Get current user
  static async getMe(req, res) {
    try {
      const user = await User.findById(req.user.id).populate('profilePicture');
      
      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            gender: user.gender,
            role: user.role,
            profilePicture: user.profilePicture,
            referralCode: user.referralCode,
            createdAt: user.createdAt
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
}

module.exports = AuthController;
