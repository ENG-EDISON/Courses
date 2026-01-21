// import apiClient from "../utils/Http";

// // ===== BASIC CRUD OPERATIONS =====
// export const getAllAuditLogs = (params = {}) => 
//   apiClient.get('api/admin/audit-logs/', { params });

// export const getAuditLogById = (id) => 
//   apiClient.get(`api/admin/audit-logs/${id}/`);

// export const deleteAuditLog = (id) => 
//   apiClient.delete(`api/admin/audit-logs/${id}/`);

// // ===== STATISTICS & ANALYTICS =====
// export const getAuditLogStats = (params = {}) => 
//   apiClient.get('api/admin/audit-logs/stats/', { params });

// export const getAuditLogActivityTimeline = (params = {}) => 
//   apiClient.get('api/admin/audit-logs/activity_timeline/', { params });

// export const getAuditLogQuickStats = (params = {}) => 
//   apiClient.get('api/admin/audit-logs/quick_stats/', { params });

// export const getAuditLogBulkOperations = (params = {}) => 
//   apiClient.get('api/admin/audit-logs/bulk_operations/', { params });

// // ===== CLEANUP OPERATIONS =====
// export const cleanupAuditLogs = (params = {}) => 
//   apiClient.delete('api/admin/audit-logs/cleanup/', { params });

// // ===== SECURITY & MONITORING =====
// export const searchSuspiciousAuditLogs = (params = {}) => 
//   apiClient.get('api/admin/audit-logs/search_suspicious/', { params });

// // ===== PAGINATION =====
// export const getAuditLogPaginationInfo = () => 
//   apiClient.get('api/admin/audit-logs/pagination_info/');

// export const setAuditLogPageSize = (pageSize) => 
//   apiClient.post('api/admin/audit-logs/set_page_size/', { page_size: pageSize });

// // ===== USER-SPECIFIC OPERATIONS =====
// export const getUserActivity = (id) => 
//   apiClient.get(`api/admin/audit-logs/${id}/user_activity/`);

// // ===== TIME-BASED OPERATIONS (USE QUERY PARAMETERS) =====
// export const getTodayAuditLogs = (params = {}) => 
//   apiClient.get('api/admin/audit-logs/', { 
//     params: { ...params, date_range: 'today' } 
//   });

// export const getYesterdayAuditLogs = (params = {}) => 
//   apiClient.get('api/admin/audit-logs/', { 
//     params: { ...params, date_range: 'yesterday' } 
//   });

// export const getLast7DaysAuditLogs = (params = {}) => 
//   apiClient.get('api/admin/audit-logs/', { 
//     params: { ...params, date_range: 'last_7_days' } 
//   });

// export const getLast30DaysAuditLogs = (params = {}) => 
//   apiClient.get('api/admin/audit-logs/', { 
//     params: { ...params, date_range: 'last_30_days' } 
//   });

// export const getThisMonthAuditLogs = (params = {}) => 
//   apiClient.get('api/admin/audit-logs/', { 
//     params: { ...params, date_range: 'this_month' } 
//   });

// // ===== EXPORT OPERATIONS =====
// export const exportAuditLogs = (params = {}) => 
//   apiClient.get('api/admin/audit-logs/', { 
//     params: { ...params, export: 'csv' },
//     responseType: 'blob'
//   });

// // ===== ADMIN UTILITIES =====
// export const getAuditLogSystemHealth = () => 
//   apiClient.get('api/admin/audit-logs/system_health/');

// export const getAuditLogCleanupSuggestions = () => 
//   apiClient.get('api/admin/audit-logs/cleanup_suggestions/');

// // ===== FILTERING & SEARCH (USE MAIN ENDPOINT WITH QUERY PARAMS) =====
// export const getAuditLogFilters = () => 
//   apiClient.get('api/admin/audit-logs/filters/');

// export const searchAuditLogs = (query, params = {}) => 
//   apiClient.get('api/admin/audit-logs/', { 
//     params: { ...params, search: query } 
//   });

// // ===== MODEL/ACTION/USER FILTERS (USE QUERY PARAMS) =====
// export const getAuditLogsByUser = (userId, params = {}) => 
//   apiClient.get('api/admin/audit-logs/', { 
//     params: { ...params, user_id: userId } 
//   });

// export const getAuditLogsByModel = (modelName, params = {}) => 
//   apiClient.get('api/admin/audit-logs/', { 
//     params: { ...params, model_name: modelName } 
//   });

// export const getAuditLogsByAction = (action, params = {}) => 
//   apiClient.get('api/admin/audit-logs/', { 
//     params: { ...params, action: action } 
//   });

// // ===== REMOVE THESE - THEY DON'T EXIST =====
// // export const getUserActivityByUsername = (username) => 
// //   apiClient.get(`api/admin/audit-logs/user/${username}/activity/`);
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
export const exportAuditLogs = (params = {}) => 
  apiClient.get('api/admin/audit-logs/', { 
    params: { ...params, export: 'csv' },
    responseType: 'blob'
  });

export const exportTodayAuditLogs = (params = {}) => 
  apiClient.get('api/admin/audit-logs/today/', { 
    params: { ...params, export: 'csv' },
    responseType: 'blob'
  });

export const exportYesterdayAuditLogs = (params = {}) => 
  apiClient.get('api/admin/audit-logs/yesterday/', { 
    params: { ...params, export: 'csv' },
    responseType: 'blob'
  });

export const exportLast7DaysAuditLogs = (params = {}) => 
  apiClient.get('api/admin/audit-logs/last_7_days/', { 
    params: { ...params, export: 'csv' },
    responseType: 'blob'
  });

export const exportLast30DaysAuditLogs = (params = {}) => 
  apiClient.get('api/admin/audit-logs/last_30_days/', { 
    params: { ...params, export: 'csv' },
    responseType: 'blob'
  });

export const exportThisMonthAuditLogs = (params = {}) => 
  apiClient.get('api/admin/audit-logs/this_month/', { 
    params: { ...params, export: 'csv' },
    responseType: 'blob'
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
    params: { ...params, query: query } 
  });

// ===== MODEL/ACTION/USER FILTERS (DEDICATED ENDPOINTS) =====
export const getAuditLogsByUser = (userId, params = {}) => 
  apiClient.get(`api/admin/audit-logs/user/${userId}/`, { params });

export const getAuditLogsByModel = (modelName, params = {}) => 
  apiClient.get(`api/admin/audit-logs/model/${modelName}/`, { params });

export const getAuditLogsByAction = (action, params = {}) => 
  apiClient.get(`api/admin/audit-logs/action/${action}/`, { params });

// ===== BULK OPERATIONS =====
export const deleteMultipleAuditLogs = (ids) => 
  apiClient.post('api/admin/audit-logs/bulk_delete/', { ids });

export const exportMultipleAuditLogs = (ids, format = 'csv') => 
  apiClient.post(`api/admin/audit-logs/bulk_export/${format}/`, { ids });

// ===== ARCHIVE OPERATIONS =====
export const archiveOldAuditLogs = (daysOld = 90) => 
  apiClient.post('api/admin/audit-logs/archive/', { days_old: daysOld });

export const getArchivedAuditLogs = (params = {}) => 
  apiClient.get('api/admin/audit-logs/archived/', { params });

export const restoreArchivedAuditLog = (id) => 
  apiClient.post(`api/admin/audit-logs/archived/${id}/restore/`);

// ===== SUMMARY & DASHBOARD ENDPOINTS =====
export const getAuditLogSummary = (period = 'daily') => 
  apiClient.get(`api/admin/audit-logs/summary/${period}/`);

export const getTopUsersByActivity = (limit = 10) => 
  apiClient.get('api/admin/audit-logs/top_users/', { params: { limit } });

export const getTopModelsByActivity = (limit = 10) => 
  apiClient.get('api/admin/audit-logs/top_models/', { params: { limit } });

// ===== REALTIME MONITORING =====
export const getRealTimeActivity = () => 
  apiClient.get('api/admin/audit-logs/realtime/');

export const subscribeToAuditLogUpdates = () => 
  apiClient.get('api/admin/audit-logs/updates/');

// ===== AUDIT LOG CONFIGURATION =====
export const getAuditLogConfig = () => 
  apiClient.get('api/admin/audit-logs/config/');

export const updateAuditLogConfig = (config) => 
  apiClient.put('api/admin/audit-logs/config/', config);

// ===== NOTIFICATION ENDPOINTS =====
export const getAuditLogAlerts = (params = {}) => 
  apiClient.get('api/admin/audit-logs/alerts/', { params });

export const markAlertAsRead = (alertId) => 
  apiClient.put(`api/admin/audit-logs/alerts/${alertId}/read/`);

export const getUnreadAlertCount = () => 
  apiClient.get('api/admin/audit-logs/alerts/unread_count/');

// ===== COMPLIANCE & REPORTING =====
export const generateComplianceReport = (startDate, endDate) => 
  apiClient.get('api/admin/audit-logs/compliance_report/', {
    params: { start_date: startDate, end_date: endDate },
    responseType: 'blob'
  });

export const getAuditLogRetentionPolicy = () => 
  apiClient.get('api/admin/audit-logs/retention_policy/');

// ===== BACKUP & RESTORE =====
export const backupAuditLogs = () => 
  apiClient.get('api/admin/audit-logs/backup/', { responseType: 'blob' });

export const restoreAuditLogsFromBackup = (backupFile) => {
  const formData = new FormData();
  formData.append('backup_file', backupFile);
  return apiClient.post('api/admin/audit-logs/restore/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// ===== AUDIT LOG ANALYTICS =====
export const getAuditLogTrends = (period = 'monthly') => 
  apiClient.get(`api/admin/audit-logs/trends/${period}/`);

export const getAnomalyDetection = (params = {}) => 
  apiClient.get('api/admin/audit-logs/anomalies/', { params });

// ===== BATCH PROCESSING =====
export const processAuditLogBatch = (batchId) => 
  apiClient.get(`api/admin/audit-logs/batch/${batchId}/`);

export const getBatchProcessingStatus = (batchId) => 
  apiClient.get(`api/admin/audit-logs/batch/${batchId}/status/`);