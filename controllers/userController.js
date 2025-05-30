const { User, Address, Cart, Order } = require('../models');
const { updateProfileSchema, addressSchema } = require('../validations');
const UploadService = require('../services/uploadService');

class UserController {
  // Get user profile
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id)
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
        req.user.id,
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

      const user = await User.findById(req.user.id);
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
          { userId: req.user.id },
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

      // If this is set as default, remove default from other addresses
      if (req.body.isDefault) {
        await Address.updateMany(
          { userId: req.user.id, _id: { $ne: req.params.id } },
          { isDefault: false }
        );
      }

      const address = await Address.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
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

  // Get all users (Admin only)
  static async getAllUsers(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin only.'
        });
      }

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

  // Get complete customer data (Admin only)
  static async getCustomerData(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin only.'
        });
      }

      const { userId } = req.params;

      // Get user details
      const user = await User.findById(userId).select('-password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get user addresses
      const addresses = await Address.find({ userId });

      // Get user cart
      const cart = await Cart.findOne({ userId }).populate({
        path: 'items.productId',
        select: 'name images pricing'
      });

      // Get user orders with pagination
      const orders = await Order.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate({
          path: 'items.productId',
          select: 'name images'
        });

      // Get order statistics
      const orderStats = await Order.aggregate([
        { $match: { userId: user._id } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: '$totalAmount' },
            averageOrderValue: { $avg: '$totalAmount' }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          user,
          addresses,
          cart: cart || { items: [], totalAmount: 0 },
          orders,
          orderStats: orderStats[0] || {
            totalOrders: 0,
            totalSpent: 0,
            averageOrderValue: 0
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

  // Get user addresses (Admin only)
  static async getUserAddresses(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin only.'
        });
      }

      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const addresses = await Address.find({ userId });

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

  // Get user cart (Admin only)
  static async getUserCart(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin only.'
        });
      }

      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const cart = await Cart.findOne({ userId }).populate({
        path: 'items.productId',
        select: 'name images pricing'
      });

      res.json({
        success: true,
        data: { cart: cart || { items: [], totalAmount: 0 } }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Get user orders (Admin only)
  static async getUserOrders(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin only.'
        });
      }

      const { userId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const orders = await Order.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate({
          path: 'items.productId',
          select: 'name images'
        });

      const total = await Order.countDocuments({ userId });

      res.json({
        success: true,
        data: {
          orders,
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

  // Toggle user active status (Admin only)
  static async toggleUserStatus(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin only.'
        });
      }

      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Don't allow deactivating other admins
      if (user.role === 'admin' && user._id.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Cannot modify admin user status'
        });
      }

      user.isActive = !user.isActive;
      await user.save();

      res.json({
        success: true,
        message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
        data: { 
          userId: user._id,
          isActive: user.isActive 
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