// Demo data mở rộng cho database `fresh-fruit`: ~20 users, orders, reviews,
// addresses, carts, wishlists, vouchers, products, categories.
// Chạy: node seeds/demo-data.js  (idempotent — chạy lại không tạo trùng)
import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDatabase, closeDatabase } from '../src/config/database.js';
import { hashPassword } from '../src/utils/password.js';
import User from '../src/modules/users/user.model.js';
import Category from '../src/modules/categories/category.model.js';
import Product from '../src/modules/products/product.model.js';
import Voucher from '../src/modules/vouchers/voucher.model.js';
import Inventory from '../src/modules/inventory/inventory.model.js';
import Address from '../src/modules/addresses/address.model.js';
import Cart from '../src/modules/carts/cart.model.js';
import Wishlist from '../src/modules/wishlists/wishlist.model.js';
import Order from '../src/modules/orders/order.model.js';
import Payment from '../src/modules/payments/payment.model.js';
import Review from '../src/modules/reviews/review.model.js';
import { createOrder, cancelOrder } from '../src/modules/orders/order.service.js';
import { createPayment } from '../src/modules/payments/payment.service.js';
import { createReview } from '../src/modules/reviews/review.service.js';
import { updateOrder, updateReview } from '../src/modules/admin/admin.service.js';

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, '../../.env') });
dotenv.config({ path: path.resolve(here, '../.env') });

const IMG = {
  mango: 'https://images.unsplash.com/photo-1553279768-865429fa0078',
  durian: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e',
  strawberry: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6',
  fruit: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b',
  combo: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf',
  bowl: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea',
  pear: 'https://images.unsplash.com/photo-1514756331096-242fdeb70d4f',
  grape: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f'
};
const IMAGES = Object.values(IMG);

const CATEGORIES = [
  { name: 'Trái cây nhiệt đới', slug: 'trai-cay-nhiet-doi', description: 'Chuối, dứa, thanh long và các loại trái cây nhiệt đới tươi ngon', image: IMG.fruit },
  { name: 'Trái cây có múi', slug: 'trai-cay-co-mui', description: 'Bưởi, cam, quýt và các loại trái cây họ có múi', image: IMG.bowl },
  { name: 'Họ cam quýt', slug: 'ho-cam-quyt', description: 'Cam, quýt, bưởi chín mọng quanh năm', image: IMG.grape },
  { name: 'Trái cây mọng', slug: 'trai-cay-mong', description: 'Việt quất, mâm xôi, dâu tây giàu dinh dưỡng', image: IMG.strawberry },
  { name: 'Đặc sản vùng miền', slug: 'dac-san-vung-mien', description: 'Trái cây đặc sản nổi tiếng của các vùng miền Việt Nam', image: IMG.mango },
  { name: 'Trái cây sấy & chế biến', slug: 'trai-cay-say', description: 'Trái cây sấy khô tiện lợi, giữ trọn dinh dưỡng', image: IMG.durian },
  { name: 'Trái cây theo mùa', slug: 'trai-cay-theo-mua', description: 'Trái cây theo mùa, tươi ngon nhất đúng vụ', image: IMG.pear }
];

const PRODUCTS = [
  { name: 'Chuối sứ', slug: 'chuoi-sur', cat: 'trai-cay-nhiet-doi', price: 35000, stock: 120, unit: 'kg', origin: 'Đồng Tháp, Việt Nam', img: IMG.fruit, desc: 'Chuối sứ chín vừa, ngọt bùi, ít xơ.' },
  { name: 'Dứa (Thơm)', slug: 'dua-thom', cat: 'trai-cay-nhiet-doi', price: 28000, stock: 90, unit: 'kg', origin: 'Tiền Giang, Việt Nam', img: IMG.bowl, desc: 'Dứa thơm giòn ngọt, nhiều nước.' },
  { name: 'Măng cụt', slug: 'mang-cut', cat: 'trai-cay-nhiet-doi', price: 95000, stock: 40, unit: 'kg', origin: 'Tiền Giang, Việt Nam', img: IMG.durian, desc: 'Măng cụt chín mọng, vị chua ngọt thanh mát.' },
  { name: 'Dưa hấu', slug: 'dua-hau', cat: 'trai-cay-nhiet-doi', price: 18000, stock: 200, unit: 'kg', origin: 'Long An, Việt Nam', img: IMG.fruit, desc: 'Dưa hấu giòn đỏ, ngọt mát giải nhiệt.' },
  { name: 'Thanh long ruột trắng', slug: 'thanh-long-trang', cat: 'trai-cay-nhiet-doi', price: 38000, stock: 110, unit: 'kg', origin: 'Bình Thuận, Việt Nam', img: IMG.bowl, desc: 'Thanh long ruột trắng giòn, ít sâu bệnh.' },
  { name: 'Bưởi Năm Roi', slug: 'buoi-nam-roi', cat: 'trai-cay-co-mui', price: 55000, stock: 75, unit: 'kg', origin: 'Bắc Giang, Việt Nam', img: IMG.grape, desc: 'Bưởi Năm Roi da vàng, tép mọng nước.' },
  { name: 'Quýt đường', slug: 'quyt-duong', cat: 'ho-cam-quyt', price: 65000, stock: 55, unit: 'kg', origin: 'Bến Tre, Việt Nam', img: IMG.grape, desc: 'Quýt đường chín vàng, vỏ mỏng, ngọt đậm.' },
  { name: 'Cam mật ong', slug: 'cam-mat-ong', cat: 'ho-cam-quyt', price: 85000, stock: 30, unit: 'kg', origin: 'Hà Giang, Việt Nam', img: IMG.pear, desc: 'Cam mật ong chín mọng, vị ngọt thanh.' },
  { name: 'Việt quất', slug: 'viet-quat', cat: 'trai-cay-mong', price: 110000, stock: 20, unit: 'kg', origin: 'Đà Lạt, Việt Nam', img: IMG.strawberry, desc: 'Việt quất tươi, nhiều anthocyanin.' },
  { name: 'Mâm xôi', slug: 'mam-xoi', cat: 'trai-cay-mong', price: 130000, stock: 35, unit: 'hộp 125g', origin: 'Đà Lạt, Việt Nam', img: IMG.strawberry, desc: 'Mâm xôi tươi Đà Lạt, chua ngọt tự nhiên.' },
  { name: 'Xoài cát Hòa Lộc', slug: 'xoai-hoa-loc', cat: 'dac-san-vung-mien', price: 75000, stock: 45, unit: 'kg', origin: 'Tiền Giang, Việt Nam', img: IMG.mango, desc: 'Xoài cát Hòa Lộc nổi tiếng, cơm dày ngọt lịm.', featured: true },
  { name: 'Vải thiều Lục Ngạn', slug: 'vai-thieu', cat: 'trai-cay-theo-mua', price: 120000, stock: 25, unit: 'kg', origin: 'Lục Ngạn, Bắc Giang', img: IMG.mango, desc: 'Vải thiều chính vụ, thịt dày giòn ngọt.' },
  { name: 'Nhãn tiêu', slug: 'nhan-tieu', cat: 'trai-cay-theo-mua', price: 140000, stock: 15, unit: 'kg', origin: 'Bắc Giang, Việt Nam', img: IMG.pear, desc: 'Nhãn tiêu chính vụ, thơm ngọt đặc trưng.' },
  { name: 'Ổi Đài Loan', slug: 'oi-dai-loan', cat: 'trai-cay-nhap-khau', price: 65000, stock: 50, unit: 'kg', origin: 'Đài Loan', img: IMG.fruit, desc: 'Ổi Đài Loan giòn ngọt, ít hạt.' },
  { name: 'Xoài Úc', slug: 'xoai-uc', cat: 'trai-cay-nhap-khau', price: 210000, stock: 12, unit: 'kg', origin: 'Úc', img: IMG.mango, desc: 'Xoài Úc size lớn, thơm ngọt cao cấp.' },
  { name: 'Dâu tây Nhật', slug: 'dau-tay-nhat', cat: 'trai-cay-nhap-khau', price: 189000, stock: 18, unit: 'hộp 250g', origin: 'Nhật Bản', img: IMG.strawberry, desc: 'Dâu tây Nhật thơm đậm, ngọt dịu.' },
  { name: 'Chuối sấy giòn', slug: 'chuoi-say-gion', cat: 'trai-cay-say', price: 89000, stock: 60, unit: 'túi 200g', origin: 'Việt Nam', img: IMG.fruit, desc: 'Chuối sấy giòn không đường thêm, ăn vặt tiện lợi.' },
  { name: 'Xoài sấy', slug: 'xoai-say', cat: 'trai-cay-say', price: 95000, stock: 45, unit: 'túi 200g', origin: 'Việt Nam', img: IMG.mango, desc: 'Xoài sấy chua ngọt, giữ vị xoài tự nhiên.' },
  { name: 'Nho khô', slug: 'nho-kho', cat: 'trai-cay-say', price: 125000, stock: 30, unit: 'túi 250g', origin: 'Thổ Nhĩ Kỳ', img: IMG.grape, desc: 'Nho khô không hạt, ngọt đậm.' },
  { name: 'Combo mùa hè', slug: 'combo-mua-he', cat: 'combo-trai-cay', price: 249000, stock: 15, unit: 'combo', origin: 'Tuyển chọn Fresh Fruit', img: IMG.bowl, desc: 'Combo trái cây mát lạnh giải nhiệt cho mùa hè.', featured: true },
  { name: 'Combo văn phòng', slug: 'combo-van-phong', cat: 'combo-trai-cay', price: 159000, stock: 40, unit: 'combo', origin: 'Tuyển chọn Fresh Fruit', img: IMG.combo, desc: 'Combo trái cây cắt sẵn, tiện lợi cho văn phòng.' }
];

const VOUCHERS = [
  { code: 'GIAM50K', description: 'Giảm 50.000đ cho đơn từ 300.000đ', discountType: 'fixed', discountValue: 50000, minOrderValue: 300000, startDate: '2025-01-01', endDate: '2030-12-31' },
  { code: 'GIAM20', description: 'Giảm 20% tối đa 100.000đ, đơn từ 400.000đ', discountType: 'percent', discountValue: 20, maxDiscount: 100000, minOrderValue: 400000, startDate: '2025-01-01', endDate: '2030-12-31' },
  { code: 'TET2026', description: 'Giảm 15% tối đa 150.000đ dịp Tết, đơn từ 500.000đ', discountType: 'percent', discountValue: 15, maxDiscount: 150000, minOrderValue: 500000, startDate: '2025-01-15', endDate: '2030-12-31' },
  { code: 'FREESHIP50', description: 'Giảm 50.000đ phí đơn, đơn từ 200.000đ', discountType: 'fixed', discountValue: 50000, minOrderValue: 200000, startDate: '2025-01-01', endDate: '2030-12-31' },
  { code: 'SINHVIEN', description: 'Giảm 5% cho sinh viên, đơn từ 100.000đ', discountType: 'percent', discountValue: 5, minOrderValue: 100000, startDate: '2025-01-01', endDate: '2030-12-31' },
  { code: 'VIP15', description: 'Giảm 15% tối đa 80.000đ, đơn từ 250.000đ', discountType: 'percent', discountValue: 15, maxDiscount: 80000, minOrderValue: 250000, startDate: '2025-01-01', endDate: '2030-12-31', usageLimit: 200 },
  { code: 'FRUITLOVE', description: 'Giảm 20.000đ, đơn từ 100.000đ', discountType: 'fixed', discountValue: 20000, minOrderValue: 100000, startDate: '2025-01-01', endDate: '2030-12-31' },
  { code: 'FLASH10', description: 'Flash sale giảm 10% — đã hết hạn', discountType: 'percent', discountValue: 10, maxDiscount: 30000, startDate: '2024-01-01', endDate: '2024-12-31' },
  { code: 'OLD20', description: 'Mã cũ không còn hiệu lực', discountType: 'fixed', discountValue: 20000, minOrderValue: 150000, startDate: '2023-01-01', endDate: '2023-12-31', isActive: false },
  { code: 'NEWUSER', description: 'Giảm 10% đơn từ 150.000đ, giới hạn lượt dùng', discountType: 'percent', discountValue: 10, minOrderValue: 150000, startDate: '2025-01-01', endDate: '2030-12-31', usageLimit: 5 },
  { code: 'WEEKEND', description: 'Giảm 15.000đ cuối tuần, đơn từ 120.000đ', discountType: 'fixed', discountValue: 15000, minOrderValue: 120000, startDate: '2025-01-01', endDate: '2030-12-31' },
  { code: 'BIGBUY', description: 'Giảm 25% tối đa 200.000đ cho đơn lớn từ 1.000.000đ', discountType: 'percent', discountValue: 25, maxDiscount: 200000, minOrderValue: 1000000, startDate: '2025-01-01', endDate: '2030-12-31', usageLimit: 50 },
  { code: 'FRUIT10K', description: 'Giảm 10.000đ, đơn từ 50.000đ', discountType: 'fixed', discountValue: 10000, minOrderValue: 50000, startDate: '2025-01-01', endDate: '2030-12-31', usageLimit: 3 },
  { code: 'FARMFRESH', description: 'Giảm 8% đơn từ 180.000đ', discountType: 'percent', discountValue: 8, minOrderValue: 180000, startDate: '2025-01-01', endDate: '2030-12-31' },
  { code: 'COMBO15', description: 'Giảm 15% tối đa 60.000đ cho combo, đơn từ 220.000đ', discountType: 'percent', discountValue: 15, maxDiscount: 60000, minOrderValue: 220000, startDate: '2025-01-01', endDate: '2030-12-31' },
  { code: 'TET50K', description: 'Giảm 50.000đ dịp Tết, đơn từ 350.000đ', discountType: 'fixed', discountValue: 50000, minOrderValue: 350000, startDate: '2025-01-15', endDate: '2030-12-31' },
  { code: 'MEMBER10', description: 'Giảm 10% tối đa 40.000đ cho thành viên, đơn từ 160.000đ', discountType: 'percent', discountValue: 10, maxDiscount: 40000, minOrderValue: 160000, startDate: '2025-01-01', endDate: '2030-12-31', usageLimit: 300 },
  { code: 'ONGMO', description: 'Giảm 30.000đ, đơn từ 200.000đ', discountType: 'fixed', discountValue: 30000, minOrderValue: 200000, startDate: '2025-01-01', endDate: '2030-12-31' }
];

const CUSTOMER_NAMES = [
  'Trần Thị Mai', 'Lê Văn Hùng', 'Phạm Thị Lan', 'Hoàng Văn Đức', 'Vũ Thị Hà',
  'Đặng Văn Nam', 'Bùi Thị Hoa', 'Đỗ Văn Phúc', 'Ngô Thị Trang', 'Dương Văn Long',
  'Lý Thị Ngọc', 'Trịnh Văn Tài', 'Võ Thị Yến', 'Đinh Văn Khoa', 'Phan Thị Thảo',
  'Lương Văn Bình', 'Cao Thị Hương', 'Tô Văn Quân', 'Hà Thị Diệp', 'Mai Văn Sơn'
];
const PROVINCES = ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Nha Trang', 'Đà Lạt', 'Vũng Tàu'];
const DISTRICTS = ['Quận 1', 'Quận 3', 'Quận 7', 'Bình Thạnh', 'Quận 10', 'Hải Châu', 'Hồng Bàng'];
const WARDS = ['Bến Nghé', 'Phường 5', 'Phú Mỹ', 'Bình An', 'Hòa Hưng', 'Hải Châu I'];
const STREETS = ['Nguyễn Huệ', 'Lê Lợi', 'Trần Hưng Đạo', 'Hai Bà Trưng', 'Điện Biên Phủ', 'Phạm Ngọc Thạch'];
const REVIEW_COMMENTS = [
  'Trái cây rất tươi, giao nhanh, đóng gói cẩn thận.',
  'Chất lượng tốt, đúng mô tả, sẽ ủng hộ lại.',
  'Hơi chua một chút nhưng nhìn chung hài lòng.',
  'Đóng gói kỹ, trái cây còn nguyên vẹn.',
  'Ngọt ngon, giá hợp lý so với chất lượng.',
  'Giao hơi lâu nhưng sản phẩm ổn.',
  'Rất hài lòng, mua lần thứ 3 rồi.',
  null
];

const stats = {};
const bump = (key, n = 1) => { stats[key] = (stats[key] || 0) + n; };
const skip = (key) => { stats[key] = (stats[key] || 0) + 1; stats[`${key}_skipped`] = (stats[`${key}_skipped`] || 0) + 1; };

async function main() {
  await connectDatabase();
  const password = process.env.SEED_CUSTOMER_PASSWORD;
  if (!password) throw new Error('SEED_CUSTOMER_PASSWORD is not configured');
  const hashed = await hashPassword(password);

  const imageMap = JSON.parse(await fs.readFile(path.join(here, 'data', 'product-images.json'), 'utf8'));

  // --- Categories ---
  for (const c of CATEGORIES) {
    const data = { ...c, image: imageMap[`cat:${c.slug}`]?.url || c.image };
    const existed = await Category.findOne({ slug: c.slug }).select('_id').lean();
    await Category.findOneAndUpdate({ slug: c.slug }, { $set: data }, { upsert: true });
    existed ? bump('categories_existing') : bump('categories_new');
  }

  // --- Products ---
  const categoryIds = new Map();
  for (const c of await Category.find().select('slug _id').lean()) categoryIds.set(c.slug, c._id);
  const productDocs = [];
  for (const [i, p] of PRODUCTS.entries()) {
    const doc = { name: p.name, slug: p.slug, description: p.desc, category: categoryIds.get(p.cat), price: p.price, unit: p.unit, origin: p.origin, images: imageMap[p.slug]?.urls || [imageMap[p.slug]?.url || p.img || IMAGES[i % IMAGES.length]], stock: p.stock, isFeatured: Boolean(p.featured), isActive: p.stock >= 10 };
    const { stock, ...catalog } = doc;
    const existed = await Product.findOne({ slug: p.slug }).select('_id').lean();
    await Product.findOneAndUpdate({ slug: p.slug }, { $set: catalog, $setOnInsert: { stock, soldCount: 0 } }, { upsert: true, setDefaultsOnInsert: true });
    existed ? bump('products_existing') : bump('products_new');
    const saved = await Product.findOne({ slug: p.slug }).select('_id stock').lean();
    productDocs.push(saved);
    await Inventory.findOneAndUpdate({ product: saved._id }, { $setOnInsert: { quantity: saved.stock, lowStockAt: 5 } }, { upsert: true });
  }
  // Tất cả products active để chọn ngẫu nhiên có kiểm soát
  const allProducts = await Product.find({ isActive: true }).select('_id slug name price stock').lean();
  if (allProducts.length < 10) throw new Error('Not enough active products');

  // --- Vouchers ---
  for (const v of VOUCHERS) {
    const { usageLimit, ...rest } = v;
    const data = { ...rest, startDate: new Date(v.startDate), endDate: new Date(v.endDate), isActive: v.isActive !== false };
    if (usageLimit) data.usageLimit = usageLimit;
    const existed = await Voucher.findOne({ code: v.code }).select('_id').lean();
    await Voucher.findOneAndUpdate({ code: v.code }, { $set: data, $setOnInsert: { usedCount: 0 } }, { upsert: true });
    existed ? bump('vouchers_existing') : bump('vouchers_new');
  }

  // --- Users ---
  const customers = [];
  for (const [i, name] of CUSTOMER_NAMES.entries()) {
    const email = `khach${String(i + 1).padStart(2, '0')}@freshfruit.local`;
    const existed = await User.findOne({ email }).select('_id').lean();
    const user = await User.findOneAndUpdate(
      { email },
      { $set: { fullName: name, password: hashed, role: 'customer', status: 'active' } },
      { upsert: true, new: true }
    );
    existed ? bump('users_existing') : bump('users_new');
    customers.push(user);
  }

  // --- Addresses (1-2 mỗi khách) ---
  for (const [i, user] of customers.entries()) {
    const count = i % 4 === 0 ? 2 : 1;
    for (let a = 0; a < count; a++) {
      const addr = {
        user: user._id,
        recipientName: user.fullName,
        phone: `09${String(10000000 + i * 7 + a * 131).slice(0, 8)}`,
        province: PROVINCES[(i + a) % PROVINCES.length],
        district: DISTRICTS[(i + a) % DISTRICTS.length],
        ward: WARDS[(i + a) % WARDS.length],
        streetAddress: `${100 + i * 3 + a * 17} ${STREETS[(i + a) % STREETS.length]}`,
        isDefault: a === 0
      };
      const existed = await Address.findOne({ user: user._id, streetAddress: addr.streetAddress }).select('_id').lean();
      if (existed) { skip('addresses'); continue; }
      await Address.create(addr);
      bump('addresses_new');
    }
  }
  const addressMap = new Map();
  for (const u of customers) {
    const addrs = await Address.find({ user: u._id }).sort({ isDefault: -1 }).lean();
    addressMap.set(String(u._id), addrs);
  }

  // --- Carts (~15 khách có giỏ) ---
  for (const [i, user] of customers.slice(0, 15).entries()) {
    const items = [0, 1, 2].slice(0, 1 + (i % 3)).map((k) => ({
      product: allProducts[(i * 3 + k * 5) % allProducts.length]._id,
      quantity: 1 + ((i + k) % 3)
    }));
    await Cart.findOneAndUpdate({ user: user._id }, { $set: { items } }, { upsert: true });
    bump('carts');
  }

  // --- Wishlists (20 khách) ---
  for (const [i, user] of customers.entries()) {
    const products = [0, 1, 2].slice(0, 1 + (i % 3)).map((k) => allProducts[(i * 5 + k * 7) % allProducts.length]._id);
    await Wishlist.findOneAndUpdate({ user: user._id }, { $set: { products } }, { upsert: true });
    bump('wishlists');
  }

  // --- Orders (20 đơn qua service thật) ---
  // target status phân bố: pending 3, confirmed 4, shipping 4, delivered 5, cancelled 4
  const STATUS_PLAN = ['pending', 'confirmed', 'confirmed', 'shipping', 'shipping', 'shipping', 'delivered', 'delivered', 'delivered', 'delivered', 'delivered', 'cancelled', 'cancelled', 'cancelled', 'cancelled', 'pending', 'confirmed', 'shipping', 'delivered', 'pending'];
  const FLOW = ['pending', 'confirmed', 'shipping', 'delivered'];
  const orders = [];
  for (const [i, target] of STATUS_PLAN.entries()) {
    const key = `demo-order-${String(i + 1).padStart(2, '0')}`;
    const existing = await Order.findOne({ idempotencyKey: key }).select('_id').lean();
    if (existing) { orders.push(existing); bump('orders_existing'); continue; }
    const user = customers[i % customers.length];
    const itemCount = 1 + (i % 2);
    const chosen = [allProducts[(i * 2) % allProducts.length], allProducts[(i * 2 + 7) % allProducts.length]].slice(0, itemCount);
    const items = chosen.map((p, k) => ({ product: p._id, quantity: 1 + ((i + k) % 3 === 0 ? 1 : 0) }));
    const subtotal = chosen.reduce((s, p, k) => s + p.price * items[k].quantity, 0);
    const voucherCode = subtotal >= 200000 && i % 4 === 0 ? 'WELCOME10' : (subtotal >= 300000 && i % 7 === 0 ? 'GIAM50K' : undefined);
    const paymentMethod = i % 3 === 0 ? 'mock' : 'cod';
    const addr = addressMap.get(String(user._id))?.[0];
    const shippingAddress = addr ? { recipientName: addr.recipientName, phone: addr.phone, province: addr.province, district: addr.district, ward: addr.ward, streetAddress: addr.streetAddress } : { recipientName: user.fullName, phone: '0901234567', province: 'Hồ Chí Minh', district: 'Quận 1', ward: 'Bến Nghé', streetAddress: '1 Nguyễn Huệ' };
    try {
      const order = await createOrder({ user: user._id, items, shippingAddress, paymentMethod, voucherCode, idempotencyKey: key });
      orders.push(order);
      bump('orders_new');
      // Thanh toán (cod → pending, mock → paid + order confirmed)
      const pay = await createPayment({ userId: user._id, orderId: order._id, method: paymentMethod });
      bump('payments_new');
      if (target === 'cancelled') {
        await cancelOrder({ orderId: order._id });
        bump('orders_cancelled');
      } else {
        const fresh = await Order.findById(order._id).lean();
        const cur = FLOW.indexOf(fresh.status);
        const tgt = FLOW.indexOf(target);
        for (let s = cur + 1; s <= tgt; s++) await updateOrder(order._id, FLOW[s]);
        bump(`orders_${target}`);
      }
    } catch (error) {
      console.log(`Order ${key} skipped: ${error.message}`);
      bump('orders_skipped');
    }
  }

  // --- Đảm bảo mỗi khách có ít nhất 1 đơn delivered để đánh giá ---
  const deliveredPairs = new Set();
  for (const o of await Order.find({ status: 'delivered' }).select('user items').lean()) {
    for (const it of o.items) deliveredPairs.add(`${o.user}:${it.product}`);
  }
  let extra = 0;
  for (const [i, user] of customers.entries()) {
    const hasDelivered = [...deliveredPairs].some((k) => k.startsWith(`${user._id}:`));
    if (hasDelivered || extra >= customers.length) continue;
    const p = allProducts[(i * 11 + 3) % allProducts.length];
    const key = `demo-order-review-${i + 1}`;
    if (await Order.findOne({ idempotencyKey: key }).select('_id').lean()) continue;
    const addr = addressMap.get(String(user._id))?.[0];
    const shippingAddress = addr ? { recipientName: addr.recipientName, phone: addr.phone, province: addr.province, district: addr.district, ward: addr.ward, streetAddress: addr.streetAddress } : { recipientName: user.fullName, phone: '0901234567', province: 'Hồ Chí Minh', district: 'Quận 1', ward: 'Bến Nghé', streetAddress: '1 Nguyễn Huệ' };
    try {
      const order = await createOrder({ user: user._id, items: [{ product: p._id, quantity: 1 }], shippingAddress, paymentMethod: i % 2 ? 'cod' : 'mock', idempotencyKey: key });
      await createPayment({ userId: user._id, orderId: order._id, method: order.paymentMethod });
      const fresh = await Order.findById(order._id).lean();
      for (let s = FLOW.indexOf(fresh.status) + 1; s < FLOW.length; s++) await updateOrder(order._id, FLOW[s]);
      deliveredPairs.add(`${user._id}:${p._id}`);
      extra++;
      bump('orders_extra_delivered');
    } catch (error) {
      console.log(`Extra order for ${user.email} skipped: ${error.message}`);
    }
  }

  // --- Reviews (~20, gắn đơn delivered) ---
  for (const [i, user] of customers.entries()) {
    const delivered = await Order.findOne({ user: user._id, status: 'delivered' }).sort({ createdAt: -1 }).lean();
    if (!delivered) continue;
    const productId = delivered.items[0].product;
    const dup = await Review.findOne({ user: user._id, product: productId }).select('_id').lean();
    if (dup) { skip('reviews'); continue; }
    try {
      const review = await createReview({
        user: user._id,
        product: productId,
        order: delivered._id,
        rating: 3 + (i % 3),
        comment: REVIEW_COMMENTS[i % REVIEW_COMMENTS.length]
      });
      if (i % 5 !== 4) await updateReview(review._id, true); // ~80% approved
      bump('reviews_new');
    } catch (error) {
      console.log(`Review for ${user.email} skipped: ${error.message}`);
      bump('reviews_skipped');
    }
  }

  console.log('\n=== DEMO DATA REPORT ===');
  console.log(JSON.stringify(stats, null, 2));
  const final = {
    categories: await Category.countDocuments(),
    products: await Product.countDocuments(),
    users: await User.countDocuments(),
    addresses: await Address.countDocuments(),
    carts: await Cart.countDocuments(),
    wishlists: await Wishlist.countDocuments(),
    orders: await Order.countDocuments(),
    payments: await Payment.countDocuments(),
    reviews: await Review.countDocuments(),
    vouchers: await Voucher.countDocuments(),
    inventories: await Inventory.countDocuments()
  };
  console.log('Final counts:', JSON.stringify(final));
}

try { await main(); } catch (error) { console.error('Demo seed failed:', error); process.exitCode = 1; } finally { await closeDatabase(); }
