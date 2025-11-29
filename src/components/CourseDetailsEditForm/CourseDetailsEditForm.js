import React, { useState, useEffect } from 'react';
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
        category: '',
        learning_objectives: []
    });

    const [thumbnailPreview, setThumbnailPreview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [categories, setCategories] = useState([]);

    // Load categories
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

    const handleObjectivesChange = (updatedObjectives) => {
        console.log('=== DEBUG: OBJECTIVES CHANGED ===');
        console.log('Updated objectives:', updatedObjectives);
        console.log('Number of objectives:', updatedObjectives.length);

        setFormData(prev => ({
            ...prev,
            learning_objectives: updatedObjectives
        }));
    };

    const showCompleteStructure = () => {
        console.log('=== DEBUG: COMPLETE COURSE STRUCTURE PREVIEW ===');
        console.log('COURSE ID:', course?.id);
        console.log('COURSE TITLE:', formData.title);
        console.log('--- BASIC INFORMATION ---');
        console.log('Description:', formData.description);
        console.log('Short Description:', formData.short_description);
        console.log('Level:', formData.level);
        console.log('Language:', formData.language);
        console.log('Duration (seconds):', formData.duration_seconds);

        console.log('--- PRICING ---');
        console.log('Price:', formData.price);
        console.log('Discount Price:', formData.discount_price);

        console.log('--- MEDIA ---');
        console.log('Thumbnail:', formData.thumbnail ? 'New file selected' : (course?.thumbnail || 'No thumbnail'));
        console.log('Promotional Video:', formData.promotional_video);

        console.log('--- CATEGORY & REQUIREMENTS ---');
        console.log('Category ID:', formData.category);
        console.log('Requirements:', formData.requirements);

        console.log('--- SETTINGS ---');
        console.log('Certificate Available:', formData.certificate_available);
        console.log('Is Featured:', formData.is_featured);
        console.log('Status:', formData.status);

        console.log('--- LEARNING OBJECTIVES ---');
        console.log('Total Objectives:', formData.learning_objectives.length);
        formData.learning_objectives.forEach((obj, index) => {
            console.log(`  Objective ${index + 1}:`, {
                id: obj.id,
                icon: obj.icon,
                objective: obj.objective,
                order: obj.order,
                course: obj.course
            });
        });

        console.log('=== DEBUG: PREVIEW COMPLETE ===');
        setShowPreview(true);
    };

    const createFormData = () => {
        const submitData = new FormData();

        Object.keys(formData).forEach(key => {
            if (key === 'learning_objectives') {
                console.log('=== DEBUG: PROCESSING LEARNING OBJECTIVES ===');
                console.log('Raw objectives:', formData[key]);
                console.log('Objectives length:', formData[key].length);

                const validObjectives = Array.isArray(formData[key]) ? formData[key] : [];
                const nonEmptyObjectives = validObjectives.filter(obj => 
                    obj.objective && obj.objective.trim() !== ''
                );

                console.log('After filtering empty objectives:', nonEmptyObjectives.length);

                const formattedObjectives = nonEmptyObjectives.map((obj, index) => {
                    const formatted = {
                        id: obj.id || null,
                        objective: obj.objective.trim(),
                        order: obj.order !== undefined ? obj.order : index,
                        icon: obj.icon || (index + 1).toString(),
                        course: course.id
                    };
                    console.log(`Objective ${index}:`, formatted);
                    return formatted;
                });

                console.log('Final formatted objectives:', formattedObjectives);
                
                if (formattedObjectives.length > 0) {
                    submitData.append(key, JSON.stringify(formattedObjectives));
                } else {
                    console.log('No valid learning objectives to send');
                    submitData.append(key, JSON.stringify([]));
                }

            } else if (key === 'thumbnail') {
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

        // Debug: Log what's actually in FormData
        console.log('=== DEBUG: FINAL FORMDATA CONTENTS ===');
        for (let pair of submitData.entries()) {
            console.log(`${pair[0]}:`, pair[1]);
        }

        return submitData;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!course) return;

        // Show preview before submitting
        if (!showPreview) {
            showCompleteStructure();
            return;
        }

        setIsSubmitting(true);
        try {
            console.log('=== DEBUG: STARTING COURSE UPDATE ===');

            const submitData = createFormData();

            // Log the final data being sent to API
            console.log('=== DEBUG: DATA BEING SENT TO API ===');
            const formDataObj = {};
            for (let pair of submitData.entries()) {
                if (pair[0] === 'thumbnail' && pair[1] instanceof File) {
                    formDataObj[pair[0]] = `File: ${pair[1].name}`;
                } else if (pair[0] === 'learning_objectives') {
                    formDataObj[pair[0]] = JSON.parse(pair[1]);
                } else {
                    formDataObj[pair[0]] = pair[1];
                }
            }
            console.log('API Payload:', formDataObj);

            console.log('=== DEBUG: CALLING updateCourse API ===');
            console.log('Endpoint:', `/api/course/${course.id}/`);

            // Call update API
            const response = await updateCourse(course.id, submitData);

            console.log('=== DEBUG: API RESPONSE ===');
            console.log('Response Status:', response.status);
            console.log('Response Data:', response.data);

            if (onUpdate) {
                onUpdate(response.data);
            }

            console.log('=== DEBUG: COURSE UPDATE SUCCESSFUL ===');
            setShowPreview(false);

        } catch (error) {
            console.error('=== DEBUG: ERROR IN COURSE UPDATE ===');
            console.error('Error:', error);
            console.error('Error Response:', error.response);
            console.error('Error Data:', error.response?.data);
            console.error('Error Status:', error.response?.status);

            alert('Error updating course: ' + (error.response?.data?.message || error.response?.data?.detail || error.message));
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
                category: course.category || '',
                learning_objectives: course.learning_objectives || []
            });
            setThumbnailPreview(course.thumbnail || '');
            setShowPreview(false);
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
                                    />
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
                                    />
                                    <div className="c-d-e-character-count">
                                        {formData.short_description.length}/200 characters
                                    </div>
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
                                    />
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
                                    >
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                        <option value="all">All Levels</option>
                                    </select>
                                </div>

                                <div className="c-d-e-form-group">
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
                                    <small>Choose the course category</small>
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
                                learningObjectives={formData.learning_objectives}
                                onObjectivesChange={handleObjectivesChange}
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
                                    disabled={isSubmitting}
                                >
                                    Reset Changes
                                </button>
                                {showPreview && (
                                    <button
                                        type="button"
                                        onClick={cancelPreview}
                                        className="c-d-e-btn c-d-e-btn-warning"
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
                </div>
            </div>
        </div>
    );
};

export default CourseDetailsEditForm;