import React, { useState, useEffect, useCallback } from "react";
import "../static/AuditLogs.css";
import * as AuditLogsApi from "../api/AuditLogsApis";

const AuditLogs = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [viewMode, setViewMode] = useState("table");
  const [selectedTimeRange, setSelectedTimeRange] = useState("all");
  const [stats, setStats] = useState({
    total_logs: 0,
    active_users: 0,
    suspicious_activities: 0,
    today_logs: 0
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // Filter options based on your actual API data
  const filterOptions = [
    { value: "all", label: "All Actions" },
    { value: "LOGIN_SUCCESS", label: "Login Success" },
    { value: "LOGIN_FAILED", label: "Login Failed" },
    { value: "LOGIN_ATTEMPT", label: "Login Attempt" },
    { value: "LOGIN_USER_FOUND", label: "User Found" },
    { value: "UPDATE", label: "Update" },
    { value: "UserProfile_UPDATE_ATTEMPT", label: "Profile Update Attempt" },
    { value: "STAFF_USER_LIST_ACCESS", label: "Staff Access" },
    { value: "USER_LIST_ACCESS", label: "User List Access" },
  ];

  const timeRangeOptions = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "last7", label: "Last 7 Days" },
    { value: "last30", label: "Last 30 Days" },
    { value: "month", label: "This Month" },
  ];

  const pageSizeOptions = [10, 20, 50, 100];

  // Calculate stats from the current data (but NOT total logs - that comes from API)
  const calculateStats = useCallback((logs) => {
    if (!logs || logs.length === 0) {
      setStats(prev => ({
        ...prev,
        active_users: 0,
        suspicious_activities: 0,
        today_logs: 0
      }));
      return;
    }

    // Get unique users from current page
    const uniqueUsers = new Set();
    const today = new Date().toISOString().split('T')[0];
    let todayCount = 0;
    let suspiciousCount = 0;

    logs.forEach(log => {
      // Count unique users in current page
      if (log.user) {
        uniqueUsers.add(log.user);
      }

      // Count today's logs in current page
      if (log.timestamp && log.timestamp.includes(today)) {
        todayCount++;
      }

      // Count suspicious activities in current page
      if (log.action === "LOGIN_FAILED" || 
          (log.changes && log.changes.security_alert)) {
        suspiciousCount++;
      }
    });

    // Update only the stats that come from current page data
    setStats(prev => ({
      ...prev,
      active_users: uniqueUsers.size,
      suspicious_activities: suspiciousCount,
      today_logs: todayCount
    }));
  }, []);

  // Fetch audit logs
  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        page_size: pageSize,
        search: searchQuery,
      };

      // Add action filter if not "all"
      if (selectedFilter !== "all") {
        params.action = selectedFilter;
      }

      let response;
      switch (selectedTimeRange) {
        case "today":
          response = await AuditLogsApi.getTodayAuditLogs(params);
          break;
        case "yesterday":
          response = await AuditLogsApi.getYesterdayAuditLogs(params);
          break;
        case "last7":
          response = await AuditLogsApi.getLast7DaysAuditLogs(params);
          break;
        case "last30":
          response = await AuditLogsApi.getLast30DaysAuditLogs(params);
          break;
        case "month":
          response = await AuditLogsApi.getThisMonthAuditLogs(params);
          break;
        default:
          response = await AuditLogsApi.getAllAuditLogs(params);
          break;
      }

      if (response.data) {
        const logs = response.data.results || response.data;
        setAuditLogs(logs);
        setTotalPages(response.data.total_pages || 1);
        
        // IMPORTANT: Set total count from API (not current page count)
        const apiTotalCount = response.data.count || 0;
        setTotalCount(apiTotalCount);
        
        // Update stats - get total_logs from API, calculate others from current page
        setStats(prev => ({
          total_logs: apiTotalCount, // This is the actual total from API
          active_users: prev.active_users, // Will be updated below
          suspicious_activities: prev.suspicious_activities, // Will be updated below
          today_logs: prev.today_logs // Will be updated below
        }));
        
        // Calculate page-specific stats
        calculateStats(logs);
      }
    } catch (err) {
      setError("Failed to fetch audit logs. Please try again.");
      console.error("Error fetching audit logs:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, selectedFilter, selectedTimeRange, calculateStats]);

  // Fetch detailed statistics from API
  const fetchDetailedStats = async () => {
    try {
      const response = await AuditLogsApi.getAuditLogStats();
      if (response.data) {
        // Merge API stats with our calculated ones
        setStats(prev => ({
          ...prev,
          total_logs: response.data.total_logs || prev.total_logs,
          // Keep our calculated values for the other stats
          active_users: response.data.active_users || prev.active_users,
          suspicious_activities: response.data.suspicious_activities || prev.suspicious_activities,
          today_logs: response.data.today_logs || prev.today_logs
        }));
      }
    } catch (err) {
      console.error("Error fetching detailed stats:", err);
      // If API stats fail, we already have calculated stats
    }
  };

  // Handle search suspicious activities
  const handleSearchSuspicious = async () => {
    try {
      const response = await AuditLogsApi.searchSuspiciousAuditLogs();
      if (response.data) {
        const logs = response.data.results || response.data;
        setAuditLogs(logs);
        setTotalCount(response.data.count || logs.length);
        setStats(prev => ({
          ...prev,
          suspicious_activities: response.data.count || logs.length
        }));
      }
    } catch (err) {
      console.error("Error searching suspicious logs:", err);
    }
  };

  // Handle cleanup
  const handleCleanup = async () => {
    if (window.confirm("Are you sure you want to cleanup old audit logs? This action cannot be undone.")) {
      try {
        await AuditLogsApi.cleanupAuditLogs({ days_old: 90 });
        alert("Cleanup completed successfully!");
        fetchAuditLogs();
      } catch (err) {
        alert("Failed to cleanup audit logs.");
        console.error("Error during cleanup:", err);
      }
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const response = await AuditLogsApi.exportAuditLogs({
        format: "csv",
        page: currentPage,
        page_size: pageSize,
        action: selectedFilter !== "all" ? selectedFilter : undefined,
      });
      
      if (response.data) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (err) {
      console.error("Error exporting logs:", err);
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Initialize
  useEffect(() => {
    fetchAuditLogs();
    fetchDetailedStats();
  }, [fetchAuditLogs]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAuditLogs();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchAuditLogs]);

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (err) {
      return "Invalid Date";
    }
  };

  // Get action icon
  const getActionIcon = (action) => {
    if (!action) return "📝";
    
    const actionStr = action.toLowerCase();
    if (actionStr.includes("login") && actionStr.includes("success")) return "✅";
    if (actionStr.includes("login") && actionStr.includes("failed")) return "❌";
    if (actionStr.includes("login")) return "🔐";
    if (actionStr.includes("update")) return "✏️";
    if (actionStr.includes("create")) return "➕";
    if (actionStr.includes("delete")) return "🗑️";
    if (actionStr.includes("access")) return "👁️";
    if (actionStr.includes("attempt")) return "🔍";
    if (actionStr.includes("found")) return "👤";
    if (actionStr.includes("staff")) return "👨‍💼";
    if (actionStr.includes("profile")) return "👤";
    return "📝";
  };

  // Get severity color based on action
  const getSeverityColor = (action) => {
    if (!action) return "#6c757d";
    
    const actionStr = action.toLowerCase();
    if (actionStr.includes("login_failed")) return "#dc3545";
    if (actionStr.includes("login_success")) return "#28a745";
    if (actionStr.includes("delete")) return "#dc3545";
    if (actionStr.includes("update")) return "#ffc107";
    if (actionStr.includes("create")) return "#17a2b8";
    if (actionStr.includes("access")) return "#6610f2";
    if (actionStr.includes("staff")) return "#6f42c1";
    if (actionStr.includes("attempt")) return "#fd7e14";
    if (actionStr.includes("found")) return "#20c997";
    return "#6c757d";
  };

  // Get user display name
  const getUserDisplay = (log) => {
    if (log.user_display && log.user_display.trim()) {
      return log.user_display;
    }
    if (log.changes?.username) {
      return log.changes.username;
    }
    if (log.changes?.staff_user) {
      return log.changes.staff_user;
    }
    if (log.changes?.access_by) {
      return log.changes.access_by;
    }
    if (log.changes?.user_id) {
      return `User #${log.changes.user_id}`;
    }
    return log.user ? `User #${log.user}` : "System";
  };

  // Get action display name
  const getActionDisplay = (log) => {
    if (log.action_display && log.action_display.trim()) {
      return log.action_display;
    }
    // Format the action for display
    const action = log.action || "";
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ') || "Unknown Action";
  };

  // Get action display label for filter
  const getActionDisplayLabel = (action) => {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Render loading state
  if (loading && auditLogs.length === 0) {
    return (
      <div className="audit-logs-container">
        <div className="audit-logs-loading">
          <div className="audit-logs-spinner"></div>
          <p>Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="audit-logs-container">
      {/* Header */}
      <div className="audit-logs-header">
        <h1 className="audit-logs-title">
          <span className="audit-logs-title-icon">📋</span>
          Audit Logs
        </h1>
        <p className="audit-logs-subtitle">
          Monitor and track all system activities and user actions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="audit-logs-stats-grid">
        <div className="audit-logs-stat-card">
          <div className="audit-logs-stat-icon">📈</div>
          <div className="audit-logs-stat-content">
            <h3 className="audit-logs-stat-title">Total Logs</h3>
            <p className="audit-logs-stat-value">{stats.total_logs || totalCount || 0}</p>
            <small className="audit-logs-stat-note">
              From all time
            </small>
          </div>
        </div>
        <div className="audit-logs-stat-card">
          <div className="audit-logs-stat-icon">👥</div>
          <div className="audit-logs-stat-content">
            <h3 className="audit-logs-stat-title">Active Users</h3>
            <p className="audit-logs-stat-value">{stats.active_users || 0}</p>
            <small className="audit-logs-stat-note">
              In current view
            </small>
          </div>
        </div>
        <div className="audit-logs-stat-card">
          <div className="audit-logs-stat-icon">⚠️</div>
          <div className="audit-logs-stat-content">
            <h3 className="audit-logs-stat-title">Suspicious</h3>
            <p className="audit-logs-stat-value">{stats.suspicious_activities || 0}</p>
            <small className="audit-logs-stat-note">
              Failed logins & alerts
            </small>
          </div>
        </div>
        <div className="audit-logs-stat-card">
          <div className="audit-logs-stat-icon">🕒</div>
          <div className="audit-logs-stat-content">
            <h3 className="audit-logs-stat-title">Today's Logs</h3>
            <p className="audit-logs-stat-value">{stats.today_logs || 0}</p>
            <small className="audit-logs-stat-note">
              From current view
            </small>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="audit-logs-controls">
        {/* Search */}
        <div className="audit-logs-search-container">
          <input
            type="text"
            placeholder="Search logs..."
            className="audit-logs-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="audit-logs-search-button">
            🔍
          </button>
        </div>

        {/* Filters */}
        <div className="audit-logs-filter-group">
          <select
            className="audit-logs-filter-select"
            value={selectedFilter}
            onChange={(e) => {
              setSelectedFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            className="audit-logs-filter-select"
            value={selectedTimeRange}
            onChange={(e) => {
              setSelectedTimeRange(e.target.value);
              setCurrentPage(1);
            }}
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            className="audit-logs-filter-select"
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="audit-logs-view-toggle">
          <button
            className={`audit-logs-view-button ${viewMode === "table" ? "active" : ""}`}
            onClick={() => setViewMode("table")}
            title="Table View"
          >
            📋
          </button>
          <button
            className={`audit-logs-view-button ${viewMode === "timeline" ? "active" : ""}`}
            onClick={() => setViewMode("timeline")}
            title="Timeline View"
          >
            📅
          </button>
          <button
            className={`audit-logs-view-button ${viewMode === "compact" ? "active" : ""}`}
            onClick={() => setViewMode("compact")}
            title="Compact View"
          >
            🔍
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="audit-logs-action-buttons">
        <button
          className="audit-logs-action-button audit-logs-action-button-export"
          onClick={handleExport}
        >
          📥 Export
        </button>
        <button
          className="audit-logs-action-button audit-logs-action-button-cleanup"
          onClick={handleCleanup}
        >
          🧹 Cleanup
        </button>
        <button
          className="audit-logs-action-button audit-logs-action-button-suspicious"
          onClick={handleSearchSuspicious}
        >
          🔍 Suspicious
        </button>
        <button
          className="audit-logs-action-button audit-logs-action-button-refresh"
          onClick={fetchAuditLogs}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Filter Info */}
      {selectedFilter !== "all" && (
        <div className="audit-logs-filter-info">
          <span className="audit-logs-filter-info-icon">🔍</span>
          Showing: <strong>{getActionDisplayLabel(selectedFilter)}</strong> actions
          <button 
            className="audit-logs-filter-clear"
            onClick={() => setSelectedFilter("all")}
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Table Info */}
      <div className="audit-logs-table-info">
        Showing {auditLogs.length} of {totalCount} logs
        {selectedFilter !== "all" && ` (filtered by ${getActionDisplayLabel(selectedFilter)})`}
      </div>

      {/* Error Message */}
      {error && (
        <div className="audit-logs-error">
          <span className="audit-logs-error-icon">❌</span>
          {error}
        </div>
      )}

      {/* Logs Display */}
      <div className="audit-logs-content">
        {viewMode === "table" && (
          <div className="audit-logs-table-container">
            <table className="audit-logs-table">
              <thead>
                <tr>
                  <th className="audit-logs-table-header">ID</th>
                  <th className="audit-logs-table-header">Action</th>
                  <th className="audit-logs-table-header">User</th>
                  <th className="audit-logs-table-header">Model</th>
                  <th className="audit-logs-table-header">Timestamp</th>
                  <th className="audit-logs-table-header">IP Address</th>
                  <th className="audit-logs-table-header">Request</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length > 0 ? (
                  auditLogs.map((log) => (
                    <tr 
                      key={log.id} 
                      className="audit-logs-table-row"
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="audit-logs-table-cell">
                        <span className="audit-logs-id">#{log.id}</span>
                      </td>
                      <td className="audit-logs-table-cell">
                        <span 
                          className="audit-logs-action-badge" 
                          style={{ backgroundColor: getSeverityColor(log.action) }}
                        >
                          {getActionIcon(log.action)} {getActionDisplay(log)}
                        </span>
                      </td>
                      <td className="audit-logs-table-cell">{getUserDisplay(log)}</td>
                      <td className="audit-logs-table-cell">{log.model_name || "N/A"}</td>
                      <td className="audit-logs-table-cell">{formatDate(log.timestamp)}</td>
                      <td className="audit-logs-table-cell">{log.ip_address || "N/A"}</td>
                      <td className="audit-logs-table-cell">
                        <span className="audit-logs-request">
                          {log.request_method} {log.request_path}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="audit-logs-table-empty">
                      No audit logs found
                      {selectedFilter !== "all" && ` for action: ${getActionDisplayLabel(selectedFilter)}`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === "timeline" && (
          <div className="audit-logs-timeline">
            {auditLogs.map((log) => (
              <div key={log.id} className="audit-logs-timeline-item">
                <div 
                  className="audit-logs-timeline-dot" 
                  style={{ backgroundColor: getSeverityColor(log.action) }}
                ></div>
                <div className="audit-logs-timeline-content">
                  <div className="audit-logs-timeline-header">
                    <span className="audit-logs-timeline-action">
                      {getActionIcon(log.action)} {getActionDisplay(log)}
                    </span>
                    <span className="audit-logs-timeline-time">{formatDate(log.timestamp)}</span>
                  </div>
                  <div className="audit-logs-timeline-body">
                    <p>
                      <strong>User:</strong> {getUserDisplay(log)} | 
                      <strong> Model:</strong> {log.model_name || "N/A"} | 
                      <strong> IP:</strong> {log.ip_address || "N/A"}
                    </p>
                    {log.changes && Object.keys(log.changes).length > 0 && (
                      <div className="audit-logs-timeline-changes">
                        <strong>Changes:</strong>
                        <pre>{JSON.stringify(log.changes, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === "compact" && (
          <div className="audit-logs-compact-grid">
            {auditLogs.map((log) => (
              <div 
                key={log.id} 
                className="audit-logs-compact-card"
                onClick={() => setSelectedLog(log)}
              >
                <div className="audit-logs-compact-header">
                  <span className="audit-logs-compact-action">
                    {getActionIcon(log.action)}
                  </span>
                  <span className="audit-logs-compact-title">
                    {getActionDisplay(log)}
                  </span>
                  <span className="audit-logs-compact-time">
                    {formatDate(log.timestamp)}
                  </span>
                </div>
                <div className="audit-logs-compact-body">
                  <p><strong>User:</strong> {getUserDisplay(log)}</p>
                  <p><strong>Model:</strong> {log.model_name || "N/A"}</p>
                  <p><strong>IP:</strong> {log.ip_address || "N/A"}</p>
                  <p><strong>Request:</strong> {log.request_method} {log.request_path}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="audit-logs-pagination">
          <button
            className="audit-logs-pagination-button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>
          
          <div className="audit-logs-pagination-info">
            Page {currentPage} of {totalPages}
          </div>
          
          <div className="audit-logs-pagination-pages">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  className={`audit-logs-pagination-page ${currentPage === pageNum ? "active" : ""}`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            className="audit-logs-pagination-button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="audit-logs-modal" onClick={() => setSelectedLog(null)}>
          <div className="audit-logs-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="audit-logs-modal-header">
              <h2>Log Details #{selectedLog.id}</h2>
              <button 
                className="audit-logs-modal-close"
                onClick={() => setSelectedLog(null)}
              >
                ×
              </button>
            </div>
            <div className="audit-logs-modal-body">
              <div className="audit-logs-modal-section">
                <h3>Basic Information</h3>
                <div className="audit-logs-modal-grid">
                  <div className="audit-logs-modal-field">
                    <label>Action</label>
                    <span className="audit-logs-modal-value">{getActionDisplay(selectedLog)}</span>
                  </div>
                  <div className="audit-logs-modal-field">
                    <label>User</label>
                    <span className="audit-logs-modal-value">{getUserDisplay(selectedLog)}</span>
                  </div>
                  <div className="audit-logs-modal-field">
                    <label>Model</label>
                    <span className="audit-logs-modal-value">{selectedLog.model_name || "N/A"}</span>
                  </div>
                  <div className="audit-logs-modal-field">
                    <label>Object ID</label>
                    <span className="audit-logs-modal-value">{selectedLog.object_id || "N/A"}</span>
                  </div>
                  <div className="audit-logs-modal-field">
                    <label>Timestamp</label>
                    <span className="audit-logs-modal-value">{formatDate(selectedLog.timestamp)}</span>
                  </div>
                  <div className="audit-logs-modal-field">
                    <label>IP Address</label>
                    <span className="audit-logs-modal-value">{selectedLog.ip_address || "N/A"}</span>
                  </div>
                  <div className="audit-logs-modal-field">
                    <label>Request</label>
                    <span className="audit-logs-modal-value">
                      {selectedLog.request_method} {selectedLog.request_path}
                    </span>
                  </div>
                </div>
              </div>
              
              {selectedLog.changes && Object.keys(selectedLog.changes).length > 0 && (
                <div className="audit-logs-modal-section">
                  <h3>Changes Details</h3>
                  <div className="audit-logs-modal-changes">
                    <pre>{JSON.stringify(selectedLog.changes, null, 2)}</pre>
                  </div>
                </div>
              )}
              
              {selectedLog.old_values && Object.keys(selectedLog.old_values).length > 0 && (
                <div className="audit-logs-modal-section">
                  <h3>Old Values</h3>
                  <div className="audit-logs-modal-changes">
                    <pre>{JSON.stringify(selectedLog.old_values, null, 2)}</pre>
                  </div>
                </div>
              )}
              
              {selectedLog.new_values && Object.keys(selectedLog.new_values).length > 0 && (
                <div className="audit-logs-modal-section">
                  <h3>New Values</h3>
                  <div className="audit-logs-modal-changes">
                    <pre>{JSON.stringify(selectedLog.new_values, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
            <div className="audit-logs-modal-footer">
              <button 
                className="audit-logs-modal-button"
                onClick={() => setSelectedLog(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;