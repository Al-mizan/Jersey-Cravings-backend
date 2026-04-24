# catalog/category

Category Flow

SUPER_ADMIN বা ADMIN category create/update/active-inactive করতে পারবে; CUSTOMER শুধু দেখতে পারবে।
Create সময় name + slug + optional description/type validate হবে; slug unique হতে হবে।
Category initially active রাখা যায়, বা future launch হলে inactive রেখে পরে active করা যায়।
Product create করার সময় অবশ্যই valid categoryId দিতে হবে; inactive category তে নতুন product publish block করা ভালো।
Category delete না করে soft archive (isActive=false) করা best, যাতে পুরনো product/order history ভাঙে না।
Storefront list API শুধু active category return করবে; admin panel সব category (active + inactive) দেখাবে।
Recommended API Sequence

POST /categories → create
GET /categories?active=true → customer-facing list
PATCH /categories/:id → rename/slug change
PATCH /categories/:id/status → active/inactive
GET /categories/:slug/products → category-wise product listing
Example (Realistic)

Admin creates:
name: World Cup 2026
slug: world-cup-2026
isActive: true
তারপর 3টা product add করল (Argentina Home, Brazil Away, Germany GK) এই category তে।
Customer storefront এ World Cup 2026 এ click করলে শুধু ACTIVE product + ACTIVE variants দেখাবে।
Campaign শেষ হলে admin category inactive করল → category storefront থেকে লুকাবে, কিন্তু historical order/report ঠিকই থাকবে।
