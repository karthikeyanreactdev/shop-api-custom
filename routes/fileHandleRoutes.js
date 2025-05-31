/**
 * File Handle routes
 * @swagger
 * tags:
 *   name: file handle
 *   description: API endpoints for managing file handle
 */

const express = require("express");
const multer = require("multer");

const router = express.Router({ mergeParams: true });
const fileHandleController = require("../controllers/fileHandleController");

// Multer Configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
/**
 * @swagger
 * /api/file/upload:
 *   post:
 *     summary: Upload a file to S3
 *     description: Uploads a single file to the S3 bucket using multipart/form-data.
 *     tags: [file handle]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: File successfully uploaded
 *                 data:
 *                   type: object
 *                   properties:
 *                     file_name:
 *                       type: string
 *                       example: Screenshot 2024-05-13 003251.png
 *                     url:
 *                       type: string
 *                       example: https://multivendors3.s3.eu-north-1.amazonaws.com/multi-vendor-public/1744730520779-Screenshot%202024-05-13%20003251.png
 *                     key:
 *                       type: string
 *                       example: multi-vendor-public/1744730520779-Screenshot 2024-05-13 003251.png
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-04-15T15:22:01.813Z
 */

router.post("/upload", upload.single("file"), fileHandleController.uploadFile);

/**
 * @swagger
 * /file/delete:
 *   delete:
 *     summary: Delete a file from S3
 *     description: Deletes a file from the S3 bucket using the file key.
 *     tags: [file handle]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *             properties:
 *               key:
 *                 type: string
 *                 description: The S3 object key to delete
 *                 example: multi-vendor-public/1744730520779-Screenshot 2024-05-13 003251.png
 *     responses:
 *       200:
 *         description: File deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: File deletion successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: File successfully deleted
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-04-15T15:22:42.151Z
 */

router.delete("/delete", fileHandleController.deleteFile);

module.exports = router;
