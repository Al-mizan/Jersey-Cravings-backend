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
    app/
      config/
        env.ts
        logger.ts
        prisma.ts
        stripe.ts
        cloudinary.ts
        mailer.ts
        auth.ts

      errorHelpers/
        AppError.ts
        handlePrismaErrors.ts
        handleZodError.ts

      interface/
        error.interface.ts
        query.interface.ts
        requestUser.interface.ts
        index.d.ts

      lib/
        auth.ts
        prisma.ts

      middleware/
        checkAuth.ts
        globalErrorHandler.ts
        notFound.ts
        validateRequest.ts

      module/
        admin/
        auth/
        payment/
        review/
        stats/
        user/

      routes/
        index.ts

      shared/
        catchAsync.ts
        sendResponse.ts

      templates/
        googleRedirect.ejs
        invoice.ejs
        otp.ejs

      utils/
        cookies.ts
        deleteUploadedFilesFromGlobalErrorHandler.ts
        email.ts
        jwt.ts
        QueryBuilder.ts
        seed.ts
        token.ts

    generated/
      prisma/

  prisma/
    schema/
      schema.prisma
    migrations/

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
    1. guide update,
    2. migration/update plan,
    3. implementation alignment.

---

## 19) Complete Admin Panel System Design

This section defines the complete admin flow for the current backend architecture.
It extends existing conventions used in `src/app/module/*`, `checkAuth`, `validateRequest`, `sendResponse`, Prisma transactions, and soft-delete fields.

## 19.1 Design Principles (Do Not Break Consistency)

- Keep module layering unchanged: `route -> controller -> service -> prisma`.
- Keep API response envelope unchanged:
    - success: `{ success: true, message, data, meta? }`
    - error: `{ success: false, message, errorCode, issues? }`
- Keep validation at route boundary using Zod + `validateRequest` middleware.
- Keep errors centralized via `AppError` and global error handler.
- Keep authorization as:
    - coarse permission in route middleware (`checkAuth(Role...)`)
    - fine-grained ownership/hierarchy rules in service methods.

## 19.2 End-to-End Admin Workflow

### 19.2.1 Primary Catalog Flow (from current product diagram)

1. Admin logs in with email/password.
2. Admin opens category module and creates/activates category.
3. Admin opens product module and creates product as `DRAFT`.
4. Admin fills basic product information.
5. Admin creates product variants (`sku`, `size`, `fit`, `sleeveType`, `priceAmount`, `stockQty`).
6. Admin uploads/reorders media.
7. System validates publish prerequisites.
8. Admin publishes product as `ACTIVE`.
9. Product becomes available in storefront queries.

### 19.2.2 Customer Moderation Branch

1. Admin opens customer list with search/filter/pagination.
2. Admin can block/unblock customer (`UserStatus`).
3. Admin or Super Admin can soft-delete customer (`isDeleted=true`, `deletedAt`).
4. Super Admin can restore deleted customer where policy allows.

### 19.2.3 Admin Governance Branch

1. Super Admin creates/deactivates admins.
2. Super Admin can change admin status and role (with self-protection rules).
3. All sensitive operations are audit logged.

### 19.2.4 Text Flow Diagram

```text
SUPER_ADMIN/ADMIN
   -> Login
   -> Dashboard
      -> Category (Create/Activate)
      -> Product (Create DRAFT)
         -> Variant Entry
         -> Media Upload
         -> Publish Validation
         -> Set ACTIVE
         -> Storefront Visible

SUPER_ADMIN/ADMIN
   -> Customer Moderation
      -> Block/Unblock
      -> Soft Delete
      -> Restore (SUPER_ADMIN policy)

SUPER_ADMIN
   -> Admin Governance
      -> Create/Update/Delete Admin
      -> Change Role/Status
```

## 19.3 Refined Permission Matrix (Entity-Level)

Legend:

- `Full`: create/read/update/state-change/soft-delete/restore/bulk
- `Scoped`: allowed with hierarchy or policy restrictions
- `Own`: own records only
- `Read`: read-only
- `None`: no access
- `System`: internal process only (webhook/cron/auth adapter)

### 19.3.1 Identity and Governance

| Entity         | SUPER_ADMIN     | ADMIN                     | CUSTOMER | Notes                                                   |
| -------------- | --------------- | ------------------------- | -------- | ------------------------------------------------------- |
| `User`         | Full            | Scoped                    | Own      | ADMIN cannot mutate SUPER_ADMIN or peer ADMIN authority |
| `Admin`        | Full            | Own                       | None     | ADMIN can update own profile only                       |
| `Customer`     | Full            | Scoped                    | Own      | Moderation allowed by admin policies                    |
| `Session`      | Full            | Scoped                    | Own      | Revoke/cleanup on security events                       |
| `Account`      | Full            | Scoped                    | Own      | OAuth linking disabled for admin roles by policy        |
| `Verification` | Read/Invalidate | Read/Invalidate (limited) | Own      | OTP lifecycle is system-managed                         |

### 19.3.2 Catalog and Reviews

| Entity           | SUPER_ADMIN     | ADMIN             | CUSTOMER                 | Notes                                                |
| ---------------- | --------------- | ----------------- | ------------------------ | ---------------------------------------------------- |
| `Category`       | Full            | Full              | Read active only         | Soft-delete + restore supported                      |
| `Product`        | Full            | Full              | Read active only         | `DRAFT -> ACTIVE -> ARCHIVED` lifecycle              |
| `ProductVariant` | Full            | Full              | Read                     | Inventory-sensitive writes restricted to admin roles |
| `ProductMedia`   | Full            | Full              | Read                     | Upload/replace/reorder/delete                        |
| `Review`         | Full moderation | Scoped moderation | Own create/update/delete | Approval/hide actions by admin roles                 |
| `ReviewMedia`    | Full moderation | Scoped moderation | Own                      | Cascades with review lifecycle                       |

### 19.3.3 Commerce, Payment, Fulfillment

| Entity           | SUPER_ADMIN           | ADMIN                  | CUSTOMER        | Notes                                                  |
| ---------------- | --------------------- | ---------------------- | --------------- | ------------------------------------------------------ |
| `Cart`           | Read/support          | Read/support           | Own full        | Admin write only by support policy                     |
| `CartItem`       | Read/support          | Read/support           | Own full        | Same as cart policy                                    |
| `Order`          | Full                  | Full operational       | Own read        | Customer cancellation window policy applies            |
| `OrderItem`      | Read                  | Read                   | Own read        | Immutable after placement                              |
| `Payment`        | Full                  | Read + refund initiate | Own read        | Final payment success/failure only from webhook/system |
| `OrderCoupon`    | Read                  | Read                   | Own read        | Derived record, no manual mutation                     |
| `Coupon`         | Full                  | Full                   | Apply only      | Soft-delete + restore + usage controls                 |
| `OrderGiftAddon` | Read/update by policy | Read/update by policy  | Own at checkout | Finalized with order billing snapshot                  |
| `PickupLocation` | Full                  | Full                   | Read active     | Admin controls activation/default                      |

### 19.3.4 Loyalty, Referral, Audit

| Entity             | SUPER_ADMIN | ADMIN                             | CUSTOMER | Notes                                      |
| ------------------ | ----------- | --------------------------------- | -------- | ------------------------------------------ |
| `LoyaltySetting`   | Full        | Read (or scoped update by policy) | None     | Recommended write access: SUPER_ADMIN only |
| `PointTransaction` | Full        | Read/support adjust (policy)      | Own read | Core writes should remain system-generated |
| `ReferralCode`     | Full        | Read/support                      | Own read | Admin can deactivate on abuse              |
| `ReferralEvent`    | Full        | Read/support + scoped override    | Own read | Reward transitions mostly system-driven    |
| `AuditLog`         | Read all    | Read scoped                       | None     | Write path is service/system only          |

## 19.4 Mandatory Authorization Rules

1. `SUPER_ADMIN` manages `ADMIN` and `CUSTOMER`.
2. `ADMIN` manages `CUSTOMER` only.
3. Self-protection:
    - no self-delete
    - no self-role-demotion
    - no self-block via admin endpoints
4. `ADMIN` cannot change role/status of `SUPER_ADMIN` or other `ADMIN`.
5. Soft delete is default for business entities; hard delete only for housekeeping/legal requirements.

## 19.5 Module Breakdown for Admin Panel (Backend)

### 19.5.1 Existing Modules to Reuse

- `auth` module: login/refresh/logout/change-password/me.
- `admin` module: admin governance (admin listing, role/status change, admin delete).
- `user` module: admin creation entry point.
- `review` module: moderation extension point.
- `categories`, `products`, `order`, `coupon`, `fulfillment`, `loyalty`, `referral`: admin operational domains.

### 19.5.2 Recommended Admin-Centric Feature Boundaries

- `admin` module keeps governance actions only (admin accounts, role changes, user-status controls).
- Entity business rules stay in their own modules (`products`, `orders`, etc.).
- Shared reusable services:
    - `audit-log.service.ts` for centralized action logging
    - `bulk-action.service.ts` for transactional bulk operations
    - `dashboard.service.ts` for aggregated admin KPIs

## 19.6 API and Validation Pattern for Admin Endpoints

- Route pattern (consistent):
    - `router.{verb}("/...", checkAuth(Role...), validateRequest(schema), Controller.method)`
- Controller pattern:
    - thin transport layer only
    - wrapped by `catchAsync`
    - response via `sendResponse`
- Service pattern:
    - all business rules and authorization hierarchy checks
    - use Prisma transactions for multi-table writes
- Query pattern:
    - standardized search/filter/sort/pagination via query helper
    - all admin list endpoints should return `meta` object

## 19.7 Soft Delete, Restore, and Recovery Policy

- Entities requiring soft delete: `User`, `Admin`, `Customer`, `Category`, `Product`, `Coupon`.
- Soft delete action must:
    - set `isDeleted=true`
    - set `deletedAt=now()`
    - revoke sessions for identity entities when needed
    - create audit log entry
- Restore action must:
    - set `isDeleted=false`
    - clear `deletedAt`
    - enforce role/hierarchy checks
    - create audit log entry

## 19.8 Bulk Operations Standard

- Supported examples:
    - bulk category activate/inactivate
    - bulk product publish/archive
    - bulk coupon activate/deactivate
    - bulk customer block/unblock
- Requirements:
    - transactional processing per request batch
    - partial failure report with per-item result
    - idempotency key for repeated submissions
    - audit log per target entity

## 19.9 Activity Tracking and Audit Logging

### 19.9.1 Must Capture

- `actorUserId`, `actorRole`
- `action`
- `entityType`, `entityId`
- `beforeState`, `afterState`
- `ipAddress`, `userAgent`
- `createdAt`

### 19.9.2 Mandatory Audited Actions

- role/status changes
- soft-delete/restore
- publish/archive state changes
- price/stock changes
- coupon policy changes
- refund initiation and manual payment operations

## 19.10 Performance and Security Improvements (Required)

### 19.10.1 Performance

- Lazy-load heavy relations in admin detail views.
- Use selective projection for large tables.
- Add cache for admin dashboard summaries and catalog aggregates.
- Keep list APIs paginated by default.

### 19.10.2 Security

- Rate limit login, role-change, and destructive admin endpoints.
- Sanitize text input for search/filter/public fields.
- Enforce strict role checks both in middleware and service layer.
- Keep payment finalization webhook-only.
- Add anomaly alerts for repeated failed admin login and mass state changes.

## 19.11 Scalability and Maintainability Plan

- Keep admin API stateless for horizontal scaling.
- Move heavy dashboard analytics to read-optimized queries/cached projections.
- Keep write-side consistency via Prisma transactions.
- Define explicit state transition guards for `UserStatus`, `ProductStatus`, `OrderStatus`, and `PaymentStatus`.
- Build reusable query, audit, and bulk services instead of duplicate logic in controllers.

## 19.12 Optional Technical Upgrades

- Introduce Redis for:
    - dashboard caching
    - rate-limit counters
    - short-lived idempotency records
- Introduce queue workers for long-running admin jobs:
    - bulk media processing
    - large export generation
    - delayed moderation workflows
- Add read replica strategy for report-heavy admin pages.

## 19.13 Database Normalization and Data Integrity Notes

- Keep snapshots (`OrderItem`, address/payment snapshots) denormalized by design for historical integrity.
- Keep mutable policy entities (`LoyaltySetting`, `Coupon`) normalized and audit versioned.
- Add explicit constraints/checks for status transitions where feasible.
- Keep all soft-deleted entities indexed by `isDeleted` + common query dimensions.

## 19.14 Admin Flow Delivery Milestones

1. Finalize RBAC guard policies and service-level hierarchy checks.
2. Complete category/product/variant/media admin endpoints with publish validation.
3. Complete customer moderation (block/unblock/soft-delete/restore).
4. Add centralized audit logging for all sensitive writes.
5. Add bulk operations with transactional per-item results.
6. Add dashboard summary endpoints and caching layer.
7. Add integration tests for role rules, soft delete/restore, publish flow, and audit events.

---

## 20) Project Structure Refactor Blueprint (Backward Compatible)

This section defines the practical restructuring path from the current module layout to the target admin-flow-aligned layout.
The migration is incremental and must not break existing routes/imports.

## 20.1 Updated Folder Structure (Tree View)

```text
src/
    app.ts
    server.ts
    app/
        config/
        errorHelpers/
        interface/
        lib/
        middleware/
        routes/
            index.ts
        shared/
        templates/
        utils/
        module/
            README.md
            compatibility-map.md

            auth/
            user/
            admin/
            categories/
            cart/
            order/
            review/
            loyalty/
            referral/
            fulfillment/
            gift-addon/
            adress/   # deprecated typo path, kept for compatibility

            governance/
                README.md
                admin/
                audit-log/
                activity/
                bulk-action/
                dashboard/

            catalog/
                README.md
                category/
                product/
                product-variant/
                product-media/

            commerce/
                README.md
                coupon/
                payment/

            customer/
                README.md
                profile/
                address/
                review/
                loyalty/
                referral/
```

## 20.2 Mapping (Old -> New Structure)

| Old Path               | Target Path                                               | Strategy                                                  |
| ---------------------- | --------------------------------------------------------- | --------------------------------------------------------- |
| `module/admin/*`       | `module/governance/admin/*`                               | Move during phase migration; keep adapters until complete |
| `module/categories/*`  | `module/catalog/category/*`                               | Normalize naming to singular entity module                |
| `module/order/*`       | `module/commerce/order/*`                                 | Align with commerce bounded context                       |
| `module/cart/*`        | `module/commerce/cart/*`                                  | Align with commerce bounded context                       |
| `module/gift-addon/*`  | `module/commerce/gift-addon/*`                            | Keep same naming under commerce                           |
| `module/fulfillment/*` | `module/commerce/fulfillment/*`                           | Consolidate operational order flow                        |
| `module/review/*`      | `module/customer/review/*`                                | Keep customer-owned flow and moderation hooks             |
| `module/loyalty/*`     | `module/customer/loyalty/*`                               | Keep reward ownership under customer context              |
| `module/referral/*`    | `module/customer/referral/*`                              | Keep referral ownership under customer context            |
| `module/user/*`        | `module/customer/profile/*` + `module/governance/admin/*` | Split customer profile from governance responsibilities   |
| `module/adress/*`      | `module/customer/address/*`                               | Deprecated typo path; keep until final cleanup            |

## 20.3 New Modules Added

### Governance

- `governance/admin`
- `governance/audit-log`
- `governance/activity`
- `governance/bulk-action`
- `governance/dashboard`

### Catalog

- `catalog/category`
- `catalog/product`
- `catalog/product-variant`
- `catalog/product-media`

### Commerce

- `commerce/coupon`
- `commerce/payment`

### Customer

- `customer/profile`
- `customer/address`
- `customer/review`
- `customer/loyalty`
- `customer/referral`

## 20.4 Removed / Deprecated Parts

- Deprecated: `module/adress/` (typo path).
- Not removed yet (for compatibility): legacy flat modules.
- Final removal condition:
    1. All imports switched to target paths.
    2. All route registration points migrated.
    3. Typecheck/lint/integration tests pass.

## 20.5 Conventions and Rules (Enforced)

### 20.5.1 Naming Rules

- File names: `kebab-case`.
- Module file pattern:
    - `<entity>.route.ts`
    - `<entity>.controller.ts`
    - `<entity>.service.ts`
    - `<entity>.validation.ts`
    - `<entity>.interface.ts`
    - optional `<entity>.constant.ts`
- Route constant convention: `<Entity>Routes`.

### 20.5.2 API Response Standardization

- Always use shared response envelope:
    - `{ success, message, data, meta? }`
- Controllers must use shared `sendResponse` helper.
- List endpoints should include pagination metadata when paginated.

### 20.5.3 Validation and Error Pattern

- Validate request boundary with Zod + `validateRequest` middleware.
- Use `AppError` for semantic business errors.
- Keep global error handler as single formatting boundary.

### 20.5.4 Authorization Pattern

- Use `checkAuth(Role...)` on routes.
- Add hierarchy and ownership checks in services.
- Enforce self-protection rules for status/role/delete operations.

## 20.6 Architecture Decisions

1. Bounded contexts introduced under existing `module/` root to avoid disruptive path rewrites.
2. Legacy modules retained during migration for backward compatibility.
3. Governance concerns separated from customer/catalog/commerce concerns.
4. Audit and bulk actions treated as first-class reusable modules.
5. Payment finalization remains webhook-authoritative (no controller override).

## 20.7 Flow Overview After Restructure

### 20.7.1 Admin Catalog Flow

`governance/admin` -> `catalog/category` -> `catalog/product` -> `catalog/product-variant` -> `catalog/product-media` -> publish validation -> storefront visibility

### 20.7.2 Moderation Flow

`governance/admin` + `customer/profile` + `customer/review` -> block/unblock/soft-delete/restore + moderation actions + audit events

### 20.7.3 Operational Flow

`commerce/order` + `commerce/payment` + `commerce/fulfillment` + `commerce/coupon` -> fulfillment and payment-safe transitions

## 20.8 Scalability Improvements

- Keep bounded contexts independently scalable in team ownership.
- Add read-optimized `governance/dashboard` endpoints with cache layer.
- Use selective projections and pagination defaults in all list APIs.
- Add lazy loading on admin frontend by module boundary:
    - dashboard chunk
    - catalog chunk
    - customer moderation chunk
    - operations chunk

## 20.9 How to Extend the System (Developer Guide)

When adding a feature:

1. Pick the correct bounded context (`governance`, `catalog`, `commerce`, `customer`, `auth`).
2. Create module files using standard naming pattern.
3. Add route with role middleware and request validation.
4. Implement business logic in service with transactions when needed.
5. Add audit logging for sensitive writes.
6. Register route in `routes/index.ts` only after module is stable.
7. Keep legacy compatibility until consumer imports are fully migrated.

## 20.10 Migration Phases

1. **Phase 1 (current)**: scaffold target structure and compatibility map.
2. **Phase 2**: migrate module-by-module with adapters and shared tests.
3. **Phase 3**: switch route registration to target paths.
4. **Phase 4**: remove deprecated paths (`module/adress`, legacy flat modules).
