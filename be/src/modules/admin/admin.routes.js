import { Router } from 'express';
import * as controller from './admin.controller.js';

const router = Router();
router.get('/dashboard', controller.dashboard);
router.get('/products', controller.products); router.post('/products', controller.createProduct); router.patch('/products/:id', controller.updateProduct); router.delete('/products/:id', controller.deleteProduct);
router.get('/categories', controller.categories); router.post('/categories', controller.createCategory); router.patch('/categories/:id', controller.updateCategory); router.delete('/categories/:id', controller.deleteCategory);
router.get('/orders', controller.orders); router.get('/orders/:id', controller.orderDetail); router.patch('/orders/:id', controller.updateOrder);
router.get('/users', controller.users); router.get('/users/:id', controller.userDetail); router.patch('/users/:id', controller.updateUser);
router.get('/reviews', controller.reviews); router.patch('/reviews/:id', controller.updateReview); router.delete('/reviews/:id', controller.deleteReview);
router.get('/vouchers', controller.vouchers); router.post('/vouchers', controller.createVoucher); router.patch('/vouchers/:id', controller.updateVoucher); router.delete('/vouchers/:id', controller.deleteVoucher);
router.get('/inventory', controller.inventory); router.patch('/inventory/:productId', controller.updateInventory);
export default router;
