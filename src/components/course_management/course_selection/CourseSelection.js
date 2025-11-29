// src/components/course-management/CourseSelection/CourseSelection.js
import React, { useState, useMemo } from 'react';
import './CourseSelection.css';

const CourseSelection = ({ category, courses, onSelect, onCreateCourse, onBack, loading, error }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    slug: '',
    short_description: '',
    description: '',
    price: '0.00',
    discount_price: '',
    level: 'beginner',
    language: 'English',
    certificate_available: true,
    status: 'draft',
    duration_hours: 0,
    requirements: '',
    promotional_video: '',
    is_featured: false,
    category: category?.id || '',
    what_you_learn: '', // ADDED: Required field
    instructor: 1, // ADDED: Instructor ID (you might want to get this dynamically)
    thumbnail: null, // ADDED: Required field
  });
  const [formErrors, setFormErrors] = useState({});
  const [creatingCourse, setCreatingCourse] = useState(false);

  const filteredCourses = useMemo(() => {
    let filtered = courses.filter(course => {
      const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.instructor?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Sorting logic
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title?.localeCompare(b.title);
        case 'price':
          return parseFloat(a.price || 0) - parseFloat(b.price || 0);
        case 'price-desc':
          return parseFloat(b.price || 0) - parseFloat(a.price || 0);
        case 'students':
          return (b.enrollment_count || 0) - (a.enrollment_count || 0);
        case 'rating':
          return (b.average_rating || 0) - (a.average_rating || 0);
        case 'recent':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [courses, searchTerm, statusFilter, sortBy]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {};
    if (!newCourse.title.trim()) errors.title = 'Course title is required';
    if (!newCourse.slug.trim()) errors.slug = 'Slug is required';
    if (!newCourse.short_description.trim()) errors.short_description = 'Short description is required';
    if (!newCourse.description.trim()) errors.description = 'Full description is required';
    if (!newCourse.what_you_learn.trim()) errors.what_you_learn = 'Learning objectives are required'; // ADDED validation
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setCreatingCourse(true);
    try {
      // Prepare complete course data matching backend expectations
      const courseData = {
        title: newCourse.title,
        slug: newCourse.slug,
        description: newCourse.description,
        short_description: newCourse.short_description,
        instructor: newCourse.instructor, // Ensure instructor ID is included
        category: category.id, // Category ID
        price: newCourse.price,
        discount_price: newCourse.discount_price || null,
        level: newCourse.level,
        duration_hours: parseInt(newCourse.duration_hours) || 0,
        promotional_video: newCourse.promotional_video || '',
        requirements: newCourse.requirements || '',
        what_you_learn: newCourse.what_you_learn, // ADDED: Learning objectives
        language: newCourse.language,
        certificate_available: newCourse.certificate_available,
        status: newCourse.status,
        is_featured: newCourse.is_featured,
        thumbnail: null, // Explicitly set thumbnail as null
      };      
      // Call the parent component's onCreateCourse function
      await onCreateCourse(courseData);
      setShowCreateForm(false);
      resetForm();
    } catch (error) {
      console.error('Error creating course:', error);
    } finally {
      setCreatingCourse(false);
    }
  };

  const handleSlugGenerate = (title) => {
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    setNewCourse(prev => ({ ...prev, slug }));
    if (formErrors.slug) {
      setFormErrors(prev => ({ ...prev, slug: '' }));
    }
  };

  const resetForm = () => {
    setNewCourse({
      title: '',
      slug: '',
      short_description: '',
      description: '',
      price: '0.00',
      discount_price: '',
      level: 'beginner',
      language: 'English',
      certificate_available: true,
      status: 'draft',
      duration_hours: 0,
      requirements: '',
      promotional_video: '',
      is_featured: false,
      category: category?.id || '',
      what_you_learn: '', // ADDED
      instructor: 1, // ADDED
      thumbnail: null, // ADDED
    });
    setFormErrors({});
    setShowCreateForm(false);
  };

  const getStatusBadgeVariant = (status) => {
    const variants = {
      published: 'success',
      draft: 'warning',
      archived: 'error'
    };
    return variants[status] || 'default';
  };

  const formatPrice = (price) => {
    const priceNumber = parseFloat(price) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: priceNumber % 1 === 0 ? 0 : 2
    }).format(priceNumber);
  };

  const getLevelDisplay = (level) => {
    const levels = {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced'
    };
    return levels[level] || level;
  };

  if (loading) {
    return (
      <div className="course-selection__loading">
        <div className="course-selection__spinner"></div>
        <p className="course-selection__loading-text">
          Loading courses from {category?.name}...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-selection__error">
        <div className="course-selection__error-icon">⚠️</div>
        <h3 className="course-selection__error-title">Unable to Load Courses</h3>
        <p className="course-selection__error-message">{error}</p>
        <button onClick={onBack} className="course-selection__error-action">
          Return to Categories
        </button>
      </div>
    );
  }

  return (
    <div className="course-selection">
      {/* Header Section */}
      <header className="course-selection__header">
        <div className="course-selection__breadcrumb">
          <button 
            onClick={onBack}
            className="course-selection__back-btn"
            aria-label="Return to category selection"
          >
            <span className="course-selection__back-icon">←</span>
            Back to Categories
          </button>
        </div>
        
        <div className="course-selection__title-section">
          <h1 className="course-selection__title">
            Courses in <span className="course-selection__category-name">{category?.name}</span>
          </h1>
          <p className="course-selection__subtitle">
            {category?.description || 'Select a course to manage its content and settings'}
          </p>
          {!category && (
            <div className="category-warning">
              ⚠️ No category selected. Please go back and select a category.
            </div>
          )}
        </div>

        <div className="course-selection__stats">
          <div className="course-selection__stat">
            <span className="course-selection__stat-number">{courses.length}</span>
            <span className="course-selection__stat-label">Total Courses</span>
          </div>
          <div className="course-selection__stat">
            <span className="course-selection__stat-number">
              {courses.filter(c => c.status === 'published').length}
            </span>
            <span className="course-selection__stat-label">Published</span>
          </div>
          <div className="course-selection__stat">
            <span className="course-selection__stat-number">
              {courses.filter(c => c.is_featured).length}
            </span>
            <span className="course-selection__stat-label">Featured</span>
          </div>
          <button 
            onClick={() => setShowCreateForm(true)}
            className="course-selection__create-btn"
            disabled={showCreateForm || !category}
          >
            + Create New Course
          </button>
        </div>
      </header>

      {/* Create Course Form */}
      {showCreateForm && (
        <div className="create-course-form">
          <div className="form-header">
            <h3>Create New Course in {category?.name}</h3>
            <button 
              onClick={resetForm}
              className="close-btn"
              disabled={creatingCourse}
            >
              ×
            </button>
          </div>
          
          <form onSubmit={handleCreateCourse}>
            {/* Category Display (Read-only) */}
            <div className="form-group">
              <label>Category *</label>
              <div className="category-display">
                <span className="category-display__name">{category?.name}</span>
                <span className="category-display__description">
                  {category?.description}
                </span>
              </div>
              <div className="help-text">
                Course will be created in this category
              </div>
              {!category && (
                <div className="error-text">
                  Category is required. Please go back and select a category.
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Course Title *</label>
                <input
                  type="text"
                  value={newCourse.title}
                  onChange={(e) => {
                    setNewCourse(prev => ({ ...prev, title: e.target.value }));
                    handleSlugGenerate(e.target.value);
                  }}
                  className={formErrors.title ? 'error' : ''}
                  placeholder="Enter course title"
                  disabled={creatingCourse}
                  required
                />
                {formErrors.title && <span className="error-text">{formErrors.title}</span>}
              </div>

              <div className="form-group">
                <label>Slug *</label>
                <input
                  type="text"
                  value={newCourse.slug}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, slug: e.target.value }))}
                  className={formErrors.slug ? 'error' : ''}
                  placeholder="course-slug"
                  disabled={creatingCourse}
                  required
                />
                {formErrors.slug && <span className="error-text">{formErrors.slug}</span>}
                <div className="help-text">URL-friendly version of the title</div>
              </div>
            </div>

            <div className="form-group">
              <label>Short Description *</label>
              <textarea
                value={newCourse.short_description}
                onChange={(e) => setNewCourse(prev => ({ ...prev, short_description: e.target.value }))}
                className={formErrors.short_description ? 'error' : ''}
                placeholder="Brief description (max 300 characters)"
                rows={3}
                maxLength={300}
                disabled={creatingCourse}
                required
              />
              {formErrors.short_description && <span className="error-text">{formErrors.short_description}</span>}
              <div className="char-count">
                {newCourse.short_description.length}/300 characters
              </div>
            </div>

            <div className="form-group">
              <label>Full Description *</label>
              <textarea
                value={newCourse.description}
                onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                className={formErrors.description ? 'error' : ''}
                placeholder="Detailed course description (supports markdown)"
                rows={6}
                disabled={creatingCourse}
                required
              />
              {formErrors.description && <span className="error-text">{formErrors.description}</span>}
              <div className="help-text">
                Provide a comprehensive description of your course. Markdown is supported.
              </div>
            </div>

            {/* ADDED: What You'll Learn Field */}
            <div className="form-group">
              <label>What You'll Learn *</label>
              <textarea
                value={newCourse.what_you_learn}
                onChange={(e) => setNewCourse(prev => ({ ...prev, what_you_learn: e.target.value }))}
                className={formErrors.what_you_learn ? 'error' : ''}
                placeholder="List what students will learn in this course (one per line)"
                rows={4}
                disabled={creatingCourse}
                required
              />
              {formErrors.what_you_learn && <span className="error-text">{formErrors.what_you_learn}</span>}
              <div className="help-text">
                List the key learning objectives and skills students will gain
              </div>
            </div>

            {/* Duration Hours Field */}
            <div className="form-group">
              <label>Duration (hours) *</label>
              <input
                type="number"
                value={newCourse.duration_hours}
                onChange={(e) => setNewCourse(prev => ({ ...prev, duration_hours: parseInt(e.target.value) || 0 }))}
                placeholder="0"
                min="0"
                step="1"
                disabled={creatingCourse}
                required
              />
              <div className="help-text">Total course duration in hours</div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price ($)</label>
                <input
                  type="number"
                  value={newCourse.price}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={creatingCourse}
                />
                <div className="help-text">Set to 0 for free course</div>
              </div>

              <div className="form-group">
                <label>Discount Price ($)</label>
                <input
                  type="number"
                  value={newCourse.discount_price}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, discount_price: e.target.value }))}
                  placeholder="Optional"
                  min="0"
                  step="0.01"
                  disabled={creatingCourse}
                />
                <div className="help-text">Optional promotional price</div>
              </div>
            </div>

            {/* Requirements Field */}
            <div className="form-group">
              <label>Requirements</label>
              <textarea
                value={newCourse.requirements}
                onChange={(e) => setNewCourse(prev => ({ ...prev, requirements: e.target.value }))}
                placeholder="Course prerequisites and requirements (one per line)"
                rows={3}
                disabled={creatingCourse}
              />
              <div className="help-text">
                List the prerequisites and requirements for this course
              </div>
            </div>

            {/* Promotional Video Field */}
            <div className="form-group">
              <label>Promotional Video URL</label>
              <input
                type="url"
                value={newCourse.promotional_video}
                onChange={(e) => setNewCourse(prev => ({ ...prev, promotional_video: e.target.value }))}
                placeholder="https://www.youtube.com/watch?v=..."
                disabled={creatingCourse}
              />
              <div className="help-text">
                Link to a promotional video for your course
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Level</label>
                <select
                  value={newCourse.level}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, level: e.target.value }))}
                  disabled={creatingCourse}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="form-group">
                <label>Language</label>
                <select
                  value={newCourse.language}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, language: e.target.value }))}
                  disabled={creatingCourse}
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Japanese">Japanese</option>
                </select>
              </div>

              <div className="form-group">
                <label>Initial Status</label>
                <select
                  value={newCourse.status}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, status: e.target.value }))}
                  disabled={creatingCourse}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newCourse.certificate_available}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, certificate_available: e.target.checked }))}
                  disabled={creatingCourse}
                />
                <span className="checkbox-custom"></span>
                Include certificate of completion
              </label>
            </div>

            {/* Featured Course Checkbox */}
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newCourse.is_featured}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, is_featured: e.target.checked }))}
                  disabled={creatingCourse}
                />
                <span className="checkbox-custom"></span>
                Feature this course
              </label>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={resetForm}
                className="btn btn-secondary"
                disabled={creatingCourse}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={creatingCourse || !category}
              >
                {creatingCourse ? (
                  <>
                    <span className="spinner-small"></span>
                    Creating...
                  </>
                ) : (
                  'Create Course'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Controls Section */}
      <section className="course-selection__controls">
        <div className="course-selection__search">
          <div className="course-selection__search-container">
            <svg className="course-selection__search-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              placeholder="Search courses by title, instructor, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="course-selection__search-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="course-selection__search-clear"
                aria-label="Clear search"
              >
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="course-selection__filters">
          <div className="course-selection__filter-group">
            <label htmlFor="status-filter" className="course-selection__filter-label">
              Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="course-selection__filter-select"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="course-selection__filter-group">
            <label htmlFor="sort-by" className="course-selection__filter-label">
              Sort By
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="course-selection__filter-select"
            >
              <option value="title">Title A-Z</option>
              <option value="recent">Recently Added</option>
              <option value="price">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="students">Most Students</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="course-selection__results">
        <div className="course-selection__results-header">
          <div className="results-info">
            <h2 className="course-selection__results-title">
              {filteredCourses.length} {filteredCourses.length === 1 ? 'Course' : 'Courses'} Found
            </h2>
            {searchTerm && (
              <p className="course-selection__results-subtitle">
                Showing results for "{searchTerm}"
              </p>
            )}
          </div>
          {filteredCourses.length === 0 && !showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="course-selection__create-action"
              disabled={!category}
            >
              + Create First Course
            </button>
          )}
        </div>

        {filteredCourses.length > 0 ? (
          <div className="course-selection__grid">
            {filteredCourses.map((course) => (
              <article
                key={course.id}
                className="course-card"
                onClick={() => onSelect(course)}
              >
                <div className="course-card__media">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="course-card__image"
                      loading="lazy"
                    />
                  ) : (
                    <div className="course-card__placeholder">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                  )}
                  <div className="course-card__badges">
                    <span className={`course-card__status course-card__status--${getStatusBadgeVariant(course.status)}`}>
                      {course.status}
                    </span>
                    {course.is_featured && (
                      <span className="course-card__featured">Featured</span>
                    )}
                    {course.certificate_available && (
                      <span className="course-card__certificate">Certificate</span>
                    )}
                  </div>
                </div>

                <div className="course-card__content">
                  <h3 className="course-card__title">{course.title}</h3>
                  
                  <div className="course-card__level">
                    <span className={`course-card__level-badge course-card__level-badge--${course.level}`}>
                      {getLevelDisplay(course.level)}
                    </span>
                  </div>
                  
                  <p className="course-card__description">
                    {course.short_description || course.description}
                  </p>

                  <div className="course-card__instructor">
                    <span className="course-card__instructor-avatar">
                      {course.instructor?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                    <span className="course-card__instructor-name">
                      {course.instructor?.username || 'Unknown Instructor'}
                    </span>
                  </div>

                  <div className="course-card__meta">
                    <div className="course-card__meta-item">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                      </svg>
                      <span>{course.enrollment_count || 0} students</span>
                    </div>
                    
                    <div className="course-card__meta-item">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                      </svg>
                      <span>{Math.floor((course.duration_hours || 0) / 60)}h {(course.duration_hours || 0) % 60}m</span>
                    </div>

                    <div className="course-card__meta-item">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      <span>{course.average_rating ? `${course.average_rating}/5` : 'No ratings'}</span>
                    </div>
                  </div>

                  <div className="course-card__footer">
                    <div className="course-card__pricing">
                      {course.discount_price && parseFloat(course.discount_price) > 0 ? (
                        <>
                          <span className="course-card__price course-card__price--discounted">
                            {formatPrice(course.discount_price)}
                          </span>
                          <span className="course-card__price course-card__price--original">
                            {formatPrice(course.price)}
                          </span>
                          <span className="course-card__discount-badge">
                            {Math.round(((parseFloat(course.price) - parseFloat(course.discount_price)) / parseFloat(course.price)) * 100)}% off
                          </span>
                        </>
                      ) : parseFloat(course.price) > 0 ? (
                        <span className="course-card__price">
                          {formatPrice(course.price)}
                        </span>
                      ) : (
                        <span className="course-card__price course-card__price--free">
                          Free
                        </span>
                      )}
                    </div>
                    
                    <button className="course-card__action">
                      Manage Course
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="course-selection__empty">
            <div className="course-selection__empty-illustration">
              <svg viewBox="0 0 200 200" fill="none">
                <circle cx="100" cy="100" r="80" stroke="#E5E7EB" strokeWidth="8"/>
                <path d="M60 60L140 140" stroke="#E5E7EB" strokeWidth="8"/>
                <path d="M140 60L60 140" stroke="#E5E7EB" strokeWidth="8"/>
                <circle cx="100" cy="100" r="60" fill="#F3F4F6"/>
                <path d="M80 100H120" stroke="#9CA3AF" strokeWidth="4" strokeLinecap="round"/>
                <path d="M100 80V120" stroke="#9CA3AF" strokeWidth="4" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="course-selection__empty-title">No Courses Found</h3>
            <p className="course-selection__empty-message">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search criteria or filters to find more courses.'
                : `No courses available in ${category?.name}.`
              }
            </p>
            <div className="course-selection__empty-actions">
              {(searchTerm || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="course-selection__empty-action"
                >
                  Clear all filters
                </button>
              )}
              <button
                onClick={() => setShowCreateForm(true)}
                className="course-selection__empty-action course-selection__empty-action--primary"
                disabled={!category}
              >
                + Create First Course
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default CourseSelection;