# Jersey Cravings API Reference

## Base Information
- **Base URL (v1)**: `/api/v1`
- **Content Type**: `application/json` (unless otherwise specified)
- **Protected Route Auth**: cookie-based access token + Better Auth session token

## Protected Route Header Standard
For every protected endpoint marked with `🔒 Requires Bearer Token`, send:
- `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`

Notes:
- The current auth middleware reads tokens from **cookies**. The `Authorization: Bearer <token>` header is optional and not required by the middleware.

---

## Module: System

### 1) API Health Check
- **API Name**: API Health Check
- **Method**: `GET`
- **URL**: `/`
- **Description**: Verify backend service availability.
- **Headers**: No special headers required
- **URL Params**: None
- **Query Params**: None
- **Request Body**: No request body required

---

## Module: Auth

### 1) Register Customer
- **API Name**: Register Customer
- **Method**: `POST`
- **URL**: `/api/v1/auth/register`
- **Description**: Create a new customer account.
- **Headers**:
  - `Content-Type: application/json`
- **URL Params**: None
- **Query Params**: None
- **Request Body**:
```json
{
  "name": "Rakib Hasan",
  "email": "rakib.hasan@example.com",
  "password": "StrongPass123"
}
```

### 2) Login User
- **API Name**: Login User
- **Method**: `POST`
- **URL**: `/api/v1/auth/login`
- **Description**: Authenticate user and set auth cookies (access token + session token).
- **Headers**:
  - `Content-Type: application/json`
- **URL Params**: None
- **Query Params**: None
- **Request Body**:
```json
{
  "email": "rakib.hasan@example.com",
  "password": "StrongPass123"
}
```

### 3) Get Current User (Me)
- **API Name**: Get Current User (Me)
- **Method**: `GET`
- **URL**: `/api/v1/auth/me`
- **Description**: Get the currently authenticated user info.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**: None
- **Query Params**: None
- **Request Body**: No request body required

### 4) Refresh Token
- **API Name**: Refresh Token
- **Method**: `POST`
- **URL**: `/api/v1/auth/refresh-token`
- **Description**: Refresh access token using existing refresh/session cookies.
- **Headers**:
  - `Cookie: refreshToken=<refresh_token>; better-auth.session_token=<session_token>`
- **URL Params**: None
- **Query Params**: None
- **Request Body**: No request body required

### 5) Change Password
- **API Name**: Change Password
- **Method**: `POST`
- **URL**: `/api/v1/auth/change-password`
- **Description**: Change password for the current user.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: application/json`
- **URL Params**: None
- **Query Params**: None
- **Request Body**:
```json
{
  "currentPassword": "StrongPass123",
  "newPassword": "NewStrongPass456"
}
```

### 6) Logout
- **API Name**: Logout
- **Method**: `POST`
- **URL**: `/api/v1/auth/logout`
- **Description**: Logout current user and clear auth cookies.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**: None
- **Query Params**: None
- **Request Body**: No request body required

### 7) Verify Email (OTP)
- **API Name**: Verify Email (OTP)
- **Method**: `POST`
- **URL**: `/api/v1/auth/verify-email`
- **Description**: Verify email using OTP.
- **Headers**:
  - `Content-Type: application/json`
- **URL Params**: None
- **Query Params**: None
- **Request Body**:
```json
{
  "email": "rakib.hasan@example.com",
  "otp": "123456"
}
```

### 8) Forget Password (Request OTP)
- **API Name**: Forget Password (Request OTP)
- **Method**: `POST`
- **URL**: `/api/v1/auth/forget-password`
- **Description**: Request password reset OTP.
- **Headers**:
  - `Content-Type: application/json`
- **URL Params**: None
- **Query Params**: None
- **Request Body**:
```json
{
  "email": "rakib.hasan@example.com"
}
```

### 9) Reset Password (OTP)
- **API Name**: Reset Password (OTP)
- **Method**: `POST`
- **URL**: `/api/v1/auth/reset-password`
- **Description**: Reset password using OTP.
- **Headers**:
  - `Content-Type: application/json`
- **URL Params**: None
- **Query Params**: None
- **Request Body**:
```json
{
  "email": "rakib.hasan@example.com",
  "otp": "123456",
  "newPassword": "ResetPass789"
}
```

### 10) Start Google OAuth Login
- **API Name**: Start Google OAuth Login
- **Method**: `GET`
- **URL**: `/api/v1/auth/login/google`
- **Description**: Start Google OAuth flow.
- **Headers**: No special headers required
- **URL Params**: None
- **Query Params**: None
- **Request Body**: No request body required

### 11) Google OAuth Success Redirect
- **API Name**: Google OAuth Success Redirect
- **Method**: `GET`
- **URL**: `/api/v1/auth/google/success`
- **Description**: OAuth success handler that sets auth cookies and redirects.
- **Headers**:
  - `Cookie: better-auth.session_token=<session_token>`
- **URL Params**: None
- **Query Params**: None
- **Request Body**: No request body required

### 12) OAuth Error Redirect Handler
- **API Name**: OAuth Error Redirect Handler
- **Method**: `GET`
- **URL**: `/api/v1/auth/oauth/error`
- **Description**: OAuth error handler for frontend redirect.
- **Headers**: No special headers required
- **URL Params**: None
- **Query Params**:
  - `error` (optional)
- **Request Body**: No request body required

---

## Module: Catalog - Category

### 1) Get All Categories
- **API Name**: Get All Categories
- **Method**: `GET`
- **URL**: `/api/v1/categories`
- **Description**: List categories.
- **Headers**: No special headers required
- **URL Params**: None
- **Query Params**:
  - `searchTerm` (optional)
  - `isActive` (optional, `true|false`)
  - `isDeleted` (optional, `true|false`)
  - `page` (optional)
  - `limit` (optional)
  - `sortBy` (optional)
  - `sortOrder` (optional, `asc|desc`)
- **Request Body**: No request body required

### 2) Get Category By ID
- **API Name**: Get Category By ID
- **Method**: `GET`
- **URL**: `/api/v1/categories/:id`
- **Description**: Get a category by id.
- **Headers**: No special headers required
- **URL Params**:
  - `id`: Category ID
- **Query Params**: None
- **Request Body**: No request body required

### 3) Create Category
- **API Name**: Create Category
- **Method**: `POST`
- **URL**: `/api/v1/categories`
- **Description**: Create a new category.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: application/json`
- **URL Params**: None
- **Query Params**: None
- **Request Body**:
```json
{
  "name": "National Teams",
  "slug": "national-teams"
}
```

### 4) Update Category
- **API Name**: Update Category
- **Method**: `PATCH`
- **URL**: `/api/v1/categories/:id`
- **Description**: Update category fields.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: application/json`
- **URL Params**:
  - `id`: Category ID
- **Query Params**: None
- **Request Body**:
```json
{
  "name": "Club Jerseys",
  "slug": "club-jerseys",
  "isActive": true
}
```

### 5) Soft Delete Category
- **API Name**: Soft Delete Category
- **Method**: `DELETE`
- **URL**: `/api/v1/categories/:id`
- **Description**: Soft delete a category.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**:
  - `id`: Category ID
- **Query Params**: None
- **Request Body**: No request body required

### 6) Restore Category
- **API Name**: Restore Category
- **Method**: `PATCH`
- **URL**: `/api/v1/categories/:id/restore`
- **Description**: Restore a soft-deleted category.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**:
  - `id`: Category ID
- **Query Params**: None
- **Request Body**: No request body required

---

## Module: Catalog - Product

### 1) Create Product
- **API Name**: Create Product
- **Method**: `POST`
- **URL**: `/api/v1/products`
- **Description**: Create a product.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: application/json`
- **URL Params**: None
- **Query Params**: None
- **Request Body**:
```json
{
  "title": "Argentina 2026 Home Jersey",
  "slug": "argentina-2026-home-jersey",
  "description": "Official fan edition jersey.",
  "teamName": "Argentina",
  "tournamentTag": "World Cup 2026",
  "jerseyType": "HOME",
  "categoryId": "d0ebcb4f-1e2a-4c3c-b8dc-4bbf2f8f71b4"
}
```

### 2) Get All Products
- **API Name**: Get All Products
- **Method**: `GET`
- **URL**: `/api/v1/products`
- **Description**: List products.
- **Headers**: No special headers required
- **URL Params**: None
- **Query Params**:
  - `searchTerm` (optional)
  - `status` (optional, e.g. `DRAFT|ACTIVE|ARCHIVED`)
  - `categoryId` (optional)
  - `isDeleted` (optional, `true|false`)
  - `page` (optional)
  - `limit` (optional)
  - `sortBy` (optional)
  - `sortOrder` (optional, `asc|desc`)
- **Request Body**: No request body required

### 3) Get Product By ID
- **API Name**: Get Product By ID
- **Method**: `GET`
- **URL**: `/api/v1/products/:id`
- **Description**: Get a product by id.
- **Headers**: No special headers required
- **URL Params**:
  - `id`: Product ID
- **Query Params**: None
- **Request Body**: No request body required

### 4) Update Product
- **API Name**: Update Product
- **Method**: `PATCH`
- **URL**: `/api/v1/products/:id`
- **Description**: Update product fields.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: application/json`
- **URL Params**:
  - `id`: Product ID
- **Query Params**: None
- **Request Body**:
```json
{
  "title": "Argentina 2026 Home Jersey - Fan Edition",
  "description": "Updated description",
  "teamName": "Argentina",
  "tournamentTag": "WC 2026",
  "jerseyType": "HOME"
}
```

### 5) Update Product Status
- **API Name**: Update Product Status
- **Method**: `PATCH`
- **URL**: `/api/v1/products/:id/status`
- **Description**: Update product lifecycle status.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: application/json`
- **URL Params**:
  - `id`: Product ID
- **Query Params**: None
- **Request Body**:
```json
{
  "status": "ACTIVE"
}
```

### 6) Soft Delete Product
- **API Name**: Soft Delete Product
- **Method**: `DELETE`
- **URL**: `/api/v1/products/:id`
- **Description**: Soft delete a product.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**:
  - `id`: Product ID
- **Query Params**: None
- **Request Body**: No request body required

### 7) Restore Product
- **API Name**: Restore Product
- **Method**: `PATCH`
- **URL**: `/api/v1/products/:id/restore`
- **Description**: Restore a soft-deleted product.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**:
  - `id`: Product ID
- **Query Params**: None
- **Request Body**: No request body required

---

## Module: Catalog - Product Variant

### 1) Create Product Variant
- **API Name**: Create Product Variant
- **Method**: `POST`
- **URL**: `/api/v1/products/:productId/variants`
- **Description**: Create a product variant.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: application/json`
- **URL Params**:
  - `productId`: Product ID
- **Query Params**: None
- **Request Body**:
```json
{
  "sku": "ARG-26-HOME-M-FAN-SS",
  "size": "M",
  "fit": "FAN",
  "sleeveType": "SHORT",
  "priceAmount": 4500,
  "compareAtAmount": 5000,
  "costAmount": 3000,
  "stockQty": 40
}
```

### 2) Get Product Variants
- **API Name**: Get Product Variants
- **Method**: `GET`
- **URL**: `/api/v1/products/:productId/variants`
- **Description**: List variants for a product.
- **Headers**: No special headers required
- **URL Params**:
  - `productId`: Product ID
- **Query Params**:
  - `isActive` (optional, `true|false`)
  - `page` (optional)
  - `limit` (optional)
  - `sortBy` (optional)
  - `sortOrder` (optional, `asc|desc`)
- **Request Body**: No request body required

### 3) Get Variant By ID
- **API Name**: Get Variant By ID
- **Method**: `GET`
- **URL**: `/api/v1/products/:productId/variants/:variantId`
- **Description**: Get a variant by id.
- **Headers**: No special headers required
- **URL Params**:
  - `productId`: Product ID
  - `variantId`: Variant ID
- **Query Params**: None
- **Request Body**: No request body required

### 4) Update Variant
- **API Name**: Update Variant
- **Method**: `PATCH`
- **URL**: `/api/v1/products/:productId/variants/:variantId`
- **Description**: Update variant fields.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: application/json`
- **URL Params**:
  - `productId`: Product ID
  - `variantId`: Variant ID
- **Query Params**: None
- **Request Body**:
```json
{
  "priceAmount": 4700,
  "stockQty": 55,
  "isActive": true
}
```

### 5) Delete Variant
- **API Name**: Delete Variant
- **Method**: `DELETE`
- **URL**: `/api/v1/products/:productId/variants/:variantId`
- **Description**: Delete a product variant.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**:
  - `productId`: Product ID
  - `variantId`: Variant ID
- **Query Params**: None
- **Request Body**: No request body required

---

## Module: Catalog - Product Media

### 1) Get Product Media
- **API Name**: Get Product Media
- **Method**: `GET`
- **URL**: `/api/v1/products/:productId/media`
- **Description**: List media for a product.
- **Headers**: No special headers required
- **URL Params**:
  - `productId`: Product ID
- **Query Params**: None
- **Request Body**: No request body required

### 2) Get Product Media By ID
- **API Name**: Get Product Media By ID
- **Method**: `GET`
- **URL**: `/api/v1/products/:productId/media/:mediaId`
- **Description**: Get a single media item.
- **Headers**: No special headers required
- **URL Params**:
  - `productId`: Product ID
  - `mediaId`: Media ID
- **Query Params**: None
- **Request Body**: No request body required

### 3) Create Product Media
- **API Name**: Create Product Media
- **Method**: `POST`
- **URL**: `/api/v1/products/:productId/media`
- **Description**: Upload product media (multipart).
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: multipart/form-data`
- **URL Params**:
  - `productId`: Product ID
- **Query Params**: None
- **Request Body**:
```json
{
  "altText": "Front view"
}
```

### 4) Update Product Media
- **API Name**: Update Product Media
- **Method**: `PATCH`
- **URL**: `/api/v1/products/:productId/media/:mediaId`
- **Description**: Update media metadata and/or replace file (multipart).
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: multipart/form-data`
- **URL Params**:
  - `productId`: Product ID
  - `mediaId`: Media ID
- **Query Params**: None
- **Request Body**:
```json
{
  "altText": "Updated front view"
}
```

### 5) Reorder Product Media
- **API Name**: Reorder Product Media
- **Method**: `POST`
- **URL**: `/api/v1/products/:productId/media/reorder`
- **Description**: Reorder media items for storefront display.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: application/json`
- **URL Params**:
  - `productId`: Product ID
- **Query Params**: None
- **Request Body**:
```json
{
  "mediaOrder": [
    { "id": "0f29c7fd-07f7-42f3-8d7c-1e5db1e6b2f1", "sortOrder": 0 },
    { "id": "62da7d0b-468c-4c77-82a0-6f9d1b1f8e36", "sortOrder": 1 }
  ]
}
```

### 6) Delete Product Media
- **API Name**: Delete Product Media
- **Method**: `DELETE`
- **URL**: `/api/v1/products/:productId/media/:mediaId`
- **Description**: Delete media and enqueue Cloudinary cleanup.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**:
  - `productId`: Product ID
  - `mediaId`: Media ID
- **Query Params**: None
- **Request Body**: No request body required

---

## Module: Governance - Admin

### 1) Create Admin
- **API Name**: Create Admin
- **Method**: `POST`
- **URL**: `/api/v1/admins`
- **Description**: Create a new admin account (SUPER_ADMIN only).
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: application/json`
- **URL Params**: None
- **Query Params**: None
- **Request Body**:
```json
{
  "password": "AdminPass123",
  "role": "ADMIN",
  "admin": {
    "name": "Operations Admin",
    "email": "ops.admin@example.com",
    "contactNumber": "01711111111",
    "profilePhoto": "https://res.cloudinary.com/demo/image/upload/v1/admin.jpg"
  }
}
```

### 2) Get All Admins
- **API Name**: Get All Admins
- **Method**: `GET`
- **URL**: `/api/v1/admins`
- **Description**: List admin users.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**: None
- **Query Params**:
  - `searchTerm` (optional)
  - `isDeleted` (optional, `true|false`)
  - `page` (optional)
  - `limit` (optional)
  - `sortBy` (optional)
  - `sortOrder` (optional, `asc|desc`)
- **Request Body**: No request body required

### 3) Get Admin By ID
- **API Name**: Get Admin By ID
- **Method**: `GET`
- **URL**: `/api/v1/admins/:id`
- **Description**: Get an admin by id.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**:
  - `id`: Admin ID
- **Query Params**: None
- **Request Body**: No request body required

### 4) Update Admin
- **API Name**: Update Admin
- **Method**: `PATCH`
- **URL**: `/api/v1/admins/:id`
- **Description**: Update admin profile (supports profile photo upload).
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: multipart/form-data`
- **URL Params**:
  - `id`: Admin ID
- **Query Params**: None
- **Request Body**:
```json
{
  "name": "Senior Ops Admin",
  "contactNumber": "01712222222"
}
```

### 5) Delete Admin
- **API Name**: Delete Admin
- **Method**: `DELETE`
- **URL**: `/api/v1/admins/:id`
- **Description**: Delete admin (SUPER_ADMIN only).
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**:
  - `id`: Admin ID
- **Query Params**: None
- **Request Body**: No request body required

### 6) Change User Status
- **API Name**: Change User Status
- **Method**: `PATCH`
- **URL**: `/api/v1/admins/user/status`
- **Description**: Change status of a target user.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: application/json`
- **URL Params**: None
- **Query Params**: None
- **Request Body**:
```json
{
  "userId": "c2ee3f7a-bf6a-43e8-9e84-6ec6e5b9f2a4",
  "status": "BLOCKED"
}
```

### 7) Change User Role
- **API Name**: Change User Role
- **Method**: `PATCH`
- **URL**: `/api/v1/admins/user/role`
- **Description**: Change role of a target user (SUPER_ADMIN only).
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: application/json`
- **URL Params**: None
- **Query Params**: None
- **Request Body**:
```json
{
  "userId": "c2ee3f7a-bf6a-43e8-9e84-6ec6e5b9f2a4",
  "role": "SUPER_ADMIN"
}
```

---

## Module: Governance - Audit Log

### 1) Get My Activity
- **API Name**: Get My Activity
- **Method**: `GET`
- **URL**: `/api/v1/audit-logs/my-activity`
- **Description**: Get audit activity created by the current admin.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**: None
- **Query Params**:
  - `page` (optional)
  - `limit` (optional)
- **Request Body**: No request body required

### 2) Get Activity Timeline
- **API Name**: Get Activity Timeline
- **Method**: `GET`
- **URL**: `/api/v1/audit-logs/timeline`
- **Description**: Activity timeline feed for governance UI.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**: None
- **Query Params**:
  - `page` (optional)
  - `limit` (optional)
- **Request Body**: No request body required

### 3) Get Audit Logs
- **API Name**: Get Audit Logs
- **Method**: `GET`
- **URL**: `/api/v1/audit-logs`
- **Description**: List audit logs.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**: None
- **Query Params**:
  - `searchTerm` (optional)
  - `page` (optional)
  - `limit` (optional)
- **Request Body**: No request body required

### 4) Get Audit Log By ID
- **API Name**: Get Audit Log By ID
- **Method**: `GET`
- **URL**: `/api/v1/audit-logs/:id`
- **Description**: Get a single audit log by id.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**:
  - `id`: Audit log ID
- **Query Params**: None
- **Request Body**: No request body required

### 5) Get Entity Audit Logs
- **API Name**: Get Entity Audit Logs
- **Method**: `GET`
- **URL**: `/api/v1/audit-logs/:entityType/:entityId`
- **Description**: Get audit logs for a specific entity.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**:
  - `entityType`: Entity type
  - `entityId`: Entity ID
- **Query Params**:
  - `page` (optional)
  - `limit` (optional)
- **Request Body**: No request body required

---

## Module: Governance - Bulk Action

### 1) Bulk Publish Products
- **API Name**: Bulk Publish Products
- **Method**: `POST`
- **URL**: `/api/v1/bulk-actions/products/publish`
- **Description**: Publish multiple products in one request.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: application/json`
- **URL Params**: None
- **Query Params**: None
- **Request Body**:
```json
{
  "productIds": [
    "0b1d2c0f-b94b-4e34-94b5-e6c7e1b17e89",
    "d7a1c4a7-9ea0-4b41-8a42-8a6e9c4a2a10"
  ]
}
```

### 2) Bulk Archive Products
- **API Name**: Bulk Archive Products
- **Method**: `POST`
- **URL**: `/api/v1/bulk-actions/products/archive`
- **Description**: Archive multiple products in one request.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: application/json`
- **URL Params**: None
- **Query Params**: None
- **Request Body**:
```json
{
  "productIds": [
    "0b1d2c0f-b94b-4e34-94b5-e6c7e1b17e89",
    "d7a1c4a7-9ea0-4b41-8a42-8a6e9c4a2a10"
  ]
}
```

### 3) Bulk Toggle Categories
- **API Name**: Bulk Toggle Categories
- **Method**: `POST`
- **URL**: `/api/v1/bulk-actions/categories/toggle`
- **Description**: Bulk toggle category active status.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: application/json`
- **URL Params**: None
- **Query Params**: None
- **Request Body**:
```json
{
  "categoryIds": [
    "3fbde0cf-2cd5-4b84-85c5-8df60a6ed06d",
    "7f1d1b2b-2b2c-4e37-a2cf-9b7b1dd6d111"
  ],
  "isActive": false
}
```

### 4) Bulk Toggle Coupons
- **API Name**: Bulk Toggle Coupons
- **Method**: `POST`
- **URL**: `/api/v1/bulk-actions/coupons/toggle`
- **Description**: Bulk toggle coupon active status.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: application/json`
- **URL Params**: None
- **Query Params**: None
- **Request Body**:
```json
{
  "couponIds": [
    "c3a70a47-1d65-4df0-a0c2-860dd2b1c9d0",
    "a3f0e9d1-9f28-4c33-8c35-917f5d6f19e0"
  ],
  "isActive": true
}
```

---

## Module: Governance - Dashboard

### 1) Dashboard Summary
- **API Name**: Dashboard Summary
- **Method**: `GET`
- **URL**: `/api/v1/dashboard/summary`
- **Description**: KPI summary for admin dashboard.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**: None
- **Query Params**: None
- **Request Body**: No request body required

### 2) Catalog Stats
- **API Name**: Catalog Stats
- **Method**: `GET`
- **URL**: `/api/v1/dashboard/catalog`
- **Description**: Catalog metrics for admin dashboard.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**: None
- **Query Params**: None
- **Request Body**: No request body required

### 3) Order Stats
- **API Name**: Order Stats
- **Method**: `GET`
- **URL**: `/api/v1/dashboard/orders`
- **Description**: Order metrics for admin dashboard.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**: None
- **Query Params**: None
- **Request Body**: No request body required

### 4) Customer Stats
- **API Name**: Customer Stats
- **Method**: `GET`
- **URL**: `/api/v1/dashboard/customers`
- **Description**: Customer metrics for admin dashboard.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**: None
- **Query Params**: None
- **Request Body**: No request body required

---

## Module: Customer - Profile

### 1) Get My Profile
- **API Name**: Get My Profile
- **Method**: `GET`
- **URL**: `/api/v1/customers/profile/me`
- **Description**: Get current customer profile.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**: None
- **Query Params**: None
- **Request Body**: No request body required

### 2) Update My Profile
- **API Name**: Update My Profile
- **Method**: `PATCH`
- **URL**: `/api/v1/customers/profile/me`
- **Description**: Update current customer profile (multipart).
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: multipart/form-data`
- **URL Params**: None
- **Query Params**: None
- **Request Body**:
```json
{
  "name": "Rakib Hasan",
  "contactNumber": "01712345678"
}
```

### 3) Get All Customers (Admin)
- **API Name**: Get All Customers (Admin)
- **Method**: `GET`
- **URL**: `/api/v1/customers/profile`
- **Description**: List customers for admin support.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**: None
- **Query Params**:
  - `searchTerm` (optional)
  - `status` (optional)
  - `isDeleted` (optional)
  - `page` (optional)
  - `limit` (optional)
- **Request Body**: No request body required

### 4) Get Customer By ID (Admin)
- **API Name**: Get Customer By ID (Admin)
- **Method**: `GET`
- **URL**: `/api/v1/customers/profile/:customerId`
- **Description**: Get a customer by id.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**:
  - `customerId`: Customer user id
- **Query Params**: None
- **Request Body**: No request body required

### 5) Change Customer Status (Admin)
- **API Name**: Change Customer Status (Admin)
- **Method**: `PATCH`
- **URL**: `/api/v1/customers/profile/status`
- **Description**: Change customer status.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: application/json`
- **URL Params**: None
- **Query Params**: None
- **Request Body**:
```json
{
  "userId": "c2ee3f7a-bf6a-43e8-9e84-6ec6e5b9f2a4",
  "status": "BLOCKED"
}
```

### 6) Restore Customer (Admin)
- **API Name**: Restore Customer (Admin)
- **Method**: `PATCH`
- **URL**: `/api/v1/customers/profile/:customerId/restore`
- **Description**: Restore a deleted customer.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**:
  - `customerId`: Customer user id
- **Query Params**: None
- **Request Body**: No request body required

---

## Module: Customer - Address

### 1) Get My Addresses
- **API Name**: Get My Addresses
- **Method**: `GET`
- **URL**: `/api/v1/customers/addresses/my`
- **Description**: List my addresses.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**: None
- **Query Params**: None
- **Request Body**: No request body required

### 2) Create Address
- **API Name**: Create Address
- **Method**: `POST`
- **URL**: `/api/v1/customers/addresses/my`
- **Description**: Create a new address.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: application/json`
- **URL Params**: None
- **Query Params**: None
- **Request Body**:
```json
{
  "label": "Home",
  "recipientName": "Rakib Hasan",
  "phone": "01712345678",
  "line1": "House 12, Road 5",
  "line2": "Dhanmondi",
  "city": "Dhaka",
  "district": "Dhaka",
  "postalCode": "1209",
  "country": "BD",
  "isDefault": true
}
```

### 3) Update Address
- **API Name**: Update Address
- **Method**: `PATCH`
- **URL**: `/api/v1/customers/addresses/my/:addressId`
- **Description**: Update an address.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: application/json`
- **URL Params**:
  - `addressId`: Address ID
- **Query Params**: None
- **Request Body**:
```json
{
  "line1": "House 12, Road 7",
  "isDefault": true
}
```

### 4) Delete Address
- **API Name**: Delete Address
- **Method**: `DELETE`
- **URL**: `/api/v1/customers/addresses/my/:addressId`
- **Description**: Delete an address.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**:
  - `addressId`: Address ID
- **Query Params**: None
- **Request Body**: No request body required

### 5) Get Customer Addresses (Admin)
- **API Name**: Get Customer Addresses (Admin)
- **Method**: `GET`
- **URL**: `/api/v1/customers/addresses/customer/:customerId`
- **Description**: List addresses of a customer.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**:
  - `customerId`: Customer user id
- **Query Params**: None
- **Request Body**: No request body required

---

## Module: Customer - Loyalty

### 1) Get My Loyalty Summary
- **API Name**: Get My Loyalty Summary
- **Method**: `GET`
- **URL**: `/api/v1/customers/loyalty/me`
- **Description**: Get my loyalty summary.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**: None
- **Query Params**: None
- **Request Body**: No request body required

### 2) Get My Point Transactions
- **API Name**: Get My Point Transactions
- **Method**: `GET`
- **URL**: `/api/v1/customers/loyalty/me/transactions`
- **Description**: List my point transactions.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**: None
- **Query Params**:
  - `page` (optional)
  - `limit` (optional)
- **Request Body**: No request body required

### 3) Get Loyalty Setting (Admin)
- **API Name**: Get Loyalty Setting (Admin)
- **Method**: `GET`
- **URL**: `/api/v1/customers/loyalty/settings`
- **Description**: Get active loyalty setting.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**: None
- **Query Params**: None
- **Request Body**: No request body required

### 4) Update Loyalty Setting (SUPER_ADMIN)
- **API Name**: Update Loyalty Setting (SUPER_ADMIN)
- **Method**: `PATCH`
- **URL**: `/api/v1/customers/loyalty/settings`
- **Description**: Update loyalty setting (SUPER_ADMIN only).
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: application/json`
- **URL Params**: None
- **Query Params**: None
- **Request Body**:
```json
{
  "isActive": true,
  "pointsPerCurrencyUnit": 1,
  "minRedeemPoints": 100
}
```

### 5) Get Customer Loyalty (Admin)
- **API Name**: Get Customer Loyalty (Admin)
- **Method**: `GET`
- **URL**: `/api/v1/customers/loyalty/customer/:customerId`
- **Description**: Get loyalty data for a customer.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**:
  - `customerId`: Customer user id
- **Query Params**: None
- **Request Body**: No request body required

---

## Module: Customer - Referral

### 1) Get or Create My Referral Code
- **API Name**: Get or Create My Referral Code
- **Method**: `GET`
- **URL**: `/api/v1/customers/referrals/my-code`
- **Description**: Get my referral code (creates one if missing).
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**: None
- **Query Params**: None
- **Request Body**: No request body required

### 2) Get My Referral Events
- **API Name**: Get My Referral Events
- **Method**: `GET`
- **URL**: `/api/v1/customers/referrals/my-events`
- **Description**: List my referral events.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**: None
- **Query Params**:
  - `page` (optional)
  - `limit` (optional)
- **Request Body**: No request body required

### 3) Get All Referral Events (Admin)
- **API Name**: Get All Referral Events (Admin)
- **Method**: `GET`
- **URL**: `/api/v1/customers/referrals/events`
- **Description**: List all referral events.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**: None
- **Query Params**:
  - `page` (optional)
  - `limit` (optional)
- **Request Body**: No request body required

### 4) Override Referral Status (Admin)
- **API Name**: Override Referral Status (Admin)
- **Method**: `PATCH`
- **URL**: `/api/v1/customers/referrals/events/status`
- **Description**: Override referral event status.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: application/json`
- **URL Params**: None
- **Query Params**: None
- **Request Body**:
```json
{
  "eventId": "e25f9d83-2a39-45aa-bb37-1f4c4b8a8a42",
  "status": "APPROVED",
  "reason": "verified_purchase"
}
```

---

## Module: Customer - Review

### 1) Get All Reviews
- **API Name**: Get All Reviews
- **Method**: `GET`
- **URL**: `/api/v1/customers/reviews`
- **Description**: List reviews.
- **Headers**: No special headers required
- **URL Params**: None
- **Query Params**:
  - `productId` (optional)
  - `rating` (optional)
  - `page` (optional)
  - `limit` (optional)
- **Request Body**: No request body required

### 2) Moderate Review
- **API Name**: Moderate Review
- **Method**: `PATCH`
- **URL**: `/api/v1/customers/reviews/:id/moderate`
- **Description**: Approve/reject a review.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: application/json`
- **URL Params**:
  - `id`: Review ID
- **Query Params**: None
- **Request Body**:
```json
{
  "isApproved": true
}
```

### 3) Create Review
- **API Name**: Create Review
- **Method**: `POST`
- **URL**: `/api/v1/customers/reviews`
- **Description**: Create a review (multipart).
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: multipart/form-data`
- **URL Params**: None
- **Query Params**: None
- **Request Body**:
```json
{
  "productId": "0b1d2c0f-b94b-4e34-94b5-e6c7e1b17e89",
  "rating": 5,
  "comment": "Great quality and fast delivery."
}
```

### 4) Get My Reviews
- **API Name**: Get My Reviews
- **Method**: `GET`
- **URL**: `/api/v1/customers/reviews/my-reviews`
- **Description**: List reviews created by current customer.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**: None
- **Query Params**:
  - `page` (optional)
  - `limit` (optional)
- **Request Body**: No request body required

### 5) Update Review
- **API Name**: Update Review
- **Method**: `PATCH`
- **URL**: `/api/v1/customers/reviews/:id`
- **Description**: Update a review (multipart).
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: multipart/form-data`
- **URL Params**:
  - `id`: Review ID
- **Query Params**: None
- **Request Body**:
```json
{
  "rating": 4,
  "comment": "Updated: still good, size runs slightly small."
}
```

### 6) Delete Review
- **API Name**: Delete Review
- **Method**: `DELETE`
- **URL**: `/api/v1/customers/reviews/:id`
- **Description**: Delete a review.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**:
  - `id`: Review ID
- **Query Params**: None
- **Request Body**: No request body required

---

## Module: Commerce - Cart

### 1) Get My Cart
- **API Name**: Get My Cart
- **Method**: `GET`
- **URL**: `/api/v1/carts/my`
- **Description**: Get current customer's cart.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**: None
- **Query Params**: None
- **Request Body**: No request body required

### 2) Add to Cart
- **API Name**: Add to Cart
- **Method**: `POST`
- **URL**: `/api/v1/carts/my/items`
- **Description**: Add item to cart.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: application/json`
- **URL Params**: None
- **Query Params**: None
- **Request Body**:
```json
{
  "variantId": "4bd8d7d2-3a06-4b34-97e5-8e6f0d9b1a21",
  "qty": 2
}
```

### 3) Update Cart Item
- **API Name**: Update Cart Item
- **Method**: `PATCH`
- **URL**: `/api/v1/carts/my/items/:cartItemId`
- **Description**: Update cart item quantity.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: application/json`
- **URL Params**:
  - `cartItemId`: Cart item ID
- **Query Params**: None
- **Request Body**:
```json
{
  "qty": 1
}
```

### 4) Remove Cart Item
- **API Name**: Remove Cart Item
- **Method**: `DELETE`
- **URL**: `/api/v1/carts/my/items/:cartItemId`
- **Description**: Remove item from cart.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**:
  - `cartItemId`: Cart item ID
- **Query Params**: None
- **Request Body**: No request body required

### 5) Clear My Cart
- **API Name**: Clear My Cart
- **Method**: `DELETE`
- **URL**: `/api/v1/carts/my/clear`
- **Description**: Clear all items from cart.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**: None
- **Query Params**: None
- **Request Body**: No request body required

### 6) Get Customer Cart (Admin)
- **API Name**: Get Customer Cart (Admin)
- **Method**: `GET`
- **URL**: `/api/v1/carts/customer/:userId`
- **Description**: View customer cart for admin support.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**:
  - `userId`: Customer user id
- **Query Params**: None
- **Request Body**: No request body required

---

## Module: Commerce - Coupon

### 1) Get Public Coupons
- **API Name**: Get Public Coupons
- **Method**: `GET`
- **URL**: `/api/v1/coupons/public`
- **Description**: List public coupons for storefront.
- **Headers**: No special headers required
- **URL Params**: None
- **Query Params**: None
- **Request Body**: No request body required

### 2) Validate Coupon (Customer)
- **API Name**: Validate Coupon (Customer)
- **Method**: `POST`
- **URL**: `/api/v1/coupons/validate`
- **Description**: Validate a coupon for checkout.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: application/json`
- **URL Params**: None
- **Query Params**: None
- **Request Body**:
```json
{
  "code": "WC2026",
  "orderAmount": 8500
}
```

### 3) Get All Coupons (Admin)
- **API Name**: Get All Coupons (Admin)
- **Method**: `GET`
- **URL**: `/api/v1/coupons`
- **Description**: List coupons for admin.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**: None
- **Query Params**:
  - `searchTerm` (optional)
  - `isActive` (optional)
  - `isDeleted` (optional)
  - `page` (optional)
  - `limit` (optional)
- **Request Body**: No request body required

### 4) Get Coupon By ID (Admin)
- **API Name**: Get Coupon By ID (Admin)
- **Method**: `GET`
- **URL**: `/api/v1/coupons/:couponId`
- **Description**: Get coupon by id.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**:
  - `couponId`: Coupon ID
- **Query Params**: None
- **Request Body**: No request body required

### 5) Create Coupon (Admin)
- **API Name**: Create Coupon (Admin)
- **Method**: `POST`
- **URL**: `/api/v1/coupons`
- **Description**: Create a coupon.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: application/json`
- **URL Params**: None
- **Query Params**: None
- **Request Body**:
```json
{
  "code": "WC2026",
  "discountType": "PERCENT",
  "value": 10,
  "minOrderAmount": 5000,
  "maxDiscountAmount": 1000,
  "startsAt": "2026-05-01T00:00:00.000Z",
  "endsAt": "2026-06-30T23:59:59.000Z",
  "isActive": true
}
```

### 6) Update Coupon (Admin)
- **API Name**: Update Coupon (Admin)
- **Method**: `PATCH`
- **URL**: `/api/v1/coupons/:couponId`
- **Description**: Update coupon policy.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: application/json`
- **URL Params**:
  - `couponId`: Coupon ID
- **Query Params**: None
- **Request Body**:
```json
{
  "value": 15,
  "isActive": true
}
```

### 7) Soft Delete Coupon (Admin)
- **API Name**: Soft Delete Coupon (Admin)
- **Method**: `DELETE`
- **URL**: `/api/v1/coupons/:couponId`
- **Description**: Soft delete a coupon.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**:
  - `couponId`: Coupon ID
- **Query Params**: None
- **Request Body**: No request body required

### 8) Restore Coupon (Admin)
- **API Name**: Restore Coupon (Admin)
- **Method**: `PATCH`
- **URL**: `/api/v1/coupons/:couponId/restore`
- **Description**: Restore a soft-deleted coupon.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**:
  - `couponId`: Coupon ID
- **Query Params**: None
- **Request Body**: No request body required

---

## Module: Commerce - Fulfillment (Pickup Locations)

### 1) Get Active Pickup Locations
- **API Name**: Get Active Pickup Locations
- **Method**: `GET`
- **URL**: `/api/v1/fulfillment/active`
- **Description**: List active pickup locations.
- **Headers**: No special headers required
- **URL Params**: None
- **Query Params**: None
- **Request Body**: No request body required

### 2) Get Pickup Locations (Admin)
- **API Name**: Get Pickup Locations (Admin)
- **Method**: `GET`
- **URL**: `/api/v1/fulfillment`
- **Description**: List pickup locations (admin).
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**: None
- **Query Params**:
  - `page` (optional)
  - `limit` (optional)
- **Request Body**: No request body required

### 3) Create Pickup Location (Admin)
- **API Name**: Create Pickup Location (Admin)
- **Method**: `POST`
- **URL**: `/api/v1/fulfillment`
- **Description**: Create a pickup location.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: application/json`
- **URL Params**: None
- **Query Params**: None
- **Request Body**:
```json
{
  "name": "Dhanmondi Pickup Point",
  "address": "Dhanmondi 27, Dhaka",
  "isActive": true
}
```

### 4) Update Pickup Location (Admin)
- **API Name**: Update Pickup Location (Admin)
- **Method**: `PATCH`
- **URL**: `/api/v1/fulfillment/:locationId`
- **Description**: Update pickup location.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: application/json`
- **URL Params**:
  - `locationId`: Location ID
- **Query Params**: None
- **Request Body**:
```json
{
  "isActive": false
}
```

### 5) Delete Pickup Location (Admin)
- **API Name**: Delete Pickup Location (Admin)
- **Method**: `DELETE`
- **URL**: `/api/v1/fulfillment/:locationId`
- **Description**: Delete pickup location.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**:
  - `locationId`: Location ID
- **Query Params**: None
- **Request Body**: No request body required

---

## Module: Commerce - Gift Add-on

### 1) Get My Order Gift Add-on
- **API Name**: Get My Order Gift Add-on
- **Method**: `GET`
- **URL**: `/api/v1/gift-addons/my/:orderId`
- **Description**: Get gift add-on for my order.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**:
  - `orderId`: Order ID
- **Query Params**: None
- **Request Body**: No request body required

### 2) Upsert My Order Gift Add-on
- **API Name**: Upsert My Order Gift Add-on
- **Method**: `PUT`
- **URL**: `/api/v1/gift-addons/my/:orderId`
- **Description**: Add/update gift add-on for my order.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: application/json`
- **URL Params**:
  - `orderId`: Order ID
- **Query Params**: None
- **Request Body**:
```json
{
  "isGiftWrap": true,
  "giftMessage": "Happy birthday! Enjoy the jersey."
}
```

### 3) Remove My Order Gift Add-on
- **API Name**: Remove My Order Gift Add-on
- **Method**: `DELETE`
- **URL**: `/api/v1/gift-addons/my/:orderId`
- **Description**: Remove gift add-on from my order.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**:
  - `orderId`: Order ID
- **Query Params**: None
- **Request Body**: No request body required

### 4) Get Order Gift Add-on (Admin)
- **API Name**: Get Order Gift Add-on (Admin)
- **Method**: `GET`
- **URL**: `/api/v1/gift-addons/order/:orderId`
- **Description**: Get gift add-on by order (admin).
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**:
  - `orderId`: Order ID
- **Query Params**: None
- **Request Body**: No request body required

---

## Module: Commerce - Order

### 1) Create My Order
- **API Name**: Create My Order
- **Method**: `POST`
- **URL**: `/api/v1/orders/my`
- **Description**: Create an order for the current customer.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: application/json`
- **URL Params**: None
- **Query Params**: None
- **Request Body**:
```json
{
  "addressId": "9b3cdb2a-7e6a-4b13-a2b8-b28bb5e7c2e1",
  "pickupLocationId": "1dfd64b5-1d24-42c1-8a8c-24c9ed45a3cd",
  "couponCode": "WC2026",
  "notes": "Please call before delivery."
}
```

### 2) Get My Orders
- **API Name**: Get My Orders
- **Method**: `GET`
- **URL**: `/api/v1/orders/my`
- **Description**: List my orders.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**: None
- **Query Params**:
  - `status` (optional)
  - `page` (optional)
  - `limit` (optional)
- **Request Body**: No request body required

### 3) Get My Order By ID
- **API Name**: Get My Order By ID
- **Method**: `GET`
- **URL**: `/api/v1/orders/my/:orderId`
- **Description**: Get one of my orders.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**:
  - `orderId`: Order ID
- **Query Params**: None
- **Request Body**: No request body required

### 4) Cancel My Order
- **API Name**: Cancel My Order
- **Method**: `PATCH`
- **URL**: `/api/v1/orders/my/:orderId/cancel`
- **Description**: Cancel my order (if allowed).
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**:
  - `orderId`: Order ID
- **Query Params**: None
- **Request Body**: No request body required

### 5) Get All Orders (Admin)
- **API Name**: Get All Orders (Admin)
- **Method**: `GET`
- **URL**: `/api/v1/orders`
- **Description**: List orders for admin operations.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**: None
- **Query Params**:
  - `searchTerm` (optional)
  - `status` (optional)
  - `paymentStatus` (optional)
  - `needsManualReview` (optional)
  - `page` (optional)
  - `limit` (optional)
- **Request Body**: No request body required

### 6) Get Order By ID (Admin)
- **API Name**: Get Order By ID (Admin)
- **Method**: `GET`
- **URL**: `/api/v1/orders/:orderId`
- **Description**: Get order details for admin.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**:
  - `orderId`: Order ID
- **Query Params**: None
- **Request Body**: No request body required

### 7) Update Order Status (Admin)
- **API Name**: Update Order Status (Admin)
- **Method**: `PATCH`
- **URL**: `/api/v1/orders/:orderId/status`
- **Description**: Update order status (admin).
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: application/json`
- **URL Params**:
  - `orderId`: Order ID
- **Query Params**: None
- **Request Body**:
```json
{
  "status": "PROCESSING"
}
```

---

## Module: Commerce - Payment

### 1) Initiate Payment
- **API Name**: Initiate Payment
- **Method**: `POST`
- **URL**: `/api/v1/payments/initiate`
- **Description**: Initiate payment for an order (customer).
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: application/json`
- **URL Params**: None
- **Query Params**: None
- **Request Body**:
```json
{
  "orderId": "a2d6c7f0-3b5e-4b8d-8cc8-2b8d9fbb6f30",
  "paymentMethod": "STRIPE"
}
```

### 2) Get My Payments
- **API Name**: Get My Payments
- **Method**: `GET`
- **URL**: `/api/v1/payments/my`
- **Description**: List my payments.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**: None
- **Query Params**:
  - `page` (optional)
  - `limit` (optional)
- **Request Body**: No request body required

### 3) Get Payment By Order (Customer)
- **API Name**: Get Payment By Order (Customer)
- **Method**: `GET`
- **URL**: `/api/v1/payments/my/order/:orderId`
- **Description**: Get payment for an order (customer).
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**:
  - `orderId`: Order ID
- **Query Params**: None
- **Request Body**: No request body required

### 4) Get All Payments (Admin)
- **API Name**: Get All Payments (Admin)
- **Method**: `GET`
- **URL**: `/api/v1/payments`
- **Description**: List payments for admin.
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
- **URL Params**: None
- **Query Params**:
  - `status` (optional)
  - `page` (optional)
  - `limit` (optional)
- **Request Body**: No request body required

### 5) Refund Payment (Admin)
- **API Name**: Refund Payment (Admin)
- **Method**: `PATCH`
- **URL**: `/api/v1/payments/:paymentId/refund`
- **Description**: Refund a payment (admin).
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: application/json`
- **URL Params**:
  - `paymentId`: Payment ID
- **Query Params**: None
- **Request Body**:
```json
{
  "amount": 1500,
  "reason": "customer_request"
}
```

### 6) Collect COD Payment (Admin)
- **API Name**: Collect COD Payment (Admin)
- **Method**: `PATCH`
- **URL**: `/api/v1/payments/:paymentId/collect-cod`
- **Description**: Mark a COD payment as collected (admin).
- **🔒 Requires Bearer Token**
- **Headers**:
  - `Cookie: accessToken=<access_token>; better-auth.session_token=<session_token>`
  - `Content-Type: application/json`
- **URL Params**:
  - `paymentId`: Payment ID
- **Query Params**: None
- **Request Body**:
```json
{
  "collectedAt": "2026-04-27T10:00:00.000Z",
  "note": "Collected by delivery agent."
}
```

### 7) Finalize Payment (System Webhook)
- **API Name**: Finalize Payment (System Webhook)
- **Method**: `POST`
- **URL**: `/api/v1/payments/webhook/finalize`
- **Description**: Internal webhook endpoint for payment finalization.
- **Headers**:
  - `Content-Type: application/json`
- **URL Params**: None
- **Query Params**: None
- **Request Body**:
```json
{
  "orderId": "a2d6c7f0-3b5e-4b8d-8cc8-2b8d9fbb6f30",
  "paymentId": "f8b0d1cf-6f67-4c7c-9b6a-93a7e8b1b0a1",
  "status": "SUCCEEDED",
  "provider": "STRIPE"
}
```

---

## Module: Commerce - Stripe Webhook (Raw Body)

### 1) Stripe Webhook Receiver
- **API Name**: Stripe Webhook Receiver
- **Method**: `POST`
- **URL**: `/api/v1/commerce/payment/webhook/stripe`
- **Description**: Stripe webhook receiver using raw body parser (signature verification).
- **Headers**:
  - `Content-Type: application/json`
  - `Stripe-Signature: <signature_from_stripe>`
- **URL Params**: None
- **Query Params**: None
- **Request Body**: No request body required
