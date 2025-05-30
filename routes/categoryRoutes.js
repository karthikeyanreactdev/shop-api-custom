
const express = require('express');
const CategoryController = require('../controllers/categoryController');
const { auth, adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
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
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *         description: Filter by featured status
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: string
 *         description: Filter by parent category
 *       - in: query
 *         name: level
 *         schema:
 *           type: integer
 *         description: Filter by category level
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get('/', CategoryController.getCategories);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *       404:
 *         description: Category not found
 */
router.get('/:id', CategoryController.getCategoryById);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create new category with images and icon (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               parentId:
 *                 type: string
 *               level:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *               isFeatured:
 *                 type: boolean
 *               sortOrder:
 *                 type: integer
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               icon:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.post('/', adminAuth, upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'icon', maxCount: 1 }
]), CategoryController.createCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update category with images and icon (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               parentId:
 *                 type: string
 *               level:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *               isFeatured:
 *                 type: boolean
 *               sortOrder:
 *                 type: integer
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               icon:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       404:
 *         description: Category not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.put('/:id', adminAuth, upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'icon', maxCount: 1 }
]), CategoryController.updateCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete category (Admin only)
 *     tags: [Categories]
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
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.delete('/:id', adminAuth, CategoryController.deleteCategory);



module.exports = router;
