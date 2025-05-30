
const express = require('express');
const AdminController = require('../controllers/adminController');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard overview (Admin only)
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for customers list
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of customers per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search customers by name or email
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.get('/dashboard', auth, AdminController.getDashboard);

/**
 * @swagger
 * /api/admin/customer/{userId}/complete-data:
 *   get:
 *     summary: Get complete customer data with all details (Admin only)
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Complete customer data retrieved successfully
 *       404:
 *         description: Customer not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.get('/customer/:userId/complete-data', auth, AdminController.getCompleteCustomerData);

module.exports = router;
