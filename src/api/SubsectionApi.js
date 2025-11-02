import apiClient from "../utils/Http";

export const getCourseSections = (courseId) => apiClient.get(`api/sections/?course=${courseId}`);
export const getCourseSection = (sectionId) => apiClient.get(`api/sections/${sectionId}/`);
export const getSubsections = (sectionId) => apiClient.get(`api/subsections/?section=${sectionId}`);
export const getLessons = (subsectionId) => apiClient.get(`api/lessons/?subsection=${subsectionId}`);