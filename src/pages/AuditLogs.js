import React, { useState, useEffect, useCallback, useRef } from "react";
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
  const [availableModels, setAvailableModels] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [availableActions, setAvailableActions] = useState([]);
  const [selectedModel, setSelectedModel] = useState("all");
  const [selectedUser, setSelectedUser] = useState("all");
  const [exporting, setExporting] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [cleanupDays, setCleanupDays] = useState(90);
  const [quickStatsDays, setQuickStatsDays] = useState(30);
  const [suspiciousDays, setSuspiciousDays] = useState(7);

  const searchTimeout = useRef(null);

  // Fetch available filters from API
  const fetchFilters = useCallback(async () => {
    try {
      const response = await AuditLogsApi.getAuditLogFilters();
      if (response.data) {
        setAvailableModels(response.data.models || []);
        setAvailableUsers(response.data.users || []);
        setAvailableActions(response.data.actions || []);
      }
    } catch (err) {
      console.error("Error fetching filters:", err);
    }
  }, []);

  // Calculate stats from the current data
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

    const uniqueUsers = new Set();
    const today = new Date().toISOString().split('T')[0];
    let todayCount = 0;
    let suspiciousCount = 0;

    logs.forEach(log => {
      if (log.user) {
        uniqueUsers.add(log.user);
      }

      if (log.timestamp && log.timestamp.includes(today)) {
        todayCount++;
      }

      if (log.action === "LOGIN_FAILED" ||
        (log.changes && log.changes.security_alert)) {
        suspiciousCount++;
      }
    });

    setStats(prev => ({
      ...prev,
      active_users: uniqueUsers.size,
      suspicious_activities: suspiciousCount,
      today_logs: todayCount
    }));
  }, []);

  // Fetch audit logs - FIXED: Pass all parameters as arguments
  const fetchAuditLogs = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    // Use passed params or fallback to current state
    const page = params.page || currentPage;
    const pageSizeParam = params.pageSize || pageSize;
    const search = params.search !== undefined ? params.search : searchQuery;
    const filter = params.filter !== undefined ? params.filter : selectedFilter;
    const timeRange = params.timeRange !== undefined ? params.timeRange : selectedTimeRange;
    const model = params.model !== undefined ? params.model : selectedModel;
    const user = params.user !== undefined ? params.user : selectedUser;

    try {
      let response;
      const apiParams = {
        page: page,
        page_size: pageSizeParam,
        search: search || undefined,
      };

      // Add filters
      if (filter !== "all") {
        apiParams.action = filter;
      }
      if (model !== "all") {
        apiParams.model_name = model;
      }
      if (user !== "all") {
        apiParams.user_id = user;
      }

      // Use dedicated time range endpoints
      switch (timeRange) {
        case "today":
          response = await AuditLogsApi.getTodayAuditLogs(apiParams);
          break;
        case "yesterday":
          response = await AuditLogsApi.getYesterdayAuditLogs(apiParams);
          break;
        case "last7":
          response = await AuditLogsApi.getLast7DaysAuditLogs(apiParams);
          break;
        case "last30":
          response = await AuditLogsApi.getLast30DaysAuditLogs(apiParams);
          break;
        case "month":
          response = await AuditLogsApi.getThisMonthAuditLogs(apiParams);
          break;
        default:
          // For all time, use different endpoints based on filters
          if (user !== "all") {
            response = await AuditLogsApi.getAuditLogsByUser(user, apiParams);
          } else if (model !== "all") {
            response = await AuditLogsApi.getAuditLogsByModel(model, apiParams);
          } else if (filter !== "all") {
            response = await AuditLogsApi.getAuditLogsByAction(filter, apiParams);
          } else if (search) {
            response = await AuditLogsApi.searchAuditLogs(search, apiParams);
          } else {
            response = await AuditLogsApi.getAllAuditLogs(apiParams);
          }
          break;
      }

      if (response.data) {
        const logs = response.data.results || response.data;
        setAuditLogs(logs);
        setTotalPages(response.data.total_pages || 1);

        const apiTotalCount = response.data.count || logs.length;
        setTotalCount(apiTotalCount);

        setStats(prev => ({
          total_logs: apiTotalCount,
          active_users: prev.active_users,
          suspicious_activities: prev.suspicious_activities,
          today_logs: prev.today_logs
        }));

        calculateStats(logs);
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to fetch audit logs. Please try again.");
      console.error("Error fetching audit logs:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, selectedFilter, selectedTimeRange, selectedModel, selectedUser, calculateStats]);

  // Fetch detailed statistics from API
  const fetchDetailedStats = useCallback(async () => {
    try {
      const [statsResponse, quickStatsResponse] = await Promise.all([
        AuditLogsApi.getAuditLogStats(),
        AuditLogsApi.getAuditLogQuickStats({ days: quickStatsDays })
      ]);

      if (statsResponse.data || quickStatsResponse.data) {
        setStats(prev => ({
          total_logs: statsResponse.data?.total_logs || quickStatsResponse.data?.total_logs || prev.total_logs,
          active_users: statsResponse.data?.active_users || quickStatsResponse.data?.active_users || prev.active_users,
          suspicious_activities: statsResponse.data?.suspicious_activities || quickStatsResponse.data?.suspicious_activities || prev.suspicious_activities,
          today_logs: statsResponse.data?.today_logs || quickStatsResponse.data?.today_logs || prev.today_logs
        }));
      }
    } catch (err) {
      console.error("Error fetching detailed stats:", err);
    }
  }, [quickStatsDays]);

  // Filter options - now dynamic from API
  const filterOptions = [
    { value: "all", label: "All Actions" },
    ...(availableActions.map(action => ({
      value: action,
      label: action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
    })))
  ];

  // Model options
  const modelOptions = [
    { value: "all", label: "All Models" },
    ...(availableModels.map(model => ({
      value: model,
      label: model
    })))
  ];

  // User options
  const userOptions = [
    { value: "all", label: "All Users" },
    ...(availableUsers.map(user => ({
      value: user.id || user,
      label: user.username || user.name || `User #${user.id || user}`
    })))
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
  const daysOptions = [1, 7, 30, 60, 90, 180, 365];

  // Handle search suspicious activities
  const handleSearchSuspicious = async () => {
    try {
      setLoading(true);

      // First try to get LOGIN_FAILED logs (most common suspicious activity)
      let suspiciousLogs = [];

      try {
        const response = await AuditLogsApi.getAuditLogsByAction("LOGIN_FAILED", {
          page: 1,
          page_size: pageSize,
          days: suspiciousDays
        });

        if (response.data) {
          const logs = response.data.results || response.data || [];
          suspiciousLogs = Array.isArray(logs) ? logs : [logs];
        }
      } catch (actionErr) {
        // Continue to other methods
      }

      // If no failed logins, try other suspicious actions
      if (suspiciousLogs.length === 0) {
        const otherActions = ["LOGIN_ATTEMPT", "UNAUTHORIZED", "SECURITY"];
        for (const action of otherActions) {
          try {
            const response = await AuditLogsApi.searchAuditLogs(action, {
              page: 1,
              page_size: pageSize,
              days: suspiciousDays
            });

            if (response.data) {
              const logs = response.data.results || response.data || [];
              if (Array.isArray(logs) && logs.length > 0) {
                suspiciousLogs = logs;
                break;
              }
            }
          } catch (searchErr) {
            continue;
          }
        }
      }

      // Update the display
      setAuditLogs(suspiciousLogs);
      setTotalCount(suspiciousLogs.length);
      setTotalPages(1);
      setSelectedFilter("all");
      setSelectedModel("all");
      setSelectedUser("all");
      setSearchQuery("");
      setSelectedTimeRange("all");
      setCurrentPage(1);

      // Update stats
      setStats(prev => ({
        ...prev,
        suspicious_activities: suspiciousLogs.length
      }));

      if (suspiciousLogs.length === 0) {
        alert(`No suspicious activities found in the last ${suspiciousDays} days.`);
      } else {
        alert(`Found ${suspiciousLogs.length} suspicious activities in the last ${suspiciousDays} days.`);
      }

    } catch (err) {
      console.error("Error searching suspicious logs:", err);
      setError("Failed to search suspicious activities. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle cleanup with days input
  const handleCleanup = async () => {
    const days = cleanupDays || 90;
    if (window.confirm(`Are you sure you want to cleanup audit logs older than ${days} days? This action cannot be undone.`)) {
      setCleanupLoading(true);
      try {
        await AuditLogsApi.cleanupAuditLogs({ days: days });
        alert(`Cleanup completed successfully! Logs older than ${days} days have been removed.`);
        fetchAuditLogs({ page: 1 }); // Reset to page 1 after cleanup
        fetchDetailedStats();
      } catch (err) {
        alert(err.response?.data?.detail || `Failed to cleanup audit logs.`);
        console.error("Error during cleanup:", err);
      } finally {
        setCleanupLoading(false);
      }
    }
  };

  // Handle export
  const handleExport = async () => {
    setExporting(true);
    try {
      // Fetch data using the same logic as fetchAuditLogs but with more records
      const params = {
        page: 1,
        page_size: 5000,
      };

      if (selectedFilter !== "all") params.action = selectedFilter;
      if (selectedModel !== "all") params.model_name = selectedModel;
      if (selectedUser !== "all") {
        const userId = typeof selectedUser === 'object' ? selectedUser.id || selectedUser.value : selectedUser;
        params.user_id = userId;
      }
      if (searchQuery && searchQuery.trim() !== "") params.search = searchQuery;

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

      const logs = response.data.results || response.data || [];

      if (logs.length === 0) {
        alert("No data to export");
        return;
      }

      // Convert to CSV
      const csvContent = convertToCSV(logs);

      // Create download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      link.setAttribute("download", `audit-logs-${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      alert(`Exported ${logs.length} records to CSV`);

    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export data: " + (err.message || "Unknown error"));
    } finally {
      setExporting(false);
    }
  };

  // Improved CSV conversion
  const convertToCSV = (logs) => {
    if (!logs || logs.length === 0) return '';

    // Define headers
    const headers = [
      'ID',
      'Timestamp',
      'User',
      'Action',
      'Model',
      'Object ID',
      'IP Address',
      'Request Path',
      'Method',
      'User Agent',
      'Changes'
    ];

    // Convert to CSV rows
    const rows = logs.map(log => [
      log.id || '',
      log.timestamp || '',
      getUserDisplay(log),
      log.action || '',
      log.model_name || '',
      log.object_id || '',
      log.ip_address || '',
      log.request_path || '',
      log.request_method || '',
      (log.user_agent || '').substring(0, 100),
      log.changes ? JSON.stringify(log.changes).replace(/"/g, '""') : ''
    ]);

    // Combine headers and rows
    const csvArray = [headers, ...rows];

    // Convert to CSV string
    return csvArray.map(row =>
      row.map(cell => {
        const cellStr = String(cell || '');
        // Wrap in quotes if contains comma, quote, or newline
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n') || cellStr.includes('\r')) {
          return '"' + cellStr.replace(/"/g, '""') + '"';
        }
        return cellStr;
      }).join(',')
    ).join('\n');
  };

  // Handle pagination - FIXED: Pass page parameter explicitly
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Call fetchAuditLogs with explicit page parameter
      fetchAuditLogs({ page: newPage });
    }
  };

  // Handle page size change - FIXED: Pass pageSize parameter explicitly
  const handlePageSizeChange = async (size) => {
    try {
      await AuditLogsApi.setAuditLogPageSize({ page_size: size });
      setPageSize(size);
      setCurrentPage(1);
      // Call fetchAuditLogs with reset page and new pageSize
      fetchAuditLogs({ page: 1, pageSize: size });
    } catch (err) {
      console.error("Error setting page size:", err);
    }
  };

  // Handle delete log
  const handleDeleteLog = async (logId) => {
    if (window.confirm("Are you sure you want to delete this audit log?")) {
      try {
        await AuditLogsApi.deleteAuditLog(logId);
        alert("Audit log deleted successfully!");
        fetchAuditLogs(); // Refresh with current page
        fetchDetailedStats();
      } catch (err) {
        alert("Failed to delete audit log");
        console.error("Error deleting log:", err);
      }
    }
  };

  // Get system health
  const handleSystemHealth = async () => {
    try {
      const response = await AuditLogsApi.getAuditLogSystemHealth();
      if (response.data) {
        alert(`System Health:\n\n` +
          `Database Size: ${response.data.database_size || 'N/A'}\n` +
          `Logs Count: ${response.data.logs_count || 0}\n` +
          `Average Log Size: ${response.data.avg_log_size || 'N/A'}\n` +
          `Last Cleanup: ${response.data.last_cleanup || 'Never'}\n` +
          `Status: ${response.data.status || 'Unknown'}`);
      }
    } catch (err) {
      console.error("Error getting system health:", err);
      alert("Failed to get system health");
    }
  };

  // Get cleanup suggestions
  const handleCleanupSuggestions = async () => {
    try {
      const response = await AuditLogsApi.getAuditLogCleanupSuggestions();
      if (response.data) {
        const suggestions = response.data.suggestions || [];
        if (suggestions.length > 0) {
          alert(`Cleanup Suggestions:\n\n${suggestions.join('\n')}`);
        } else {
          alert("No cleanup suggestions at this time.");
        }
      }
    } catch (err) {
      console.error("Error getting cleanup suggestions:", err);
      alert("Failed to get cleanup suggestions");
    }
  };

  // Get activity timeline
  const handleActivityTimeline = async () => {
    try {
      const response = await AuditLogsApi.getAuditLogActivityTimeline({
        days: quickStatsDays
      });
      if (response.data) {
        alert(`Activity timeline loaded for last ${quickStatsDays} days. Check console for details.`);
      }
    } catch (err) {
      console.error("Error getting activity timeline:", err);
      alert("Failed to get activity timeline");
    }
  };

  // Get bulk operations
  const handleBulkOperations = async () => {
    try {
      const response = await AuditLogsApi.getAuditLogBulkOperations({
        days: quickStatsDays
      });
      if (response.data) {
        const operations = response.data.operations || [];
        if (operations.length > 0) {
          alert(`Bulk Operations (last ${quickStatsDays} days):\n\n` +
            operations.map(op => `${op.action}: ${op.count} logs`).join('\n'));
        } else {
          alert(`No bulk operations found in the last ${quickStatsDays} days.`);
        }
      }
    } catch (err) {
      console.error("Error getting bulk operations:", err);
      alert("Failed to get bulk operations");
    }
  };

  // Get user activity for selected log
  const handleUserActivity = async (logId) => {
    try {
      const response = await AuditLogsApi.getUserActivity(logId);
      if (response.data) {
        const userLogs = response.data.logs || [];
        if (userLogs.length > 0) {
          alert(`User Activity:\n\nFound ${userLogs.length} activities for this user.`);
        } else {
          alert("No additional user activity found.");
        }
      }
    } catch (err) {
      console.error("Error getting user activity:", err);
      alert("Failed to get user activity");
    }
  };

  // Get pagination info
  const handlePaginationInfo = async () => {
    try {
      const response = await AuditLogsApi.getAuditLogPaginationInfo();
      if (response.data) {
        const info = response.data;
        alert(`Pagination Info:\n\n` +
          `Total Pages: ${info.total_pages || 1}\n` +
          `Total Items: ${info.total_items || 0}\n` +
          `Current Page Size: ${info.page_size || pageSize}\n` +
          `Default Page Size: ${info.default_page_size || 20}`);
      }
    } catch (err) {
      console.error("Error getting pagination info:", err);
      alert("Failed to get pagination info");
    }
  };

  // Handle filter changes - NEW: Explicit handler for filters
  const handleFilterChange = (filterName, value) => {
    switch (filterName) {
      case 'action':
        setSelectedFilter(value);
        break;
      case 'model':
        setSelectedModel(value);
        break;
      case 'user':
        setSelectedUser(value);
        break;
      case 'timeRange':
        setSelectedTimeRange(value);
        break;
      default:
        return;
    }
    
    setCurrentPage(1); // Reset to page 1 when filters change
    
    // Fetch with new filter and reset page
    fetchAuditLogs({ 
      filter: filterName === 'action' ? value : selectedFilter,
      model: filterName === 'model' ? value : selectedModel,
      user: filterName === 'user' ? value : selectedUser,
      timeRange: filterName === 'timeRange' ? value : selectedTimeRange,
      page: 1 
    });
  };

  // Initialize
  useEffect(() => {
    const init = async () => {
      await Promise.all([
        fetchAuditLogs(),
        fetchDetailedStats(),
        fetchFilters()
      ]);
    };
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search - FIXED: Call fetchAuditLogs with explicit parameters
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      setCurrentPage(1);
      fetchAuditLogs({ search: searchQuery, page: 1 });
    }, 500);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
    // eslint-disable-next-line 
  }, [searchQuery]);

  // Refresh stats when days change
  useEffect(() => {
    fetchDetailedStats();
  }, [quickStatsDays, fetchDetailedStats]);

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      return date.toLocaleDateString() + " " + date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
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

  // Reset all filters
  const resetFilters = () => {
    setSelectedFilter("all");
    setSelectedModel("all");
    setSelectedUser("all");
    setSearchQuery("");
    setSelectedTimeRange("all");
    setCurrentPage(1);
    // Fetch with all defaults
    fetchAuditLogs({ 
      filter: "all",
      model: "all",
      user: "all",
      search: "",
      timeRange: "all",
      page: 1 
    });
  };

  // Refresh button handler
  const handleRefresh = () => {
    fetchAuditLogs();
    fetchDetailedStats();
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
        <div className="audit-logs-header-main">
          <h1 className="audit-logs-title">
            <span className="audit-logs-title-icon">📋</span>
            Audit Logs
          </h1>
          <p className="audit-logs-subtitle">
            Monitor and track all system activities and user actions
          </p>
        </div>

        {/* Quick Stats */}
        <div className="audit-logs-quick-actions">
          <button
            className="audit-logs-quick-button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            {showAdvancedFilters ? "Hide" : "Show"} Advanced Filters
          </button>
          <div className="audit-logs-days-input">
            <label>Stats Days:</label>
            <select
              value={quickStatsDays}
              onChange={(e) => setQuickStatsDays(Number(e.target.value))}
              className="audit-logs-days-select"
            >
              {daysOptions.map(days => (
                <option key={days} value={days}>Last {days} days</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="audit-logs-stats-grid">
        <div className="audit-logs-stat-card">
          <div className="audit-logs-stat-icon">📈</div>
          <div className="audit-logs-stat-content">
            <h3 className="audit-logs-stat-title">Total Logs</h3>
            <p className="audit-logs-stat-value">{stats.total_logs.toLocaleString()}</p>
            <small className="audit-logs-stat-note">
              Last {quickStatsDays} days
            </small>
          </div>
        </div>
        <div className="audit-logs-stat-card">
          <div className="audit-logs-stat-icon">👥</div>
          <div className="audit-logs-stat-content">
            <h3 className="audit-logs-stat-title">Active Users</h3>
            <p className="audit-logs-stat-value">{stats.active_users}</p>
            <small className="audit-logs-stat-note">
              Last {quickStatsDays} days
            </small>
          </div>
        </div>
        <div className="audit-logs-stat-card">
          <div className="audit-logs-stat-icon">⚠️</div>
          <div className="audit-logs-stat-content">
            <h3 className="audit-logs-stat-title">Suspicious</h3>
            <p className="audit-logs-stat-value">{stats.suspicious_activities}</p>
            <small className="audit-logs-stat-note">
              Last {quickStatsDays} days
            </small>
          </div>
        </div>
        <div className="audit-logs-stat-card">
          <div className="audit-logs-stat-icon">🕒</div>
          <div className="audit-logs-stat-content">
            <h3 className="audit-logs-stat-title">Today's Logs</h3>
            <p className="audit-logs-stat-value">{stats.today_logs}</p>
            <small className="audit-logs-stat-note">
              Current view
            </small>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="audit-logs-advanced-filters">
          <div className="audit-logs-advanced-header">
            <h3>🔍 Advanced Filters</h3>
            <button
              className="audit-logs-reset-filters"
              onClick={resetFilters}
            >
              Reset All Filters
            </button>
          </div>
          <div className="audit-logs-filter-grid">
            <div className="audit-logs-filter-group">
              <label>Action Type:</label>
              <select
                className="audit-logs-advanced-select"
                value={selectedFilter}
                onChange={(e) => handleFilterChange('action', e.target.value)}
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="audit-logs-filter-group">
              <label>Model:</label>
              <select
                className="audit-logs-advanced-select"
                value={selectedModel}
                onChange={(e) => handleFilterChange('model', e.target.value)}
              >
                {modelOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="audit-logs-filter-group">
              <label>User:</label>
              <select
                className="audit-logs-advanced-select"
                value={selectedUser}
                onChange={(e) => handleFilterChange('user', e.target.value)}
              >
                {userOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="audit-logs-filter-group">
              <label>Time Range:</label>
              <select
                className="audit-logs-advanced-select"
                value={selectedTimeRange}
                onChange={(e) => handleFilterChange('timeRange', e.target.value)}
              >
                {timeRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Controls Bar */}
      <div className="audit-logs-controls">
        {/* Search */}
        <div className="audit-logs-search-container">
          <input
            type="text"
            placeholder="Search logs by ID, user, action, or content..."
            className="audit-logs-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="audit-logs-search-button">
            🔍
          </button>
        </div>

        {/* Quick Filters */}
        <div className="audit-logs-filter-group">
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

      {/* Action Buttons with Days Inputs */}
      <div className="audit-logs-action-buttons">
        <div className="audit-logs-action-group">
          <button
            className="audit-logs-action-button audit-logs-action-button-export"
            onClick={() => handleExport("csv")}
            disabled={exporting}
          >
            {exporting ? "⏳" : "📥"} {exporting ? "Exporting..." : "Export CSV"}
          </button>

          <div className="audit-logs-cleanup-section">
            <div className="audit-logs-days-input-group">
              <label>Cleanup older than:</label>
              <select
                value={cleanupDays}
                onChange={(e) => setCleanupDays(Number(e.target.value))}
                className="audit-logs-days-select"
              >
                {daysOptions.map(days => (
                  <option key={days} value={days}>{days} days</option>
                ))}
              </select>
            </div>
            <button
              className="audit-logs-action-button audit-logs-action-button-cleanup"
              onClick={handleCleanup}
              disabled={cleanupLoading}
            >
              {cleanupLoading ? "⏳" : "🧹"} {cleanupLoading ? "Cleaning..." : "Cleanup"}
            </button>
          </div>

          <div className="audit-logs-suspicious-section">
            <div className="audit-logs-days-input-group">
              <label>Search last:</label>
              <select
                value={suspiciousDays}
                onChange={(e) => setSuspiciousDays(Number(e.target.value))}
                className="audit-logs-days-select"
              >
                {daysOptions.slice(0, 4).map(days => (
                  <option key={days} value={days}>{days} days</option>
                ))}
              </select>
            </div>
            <button
              className="audit-logs-action-button audit-logs-action-button-suspicious"
              onClick={handleSearchSuspicious}
            >
              🔍 Suspicious
            </button>
          </div>
        </div>

        <div className="audit-logs-action-group">
          <button
            className="audit-logs-action-button audit-logs-action-button-info"
            onClick={handleSystemHealth}
          >
            💾 System Health
          </button>
          <button
            className="audit-logs-action-button audit-logs-action-button-info"
            onClick={handleCleanupSuggestions}
          >
            💡 Cleanup Tips
          </button>
          <button
            className="audit-logs-action-button audit-logs-action-button-info"
            onClick={handleActivityTimeline}
          >
            📊 Timeline
          </button>
          <button
            className="audit-logs-action-button audit-logs-action-button-info"
            onClick={handleBulkOperations}
          >
            📦 Bulk Ops
          </button>
          <button
            className="audit-logs-action-button audit-logs-action-button-info"
            onClick={handlePaginationInfo}
          >
            📄 Page Info
          </button>
          <button
            className="audit-logs-action-button audit-logs-action-button-refresh"
            onClick={handleRefresh}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Filter Info */}
      {(selectedFilter !== "all" || selectedModel !== "all" || selectedUser !== "all" || searchQuery || selectedTimeRange !== "all") && (
        <div className="audit-logs-filter-info">
          <span className="audit-logs-filter-info-icon">🔍</span>
          <span className="audit-logs-active-filters">
            Active filters:
            {selectedFilter !== "all" && <span className="audit-logs-filter-tag">{getActionDisplayLabel(selectedFilter)}</span>}
            {selectedModel !== "all" && <span className="audit-logs-filter-tag">Model: {selectedModel}</span>}
            {selectedUser !== "all" && <span className="audit-logs-filter-tag">User: {selectedUser}</span>}
            {selectedTimeRange !== "all" && <span className="audit-logs-filter-tag">{timeRangeOptions.find(t => t.value === selectedTimeRange)?.label}</span>}
            {searchQuery && <span className="audit-logs-filter-tag">Search: "{searchQuery}"</span>}
          </span>
          <button
            className="audit-logs-filter-clear"
            onClick={resetFilters}
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Table Info */}
      <div className="audit-logs-table-info">
        Showing {auditLogs.length} of {totalCount.toLocaleString()} logs
        {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
      </div>

      {/* Error Message */}
      {error && (
        <div className="audit-logs-error">
          <span className="audit-logs-error-icon">❌</span>
          {error}
          <button
            className="audit-logs-error-dismiss"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
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
                  <th className="audit-logs-table-header">Model/Object</th>
                  <th className="audit-logs-table-header">Timestamp</th>
                  <th className="audit-logs-table-header">IP Address</th>
                  <th className="audit-logs-table-header">Actions</th>
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
                      <td className="audit-logs-table-cell">
                        <div className="audit-logs-model-cell">
                          <span className="audit-logs-model-name">{log.model_name || "N/A"}</span>
                          {log.object_id && (
                            <span className="audit-logs-object-id">#{log.object_id}</span>
                          )}
                        </div>
                      </td>
                      <td className="audit-logs-table-cell">
                        <span className="audit-logs-timestamp">
                          {formatDate(log.timestamp)}
                        </span>
                      </td>
                      <td className="audit-logs-table-cell">
                        <span className="audit-logs-ip">
                          {log.ip_address || "N/A"}
                        </span>
                      </td>
                      <td className="audit-logs-table-cell">
                        <div className="audit-logs-row-actions">
                          <button
                            className="audit-logs-row-action audit-logs-row-action-view"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLog(log);
                            }}
                            title="View Details"
                          >
                            👁️
                          </button>
                          <button
                            className="audit-logs-row-action audit-logs-row-action-delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteLog(log.id);
                            }}
                            title="Delete Log"
                          >
                            🗑️
                          </button>
                          <button
                            className="audit-logs-row-action audit-logs-row-action-user"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUserActivity(log.id);
                            }}
                            title="User Activity"
                          >
                            👤
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="audit-logs-table-empty">
                      <div className="audit-logs-empty-state">
                        <div className="audit-logs-empty-icon">📋</div>
                        <h3>No audit logs found</h3>
                        <p>Try adjusting your filters or search criteria</p>
                        <button
                          className="audit-logs-empty-action"
                          onClick={resetFilters}
                        >
                          Reset All Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === "timeline" && (
          <div className="audit-logs-timeline">
            {auditLogs.length > 0 ? auditLogs.map((log) => (
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
                    <div className="audit-logs-timeline-details">
                      <span><strong>User:</strong> {getUserDisplay(log)}</span>
                      <span><strong>Model:</strong> {log.model_name || "N/A"}</span>
                      <span><strong>IP:</strong> {log.ip_address || "N/A"}</span>
                    </div>
                    {log.changes && Object.keys(log.changes).length > 0 && (
                      <div className="audit-logs-timeline-changes">
                        <details>
                          <summary>Show Changes</summary>
                          <pre>{JSON.stringify(log.changes, null, 2)}</pre>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div className="audit-logs-empty-state">
                <div className="audit-logs-empty-icon">📅</div>
                <h3>No audit logs in timeline</h3>
                <p>Try adjusting your filters or search criteria</p>
              </div>
            )}
          </div>
        )}

        {viewMode === "compact" && (
          <div className="audit-logs-compact-grid">
            {auditLogs.length > 0 ? auditLogs.map((log) => (
              <div
                key={log.id}
                className="audit-logs-compact-card"
                onClick={() => setSelectedLog(log)}
              >
                <div className="audit-logs-compact-header" style={{
                  borderLeftColor: getSeverityColor(log.action)
                }}>
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
                  <div className="audit-logs-compact-row">
                    <span className="audit-logs-compact-label">User:</span>
                    <span className="audit-logs-compact-value">{getUserDisplay(log)}</span>
                  </div>
                  <div className="audit-logs-compact-row">
                    <span className="audit-logs-compact-label">Model:</span>
                    <span className="audit-logs-compact-value">{log.model_name || "N/A"}</span>
                  </div>
                  <div className="audit-logs-compact-row">
                    <span className="audit-logs-compact-label">IP:</span>
                    <span className="audit-logs-compact-value">{log.ip_address || "N/A"}</span>
                  </div>
                  <div className="audit-logs-compact-row">
                    <span className="audit-logs-compact-label">Request:</span>
                    <span className="audit-logs-compact-value">{log.request_method} {log.request_path}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="audit-logs-empty-state">
                <div className="audit-logs-empty-icon">🔍</div>
                <h3>No audit logs in compact view</h3>
                <p>Try adjusting your filters or search criteria</p>
              </div>
            )}
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
              <h2>
                <span className="audit-logs-modal-icon">{getActionIcon(selectedLog.action)}</span>
                Log Details #{selectedLog.id}
              </h2>
              <div className="audit-logs-modal-actions">
                <button
                  className="audit-logs-modal-action"
                  onClick={() => handleDeleteLog(selectedLog.id)}
                >
                  🗑️ Delete
                </button>
                <button
                  className="audit-logs-modal-close"
                  onClick={() => setSelectedLog(null)}
                >
                  ×
                </button>
              </div>
            </div>
            <div className="audit-logs-modal-body">
              <div className="audit-logs-modal-section">
                <h3>📋 Basic Information</h3>
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
                  <h3>📝 Changes Details</h3>
                  <div className="audit-logs-modal-changes">
                    <pre>{JSON.stringify(selectedLog.changes, null, 2)}</pre>
                  </div>
                </div>
              )}

              {selectedLog.old_values && Object.keys(selectedLog.old_values).length > 0 && (
                <div className="audit-logs-modal-section">
                  <h3>📄 Old Values</h3>
                  <div className="audit-logs-modal-changes">
                    <pre>{JSON.stringify(selectedLog.old_values, null, 2)}</pre>
                  </div>
                </div>
              )}

              {selectedLog.new_values && Object.keys(selectedLog.new_values).length > 0 && (
                <div className="audit-logs-modal-section">
                  <h3>📄 New Values</h3>
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
              <button
                className="audit-logs-modal-button audit-logs-modal-button-user"
                onClick={() => {
                  handleUserActivity(selectedLog.id);
                  setSelectedLog(null);
                }}
              >
                👤 User Activity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;