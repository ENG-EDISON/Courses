// utils/Http.js - CORRECT endpoints (use /api/course/ not /api/courses/)
import apiClient from "../utils/Http"; 

// Category endpoints
export const getAllCoursesCategories = () => apiClient.get('/api/category/');
export const getCourseCategoryById = (id) => apiClient.get(`/api/category/${id}/`);
export const createCourseCategory = (data) => apiClient.post('/api/category/', data);
export const updateCourseCategory = (id, data) => apiClient.put(`/api/category/${id}/`, data);
export const deleteCourseCategory = (id) => apiClient.delete(`/api/category/${id}/`);

// Course endpoints - FIXED: use /api/course/ NOT /api/courses/
export const getCoursesByCategorySlug = (categorySlug) => 
  apiClient.get('/api/course/', { 
    params: { category_slug: categorySlug }  // FIXED: category__slug not category_slug
  });
export const getCoursesByCategoryId = (categoryId) => 
  apiClient.get('/api/course/', { params: { category: categoryId } });

export const getCourseById = (id) => apiClient.get(`/api/course/${id}/`);
export const updateCourse = (id, data) => apiClient.put(`/api/course/${id}/`, data);

