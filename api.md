<!-- -------------------------------------------------- -->

## Module: Auth

### 1. Register Customer

- Method: POST
- URL: /api/v1/auth/register
- Description: Create a new customer account and issue auth cookies/tokens.
- Query Params: None
- URL Params: None
- Required Headers: `Content-Type: application/json`

Request Body:

```json
{
    "name": "string",
    "email": "string",
    "password": "string"
}
```

### 2. Login User

- Method: POST
- URL: /api/v1/auth/login
- Description: Authenticate a user and issue auth cookies/tokens.
- Query Params: None
- URL Params: None
- Required Headers: `Content-Type: application/json`

Request Body:

```json
{
    "email": "string",
    "password": "string"
}
```

### 3. Get Current User

- Method: GET
- URL: /api/v1/auth/me
- Description: Return the currently authenticated user profile.
- Query Params: None
- URL Params: None
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 4. Refresh Access Token

- Method: POST
- URL: /api/v1/auth/refresh-token
- Description: Issue a new access token and refresh related session cookies.
- Query Params: None
- URL Params: None
- Required Headers: `Cookie: refreshToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 5. Change Password

- Method: POST
- URL: /api/v1/auth/change-password
- Description: Change the password for the authenticated user.
- Query Params: None
- URL Params: None
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "currentPassword": "string",
    "newPassword": "string"
}
```

### 6. Logout User

- Method: POST
- URL: /api/v1/auth/logout
- Description: Log out the current user and clear auth cookies.
- Query Params: None
- URL Params: None
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 7. Verify Email

- Method: POST
- URL: /api/v1/auth/verify-email
- Description: Verify a user's email address using OTP.
- Query Params: None
- URL Params: None
- Required Headers: `Content-Type: application/json`

Request Body:

```json
{
    "email": "string",
    "otp": "string"
}
```

### 8. Forget Password

- Method: POST
- URL: /api/v1/auth/forget-password
- Description: Send a password reset OTP to the user's email.
- Query Params: None
- URL Params: None
- Required Headers: `Content-Type: application/json`

Request Body:

```json
{
    "email": "string"
}
```

### 9. Reset Password

- Method: POST
- URL: /api/v1/auth/reset-password
- Description: Reset a user's password with email and OTP.
- Query Params: None
- URL Params: None
- Required Headers: `Content-Type: application/json`

Request Body:

```json
{
    "email": "string",
    "otp": "string",
    "newPassword": "string"
}
```

### 10. Start Google Login

- Method: GET
- URL: /api/v1/auth/login/google
- Description: Render the Google OAuth handoff page.
- Query Params: `redirect` (string, optional redirect path after login)
- URL Params: None
- Required Headers: None

Request Body:
No request body required

### 11. Handle Google Login Success

- Method: GET
- URL: /api/v1/auth/google/success
- Description: Complete Google login, issue cookies, and redirect to the frontend.
- Query Params: `redirect` (string, optional redirect path after login)
- URL Params: None
- Required Headers: `Cookie: better-auth.session_token=<session-token>`

Request Body:
No request body required

### 12. Handle OAuth Error

- Method: GET
- URL: /api/v1/auth/oauth/error
- Description: Redirect OAuth failures back to the frontend login page.
- Query Params: `error` (string, optional error code)
- URL Params: None
- Required Headers: None

Request Body:
No request body required

---

## Module: Catalog - Category

### 1. List Categories

- Method: GET
- URL: /api/v1/categories
- Description: List categories with search, filter, pagination, and sorting support.
- Query Params: `searchTerm` (string), `isActive` (boolean), `isDeleted` (boolean), `page` (number), `limit` (number), `sortBy` (string), `sortOrder` (`asc` | `desc`)
- URL Params: None
- Required Headers: None

Request Body:
No request body required

### 2. Get Category By ID

- Method: GET
- URL: /api/v1/categories/:id
- Description: Get a category and its non-deleted products by category ID.
- Query Params: None
- URL Params: `id` (Category ID)
- Required Headers: None

Request Body:
No request body required

### 3. Create Category

- Method: POST
- URL: /api/v1/categories
- Description: Create a new category.
- Query Params: None
- URL Params: None
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "name": "string",
    "slug": "string"
}
```

### 4. Update Category

- Method: PATCH
- URL: /api/v1/categories/:id
- Description: Update a category's name, slug, or active state.
- Query Params: None
- URL Params: `id` (Category ID)
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "name": "string",
    "slug": "string",
    "isActive": true
}
```

### 5. Soft Delete Category

- Method: DELETE
- URL: /api/v1/categories/:id
- Description: Soft delete a category.
- Query Params: None
- URL Params: `id` (Category ID)
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 6. Restore Category

- Method: PATCH
- URL: /api/v1/categories/:id/restore
- Description: Restore a previously soft-deleted category.
- Query Params: None
- URL Params: `id` (Category ID)
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

---

## Module: Catalog - Product

### 1. List Products

- Method: GET
- URL: /api/v1/products
- Description: List products with search, filter, pagination, and sorting support.
- Query Params: `searchTerm` (string), `status` (`DRAFT` | `ACTIVE` | `ARCHIVED`), `categoryId` (string), `isDeleted` (boolean), `page` (number), `limit` (number), `sortBy` (string), `sortOrder` (`asc` | `desc`)
- URL Params: None
- Required Headers: None

Request Body:
No request body required

### 2. Get Product By ID

- Method: GET
- URL: /api/v1/products/:id
- Description: Get a product with category, variants, and media details.
- Query Params: None
- URL Params: `id` (Product ID)
- Required Headers: None

Request Body:
No request body required

### 3. Create Product

- Method: POST
- URL: /api/v1/products
- Description: Create a new product in `DRAFT` status.
- Query Params: None
- URL Params: None
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "title": "string",
    "slug": "string",
    "description": "string",
    "teamName": "string",
    "tournamentTag": "string",
    "jerseyType": "HOME",
    "categoryId": "uuid"
}
```

### 4. Update Product

- Method: PATCH
- URL: /api/v1/products/:id
- Description: Update a product while it is still in `DRAFT` status.
- Query Params: None
- URL Params: `id` (Product ID)
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "title": "string",
    "slug": "string",
    "description": "string",
    "teamName": "string",
    "tournamentTag": "string",
    "jerseyType": "AWAY",
    "categoryId": "uuid"
}
```

### 5. Publish Product

- Method: PATCH
- URL: /api/v1/products/:id/publish
- Description: Change a product from `DRAFT` to `ACTIVE`.
- Query Params: None
- URL Params: `id` (Product ID)
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 6. Archive Product

- Method: PATCH
- URL: /api/v1/products/:id/archive
- Description: Change a product from `ACTIVE` to `ARCHIVED`.
- Query Params: None
- URL Params: `id` (Product ID)
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 7. Soft Delete Product

- Method: DELETE
- URL: /api/v1/products/:id
- Description: Soft delete a product.
- Query Params: None
- URL Params: `id` (Product ID)
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 8. Restore Product

- Method: PATCH
- URL: /api/v1/products/:id/restore
- Description: Restore a previously soft-deleted product.
- Query Params: None
- URL Params: `id` (Product ID)
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

---

## Module: Catalog - Product Variant

> Note: This module is implemented as a nested product router and expects `:productId` in the URL.

### 1. List Product Variants

- Method: GET
- URL: /api/v1/products/:productId/variants
- Description: List variants for a specific product with pagination and sorting.
- Query Params: `page` (number), `limit` (number), `sortBy` (string), `sortOrder` (`asc` | `desc`)
- URL Params: `productId` (Product ID)
- Required Headers: None

Request Body:
No request body required

### 2. Get Product Variant By ID

- Method: GET
- URL: /api/v1/products/:productId/variants/:variantId
- Description: Get a specific variant for a product.
- Query Params: None
- URL Params: `productId` (Product ID), `variantId` (Variant ID)
- Required Headers: None

Request Body:
No request body required

### 3. Create Product Variant

- Method: POST
- URL: /api/v1/products/:productId/variants
- Description: Create a new variant for a product.
- Query Params: None
- URL Params: `productId` (Product ID)
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "sku": "string",
    "size": "M",
    "fit": "PLAYER",
    "sleeveType": "SHORT",
    "priceAmount": 1000,
    "compareAtAmount": 1200,
    "costAmount": 700,
    "stockQty": 10
}
```

### 4. Update Product Variant

- Method: PATCH
- URL: /api/v1/products/:productId/variants/:variantId
- Description: Update an existing product variant.
- Query Params: None
- URL Params: `productId` (Product ID), `variantId` (Variant ID)
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "size": "L",
    "fit": "FAN",
    "sleeveType": "LONG",
    "priceAmount": 1100,
    "compareAtAmount": 1300,
    "costAmount": 750,
    "stockQty": 15,
    "isActive": true
}
```

### 5. Delete Product Variant

- Method: DELETE
- URL: /api/v1/products/:productId/variants/:variantId
- Description: Delete a product variant.
- Query Params: None
- URL Params: `productId` (Product ID), `variantId` (Variant ID)
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

---

## Module: Catalog - Product Media

> Note: This module is implemented as a nested product router and expects `:productId` in the URL.

### 1. List Product Media

- Method: GET
- URL: /api/v1/products/:productId/media
- Description: List media entries for a product.
- Query Params: `page` (number), `limit` (number)
- URL Params: `productId` (Product ID)
- Required Headers: None

Request Body:
No request body required

### 2. Get Product Media By ID

- Method: GET
- URL: /api/v1/products/:productId/media/:mediaId
- Description: Get a specific media entry for a product.
- Query Params: None
- URL Params: `productId` (Product ID), `mediaId` (Media ID)
- Required Headers: None

Request Body:
No request body required

### 3. Create Product Media

- Method: POST
- URL: /api/v1/products/:productId/media
- Description: Add a media entry to a product.
- Query Params: None
- URL Params: `productId` (Product ID)
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "publicId": "string",
    "secureUrl": "https://example.com/file.jpg",
    "resourceType": "image",
    "altText": "string"
}
```

### 4. Update Product Media

- Method: PATCH
- URL: /api/v1/products/:productId/media/:mediaId
- Description: Update an existing product media entry.
- Query Params: None
- URL Params: `productId` (Product ID), `mediaId` (Media ID)
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "publicId": "string",
    "secureUrl": "https://example.com/file.jpg",
    "resourceType": "video",
    "altText": "string"
}
```

### 5. Reorder Product Media

- Method: POST
- URL: /api/v1/products/:productId/media/reorder
- Description: Update sort order for multiple media items on a product.
- Query Params: None
- URL Params: `productId` (Product ID)
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "mediaOrder": [
        {
            "id": "string",
            "sortOrder": 0
        }
    ]
}
```

### 6. Delete Product Media

- Method: DELETE
- URL: /api/v1/products/:productId/media/:mediaId
- Description: Delete a media entry from a product.
- Query Params: None
- URL Params: `productId` (Product ID), `mediaId` (Media ID)
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

---

## Module: Governance - Admin

### 1. Create Admin

- Method: POST
- URL: /api/v1/admins
- Description: Create a new admin or super admin account.
- Query Params: None
- URL Params: None
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "password": "string",
    "admin": {
        "name": "string",
        "email": "string",
        "contactNumber": "string",
        "profilePhoto": "https://example.com/avatar.jpg"
    },
    "role": "ADMIN"
}
```

### 2. List Admins

- Method: GET
- URL: /api/v1/admins
- Description: List admins with search, pagination, and sorting support.
- Query Params: `searchTerm` (string), `page` (number), `limit` (number), `sortBy` (string), `sortOrder` (`asc` | `desc`)
- URL Params: None
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 3. Get Admin By ID

- Method: GET
- URL: /api/v1/admins/:id
- Description: Get a single admin by ID.
- Query Params: None
- URL Params: `id` (Admin ID)
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 4. Update Admin

- Method: PATCH
- URL: /api/v1/admins/:id
- Description: Update an admin profile.
- Query Params: None
- URL Params: `id` (Admin ID)
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "name": "string",
    "profilePhoto": "https://example.com/avatar.jpg",
    "contactNumber": "string"
}
```

### 5. Delete Admin

- Method: DELETE
- URL: /api/v1/admins/:id
- Description: Soft delete an admin account.
- Query Params: None
- URL Params: `id` (Admin ID)
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 6. Change User Status

- Method: PATCH
- URL: /api/v1/admins/user/status
- Description: Change a user's status to active, blocked, or deleted.
- Query Params: None
- URL Params: None
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "userId": "uuid",
    "status": "ACTIVE"
}
```

### 7. Change User Role

- Method: PATCH
- URL: /api/v1/admins/user/role
- Description: Change a user's role to `ADMIN` or `SUPER_ADMIN`.
- Query Params: None
- URL Params: None
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "userId": "uuid",
    "role": "ADMIN"
}
```

---

## Module: Governance - Audit Log

### 1. List Audit Logs

- Method: GET
- URL: /api/v1/audit-logs
- Description: List audit logs with filter, date range, pagination, and sorting support.
- Query Params: `actorRole` (string), `action` (string), `entityType` (string), `entityId` (string), `startDate` (ISO datetime), `endDate` (ISO datetime), `page` (number), `limit` (number), `sortBy` (string), `sortOrder` (`asc` | `desc`)
- URL Params: None
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 2. Get Audit Log By ID

- Method: GET
- URL: /api/v1/audit-logs/:id
- Description: Get a single audit log entry by ID.
- Query Params: None
- URL Params: `id` (Audit log ID)
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 3. Get Audit Logs For Entity

- Method: GET
- URL: /api/v1/audit-logs/:entityType/:entityId
- Description: List audit logs for a specific entity.
- Query Params: `actorRole` (string), `action` (string), `startDate` (ISO datetime), `endDate` (ISO datetime), `page` (number), `limit` (number), `sortBy` (string), `sortOrder` (`asc` | `desc`)
- URL Params: `entityType` (Entity type), `entityId` (Entity ID)
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

---

## Module: Governance - Activity

### 1. Get My Activity

- Method: GET
- URL: /api/v1/activity/my-activity
- Description: List activity entries for the authenticated admin user.
- Query Params: `page` (number), `limit` (number), `sortBy` (string), `sortOrder` (`asc` | `desc`)
- URL Params: None
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 2. Get Activity Timeline

- Method: GET
- URL: /api/v1/activity/timeline
- Description: Get an activity timeline summary for the last N days.
- Query Params: `days` (number, default `7`)
- URL Params: None
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 3. Get Entity Activity

- Method: GET
- URL: /api/v1/activity/:entityType/:entityId
- Description: List activity entries for a specific entity.
- Query Params: `page` (number), `limit` (number), `sortBy` (string), `sortOrder` (`asc` | `desc`)
- URL Params: `entityType` (Entity type), `entityId` (Entity ID)
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

---

## Module: Governance - Dashboard

### 1. Get Dashboard Summary

- Method: GET
- URL: /api/v1/dashboard/summary
- Description: Get the main admin dashboard KPI summary.
- Query Params: None
- URL Params: None
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 2. Get Catalog Stats

- Method: GET
- URL: /api/v1/dashboard/catalog
- Description: Get catalog-level statistics for categories, products, variants, and media.
- Query Params: None
- URL Params: None
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 3. Get Order Stats

- Method: GET
- URL: /api/v1/dashboard/orders
- Description: Get order-level statistics for the admin dashboard.
- Query Params: None
- URL Params: None
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 4. Get Customer Stats

- Method: GET
- URL: /api/v1/dashboard/customers
- Description: Get customer-level statistics for the admin dashboard.
- Query Params: None
- URL Params: None
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

---

## Module: Governance - Bulk Action

### 1. Bulk Publish Products

- Method: POST
- URL: /api/v1/bulk-actions/products/publish
- Description: Publish multiple products in one request.
- Query Params: None
- URL Params: None
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "productIds": ["uuid"]
}
```

### 2. Bulk Archive Products

- Method: POST
- URL: /api/v1/bulk-actions/products/archive
- Description: Archive multiple products in one request.
- Query Params: None
- URL Params: None
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "productIds": ["uuid"]
}
```

### 3. Bulk Toggle Categories

- Method: POST
- URL: /api/v1/bulk-actions/categories/toggle
- Description: Toggle active status for multiple categories.
- Query Params: None
- URL Params: None
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "categoryIds": ["uuid"],
    "isActive": true
}
```

### 4. Bulk Toggle Coupons

- Method: POST
- URL: /api/v1/bulk-actions/coupons/toggle
- Description: Toggle active status for multiple coupons.
- Query Params: None
- URL Params: None
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "couponIds": ["uuid"],
    "isActive": true
}
```

---

## Module: Customer - Profile

### 1. Get My Profile

- Method: GET
- URL: /api/v1/customers/profile/me
- Description: Get the authenticated customer's profile.
- Query Params: None
- URL Params: None
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 2. Update My Profile

- Method: PATCH
- URL: /api/v1/customers/profile/me
- Description: Update the authenticated customer's profile fields.
- Query Params: None
- URL Params: None
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "name": "string",
    "profilePhoto": "https://example.com/avatar.jpg",
    "contactNumber": "string"
}
```

### 3. List Customers

- Method: GET
- URL: /api/v1/customers/profile
- Description: List customer profiles for admin use.
- Query Params: `searchTerm` (string), `isDeleted` (boolean), `page` (number), `limit` (number), `sortBy` (string), `sortOrder` (`asc` | `desc`)
- URL Params: None
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 4. Get Customer By ID

- Method: GET
- URL: /api/v1/customers/profile/:customerId
- Description: Get a single customer profile by customer ID.
- Query Params: None
- URL Params: `customerId` (Customer ID)
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 5. Change Customer Status

- Method: PATCH
- URL: /api/v1/customers/profile/status
- Description: Change a customer's status to active, blocked, or deleted.
- Query Params: None
- URL Params: None
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "customerId": "string",
    "status": "ACTIVE"
}
```

### 6. Restore Customer

- Method: PATCH
- URL: /api/v1/customers/profile/:customerId/restore
- Description: Restore a previously deleted customer profile.
- Query Params: None
- URL Params: `customerId` (Customer ID)
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

---

## Module: Customer - Address

### 1. List My Addresses

- Method: GET
- URL: /api/v1/customers/addresses/my
- Description: List addresses for the authenticated customer.
- Query Params: `page` (number), `limit` (number), `sortBy` (string), `sortOrder` (`asc` | `desc`)
- URL Params: None
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 2. Create Address

- Method: POST
- URL: /api/v1/customers/addresses/my
- Description: Create a new customer address.
- Query Params: None
- URL Params: None
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "recipientName": "string",
    "phone": "string",
    "address": "string",
    "area": "string",
    "district": "string",
    "division": "string",
    "isDefault": true
}
```

### 3. Update Address

- Method: PATCH
- URL: /api/v1/customers/addresses/my/:addressId
- Description: Update an address owned by the authenticated customer.
- Query Params: None
- URL Params: `addressId` (Address ID)
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "recipientName": "string",
    "phone": "string",
    "address": "string",
    "area": "string",
    "district": "string",
    "division": "string",
    "isDefault": true
}
```

### 4. Delete Address

- Method: DELETE
- URL: /api/v1/customers/addresses/my/:addressId
- Description: Delete an address owned by the authenticated customer.
- Query Params: None
- URL Params: `addressId` (Address ID)
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 5. Get Customer Addresses For Admin

- Method: GET
- URL: /api/v1/customers/addresses/customer/:customerId
- Description: Get all addresses for a specific customer as an admin.
- Query Params: None
- URL Params: `customerId` (Customer ID)
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

---

## Module: Customer - Loyalty

### 1. Get My Loyalty Summary

- Method: GET
- URL: /api/v1/customers/loyalty/me
- Description: Get loyalty points summary for the authenticated customer.
- Query Params: None
- URL Params: None
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 2. List My Point Transactions

- Method: GET
- URL: /api/v1/customers/loyalty/me/transactions
- Description: List loyalty point transactions for the authenticated customer.
- Query Params: `type` (string), `page` (number), `limit` (number), `sortBy` (string), `sortOrder` (`asc` | `desc`)
- URL Params: None
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 3. Get Loyalty Settings

- Method: GET
- URL: /api/v1/customers/loyalty/settings
- Description: Get the currently active loyalty setting.
- Query Params: None
- URL Params: None
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 4. Update Loyalty Settings

- Method: PATCH
- URL: /api/v1/customers/loyalty/settings
- Description: Update loyalty earning and redemption settings.
- Query Params: None
- URL Params: None
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "earnRateBps": 500,
    "minPurchasedQtyToRedeem": 1,
    "isActive": true
}
```

### 5. Get Customer Loyalty By Admin

- Method: GET
- URL: /api/v1/customers/loyalty/customer/:customerId
- Description: Get loyalty details for a specific customer.
- Query Params: None
- URL Params: `customerId` (Customer ID)
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

---

## Module: Customer - Referral

### 1. Get Or Create My Referral Code

- Method: GET
- URL: /api/v1/customers/referrals/my-code
- Description: Get the authenticated customer's referral code, creating one if missing.
- Query Params: None
- URL Params: None
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 2. List My Referral Events

- Method: GET
- URL: /api/v1/customers/referrals/my-events
- Description: List referral reward events for the authenticated customer.
- Query Params: `status` (`PENDING` | `REWARDED` | `REJECTED`), `page` (number), `limit` (number), `sortBy` (string), `sortOrder` (`asc` | `desc`)
- URL Params: None
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 3. List Referral Events For Admin

- Method: GET
- URL: /api/v1/customers/referrals/events
- Description: List all referral events for admin review.
- Query Params: `status` (`PENDING` | `REWARDED` | `REJECTED`), `page` (number), `limit` (number), `sortBy` (string), `sortOrder` (`asc` | `desc`)
- URL Params: None
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 4. Override Referral Status

- Method: PATCH
- URL: /api/v1/customers/referrals/events/status
- Description: Manually change the status of a referral event.
- Query Params: None
- URL Params: None
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "referralEventId": "string",
    "status": "REWARDED"
}
```

---

## Module: Customer - Review

### 1. List Reviews

- Method: GET
- URL: /api/v1/customers/reviews
- Description: List product reviews with filter, pagination, and sorting support.
- Query Params: `productId` (string), `isApproved` (boolean), `page` (number), `limit` (number), `sortBy` (string), `sortOrder` (`asc` | `desc`)
- URL Params: None
- Required Headers: None

Request Body:
No request body required

### 2. Moderate Review

- Method: PATCH
- URL: /api/v1/customers/reviews/:id/moderate
- Description: Approve or reject a review as admin.
- Query Params: None
- URL Params: `id` (Review ID)
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "isApproved": true
}
```

### 3. Create Review

- Method: POST
- URL: /api/v1/customers/reviews
- Description: Create a review for a product as the authenticated customer.
- Query Params: None
- URL Params: None
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "productId": "string",
    "rating": 5,
    "comment": "string",
    "medias": [
        {
            "publicId": "string",
            "secureUrl": "https://example.com/file.jpg",
            "resourceType": "image"
        }
    ]
}
```

### 4. List My Reviews

- Method: GET
- URL: /api/v1/customers/reviews/my-reviews
- Description: List reviews created by the authenticated customer.
- Query Params: `isApproved` (boolean), `page` (number), `limit` (number), `sortBy` (string), `sortOrder` (`asc` | `desc`)
- URL Params: None
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 5. Update Review

- Method: PATCH
- URL: /api/v1/customers/reviews/:id
- Description: Update a review owned by the authenticated customer.
- Query Params: None
- URL Params: `id` (Review ID)
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "rating": 4,
    "comment": "string"
}
```

### 6. Delete Review

- Method: DELETE
- URL: /api/v1/customers/reviews/:id
- Description: Delete a review owned by the authenticated customer.
- Query Params: None
- URL Params: `id` (Review ID)
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

---

## Module: Commerce - Cart

### 1. Get My Cart

- Method: GET
- URL: /api/v1/carts/my
- Description: Get the authenticated customer's cart and cart items.
- Query Params: None
- URL Params: None
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 2. Add Item To Cart

- Method: POST
- URL: /api/v1/carts/my/items
- Description: Add a product variant to the authenticated customer's cart.
- Query Params: None
- URL Params: None
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "variantId": "string",
    "qty": 1
}
```

### 3. Update Cart Item

- Method: PATCH
- URL: /api/v1/carts/my/items/:cartItemId
- Description: Change the quantity of an existing cart item.
- Query Params: None
- URL Params: `cartItemId` (Cart item ID)
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "qty": 2
}
```

### 4. Remove Cart Item

- Method: DELETE
- URL: /api/v1/carts/my/items/:cartItemId
- Description: Remove an item from the authenticated customer's cart.
- Query Params: None
- URL Params: `cartItemId` (Cart item ID)
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 5. Clear My Cart

- Method: DELETE
- URL: /api/v1/carts/my/clear
- Description: Remove all items from the authenticated customer's cart.
- Query Params: None
- URL Params: None
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 6. Get Customer Cart For Admin

- Method: GET
- URL: /api/v1/carts/customer/:userId
- Description: Get a specific customer's cart as an admin.
- Query Params: None
- URL Params: `userId` (User ID)
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

---

## Module: Commerce - Coupon

### 1. List Public Coupons

- Method: GET
- URL: /api/v1/coupons/public
- Description: Get currently public/active coupon offers.
- Query Params: None
- URL Params: None
- Required Headers: None

Request Body:
No request body required

### 2. Validate Coupon

- Method: POST
- URL: /api/v1/coupons/validate
- Description: Validate a coupon code against an order amount.
- Query Params: None
- URL Params: None
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "code": "SAVE20",
    "orderAmount": 5000
}
```

### 3. List Coupons

- Method: GET
- URL: /api/v1/coupons
- Description: List coupons with filter, pagination, and sorting support.
- Query Params: `searchTerm` (string), `isActive` (boolean), `isDeleted` (boolean), `discountType` (`PERCENT` | `FLAT`), `page` (number), `limit` (number), `sortBy` (string), `sortOrder` (`asc` | `desc`)
- URL Params: None
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 4. Get Coupon By ID

- Method: GET
- URL: /api/v1/coupons/:couponId
- Description: Get a single coupon by ID.
- Query Params: None
- URL Params: `couponId` (Coupon ID)
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 5. Create Coupon

- Method: POST
- URL: /api/v1/coupons
- Description: Create a new coupon.
- Query Params: None
- URL Params: None
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "code": "SAVE20",
    "discountType": "PERCENT",
    "value": 20,
    "maxDiscountAmount": 1000,
    "minOrderAmount": 3000,
    "usageLimit": 100,
    "startsAt": "2026-01-01T00:00:00.000Z",
    "endsAt": "2026-12-31T23:59:59.000Z",
    "isActive": true
}
```

### 6. Update Coupon

- Method: PATCH
- URL: /api/v1/coupons/:couponId
- Description: Update an existing coupon.
- Query Params: None
- URL Params: `couponId` (Coupon ID)
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "code": "SAVE25",
    "discountType": "FLAT",
    "value": 500,
    "maxDiscountAmount": 1000,
    "minOrderAmount": 3000,
    "usageLimit": 100,
    "startsAt": "2026-01-01T00:00:00.000Z",
    "endsAt": "2026-12-31T23:59:59.000Z",
    "isActive": true
}
```

### 7. Soft Delete Coupon

- Method: DELETE
- URL: /api/v1/coupons/:couponId
- Description: Soft delete a coupon.
- Query Params: None
- URL Params: `couponId` (Coupon ID)
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 8. Restore Coupon

- Method: PATCH
- URL: /api/v1/coupons/:couponId/restore
- Description: Restore a previously deleted coupon.
- Query Params: None
- URL Params: `couponId` (Coupon ID)
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

---

## Module: Commerce - Fulfillment

### 1. List Active Pickup Locations

- Method: GET
- URL: /api/v1/fulfillment/active
- Description: Get all active pickup locations for storefront checkout, including phone numbers for pickup coordination.
- Query Params: None
- URL Params: None
- Required Headers: None

Request Body:
No request body required

### 2. List Pickup Locations

- Method: GET
- URL: /api/v1/fulfillment
- Description: List pickup locations with filter, pagination, and sorting support.
- Query Params: `searchTerm` (string), `status` (string), `page` (number), `limit` (number), `sortBy` (string), `sortOrder` (`asc` | `desc`)
- URL Params: None
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 3. Create Pickup Location

- Method: POST
- URL: /api/v1/fulfillment
- Description: Create a pickup location. `phone` is required.
- Query Params: None
- URL Params: None
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "name": "string",
    "slug": "string",
    "addressLine": "string",
    "city": "string",
    "district": "string",
    "postalCode": "string",
    "phone": "string",
    "openingHours": "string",
    "status": "ACTIVE",
    "isDefault": true
}
```

### 4. Update Pickup Location

- Method: PATCH
- URL: /api/v1/fulfillment/:locationId
- Description: Update an existing pickup location.
- Query Params: None
- URL Params: `locationId` (Pickup location ID)
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "name": "string",
    "slug": "string",
    "addressLine": "string",
    "city": "string",
    "district": "string",
    "postalCode": "string",
    "phone": "string",
    "openingHours": "string",
    "status": "INACTIVE",
    "isDefault": false
}
```

### 5. Delete Pickup Location

- Method: DELETE
- URL: /api/v1/fulfillment/:locationId
- Description: Delete a pickup location.
- Query Params: None
- URL Params: `locationId` (Pickup location ID)
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

---

## Module: Commerce - Gift Add-on

### 1. Get My Order Gift Add-on

- Method: GET
- URL: /api/v1/gift-addons/my/:orderId
- Description: Get the gift add-on attached to one of the authenticated customer's orders.
- Query Params: None
- URL Params: `orderId` (Order ID)
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 2. Upsert Order Gift Add-on

- Method: PUT
- URL: /api/v1/gift-addons/my/:orderId
- Description: Create or update a gift add-on for one of the authenticated customer's orders.
- Query Params: None
- URL Params: `orderId` (Order ID)
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "category": "FRIEND",
    "customMessage": "string"
}
```

### 3. Remove Order Gift Add-on

- Method: DELETE
- URL: /api/v1/gift-addons/my/:orderId
- Description: Remove the gift add-on from one of the authenticated customer's orders.
- Query Params: None
- URL Params: `orderId` (Order ID)
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 4. Get Gift Add-on By Order For Admin

- Method: GET
- URL: /api/v1/gift-addons/order/:orderId
- Description: Get gift add-on details for a specific order as an admin.
- Query Params: None
- URL Params: `orderId` (Order ID)
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

---

## Module: Commerce - Order

### 1. Create Order

- Method: POST
- URL: /api/v1/orders/my
- Description: Create an order from the authenticated customer's current cart.
- Pricing Rules:
    - DELIVERY within Dhaka district: shipping charge 80
    - DELIVERY within Bangladesh outside Dhaka: shipping charge 120
    - PICKUP: shipping charge 0
- Payment Rules:
    - `paymentMethod` supports `STRIPE` or `COD`
    - `COD` is available only for `PICKUP` orders
- Query Params: None
- URL Params: None
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "fulfillmentMethod": "DELIVERY",
    "paymentMethod": "STRIPE",
    "pickupLocationId": "string",
    "shippingAddressId": "string",
    "billingAddressSnapshot": {
        "name": "string"
    },
    "notes": "string",
    "couponCode": "string",
    "redeemPoints": 100,
    "referralCode": "string",
    "giftAddon": {
        "category": "FAMILY",
        "customMessage": "string"
    }
}
```

### 2. List My Orders

- Method: GET
- URL: /api/v1/orders/my
- Description: List orders for the authenticated customer.
- Query Params: `searchTerm` (string), `status` (string), `paymentStatus` (string), `fulfillmentMethod` (string), `page` (number), `limit` (number), `sortBy` (string), `sortOrder` (`asc` | `desc`)
- URL Params: None
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 3. Get My Order By ID

- Method: GET
- URL: /api/v1/orders/my/:orderId
- Description: Get one order owned by the authenticated customer.
- Query Params: None
- URL Params: `orderId` (Order ID)
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 4. Cancel My Order

- Method: PATCH
- URL: /api/v1/orders/my/:orderId/cancel
- Description: Cancel one of the authenticated customer's orders.
- Query Params: None
- URL Params: `orderId` (Order ID)
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 5. List Orders For Admin

- Method: GET
- URL: /api/v1/orders
- Description: List all orders for admin operations.
- Query Params: `searchTerm` (string), `status` (string), `paymentStatus` (string), `fulfillmentMethod` (string), `userId` (string), `page` (number), `limit` (number), `sortBy` (string), `sortOrder` (`asc` | `desc`)
- URL Params: None
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 6. Get Order By ID For Admin

- Method: GET
- URL: /api/v1/orders/:orderId
- Description: Get a single order by ID for admin use.
- Query Params: None
- URL Params: `orderId` (Order ID)
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 7. Update Order Status

- Method: PATCH
- URL: /api/v1/orders/:orderId/status
- Description: Update an order's lifecycle status as an admin.
- Query Params: None
- URL Params: `orderId` (Order ID)
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "status": "PROCESSING"
}
```

---

## Module: Commerce - Payment

### 1. Initiate Payment

- Method: POST
- URL: /api/v1/payments/initiate
- Description: Initiate Stripe payment for one of the authenticated customer's pending orders. COD payments are collected by admin.
- Query Params: None
- URL Params: None
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "orderId": "string"
}
```

### 2. List My Payments

- Method: GET
- URL: /api/v1/payments/my
- Description: List payment records for the authenticated customer.
- Query Params: `status` (string), `method` (`STRIPE`|`COD`), `page` (number), `limit` (number), `sortBy` (string), `sortOrder` (`asc` | `desc`)
- URL Params: None
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 3. Get Payment By Order For Customer

- Method: GET
- URL: /api/v1/payments/my/order/:orderId
- Description: Get the payment record for one order owned by the authenticated customer.
- Query Params: None
- URL Params: `orderId` (Order ID)
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 4. List Payments For Admin

- Method: GET
- URL: /api/v1/payments
- Description: List all payment records for admin use.
- Query Params: `status` (string), `method` (`STRIPE`|`COD`), `page` (number), `limit` (number), `sortBy` (string), `sortOrder` (`asc` | `desc`)
- URL Params: None
- Required Headers: `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:
No request body required

### 5. Refund Payment

- Method: PATCH
- URL: /api/v1/payments/:paymentId/refund
- Description: Refund a succeeded payment and update the related order state.
- Query Params: None
- URL Params: `paymentId` (Payment ID)
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "reason": "string"
}
```

### 6. Finalize Payment From Webhook

- Method: POST
- URL: /api/v1/payments/webhook/finalize
- Description: Finalize payment status from a trusted system webhook payload.
- Query Params: None
- URL Params: None
- Required Headers: `Content-Type: application/json`

Request Body:

```json
{
    "transactionId": "string",
    "stripeEventId": "string",
    "status": "SUCCEEDED",
    "paymentGatewayData": {
        "key": "value"
    }
}
```

### 7. Collect COD Payment (Admin)

- Method: PATCH
- URL: /api/v1/payments/:paymentId/collect-cod
- Description: Mark a COD payment as collected and sync order payment state.
- Query Params: None
- URL Params: `paymentId` (Payment ID)
- Required Headers: `Content-Type: application/json`, `Cookie: accessToken=<jwt>; better-auth.session_token=<session-token>`

Request Body:

```json
{
    "note": "Collected at branch counter"
}
```

### 8. Handle Stripe Webhook Event

- Method: POST
- URL: /api/v1/commerce/payment/webhook/stripe
- Description: Receive raw Stripe webhook events and synchronize payment state.
- Query Params: None
- URL Params: None
- Required Headers: `Content-Type: application/json`, `Stripe-Signature: <signature>`

Request Body:

```json
{
    "id": "evt_xxx",
    "type": "payment_intent.succeeded",
    "data": {
        "object": {
            "id": "pi_xxx"
        }
    }
}
```
