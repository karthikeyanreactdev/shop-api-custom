
const { Cart, Product } = require('../models');
const { addToCartSchema } = require('../validations');

class CartController {
  // Get user cart
  static async getCart(req, res) {
    try {
      const cart = await Cart.findOne({ userId: req.user.id })
        .populate({
          path: 'items.productId',
          select: 'name images pricing stock isActive',
          populate: {
            path: 'categoryId',
            select: 'name'
          }
        });

      if (!cart) {
        return res.json({
          success: true,
          data: {
            cart: {
              items: [],
              totalAmount: 0
            }
          }
        });
      }

      res.json({
        success: true,
        data: { cart }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Add item to cart
  static async addToCart(req, res) {
    try {
      const { error } = addToCartSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const { productId, count, customization } = req.body;

      // Check if product exists and is active
      const product = await Product.findById(productId);
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Product not found or not available'
        });
      }

      // Check stock
      if (product.stock < count) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock'
        });
      }

      // Check min/max order quantity
      if (count < product.minOrderQuantity) {
        return res.status(400).json({
          success: false,
          message: `Minimum order quantity is ${product.minOrderQuantity}`
        });
      }

      if (product.maxOrderQuantity && count > product.maxOrderQuantity) {
        return res.status(400).json({
          success: false,
          message: `Maximum order quantity is ${product.maxOrderQuantity}`
        });
      }

      let cart = await Cart.findOne({ userId: req.user.id });

      if (!cart) {
        cart = new Cart({
          userId: req.user.id,
          items: []
        });
      }

      // Check if item already exists in cart
      const existingItemIndex = cart.items.findIndex(
        item => item.productId.toString() === productId.toString()
      );

      if (existingItemIndex > -1) {
        // Update existing item
        cart.items[existingItemIndex].count += count;
        cart.items[existingItemIndex].customization = customization || cart.items[existingItemIndex].customization;
      } else {
        // Add new item
        cart.items.push({
          productId,
          count,
          customization: customization || {}
        });
      }

      await cart.save();

      // Populate the cart before sending response
      await cart.populate({
        path: 'items.productId',
        select: 'name images pricing stock isActive'
      });

      res.json({
        success: true,
        message: 'Item added to cart successfully',
        data: { cart }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Update cart item
  static async updateCartItem(req, res) {
    try {
      const { count, customization } = req.body;
      const { itemId } = req.params;

      const cart = await Cart.findOne({ userId: req.user.id });

      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
      }

      const item = cart.items.id(itemId);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found in cart'
        });
      }

      // Check product availability and stock
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Product not found or not available'
        });
      }

      if (count !== undefined) {
        if (product.stock < count) {
          return res.status(400).json({
            success: false,
            message: 'Insufficient stock'
          });
        }

        if (count < product.minOrderQuantity) {
          return res.status(400).json({
            success: false,
            message: `Minimum order quantity is ${product.minOrderQuantity}`
          });
        }

        if (product.maxOrderQuantity && count > product.maxOrderQuantity) {
          return res.status(400).json({
            success: false,
            message: `Maximum order quantity is ${product.maxOrderQuantity}`
          });
        }

        item.count = count;
      }

      if (customization !== undefined) {
        item.customization = customization;
      }

      await cart.save();

      await cart.populate({
        path: 'items.productId',
        select: 'name images pricing stock isActive'
      });

      res.json({
        success: true,
        message: 'Cart item updated successfully',
        data: { cart }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Remove item from cart
  static async removeCartItem(req, res) {
    try {
      const { itemId } = req.params;

      const cart = await Cart.findOne({ userId: req.user.id });

      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
      }

      cart.items.id(itemId).remove();
      await cart.save();

      await cart.populate({
        path: 'items.productId',
        select: 'name images pricing stock isActive'
      });

      res.json({
        success: true,
        message: 'Item removed from cart successfully',
        data: { cart }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Clear cart
  static async clearCart(req, res) {
    try {
      const cart = await Cart.findOne({ userId: req.user.id });

      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
      }

      cart.items = [];
      cart.totalAmount = 0;
      await cart.save();

      res.json({
        success: true,
        message: 'Cart cleared successfully',
        data: { cart }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Get all user carts (Admin only)
  static async getAllCarts(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin only.'
        });
      }

      const { page = 1, limit = 10 } = req.query;

      const carts = await Cart.find()
        .populate('userId', 'name email')
        .populate('items.productId', 'name images pricing')
        .sort({ updatedAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Cart.countDocuments();

      res.json({
        success: true,
        data: {
          carts,
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

  // Get specific user cart (Admin only)
  static async getUserCartByAdmin(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin only.'
        });
      }

      const { userId } = req.params;

      const cart = await Cart.findOne({ userId })
        .populate('userId', 'name email')
        .populate('items.productId', 'name images pricing');

      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found for this user'
        });
      }

      res.json({
        success: true,
        data: { cart }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Clear user cart (Admin only)
  static async clearUserCartByAdmin(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin only.'
        });
      }

      const { userId } = req.params;

      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found for this user'
        });
      }

      cart.items = [];
      cart.totalAmount = 0;
      await cart.save();

      res.json({
        success: true,
        message: 'User cart cleared successfully'
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

module.exports = CartController;
