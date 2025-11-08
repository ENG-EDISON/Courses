// api/LessonApis.js - Example structure
import apiClient from "../utils/Http";

export const createLesson = (data) =>apiClient.post('api/lesson/', data);
export const getLessons = (params = {}) => apiClient.get('/api/lesson/', { params });
export const getLessonById = (id) => apiClient.get(`/api/lesson/${id}/`);
export const updateLesson = (id, data) => apiClient.patch(`/api/lesson/${id}/`, data);
export const deleteLesson = (id) => apiClient.delete(`/api/lesson/${id}/`);
export const getLessonBySubsectionId=(id)=>apiClient.get(`api/lesson/?subsection=${id}`);
