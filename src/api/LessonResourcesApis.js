import apiClient from "../utils/Http";

export const createLessonResource = (data) => apiClient.post('api/lesson-resources/', data);
export const getLessonRecource=()=>apiClient.get('api/lesson-resources');
export const getLessonRecourceById=(id)=>apiClient.get(`api/lesson-resources${id}`);
export const getLessourceResourceByLessonId=()=>apiClient.get()