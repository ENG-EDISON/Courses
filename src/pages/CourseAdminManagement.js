// components/Admin/CourseAdminManagement.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  getAllenrollements,
  updateEnrollment,
  cancelEnrollment,
  getEnrollmentDetails,
  EnrollToCourse
} from '../api/EnrollmentApis';
import { getAllCourses } from '../api/CoursesApi';
import { getStudentsUsers } from '../api/UsersApi'; // Import the students API
import '../static/CourseAdminManagement.css';

// Enrollment Management Component
const EnrollmentManagementTab = ({
  enrollments: propEnrollments,
  courses: propCourses,
  fetchInitialData
}) => {
  const [enrollments, setEnrollments] = useState(propEnrollments || []);
  const [courses, setCourses] = useState(propCourses || []);
  const [loading, setLoading] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    student_id: '',
    course_id: '',
    is_active: true,
    progress: 0
  });
  const [students, setStudents] = useState([]);
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
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [courseSearchTerm, setCourseSearchTerm] = useState('');

  // Filter students based on search term
  const filteredStudents = students.filter(student => {
    if (!studentSearchTerm) return true;

    const term = studentSearchTerm.toLowerCase();
    const username = student.username?.toLowerCase() || '';
    const email = student.email?.toLowerCase() || '';
    const firstName = student.first_name?.toLowerCase() || '';
    const lastName = student.last_name?.toLowerCase() || '';
    const fullName = `${firstName} ${lastName}`.toLowerCase().trim();

    return (
      username.includes(term) ||
      email.includes(term) ||
      firstName.includes(term) ||
      lastName.includes(term) ||
      fullName.includes(term)
    );
  });

  // Filter courses based on search term
  const filteredCourses = courses.filter(course => {
    if (!courseSearchTerm) return true;

    const term = courseSearchTerm.toLowerCase();
    const title = course.title?.toLowerCase() || '';

    return title.includes(term);
  });


  // Extract students from enrollments (standalone function, no dependencies)
  const extractStudentsFromEnrollments = useCallback((enrollmentList, currentStudents) => {
    const uniqueStudents = [];
    const studentMap = new Map();

    enrollmentList.forEach(enrollment => {
      if (enrollment.student_details && !studentMap.has(enrollment.student_details.id)) {
        const studentWithEmail = {
          ...enrollment.student_details,
          email: enrollment.student_details?.email || `${enrollment.student_details.username}@example.com`
        };

        studentMap.set(enrollment.student_details.id, studentWithEmail);
        uniqueStudents.push(studentWithEmail);
      }
    });

    // Only set as fallback if we don't have students from API
    if (currentStudents.length === 0) {
      return uniqueStudents;
    }
    return currentStudents;
  }, []); // No dependencies needed

  // Fetch students from API
  const fetchStudents = useCallback(async () => {
    try {
      const response = await getStudentsUsers();
      if (response.data && Array.isArray(response.data)) {
        // Filter only students (user_type === 'student')
        const studentList = response.data.filter(user => user.user_type === 'student');
        setStudents(studentList);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      // Fallback: extract from enrollments if API fails
      const fallbackStudents = extractStudentsFromEnrollments(enrollments, students);
      if (fallbackStudents.length > 0) {
        setStudents(fallbackStudents);
      }
    }
  }, [enrollments, students, extractStudentsFromEnrollments]); // Added extractStudentsFromEnrollments to dependencies

  // Update when props change
  useEffect(() => {
    setEnrollments(propEnrollments || []);
    setCourses(propCourses || []);
    calculateStats(propEnrollments || []);

    // Fetch students when component mounts or enrollments change
    if (propEnrollments && propEnrollments.length > 0) {
      fetchStudents();
    }
  }, [propEnrollments, propCourses, fetchStudents]);

  const calculateStats = (enrollmentList) => {
    const total = enrollmentList.length;
    const active = enrollmentList.filter(e => {
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
        const studentUsername = enrollment.student_details?.username?.toLowerCase() || '';
        const studentFirstName = enrollment.student_details?.first_name?.toLowerCase() || '';
        const studentLastName = enrollment.student_details?.last_name?.toLowerCase() || '';

        // Get email from multiple possible locations
        const studentEmail = (
          enrollment.student_details?.email ||
          enrollment.course_details?.instructor?.email ||
          ''
        ).toLowerCase();

        const courseTitle = enrollment.course_details?.title?.toLowerCase() || '';
        const instructorName = enrollment.course_details?.instructor?.username?.toLowerCase() || '';

        return (
          studentUsername.includes(term) ||
          studentFirstName.includes(term) ||
          studentLastName.includes(term) ||
          studentEmail.includes(term) ||
          courseTitle.includes(term) ||
          instructorName.includes(term)
        );
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

      switch (filters.dateRange) {
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

      if (sortConfig.key === 'student__username') {
        aValue = a.student_details?.username || '';
        bValue = b.student_details?.username || '';
      } else if (sortConfig.key === 'course__title') {
        aValue = a.course_details?.title || '';
        bValue = b.course_details?.title || '';
      } else if (sortConfig.key === 'student_email') {
        aValue = (
          a.student_details?.email ||
          a.course_details?.instructor?.email ||
          ''
        );
        bValue = (
          b.student_details?.email ||
          b.course_details?.instructor?.email ||
          ''
        );
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

  const handleAddEnrollment = async () => {
    try {
      setLoading(true);

      if (!addFormData.student_id || !addFormData.course_id) {
        alert('Please select both student and course');
        return;
      }

      // Check if enrollment already exists
      const existingEnrollment = enrollments.find(
        e => e.student?.toString() === addFormData.student_id &&
          e.course?.toString() === addFormData.course_id
      );

      if (existingEnrollment) {
        alert('This student is already enrolled in this course');
        return;
      }

      // Prepare enrollment data
      const enrollmentData = {
        student_id: addFormData.student_id,
        course_id: addFormData.course_id,
        is_active: addFormData.is_active,
        progress: parseInt(addFormData.progress) || 0
      };

      // Call the API to enroll student
      const response = await EnrollToCourse(addFormData.course_id, enrollmentData);

      if (response.data) {
        alert('Enrollment added successfully!');
        setShowAddModal(false);
        setAddFormData({
          student_id: '',
          course_id: '',
          is_active: true,
          progress: 0
        });
        await fetchInitialData(); // Refresh the data
      }
    } catch (error) {
      console.error('Error adding enrollment:', error);
      const errorMessage = error.response?.data?.error ||
        error.response?.data?.message ||
        error.message;
      alert(`Failed to add enrollment: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
            placeholder="Search by student name, email, course, or instructor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="s-a-m-search-input"
            aria-label="Search enrollments"
          />

          <select
            value={filters.courseId}
            onChange={(e) => setFilters(prev => ({ ...prev, courseId: e.target.value }))}
            className="s-a-m-filter-select"
            aria-label="Filter by course"
          >
            <option value="all">All Courses</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.title.length > 30 ? `${course.title.substring(0, 30)}...` : course.title} ({course.status})
              </option>
            ))}
          </select>

          <select
            value={filters.enrollmentStatus}
            onChange={(e) => setFilters(prev => ({ ...prev, enrollmentStatus: e.target.value }))}
            className="s-a-m-filter-select"
            aria-label="Filter by status"
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
            aria-label="Filter by date range"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
        </div>

        <div className="s-a-m-bulk-actions">
          <button
            className="s-a-m-btn s-a-m-btn-primary"
            onClick={() => setShowAddModal(true)}
            aria-label="Add new enrollment"
          >
            <span className="s-a-m-btn-icon">+</span>
            <span className="s-a-m-btn-text">Add Enrollment</span>
          </button>

          <span className="s-a-m-selected-count" aria-live="polite">
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
            aria-label="Bulk actions"
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
              <th onClick={() => handleSort('student_email')}>
                Email {sortConfig.key === 'student_email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
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
                <td colSpan="8" className="s-a-m-no-data">
                  No enrollments found
                </td>
              </tr>
            ) : (
              currentEnrollments.map(enrollment => {
                // Get email from multiple locations
                const studentEmail =
                  enrollment.student_details?.email ||
                  enrollment.course_details?.instructor?.email ||
                  `${enrollment.student_details?.username}@example.com`;

                return (
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
                        <small>{enrollment.student_details?.user_type || 'Student'}</small>
                      </div>
                    </td>
                    <td>
                      <div className="s-a-m-email-info">
                        <strong>{studentEmail}</strong>
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
                );
              })
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
                  {i > 0 && arr[i - 1] !== page - 1 && <span className="s-a-m-page-ellipsis">...</span>}
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

      {/* Compact Add Enrollment Modal */}
      {/* Add Enrollment Modal - Search Only */}
      {showAddModal && (
        <div className="s-a-m-modal-overlay">
          <div className="s-a-m-modal-content">
            <div className="s-a-m-modal-header">
              <h3>Add Enrollment</h3>
              <button className="s-a-m-close-btn" onClick={() => {
                setShowAddModal(false);
                setStudentSearchTerm('');
                setCourseSearchTerm('');
              }}>×</button>
            </div>

            <div className="s-a-m-modal-body">
            {/* Student Search */}
            <div className="s-a-m-form-group">
              <label>Student *</label>
              <input
                type="text"
                placeholder="Search student by name, email, or username..."
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
                className="s-a-m-form-input-search"
                autoComplete="off"
              />
              
              {/* Search results dropdown */}
              {studentSearchTerm && filteredStudents.length > 0 && !addFormData.student_id && (
                <div className="s-a-m-form-search-dropdown">
                  {filteredStudents.map(student => (
                    <div 
                      key={student.id}
                      className="s-a-m-form-search-item"
                      onClick={() => {
                        setAddFormData(prev => ({ ...prev, student_id: student.id.toString() }));
                        setStudentSearchTerm(''); // Clear search term to close dropdown
                      }}
                    >
                      <strong>{student.username}</strong>
                      <div className="s-a-m-form-search-details">
                        {student.email && <span>{student.email}</span>}
                        {(student.first_name || student.last_name) && (
                          <span>{student.first_name} {student.last_name}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* No results */}
              {studentSearchTerm && filteredStudents.length === 0 && !addFormData.student_id && (
                <div className="s-a-m-form-no-results">No students found</div>
              )}
              
              {/* Selected student info */}
              {addFormData.student_id && (
                <div className="s-a-m-form-selected">
                  ✓ Selected: {students.find(s => s.id.toString() === addFormData.student_id)?.username}
                  <button 
                    onClick={() => {
                      setAddFormData(prev => ({ ...prev, student_id: '' }));
                      setStudentSearchTerm('');
                    }}
                    className="s-a-m-form-clear-btn"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

              {/* Course Search */}
              <div className="s-a-m-form-group">
                <label>Course *</label>
                <input
                  type="text"
                  placeholder="Search course by title..."
                  value={courseSearchTerm}
                  onChange={(e) => setCourseSearchTerm(e.target.value)}
                  className="s-a-m-form-input-search"
                  autoComplete="off"
                />
                
                {/* Search results dropdown - only show if searching AND no course is selected OR selected course doesn't match search */}
                {courseSearchTerm && filteredCourses.length > 0 && !addFormData.course_id && (
                  <div className="s-a-m-form-search-dropdown">
                    {filteredCourses.map(course => (
                      <div 
                        key={course.id}
                        className="s-a-m-form-search-item"
                        onClick={() => {
                          setAddFormData(prev => ({ ...prev, course_id: course.id.toString() }));
                          setCourseSearchTerm(''); // Clear search term to close dropdown
                        }}
                      >
                        <strong>{course.title}</strong>
                        <div className="s-a-m-form-search-details">
                          <span>Instructor ID: {course.instructor}</span>
                          {course.category_details?.name && <span>{course.category_details.name}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* No results - only show if searching AND no course is selected */}
                {courseSearchTerm && filteredCourses.length === 0 && !addFormData.course_id && (
                  <div className="s-a-m-form-no-results">No courses found</div>
                )}
                
                {/* Selected course info */}
                {addFormData.course_id && (
                  <div className="s-a-m-form-selected">
                    ✓ Selected: {courses.find(c => c.id.toString() === addFormData.course_id)?.title}
                    <button 
                      onClick={() => {
                        setAddFormData(prev => ({ ...prev, course_id: '' }));
                        setCourseSearchTerm('');
                      }}
                      className="s-a-m-form-clear-btn"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Progress */}
              <div className="s-a-m-form-group">
                <label>Progress (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={addFormData.progress}
                  onChange={handleAddFormChange}
                  name="progress"
                  className="s-a-m-form-input"
                />
              </div>

              {/* Active checkbox */}
              <div className="s-a-m-form-checkbox">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={addFormData.is_active}
                  onChange={handleAddFormChange}
                  className="s-a-m-form-checkbox-input"
                />
                <label htmlFor="is_active">Active enrollment</label>
              </div>

              {/* Buttons */}
              <div className="s-a-m-form-actions">
                <button
                  className="s-a-m-btn s-a-m-btn-secondary"
                  onClick={() => {
                    setShowAddModal(false);
                    setStudentSearchTerm('');
                    setCourseSearchTerm('');
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  className="s-a-m-btn s-a-m-btn-primary"
                  onClick={handleAddEnrollment}
                  disabled={!addFormData.student_id || !addFormData.course_id || loading}
                >
                  {loading ? 'Adding...' : 'Add Enrollment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compact Enrollment Details Modal */}
      {selectedEnrollment && (
        <div className="s-a-m-modal-overlay">
          <div className="s-a-m-modal-content">
            <div className="s-a-m-modal-header">
              <h3>📋 Enrollment Details</h3>
              <button className="s-a-m-close-btn" onClick={() => setSelectedEnrollment(null)}>×</button>
            </div>

            <div className="s-a-m-modal-body">
              <div className="s-a-m-detail-grid">
                <div className="s-a-m-detail-section">
                  <h4>👤 Student</h4>
                  <div className="s-a-m-detail-item">
                    <span className="s-a-m-detail-label">Name:</span>
                    <span className="s-a-m-detail-value">{selectedEnrollment.student_details?.username}</span>
                  </div>
                  <div className="s-a-m-detail-item">
                    <span className="s-a-m-detail-label">Email:</span>
                    <span className="s-a-m-detail-value">
                      {selectedEnrollment.student_details?.email ||
                        selectedEnrollment.course_details?.instructor?.email ||
                        'No email available'}
                    </span>
                  </div>
                  <div className="s-a-m-detail-item">
                    <span className="s-a-m-detail-label">Type:</span>
                    <span className="s-a-m-detail-value">{selectedEnrollment.student_details?.user_type}</span>
                  </div>
                </div>

                <div className="s-a-m-detail-section">
                  <h4>📚 Course</h4>
                  <div className="s-a-m-detail-item">
                    <span className="s-a-m-detail-label">Title:</span>
                    <span className="s-a-m-detail-value">{selectedEnrollment.course_details?.title}</span>
                  </div>
                  <div className="s-a-m-detail-item">
                    <span className="s-a-m-detail-label">Instructor:</span>
                    <span className="s-a-m-detail-value">{selectedEnrollment.course_details?.instructor?.username}</span>
                  </div>
                  <div className="s-a-m-detail-item">
                    <span className="s-a-m-detail-label">Category:</span>
                    <span className="s-a-m-detail-value">{selectedEnrollment.course_details?.category}</span>
                  </div>
                </div>

                <div className="s-a-m-detail-section">
                  <h4>📊 Enrollment</h4>
                  <div className="s-a-m-detail-item">
                    <span className="s-a-m-detail-label">Enrolled:</span>
                    <span className="s-a-m-detail-value">
                      {new Date(selectedEnrollment.enrolled_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="s-a-m-detail-item">
                    <span className="s-a-m-detail-label">Progress:</span>
                    <span className="s-a-m-detail-value">{selectedEnrollment.progress}%</span>
                  </div>
                  <div className="s-a-m-detail-item">
                    <span className="s-a-m-detail-label">Status:</span>
                    <span className="s-a-m-detail-value">
                      <span className={`s-a-m-status-badge s-a-m-status-${selectedEnrollment.enrollment_status || (selectedEnrollment.completed_at ? 'completed' : selectedEnrollment.is_active ? 'active' : 'cancelled')}`}>
                        {selectedEnrollment.enrollment_status || (selectedEnrollment.completed_at ? 'Completed' : selectedEnrollment.is_active ? 'Active' : 'Cancelled')}
                      </span>
                    </span>
                  </div>
                  {selectedEnrollment.completed_at && (
                    <div className="s-a-m-detail-item">
                      <span className="s-a-m-detail-label">Completed:</span>
                      <span className="s-a-m-detail-value">
                        {new Date(selectedEnrollment.completed_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="s-a-m-modal-actions">
                {selectedEnrollment.is_active && !selectedEnrollment.completed_at && (
                  <>
                    <button
                      className="s-a-m-btn s-a-m-btn-complete s-a-m-modal-btn"
                      onClick={() => {
                        handleUpdateStatus(selectedEnrollment.id, { completed_at: new Date().toISOString() });
                      }}
                    >
                      Mark Complete
                    </button>
                    <button
                      className="s-a-m-btn s-a-m-btn-cancel s-a-m-modal-btn"
                      onClick={() => {
                        handleCancelEnrollment(selectedEnrollment.id);
                        setSelectedEnrollment(null);
                      }}
                    >
                      Cancel
                    </button>
                  </>
                )}
                {!selectedEnrollment.is_active && !selectedEnrollment.completed_at && (
                  <button
                    className="s-a-m-btn s-a-m-btn-activate s-a-m-modal-btn"
                    onClick={() => {
                      handleUpdateStatus(selectedEnrollment.id, { is_active: true });
                    }}
                  >
                    Reactivate
                  </button>
                )}
                <button
                  className="s-a-m-btn s-a-m-btn-close s-a-m-modal-btn"
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

// Courses Management Component
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

// Progress Tracking Component
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

      const enrollmentData = enrollmentsRes.data?.enrollments || enrollmentsRes.data || [];
      setEnrollments(enrollmentData);
      setCourses(coursesRes.data || []);

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