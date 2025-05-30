
const { User, Address, Cart, Order, Product, Notification, Category } = require('../models');

class AdminController {
  // Get admin dashboard overview
  static async getDashboard(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin only.'
        });
      }

      const { page = 1, limit = 10, search } = req.query;

      // Build search filter
      const searchFilter = {};
      if (search) {
        searchFilter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      // Get overall statistics
      const [
        totalUsers,
        totalOrders,
        totalProducts,
        totalCategories,
        totalRevenue,
        recentOrders,
        topCustomers
      ] = await Promise.all([
        User.countDocuments({ role: 'customer' }),
        Order.countDocuments(),
        Product.countDocuments(),
        Category.countDocuments(),
        Order.aggregate([
          { $match: { paymentStatus: 'completed' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        Order.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('userId', 'name email')
          .select('orderNumber userId totalAmount orderStatus createdAt'),
        Order.aggregate([
          { $match: { paymentStatus: 'completed' } },
          { $group: { _id: '$userId', totalSpent: { $sum: '$totalAmount' }, orderCount: { $sum: 1 } } },
          { $sort: { totalSpent: -1 } },
          { $limit: 5 },
          { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
          { $unwind: '$user' }
        ])
      ]);

      // Get customers list with pagination
      const customers = await User.find({ role: 'customer', ...searchFilter })
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const totalCustomers = await User.countDocuments({ role: 'customer', ...searchFilter });

      // Get customer summary data
      const customersWithSummary = await Promise.all(
        customers.map(async (customer) => {
          const [addressCount, orderCount, cartItemCount, totalSpent] = await Promise.all([
            Address.countDocuments({ userId: customer._id }),
            Order.countDocuments({ userId: customer._id }),
            Cart.aggregate([
              { $match: { userId: customer._id } },
              { $project: { itemCount: { $size: '$items' } } }
            ]).then(result => result[0]?.itemCount || 0),
            Order.aggregate([
              { $match: { userId: customer._id, paymentStatus: 'completed' } },
              { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]).then(result => result[0]?.total || 0)
          ]);

          return {
            ...customer.toObject(),
            summary: {
              addressCount,
              orderCount,
              cartItemCount,
              totalSpent
            }
          };
        })
      );

      res.json({
        success: true,
        data: {
          overview: {
            totalUsers,
            totalOrders,
            totalProducts,
            totalCategories,
            totalRevenue: totalRevenue[0]?.total || 0
          },
          recentOrders,
          topCustomers,
          customers: {
            data: customersWithSummary,
            pagination: {
              page: parseInt(page),
              limit: parseInt(limit),
              total: totalCustomers,
              pages: Math.ceil(totalCustomers / limit)
            }
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

  // Get complete customer data
  static async getCompleteCustomerData(req, res) {
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
          message: 'Customer not found'
        });
      }

      // Get all customer data in parallel
      const [
        addresses,
        cart,
        orders,
        notifications,
        orderStats,
        recentActivity
      ] = await Promise.all([
        // Get all addresses
        Address.find({ userId }).sort({ createdAt: -1 }),

        // Get current cart
        Cart.findOne({ userId }).populate({
          path: 'items.productId',
          select: 'name images pricing category',
          populate: {
            path: 'category',
            select: 'name'
          }
        }),

        // Get all orders
        Order.find({ userId })
          .sort({ createdAt: -1 })
          .populate({
            path: 'items.productId',
            select: 'name images category',
            populate: {
              path: 'category',
              select: 'name'
            }
          }),

        // Get notifications
        Notification.find({ userId })
          .sort({ createdAt: -1 })
          .limit(10),

        // Get order statistics
        Order.aggregate([
          { $match: { userId: user._id } },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalSpent: { $sum: '$totalAmount' },
              averageOrderValue: { $avg: '$totalAmount' },
              completedOrders: {
                $sum: { $cond: [{ $eq: ['$orderStatus', 'delivered'] }, 1, 0] }
              },
              cancelledOrders: {
                $sum: { $cond: [{ $eq: ['$orderStatus', 'cancelled'] }, 1, 0] }
              }
            }
          }
        ]),

        // Get recent activity (orders and notifications)
        Order.find({ userId })
          .sort({ createdAt: -1 })
          .limit(5)
          .select('orderNumber orderStatus totalAmount createdAt')
      ]);

      // Calculate additional metrics
      const ordersByStatus = await Order.aggregate([
        { $match: { userId: user._id } },
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
      ]);

      const monthlyOrders = await Order.aggregate([
        { $match: { userId: user._id } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ]);

      // Get favorite categories
      const favoriteCategories = await Order.aggregate([
        { $match: { userId: user._id } },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.productId',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $lookup: {
            from: 'categories',
            localField: 'product.category',
            foreignField: '_id',
            as: 'category'
          }
        },
        { $unwind: '$category' },
        {
          $group: {
            _id: '$category._id',
            categoryName: { $first: '$category.name' },
            orderCount: { $sum: 1 },
            totalSpent: { $sum: '$items.priceBreakdown.totalAmount' }
          }
        },
        { $sort: { orderCount: -1 } },
        { $limit: 5 }
      ]);

      res.json({
        success: true,
        data: {
          customer: user,
          addresses,
          cart: cart || { items: [], totalAmount: 0 },
          orders,
          notifications,
          statistics: {
            ...orderStats[0] || {
              totalOrders: 0,
              totalSpent: 0,
              averageOrderValue: 0,
              completedOrders: 0,
              cancelledOrders: 0
            },
            ordersByStatus,
            monthlyOrders,
            favoriteCategories
          },
          recentActivity
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

module.exports = AdminController;
