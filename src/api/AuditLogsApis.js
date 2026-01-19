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

// ===== TIME-BASED OPERATIONS (USE QUERY PARAMETERS) =====
export const getTodayAuditLogs = (params = {}) => 
  apiClient.get('api/admin/audit-logs/', { 
    params: { ...params, date_range: 'today' } 
  });

export const getYesterdayAuditLogs = (params = {}) => 
  apiClient.get('api/admin/audit-logs/', { 
    params: { ...params, date_range: 'yesterday' } 
  });

export const getLast7DaysAuditLogs = (params = {}) => 
  apiClient.get('api/admin/audit-logs/', { 
    params: { ...params, date_range: 'last_7_days' } 
  });

export const getLast30DaysAuditLogs = (params = {}) => 
  apiClient.get('api/admin/audit-logs/', { 
    params: { ...params, date_range: 'last_30_days' } 
  });

export const getThisMonthAuditLogs = (params = {}) => 
  apiClient.get('api/admin/audit-logs/', { 
    params: { ...params, date_range: 'this_month' } 
  });

// ===== EXPORT OPERATIONS =====
export const exportAuditLogs = (params = {}) => 
  apiClient.get('api/admin/audit-logs/', { 
    params: { ...params, export: 'csv' },
    responseType: 'blob'
  });

// ===== ADMIN UTILITIES =====
export const getAuditLogSystemHealth = () => 
  apiClient.get('api/admin/audit-logs/system_health/');

export const getAuditLogCleanupSuggestions = () => 
  apiClient.get('api/admin/audit-logs/cleanup_suggestions/');

// ===== FILTERING & SEARCH (USE MAIN ENDPOINT WITH QUERY PARAMS) =====
export const getAuditLogFilters = () => 
  apiClient.get('api/admin/audit-logs/filters/');

export const searchAuditLogs = (query, params = {}) => 
  apiClient.get('api/admin/audit-logs/', { 
    params: { ...params, search: query } 
  });

// ===== MODEL/ACTION/USER FILTERS (USE QUERY PARAMS) =====
export const getAuditLogsByUser = (userId, params = {}) => 
  apiClient.get('api/admin/audit-logs/', { 
    params: { ...params, user_id: userId } 
  });

export const getAuditLogsByModel = (modelName, params = {}) => 
  apiClient.get('api/admin/audit-logs/', { 
    params: { ...params, model_name: modelName } 
  });

export const getAuditLogsByAction = (action, params = {}) => 
  apiClient.get('api/admin/audit-logs/', { 
    params: { ...params, action: action } 
  });

// ===== REMOVE THESE - THEY DON'T EXIST =====
// export const getUserActivityByUsername = (username) => 
//   apiClient.get(`api/admin/audit-logs/user/${username}/activity/`);