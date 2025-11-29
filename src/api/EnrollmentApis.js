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
