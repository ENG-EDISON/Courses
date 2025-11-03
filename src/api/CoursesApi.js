import apiClient from "../utils/Http";
export const getAllCourses=()=>apiClient.get('/api/course/');
export const getCourseFullStructure = (id) =>apiClient.get(`api/courses/${id}/full-structure/`);
export const getCoursepreviewStructure = (id) =>apiClient.get(`api/courses/${id}/preview/`);
export const getCoursebyId=(id)=>apiClient.get(`/api/course/${id}`);
export const updateCourse=(id,data)=>apiClient.put(`/api/course/${id}`,data);
export const getFeaturedCourses = () => apiClient.get('api/courses/?is_featured=true');
export const getCoursesByCategory = (categorySlug) => apiClient.get(`api/courses/?category__slug=${categorySlug}`);
export const searchCourses = (query) => apiClient.get(`api/courses/?search=${query}`);