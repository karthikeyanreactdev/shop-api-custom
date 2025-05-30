
const { Address } = require('../models');
const { addressSchema } = require('../validations');

class AddressController {
  // Get user addresses
  static async getUserAddresses(req, res) {
    try {
      const addresses = await Address.find({ userId: req.user.id })
        .sort({ isDefault: -1, createdAt: -1 });

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

  // Get address by ID
  static async getAddressById(req, res) {
    try {
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

      res.json({
        success: true,
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

  // Create new address
  static async createAddress(req, res) {
    try {
      const { error } = addressSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const addressData = {
        ...req.body,
        userId: req.user.id
      };

      // If this is the first address or marked as default, make it default
      const existingAddresses = await Address.countDocuments({ userId: req.user.id });
      if (existingAddresses === 0 || req.body.isDefault) {
        // Remove default from other addresses
        await Address.updateMany(
          { userId: req.user.id },
          { isDefault: false }
        );
        addressData.isDefault = true;
      }

      const address = await Address.create(addressData);

      res.status(201).json({
        success: true,
        message: 'Address created successfully',
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

      // If setting as default, remove default from other addresses
      if (req.body.isDefault) {
        await Address.updateMany(
          { userId: req.user.id, _id: { $ne: req.params.id } },
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

      await Address.findByIdAndDelete(req.params.id);

      // If this was the default address, set another one as default
      if (address.isDefault) {
        const nextAddress = await Address.findOne({ userId: req.user.id });
        if (nextAddress) {
          nextAddress.isDefault = true;
          await nextAddress.save();
        }
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

  // Set default address
  static async setDefaultAddress(req, res) {
    try {
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

      // Remove default from all addresses and set this one as default
      await Address.updateMany(
        { userId: req.user.id },
        { isDefault: false }
      );

      address.isDefault = true;
      await address.save();

      res.json({
        success: true,
        message: 'Default address updated successfully',
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

  // Get all addresses (Admin only)
  static async getAllAddresses(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin only.'
        });
      }

      const { page = 1, limit = 10, type } = req.query;

      const filter = {};
      if (type) filter.type = type;

      const addresses = await Address.find(filter)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Address.countDocuments(filter);

      res.json({
        success: true,
        data: {
          addresses,
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

  // Get user addresses (Admin only)
  static async getUserAddressesByAdmin(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin only.'
        });
      }

      const { userId } = req.params;

      const addresses = await Address.find({ userId })
        .populate('userId', 'name email');

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

  // Delete any address (Admin only)
  static async deleteAddressByAdmin(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin only.'
        });
      }

      const { addressId } = req.params;

      const address = await Address.findByIdAndDelete(addressId);

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

module.exports = AddressController;
