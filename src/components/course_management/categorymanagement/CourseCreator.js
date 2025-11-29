import React, { useState, useEffect } from 'react';
import { getMyProfile } from '../../../api/ProfileApis';
import './CourseCreator.css';
import { getAllCoursesCategories } from '../../../api/CourseCategoryApi';
import { createCourse } from '../../../api/CoursesApi';

const CourseCreator = ({ onCourseCreated, existingCourses = [] }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    short_description: '',
    category: '',
    price: '0.00',
    discount_price: '', // Changed to empty string to allow null
    level: 'beginner',
    duration_seconds: 0, // Changed from duration_hours to duration_seconds
    promotional_video: '',
    requirements: '',
    language: 'English',
    certificate_available: true,
    status: 'draft',
    is_featured: false
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await getAllCoursesCategories();
      setCategories(response.data.filter(cat => cat.is_active));
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let processedValue = value;
    
    if (type === 'checkbox') {
      processedValue = checked;
    } else if (type === 'number') {
      // Handle different number fields
      if (name === 'duration_seconds') {
        processedValue = parseInt(value) || 0;
      } else {
        processedValue = parseFloat(value) || 0;
      }
    }
    
    // Special handling for discount_price - allow empty string for null
    if (name === 'discount_price' && value === '') {
      processedValue = '';
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title: title,
      slug: prev.slug || generateSlug(title)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Course title is required');
      return;
    }

    if (!formData.slug.trim()) {
      alert('Course slug is required');
      return;
    }

    // Validate short_description is not blank and within length limit
    if (!formData.short_description.trim()) {
      alert('Short description is required');
      return;
    }

    if (formData.short_description.length > 300) {
      alert('Short description must be 300 characters or less');
      return;
    }

    // Check for duplicate course titles
    const duplicateCourse = existingCourses.find(
      course => course.title.toLowerCase() === formData.title.toLowerCase()
    );
    
    if (duplicateCourse) {
      alert('A course with this title already exists. Please choose a different title.');
      return;
    }

    // Check for duplicate slugs
    const duplicateSlug = existingCourses.find(
      course => course.slug === formData.slug
    );
    
    if (duplicateSlug) {
      alert('A course with this slug already exists. Please choose a different slug.');
      return;
    }

    // Validate discount price logic
    const price = parseFloat(formData.price);
    const discountPrice = formData.discount_price ? parseFloat(formData.discount_price) : null;

    // If discount price is provided, it must be less than regular price
    if (discountPrice !== null && discountPrice >= price) {
      alert('Discount price must be less than regular price or left empty for no discount');
      return;
    }

    try {
      setIsLoading(true);
      
      // Get instructor profile
      const profileResponse = await getMyProfile();
      const instructorId = profileResponse.data.id;

      // Prepare course data with proper formatting for Django model
      const courseData = {
        ...formData,
        instructor: instructorId,
        price: formData.price.toString(),
        // Send null if discount_price is empty, otherwise send the value
        discount_price: formData.discount_price === '' ? null : formData.discount_price.toString(),
        duration_seconds: parseInt(formData.duration_seconds) || 0,
        category: formData.category || null,
        short_description: formData.short_description.trim()
      };

      console.log('Creating course with data:', courseData);

      const response = await createCourse(courseData);
      alert('Course created successfully!');
      
      // Reset form
      setFormData({
        title: '',
        slug: '',
        description: '',
        short_description: '',
        category: '',
        price: '0.00',
        discount_price: '', // Reset to empty string
        level: 'beginner',
        duration_seconds: 0,
        promotional_video: '',
        requirements: '',
        language: 'English',
        certificate_available: true,
        status: 'draft',
        is_featured: false
      });

      // Notify parent component
      if (onCourseCreated) {
        onCourseCreated(response.data);
      }

    } catch (error) {
      console.error('Error creating course:', error);
      const errorMessage = error.response?.data ? 
        JSON.stringify(error.response.data) : 
        error.message;
      alert('Error creating course: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert hours to seconds for user convenience
  const handleDurationHoursChange = (hours) => {
    const seconds = Math.round(hours * 3600);
    setFormData(prev => ({
      ...prev,
      duration_seconds: seconds
    }));
  };

  const durationInHours = formData.duration_seconds / 3600;

  return (
    <div className="course-creator">
      <h2>Create New Course</h2>
      
      <form onSubmit={handleSubmit} className="course-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="title">Course Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleTitleChange}
              required
              placeholder="Enter course title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="slug">Slug *</label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              required
              placeholder="URL-friendly slug"
            />
            <small className="field-hint">Auto-generated from title, but you can customize it</small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="short_description">Short Description *</label>
            <input
              type="text"
              id="short_description"
              name="short_description"
              value={formData.short_description}
              onChange={handleInputChange}
              required
              placeholder="Brief description (displayed in course cards)"
              maxLength="300"
            />
            <small className="field-hint">{formData.short_description.length}/300 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Full Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="5"
            placeholder="Detailed description of the course content, objectives, and what students will learn"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="requirements">Requirements</label>
            <textarea
              id="requirements"
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              rows="3"
              placeholder="What students should know before taking this course"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Price ($) *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              placeholder="0.00"
              required
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
              placeholder="Leave empty for no discount"
            />
            <small className="field-hint">Must be less than regular price. Leave empty for no discount.</small>
          </div>

          <div className="form-group">
            <label htmlFor="duration_seconds">Duration (hours)</label>
            <input
              type="number"
              id="duration_seconds"
              name="duration_seconds"
              value={durationInHours}
              onChange={(e) => handleDurationHoursChange(parseFloat(e.target.value) || 0)}
              min="0"
              step="0.5"
              placeholder="0"
            />
            <small className="field-hint">Total course duration in hours (will be converted to seconds)</small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="level">Level</label>
            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleInputChange}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

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
              <option value="Arabic">Arabic</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
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

        <div className="form-group">
          <label htmlFor="promotional_video">Promotional Video URL</label>
          <input
            type="url"
            id="promotional_video"
            name="promotional_video"
            value={formData.promotional_video}
            onChange={handleInputChange}
            placeholder="https://www.youtube.com/watch?v=..."
          />
          <small className="field-hint">YouTube or Vimeo URL for course promotion</small>
        </div>

        <div className="form-row">
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="certificate_available"
                checked={formData.certificate_available}
                onChange={handleInputChange}
              />
              Certificate Available
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleInputChange}
              />
              Featured Course
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating Course...' : 'Create Course'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseCreator;