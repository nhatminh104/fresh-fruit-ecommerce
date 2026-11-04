import api from './api';

const unwrap = (request) => request.then((response) => response.data.data);
export const listAdmin = (resource) => unwrap(api.get(`/admin/${resource}`));
export const createAdmin = (resource, payload) => unwrap(api.post(`/admin/${resource}`, payload));
export const updateAdmin = (resource, id, payload) => unwrap(api.patch(`/admin/${resource}/${id}`, payload));
export const deleteAdmin = (resource, id) => unwrap(api.delete(`/admin/${resource}/${id}`));
