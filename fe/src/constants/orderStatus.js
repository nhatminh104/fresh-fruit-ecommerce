// Trạng thái đơn hàng — phải khớp Order.allowedTransitions trong be/src/modules/orders/order.model.js
export const ORDER_STATUS_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipping', 'cancelled'],
  shipping: ['delivered'],
  delivered: [],
  cancelled: [],
};

export const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'shipping', label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'cancelled', label: 'Đã hủy' },
];

export const ORDER_ACTION_STYLE = {
  cancelled: 'danger',
  confirmed: 'primary',
  shipping: 'primary',
  delivered: 'secondary',
};
