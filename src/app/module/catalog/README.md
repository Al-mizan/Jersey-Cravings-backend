# Catalog Context

Contains product catalog management.

## Submodules

- `category/`
- `product/`
- `product-variant/`
- `product-media/`

Catalog lifecycle rules:

- Product: `DRAFT -> ACTIVE -> ARCHIVED`
- Category inactive/soft-delete should hide from storefront but preserve history
