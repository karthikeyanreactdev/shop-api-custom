
const express = require('express');
const CartController = require('../controllers/cartController');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get user cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth, CartController.getCart);

/**
 * @swagger
 * /api/cart/add:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - count
 *             properties:
 *               productId:
 *                 type: string
 *               count:
 *                 type: integer
 *                 minimum: 1
 *               customization:
 *                 type: object
 *                 properties:
 *                   selectedColor:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       hexCode:
 *                         type: string
 *                       price:
 *                         type: number
 *                   selectedSize:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                   designCustomizations:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         position:
 *                           type: string
 *                           enum: [front, back, left, right, top, bottom]
 *                         designAreaName:
 *                           type: string
 *                         customText:
 *                           type: string
 *                         price:
 *                           type: number
 *     responses:
 *       200:
 *         description: Item added to cart successfully
 *       400:
 *         description: Validation error or product not available
 *       401:
 *         description: Unauthorized
 */
router.post('/add', auth, CartController.addToCart);

/**
 * @swagger
 * /api/cart/items/{itemId}:
 *   put:
 *     summary: Update cart item
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               count:
 *                 type: integer
 *                 minimum: 1
 *               customization:
 *                 type: object
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 *       404:
 *         description: Cart or item not found
 *       401:
 *         description: Unauthorized
 */
router.put('/items/:itemId', auth, CartController.updateCartItem);

/**
 * @swagger
 * /api/cart/items/{itemId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed from cart successfully
 *       404:
 *         description: Cart or item not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/items/:itemId', auth, CartController.removeCartItem);

/**
 * @swagger
 * /api/cart/clear:
 *   delete:
 *     summary: Clear cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *       404:
 *         description: Cart not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/clear', auth, CartController.clearCart);

// Admin routes
/**
 * @swagger
 * /api/cart/admin/all:
 *   get:
 *     summary: Get all user carts (Admin only)
 *     tags: [Cart - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Carts retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.get('/admin/all', auth, CartController.getAllCarts);

/**
 * @swagger
 * /api/cart/admin/{userId}:
 *   get:
 *     summary: Get specific user cart (Admin only)
 *     tags: [Cart - Admin]
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
 *         description: Cart retrieved successfully
 *       404:
 *         description: User or cart not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.get('/admin/:userId', auth, CartController.getUserCartByAdmin);

/**
 * @swagger
 * /api/cart/admin/{userId}/clear:
 *   delete:
 *     summary: Clear user cart (Admin only)
 *     tags: [Cart - Admin]
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
 *         description: Cart cleared successfully
 *       404:
 *         description: User or cart not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.delete('/admin/:userId/clear', auth, CartController.clearUserCartByAdmin);

module.exports = router;
