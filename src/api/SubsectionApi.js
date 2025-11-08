import apiClient from "../utils/Http";

export const createSubSection = (data) =>apiClient.post('api/subsection/', data);
export const getCourseSubSections = (courseId) => apiClient.get(`api/sections/?course=${courseId}`);
export const getCourseSubSectionById= (sectionId) => apiClient.get(`api/sections/${sectionId}/`);
export const getSubsectionByCourseId =(courseId) =>apiClient.get(`api/subsection/?course=${courseId}`);
export const getSubsections = (sectionId) => apiClient.get(`api/subsection/?section=${sectionId}`);
