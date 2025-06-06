const Product = require("../models/Product");
const Category = require("../models/Category");
const mongoose = require("mongoose");
const { productSchema } = require("../validations");
const UploadService = require("../services/uploadService");

class ProductController {
  // Get all products
  static async getProducts(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        isActive,
        isFeatured,
        isCustomAllowed,
        minPrice,
        maxPrice,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const filter = {};
      if (category) filter.categoryId = category;
      if (isActive !== undefined) filter.isActive = isActive === "true";
      if (isFeatured !== undefined) filter.isFeatured = isFeatured === "true";
      if (isCustomAllowed !== undefined)
        filter.isCustomAllowed = isCustomAllowed === "true";

      // Price range filter
      if (minPrice || maxPrice) {
        filter["pricing.basePrice"] = {};
        if (minPrice) filter["pricing.basePrice"].$gte = parseFloat(minPrice);
        if (maxPrice) filter["pricing.basePrice"].$lte = parseFloat(maxPrice);
      }

      // Search filter
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { brand: { $regex: search, $options: "i" } },
          { tags: { $in: [new RegExp(search, "i")] } },
        ];
      }

      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

      const products = await Product.find(filter)
        .populate("categoryId", "name")
        .populate("customJsonId", "name")
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Product.countDocuments(filter);

      res.json({
        success: true,
        data: {
          products,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  // Get product by ID
  static async getProductById(req, res) {
    try {
      const productId = req.params.id;

      const productData = await Product.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(productId),
          },
        },
        // Populate categoryId
        {
          $lookup: {
            from: "categories",
            localField: "categoryId",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },

        // Populate customJsonId
        {
          $lookup: {
            from: "customjsons",
            localField: "customJsonId",
            foreignField: "_id",
            as: "customJson",
          },
        },
        { $unwind: { path: "$customJson", preserveNullAndEmptyArrays: true } },

        // Lookup for categoryTree.parentId
        {
          $lookup: {
            from: "categories",
            localField: "categoryTree.parentId",
            foreignField: "_id",
            as: "categoryTree_parent",
          },
        },
        {
          $unwind: {
            path: "$categoryTree_parent",
            preserveNullAndEmptyArrays: true,
          },
        },

        // Lookup for categoryTree.level1Id
        {
          $lookup: {
            from: "categories",
            localField: "categoryTree.level1Id",
            foreignField: "_id",
            as: "categoryTree_level1",
          },
        },
        {
          $unwind: {
            path: "$categoryTree_level1",
            preserveNullAndEmptyArrays: true,
          },
        },

        // Lookup for categoryTree.level2Id
        {
          $lookup: {
            from: "categories",
            localField: "categoryTree.level2Id",
            foreignField: "_id",
            as: "categoryTree_level2",
          },
        },
        {
          $unwind: {
            path: "$categoryTree_level2",
            preserveNullAndEmptyArrays: true,
          },
        },

        // Final projection
        {
          $project: {
            name: 1,
            sku: 1,
            brand: 1,
            materialType: 1,
            description: 1,
            tagLine: 1,
            pricing: 1,
            images: 1,
            categoryId: 1,
            customJsonId: 1,
            category: {
              name: "$category.name",
              parentId: "$category.parentId",
            },
            customJson: 1,
            isActive: 1,
            isCustomAllowed: 1,
            isFeatured: 1,
            stock: 1,
            minOrderQuantity: 1,
            maxOrderQuantity: 1,
            ratings: 1,
            tags: 1,
            specifications: 1,
            weight: 1,
            dimensions: 1,
            createdAt: 1,
            updatedAt: 1,
            categoryTree: {
              selectedId: "$categoryTree.selectedId",
              selectedCategory: "$categoryTree.selectedCategory",
              parentId: "$categoryTree.parentId",
              level1Id: "$categoryTree.level1Id",
              level2Id: "$categoryTree.level2Id",
              parentCategory: "$categoryTree_parent",
              level1Category: "$categoryTree_level1",
              level2Category: "$categoryTree_level2",
            },
          },
        },
      ]);

      if (!productData || productData.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.json({
        success: true,
        data: {
          product: productData[0],
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  // Create product
  static async createProduct(req, res) {
    try {
      const { error } = productSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      // Check if SKU already exists
      const existingProduct = await Product.findOne({ sku: req.body.sku });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: "Product with this SKU already exists",
        });
      }

      // Verify category exists
      const category = await Category.findById(req.body.categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: "Category not found",
        });
      }

      const product = await Product.create(req.body);

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: { product },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  // Update product
  static async updateProduct(req, res) {
    try {
      const { error } = productSchema.validate(req.body, { stripUnknown: true });
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      // Check if SKU already exists (excluding current product)
      if (req.body.sku) {
        const existingProduct = await Product.findOne({
          sku: req.body.sku,
          _id: { $ne: req.params.id },
        });
        if (existingProduct) {
          return res.status(400).json({
            success: false,
            message: "Product with this SKU already exists",
          });
        }
      }

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.json({
        success: true,
        message: "Product updated successfully",
        data: { product },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  // Delete product
  static async deleteProduct(req, res) {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Delete associated images from S3
      if (product.images && product.images.length > 0) {
        for (const image of product.images) {
          await UploadService.deleteFromS3(image.key);
        }
      }

      await Product.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  // Upload product images
  static async uploadProductImages(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files uploaded",
        });
      }

      const uploadResult = await UploadService.uploadMultipleToS3(
        req.files,
        "products"
      );

      if (!uploadResult.success) {
        return res.status(400).json({
          success: false,
          message: "Upload failed",
          errors: uploadResult.errors,
        });
      }

      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Add alt text and isPrimary flag to images
      const imagesWithAlt = uploadResult.data.map((image, index) => ({
        ...image,
        alt: req.body.alt ? req.body.alt[index] || product.name : product.name,
        isPrimary: index === 0 && product.images.length === 0,
      }));

      product.images.push(...imagesWithAlt);
      product.updatedAt = Date.now();
      await product.save();

      res.json({
        success: true,
        message: "Images uploaded successfully",
        data: { images: imagesWithAlt },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  // Calculate product price
  static async calculatePrice(req, res) {
    try {
      const { quantity = 1, designCustomizations = [] } = req.body;

      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      const pricing = product.calculatePrice(quantity, designCustomizations);

      res.json({
        success: true,
        data: { pricing },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }
}

module.exports = ProductController;
