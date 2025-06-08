const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { UserSettings } = require("../models");
const { registerSchema, loginSchema } = require("../validations");
const { generateOtp, sendOtp } = require("../services/otpService");

class AuthController {
  // Generate JWT Token
  static generateToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
  }

  // Register user
  static async register(req, res) {
    try {
      const { error } = registerSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const { name, email, password, mobile, gender, referralCode } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists with this email",
        });
      }

      // Create user
      const user = await User.create({
        name,
        email,
        password,
        mobile,
        gender,
        referralCode,
      });

      // Create default user settings
      await UserSettings.create({
        userId: user._id,
      });

      const token = AuthController.generateToken(user._id);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            gender: user.gender,
            role: user.role,
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  static async loginCustomerMobile(req, res) {
    try {
      // Validate request body
      const { error, value } = loginCus.validate(req.body);

      if (error) {
        return res
          .status(400)
          .json(ApiResponse.fail("Validation error", error.details));
      }

      // Find user by mobile
      const user = await User.findOne({
        mobile: value.mobile,
        country_code: value.country_code,
      });

      if (!user) {
        const user = new User({
          name: "unknown_user",
          mobile: value.mobile,
          email: "unknown_user@mail.com",
          password: "",
          country_code: value.country_code,
          role: config.ROLES.CUSTOMER,
          isActive: true,
          isVerified: false,
        });

        // Generate and save OTP
        const otpCode = generateOtp();
        user.otp = {
          code: otpCode,
          expiresAt: new Date(Date.now() + config.OTP_EXPIRY * 60 * 1000), // OTP valid for configured minutes
        };

        // await user.save();

        // const otpCode = generateOtp();
        // user.otp = {
        //   code: "123456",
        //   expiresAt: new Date(Date.now() + config.OTP_EXPIRY * 60 * 1000),
        // };

        await user.save();
        await sendOtp(user.mobile, otpCode);

        return res.status(200).json(
          ApiResponse.success("OTP sent to your mobile number", {
            userId: user._id,
            mobile: user.mobile,
            country_code: user.country_code,
            otp: otpCode,
          })
        );
        // return res
        //   .status(404)
        //   .json(ApiResponse.fail("User not found with this mobile number"));
      }

      // Check if user is active
      if (!user.isActive) {
        return res
          .status(401)
          .json(
            ApiResponse.fail(
              "Your account has been deactivated. Please contact support."
            )
          );
      }

      // OTP-based login
      // Generate and send OTP
      if (user) {
        const otpCode = generateOtp();
        user.otp = {
          code: otpCode,
          expiresAt: new Date(Date.now() + config.OTP_EXPIRY * 60 * 1000),
        };

        await user.save();
        await sendOtp(user.mobile, otpCode);

        return res.status(200).json(
          ApiResponse.success("OTP sent to your mobile number", {
            userId: user._id,
            mobile: user.mobile,
            country_code: user.country_code,
            otp: otpCode,
          })
        );
      }
    } catch (error) {
      console.log("error", error);
      return res
        .status(500)
        .json(ApiResponse.error("Error during login", 500, null, error.stack));
    }
  }

  // Generate and send OTP
  static async sendOtp(req, res) {
    try {
      const { mobile, country_code } = req.body;

      if (!mobile) {
        return res
          .status(400)
          .json(ApiResponse.fail("Mobile number is required"));
      }

      // Find user by mobile
      const user = await User.findOne({ mobile, country_code });

      if (!user) {
        return res
          .status(404)
          .json(ApiResponse.fail("User not found with this mobile number"));
      }

      // Check if user is active
      if (!user.isActive) {
        return res
          .status(401)
          .json(
            ApiResponse.fail(
              "Your account has been deactivated. Please contact support."
            )
          );
      }

      // Generate and save OTP
      const otpCode = generateOtp();
      user.otp = {
        code: otpCode,
        expiresAt: new Date(Date.now() + config.OTP_EXPIRY * 60 * 1000),
      };

      await user.save();

      // Send OTP to user's mobile
      await sendOtp(user.mobile, otpCode);

      return res.status(200).json(
        ApiResponse.success("OTP sent successfully", {
          userId: user._id,
          mobile: user.mobile,
          country_code: user.country_code,
          otp: otpCode,
        })
      );
    } catch (error) {
      return res
        .status(500)
        .json(ApiResponse.error("Error sending OTP", 500, null, error.stack));
    }
  }

  // Login user
  static async login(req, res) {
    try {
      const { error } = loginSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const { email, password } = req.body;

      // Check if user exists
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Account is deactivated",
        });
      }

      const token = AuthController.generateToken(user._id);

      res.json({
        success: true,
        message: "Login successful",
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            gender: user.gender,
            role: user.role,
            profilePicture: user.profilePicture,
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  // Get current user
  static async getMe(req, res) {
    try {
      const user = await User.findById(req.user.id).populate("profilePicture");

      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            gender: user.gender,
            role: user.role,
            profilePicture: user.profilePicture,
            referralCode: user.referralCode,
            createdAt: user.createdAt,
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  // Change password
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password and new password are required",
        });
      }

      const user = await User.findById(req.user.id).select("+password");
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Check current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  // Forgot password
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found with this email",
        });
      }

      // Generate reset token
      const resetToken = user.generatePasswordResetToken();
      await user.save();

      // Here you would typically send an email with the reset token
      // For now, we'll just return it in the response (not recommended for production)
      res.json({
        success: true,
        message: "Password reset token generated",
        data: {
          resetToken, // In production, send this via email instead
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  // Reset password
  static async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Token and new password are required",
        });
      }

      const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Password reset token is invalid or has expired",
        });
      }

      // Set new password
      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      res.json({
        success: true,
        message: "Password reset successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }
}

module.exports = AuthController;
