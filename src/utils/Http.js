// utils/Http.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL
  // baseURL: process.env.REACT_APP_API_BASE_URL || 'http://161.35.24.106/'
});

// Add a request interceptor to include the token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh and redirect
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            const response = await axios.post(
              `${process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/'}api/token/refresh/`,
              { refresh: refreshToken }
            );
            
            const newAccessToken = response.data.access;
            localStorage.setItem('access_token', newAccessToken);
            
            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
          } else {
            // No refresh token, redirect to login
            redirectToLogin();
          }
        } catch (refreshError) {
          // Refresh failed, redirect to login
          console.log('Token refresh failed, redirecting to login');
          redirectToLogin();
        }
      } else {
        // Already tried refresh, redirect to login
        console.log('Token refresh already attempted, redirecting to login');
        redirectToLogin();
      }
    }
    
    // Handle 403 Forbidden (also redirect to login)
    if (error.response?.status === 403) {
      console.log('Access forbidden, redirecting to login');
      redirectToLogin();
    }
    
    return Promise.reject(error);
  }
);

// Redirect to login function
const redirectToLogin = () => {
  // Clear tokens
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  
  // Redirect to login page
  window.location.href = '/login';
};

export default apiClient;