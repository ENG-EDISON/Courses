import apiClient from "../utils/Http";

export const createObjective =()=>apiClient.post('/api/learningobjective/');
export const updateObjective=(id)=>apiClient.patch(`/api/learningobjective/${id}`);
export const getAllObjectives=() =>apiClient.get('/api/learningobjective/');
export const getObjeciveById=(id) =>apiClient.get(`/api/learningobjective/${id}`)
export const deleteObjective=(id)=>apiClient.delete(`/api/learningobjective/${id}`);
export const getObjectiveByCourseId=(courseId)=>apiClient.get(`/api/learningobjective/?course=${courseId}`);
