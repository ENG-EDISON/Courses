// components/LessonEditor.js
import React, { useState, useEffect } from 'react';
import { getLessons, updateLesson, createLesson, deleteLesson } from '../../api/LessonsApi';
import { getCourseFullStructure } from "../../api/CoursesApi";

const LessonEditor = ({ course, onUpdate, onBack }) => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingLesson, setEditingLesson] = useState(null);
  const [sections, setSections] = useState([]);
  const [subsections, setSubsections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');

  useEffect(() => {
    fetchLessons();
    fetchCourseStructure();
  }, [course]);

  const fetchLessons = async () => {
    try {
      const response = await getLessons({ course: course.id });
      setLessons(response.data);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseStructure = async () => {
    try {
      const response = await getCourseFullStructure(course.id);
      console.log('🔍 Full API response:', response.data);
      
      const sectionsData = response.data.sections || [];
      setSections(sectionsData);
      
      const allSubsections = sectionsData.flatMap(section => {
        const subsectionsArray = section.subsections || section.subsection || section.sub_sections || [];
        console.log(`Section "${section.title}" has subsections:`, subsectionsArray);
        
        return subsectionsArray.map(subsection => ({
          ...subsection,
          section_title: section.title,
          section: section.id
        }));
      });
      
      setSubsections(allSubsections);
    } catch (error) {
      console.error('Error fetching course structure:', error);
    }
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    if (lesson.subsection) {
      const subsection = subsections.find(sub => sub.id === lesson.subsection);
      if (subsection) {
        setSelectedSection(subsection.section);
      }
    }
  };

  const handleSaveLesson = async (lessonData) => {
    try {
      // Handle file upload if video file exists
      if (lessonData.video_file) {
        const formData = new FormData();
        
        // Append all lesson data
        Object.keys(lessonData).forEach(key => {
          if (key === 'video_file' && lessonData[key]) {
            formData.append('video_file', lessonData[key]);
          } else if (key !== 'video_file') {
            formData.append(key, lessonData[key]);
          }
        });
        
        if (editingLesson.id) {
          await updateLesson(editingLesson.id, formData);
        } else {
          formData.append('course', course.id);
          await createLesson(formData);
        }
      } else {
        // Regular JSON data
        if (editingLesson.id) {
          await updateLesson(editingLesson.id, lessonData);
        } else {
          await createLesson({
            ...lessonData,
            course: course.id
          });
        }
      }
      
      setEditingLesson(null);
      setSelectedSection('');
      fetchLessons();
      onUpdate();
    } catch (error) {
      console.error('Error saving lesson:', error);
    }
  };

  const handleAddLesson = () => {
    setEditingLesson({
      title: 'New Lesson',
      lesson_type: 'video',
      order: lessons.length + 1,
      is_preview: false,
      content: '',
      video_url: '',
      video_duration: 0,
      video_file: null
    });
    setSelectedSection('');
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;
    
    try {
      await deleteLesson(lessonId);
      fetchLessons();
      onUpdate();
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  const getSubsectionsForSection = (sectionId) => {
    return subsections.filter(sub => sub.section === sectionId);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="loading">Loading lessons...</div>;
  }

  return (
    <div className="lesson-editor">
      <div className="lesson-header">
        <div className="header-content">
          <button onClick={onBack} className="back-button">
            ← Back to Course
          </button>
          <h3>Lesson Management: {course.title}</h3>
          <p>Manage all lessons for this course</p>
        </div>
        <button onClick={handleAddLesson} className="btn-primary">
          + Add Lesson
        </button>
      </div>

      <div className="lessons-stats">
        <div className="stat-card">
          <span className="stat-number">{lessons.length}</span>
          <span className="stat-label">Total Lessons</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {lessons.filter(l => l.lesson_type === 'video').length}
          </span>
          <span className="stat-label">Video Lessons</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {lessons.filter(l => l.is_preview).length}
          </span>
          <span className="stat-label">Preview Lessons</span>
        </div>
      </div>

      <div className="lessons-list">
        {lessons.length === 0 ? (
          <div className="empty-state">
            <h4>No lessons yet</h4>
            <p>Create your first lesson to get started</p>
            <button onClick={handleAddLesson} className="btn-primary">
              Create First Lesson
            </button>
          </div>
        ) : (
          lessons.map((lesson) => (
            <div key={lesson.id} className="lesson-card">
              <div className="lesson-info">
                <div className="lesson-header-info">
                  <h4>{lesson.title}</h4>
                  <div className="lesson-badges">
                    <span className={`lesson-type-badge ${lesson.lesson_type}`}>
                      {lesson.lesson_type}
                    </span>
                    {lesson.is_preview && <span className="preview-badge">Preview</span>}
                    {lesson.video_file && <span className="upload-badge">Uploaded Video</span>}
                  </div>
                </div>
                
                <div className="lesson-meta">
                  <span className="lesson-order">Order: {lesson.order}</span>
                  {lesson.video_duration > 0 && (
                    <span className="lesson-duration">
                      Duration: {formatDuration(lesson.video_duration)}
                    </span>
                  )}
                  {lesson.subsection && (
                    <span className="lesson-subsection">
                      Subsection: {subsections.find(s => s.id === lesson.subsection)?.title || 'Unknown'}
                    </span>
                  )}
                </div>

                {lesson.content && (
                  <p className="lesson-content-preview">
                    {lesson.content.substring(0, 100)}...
                  </p>
                )}
              </div>
              
              <div className="lesson-actions">
                <button 
                  onClick={() => handleEditLesson(lesson)}
                  className="btn-secondary"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteLesson(lesson.id)}
                  className="btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {editingLesson && (
        <LessonEditModal
          lesson={editingLesson}
          sections={sections}
          subsections={subsections}
          selectedSection={selectedSection}
          onSectionChange={setSelectedSection}
          onSave={handleSaveLesson}
          onCancel={() => {
            setEditingLesson(null);
            setSelectedSection('');
          }}
        />
      )}
    </div>
  );
};

const LessonEditModal = ({ 
  lesson, 
  sections, 
  subsections, 
  selectedSection, 
  onSectionChange, 
  onSave, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    title: lesson.title || '',
    content: lesson.content || '',
    lesson_type: lesson.lesson_type || 'video',
    video_url: lesson.video_url || '',
    video_duration: lesson.video_duration || 0,
    order: lesson.order || 0,
    is_preview: lesson.is_preview || false,
    subsection: lesson.subsection || '',
    video_file: null
  });

  const [videoSource, setVideoSource] = useState(lesson.video_file ? 'upload' : (lesson.video_url ? 'url' : 'upload'));
  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length === 0) {
      // Clean up data based on video source
      const submitData = { ...formData };
      
      if (videoSource === 'upload') {
        // Remove video_url if uploading file
        submitData.video_url = '';
      } else if (videoSource === 'url') {
        // Remove video_file if using URL
        submitData.video_file = null;
      }
      
      onSave(submitData);
    } else {
      setErrors(validationErrors);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (formData.lesson_type === 'video') {
      if (videoSource === 'url' && !formData.video_url) {
        errors.video_url = 'Video URL is required';
      } else if (videoSource === 'upload' && !formData.video_file && !lesson.video_file) {
        errors.video_file = 'Please select a video file to upload';
      }
    }
    
    if (formData.order < 0) {
      errors.order = 'Order must be a positive number';
    }
    
    return errors;
  };

  const handleSubsectionChange = (subsectionId) => {
    setFormData(prev => ({
      ...prev,
      subsection: subsectionId
    }));
  };

  const getAvailableSubsections = () => {
    if (!selectedSection) return [];
    return subsections.filter(sub => sub.section === selectedSection);
  };

  const handleDurationChange = (minutes, seconds) => {
    const totalSeconds = (parseInt(minutes) || 0) * 60 + (parseInt(seconds) || 0);
    setFormData(prev => ({
      ...prev,
      video_duration: totalSeconds
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm'];
      if (!validVideoTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          video_file: 'Please select a valid video file (MP4, MOV, AVI, MKV, WebM)'
        }));
        return;
      }

      // Validate file size (max 500MB)
      if (file.size > 500 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          video_file: 'Video file size must be less than 500MB'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        video_file: file
      }));
      
      // Clear file error
      setErrors(prev => ({ ...prev, video_file: '' }));
      
      // Simulate progress for better UX
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 90) {
          clearInterval(interval);
        }
      }, 100);
    }
  };

  const currentMinutes = Math.floor(formData.video_duration / 60);
  const currentSeconds = formData.video_duration % 60;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{lesson.id ? 'Edit' : 'Add'} Lesson</h3>
          <button className="close-button" onClick={onCancel}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className={errors.title ? 'error' : ''}
                placeholder="Enter lesson title"
              />
              {errors.title && <span className="error-text">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label>Lesson Type</label>
              <select
                value={formData.lesson_type}
                onChange={(e) => setFormData({...formData, lesson_type: e.target.value})}
              >
                <option value="video">Video</option>
                <option value="article">Article</option>
                <option value="quiz">Quiz</option>
                <option value="assignment">Assignment</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Section</label>
              <select
                value={selectedSection}
                onChange={(e) => onSectionChange(e.target.value)}
              >
                <option value="">Select a section</option>
                {sections.map(section => (
                  <option key={section.id} value={section.id}>
                    {section.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Subsection</label>
              <select
                value={formData.subsection}
                onChange={(e) => handleSubsectionChange(e.target.value)}
                disabled={!selectedSection}
              >
                <option value="">Select a subsection</option>
                {getAvailableSubsections().map(subsection => (
                  <option key={subsection.id} value={subsection.id}>
                    {subsection.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Order</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                min="0"
                className={errors.order ? 'error' : ''}
              />
              {errors.order && <span className="error-text">{errors.order}</span>}
            </div>
          </div>

          {formData.lesson_type === 'video' && (
            <div className="video-fields">
              <div className="form-group">
                <label>Video Source</label>
                <div className="video-source-toggle">
                  <label className="toggle-option">
                    <input
                      type="radio"
                      value="upload"
                      checked={videoSource === 'upload'}
                      onChange={(e) => setVideoSource(e.target.value)}
                    />
                    <span className="toggle-label">Upload Video File</span>
                  </label>
                  <label className="toggle-option">
                    <input
                      type="radio"
                      value="url"
                      checked={videoSource === 'url'}
                      onChange={(e) => setVideoSource(e.target.value)}
                    />
                    <span className="toggle-label">Use Video URL</span>
                  </label>
                </div>
              </div>

              {videoSource === 'upload' && (
                <div className="file-upload-section">
                  <div className="form-group">
                    <label>Video File *</label>
                    <div className="file-upload-area">
                      <input
                        type="file"
                        accept="video/mp4,video/mov,video/avi,video/mkv,video/webm"
                        onChange={handleFileChange}
                        className="file-input"
                      />
                      <div className="upload-placeholder">
                        {formData.video_file ? (
                          <div className="file-selected">
                            <span className="file-name">{formData.video_file.name}</span>
                            <span className="file-size">
                              ({(formData.video_file.size / (1024 * 1024)).toFixed(2)} MB)
                            </span>
                            {uploadProgress > 0 && uploadProgress < 100 && (
                              <div className="upload-progress">
                                <div 
                                  className="progress-bar" 
                                  style={{ width: `${uploadProgress}%` }}
                                ></div>
                                <span>{uploadProgress}%</span>
                              </div>
                            )}
                          </div>
                        ) : lesson.video_file ? (
                          <div className="file-selected">
                            <span className="file-name">✓ Video already uploaded</span>
                          </div>
                        ) : (
                          <div className="upload-prompt">
                            <span>Click to select video file</span>
                            <small>Supported: MP4, MOV, AVI, MKV, WebM (Max: 500MB)</small>
                          </div>
                        )}
                      </div>
                    </div>
                    {errors.video_file && <span className="error-text">{errors.video_file}</span>}
                  </div>
                </div>
              )}

              {videoSource === 'url' && (
                <div className="form-group">
                  <label>Video URL *</label>
                  <input
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                    placeholder="https://youtube.com/embed/... or direct video URL"
                    className={errors.video_url ? 'error' : ''}
                  />
                  {errors.video_url && <span className="error-text">{errors.video_url}</span>}
                  <small className="help-text">
                    Supports YouTube embed URLs, Vimeo, or direct video links
                  </small>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <input
                    type="number"
                    value={currentMinutes}
                    onChange={(e) => handleDurationChange(e.target.value, currentSeconds)}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Duration (seconds)</label>
                  <input
                    type="number"
                    value={currentSeconds}
                    onChange={(e) => handleDurationChange(currentMinutes, e.target.value)}
                    min="0"
                    max="59"
                  />
                </div>
                <div className="form-group">
                  <label>Total Seconds</label>
                  <input
                    type="number"
                    value={formData.video_duration}
                    readOnly
                    className="readonly-input"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              rows={6}
              placeholder={
                formData.lesson_type === 'article' 
                  ? "Write your article content here..." 
                  : "Lesson description or additional content..."
              }
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.is_preview}
                onChange={(e) => setFormData({...formData, is_preview: e.target.checked})}
              />
              <span className="checkbox-custom"></span>
              Available as preview (students can access without enrollment)
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {lesson.id ? 'Update' : 'Create'} Lesson
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LessonEditor;
