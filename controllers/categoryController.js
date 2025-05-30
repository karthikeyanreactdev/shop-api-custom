
const { Category } = require('../models');
const { categorySchema } = require('../validations');
const UploadService = require('../services/uploadService');

class CategoryController {
  // Get all categories
  static async getCategories(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        isActive, 
        isFeatured, 
        parentId, 
        level 
      } = req.query;

      const filter = {};
      if (isActive !== undefined) filter.isActive = isActive === 'true';
      if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
      if (parentId !== undefined) filter.parentId = parentId === 'null' ? null : parentId;
      if (level !== undefined) filter.level = parseInt(level);

      const categories = await Category.find(filter)
        .populate('parentId', 'name')
        .sort({ sortOrder: 1, name: 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Category.countDocuments(filter);

      res.json({
        success: true,
        data: {
          categories,
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

  // Get category by ID
  static async getCategoryById(req, res) {
    try {
      const category = await Category.findById(req.params.id)
        .populate('parentId', 'name')
        .populate('subcategories');

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      res.json({
        success: true,
        data: { category }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Create category
  static async createCategory(req, res) {
    try {
      const { error } = categorySchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const category = await Category.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: { category }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Update category
  static async updateCategory(req, res) {
    try {
      const { error } = categorySchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const category = await Category.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      res.json({
        success: true,
        message: 'Category updated successfully',
        data: { category }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Delete category
  static async deleteCategory(req, res) {
    try {
      const category = await Category.findById(req.params.id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      // Check if category has subcategories
      const subcategories = await Category.find({ parentId: req.params.id });
      if (subcategories.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete category that has subcategories'
        });
      }

      // Delete associated images from S3
      if (category.images && category.images.length > 0) {
        for (const image of category.images) {
          await UploadService.deleteFromS3(image.key);
        }
      }

      if (category.icon && category.icon.key) {
        await UploadService.deleteFromS3(category.icon.key);
      }

      await Category.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Upload category images
  static async uploadCategoryImages(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      const uploadResult = await UploadService.uploadMultipleToS3(req.files, 'categories');
      
      if (!uploadResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Upload failed',
          errors: uploadResult.errors
        });
      }

      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      // Add alt text and isPrimary flag to images
      const imagesWithAlt = uploadResult.data.map((image, index) => ({
        ...image,
        alt: req.body.alt ? req.body.alt[index] || category.name : category.name,
        isPrimary: index === 0 && category.images.length === 0
      }));

      category.images.push(...imagesWithAlt);
      category.updatedAt = Date.now();
      await category.save();

      res.json({
        success: true,
        message: 'Images uploaded successfully',
        data: { images: imagesWithAlt }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Upload category icon
  static async uploadCategoryIcon(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const uploadResult = await UploadService.uploadToS3(req.file, 'category-icons');
      
      if (!uploadResult.success) {
        return res.status(400).json({
          success: false,
          message: uploadResult.message
        });
      }

      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      // Delete old icon if exists
      if (category.icon && category.icon.key) {
        await UploadService.deleteFromS3(category.icon.key);
      }

      category.icon = uploadResult.data;
      category.updatedAt = Date.now();
      await category.save();

      res.json({
        success: true,
        message: 'Icon uploaded successfully',
        data: { icon: uploadResult.data }
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

module.exports = CategoryController;
