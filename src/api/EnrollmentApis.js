import Course from "../components/Course";
import apiClient from "../utils/Http";

export const getCourseSection=(id)=>apiClient.get(`/api/section/${id}`);
export const getCourseSections=(id)=>apiClient.get(`/api/section/?course=${id}`);
export const updteCourseSection=(id,data)=>apiClient.put(`/api/section/${id}`,data);
export const deleteCourseSection=(id)=>apiClient.delete(`/api/section/${id}`);
