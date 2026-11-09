# Fresh Fruit

Nền tảng thương mại điện tử trái cây tươi, cấu trúc MERN + Vite/Tailwind. Frontend dùng React/Vite, backend dùng Express/Mongoose và các luồng mua hàng chính được kết nối với MongoDB.

## Chạy local

```bash
npm install
npm --prefix fe install
npm --prefix be install
npm run dev
```

Frontend chạy ở `http://localhost:5173`, backend ở `http://localhost:5000`. Trước khi chạy, sao chép `.env.example` thành `.env` ở root và cấu hình `MONGODB_URI`; server cũng hỗ trợ `.env` cũ trong `be/`.

## Kiểm tra chất lượng

```bash
npm --prefix be test
npm --prefix be run check
npm --prefix fe run build
```

MongoDB standalone được hỗ trợ cho phát triển. Production nên chạy MongoDB replica set để transaction tạo/hủy đơn, tồn kho và voucher có tính nguyên tử đầy đủ.

Tài liệu và quy tắc project được gom tại [PROJECT_GUIDELINES.md](PROJECT_GUIDELINES.md).
