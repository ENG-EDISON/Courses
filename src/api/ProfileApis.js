import apiClient from "../utils/Http";

export const getMyProfile=()=>apiClient.get('api/user/profile/');
export const getMyEnrolledCourses=()=>apiClient.get('api/user/enrolled-courses/');