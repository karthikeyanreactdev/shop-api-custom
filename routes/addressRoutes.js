
const express = require('express');
const AddressController = require('../controllers/addressController');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/addresses:
 *   get:
 *     summary: Get user addresses
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Addresses retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth, AddressController.getUserAddresses);

/**
 * @swagger
 * /api/addresses/{id}:
 *   get:
 *     summary: Get address by ID
 *     tags: [Addresses]
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
 *         description: Address retrieved successfully
 *       404:
 *         description: Address not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', auth, AddressController.getAddressById);

/**
 * @swagger
 * /api/addresses:
 *   post:
 *     summary: Create new address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - address1
 *               - city
 *               - state
 *               - pincode
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [home, work, other, billing, shipping]
 *               address1:
 *                 type: string
 *               address2:
 *                 type: string
 *               landmark:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               pincode:
 *                 type: string
 *               country:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Address created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', auth, AddressController.createAddress);

/**
 * @swagger
 * /api/addresses/{id}:
 *   put:
 *     summary: Update address
 *     tags: [Addresses]
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [home, work, other, billing, shipping]
 *               address1:
 *                 type: string
 *               address2:
 *                 type: string
 *               landmark:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               pincode:
 *                 type: string
 *               country:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       404:
 *         description: Address not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', auth, AddressController.updateAddress);

/**
 * @swagger
 * /api/addresses/{id}:
 *   delete:
 *     summary: Delete address
 *     tags: [Addresses]
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
 *         description: Address deleted successfully
 *       404:
 *         description: Address not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', auth, AddressController.deleteAddress);

/**
 * @swagger
 * /api/addresses/{id}/default:
 *   put:
 *     summary: Set address as default
 *     tags: [Addresses]
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
 *         description: Default address updated successfully
 *       404:
 *         description: Address not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id/default', auth, AddressController.setDefaultAddress);

module.exports = router;
