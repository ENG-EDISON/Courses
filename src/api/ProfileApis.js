import apiClient from "../utils/Http";

export const getMyProfile = () => apiClient.get('api/user/profile/');
export const updateProfile = (data) => apiClient.patch('api/user/profile/', data);
export const changePassword = (data) => apiClient.post('api/user/change-password/', data);
export const getMyEnrolledCourses = () => apiClient.get('api/user/enrolled-courses/');