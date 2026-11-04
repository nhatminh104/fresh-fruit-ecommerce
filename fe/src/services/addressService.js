import api from './api';
export const getAddresses = () => api.get('/addresses');
export const createAddress = (payload) => api.post('/addresses', payload);
export const updateAddress = (id, payload) => api.patch('/addresses/' + id, payload);
export const deleteAddress = (id) => api.delete('/addresses/' + id);
