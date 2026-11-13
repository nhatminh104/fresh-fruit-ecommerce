import api from './api';

const unwrap = (request) => request.then((response) => response.data.data);

export const login = (payload) => unwrap(api.post('/auth/login', payload));
export const register = (payload) => unwrap(api.post('/auth/register', payload));
export const refresh = (refreshToken) =>
  unwrap(api.post('/auth/refresh', { refreshToken }, { skipAuth: true, skipAuthRefresh: true }));
export const logout = (refreshToken) => unwrap(api.post('/auth/logout', { refreshToken }, { skipAuthRefresh: true }));
export const getCurrentUser = () => unwrap(api.get('/auth/me'));
export const forgotPassword = (email) => unwrap(api.post('/auth/forgot-password', { email }));
export const resetPassword = (payload) => unwrap(api.post('/auth/reset-password', payload));
export const logoutAll = () => unwrap(api.post('/auth/logout-all'));
export const changePassword = (payload) => unwrap(api.post('/auth/change-password', payload));
