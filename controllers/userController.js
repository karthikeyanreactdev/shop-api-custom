
const { User, Address } = require('../models');
const { updateUserSchema, addressSchema } = require('../validations');
const UploadService = require('../services/uploadService');

class UserController {
  // Update user profile
  static async updateProfile(req, res) {
    try {
      const { error } = updateUserSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { ...req.body, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );

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

      const uploadResult = await UploadService.uploadToS3(req.file, 'profile-pictures');
      
      if (!uploadResult.success) {
        return res.status(400).json({
          success: false,
          message: uploadResult.message
        });
      }

      // Delete old profile picture if exists
      const user = await User.findById(req.user.id);
      if (user.profilePicture && user.profilePicture.length > 0) {
        await UploadService.deleteFromS3(user.profilePicture[0].key);
      }

      // Update user with new profile picture
      user.profilePicture = [uploadResult.data];
      user.updatedAt = Date.now();
      await user.save();

      res.json({
        success: true,
        message: 'Profile picture uploaded successfully',
        data: { profilePicture: uploadResult.data }
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
      const addresses = await Address.find({ userId: req.user.id });
      
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
          { userId: req.user.id, type: req.body.type },
          { isDefault: false }
        );
      }

      const address = await Address.create({
        ...req.body,
        userId: req.user.id
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

      const address = await Address.findOne({
        _id: req.params.id,
        userId: req.user.id
      });

      if (!address) {
        return res.status(404).json({
          success: false,
          message: 'Address not found'
        });
      }

      // If this is set as default, remove default from other addresses
      if (req.body.isDefault) {
        await Address.updateMany(
          { userId: req.user.id, type: req.body.type, _id: { $ne: req.params.id } },
          { isDefault: false }
        );
      }

      Object.assign(address, req.body);
      address.updatedAt = Date.now();
      await address.save();

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
        userId: req.user.id
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
}

module.exports = UserController;
