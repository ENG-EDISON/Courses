// components/Admin/CourseAdminManagement.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  getAllenrollements, 
  updateEnrollment, 
  cancelEnrollment,
  getEnrollmentDetails,
} from '../api/EnrollmentApis';
import { getAllCourses } from '../api/CoursesApi';
import '../static/CourseAdminManagement.css';

// Enrollment Management Component (moved to a separate component)
const EnrollmentManagementTab = ({ 
  enrollments: propEnrollments, 
  courses: propCourses,
  fetchInitialData 
}) => {
  // IMPORTANT: propEnrollments now comes from response.data.enrollments
  const [enrollments, setEnrollments] = useState(propEnrollments || []);
  const [courses, setCourses] = useState(propCourses || []);
  const [loading, setLoading] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    enrollmentStatus: 'all',
    courseId: '',
    dateRange: 'all'
  });
  const [sortConfig, setSortConfig] = useState({ key: 'enrolled_at', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedIds, setSelectedIds] = useState([]);
  const selectAllRef = useRef(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    averageProgress: 0
  });

  // Update when props change
  useEffect(() => {
    // propEnrollments is now the nested enrollments array from API response
    setEnrollments(propEnrollments || []);
    setCourses(propCourses || []);
    calculateStats(propEnrollments || []);
  }, [propEnrollments, propCourses]);

  const calculateStats = (enrollmentList) => {
    const total = enrollmentList.length;
    const active = enrollmentList.filter(e => {
      // Check both ways for status
      if (e.enrollment_status === 'active') return true;
      return e.is_active && !e.completed_at;
    }).length;
    const completed = enrollmentList.filter(e => {
      if (e.enrollment_status === 'completed') return true;
      return e.completed_at;
    }).length;
    const cancelled = enrollmentList.filter(e => {
      if (e.enrollment_status === 'cancelled') return true;
      return !e.is_active;
    }).length;
    const avgProgress = total > 0 
      ? Math.round(enrollmentList.reduce((sum, e) => sum + (e.progress || 0), 0) / total)
      : 0;

    setStats({
      total,
      active,
      completed,
      cancelled,
      averageProgress: avgProgress,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    });
  };

  const getFilteredEnrollments = () => {
    let filtered = [...enrollments];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(enrollment => {
        // Access student details from student_details object
        const studentUsername = enrollment.student_details?.username?.toLowerCase() || '';
        const studentEmail = enrollment.student_details?.email?.toLowerCase() || '';
        const courseTitle = enrollment.course_details?.title?.toLowerCase() || '';
        
        return studentUsername.includes(term) || 
               studentEmail.includes(term) || 
               courseTitle.includes(term);
      });
    }
    
    if (filters.courseId && filters.courseId !== 'all') {
      filtered = filtered.filter(enrollment => 
        enrollment.course?.toString() === filters.courseId || 
        enrollment.course_details?.id?.toString() === filters.courseId
      );
    }
    
    if (filters.enrollmentStatus !== 'all') {
      filtered = filtered.filter(enrollment => {
        const status = enrollment.enrollment_status || 
                      (enrollment.completed_at ? 'completed' : 
                       enrollment.is_active ? 'active' : 'cancelled');
        return status === filters.enrollmentStatus;
      });
    }
    
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      switch(filters.dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          break;
      }
      
      filtered = filtered.filter(enrollment => {
        const enrolledDate = new Date(enrollment.enrolled_at);
        return enrolledDate >= startDate;
      });
    }
    
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      // Handle different sort keys
      if (sortConfig.key === 'student__username') {
        aValue = a.student_details?.username || '';
        bValue = b.student_details?.username || '';
      } else if (sortConfig.key === 'course__title') {
        aValue = a.course_details?.title || '';
        bValue = b.course_details?.title || '';
      } else {
        aValue = a[sortConfig.key];
        bValue = b[sortConfig.key];
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    return filtered;
  };

  const filteredEnrollments = getFilteredEnrollments();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEnrollments = filteredEnrollments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEnrollments.length / itemsPerPage);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSelectEnrollment = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAllRef.current) {
      setSelectedIds([]);
      selectAllRef.current = false;
    } else {
      setSelectedIds(currentEnrollments.map(e => e.id));
      selectAllRef.current = true;
    }
  };

  const handleUpdateStatus = async (enrollmentId, updates) => {
    try {
      setLoading(true);
      await updateEnrollment(enrollmentId, updates);
      await fetchInitialData();
      
      if (selectedEnrollment?.id === enrollmentId) {
        const updated = await getEnrollmentDetails(enrollmentId);
        setSelectedEnrollment(updated.data);
      }
      
      alert('Enrollment updated successfully!');
    } catch (error) {
      console.error('Error updating enrollment:', error);
      alert('Failed to update enrollment');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEnrollment = async (enrollmentId) => {
    if (window.confirm('Are you sure you want to cancel this enrollment?')) {
      try {
        setLoading(true);
        await cancelEnrollment(enrollmentId);
        await fetchInitialData();
        
        if (selectedEnrollment?.id === enrollmentId) {
          setSelectedEnrollment(null);
        }
        
        alert('Enrollment cancelled successfully!');
      } catch (error) {
        console.error('Error cancelling enrollment:', error);
        alert('Failed to cancel enrollment');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) {
      alert('Please select enrollments first');
      return;
    }

    const actionText = {
      activate: 'activate',
      deactivate: 'deactivate',
      cancel: 'cancel'
    }[action];

    if (!window.confirm(`Are you sure you want to ${actionText} ${selectedIds.length} enrollment(s)?`)) {
      return;
    }

    try {
      setLoading(true);
      if (action === 'cancel') {
        await Promise.all(selectedIds.map(id => cancelEnrollment(id)));
      } else if (action === 'activate' || action === 'deactivate') {
        const updates = { is_active: action === 'activate' };
        await Promise.all(selectedIds.map(id => updateEnrollment(id, updates)));
      }
      
      await fetchInitialData();
      setSelectedIds([]);
      alert(`Successfully ${actionText}ed ${selectedIds.length} enrollment(s)!`);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Failed to perform bulk action');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (enrollmentId) => {
    try {
      setLoading(true);
      const response = await getEnrollmentDetails(enrollmentId);
      setSelectedEnrollment(response.data);
    } catch (error) {
      console.error('Error fetching enrollment details:', error);
      alert('Failed to load enrollment details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="s-a-m-loading">
        <div className="s-a-m-loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="s-a-m-tab-content">
      {/* Header with Stats */}
      <div className="s-a-m-tab-header">
        <h3>Enrollment Management</h3>
        <div className="s-a-m-stats-cards">
          <div className="s-a-m-stat-card">
            <h4>Total Enrollments</h4>
            <p className="s-a-m-stat-number">{stats.total}</p>
          </div>
          <div className="s-a-m-stat-card">
            <h4>Active</h4>
            <p className="s-a-m-stat-number">{stats.active}</p>
          </div>
          <div className="s-a-m-stat-card">
            <h4>Completed</h4>
            <p className="s-a-m-stat-number">{stats.completed}</p>
          </div>
          <div className="s-a-m-stat-card">
            <h4>Avg Progress</h4>
            <p className="s-a-m-stat-number">{stats.averageProgress}%</p>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="s-a-m-controls">
        <div className="s-a-m-search-controls">
          <input
            type="text"
            placeholder="Search by student, email, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="s-a-m-search-input"
          />
          
          <select
            value={filters.courseId}
            onChange={(e) => setFilters(prev => ({ ...prev, courseId: e.target.value }))}
            className="s-a-m-filter-select"
          >
            <option value="all">All Courses</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.title} ({course.status})
              </option>
            ))}
          </select>
          
          <select
            value={filters.enrollmentStatus}
            onChange={(e) => setFilters(prev => ({ ...prev, enrollmentStatus: e.target.value }))}
            className="s-a-m-filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
            className="s-a-m-filter-select"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
        </div>
        
        <div className="s-a-m-bulk-actions">
          <span className="s-a-m-selected-count">
            {selectedIds.length} selected
          </span>
          <select
            className="s-a-m-bulk-select"
            onChange={(e) => {
              if (e.target.value) {
                handleBulkAction(e.target.value);
                e.target.value = '';
              }
            }}
            disabled={selectedIds.length === 0}
          >
            <option value="">Bulk Actions</option>
            <option value="activate">Activate Selected</option>
            <option value="deactivate">Deactivate Selected</option>
            <option value="cancel">Cancel Selected</option>
          </select>
        </div>
      </div>

      {/* Enrollment Table */}
      <div className="s-a-m-table-container">
        <table className="s-a-m-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedIds.length === currentEnrollments.length && currentEnrollments.length > 0}
                  className="s-a-m-checkbox"
                />
              </th>
              <th onClick={() => handleSort('student__username')}>
                Student {sortConfig.key === 'student__username' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('course__title')}>
                Course {sortConfig.key === 'course__title' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('enrolled_at')}>
                Enrolled {sortConfig.key === 'enrolled_at' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th>Progress</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentEnrollments.length === 0 ? (
              <tr>
                <td colSpan="7" className="s-a-m-no-data">
                  No enrollments found
                </td>
              </tr>
            ) : (
              currentEnrollments.map(enrollment => (
                <tr key={enrollment.id} className={`s-a-m-table-row ${selectedIds.includes(enrollment.id) ? 's-a-m-row-selected' : ''}`}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(enrollment.id)}
                      onChange={() => handleSelectEnrollment(enrollment.id)}
                      className="s-a-m-checkbox"
                    />
                  </td>
                  <td>
                    <div className="s-a-m-student-info">
                      <strong>{enrollment.student_details?.username || 'Unknown'}</strong>
                      <small>{enrollment.student_details?.email || 'No email'}</small>
                    </div>
                  </td>
                  <td>
                    <div className="s-a-m-course-info">
                      <strong>{enrollment.course_details?.title || 'Unknown Course'}</strong>
                      <small>{enrollment.course_details?.instructor?.username || 'Unknown Instructor'}</small>
                    </div>
                  </td>
                  <td className="s-a-m-date-cell">
                    <div>{new Date(enrollment.enrolled_at).toLocaleDateString()}</div>
                    <small>{new Date(enrollment.enrolled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                  </td>
                  <td>
                    <div className="s-a-m-progress-container">
                      <div className="s-a-m-progress-bar">
                        <div 
                          className="s-a-m-progress-fill" 
                          style={{ width: `${enrollment.progress || 0}%` }}
                        ></div>
                      </div>
                      <span className="s-a-m-progress-text">{Math.round(enrollment.progress || 0)}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`s-a-m-status-badge s-a-m-status-${enrollment.enrollment_status || (enrollment.completed_at ? 'completed' : enrollment.is_active ? 'active' : 'cancelled')}`}>
                      {enrollment.enrollment_status || (enrollment.completed_at ? 'Completed' : enrollment.is_active ? 'Active' : 'Cancelled')}
                    </span>
                  </td>
                  <td>
                    <div className="s-a-m-action-buttons">
                      <button 
                        className="s-a-m-btn s-a-m-btn-view"
                        onClick={() => handleViewDetails(enrollment.id)}
                      >
                        View
                      </button>
                      {(enrollment.is_active || enrollment.enrollment_status === 'active') && !enrollment.completed_at && (
                        <>
                          <button 
                            className="s-a-m-btn s-a-m-btn-complete"
                            onClick={() => handleUpdateStatus(enrollment.id, { completed_at: new Date().toISOString() })}
                          >
                            Complete
                          </button>
                          <button 
                            className="s-a-m-btn s-a-m-btn-cancel"
                            onClick={() => handleCancelEnrollment(enrollment.id)}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {(!enrollment.is_active || enrollment.enrollment_status === 'cancelled') && !enrollment.completed_at && (
                        <button 
                          className="s-a-m-btn s-a-m-btn-activate"
                          onClick={() => handleUpdateStatus(enrollment.id, { is_active: true })}
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="s-a-m-pagination">
          <button
            className="s-a-m-pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          <div className="s-a-m-page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1))
              .map((page, i, arr) => (
                <React.Fragment key={page}>
                  {i > 0 && arr[i-1] !== page - 1 && <span className="s-a-m-page-ellipsis">...</span>}
                  <button
                    className={`s-a-m-page-btn ${currentPage === page ? 's-a-m-page-active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                </React.Fragment>
              ))
            }
          </div>
          
          <button
            className="s-a-m-pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Enrollment Details Modal */}
      {selectedEnrollment && (
        <div className="s-a-m-modal-overlay">
          <div className="s-a-m-modal-content">
            <div className="s-a-m-modal-header">
              <h3>Enrollment Details</h3>
              <button className="s-a-m-close-btn" onClick={() => setSelectedEnrollment(null)}>×</button>
            </div>
            
            <div className="s-a-m-modal-body">
              <div className="s-a-m-detail-grid">
                <div className="s-a-m-detail-section">
                  <h4>Student Information</h4>
                  <p><strong>Username:</strong> {selectedEnrollment.student_details?.username}</p>
                  <p><strong>Email:</strong> {selectedEnrollment.student_details?.email}</p>
                  <p><strong>User Type:</strong> {selectedEnrollment.student_details?.user_type}</p>
                  <p><strong>Phone:</strong> {selectedEnrollment.student_details?.phone_number || 'N/A'}</p>
                </div>
                
                <div className="s-a-m-detail-section">
                  <h4>Course Information</h4>
                  <p><strong>Course:</strong> {selectedEnrollment.course_details?.title}</p>
                  <p><strong>Instructor:</strong> {selectedEnrollment.course_details?.instructor?.username}</p>
                  <p><strong>Category:</strong> {selectedEnrollment.course_details?.category}</p>
                  <p><strong>Status:</strong> {selectedEnrollment.course_details?.status}</p>
                </div>
                
                <div className="s-a-m-detail-section">
                  <h4>Enrollment Details</h4>
                  <p><strong>Enrolled:</strong> {new Date(selectedEnrollment.enrolled_at).toLocaleString()}</p>
                  <p><strong>Last Accessed:</strong> {new Date(selectedEnrollment.last_accessed).toLocaleString()}</p>
                  <p><strong>Progress:</strong> {selectedEnrollment.progress}%</p>
                  <p><strong>Days Enrolled:</strong> {selectedEnrollment.days_enrolled} days</p>
                  <p><strong>Status:</strong> 
                    <span className={`s-a-m-status-badge s-a-m-status-${selectedEnrollment.enrollment_status || (selectedEnrollment.completed_at ? 'completed' : selectedEnrollment.is_active ? 'active' : 'cancelled')}`}>
                      {selectedEnrollment.enrollment_status || (selectedEnrollment.completed_at ? 'Completed' : selectedEnrollment.is_active ? 'Active' : 'Cancelled')}
                    </span>
                  </p>
                  {selectedEnrollment.completed_at && (
                    <p><strong>Completed:</strong> {new Date(selectedEnrollment.completed_at).toLocaleString()}</p>
                  )}
                </div>
              </div>
              
              <div className="s-a-m-modal-actions">
                {selectedEnrollment.is_active && !selectedEnrollment.completed_at && (
                  <>
                    <button 
                      className="s-a-m-btn s-a-m-btn-complete"
                      onClick={() => {
                        handleUpdateStatus(selectedEnrollment.id, { completed_at: new Date().toISOString() });
                      }}
                    >
                      Mark as Complete
                    </button>
                    <button 
                      className="s-a-m-btn s-a-m-btn-cancel"
                      onClick={() => {
                        handleCancelEnrollment(selectedEnrollment.id);
                        setSelectedEnrollment(null);
                      }}
                    >
                      Cancel Enrollment
                    </button>
                  </>
                )}
                {!selectedEnrollment.is_active && !selectedEnrollment.completed_at && (
                  <button 
                    className="s-a-m-btn s-a-m-btn-activate"
                    onClick={() => {
                      handleUpdateStatus(selectedEnrollment.id, { is_active: true });
                    }}
                  >
                    Reactivate Enrollment
                  </button>
                )}
                <button 
                  className="s-a-m-btn s-a-m-btn-close"
                  onClick={() => setSelectedEnrollment(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Courses Management Component (placeholder for now)
const CoursesManagementTab = () => {
  return (
    <div className="s-a-m-tab-content">
      <div className="s-a-m-tab-header">
        <h3>📚 Courses Management</h3>
        <p>Manage all courses in the platform</p>
      </div>
      
      <div className="s-a-m-placeholder">
        <h4>Courses Management Features</h4>
        <ul>
          <li>Course catalog management</li>
          <li>Create/edit/delete courses</li>
          <li>Course status management</li>
          <li>Featured courses</li>
          <li>Course analytics</li>
        </ul>
        <p>This section is under development. You can add courses management functionality here.</p>
      </div>
    </div>
  );
};

// Progress Tracking Component (placeholder for now)
const ProgressTrackingTab = () => {
  return (
    <div className="s-a-m-tab-content">
      <div className="s-a-m-tab-header">
        <h3>📊 Progress Tracking</h3>
        <p>Track student progress and analytics</p>
      </div>
      
      <div className="s-a-m-placeholder">
        <h4>Progress Tracking Features</h4>
        <ul>
          <li>Student progress analytics</li>
          <li>Course completion rates</li>
          <li>Time spent tracking</li>
          <li>Engagement metrics</li>
          <li>Progress reports</li>
        </ul>
        <p>This section is under development. You can add progress tracking functionality here.</p>
      </div>
    </div>
  );
};

// Main CourseAdminManagement Component with Tabs
const CourseAdminManagement = () => {
  const [activeTab, setActiveTab] = useState('enrollment');
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollmentStats, setEnrollmentStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    averageProgress: 0
  });

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [enrollmentsRes, coursesRes] = await Promise.all([
        getAllenrollements(),
        getAllCourses()
      ]);
      
      // IMPORTANT: Access the nested enrollments array from response
      const enrollmentData = enrollmentsRes.data?.enrollments || enrollmentsRes.data || [];
      setEnrollments(enrollmentData);
      setCourses(coursesRes.data || []);
      
      // Update stats from API response if available
      if (enrollmentsRes.data) {
        setEnrollmentStats({
          total: enrollmentsRes.data.total_enrollments || enrollmentData.length,
          active: enrollmentsRes.data.active_enrollments || 0,
          completed: enrollmentsRes.data.completed_enrollments || 0,
          cancelled: enrollmentsRes.data.cancelled_enrollments || 0,
          averageProgress: enrollmentsRes.data.average_progress || 0
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const tabs = [
    { id: 'enrollment', label: 'Enrollment Management', icon: '👥' },
    { id: 'courses', label: 'Courses Management', icon: '📚' },
    { id: 'progress', label: 'Progress Tracking', icon: '📊' },
  ];

  if (loading) {
    return (
      <div className="s-a-m-loading">
        <div className="s-a-m-loading-spinner"></div>
        <p>Loading admin data...</p>
      </div>
    );
  }

  return (
    <div className="s-a-m-container">
      {/* Main Header */}
      <div className="s-a-m-header">
        <h2>📚 Course Administration</h2>
        <p>Manage courses, enrollments, and student progress</p>
        <div className="s-a-m-stats-cards" style={{ marginTop: '20px' }}>
          <div className="s-a-m-stat-card">
            <h4>Total Enrollments</h4>
            <p className="s-a-m-stat-number">{enrollmentStats.total}</p>
          </div>
          <div className="s-a-m-stat-card">
            <h4>Active</h4>
            <p className="s-a-m-stat-number">{enrollmentStats.active}</p>
          </div>
          <div className="s-a-m-stat-card">
            <h4>Completed</h4>
            <p className="s-a-m-stat-number">{enrollmentStats.completed}</p>
          </div>
          <div className="s-a-m-stat-card">
            <h4>Avg Progress</h4>
            <p className="s-a-m-stat-number">{enrollmentStats.averageProgress}%</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="s-a-m-tab-navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`s-a-m-tab-btn ${activeTab === tab.id ? 's-a-m-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="s-a-m-tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="s-a-m-tab-content-container">
        {activeTab === 'enrollment' && (
          <EnrollmentManagementTab 
            enrollments={enrollments}
            courses={courses}
            fetchInitialData={fetchInitialData}
          />
        )}
        {activeTab === 'courses' && <CoursesManagementTab />}
        {activeTab === 'progress' && <ProgressTrackingTab />}
      </div>
    </div>
  );
};

export default CourseAdminManagement;