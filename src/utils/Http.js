// utils/Http.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL:
    process.env.REACT_APP_API_PROD_URL ||
    process.env.REACT_APP_API_BASE_URL ||
    'http://127.0.0.1:8000'
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
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token refresh and redirect
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Prevent infinite loops - check if this is already a retry
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            const baseUrl =
              process.env.REACT_APP_API_PROD_URL ||
              process.env.REACT_APP_API_BASE_URL ||

              'http://127.0.0.1:8000';

            // FIX: Add leading slash to URL
            const response = await axios.post(
              `${baseUrl}/api/token/refresh/`,  // Added leading slash
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
          redirectToLogin();
        }
      } else {
        redirectToLogin();
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      redirectToLogin();
    }

    return Promise.reject(error);
  }
);

// Redirect to login function
const redirectToLogin = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  window.location.href = '/login';
};

export default apiClient;