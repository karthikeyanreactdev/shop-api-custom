const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const AWS = require('aws-sdk');
require('dotenv').config();

const { connectDB } = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const addressRoutes = require('./routes/addressRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const customJsonRoutes = require('./routes/customJsonRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const fileRoutes = require('./routes/fileHandleRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-commerce API',
      version: '1.0.0',
      description: 'A comprehensive e-commerce API with custom product features',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        FileObject: {
          type: 'object',
          properties: {
            file_name: { type: 'string' },
            url: { type: 'string' },
            key: { type: 'string' },
            alt: { type: 'string' },
            isPrimary: { type: 'boolean' }
          }
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            mobile: { type: 'string' },
            gender: { type: 'string', enum: ['male', 'female', 'other'] },
            role: { type: 'string', enum: ['customer', 'admin', 'vendor'] },
            referralCode: { type: 'string' },
            profilePicture: { type: 'array', items: { $ref: '#/components/schemas/FileObject' } },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Address: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            type: { type: 'string', enum: ['billing', 'shipping'] },
            address1: { type: 'string' },
            address2: { type: 'string' },
            landmark: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            pincode: { type: 'string' },
            isDefault: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Category: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            parentId: { type: 'string' },
            level: { type: 'number' },
            isActive: { type: 'boolean' },
            isFeatured: { type: 'boolean' },
            sortOrder: { type: 'number' },
            image: { $ref: '#/components/schemas/FileObject' },
            metaTags: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                keywords: { type: 'string' }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        TierPricing: {
          type: 'object',
          properties: {
            minQuantity: { type: 'number' },
            maxQuantity: { type: 'number' },
            discountType: { type: 'string', enum: ['percentage', 'fixed'] },
            discountValue: { type: 'number' },
            isActive: { type: 'boolean' }
          }
        },
        DesignAreaPricing: {
          type: 'object',
          properties: {
            designAreaName: { type: 'string' },
            position: { type: 'string', enum: ['front', 'back', 'left', 'right', 'top', 'bottom'] },
            price: { type: 'number' },
            isActive: { type: 'boolean' }
          }
        },
        ProductPricing: {
          type: 'object',
          properties: {
            basePrice: { type: 'number' },
            offerPrice: { type: 'number' },
            tierPricing: { type: 'array', items: { $ref: '#/components/schemas/TierPricing' } },
            designAreaPricing: { type: 'array', items: { $ref: '#/components/schemas/DesignAreaPricing' } }
          }
        },
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            sku: { type: 'string' },
            brand: { type: 'string' },
            materialType: { type: 'string' },
            description: { type: 'string' },
            tagLine: { type: 'string' },
            pricing: { $ref: '#/components/schemas/ProductPricing' },
            images: { type: 'array', items: { $ref: '#/components/schemas/FileObject' } },
            categoryId: { type: 'string' },
            customJsonId: { type: 'string' },
            isActive: { type: 'boolean' },
            isCustomAllowed: { type: 'boolean' },
            isFeatured: { type: 'boolean' },
            stock: { type: 'number' },
            minOrderQuantity: { type: 'number' },
            maxOrderQuantity: { type: 'number' },
            ratings: {
              type: 'object',
              properties: {
                average: { type: 'number' },
                count: { type: 'number' }
              }
            },
            tags: { type: 'array', items: { type: 'string' } },
            specifications: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  key: { type: 'string' },
                  value: { type: 'string' }
                }
              }
            },
            weight: {
              type: 'object',
              properties: {
                value: { type: 'number' },
                unit: { type: 'string' }
              }
            },
            dimensions: {
              type: 'object',
              properties: {
                length: { type: 'number' },
                width: { type: 'number' },
                height: { type: 'number' },
                unit: { type: 'string' }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CustomJsonView: {
          type: 'object',
          properties: {
            designAreas: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  coordinates: {
                    type: 'object',
                    properties: {
                      x: { type: 'number' },
                      y: { type: 'number' },
                      width: { type: 'number' },
                      height: { type: 'number' },
                      label: { type: 'string' }
                    }
                  }
                }
              }
            },
            images: { type: 'array', items: { $ref: '#/components/schemas/FileObject' } },
            price: { type: 'number', default: 0 }
          }
        },
        CustomJson: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            isFront: { type: 'boolean' },
            isBack: { type: 'boolean' },
            isLeft: { type: 'boolean' },
            isRight: { type: 'boolean' },
            isTop: { type: 'boolean' },
            isBottom: { type: 'boolean' },
            views: {
              type: 'object',
              properties: {
                front: { $ref: '#/components/schemas/CustomJsonView' },
                back: { $ref: '#/components/schemas/CustomJsonView' },
                left: { $ref: '#/components/schemas/CustomJsonView' },
                right: { $ref: '#/components/schemas/CustomJsonView' },
                top: { $ref: '#/components/schemas/CustomJsonView' },
                bottom: { $ref: '#/components/schemas/CustomJsonView' }
              }
            },
            availableColors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  hexCode: { type: 'string' },
                  price: { type: 'number', default: 0 }
                }
              }
            },
            availableSizes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  price: { type: 'number', default: 0 }
                }
              }
            },
            isColorAvailable: { type: 'boolean' },
            isSizeAvailable: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            orderNumber: { type: 'string' },
            userId: { type: 'string' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'string' },
                  count: { type: 'number' },
                  customization: { $ref: '#/components/schemas/Customization' },
                  priceBreakdown: { $ref: '#/components/schemas/PriceBreakdown' }
                }
              }
            },
            billingAddress: {
              type: 'object',
              properties: {
                address1: { type: 'string' },
                address2: { type: 'string' },
                landmark: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                pincode: { type: 'string' }
              }
            },
            shippingAddress: {
              type: 'object',
              properties: {
                address1: { type: 'string' },
                address2: { type: 'string' },
                landmark: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                pincode: { type: 'string' }
              }
            },
            paymentMethod: { type: 'string', enum: ['card', 'upi', 'netbanking', 'cod', 'wallet'] },
            paymentStatus: { type: 'string', enum: ['pending', 'completed', 'failed', 'refunded'] },
            orderStatus: { type: 'string', enum: ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] },
            isScheduledDelivery: { type: 'boolean' },
            scheduledDateTime: { type: 'string', format: 'date-time' },
            totalAmount: { type: 'number' },
            taxAmount: { type: 'number' },
            shippingAmount: { type: 'number' },
            discountAmount: { type: 'number' },
            trackingNumber: { type: 'string' },
            estimatedDelivery: { type: 'string', format: 'date-time' },
            deliveredAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            message: { type: 'string' },
            type: { type: 'string', enum: ['order', 'payment', 'promotion', 'system', 'delivery'] },
            userId: { type: 'string' },
            isRead: { type: 'boolean' },
            relatedOrderId: { type: 'string' },
            broadcast: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            readAt: { type: 'string', format: 'date-time' }
          }
        },
        AppSettings: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            appName: { type: 'string' },
            siteName: { type: 'string' },
            contactEmail: { type: 'string' },
            siteEmail: { type: 'string' },
            contactPhone: { type: 'string' },
            sitePhone: { type: 'string' },
            address: { type: 'string' },
            socialLinks: {
              type: 'object',
              properties: {
                facebook: { type: 'string' },
                twitter: { type: 'string' },
                instagram: { type: 'string' },
                linkedin: { type: 'string' },
                youtube: { type: 'string' }
              }
            },
            aboutUs: { type: 'string' },
            termsAndConditions: { type: 'string' },
            privacyPolicy: { type: 'string' },
            currencyCode: { type: 'string' },
            currencySymbol: { type: 'string' },
            metaTags: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                keywords: { type: 'string' }
              }
            },
            defaultLanguage: { type: 'string' },
            emailNotifications: {
              type: 'object',
              properties: {
                orderConfirmation: { type: 'boolean' },
                orderStatusUpdate: { type: 'boolean' },
                orderShipped: { type: 'boolean' },
                orderDelivered: { type: 'boolean' },
                orderCancelled: { type: 'boolean' },
                newAccountCreated: { type: 'boolean' }
              }
            },
            shopTiming: {
              type: 'object',
              properties: {
                monday: {
                  type: 'object',
                  properties: {
                    isOpen: { type: 'boolean' },
                    openTime: { type: 'string' },
                    closeTime: { type: 'string' }
                  }
                },
                tuesday: {
                  type: 'object',
                  properties: {
                    isOpen: { type: 'boolean' },
                    openTime: { type: 'string' },
                    closeTime: { type: 'string' }
                  }
                },
                wednesday: {
                  type: 'object',
                  properties: {
                    isOpen: { type: 'boolean' },
                    openTime: { type: 'string' },
                    closeTime: { type: 'string' }
                  }
                },
                thursday: {
                  type: 'object',
                  properties: {
                    isOpen: { type: 'boolean' },
                    openTime: { type: 'string' },
                    closeTime: { type: 'string' }
                  }
                },
                friday: {
                  type: 'object',
                  properties: {
                    isOpen: { type: 'boolean' },
                    openTime: { type: 'string' },
                    closeTime: { type: 'string' }
                  }
                },
                saturday: {
                  type: 'object',
                  properties: {
                    isOpen: { type: 'boolean' },
                    openTime: { type: 'string' },
                    closeTime: { type: 'string' }
                  }
                },
                sunday: {
                  type: 'object',
                  properties: {
                    isOpen: { type: 'boolean' },
                    openTime: { type: 'string' },
                    closeTime: { type: 'string' }
                  }
                }
              }
            },
            maintenanceMode: { type: 'boolean' },
            paymentGateways: {
              type: 'object',
              properties: {
                cashOnDelivery: {
                  type: 'object',
                  properties: {
                    isActive: { type: 'boolean' }
                  }
                },
                razorpay: {
                  type: 'object',
                  properties: {
                    isActive: { type: 'boolean' },
                    keyId: { type: 'string' },
                    keySecret: { type: 'string' }
                  }
                }
              }
            },
            taxSettings: {
              type: 'object',
              properties: {
                enableTax: { type: 'boolean' },
                taxRate: { type: 'number' },
                taxName: { type: 'string' }
              }
            },
            deliverySettings: {
              type: 'object',
              properties: {
                enableScheduledDelivery: { type: 'boolean' },
                freeDeliveryMinOrder: { type: 'number' },
                deliveryCharges: { type: 'number' }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        UserSettings: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            notifications: {
              type: 'object',
              properties: {
                email: {
                  type: 'object',
                  properties: {
                    orderUpdates: { type: 'boolean' },
                    promotions: { type: 'boolean' },
                    newsletter: { type: 'boolean' }
                  }
                },
                push: {
                  type: 'object',
                  properties: {
                    orderUpdates: { type: 'boolean' },
                    promotions: { type: 'boolean' },
                    reminders: { type: 'boolean' }
                  }
                },
                sms: {
                  type: 'object',
                  properties: {
                    orderUpdates: { type: 'boolean' },
                    promotions: { type: 'boolean' }
                  }
                }
              }
            },
            privacy: {
              type: 'object',
              properties: {
                profileVisibility: { type: 'string', enum: ['private', 'public'] },
                dataSharing: { type: 'boolean' },
                showOnlineStatus: { type: 'boolean' }
              }
            },
            preferences: {
              type: 'object',
              properties: {
                currency: { type: 'string' },
                language: { type: 'string' },
                theme: { type: 'string', enum: ['light', 'dark', 'auto'] },
                timezone: { type: 'string' }
              }
            },
            deliveryPreferences: {
              type: 'object',
              properties: {
                preferredTimeSlot: { type: 'string', enum: ['morning', 'afternoon', 'evening', 'anytime'] },
                specialInstructions: { type: 'string' }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
            error: { type: 'string' }
          }
        },
        PaginationResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'array' },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number' },
                limit: { type: 'number' },
                total: { type: 'number' },
                pages: { type: 'number' }
              }
            }
          }
        }
      },
    },
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    message: 'Server is running successfully!',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/custom-json', customJsonRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/file', fileRoutes);

// Configure AWS (or use IAM roles/environment variables instead)
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

// GET /download?key=<file-key>
app.get('/download', (req, res) => {
  const { key } = req.query;

  if (!key) {
    return res.status(400).json({ error: 'Missing S3 key in query parameters.' });
  }

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key
  };

  s3.headObject(params, (err, metadata) => {
    if (err) {
      console.error('S3 metadata error:', err);
      return res.status(404).json({ error: 'File not found in S3.' });
    }

    // 👇 Add these headers for CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    res.setHeader('Content-Type', metadata.ContentType || 'image/png');

    const stream = s3.getObject(params).createReadStream();

    stream.on('error', (err) => {
      console.error('S3 stream error:', err);
      res.status(500).json({ error: 'Error streaming file from S3.' });
    });

    stream.pipe(res);
  });
});

// Swagger API Documentation at root
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});




app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
});

module.exports = app;