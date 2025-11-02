import apiClient from "../utils/Http"; 

export const getAllCoursesCategories =()=>apiClient.get('/api/category/');
export const getCourseCategoryById=(id)=>apiClient.get(`/api/category/${id}/`);
export const updateCourseCategory=(id,data)=>apiClient.put(`/api/category/${id}/`,data);
export const deleteCourseCategory=(id)=>apiClient.delete(`/api/category/${id}/`);