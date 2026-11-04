import api from './api';

const unwrap = (request) => request.then((response) => response.data.data);

export const getProfile = () => unwrap(api.get('/users/me'));
export const updateProfile = (payload) => unwrap(api.patch('/users/me', payload));
