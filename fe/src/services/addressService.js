import api from './api';
export const getAddresses = () => api.get('/addresses');
export const createAddress = (payload) => api.post('/addresses', payload);
