# Jersey Cravings - Project Guide (Single Source of Truth)

## 1) Project Overview

`Jersey Cravings` is a Bangladesh-focused e-commerce SaaS platform for football jerseys, optimized for World Cup 2026 demand.  
This document is the **single source of truth** for architecture, naming, data flow, and implementation standards.

### Business Goals
- Sell authentic and replica football jerseys with variant-based inventory (size, version, sleeve type).
- Support high-traffic campaign periods (World Cup 2026 launch, match-day promotions).
- Provide role-based management for operations and governance.

### Actor Model (Exactly 3 Actors)
- `SUPER_ADMIN`
- `ADMIN`
- `CUSTOMER`

### Role Assignment Rules
- `CUSTOMER`: self-register via Email/Password or Social Login (Google/Facebook).
- `ADMIN`: created only by `SUPER_ADMIN` (no self registration, no social login).
- `SUPER_ADMIN`: seeded bootstrap account and managed only by existing `SUPER_ADMIN` (email/password only).
- Social login is **strictly disabled** for `ADMIN` and `SUPER_ADMIN`.

---

## 2) Core Tech Stack

- Runtime/API: Node.js + Express + TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Auth: better-auth + JWT
- Payments: Stripe (Payment Intents + Webhooks)
- Media: Cloudinary + Multer
- Email: Nodemailer
- Validation: Zod
- Jobs: node-cron
- Deployment style: stateless API + managed Postgres + external object/CDN services

---

## 3) Recommended Folder Structure

```text
jersey-cravings/
  src/
    app.ts
    server.ts

    config/
      env.ts
      logger.ts
      prisma.ts
      stripe.ts
      cloudinary.ts
      mailer.ts
      auth.ts

    core/
      constants/
        roles.ts
        order.ts
        payment.ts
      errors/
        AppError.ts
        errorCodes.ts
      middleware/
        auth.middleware.ts
        role.middleware.ts
        validate.middleware.ts
        rateLimit.middleware.ts
        upload.middleware.ts
      utils/
        pagination.ts
        slug.ts
        money.ts
        jwt.ts
      types/
        express.d.ts
        common.ts

    modules/
      auth/
        auth.controller.ts
        auth.service.ts
        auth.validation.ts
        auth.routes.ts

      users/
        user.controller.ts
        user.service.ts
        user.validation.ts
        user.routes.ts

      admin-management/
        admin.controller.ts
        admin.service.ts
        admin.validation.ts
        admin.routes.ts

      catalog/
        category.controller.ts
        category.service.ts
        category.validation.ts
        category.routes.ts
        product.controller.ts
        product.service.ts
        product.validation.ts
        product.routes.ts
        variant.controller.ts
        variant.service.ts
        variant.validation.ts
        variant.routes.ts

      inventory/
        inventory.controller.ts
        inventory.service.ts
        inventory.routes.ts

      cart/
        cart.controller.ts
        cart.service.ts
        cart.validation.ts
        cart.routes.ts

      orders/
        order.controller.ts
        order.service.ts
        order.validation.ts
        order.routes.ts

      payments/
        payment.controller.ts
        payment.service.ts
        payment.validation.ts
        payment.routes.ts
        stripe.webhook.ts

      uploads/
        upload.controller.ts
        upload.service.ts
        upload.routes.ts

      coupons/
        coupon.controller.ts
        coupon.service.ts
        coupon.validation.ts
        coupon.routes.ts

      reviews/
        review.controller.ts
        review.service.ts
        review.validation.ts
        review.routes.ts

      notifications/
        notification.service.ts
        email.templates.ts

    jobs/
      orderExpiry.job.ts
      paymentReconciliation.job.ts
      inventoryAlert.job.ts
      abandonedCart.job.ts

    routes/
      index.ts

    docs/
      openapi.ts

  prisma/
    schema.prisma
    migrations/
    seed.ts

  tests/
    unit/
    integration/
    e2e/

  .env.example
  PROJECT_GUIDE.md
  package.json
  tsconfig.json
```

---

## 4) Database Schema Design (Prisma + PostgreSQL)

## 4.1 Main Entities

1. `User`
   - id (uuid)
   - name
   - email (unique)
   - passwordHash (nullable for social-only customers)
   - role (`SUPER_ADMIN` | `ADMIN` | `CUSTOMER`)
   - authProvider (`EMAIL`, `GOOGLE`, `FACEBOOK`)
   - isEmailVerified
   - isActive
   - createdAt, updatedAt

2. `UserProfile`
   - userId (FK, unique)
   - phone
   - avatarUrl
   - defaultShippingAddressId (nullable FK)

3. `Address`
   - id
   - userId (FK)
   - label
   - recipientName
   - phone
   - line1, line2
   - city, district, postalCode, country (`BD`)
   - isDefault

4. `Category`
   - id
   - name (e.g. National Team, Club, World Cup 2026)
   - slug (unique)
   - isActive

5. `Product`
   - id
   - title
   - slug (unique)
   - description
   - teamName
   - tournamentTag (e.g. `WORLD_CUP_2026`)
   - jerseyType (`HOME`, `AWAY`, `THIRD`, `GK`, `SPECIAL`)
   - status (`DRAFT`, `ACTIVE`, `ARCHIVED`)
   - categoryId (FK)
   - createdById (ADMIN/SUPER_ADMIN FK)
   - createdAt, updatedAt

6. `ProductVariant`
   - id
   - productId (FK)
   - sku (unique)
   - size (`S`, `M`, `L`, `XL`, `XXL`)
   - fit (`PLAYER`, `FAN`)
   - sleeveType (`SHORT`, `LONG`)
   - colorway
   - priceAmount (integer, stored in paisa)
   - compareAtAmount (nullable)
   - costAmount (nullable)
   - stockQty
   - reservedQty
   - isActive

7. `ProductMedia`
   - id
   - productId (FK)
   - publicId (Cloudinary)
   - secureUrl
   - resourceType (`image`, `video`)
   - altText
   - sortOrder

8. `Cart` and `CartItem`
   - `Cart`: id, userId(unique), updatedAt
   - `CartItem`: id, cartId, variantId, qty

9. `Order`
   - id
   - orderNumber (unique human-readable, e.g. `JC-2026-000123`)
   - userId (FK)
   - status (`PENDING_PAYMENT`, `PAID`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED`, `EXPIRED`)
   - paymentStatus (`UNPAID`, `PAID`, `FAILED`, `REFUNDED`, `PARTIAL_REFUND`)
   - subtotalAmount, discountAmount, shippingAmount, taxAmount, totalAmount
   - currency (`bdt`)
   - shippingAddressSnapshot (JSON)
   - billingAddressSnapshot (JSON)
   - notes
   - placedAt, paidAt, cancelledAt, deliveredAt

10. `OrderItem`
    - id
    - orderId (FK)
    - productId
    - variantId
    - productTitleSnapshot
    - variantSnapshot (JSON)
    - unitPriceAmount
    - qty
    - lineTotalAmount

11. `Payment`
    - id
    - orderId (FK)
    - stripePaymentIntentId (unique)
    - amount
    - currency
    - status (`REQUIRES_PAYMENT_METHOD`, `REQUIRES_ACTION`, `PROCESSING`, `SUCCEEDED`, `FAILED`, `CANCELED`, `REFUNDED`)
    - methodType
    - rawGatewayResponse (JSON)
    - createdAt, updatedAt

12. `Coupon`
    - id
    - code (unique)
    - discountType (`PERCENT`, `FLAT`)
    - value
    - maxDiscountAmount (nullable)
    - minOrderAmount (nullable)
    - usageLimit (nullable)
    - usedCount
    - startsAt, endsAt
    - isActive

13. `OrderCoupon`
    - id
    - orderId
    - couponId
    - appliedAmount

14. `Review`
    - id
    - userId
    - productId
    - rating (1..5)
    - comment
    - isApproved

15. `AuditLog`
    - id
    - actorUserId
    - actorRole
    - action
    - entityType
    - entityId
    - beforeState (JSON)
    - afterState (JSON)
    - ipAddress
    - userAgent
    - createdAt

16. `AuthSession` / `RefreshToken` (if better-auth adapter uses persisted sessions)
    - token tracking, rotation and revocation metadata

## 4.2 Critical Indexes
- `User(email)` unique
- `Product(slug)` unique
- `ProductVariant(sku)` unique
- `Order(orderNumber)` unique
- `Payment(stripePaymentIntentId)` unique
- Composite: `ProductVariant(productId, size, fit, sleeveType, colorway)` unique
- Query indexes: `Order(userId, createdAt desc)`, `Order(status)`, `Product(status, createdAt desc)`, `Category(slug)`

## 4.3 Soft Delete Policy
- Soft delete for business entities: `Product`, `Category`, `Coupon`, optionally `User`.
- Hard delete only for system housekeeping records when legally allowed.

---

## 5) API Architecture

## 5.1 API Style
- RESTful, versioned base path: `/api/v1`
- Module-wise route registration from `src/routes/index.ts`
- Request/response contracts validated via Zod at boundary
- Standard response envelope:
  - success: `{ success: true, message, data, meta? }`
  - error: `{ success: false, message, errorCode, issues? }`

## 5.2 Route Groups
- `/auth/*`
- `/users/*`
- `/admins/*`
- `/categories/*`
- `/products/*`
- `/variants/*`
- `/inventory/*`
- `/cart/*`
- `/orders/*`
- `/payments/*`
- `/uploads/*`
- `/coupons/*`
- `/reviews/*`
- `/webhooks/stripe`

## 5.3 Layered Module Pattern
- `controller`: transport layer only (req/res)
- `service`: business rules + transaction orchestration
- `validation`: zod schemas
- `routes`: endpoint mapping + middleware chain
- No Prisma calls directly from controller.

---

## 6) Authentication & Authorization Flow

## 6.1 Auth Methods by Role
- `CUSTOMER`:
  - Email/Password (better-auth local strategy)
  - Google OAuth
  - Facebook OAuth
- `ADMIN` and `SUPER_ADMIN`:
  - Email/Password only
  - OAuth login attempts must be blocked by role policy

## 6.2 Token Model
- Short-lived Access JWT (e.g. 15 minutes)
- Rotating Refresh token (httpOnly secure cookie or encrypted store)
- Revoke on logout/password reset/security events

## 6.3 Authorization Middleware
- `authenticate()` -> verifies JWT/session and attaches `req.user`
- `authorize(...roles)` -> role-gate protected routes
- Fine-grained checks in service layer (ownership, business constraints)

## 6.4 Role Permission Matrix (Core)
- `SUPER_ADMIN`:
  - create/deactivate `ADMIN`
  - full catalog, order, coupon, settings control
  - full audit and analytics access
- `ADMIN`:
  - manage products/variants/media/stock
  - view and update orders for fulfillment
  - manage coupons and customer support operations
  - cannot create `SUPER_ADMIN`
- `CUSTOMER`:
  - manage profile/address/cart
  - place and track own orders
  - submit product reviews

---

## 7) Product & Order Lifecycle

## 7.1 Product Lifecycle
1. Admin creates product in `DRAFT`.
2. Admin adds variants (SKU + price + stock).
3. Admin uploads media and sets sorting/cover image.
4. Product set to `ACTIVE` for storefront listing.
5. Product may later be `ARCHIVED` (kept for history/order snapshots).

## 7.2 Inventory Rules
- On checkout initiation, reserve stock (`reservedQty += qty`) with transaction lock.
- On payment success, decrement `stockQty` and release reservation.
- On payment failure/expiry/cancel, release reserved quantity.

## 7.3 Order Lifecycle
1. Customer checkout creates order with `PENDING_PAYMENT`.
2. Stripe Payment Intent created and linked.
3. Stripe webhook success -> order `PAID`.
4. Admin processing steps: `PROCESSING -> SHIPPED -> DELIVERED`.
5. Exceptions:
   - payment timeout -> `EXPIRED`
   - pre-shipment cancellation -> `CANCELLED`
   - post-payment return/refund -> `REFUNDED`

---

## 8) Payment Flow (Stripe)

## 8.1 Primary Flow
1. Client requests checkout session/payment intent for order.
2. Server validates order totals and creates Stripe Payment Intent.
3. Client confirms payment using Stripe SDK.
4. Stripe sends webhook (`payment_intent.succeeded`, etc.).
5. Webhook handler verifies signature and updates `Payment` + `Order` atomically.

## 8.2 Security Requirements
- Never trust client-side payment success without webhook confirmation.
- Stripe webhook endpoint must use raw body parser and signature verification.
- Idempotency keys for payment intent creation/retry.
- Store gateway payload in `rawGatewayResponse` for audit.

## 8.3 Refund Flow
- Admin/Super Admin initiates refund.
- Stripe refund API call.
- Update payment status and order status with partial/full refund support.

---

## 9) File Upload System (Cloudinary + Multer)

## 9.1 Upload Strategy
- Multer handles multipart stream and file constraints.
- Service layer uploads to Cloudinary and stores only metadata in DB.
- Preserve `publicId` for delete/replace operations.

## 9.2 Constraints
- Allowed types: image/jpeg, image/png, image/webp (optional mp4 for promos)
- Max file size and count enforced in middleware
- Foldering convention:
  - `jersey-cravings/products/{productId}/...`
  - `jersey-cravings/users/{userId}/avatar/...`

## 9.3 Access Control
- Product media upload: `ADMIN` and `SUPER_ADMIN`
- Profile avatar upload: owner `CUSTOMER/ADMIN/SUPER_ADMIN`

---

## 10) Background Jobs (node-cron)

## 10.1 Required Jobs
1. `orderExpiry.job.ts`
   - Frequency: every 5-10 minutes
   - Marks stale unpaid orders as `EXPIRED`
   - Releases reserved stock

2. `paymentReconciliation.job.ts`
   - Frequency: hourly
   - Cross-checks local payment states vs Stripe
   - Repairs inconsistent records safely

3. `inventoryAlert.job.ts`
   - Frequency: daily + on-demand
   - Triggers low-stock alerts to admins

4. `abandonedCart.job.ts`
   - Frequency: every 6 hours
   - Sends reminder emails to inactive carts (opt-in compliant)

## 10.2 Job Safety
- Distributed lock (DB-based) to avoid duplicate execution in multi-instance deployment.
- Structured logs and job run metrics.
- Retry with capped backoff for transient failures.

---

## 11) Validation, Error Handling, and Logging

## 11.1 Validation
- Zod schemas per endpoint for body/query/params.
- Central `validate.middleware.ts`.

## 11.2 Errors
- Use typed `AppError` with semantic `errorCode`.
- Central error handler maps known errors to consistent HTTP responses.
- Never leak stack traces in production responses.

## 11.3 Logging
- Correlation ID per request.
- Log levels: `error`, `warn`, `info`, `debug`.
- Audit sensitive actions into `AuditLog`.

---

## 12) Email System (Nodemailer)

## 12.1 Mandatory Transactional Emails
- Email verification
- Password reset
- Order confirmation
- Payment success/failure notice
- Shipment and delivery updates

## 12.2 Email Guidelines
- Queue-like behavior (non-blocking send path)
- Template-driven content with Bangla/English ready structure
- Retry failures and track bounce/error logs

---

## 13) Coding Conventions (Strict)

## 13.1 TypeScript
- `strict: true` mandatory
- No `any` unless documented and justified
- Prefer explicit return types on public functions/services

## 13.2 Naming
- Files: `kebab-case`
- Variables/functions: `camelCase`
- Types/classes/enums: `PascalCase`
- Constants/env keys: `UPPER_SNAKE_CASE`

## 13.3 API and Module Conventions
- One module = one domain (`orders`, `payments`, etc.)
- Controller must remain thin; business logic in service
- DB write sequences use Prisma transactions where needed
- Route handlers wrapped with async error catcher

## 13.4 Git/Commit Convention
- Conventional commits:
  - `feat:`
  - `fix:`
  - `refactor:`
  - `docs:`
  - `test:`
  - `chore:`

---

## 14) Security Baseline

- Password hashing with strong algorithm (Argon2 or bcrypt with modern cost).
- Helmet + CORS policy + rate limiting for auth and checkout endpoints.
- Input sanitization for searchable/public fields.
- CSRF protection when using cookie-based auth flows.
- Secret management via environment variables only.
- Principle of least privilege for admin routes.

---

## 15) Scaling Strategy

## 15.1 Application Scaling
- Stateless API containers behind load balancer.
- Horizontal scale on campaign spikes.
- Keep cron leader-lock to avoid duplicate job processing.

## 15.2 Database Scaling
- Start with vertical scaling + index tuning.
- Add read replicas for analytics/heavy read paths.
- Use connection pooling (PgBouncer/managed equivalent).

## 15.3 Caching and Performance
- Add Redis for hot catalog and session/token acceleration (phase 2).
- CDN delivery for Cloudinary assets.
- Pagination and selective field projection for heavy lists.

## 15.4 Reliability
- Health endpoints (`/health/live`, `/health/ready`)
- Observability: logs + metrics + alerting
- Backup and restore runbooks for Postgres

---

## 16) Non-Negotiable Implementation Rules

1. All future code generation **must** follow this folder structure and layered pattern.
2. Role rules are fixed:
   - only customers can use social login,
   - admins/super admins are email-password only.
3. Payment state is finalized only by Stripe webhook verification.
4. Any new feature must map to a module under `src/modules/*`.
5. Schema changes must be reflected in Prisma migrations and this guide.
6. If a future prompt conflicts with this guide, this guide takes precedence unless explicitly updated.

---

## 17) First Build Milestones

1. Bootstrap project with Express + TypeScript + Prisma + base middleware.
2. Implement auth module with role-aware provider restrictions.
3. Build catalog/product/variant/media modules.
4. Build cart + checkout + order + payment webhook flow.
5. Add admin management + audit logs + cron jobs.
6. Add tests (unit + integration) for critical payment and order transitions.

---

## 18) Guide Governance

- `PROJECT_GUIDE.md` is versioned and reviewed for architectural changes.
- Any major architecture change requires:
  1) guide update,  
  2) migration/update plan,  
  3) implementation alignment.

