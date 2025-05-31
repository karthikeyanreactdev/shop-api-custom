
const express = require('express');
const ProductController = require('../controllers/productController');
const { auth, adminAuth, vendorAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
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
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID
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
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.get('/', ProductController.getProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get('/:id', ProductController.getProductById);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create new product (Admin/Vendor only)
 *     tags: [Products]
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
 *               - sku
 *               - brand
 *               - materialType
 *               - description
 *               - pricing
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *               sku:
 *                 type: string
 *               brand:
 *                 type: string
 *               materialType:
 *                 type: string
 *               description:
 *                 type: string
 *               tagLine:
 *                 type: string
 *               pricing:
 *                 type: object
 *                 required:
 *                   - basePrice
 *                 properties:
 *                   basePrice:
 *                     type: number
 *                     minimum: 0
 *                   offerPrice:
 *                     type: number
 *                     minimum: 0
 *                   tierPricing:
 *                     type: array
 *                     items:
 *                       type: object
 *                       required:
 *                         - minQuantity
 *                         - discountType
 *                         - discountValue
 *                       properties:
 *                         minQuantity:
 *                           type: number
 *                           minimum: 1
 *                         maxQuantity:
 *                           type: number
 *                           minimum: 1
 *                         discountType:
 *                           type: string
 *                           enum: [percentage, fixed]
 *                         discountValue:
 *                           type: number
 *                           minimum: 0
 *                         isActive:
 *                           type: boolean
 *                           default: true
 *                   designAreaPricing:
 *                     type: array
 *                     items:
 *                       type: object
 *                       required:
 *                         - designAreaName
 *                         - position
 *                         - price
 *                       properties:
 *                         designAreaName:
 *                           type: string
 *                         position:
 *                           type: string
 *                           enum: [front, back, left, right, top, bottom]
 *                         price:
 *                           type: number
 *                           minimum: 0
 *                         isActive:
 *                           type: boolean
 *                           default: true
 *               categoryId:
 *                 type: string
 *               customJsonId:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *                 default: true
 *               isCustomAllowed:
 *                 type: boolean
 *                 default: false
 *               isFeatured:
 *                 type: boolean
 *                 default: false
 *               stock:
 *                 type: number
 *                 minimum: 0
 *                 default: 0
 *               minOrderQuantity:
 *                 type: number
 *                 minimum: 1
 *                 default: 1
 *               maxOrderQuantity:
 *                 type: number
 *                 minimum: 1
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               specifications:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     key:
 *                       type: string
 *                     value:
 *                       type: string
 *               weight:
 *                 type: object
 *                 properties:
 *                   value:
 *                     type: number
 *                   unit:
 *                     type: string
 *                     default: kg
 *               dimensions:
 *                 type: object
 *                 properties:
 *                   length:
 *                     type: number
 *                   width:
 *                     type: number
 *                   height:
 *                     type: number
 *                   unit:
 *                     type: string
 *                     default: cm
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation error or SKU already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.post('/', vendorAuth, ProductController.createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update product (Admin/Vendor only)
 *     tags: [Products]
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
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.put('/:id', vendorAuth, ProductController.updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product (Admin/Vendor only)
 *     tags: [Products]
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
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.delete('/:id', vendorAuth, ProductController.deleteProduct);

/**
 * @swagger
 * /api/products/{id}/images:
 *   post:
 *     summary: Upload product images (Admin/Vendor only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *       400:
 *         description: No files uploaded or upload failed
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.post('/:id/images', vendorAuth, upload.array('images', 10), ProductController.uploadProductImages);

/**
 * @swagger
 * /api/products/{id}/calculate-price:
 *   post:
 *     summary: Calculate product price based on quantity and customizations
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
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
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *               designCustomizations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     designAreaName:
 *                       type: string
 *                     position:
 *                       type: string
 *                       enum: [front, back, left, right, top, bottom]
 *     responses:
 *       200:
 *         description: Price calculated successfully
 *       404:
 *         description: Product not found
 */
router.post('/:id/calculate-price', ProductController.calculatePrice);

module.exports = router;
