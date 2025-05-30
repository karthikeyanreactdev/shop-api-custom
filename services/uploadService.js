
const { s3 } = require('../config/aws');
const { v4: uuidv4 } = require('uuid');

class UploadService {
  static async uploadToS3(file, folder = 'uploads') {
    try {
      const fileKey = `${folder}/${uuidv4()}-${file.originalname}`;
      
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read'
      };

      const result = await s3.upload(params).promise();
      
      return {
        success: true,
        data: {
          file_name: file.originalname,
          url: result.Location,
          key: result.Key
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  static async deleteFromS3(key) {
    try {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key
      };

      await s3.deleteObject(params).promise();
      
      return {
        success: true,
        message: 'File deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  static async uploadMultipleToS3(files, folder = 'uploads') {
    try {
      const uploadPromises = files.map(file => this.uploadToS3(file, folder));
      const results = await Promise.all(uploadPromises);
      
      const successfulUploads = results.filter(result => result.success);
      const failedUploads = results.filter(result => !result.success);
      
      return {
        success: failedUploads.length === 0,
        data: successfulUploads.map(result => result.data),
        errors: failedUploads.map(result => result.message)
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}

module.exports = UploadService;
