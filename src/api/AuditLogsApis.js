import apiClient from "../utils/Http";

// ===== BASIC CRUD OPERATIONS =====
export const getAllAuditLogs = (params = {}) => 
  apiClient.get('api/admin/audit-logs/', { params });

export const getAuditLogById = (id) => 
  apiClient.get(`api/admin/audit-logs/${id}/`);

export const deleteAuditLog = (id) => 
  apiClient.delete(`api/admin/audit-logs/${id}/`);

// ===== STATISTICS & ANALYTICS =====
export const getAuditLogStats = (params = {}) => 
  apiClient.get('api/admin/audit-logs/stats/', { params });

export const getAuditLogActivityTimeline = (params = {}) => 
  apiClient.get('api/admin/audit-logs/activity_timeline/', { params });

export const getAuditLogQuickStats = (params = {}) => 
  apiClient.get('api/admin/audit-logs/quick_stats/', { params });

export const getAuditLogBulkOperations = (params = {}) => 
  apiClient.get('api/admin/audit-logs/bulk_operations/', { params });

// ===== CLEANUP OPERATIONS =====
export const cleanupAuditLogs = (params = {}) => 
  apiClient.delete('api/admin/audit-logs/cleanup/', { params });

// ===== SECURITY & MONITORING =====
export const searchSuspiciousAuditLogs = (params = {}) => 
  apiClient.get('api/admin/audit-logs/search_suspicious/', { params });

// ===== PAGINATION =====
export const getAuditLogPaginationInfo = () => 
  apiClient.get('api/admin/audit-logs/pagination_info/');

export const setAuditLogPageSize = (pageSize) => 
  apiClient.post('api/admin/audit-logs/set_page_size/', { page_size: pageSize });

// ===== USER-SPECIFIC OPERATIONS =====
export const getUserActivity = (id) => 
  apiClient.get(`api/admin/audit-logs/${id}/user_activity/`);

// ===== TIME-BASED OPERATIONS (DEDICATED ENDPOINTS) =====
export const getTodayAuditLogs = (params = {}) => 
  apiClient.get('api/admin/audit-logs/today/', { params });

export const getYesterdayAuditLogs = (params = {}) => 
  apiClient.get('api/admin/audit-logs/yesterday/', { params });

export const getLast7DaysAuditLogs = (params = {}) => 
  apiClient.get('api/admin/audit-logs/last_7_days/', { params });

export const getLast30DaysAuditLogs = (params = {}) => 
  apiClient.get('api/admin/audit-logs/last_30_days/', { params });

export const getThisMonthAuditLogs = (params = {}) => 
  apiClient.get('api/admin/audit-logs/this_month/', { params });

// ===== EXPORT OPERATIONS =====
// Use the main endpoint with export parameter
export const exportAuditLogs = (params = {}) => 
  apiClient.get('api/admin/audit-logs/', { 
    params: { ...params, export: 'csv' }
    // Don't set responseType here, let the backend handle content-type
  });

// ===== ADMIN UTILITIES =====
export const getAuditLogSystemHealth = () => 
  apiClient.get('api/admin/audit-logs/system_health/');

export const getAuditLogCleanupSuggestions = () => 
  apiClient.get('api/admin/audit-logs/cleanup_suggestions/');

// ===== FILTERING & SEARCH (DEDICATED ENDPOINTS) =====
export const getAuditLogFilters = () => 
  apiClient.get('api/admin/audit-logs/filters/');

export const searchAuditLogs = (query, params = {}) => 
  apiClient.get('api/admin/audit-logs/search/', { 
    params: { ...params, search: query }  // Changed from 'query' to 'search' to match Django view
  });

// ===== MODEL/ACTION/USER FILTERS (DEDICATED ENDPOINTS) =====
export const getAuditLogsByUser = (userId, params = {}) => 
  apiClient.get(`api/admin/audit-logs/user/${userId}/`, { params });

export const getAuditLogsByModel = (modelName, params = {}) => 
  apiClient.get(`api/admin/audit-logs/model/${modelName}/`, { params });

export const getAuditLogsByAction = (action, params = {}) => 
  apiClient.get(`api/admin/audit-logs/action/${action}/`, { params });