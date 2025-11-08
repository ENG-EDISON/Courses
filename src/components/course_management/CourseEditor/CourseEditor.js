import React, { useState, useEffect } from 'react';
import './CourseEditor.css';
import CourseStructure from '../CourseStructure/CourseStructure';
// import CourseDetailsEditForm from '../CourseDetailsEditForm/CourseDetailsEditForm';
// import { getAllCourses, updateCourse } from '../../../api/CourseApi';
import { getAllCourses,updateCourse } from '../../../api/CoursesApi';
import CourseDetailsEditForm from '../../CourseDetailsEditForm/CourseDetailsEditForm';
const CourseEditor = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('structure');
  const [isLoading, setIsLoading] = useState(false);

  // Load courses from API
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      const response = await getAllCourses();
      setCourses(response.data);
    } catch (error) {
      console.error('Error loading courses:', error);
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
    if (!selectedCourse) return;
    
    setIsLoading(true);
    try {
      const response = await updateCourse(selectedCourse.id, updatedCourseData);
      setSelectedCourse(response.data);
      
      // Update the courses list
      setCourses(prev => prev.map(course => 
        course.id === selectedCourse.id ? response.data : course
      ));
      
      alert('Course updated successfully!');
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Error updating course: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStructureUpdate = (sections) => {
    console.log('Course structure updated:', sections);
  };

  const handleStructureSave = (saveResult) => {
    console.log('Course structure saved:', saveResult);
  };

  return (
    <div className="course-editor">
      <div className="editor-header">
        <h1>Course Editor</h1>
        <div className="course-selector">
          <select 
            value={selectedCourse?.id || ''} 
            onChange={(e) => {
              const courseId = e.target.value;
              const course = courses.find(c => c.id === parseInt(courseId));
              handleCourseSelect(course);
            }}
            className="course-dropdown"
            disabled={isLoading}
          >
            <option value="">Select a course to edit...</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.title} {course.status === 'draft' ? '(Draft)' : ''}
              </option>
            ))}
          </select>
          {isLoading && <span className="loading-text">Loading courses...</span>}
        </div>
      </div>

      {selectedCourse && (
        <div className="editor-container">
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
            {activeTab === 'structure' && (
              <div className="structure-tab">
                <CourseStructure
                  course={selectedCourse}
                  onUpdate={handleStructureUpdate}
                  onSave={handleStructureSave}
                />
              </div>
            )}

            {activeTab === 'details' && (
              <div className="details-tab">
                <CourseDetailsEditForm
                  course={selectedCourse}
                  onUpdate={handleCourseUpdate}
                  isLoading={isLoading}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {!selectedCourse && (
        <div className="no-course-selected">
          <div className="placeholder-message">
            <h2>Welcome to Course Editor</h2>
            <p>Please select a course from the dropdown above to start editing.</p>
            <div className="course-stats">
              <div className="stat">
                <h3>{courses.length}</h3>
                <p>Total Courses</p>
              </div>
              <div className="stat">
                <h3>{courses.filter(c => c.status === 'published').length}</h3>
                <p>Published</p>
              </div>
              <div className="stat">
                <h3>{courses.filter(c => c.status === 'draft').length}</h3>
                <p>Drafts</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseEditor;