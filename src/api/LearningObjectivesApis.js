import apiClient from "../utils/Http";

export const createObjective = (data) => {
  return apiClient.post('/api/learningobjective/', data);
};

export const updateObjective = (id, data) => {
  return apiClient.patch(`/api/learningobjective/${id}/`, data);
};

export const deleteObjective = (id) => {
  return apiClient.delete(`/api/learningobjective/${id}`);
};

export const getObjectiveByCourseId = (courseId) => {
  return apiClient.get(`/api/learningobjective/?course=${courseId}`);
};

export const updateObjectiveOrder = (objectives) => {
  const updates = objectives.map(obj => 
    updateObjective(obj.id, { order: obj.order })
  );
  
  return Promise.all(updates);
};

export const batchUpdateObjectives = (updates) => {
  const promises = updates.map(update => 
    apiClient.patch(`/api/learningobjective/${update.id}`, update.data)
  );
  
  return Promise.all(promises);
};