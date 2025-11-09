import apiClient from "../utils/Http";

export const getAllCourses = () => apiClient.get('/api/course/');
export const getAllCoursesCardView=()=>apiClient.get('api/courses/card-view/');
export const getMyCoursesAsInstructor=()=>apiClient.get('/courses/my-courses/');
export const getCourseFullStructure = (id) => apiClient.get(`/api/courses/${id}/full-structure/`);
export const getCoursePreviewStructure = (id) => apiClient.get(`/api/courses/${id}/preview/`);
export const createCourse = (data) => {
  console.log("🚀 Creating course with data:", data);
  console.log("📋 Data breakdown:");
  Object.keys(data).forEach(key => {
    console.log(`  ${key}:`, data[key], `(type: ${typeof data[key]})`);
  });
  
  return apiClient.post('/api/course/', data);
};
export const deleteCourse = (id) => apiClient.delete(`/api/course/${id}/`);
export const getCoursebyId = (id) => apiClient.get(`/api/course/${id}/`); // ADDED trailing slash
export const updateCourse = (id, data) => apiClient.patch(`/api/course/${id}/`, data); // ADDED trailing slash
export const getFeaturedCourses = () => apiClient.get('/api/courses/?is_featured=true'); // ADDED leading slash
export const getCoursesByCategory = (categorySlug) => apiClient.get('/api/course/', { params: { category_slug: categorySlug }});
export const searchCourses = (query) => apiClient.get(`/api/courses/?search=${query}`); // ADDED leading slash