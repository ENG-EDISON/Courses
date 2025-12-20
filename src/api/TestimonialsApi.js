import apiClient from "../utils/Http";

// ===== PUBLIC ENDPOINTS =====

// In TestimonialsApi.js
export const createTestimonial =(testimonialData) =>apiClient.post('api/admin/testimonials/', testimonialData);

export const getTestimonials = () => apiClient.get('api/testimonials/');

export const getFeaturedTestimonials = (limit = 3) => 
  apiClient.get('api/testimonials/featured/', { params: { limit } });

export const getTestimonial = (id) => apiClient.get(`api/testimonials/${id}/`);

export const submitTestimonial = (formData) => 
  apiClient.post('api/testimonials/submit/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

// ===== ADMIN ENDPOINTS =====

export const getAllTestimonials = () => apiClient.get('api/admin/testimonials/');

export const getAdminTestimonial = (id) => 
  apiClient.get(`api/admin/testimonials/${id}/`);

export const updateTestimonial = (id, data) => 
  apiClient.patch(`api/admin/testimonials/${id}/`, data);

export const deleteTestimonial = (id) => 
  apiClient.delete(`api/admin/testimonials/${id}/`);

export const approveTestimonial = (id) => 
  apiClient.post(`api/admin/testimonials/${id}/approve/`);

export const featureTestimonial = (id, order = 0) => 
  apiClient.post(`api/admin/testimonials/${id}/feature/`, { order });

export const rejectTestimonial = (id) => 
  apiClient.post(`api/admin/testimonials/${id}/reject/`);