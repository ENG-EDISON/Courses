import React, { useState, useEffect } from 'react';
import './CourseEditor.css';
import CourseStructure from '../CourseStructure/course/CourseStructure';
import CourseDetailsEditForm from '../../CourseDetailsEditForm/CourseDetailsEditForm';
import { getMyProfile } from '../../../api/ProfileApis';
import { getAllCourses, updateCourse, deleteCourse } from '../../../api/CoursesApi';
import CourseCreator from '../categorymanagement/CourseCreator';
import CategoryManager from '../categorymanagement/CategoryManager';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import Footer from '../../common/Footer';

const CourseEditor = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ 
    isOpen: false, 
    course: null 
  });

  // Load courses from API
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      const profileResponse = await getMyProfile();
      const userId = profileResponse.data.id;
      const coursesResponse = await getAllCourses();
      const myCourses = coursesResponse.data.filter(course => course.instructor === userId);
      setCourses(myCourses);
    } catch (error) {
      alert('Error loading courses: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setActiveTab('structure');
  };

const handleCourseUpdate = async (updatedCourseData) => {    
    if (!selectedCourse) {
        console.error('No course selected');
        return;
    }
    
    // Check if this is form data (from child) or response data
    // If it's FormData or a plain object with form fields, make API call
    // If it's response data (has id, thumbnail as URL, etc.), just update state
    const isFormData = updatedCourseData instanceof FormData;
    const isResponseData = updatedCourseData && 
                          typeof updatedCourseData === 'object' && 
                          updatedCourseData.id && 
                          updatedCourseData.title;
  
    if (isResponseData && !isFormData) {
        // This is response data from the child's API call
        // Just update state, don't make another API call
        setSelectedCourse(updatedCourseData);
        setCourses(prev => prev.map(course =>
            course.id === updatedCourseData.id ? updatedCourseData : course
        ));
        // Don't show alert - child already showed it
        return;
    }
    
    // If it's form data, make the API call
    setIsLoading(true);
    try {
        const response = await updateCourse(selectedCourse.id, updatedCourseData);
        
        // Update state with response
        setSelectedCourse(response.data);
        setCourses(prev => prev.map(course =>
            course.id === selectedCourse.id ? response.data : course
        ));
        
        alert('Course updated successfully111!');
        
    } catch (error) {
        console.error('❌ API call failed:', error);
        console.error('Error response:', error.response?.data);
        
        let errorMsg = 'Error updating course: ';
        if (error.response?.data) {
            if (typeof error.response.data === 'object') {
                const errors = [];
                for (const key in error.response.data) {
                    if (Array.isArray(error.response.data[key])) {
                        errors.push(`${key}: ${error.response.data[key].join(', ')}`);
                    } else {
                        errors.push(`${key}: ${error.response.data[key]}`);
                    }
                }
                errorMsg += errors.join('\n');
            } else {
                errorMsg += error.response.data;
            }
        } else {
            errorMsg += error.message || 'Unknown error';
        }
        
        alert(errorMsg);
    } finally {
        setIsLoading(false);
    }
};

  const handleCourseCreated = (newCourse) => {
    setCourses(prev => [...prev, newCourse]);
    setSelectedCourse(newCourse);
    setActiveTab('structure');
  };

  // Open delete confirmation modal
  const handleDeleteClick = (course) => {
    setDeleteModal({
      isOpen: true,
      course: course
    });
  };

  // Close delete confirmation modal
  const handleCloseModal = () => {
    setDeleteModal({
      isOpen: false,
      course: null
    });
  };

  // Confirm and execute deletion
  const handleConfirmDelete = async () => {
    if (!deleteModal.course) return;

    const courseId = deleteModal.course.id;
    const courseTitle = deleteModal.course.title;

    try {
      setIsLoading(true);
      await deleteCourse(courseId);
      
      // Remove course from state
      setCourses(prev => prev.filter(course => course.id !== courseId));
      
      // If the deleted course was currently selected, clear selection
      if (selectedCourse && selectedCourse.id === courseId) {
        setSelectedCourse(null);
        setActiveTab('overview');
      }
      
      // Close modal
      handleCloseModal();
      
      alert(`Course "${courseTitle}" deleted successfully!`);
      
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Error deleting course: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

const handleStructureUpdate = (sections) => {
  // intentionally empty
};


  const handleStructureSave = (saveResult) => {

  };

  // Navigation functions
  const navigateToOverview = () => {
    setSelectedCourse(null);
    setActiveTab('overview');
  };

  const navigateToCreateCourse = () => {
    setActiveTab('create-course');
  };

  const navigateToManageCategories = () => {
    setActiveTab('manage-categories');
  };

  return (

    <div>
    <div className="course-editor">
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        itemName={deleteModal.course?.title}
        itemType="course"
        isLoading={isLoading}
      />

      {/* Header */}
      <div className="editor-header">
        <div className="header-main">
          <h1>Course Management</h1>
          <div className="header-subtitle">
            {selectedCourse ? `Editing: ${selectedCourse.title}` : 'Create and manage your courses'}
          </div>
        </div>
        
        {/* Main Navigation */}
        <nav className="main-navigation">
          <button
            className={`nav-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={navigateToOverview}
          >
            📊 Overview
          </button>
          <button
            className={`nav-button ${activeTab === 'create-course' ? 'active' : ''}`}
            onClick={navigateToCreateCourse}
          >
            ➕ Create Course
          </button>
          <button
            className={`nav-button ${activeTab === 'manage-categories' ? 'active' : ''}`}
            onClick={navigateToManageCategories}
          >
            📁 Categories
          </button>
        </nav>
      </div>

      {/* Course Selection Bar (only when editing) */}
      {selectedCourse && (activeTab === 'structure' || activeTab === 'details') && (
        <div className="course-selection-bar">
          <div className="course-selector">
            <label>Currently Editing:</label>
            <select
              value={selectedCourse?.id || ''}
              onChange={(e) => {
                const courseId = e.target.value;
                const course = courses.find(c => c.id === parseInt(courseId));
                handleCourseSelect(course);
              }}
              className="course-dropdown"
            >
              <option value="">Select another course...</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title} {course.status === 'draft' ? '(Draft)' : ''}
                </option>
              ))}
            </select>
          </div>
          <button 
            className="back-to-overview"
            onClick={navigateToOverview}
          >
            ← Back to Overview
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="editor-main-content">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="overview-header">
              <h2>Course Overview</h2>
              <p>Manage your teaching materials and track course performance</p>
            </div>

            {/* Quick Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📚</div>
                <div className="stat-content">
                  <h3>{courses.length}</h3>
                  <p>Total Courses</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <h3>{courses.filter(c => c.status === 'published').length}</h3>
                  <p>Published</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📝</div>
                <div className="stat-content">
                  <h3>{courses.filter(c => c.status === 'draft').length}</h3>
                  <p>Drafts</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-content">
                  <h3>{courses.filter(c => c.is_featured).length}</h3>
                  <p>Featured</p>
                </div>
              </div>
            </div>

            {/* Recent Courses */}
            <div className="courses-section">
              <div className="section-header">
                <h3>Your Courses</h3>
                <button 
                  className="quick-action-button"
                  onClick={navigateToCreateCourse}
                >
                  + New Course
                </button>
              </div>
              
              {courses.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📚</div>
                  <h4>No courses yet</h4>
                  <p>Create your first course to start teaching</p>
                  <button 
                    className="primary-action"
                    onClick={navigateToCreateCourse}
                  >
                    Create Your First Course
                  </button>
                </div>
              ) : (
                <div className="courses-grid">
                  {courses.map(course => (
                    <div key={course.id} className="course-card">
                      {/* Buttons at the top */}
                      <div className="buttons-divs">
                        <div className="course-card-actions">
                          <button
                            className="edit-course-btn"
                            onClick={() => handleCourseSelect(course)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-course-btn"
                            onClick={() => handleDeleteClick(course)}
                            disabled={isLoading}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      
                      {/* Course content below buttons */}
                      <div className="course-card-header">
                        <h4 onClick={() => handleCourseSelect(course)} style={{cursor: 'pointer'}}>
                          {course.title}
                        </h4>
                        <span className={`status-badge ${course.status}`}>
                          {course.status}
                        </span>
                      </div>
                      <p className="course-description">
                        {course.short_description || 'No description available'}
                      </p>
                      <div className="course-meta">
                        <span className="level">{course.level}</span>
                        <span className="price">${course.price}</span>
                        {course.is_featured && <span className="featured">⭐ Featured</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CREATE COURSE TAB */}
        {activeTab === 'create-course' && (
          <div className="create-course-tab">
            <div className="tab-header">
              <h2>Create New Course</h2>
              <p>Fill in the course details to create a new learning experience</p>
            </div>
            <CourseCreator 
              onCourseCreated={handleCourseCreated}
              existingCourses={courses}
            />
          </div>
        )}

        {/* MANAGE CATEGORIES TAB */}
        {activeTab === 'manage-categories' && (
          <div className="manage-categories-tab">
            <div className="tab-header">
              <h2>Manage Categories</h2>
              <p>Organize your courses with categories for better navigation</p>
            </div>
            <CategoryManager />
          </div>
        )}

        {/* EDIT COURSE - STRUCTURE TAB */}
        {selectedCourse && activeTab === 'structure' && (
          <div className="edit-course-tab">
            <div className="course-editor-header">
              <h2>Course Structure</h2>
              <p>Build and organize your course content with sections and lessons</p>
            </div>
            <div className="editor-tabs">
              <button
                className={`tab-button ${activeTab === 'structure' ? 'active' : ''}`}
                onClick={() => setActiveTab('structure')}
              >
                📚 Course Structure
              </button>
              <button
                className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                ⚙️ Course Details
              </button>
            </div>
            <div className="editor-content">
              <CourseStructure
                course={selectedCourse}
                onUpdate={handleStructureUpdate}
                onSave={handleStructureSave}
              />
            </div>
          </div>
        )}

        {/* EDIT COURSE - DETAILS TAB */}
        {selectedCourse && activeTab === 'details' && (
          <div className="edit-course-tab">
            <div className="course-editor-header">
              <h2>Course Details</h2>
              <p>Update course information, pricing, and settings</p>
            </div>
            <div className="editor-tabs">
              <button
                className={`tab-button ${activeTab === 'structure' ? 'active' : ''}`}
                onClick={() => setActiveTab('structure')}
              >
                📚 Course Structure
              </button>
              <button
                className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                ⚙️ Course Details
              </button>
            </div>
            <div className="editor-content">
              <CourseDetailsEditForm
                course={selectedCourse}
                onUpdate={handleCourseUpdate}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
      {/* Footer added here */}
      <Footer/>
    </div>
  );
};

export default CourseEditor;