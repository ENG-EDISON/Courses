import apiClient from "../utils/Http";
export const createSubSection = (data) =>apiClient.post('api/subsection/', data);
export const updateSubsection = (id, data) => apiClient.patch(`/api/subsection/${id}/`, data);
export const getCourseSubSections = (courseId) => apiClient.get(`api/sections/?course=${courseId}`);
export const getCourseSubSectionById= (sectionId) => apiClient.get(`api/sections/${sectionId}/`);
export const getSubsectionByCourseId =(courseId) =>apiClient.get(`api/subsection/?course=${courseId}`);
export const getSubsections = (sectionId) => apiClient.get(`api/subsection/?section=${sectionId}`);
export const deleteSubsection=(sectionId)=>apiClient.delete(`api/subsection/?section=${sectionId}`);