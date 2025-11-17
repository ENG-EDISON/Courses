// services/contactService.js
import apiClient from "../utils/Http";

export const getAllMessages = () => apiClient.get('api/contact-messages/');

export const getMessageById = (id) => apiClient.get(`api/contact-messages/${id}/`);

export const createMessage = (messageData) => apiClient.post('api/contact-messages/', messageData);

export const updateMessage = (id, messageData) => apiClient.put(`api/contact-messages/${id}/`, messageData);

export const deleteMessage = (id) => apiClient.delete(`api/contact-messages/${id}/`);

export const markAsRead = (id) => apiClient.post(`api/contact-messages/${id}/mark-read/`);

export const markAsResponded = (id, notes = '') => 
  apiClient.post(`api/contact-messages/${id}/mark-responded/`, { response_notes: notes });

export const partialUpdateMessage = (id, updates) => 
  apiClient.patch(`api/contact-messages/${id}/`, updates);

// Bulk operations
export const bulkMarkAsRead = (ids) => 
  apiClient.post('api/contact-messages/bulk-mark-read/', { ids });

export const bulkMarkAsResponded = (ids) => 
  apiClient.post('api/contact-messages/bulk-mark-responded/', { ids });

export const bulkDeleteMessages = (ids) => 
  apiClient.post('api/contact-messages/bulk-delete/', { ids });

// Filtered queries
export const getUnreadMessages = () => 
  apiClient.get('api/contact-messages/?is_read=false');

export const getUnrespondedMessages = () => 
  apiClient.get('api/contact-messages/?responded=false');

export const getMessagesByEmail = (email) => 
  apiClient.get(`api/contact-messages/?customer_email=${email}`);

// Statistics
export const getMessagesStats = () => 
  apiClient.get('api/contact-messages/stats/');