
const express = require('express');
const CustomJsonController = require('../controllers/customJsonController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/custom-json:
 *   get:
 *     summary: Get all custom JSON templates
 *     tags: [CustomJson]
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
 *         description: Custom JSON templates retrieved successfully
 */
router.get('/', CustomJsonController.getAllCustomJson);

/**
 * @swagger
 * /api/custom-json/{id}:
 *   get:
 *     summary: Get custom JSON template by ID
 *     tags: [CustomJson]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Custom JSON template retrieved successfully
 *       404:
 *         description: Custom JSON template not found
 */
router.get('/:id', CustomJsonController.getCustomJsonById);

/**
 * @swagger
 * /api/custom-json:
 *   post:
 *     summary: Create new custom JSON template (Admin only)
 *     tags: [CustomJson]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               isFront:
 *                 type: boolean
 *               isBack:
 *                 type: boolean
 *               front:
 *                 type: object
 *               back:
 *                 type: object
 *     responses:
 *       201:
 *         description: Custom JSON template created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.post('/', adminAuth, CustomJsonController.createCustomJson);

/**
 * @swagger
 * /api/custom-json/{id}:
 *   put:
 *     summary: Update custom JSON template (Admin only)
 *     tags: [CustomJson]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Custom JSON template updated successfully
 *       404:
 *         description: Custom JSON template not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.put('/:id', adminAuth, CustomJsonController.updateCustomJson);

/**
 * @swagger
 * /api/custom-json/{id}:
 *   delete:
 *     summary: Delete custom JSON template (Admin only)
 *     tags: [CustomJson]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Custom JSON template deleted successfully
 *       404:
 *         description: Custom JSON template not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.delete('/:id', adminAuth, CustomJsonController.deleteCustomJson);

module.exports = router;
