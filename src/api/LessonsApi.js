// api/LessonApis.js - Example structure
import apiClient from "../utils/Http";

export const createLesson = (data) => {
  const hasFile = data.video_file instanceof File;

  if (hasFile) {
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }

    return apiClient.post('api/lesson/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  } else {
    return apiClient.post('api/lesson/', data);
  }
};

export const getLessons = (params = {}) => apiClient.get('/api/lesson/', { params });
export const getLessonById = (id) => apiClient.get(`/api/lesson/${id}/`);
export const updateLesson = (id, data) => {
  const hasFile = data.video_file instanceof File;

  if (hasFile) {
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }

    return apiClient.patch(`/api/lesson/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  } else {
    return apiClient.patch(`/api/lesson/${id}/`, data);
  }
};

export const deleteLesson = (id) => apiClient.delete(`/api/lesson/${id}/`);
export const getLessonBySubsectionId=(id)=>apiClient.get(`api/lesson/?subsection=${id}`);
