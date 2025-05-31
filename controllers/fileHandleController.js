const aws = require("aws-sdk");
const { ApiResponse } = require("../utils/apiResponse");
require("dotenv").config();
const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION, // e.g., 'us-east-1'
  });

exports.uploadFile = async (req, res) => {
  try {
    console.log("req", req.file);

    const params = req.file;

    const param = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `multi-vendor-public/${Date.now()}-${params.originalname}`,
      Body: params.buffer,
      ContentType: params.mimetype,
    };

    const uploadResult = await s3.upload(param).promise();

    const result = {
      file_name: params.originalname,
      url: uploadResult.Location,
      key: uploadResult.Key, // use "Key" not "key" for consistency with AWS response
    };

    return res
      .status(200)
      .json(ApiResponse.success("File successfully uploaded", result));
  } catch (error) {
    console.error("File upload error:", error);

    return res
      .status(500)
      .json(ApiResponse.error("File upload failed", error.message));
  }
};

exports.deleteFile = async (req, res) => {
    // return res.send(req.body)
  try {
    const param = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `${req.body.key}`,
    };

    const data = await s3.deleteObject(param).promise();

    const result = {
      message: "File successfully deleted",
    };

    return res
      .status(200)
      .json(ApiResponse.success("File deletion successful", result));
  } catch (error) {
    console.error("File deletion error:", error);

    return res
      .status(500)
      .json(ApiResponse.error("File deletion failed", error.message));
  }
};
