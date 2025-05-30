const { User, Address } = require('../models');
const { updateProfileSchema, addressSchema } = require('../validations');
const UploadService = require('../services/uploadService');

class UserController {
  // Get user profile
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.userId)
        .populate('addresses')
        .select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const { error } = updateProfileSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const user = await User.findByIdAndUpdate(
        req.user.userId,
        { ...req.body, updatedAt: Date.now() },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Upload profile picture
  static async uploadProfilePicture(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Delete old profile picture if exists
      if (user.profilePicture && user.profilePicture.key) {
        await UploadService.deleteFromS3(user.profilePicture.key);
      }

      // Upload new profile picture
      const uploadResult = await UploadService.uploadToS3(req.file, 'users/profile-pictures');

      user.profilePicture = uploadResult;
      await user.save();

      res.json({
        success: true,
        message: 'Profile picture uploaded successfully',
        data: { profilePicture: uploadResult }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Get user addresses
  static async getAddresses(req, res) {
    try {
      const addresses = await Address.find({ userId: req.user.userId });

      res.json({
        success: true,
        data: { addresses }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Add new address
  static async addAddress(req, res) {
    try {
      const { error } = addressSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      // If this is set as default, remove default from other addresses
      if (req.body.isDefault) {
        await Address.updateMany(
          { userId: req.user.userId },
          { isDefault: false }
        );
      }

      const address = await Address.create({
        ...req.body,
        userId: req.user.userId
      });

      res.status(201).json({
        success: true,
        message: 'Address added successfully',
        data: { address }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Update address
  static async updateAddress(req, res) {
    try {
      const { error } = addressSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      // If this is set as default, remove default from other addresses
      if (req.body.isDefault) {
        await Address.updateMany(
          { userId: req.user.userId, _id: { $ne: req.params.id } },
          { isDefault: false }
        );
      }

      const address = await Address.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.userId },
        { ...req.body, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );

      if (!address) {
        return res.status(404).json({
          success: false,
          message: 'Address not found'
        });
      }

      res.json({
        success: true,
        message: 'Address updated successfully',
        data: { address }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Delete address
  static async deleteAddress(req, res) {
    try {
      const address = await Address.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.userId
      });

      if (!address) {
        return res.status(404).json({
          success: false,
          message: 'Address not found'
        });
      }

      res.json({
        success: true,
        message: 'Address deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Get all users (Admin only)
  static async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 10, role, isActive } = req.query;

      const filter = {};
      if (role) filter.role = role;
      if (isActive !== undefined) filter.isActive = isActive === 'true';

      const users = await User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await User.countDocuments(filter);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
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

module.exports = UserController;