
const { AppSettings, UserSettings } = require('../models');

class SettingsController {
  // Get app settings (Admin only)
  static async getAppSettings(req, res) {
    try {
      let settings = await AppSettings.findOne();
      
      if (!settings) {
        // Create default settings if none exist
        settings = await AppSettings.create({});
      }

      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Update app settings (Admin only)
  static async updateAppSettings(req, res) {
    try {
      let settings = await AppSettings.findOne();

      if (!settings) {
        settings = await AppSettings.create(req.body);
      } else {
        settings = await AppSettings.findOneAndUpdate(
          {},
          { ...req.body, updatedAt: new Date() },
          { new: true, runValidators: true }
        );
      }

      res.json({
        success: true,
        message: 'App settings updated successfully',
        data: settings
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Update home page settings (Admin only)
  static async updateHomeSettings(req, res) {
    try {
      const { sections, banners } = req.body;

      let settings = await AppSettings.findOne();
      if (!settings) {
        settings = await AppSettings.create({});
      }

      const updateData = {};
      if (sections !== undefined) {
        updateData['home.sections'] = sections;
      }
      if (banners !== undefined) {
        updateData['home.banners'] = banners;
      }
      updateData.updatedAt = new Date();

      settings = await AppSettings.findOneAndUpdate(
        {},
        updateData,
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: 'Home page settings updated successfully',
        data: settings.home
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Get user settings
  static async getUserSettings(req, res) {
    try {
      let settings = await UserSettings.findOne({ userId: req.user.id });

      if (!settings) {
        // Create default user settings if none exist
        settings = await UserSettings.create({ userId: req.user.id });
      }

      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Update user settings
  static async updateUserSettings(req, res) {
    try {
      let settings = await UserSettings.findOne({ userId: req.user.id });

      if (!settings) {
        settings = await UserSettings.create({
          userId: req.user.id,
          ...req.body
        });
      } else {
        settings = await UserSettings.findOneAndUpdate(
          { userId: req.user.id },
          { ...req.body, updatedAt: new Date() },
          { new: true, runValidators: true }
        );
      }

      res.json({
        success: true,
        message: 'User settings updated successfully',
        data: settings
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Update notification settings
  static async updateNotificationSettings(req, res) {
    try {
      let settings = await UserSettings.findOne({ userId: req.user.id });

      if (!settings) {
        settings = await UserSettings.create({
          userId: req.user.id,
          notifications: req.body
        });
      } else {
        settings = await UserSettings.findOneAndUpdate(
          { userId: req.user.id },
          { 
            notifications: { ...settings.notifications.toObject(), ...req.body },
            updatedAt: new Date()
          },
          { new: true, runValidators: true }
        );
      }

      res.json({
        success: true,
        message: 'Notification settings updated successfully',
        data: settings.notifications
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Update privacy settings
  static async updatePrivacySettings(req, res) {
    try {
      let settings = await UserSettings.findOne({ userId: req.user.id });

      if (!settings) {
        settings = await UserSettings.create({
          userId: req.user.id,
          privacy: req.body
        });
      } else {
        settings = await UserSettings.findOneAndUpdate(
          { userId: req.user.id },
          { 
            privacy: { ...settings.privacy.toObject(), ...req.body },
            updatedAt: new Date()
          },
          { new: true, runValidators: true }
        );
      }

      res.json({
        success: true,
        message: 'Privacy settings updated successfully',
        data: settings.privacy
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
}

module.exports = SettingsController;
