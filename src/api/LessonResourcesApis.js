// src/api/LessonResourceApi.js
import apiClient from "../utils/Http";

export const createLessonResource = (data) => {
  const hasFile = data.file instanceof File;

  if (hasFile) {
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }
    return apiClient.post('api/lesson-resources/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  } else {
    return apiClient.post('api/lesson-resources/', data);
  }
};

export const updateLessonResource = (id, data) => {
  const hasFile = data.file instanceof File;

  if (hasFile) {
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }
    return apiClient.patch(`api/lesson-resources/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  } else {
    return apiClient.patch(`api/lesson-resources/${id}/`, data);
  }
};

export const getLessonResource = () => apiClient.get('api/lesson-resources/');
export const getLessonResourceById = (id) => apiClient.get(`api/lesson-resources/${id}/`);
export const getLessonResourceByLessonId = (lessonId) => apiClient.get(`api/lesson-resources/?lesson=${lessonId}`);
export const deleteLessonResource = (id) => apiClient.delete(`api/lesson-resources/${id}/`);