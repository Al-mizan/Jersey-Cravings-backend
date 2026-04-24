# Module Architecture (Refactor - Backward Compatible)

This project now uses a bounded-context module layout under `src/app/module`.

## Contexts

- `governance/`: admin governance, audit logging, activity feed, bulk actions, dashboard summaries
- `catalog/`: category, product, product variants, product media
- `commerce/`: order, payment, coupon, cart, fulfillment, gift add-on
- `customer/`: profile, address, loyalty, referral, review
- `auth/`: authentication and session/token management

## Backward Compatibility

Legacy module folders remain functional during migration.
Do not remove existing folders/routes until compatibility adapters are in place and all imports are migrated.

## File Naming Convention

For each module, use:

- `<entity>.route.ts`
- `<entity>.controller.ts`
- `<entity>.service.ts`
- `<entity>.validation.ts`
- `<entity>.interface.ts`
- optional `<entity>.constant.ts`

Example:

- `product.route.ts`
- `product.controller.ts`
- `product.service.ts`

## Non-Negotiable Rules

- Keep controllers thin.
- Keep business logic in services.
- Keep request validation in zod schema files.
- Keep responses through shared `sendResponse`.
- Keep role checks in `checkAuth` plus service-level authorization.
