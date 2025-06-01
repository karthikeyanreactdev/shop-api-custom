
const CustomJson = require('../models/CustomJson');
const { customJsonSchema } = require('../validations/customJsonValidations');

class CustomJsonController {
  // Get all custom JSON templates
  static async getAllCustomJson(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const customJsons = await CustomJson.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await CustomJson.countDocuments();

      res.status(200).json({
        success: true,
        data: customJsons,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching custom JSON templates',
        error: error.message
      });
    }
  }

  // Get custom JSON template by ID
  static async getCustomJsonById(req, res) {
    try {
      const customJson = await CustomJson.findById(req.params.id);

      if (!customJson) {
        return res.status(404).json({
          success: false,
          message: 'Custom JSON template not found'
        });
      }

      res.status(200).json({
        success: true,
        data: customJson
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching custom JSON template',
        error: error.message
      });
    }
  }

  // Create new custom JSON template
  static async createCustomJson(req, res) {
    try {
      const { error } = customJsonSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const customJson = new CustomJson(req.body);
      await customJson.save();

      res.status(201).json({
        success: true,
        message: 'Custom JSON template created successfully',
        data: customJson
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating custom JSON template',
        error: error.message
      });
    }
  }

  // Update custom JSON template
  static async updateCustomJson(req, res) {
    try {
      // const { error } = customJsonSchema.validate(req.body);
      const { error } = customJsonSchema.validate(req.body, { stripUnknown: true });

      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const customJson = await CustomJson.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!customJson) {
        return res.status(404).json({
          success: false,
          message: 'Custom JSON template not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Custom JSON template updated successfully',
        data: customJson
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating custom JSON template',
        error: error.message
      });
    }
  }

  // Delete custom JSON template
  static async deleteCustomJson(req, res) {
    try {
      const customJson = await CustomJson.findByIdAndDelete(req.params.id);

      if (!customJson) {
        return res.status(404).json({
          success: false,
          message: 'Custom JSON template not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Custom JSON template deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting custom JSON template',
        error: error.message
      });
    }
  }
}

module.exports = CustomJsonController;
