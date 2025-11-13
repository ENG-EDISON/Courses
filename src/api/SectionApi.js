// src/api/SectionApi.js
import apiClient from "../utils/Http";

export const createSection = (data) => apiClient.post('api/section/', data);
export const getCourseSections = (courseId) => apiClient.get(`api/section/?course=${courseId}`);
export const getCourseSection = (sectionId) => apiClient.get(`api/section/${sectionId}/`);
export const updateSection = (id, data) => apiClient.patch(`/api/section/${id}/`, data);
export const deleteSection = (sectionId) => apiClient.delete(`/api/section/${sectionId}/`); // ✅ Fixed typo: deleSection → deleteSection
