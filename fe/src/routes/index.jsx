import { Navigate, useLocation } from 'react-router-dom';
import Loading from '../components/common/Loading';
import { useAuth } from '../hooks/useAuth';
import Login from '../pages/auth/Login';
import AdminLogin from '../pages/auth/AdminLogin';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import Products from '../pages/user/ProductsPageVi';
import Categories from '../pages/user/CategoriesPage';
import ProductDetail from '../pages/user/ProductDetailFullPage';
import SearchResults from '../pages/user/ProductsPageVi';
import Cart from '../pages/user/CartPage';
import Checkout from '../pages/user/CheckoutPage';
import PaymentResult from '../pages/user/PaymentResultPage';
import Orders from '../pages/user/OrdersPage';
import OrderDetail from '../pages/user/OrderDetailPage';
import Wishlist from '../pages/user/WishlistPage';
import Vouchers from '../pages/user/VouchersPage';
import Reviews from '../pages/user/ReviewsPage';
import AccountProfile from '../pages/user/AccountProfile';
import AccountAddresses from '../pages/user/AccountAddresses';
import About from '../pages/user/About';
import Contact from '../pages/user/Contact';
import FAQ from '../pages/user/FAQ';
import ShippingPolicy from '../pages/user/ShippingPolicy';
import ReturnPolicy from '../pages/user/ReturnPolicy';
import PrivacyPolicy from '../pages/user/PrivacyPolicy';
import Terms from '../pages/user/Terms';
import AdminProducts from '../pages/admin/Products';
import ProductForm from '../pages/admin/ProductForm';
import AdminCategories from '../pages/admin/Categories';
import CategoryForm from '../pages/admin/CategoryForm';
import AdminOrders from '../pages/admin/Orders';
import AdminOrderDetail from '../pages/admin/OrderDetail';
import Users from '../pages/admin/Users';
import UserDetail from '../pages/admin/UserDetail';
import AdminReviews from '../pages/admin/Reviews';
import AdminVouchers from '../pages/admin/Vouchers';
import VoucherForm from '../pages/admin/VoucherForm';
import Inventory from '../pages/admin/Inventory';

export function RequireAuth({ children }) {
  const { user, initializing } = useAuth();
  const location = useLocation();
  if (initializing) return <Loading />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

export function RequireCustomer({ children }) {
  const { user, initializing } = useAuth();
  const location = useLocation();
  if (initializing) return <Loading />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (user.role !== 'customer') return <Navigate to="/admin" replace />;
  return children;
}

export function RequireAdmin({ children }) {
  const { user, initializing } = useAuth();
  const location = useLocation();
  if (initializing) return <Loading />;
  if (!user) return <Navigate to="/admin-login" replace state={{ from: location }} />;
  if (user.role !== 'admin') return <Navigate to="/unauthorized" replace />;
  return children;
}

export const publicRoutes = [
  ['/products', Products],
  ['/categories', Categories],
  ['/products/:id', ProductDetail],
  ['/search', SearchResults],
  ['/vouchers', Vouchers],
  ['/about', About],
  ['/contact', Contact],
  ['/faq', FAQ],
  ['/shipping-policy', ShippingPolicy],
  ['/return-policy', ReturnPolicy],
  ['/privacy-policy', PrivacyPolicy],
  ['/terms', Terms],
];

export const protectedRoutes = [
  ['/cart', Cart],
  ['/checkout', Checkout],
  ['/payment-result', PaymentResult],
  ['/orders', Orders],
  ['/orders/:id', OrderDetail],
  ['/wishlist', Wishlist],
  ['/reviews', Reviews],
  ['/profile', AccountProfile],
  ['/addresses', AccountAddresses],
];

export const authRoutes = [
  ['/login', Login],
  ['/admin-login', AdminLogin],
  ['/register', Register],
  ['/forgot-password', ForgotPassword],
  ['/reset-password', ResetPassword],
];

export const adminRoutes = [
  ['products', AdminProducts],
  ['products/new', ProductForm],
  ['products/:id/edit', ProductForm],
  ['categories', AdminCategories],
  ['categories/new', CategoryForm],
  ['categories/:id/edit', CategoryForm],
  ['orders', AdminOrders],
  ['orders/:id', AdminOrderDetail],
  ['users', Users],
  ['users/:id', UserDetail],
  ['reviews', AdminReviews],
  ['vouchers', AdminVouchers],
  ['vouchers/new', VoucherForm],
  ['vouchers/:id/edit', VoucherForm],
  ['inventory', Inventory],
];
