
const { Order, Cart, Product, Notification } = require('../models');
const { createOrderSchema } = require('../validations');

class OrderController {
  // Get user orders
  static async getUserOrders(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        paymentStatus
      } = req.query;

      const filter = { userId: req.user.id };
      if (status) filter.orderStatus = status;
      if (paymentStatus) filter.paymentStatus = paymentStatus;

      const orders = await Order.find(filter)
        .populate('items.productId', 'name images')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Order.countDocuments(filter);

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

  // Get order by ID
  static async getOrderById(req, res) {
    try {
      const order = await Order.findOne({
        _id: req.params.id,
        userId: req.user.id
      }).populate('items.productId', 'name images sku brand');

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      res.json({
        success: true,
        data: { order }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Create order from cart
  static async createOrder(req, res) {
    try {
      const { error } = createOrderSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const {
        billingAddress,
        shippingAddress,
        paymentMethod,
        isScheduledDelivery,
        scheduledDateTime
      } = req.body;

      // Get user's cart
      const cart = await Cart.findOne({ userId: req.user.id })
        .populate('items.productId');

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cart is empty'
        });
      }

      // Verify all products are available and in stock
      for (const item of cart.items) {
        const product = await Product.findById(item.productId);
        if (!product || !product.isActive) {
          return res.status(400).json({
            success: false,
            message: `Product ${item.productId.name} is not available`
          });
        }

        if (product.stock < item.count) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name}`
          });
        }
      }

      // Prepare order items
      const orderItems = cart.items.map(item => ({
        productId: item.productId._id,
        productName: item.productId.name,
        productImages: item.productId.images,
        count: item.count,
        priceBreakdown: item.priceBreakdown,
        customization: item.customization
      }));

      // Calculate totals (simplified - you can add tax and shipping calculation here)
      const totalAmount = cart.totalAmount;
      const taxAmount = totalAmount * 0.18; // 18% tax
      const shippingAmount = totalAmount >= 500 ? 0 : 50; // Free shipping above 500
      const finalAmount = totalAmount + taxAmount + shippingAmount;

      // Create order
      const order = await Order.create({
        userId: req.user.id,
        items: orderItems,
        billingAddress,
        shippingAddress,
        paymentMethod,
        isScheduledDelivery,
        scheduledDateTime,
        totalAmount: finalAmount,
        taxAmount,
        shippingAmount
      });

      // Update product stock
      for (const item of cart.items) {
        await Product.findByIdAndUpdate(
          item.productId._id,
          { $inc: { stock: -item.count } }
        );
      }

      // Create notification
      await Notification.create({
        userId: req.user.id,
        title: 'Order Placed Successfully',
        message: `Your order ${order.orderNumber} has been placed successfully`,
        type: 'order',
        relatedOrderId: order._id
      });

      // Clear cart
      cart.items = [];
      cart.totalAmount = 0;
      await cart.save();

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: { order }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Cancel order
  static async cancelOrder(req, res) {
    try {
      const order = await Order.findOne({
        _id: req.params.id,
        userId: req.user.id
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      if (order.orderStatus !== 'placed' && order.orderStatus !== 'confirmed') {
        return res.status(400).json({
          success: false,
          message: 'Order cannot be cancelled at this stage'
        });
      }

      order.orderStatus = 'cancelled';
      order.updatedAt = Date.now();
      await order.save();

      // Restore product stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: item.count } }
        );
      }

      // Create notification
      await Notification.create({
        userId: req.user.id,
        title: 'Order Cancelled',
        message: `Your order ${order.orderNumber} has been cancelled`,
        type: 'order',
        relatedOrderId: order._id
      });

      res.json({
        success: true,
        message: 'Order cancelled successfully',
        data: { order }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Update order status (Admin only)
  static async updateOrderStatus(req, res) {
    try {
      const { orderStatus, paymentStatus, trackingNumber } = req.body;

      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      if (orderStatus) order.orderStatus = orderStatus;
      if (paymentStatus) order.paymentStatus = paymentStatus;
      if (trackingNumber) order.trackingNumber = trackingNumber;

      if (orderStatus === 'delivered') {
        order.deliveredAt = Date.now();
      }

      order.updatedAt = Date.now();
      await order.save();

      // Create notification for status update
      await Notification.create({
        userId: order.userId,
        title: 'Order Status Updated',
        message: `Your order ${order.orderNumber} status has been updated to ${orderStatus || order.orderStatus}`,
        type: 'order',
        relatedOrderId: order._id
      });

      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: { order }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Get all orders (Admin only)
  static async getAllOrders(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        paymentStatus,
        startDate,
        endDate
      } = req.query;

      const filter = {};
      if (status) filter.orderStatus = status;
      if (paymentStatus) filter.paymentStatus = paymentStatus;
      
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
      }

      const orders = await Order.find(filter)
        .populate('userId', 'name email')
        .populate('items.productId', 'name images sku brand')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Order.countDocuments(filter);

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
}

module.exports = OrderController;
