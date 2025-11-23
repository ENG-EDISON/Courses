import apiClient from "../utils/Http";

export const getAllUsers = () => apiClient.get('api/user/');
export const getUserById = (id) => apiClient.get(`api/user/${id}/`);
export const createUser = (data) => apiClient.post('api/user/', data);
export const updateUser = (id, data) => apiClient.patch(`api/user/${id}/`, data);
export const deactivateUser = (id) => apiClient.patch(`api/user/${id}/`, { is_active: false });
export const activateUser = (id) => apiClient.patch(`api/user/${id}/`, { is_active: true });
export const deleteUser = (id) => apiClient.delete(`api/user/${id}/`);