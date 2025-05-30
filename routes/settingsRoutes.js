
const express = require('express');
const SettingsController = require('../controllers/settingsController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/settings/app:
 *   get:
 *     summary: Get app settings (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: App settings retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.get('/app', adminAuth, SettingsController.getAppSettings);

/**
 * @swagger
 * /api/settings/app:
 *   put:
 *     summary: Update app settings (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appName:
 *                 type: string
 *               siteName:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *               contactPhone:
 *                 type: string
 *               currency:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: string
 *                   symbol:
 *                     type: string
 *               paymentGateways:
 *                 type: object
 *               smtpSettings:
 *                 type: object
 *               shopTiming:
 *                 type: object
 *     responses:
 *       200:
 *         description: App settings updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.put('/app', adminAuth, SettingsController.updateAppSettings);

/**
 * @swagger
 * /api/settings/app/home:
 *   put:
 *     summary: Update home page settings (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sections:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     products:
 *                       type: array
 *                       items:
 *                         type: string
 *               banners:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     images:
 *                       type: array
 *                     mobileUrl:
 *                       type: string
 *                     webUrl:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *     responses:
 *       200:
 *         description: Home page settings updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.put('/app/home', adminAuth, SettingsController.updateHomeSettings);

/**
 * @swagger
 * /api/settings/user:
 *   get:
 *     summary: Get user settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User settings retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/user', auth, SettingsController.getUserSettings);

/**
 * @swagger
 * /api/settings/user:
 *   put:
 *     summary: Update user settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notifications:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: object
 *                     properties:
 *                       orderUpdates:
 *                         type: boolean
 *                       promotions:
 *                         type: boolean
 *                       newsletter:
 *                         type: boolean
 *                   push:
 *                     type: object
 *                     properties:
 *                       orderUpdates:
 *                         type: boolean
 *                       promotions:
 *                         type: boolean
 *                       reminders:
 *                         type: boolean
 *                   sms:
 *                     type: object
 *                     properties:
 *                       orderUpdates:
 *                         type: boolean
 *                       promotions:
 *                         type: boolean
 *               privacy:
 *                 type: object
 *                 properties:
 *                   profileVisibility:
 *                     type: string
 *                     enum: [public, private]
 *                   dataSharing:
 *                     type: boolean
 *                   showOnlineStatus:
 *                     type: boolean
 *               preferences:
 *                 type: object
 *                 properties:
 *                   currency:
 *                     type: string
 *                   language:
 *                     type: string
 *                   theme:
 *                     type: string
 *                     enum: [light, dark, auto]
 *                   timezone:
 *                     type: string
 *               deliveryPreferences:
 *                 type: object
 *                 properties:
 *                   preferredTimeSlot:
 *                     type: string
 *                     enum: [morning, afternoon, evening, anytime]
 *                   specialInstructions:
 *                     type: string
 *     responses:
 *       200:
 *         description: User settings updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put('/user', auth, SettingsController.updateUserSettings);

/**
 * @swagger
 * /api/settings/user/notifications:
 *   put:
 *     summary: Update user notification settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: object
 *               push:
 *                 type: object
 *               sms:
 *                 type: object
 *     responses:
 *       200:
 *         description: Notification settings updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/user/notifications', auth, SettingsController.updateNotificationSettings);

/**
 * @swagger
 * /api/settings/user/privacy:
 *   put:
 *     summary: Update user privacy settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profileVisibility:
 *                 type: string
 *                 enum: [public, private]
 *               dataSharing:
 *                 type: boolean
 *               showOnlineStatus:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Privacy settings updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/user/privacy', auth, SettingsController.updatePrivacySettings);

module.exports = router;
