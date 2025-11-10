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
    discount_price: '0.00',
    level: 'beginner',
    duration_hours: 0,
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
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? (name === 'duration_hours' ? parseInt(value) || 0 : parseFloat(value) || 0) : 
              value
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

    try {
      setIsLoading(true);
      
      // Get instructor profile
      const profileResponse = await getMyProfile();
      const instructorId = profileResponse.data.id;

      // Prepare course data with proper formatting
      const courseData = {
        ...formData,
        instructor: instructorId,
        price: formData.price.toString(),
        discount_price: formData.discount_price.toString(),
        duration_hours: parseInt(formData.duration_hours) || 0,
        category: formData.category || null
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
        discount_price: '0.00',
        level: 'beginner',
        duration_hours: 0,
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
            <label htmlFor="short_description">Short Description</label>
            <input
              type="text"
              id="short_description"
              name="short_description"
              value={formData.short_description}
              onChange={handleInputChange}
              placeholder="Brief description (displayed in course cards)"
              maxLength="150"
            />
            <small className="field-hint">{formData.short_description.length}/150 characters</small>
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
            <label htmlFor="price">Price ($)</label>
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
            <label htmlFor="duration_hours">Duration (hours)</label>
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