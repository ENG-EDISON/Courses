import React, { useState, useEffect } from 'react';
import './CourseDetailsEditForm.css';
import { updateCourse } from '../../../api/CourseApi';

const CourseDetailsEditForm = ({ course, onUpdate, isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    short_description: '',
    price: '',
    discount_price: '',
    level: 'beginner',
    duration_hours: 0,
    language: 'English',
    requirements: '',
    promotional_video: '',
    certificate_available: false,
    is_featured: false,
    status: 'draft',
    thumbnail: null,
    category: '',
    learning_objectives: []
  });
  
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newObjective, setNewObjective] = useState('');

  // Initialize form when course changes
  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        short_description: course.short_description || '',
        price: course.price || '',
        discount_price: course.discount_price || '',
        level: course.level || 'beginner',
        duration_hours: course.duration_hours || 0,
        language: course.language || 'English',
        requirements: course.requirements || '',
        promotional_video: course.promotional_video || '',
        certificate_available: course.certificate_available || false,
        is_featured: course.is_featured || false,
        status: course.status || 'draft',
        thumbnail: null,
        category: course.category || '',
        learning_objectives: course.learning_objectives || []
      });
      
      if (course.thumbnail) {
        setThumbnailPreview(course.thumbnail);
      }
    }
  }, [course]);

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'file') {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));
      
      // Create preview for thumbnail
      if (name === 'thumbnail' && file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setThumbnailPreview(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleTextareaChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      setFormData(prev => ({
        ...prev,
        learning_objectives: [...prev.learning_objectives, newObjective.trim()]
      }));
      setNewObjective('');
    }
  };

  const handleRemoveObjective = (index) => {
    setFormData(prev => ({
      ...prev,
      learning_objectives: prev.learning_objectives.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!course) return;

    setIsSubmitting(true);
    try {
      // Prepare data for API
      const submitData = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'learning_objectives') {
          // Convert array to JSON string
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (key === 'thumbnail' && formData[key]) {
          // Append file
          submitData.append(key, formData[key]);
        } else if (key === 'price' || key === 'discount_price') {
          // Ensure price fields are properly formatted
          submitData.append(key, formData[key] ? parseFloat(formData[key]) : 0);
        } else if (key === 'duration_hours') {
          // Ensure duration is integer
          submitData.append(key, parseInt(formData[key]) || 0);
        } else {
          submitData.append(key, formData[key]);
        }
      });
      // Call update API
      if (onUpdate) {
        await onUpdate(submitData);
      }
      
    } catch (error) {
      console.error('Error in form submission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (course) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        short_description: course.short_description || '',
        price: course.price || '',
        discount_price: course.discount_price || '',
        level: course.level || 'beginner',
        duration_hours: course.duration_hours || 0,
        language: course.language || 'English',
        requirements: course.requirements || '',
        promotional_video: course.promotional_video || '',
        certificate_available: course.certificate_available || false,
        is_featured: course.is_featured || false,
        status: course.status || 'draft',
        thumbnail: null,
        category: course.category || '',
        learning_objectives: course.learning_objectives || []
      });
      setThumbnailPreview(course.thumbnail || '');
      setNewObjective('');
    }
  };

  if (!course) {
    return (
      <div className="course-details-edit-form">
        <div className="no-course-selected">
          <p>Please select a course to edit its details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="course-details-edit-form">
      <div className="form-header">
        <h2>Edit Course Details</h2>
        <p>Update the basic information and settings for "{course.title}"</p>
      </div>

      <form onSubmit={handleSubmit} className="course-details-form">
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="title">Course Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Enter course title"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="short_description">Short Description *</label>
              <textarea
                id="short_description"
                name="short_description"
                value={formData.short_description}
                onChange={(e) => handleTextareaChange('short_description', e.target.value)}
                rows="3"
                required
                placeholder="Brief description that appears in course listings"
                maxLength="200"
              />
              <div className="character-count">
                {formData.short_description.length}/200 characters
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="description">Full Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={(e) => handleTextareaChange('description', e.target.value)}
                rows="6"
                required
                placeholder="Detailed course description that explains what students will learn"
              />
            </div>
          </div>
        </div>

        {/* Thumbnail & Media */}
        <div className="form-section">
          <h3>Media</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="thumbnail">Course Thumbnail</label>
              <div className="thumbnail-upload">
                {thumbnailPreview && (
                  <div className="thumbnail-preview">
                    <img src={thumbnailPreview} alt="Thumbnail preview" />
                  </div>
                )}
                <input
                  type="file"
                  id="thumbnail"
                  name="thumbnail"
                  onChange={handleInputChange}
                  accept="image/*"
                />
                <small>Recommended: 1280x720 pixels, JPG or PNG</small>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="promotional_video">Promotional Video URL</label>
              <input
                type="url"
                id="promotional_video"
                name="promotional_video"
                value={formData.promotional_video}
                onChange={handleInputChange}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          </div>
        </div>

        {/* Pricing & Duration */}
        <div className="form-section">
          <h3>Pricing & Duration</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Regular Price ($)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="discount_price">Discount Price ($)</label>
              <input
                type="number"
                id="discount_price"
                name="discount_price"
                value={formData.discount_price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="duration_hours">Duration (Hours)</label>
              <input
                type="number"
                id="duration_hours"
                name="duration_hours"
                value={formData.duration_hours}
                onChange={handleInputChange}
                min="0"
                step="1"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Course Metadata */}
        <div className="form-section">
          <h3>Course Metadata</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="language">Language</label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Chinese">Chinese</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="level">Difficulty Level</label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleInputChange}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="all">All Levels</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="category">Category ID</label>
              <input
                type="number"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="1"
                min="1"
              />
              <small>Category ID from your system</small>
            </div>
          </div>
        </div>

        {/* Requirements & Learning Objectives */}
        <div className="form-section">
          <h3>Requirements & Objectives</h3>
          
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="requirements">Requirements</label>
              <textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={(e) => handleTextareaChange('requirements', e.target.value)}
                rows="4"
                placeholder="What should students know before taking this course?"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="learning_objectives">Learning Objectives</label>
              <div className="objectives-container">
                <div className="objectives-input">
                  <input
                    type="text"
                    value={newObjective}
                    onChange={(e) => setNewObjective(e.target.value)}
                    placeholder="Add a learning objective..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddObjective();
                      }
                    }}
                  />
                  <button 
                    type="button" 
                    onClick={handleAddObjective}
                    className="btn-add"
                  >
                    Add
                  </button>
                </div>
                
                <div className="objectives-list">
                  {formData.learning_objectives.map((objective, index) => (
                    <div key={index} className="objective-item">
                      <span>{objective}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveObjective(index)}
                        className="btn-remove"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  
                  {formData.learning_objectives.length === 0 && (
                    <div className="no-objectives">
                      No learning objectives added yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="form-section">
          <h3>Settings</h3>
          
          <div className="form-row">
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="certificate_available"
                  checked={formData.certificate_available}
                  onChange={handleInputChange}
                />
                <span className="checkmark"></span>
                Certificate Available
              </label>
              <small>Offer certificate upon course completion</small>
            </div>
            
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleInputChange}
                />
                <span className="checkmark"></span>
                Featured Course
              </label>
              <small>Show this course in featured sections</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Course Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={handleReset}
            className="btn-secondary"
            disabled={isSubmitting}
          >
            Reset Changes
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? 'Updating...' : 'Update Course Details'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseDetailsEditForm;