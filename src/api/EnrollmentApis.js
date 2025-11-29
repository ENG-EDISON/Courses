import apiClient from "../utils/Http";
// export const getCourseSection=(id)=>apiClient.get(`/api/section/${id}`);
// export const getCourseSections=(id)=>apiClient.get(`/api/section/?course=${id}`);
// export const updteCourseSection=(id,data)=>apiClient.put(`/api/section/${id}`,data);
// export const deleteCourseSection=(id)=>apiClient.delete(`/api/section/${id}`);

export const getAllenrollements = () => apiClient.get('/api/enrollment/');
export const getMyEnrollments = () => apiClient.get('/api/my-enrollments/');
export const EnrollToCourse = (courseId) => apiClient.post(`/api/enroll/${courseId}/`);
export const checkEnrollment = (courseId) => apiClient.get(`/api/check-enrollment/${courseId}/`);
export const getEnrollmentDetails = (enrollmentId) => apiClient.get(`/api/enrollment/${enrollmentId}/`);
export const updateEnrollment = (enrollmentId, data) => apiClient.patch(`/api/enrollment/${enrollmentId}/`, data);
export const cancelEnrollment = (enrollmentId) => apiClient.delete(`/api/enrollment/${enrollmentId}/`);

// Get enrolled courses for CURRENT user
export const getMyEnrolledCourses = () => apiClient.get('/api/user/enrolled-courses/');

// Get enrolled courses for specific user
export const getUserEnrolledCourses = (userId) => 
  apiClient.get(`/api/enrollments/user/${userId}/courses/`);

// Get courses not enrolled by specific user
export const getUserNotEnrolledCourses = (userId, filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.category_slug) params.append('category_slug', filters.category_slug);
  if (filters.level) params.append('level', filters.level);
  
  const queryString = params.toString();
  const url = `/api/courses/not-enrolled/user/${userId}/${queryString ? `?${queryString}` : ''}`;
  
  return apiClient.get(url);
};