import React, { useState, useEffect, useCallback } from 'react';
import './CourseDetailsEditForm.css';
import { updateCourse } from '../../api/CoursesApi';
import { getAllCoursesCategories } from '../../api/CourseCategoryApi';
import LearningObjectivesManager from '../course_management/LearningObjectivesManager/LearningObjectivesManager';

const CourseDetailsEditForm = ({ course, onUpdate, isLoading }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        short_description: '',
        price: '',
        discount_price: '',
        level: 'beginner',
        duration_seconds: 0,
        language: 'English',
        requirements: '',
        promotional_video: '',
        certificate_available: false,
        is_featured: false,
        status: 'draft',
        thumbnail: null,
        category: ''
    });

    const [thumbnailPreview, setThumbnailPreview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [categories, setCategories] = useState([]);
    const [courseObjectives, setCourseObjectives] = useState([]);
    const [formErrors, setFormErrors] = useState({});

    // Load categories with useCallback
    const loadCategories = useCallback(async () => {
        try {
            const response = await getAllCoursesCategories();
            setCategories(response.data.filter(cat => cat.is_active));
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }, []);

    // Load categories on mount
    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

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
                duration_seconds: course.duration_seconds || 0,
                language: course.language || 'English',
                requirements: course.requirements || '',
                promotional_video: course.promotional_video || '',
                certificate_available: course.certificate_available || false,
                is_featured: course.is_featured || false,
                status: course.status || 'draft',
                thumbnail: null,
                category: course.category || ''
            });

            // Initialize objectives separately
            setCourseObjectives(course.learning_objectives || []);

            if (course.thumbnail) {
                setThumbnailPreview(course.thumbnail);
            }
            
            // Clear any existing errors
            setFormErrors({});
        }
    }, [course]);

    const validateForm = () => {
        const errors = {};
        
        if (!formData.title?.trim()) {
            errors.title = 'Course title is required';
        }
        
        if (!formData.short_description?.trim()) {
            errors.short_description = 'Short description is required';
        } else if (formData.short_description.length > 200) {
            errors.short_description = 'Short description must be 200 characters or less';
        }
        
        if (!formData.description?.trim()) {
            errors.description = 'Description is required';
        }
        
        if (!formData.category) {
            errors.category = 'Category is required';
        }
        
        return errors;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }

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
        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleObjectivesUpdated = (updatedObjectives) => {
        // Update local objectives state ONLY
        setCourseObjectives(updatedObjectives);
    };

    const showCompleteStructure = () => {
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            alert('Please fix the errors in the form before previewing.');
            return;
        }
        setShowPreview(true);
    };

    const createFormData = () => {
        const submitData = new FormData();

        Object.keys(formData).forEach(key => {
            // No learning_objectives handling here - they're managed separately
            if (key === 'thumbnail') {
                if (formData[key] instanceof File) {
                    submitData.append(key, formData[key]);
                } else if (formData[key] === null) {
                    submitData.append(key, '');
                }
            } else if (key === 'price' || key === 'discount_price') {
                submitData.append(key, formData[key] ? formData[key].toString() : '0.00');
            } else if (key === 'duration_seconds') {
                submitData.append(key, formData[key] ? parseInt(formData[key]) : 0);
            } else if (key === 'category') {
                submitData.append(key, formData[key] ? parseInt(formData[key]) : '');
            } else if (key === 'certificate_available' || key === 'is_featured') {
                submitData.append(key, formData[key].toString());
            } else {
                submitData.append(key, formData[key]);
            }
        });

        // Add required fields
        if (course?.slug) {
            submitData.append('slug', course.slug);
        } else {
            const slug = formData.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
            submitData.append('slug', slug);
        }

        if (course?.instructor) {
            submitData.append('instructor', course.instructor.toString());
        }
        
        return submitData;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!course) return;
        
        if (isSubmitting) {
            return;
        }
        
        if (!showPreview) {
            showCompleteStructure();
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            const submitData = createFormData();
            
            
            // Update course data only (objectives are managed separately)
            const response = await updateCourse(course.id, submitData);
            
            if (onUpdate) {
                // Pass ONLY the course response data - NO objectives
                onUpdate(response.data);
                // Remove the objectives merge - they save independently
            }
            
            setShowPreview(false);
            setFormErrors({});
            alert('Course updated successfully!');
            
        } catch (error) {
            console.error('Course update failed:', error);
            const errorMessage = error.response?.data?.message || error.message;
            alert('Error updating course: ' + errorMessage);
            
            // Set form errors if available from backend
            if (error.response?.data?.errors) {
                setFormErrors(error.response.data.errors);
            }
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
                duration_seconds: course.duration_seconds || 0,
                language: course.language || 'English',
                requirements: course.requirements || '',
                promotional_video: course.promotional_video || '',
                certificate_available: course.certificate_available || false,
                is_featured: course.is_featured || false,
                status: course.status || 'draft',
                thumbnail: null,
                category: course.category || ''
            });
            
            // Reset objectives separately
            setCourseObjectives(course.learning_objectives || []);
            
            setThumbnailPreview(course.thumbnail || '');
            setShowPreview(false);
            setFormErrors({});
        }
    };

    const cancelPreview = () => {
        setShowPreview(false);
    };

    if (!course) {
        return (
            <div className="c-d-e-course-details-edit-form">
                <div className="c-d-e-no-course-selected">
                    <p>Please select a course to edit its details.</p>
                </div>
            </div>
        );
    }

    const durationInHours = formData.duration_seconds / 3600;

    return (
        <div className="c-d-e-course-details-edit-form">
            <div className="c-d-e-form-layout">
                <div className="c-d-e-form-main-content">
                    <div className="c-d-e-form-header">
                        <h2>Edit Course Details</h2>
                        <p>Update all aspects of "{course.title}"</p>
                        {showPreview && (
                            <div className="c-d-e-preview-notice">
                                <strong>📋 Preview Mode:</strong> Check browser console for complete course structure before updating
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="c-d-e-course-details-form">
                        {/* Basic Information */}
                        <div className="c-d-e-form-section">
                            <h3>Basic Information</h3>

                            <div className="c-d-e-form-row">
                                <div className="c-d-e-form-group c-d-e-form-group-full-width">
                                    <label htmlFor="title">Course Title *</label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter course title"
                                        disabled={isSubmitting}
                                        className={formErrors.title ? 'error' : ''}
                                    />
                                    {formErrors.title && (
                                        <div className="c-d-e-error-message">{formErrors.title}</div>
                                    )}
                                </div>
                            </div>

                            <div className="c-d-e-form-row">
                                <div className="c-d-e-form-group">
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
                                        disabled={isSubmitting}
                                        className={formErrors.short_description ? 'error' : ''}
                                    />
                                    <div className="c-d-e-character-count">
                                        {formData.short_description.length}/200 characters
                                    </div>
                                    {formErrors.short_description && (
                                        <div className="c-d-e-error-message">{formErrors.short_description}</div>
                                    )}
                                </div>
                            </div>

                            <div className="c-d-e-form-row">
                                <div className="c-d-e-form-group c-d-e-form-group-full-width">
                                    <label htmlFor="description">Full Description *</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={(e) => handleTextareaChange('description', e.target.value)}
                                        rows="6"
                                        required
                                        placeholder="Detailed course description that explains what students will learn"
                                        disabled={isSubmitting}
                                        className={formErrors.description ? 'error' : ''}
                                    />
                                    {formErrors.description && (
                                        <div className="c-d-e-error-message">{formErrors.description}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Thumbnail & Media */}
                        <div className="c-d-e-form-section">
                            <h3>Media</h3>

                            <div className="c-d-e-form-row">
                                <div className="c-d-e-form-group">
                                    <label htmlFor="thumbnail">Course Thumbnail</label>
                                    <div className="c-d-e-thumbnail-upload">
                                        {thumbnailPreview && (
                                            <div className="c-d-e-thumbnail-preview">
                                                <img src={thumbnailPreview} alt="Thumbnail preview" />
                                                <button
                                                    type="button"
                                                    className="c-d-e-btn-remove-thumbnail"
                                                    onClick={() => {
                                                        setFormData(prev => ({ ...prev, thumbnail: null }));
                                                        setThumbnailPreview('');
                                                    }}
                                                    disabled={isSubmitting}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            id="thumbnail"
                                            name="thumbnail"
                                            onChange={handleInputChange}
                                            accept="image/*"
                                            disabled={isSubmitting}
                                        />
                                        <small>Recommended: 1280x720 pixels, JPG or PNG</small>
                                    </div>
                                </div>

                                <div className="c-d-e-form-group">
                                    <label htmlFor="promotional_video">Promotional Video URL</label>
                                    <input
                                        type="url"
                                        id="promotional_video"
                                        name="promotional_video"
                                        value={formData.promotional_video}
                                        onChange={handleInputChange}
                                        placeholder="https://youtube.com/watch?v=..."
                                        disabled={isSubmitting}
                                    />
                                    <small>YouTube or Vimeo URL for course promotion</small>
                                </div>
                            </div>
                        </div>

                        {/* Pricing & Duration */}
                        <div className="c-d-e-form-section">
                            <h3>Pricing & Duration</h3>

                            <div className="c-d-e-form-row">
                                <div className="c-d-e-form-group">
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
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="c-d-e-form-group">
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
                                        disabled={isSubmitting}
                                    />
                                    <small>Set to 0 for no discount</small>
                                </div>

                                <div className="c-d-e-form-group">
                                    <label htmlFor="duration_seconds">Duration (Hours)</label>
                                    <input
                                        type="number"
                                        id="duration_seconds"
                                        name="duration_seconds"
                                        value={durationInHours.toFixed(1)}
                                        readOnly
                                        placeholder="0"
                                        className="read-only-field"
                                    />
                                    <small>Total course duration in hours (calculated automatically from lessons)</small>
                                </div>
                            </div>
                        </div>

                        {/* Course Metadata */}
                        <div className="c-d-e-form-section">
                            <h3>Course Metadata</h3>

                            <div className="c-d-e-form-row">
                                <div className="c-d-e-form-group">
                                    <label htmlFor="language">Language</label>
                                    <select
                                        id="language"
                                        name="language"
                                        value={formData.language}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                    >
                                        <option value="English">English</option>
                                        <option value="Spanish">Spanish</option>
                                        <option value="French">French</option>
                                        <option value="German">German</option>
                                        <option value="Chinese">Chinese</option>
                                        <option value="Hindi">Hindi</option>
                                        <option value="Arabic">Arabic</option>
                                        <option value="Portuguese">Portuguese</option>
                                        <option value="Russian">Russian</option>
                                        <option value="Japanese">Japanese</option>
                                    </select>
                                </div>

                                <div className="c-d-e-form-group">
                                    <label htmlFor="level">Difficulty Level</label>
                                    <select
                                        id="level"
                                        name="level"
                                        value={formData.level}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                    >
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                        <option value="all">All Levels</option>
                                    </select>
                                </div>

                                <div className="c-d-e-form-group">
                                    <label htmlFor="category">Category *</label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                        className={formErrors.category ? 'error' : ''}
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    <small>Choose the course category</small>
                                    {formErrors.category && (
                                        <div className="c-d-e-error-message">{formErrors.category}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Requirements */}
                        <div className="c-d-e-form-section">
                            <h3>Requirements</h3>

                            <div className="c-d-e-form-row">
                                <div className="c-d-e-form-group c-d-e-form-group-full-width">
                                    <label htmlFor="requirements">Course Requirements</label>
                                    <textarea
                                        id="requirements"
                                        name="requirements"
                                        value={formData.requirements}
                                        onChange={(e) => handleTextareaChange('requirements', e.target.value)}
                                        rows="4"
                                        placeholder="What should students know before taking this course? List prerequisites, tools needed, etc."
                                        disabled={isSubmitting}
                                    />
                                    <small>List each requirement on a new line or separate with commas</small>
                                </div>
                            </div>
                        </div>

                        {/* Learning Objectives - Integrated Component */}
                        <div className="c-d-e-form-section">
                            <LearningObjectivesManager
                                courseId={course.id}
                                courseTitle={course.title}
                                initialObjectives={courseObjectives}
                                onObjectivesUpdated={handleObjectivesUpdated}
                            />
                        </div>

                        {/* Course Settings */}
                        <div className="c-d-e-form-section">
                            <h3>Course Settings</h3>

                            <div className="c-d-e-form-row">
                                <div className="c-d-e-form-group c-d-e-checkbox-group">
                                    <label className="c-d-e-checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="certificate_available"
                                            checked={formData.certificate_available}
                                            onChange={handleInputChange}
                                            disabled={isSubmitting}
                                        />
                                        <span className="checkmark"></span>
                                        Certificate Available
                                    </label>
                                    <small>Offer certificate upon course completion</small>
                                </div>

                                <div className="c-d-e-form-group c-d-e-checkbox-group">
                                    <label className="c-d-e-checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="is_featured"
                                            checked={formData.is_featured}
                                            onChange={handleInputChange}
                                            disabled={isSubmitting}
                                        />
                                        <span className="checkmark"></span>
                                        Featured Course
                                    </label>
                                    <small>Show this course in featured sections on the homepage</small>
                                </div>
                            </div>

                            <div className="c-d-e-form-row">
                                <div className="c-d-e-form-group">
                                    <label htmlFor="status">Course Status</label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                        <option value="archived">Archived</option>
                                        <option value="under_review">Under Review</option>
                                    </select>
                                    <small>
                                        {formData.status === 'draft' && 'Course is not visible to students'}
                                        {formData.status === 'published' && 'Course is live and visible to students'}
                                        {formData.status === 'archived' && 'Course is hidden from students'}
                                        {formData.status === 'under_review' && 'Course is being reviewed by admins'}
                                    </small>
                                </div>
                            </div>
                        </div>

                        {/* Course Statistics (Read-only) */}
                        {course && (
                            <div className="c-d-e-form-section c-d-e-read-only-section">
                                <h3>Course Statistics</h3>
                                <div className="c-d-e-stats-grid">
                                    <div className="c-d-e-stat-item">
                                        <label>Enrollment Count</label>
                                        <div className="c-d-e-stat-value">{course.enrollment_count || 0}</div>
                                    </div>
                                    <div className="c-d-e-stat-item">
                                        <label>Average Rating</label>
                                        <div className="c-d-e-stat-value">{course.average_rating || 0}/5</div>
                                    </div>
                                    <div className="c-d-e-stat-item">
                                        <label>Total Reviews</label>
                                        <div className="c-d-e-stat-value">{course.total_reviews || 0}</div>
                                    </div>
                                    <div className="c-d-e-stat-item">
                                        <label>Created At</label>
                                        <div className="c-d-e-stat-value">
                                            {course.created_at ? new Date(course.created_at).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>
                                    <div className="c-d-e-stat-item">
                                        <label>Last Updated</label>
                                        <div className="c-d-e-stat-value">
                                            {course.updated_at ? new Date(course.updated_at).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>
                                    <div className="c-d-e-stat-item">
                                        <label>Published At</label>
                                        <div className="c-d-e-stat-value">
                                            {course.published_at ? new Date(course.published_at).toLocaleDateString() : 'Not published'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Form Actions */}
                        <div className="c-d-e-form-actions">
                            <div className="c-d-e-form-actions-left">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="c-d-e-btn c-d-e-btn-secondary"
                                    disabled={isSubmitting || isLoading}
                                >
                                    Reset Changes
                                </button>
                                {showPreview && (
                                    <button
                                        type="button"
                                        onClick={cancelPreview}
                                        className="c-d-e-btn c-d-e-btn-warning"
                                        disabled={isSubmitting}
                                    >
                                        Cancel Preview
                                    </button>
                                )}
                            </div>
                            <div className="c-d-e-form-actions-right">
                                <button
                                    type="submit"
                                    className={`c-d-e-btn ${showPreview ? "c-d-e-btn-success" : "c-d-e-btn-primary"}`}
                                    disabled={isSubmitting || isLoading}
                                >
                                    {isSubmitting ? 'Updating Course...' :
                                        showPreview ? 'Confirm Update' : 'Preview & Update Course'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Sidebar for additional information */}
                <div className="c-d-e-form-sidebar">
                    <div className="c-d-e-sidebar-section">
                        <h4>Course Progress</h4>
                        <div className="c-d-e-progress-indicator">
                            <div className="c-d-e-progress-item c-d-e-progress-item-completed">
                                <div className="c-d-e-progress-icon">✓</div>
                                <div className="c-d-e-progress-text">Basic Information</div>
                            </div>
                            <div className="c-d-e-progress-item c-d-e-progress-item-in-progress">
                                <div className="c-d-e-progress-icon">!</div>
                                <div className="c-d-e-progress-text">Media & Content</div>
                            </div>
                            <div className="c-d-e-progress-item c-d-e-progress-item-pending">
                                <div className="c-d-e-progress-icon">○</div>
                                <div className="c-d-e-progress-text">Pricing & Settings</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="c-d-e-sidebar-section">
                        <h4>Quick Tips</h4>
                        <ul className="c-d-e-tips-list">
                            <li>✅ Use descriptive titles and descriptions</li>
                            <li>✅ Add a high-quality thumbnail image</li>
                            <li>✅ Set appropriate difficulty level</li>
                            <li>✅ Add clear learning objectives</li>
                            <li>✅ Specify course requirements</li>
                            <li>✅ Choose the right category</li>
                        </ul>
                    </div>
                    
                    <div className="c-d-e-sidebar-section">
                        <h4>Current Course Info</h4>
                        <div className="c-d-e-course-info">
                            <p><strong>Course ID:</strong> {course.id}</p>
                            <p><strong>Slug:</strong> {course.slug || 'Not set'}</p>
                            <p><strong>Instructor:</strong> {course.instructor_name || 'N/A'}</p>
                            <p><strong>Last Updated:</strong> {course.updated_at ? new Date(course.updated_at).toLocaleString() : 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailsEditForm;