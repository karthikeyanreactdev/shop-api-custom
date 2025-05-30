
# E-Commerce API Documentation

## Base URL
```
Development: http://localhost:5000
Production: https://your-replit-app-name.replit.app
```

## Authentication
All protected routes require Bearer token in headers:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All API responses follow this structure:
```json
{
  "success": true|false,
  "message": "Response message",
  "data": {}, // Response data
  "error": "Error message" // Only on errors
}
```

---

## 1. AUTH ENDPOINTS

### POST /api/auth/register
Register a new user
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "mobile": "1234567890",
  "gender": "male|female|other",
  "referralCode": "REF123" // optional
}
```

### POST /api/auth/login
Login user
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### GET /api/auth/me
Get current user (Protected)

### PUT /api/auth/change-password
Change password (Protected)
```json
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass123"
}
```

### POST /api/auth/forgot-password
Request password reset
```json
{
  "email": "john@example.com"
}
```

### POST /api/auth/reset-password
Reset password with token
```json
{
  "token": "reset-token",
  "newPassword": "newpass123"
}
```

---

## 2. USER ENDPOINTS

### GET /api/users/profile
Get user profile (Protected)

### PUT /api/users/profile
Update user profile (Protected)
```json
{
  "name": "Updated Name",
  "mobile": "9876543210",
  "gender": "male|female|other"
}
```

---

## 3. ADDRESS ENDPOINTS

### GET /api/addresses
Get user addresses (Protected)

### POST /api/addresses
Create new address (Protected)
```json
{
  "type": "billing|shipping",
  "address1": "123 Main Street",
  "address2": "Apt 4B",
  "landmark": "Near Mall",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "isDefault": false
}
```

### PUT /api/addresses/:id
Update address (Protected)

### DELETE /api/addresses/:id
Delete address (Protected)

---

## 4. CATEGORY ENDPOINTS

### GET /api/categories
Get all categories
Query params: `page`, `limit`, `isActive`, `parentId`, `level`

### GET /api/categories/:id
Get category by ID

### POST /api/categories
Create category (Admin only)
```json
{
  "name": "Electronics",
  "description": "Electronic items",
  "parentId": null,
  "level": 0,
  "isActive": true,
  "isFeatured": false,
  "sortOrder": 0,
  "metaTags": {
    "title": "Electronics",
    "description": "Buy electronics",
    "keywords": "electronics, gadgets"
  }
}
```

---

## 5. PRODUCT ENDPOINTS

### GET /api/products
Get all products
Query params: `page`, `limit`, `category`, `isActive`, `isFeatured`, `minPrice`, `maxPrice`, `search`, `sortBy`, `sortOrder`

### GET /api/products/:id
Get product by ID

### POST /api/products
Create product (Admin/Vendor only)
```json
{
  "name": "Custom T-Shirt",
  "sku": "TSH001",
  "brand": "CustomWear",
  "materialType": "Cotton",
  "description": "High quality custom t-shirt",
  "tagLine": "Wear your style",
  "pricing": {
    "basePrice": 299,
    "offerPrice": 249,
    "tierPricing": [
      {
        "minQuantity": 10,
        "maxQuantity": 50,
        "discountType": "percentage",
        "discountValue": 10,
        "isActive": true
      }
    ],
    "designAreaPricing": [
      {
        "designAreaName": "Front Logo",
        "position": "front",
        "price": 50,
        "isActive": true
      }
    ]
  },
  "categoryId": "category_id_here",
  "customJsonId": "custom_json_id_here",
  "isCustomAllowed": true,
  "stock": 100,
  "minOrderQuantity": 1,
  "maxOrderQuantity": 500,
  "specifications": [
    {
      "key": "Material",
      "value": "100% Cotton"
    }
  ],
  "weight": {
    "value": 0.2,
    "unit": "kg"
  },
  "dimensions": {
    "length": 30,
    "width": 20,
    "height": 1,
    "unit": "cm"
  }
}
```

---

## 6. CUSTOM JSON ENDPOINTS

### GET /api/custom-json
Get all custom JSON configurations
Query params: `page`, `limit`

### GET /api/custom-json/:id
Get custom JSON by ID

### POST /api/custom-json
Create custom JSON configuration (Admin only)
```json
{
  "name": "T-Shirt Template",
  "isFront": true,
  "isBack": true,
  "isLeft": false,
  "isRight": false,
  "isTop": false,
  "isBottom": false,
  "views": {
    "front": {
      "designAreas": [
        {
          "coordinates": {
            "x": 100,
            "y": 100,
            "width": 200,
            "height": 150,
            "label": "Front Logo Area"
          }
        }
      ],
      "images": [
        {
          "file_name": "front_template.png",
          "url": "https://example.com/front.png",
          "key": "front_key"
        }
      ],
      "price": 0
    },
    "back": {
      "designAreas": [
        {
          "coordinates": {
            "x": 100,
            "y": 100,
            "width": 200,
            "height": 150,
            "label": "Back Design Area"
          }
        }
      ],
      "images": [
        {
          "file_name": "back_template.png",
          "url": "https://example.com/back.png",
          "key": "back_key"
        }
      ],
      "price": 0
    }
  },
  "availableColors": [
    {
      "name": "Red",
      "hexCode": "#FF0000",
      "price": 0
    },
    {
      "name": "Blue",
      "hexCode": "#0000FF",
      "price": 10
    }
  ],
  "availableSizes": [
    {
      "name": "S",
      "price": 0
    },
    {
      "name": "M",
      "price": 0
    },
    {
      "name": "L",
      "price": 20
    },
    {
      "name": "XL",
      "price": 40
    }
  ],
  "isColorAvailable": true,
  "isSizeAvailable": true
}
```

---

## 7. CART ENDPOINTS

### GET /api/cart
Get user cart (Protected)

### POST /api/cart/add
Add item to cart (Protected)
```json
{
  "productId": "product_id_here",
  "count": 2,
  "customization": {
    "selectedColor": {
      "name": "Red",
      "hexCode": "#FF0000",
      "price": 0
    },
    "selectedSize": {
      "name": "L",
      "price": 20
    },
    "designCustomizations": [
      {
        "position": "front",
        "designAreaName": "Front Logo",
        "customText": "My Custom Text",
        "price": 50
      }
    ]
  }
}
```

### PUT /api/cart/update/:itemId
Update cart item (Protected)
```json
{
  "count": 3
}
```

### DELETE /api/cart/remove/:itemId
Remove item from cart (Protected)

### DELETE /api/cart/clear
Clear entire cart (Protected)

---

## 8. ORDER ENDPOINTS

### GET /api/orders
Get user orders (Protected)
Query params: `page`, `limit`, `status`

### GET /api/orders/:id
Get order by ID (Protected)

### POST /api/orders
Create new order (Protected)
```json
{
  "items": [
    {
      "productId": "product_id_here",
      "count": 2,
      "customization": {
        "selectedColor": {
          "name": "Red",
          "hexCode": "#FF0000",
          "price": 0
        },
        "selectedSize": {
          "name": "L",
          "price": 20
        },
        "designCustomizations": [
          {
            "position": "front",
            "designAreaName": "Front Logo",
            "customText": "Custom Text",
            "price": 50
          }
        ]
      }
    }
  ],
  "billingAddress": {
    "address1": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "shippingAddress": {
    "address1": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "paymentMethod": "card|upi|netbanking|cod|wallet",
  "isScheduledDelivery": false,
  "scheduledDateTime": "2024-12-31T10:00:00.000Z"
}
```

### PUT /api/orders/:id/cancel
Cancel order (Protected)
```json
{
  "reason": "Changed mind"
}
```

### PUT /api/orders/:id/status
Update order status (Admin only)
```json
{
  "orderStatus": "placed|confirmed|processing|shipped|delivered|cancelled",
  "trackingNumber": "TRK123456",
  "estimatedDelivery": "2024-12-31T10:00:00.000Z"
}
```

---

## 9. NOTIFICATION ENDPOINTS

### GET /api/notifications
Get user notifications (Protected)
Query params: `page`, `limit`, `type`, `isRead`

### PUT /api/notifications/:id/mark-read
Mark notification as read (Protected)

### PUT /api/notifications/mark-all-read
Mark all notifications as read (Protected)

### DELETE /api/notifications/:id
Delete notification (Protected)

---

## 10. ADMIN ENDPOINTS

### GET /api/admin/dashboard
Get admin dashboard data (Admin only)
Query params: `page`, `limit`

Returns:
```json
{
  "overview": {
    "totalUsers": 150,
    "totalOrders": 89,
    "totalProducts": 45,
    "totalCategories": 12,
    "totalRevenue": 45670
  },
  "recentOrders": [],
  "topCustomers": [],
  "customers": {
    "data": [],
    "pagination": {}
  }
}
```

### GET /api/admin/customers/:userId
Get complete customer data (Admin only)

---

## 11. SETTINGS ENDPOINTS

### GET /api/settings/app
Get app settings

### PUT /api/settings/app
Update app settings (Admin only)
```json
{
  "appName": "My E-commerce Store",
  "siteName": "Best Online Store",
  "contactEmail": "contact@store.com",
  "siteEmail": "info@store.com",
  "contactPhone": "+1234567890",
  "sitePhone": "+1234567890",
  "address": "123 Business Street, City",
  "socialLinks": {
    "facebook": "https://facebook.com/mystore",
    "twitter": "https://twitter.com/mystore",
    "instagram": "https://instagram.com/mystore"
  },
  "aboutUs": "About our company...",
  "termsAndConditions": "Terms and conditions...",
  "privacyPolicy": "Privacy policy...",
  "currencyCode": "INR",
  "currencySymbol": "₹",
  "metaTags": {
    "title": "Best E-commerce Store",
    "description": "Shop the best products online",
    "keywords": "ecommerce, shopping, online store"
  },
  "defaultLanguage": "en",
  "emailNotifications": {
    "orderConfirmation": true,
    "orderStatusUpdate": true,
    "orderShipped": false,
    "orderDelivered": true,
    "orderCancelled": true,
    "newAccountCreated": true
  },
  "shopTiming": {
    "monday": {
      "isOpen": true,
      "openTime": "08:00 AM",
      "closeTime": "09:00 PM"
    }
  },
  "maintenanceMode": false,
  "paymentGateways": {
    "cashOnDelivery": {
      "isActive": true
    },
    "razorpay": {
      "isActive": false,
      "keyId": "",
      "keySecret": ""
    }
  },
  "taxSettings": {
    "enableTax": true,
    "taxRate": 18,
    "taxName": "GST"
  },
  "deliverySettings": {
    "enableScheduledDelivery": true,
    "freeDeliveryMinOrder": 500,
    "deliveryCharges": 50
  }
}
```

### GET /api/settings/user
Get user settings (Protected)

### PUT /api/settings/user
Update user settings (Protected)
```json
{
  "notifications": {
    "email": {
      "orderUpdates": true,
      "promotions": false,
      "newsletter": false
    },
    "push": {
      "orderUpdates": true,
      "promotions": false,
      "reminders": true
    },
    "sms": {
      "orderUpdates": false,
      "promotions": false
    }
  },
  "privacy": {
    "profileVisibility": "private|public",
    "dataSharing": false,
    "showOnlineStatus": true
  },
  "preferences": {
    "currency": "INR",
    "language": "en",
    "theme": "light|dark|auto",
    "timezone": "Asia/Kolkata"
  },
  "deliveryPreferences": {
    "preferredTimeSlot": "morning|afternoon|evening|anytime",
    "specialInstructions": "Leave at door"
  }
}
```

---

## DATA MODELS

### User Model
```typescript
interface User {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  gender: 'male' | 'female' | 'other';
  role: 'customer' | 'admin' | 'vendor';
  referralCode?: string;
  profilePicture: FileObject[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Address Model
```typescript
interface Address {
  _id: string;
  userId: string;
  type: 'billing' | 'shipping';
  address1: string;
  address2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Product Model
```typescript
interface Product {
  _id: string;
  name: string;
  sku: string;
  brand: string;
  materialType: string;
  description: string;
  tagLine?: string;
  pricing: {
    basePrice: number;
    offerPrice?: number;
    tierPricing: TierPricing[];
    designAreaPricing: DesignAreaPricing[];
  };
  images: FileObject[];
  categoryId: string;
  customJsonId?: string;
  isActive: boolean;
  isCustomAllowed: boolean;
  isFeatured: boolean;
  stock: number;
  minOrderQuantity: number;
  maxOrderQuantity?: number;
  ratings: {
    average: number;
    count: number;
  };
  tags: string[];
  specifications: { key: string; value: string }[];
  weight: { value: number; unit: string };
  dimensions: { length: number; width: number; height: number; unit: string };
  createdAt: Date;
  updatedAt: Date;
}
```

### Cart Model
```typescript
interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  updatedAt: Date;
}

interface CartItem {
  productId: string;
  count: number;
  customization: Customization;
  priceBreakdown: PriceBreakdown;
  addedAt: Date;
}
```

### Order Model
```typescript
interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  billingAddress: AddressData;
  shippingAddress: AddressData;
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'cod' | 'wallet';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  orderStatus: 'placed' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  isScheduledDelivery: boolean;
  scheduledDateTime?: Date;
  totalAmount: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Common Types
```typescript
interface FileObject {
  file_name: string;
  url: string;
  key: string;
  alt?: string;
  isPrimary?: boolean;
}

interface Customization {
  selectedColor?: {
    name: string;
    hexCode: string;
    price: number;
  };
  selectedSize?: {
    name: string;
    price: number;
  };
  designCustomizations?: {
    position: 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';
    designAreaName: string;
    customText?: string;
    customImages?: FileObject[];
    price: number;
  }[];
}

interface PriceBreakdown {
  basePrice: number;
  designCost: number;
  totalUnitPrice: number;
  totalAmount: number;
}
```

---

## ERROR CODES

- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized
- `403` - Forbidden / Access Denied
- `404` - Not Found
- `409` - Conflict (e.g., duplicate email)
- `500` - Internal Server Error

---

## PAGINATION

All list endpoints support pagination:
```
?page=1&limit=10
```

Response includes pagination metadata:
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

---

## FILE UPLOAD

Files are uploaded and return this structure:
```typescript
interface FileObject {
  file_name: string;
  url: string;
  key: string;
}
```

For image uploads, additional fields may be present:
```typescript
interface ImageObject extends FileObject {
  alt?: string;
  isPrimary?: boolean;
}
```
