// api/auth.js
import apiClient from "../utils/Http";

export const login = (credentials) => apiClient.post('api/login/', credentials);
export const refresh = () => {
  const refresh_token = localStorage.getItem('refresh_token');
  return apiClient.post('api/token/refresh/', { refresh: refresh_token });
};

export const logout = () => {
  const refresh_token = localStorage.getItem('refresh_token');
  return apiClient.post('api/logout/', { refresh: refresh_token });
};