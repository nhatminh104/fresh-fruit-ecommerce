# Database Design — Fresh Fruit

MongoDB (Mongoose). Tất cả collection đặt tên rõ ràng, index khai báo trong schema.

## ERD tổng quan

```
User 1─n AuthSession
User 1─1 Cart 1─n CartItem → Product
User 1─n Order 1─n OrderItem (snapshot) → Product
User 1─n Address
User 1─1 Wishlist n─n Product
User 1─n Review n─1 Product, n─1 Order
Order 1─1 Payment, n─1 Voucher
Product n─1 Category, 1─1 Inventory
```

## Collections

### users
| Field | Kiểu | Ghi chú |
|---|---|---|
| fullName, email (unique, lowercase), password (scrypt hash, `select:false`) | | |
| phone, avatar | | |
| role | enum `customer`, `admin` | index |
| status | enum `active`, `inactive`, `blocked` | index |
| passwordResetTokenHash / passwordResetExpiresAt | `select:false` | reset flow |

### auth_sessions
`user`, `refreshTokenHash` (sha256), `expiresAt` (TTL index — auto xóa), `revokedAt`, `userAgent`, `ip`. Index `{user, revokedAt}`.

### products
`name`, `slug` (unique), `description`, `category → Category`, `price`, `originalPrice`, `unit`, `origin`, `images[]`, `stock` (nguồn tồn kho chính, integer ≥0), `soldCount`, `isFeatured`, `isActive` (index). Text index `{name, description}`; index `{category, price, isActive}`.

### categories
`name`, `slug` (unique), `description`, `image`, `isActive` (index).

### carts
`user` (unique), `items[] { product → Product, quantity ≥1 integer }`.

### orders
`orderCode` (unique), `user` (index), `idempotencyKey` (unique partial index `{user:1, idempotencyKey:1}` khi key tồn tại), `items[]` snapshot `{product, productName, image, unit, price, quantity, subtotal}`, `shippingAddress` snapshot, `subtotal`, `discountAmount`, `shippingFee`, `totalAmount`, `voucher → Voucher`, `paymentMethod` (`cod|mock`), `paymentStatus` (`pending|paid|failed|refunded`), `status` (`pending|confirmed|shipping|delivered|cancelled`, index), `note`, `cancelledAt`, `stockRestoredAt`. Index `{user, createdAt:-1}`.

### payments
`order` (unique — 1 payment/đơn), `method` (`cod|mock`), `status` (`pending|paid|failed|refunded`), `amount`.

### vouchers
`code` (unique, uppercase), `description`, `discountType` (`percent|fixed`), `discountValue` (percent ≤100), `minOrderValue`, `maxDiscount`, `startDate`, `endDate` (≥ startDate), `usageLimit`, `usedCount`, `isActive`. Index `{code, isActive}`.

### wishlists
`user` (unique), `products[] → Product` (không trùng).

### reviews
`user`, `product`, `order`, `rating` (1–5 int), `comment` (≤1000), `isApproved` (default false — chờ admin duyệt). Unique `{user, product}`; index `{product, createdAt:-1}`.

### addresses
`user`, `recipientName`, `phone`, `province`, `district`, `ward`, `streetAddress`, `isDefault`.

### inventory
`product` (unique), `quantity`, `lowStockAt` (default 5). `quantity` là bản sao tương thích của `Product.stock` — `Product.stock` mới là nguồn chính.

## Nguyên tắc dữ liệu

- Order snapshot product + địa chỉ tại thời điểm checkout → không bị ảnh hưởng khi product/address đổi sau.
- Tồn kho trừ/cộng qua `Product.updateOne` có điều kiện `stock >= quantity` → không âm; `soldCount` đi kèm.
- Voucher `usedCount` tăng khi tạo đơn, giảm khi hủy — có guard `usedCount < usageLimit`.
- `idempotencyKey` unique partial index → retry an toàn.
