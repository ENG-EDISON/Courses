import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { getCoursepreviewStructure } from "../api/CoursesApi";
import "../static/Courses.css";

function Course() {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedSections, setExpandedSections] = useState(new Set());
    const [expandedSubsections, setExpandedSubsections] = useState(new Set());
    const [currentVideo, setCurrentVideo] = useState(null);
    const [showVideoModal, setShowVideoModal] = useState(false);

    // Fetch course full structure from API
    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                setLoading(true);
                const response = await getCoursepreviewStructure(courseId);
                console.log('Preview:', response.data);
                setCourse(response.data);
            } catch (err) {
                console.error('Error fetching course data:', err);
                setError('Failed to load course. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            fetchCourseData();
        }
    }, [courseId]);

    const toggleSection = (sectionId) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(sectionId)) {
            newExpanded.delete(sectionId);
        } else {
            newExpanded.add(sectionId);
        }
        setExpandedSections(newExpanded);
    };

    const toggleSubsection = (subsectionId) => {
        const newExpanded = new Set(expandedSubsections);
        if (newExpanded.has(subsectionId)) {
            newExpanded.delete(subsectionId);
        } else {
            newExpanded.add(subsectionId);
        }
        setExpandedSubsections(newExpanded);
    };

    // Play preview video
    const playPreviewVideo = (lesson) => {
        if (lesson.is_preview && lesson.video_url) {
            setCurrentVideo(lesson);
            setShowVideoModal(true);
        }
    };

    // Close video modal
    const closeVideoModal = () => {
        setShowVideoModal(false);
        setCurrentVideo(null);
    };

    // Extract YouTube video ID
    const getYouTubeVideoId = (url) => {
        if (!url) return null;
        const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        return match ? match[1] : null;
    };

    // Check if video is YouTube
    const isYouTubeVideo = (url) => {
        return url && (url.includes('youtube.com') || url.includes('youtu.be'));
    };

    // Check if video is local file
    const isLocalVideo = (url) => {
        return url && (url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg'));
    };

    const formatLearningObjectives = (objectives) => {
        if (!objectives || !Array.isArray(objectives)) return null;
        
        return (
            <div className="objectives-tight-grid">
                {objectives.map((obj, index) => (
                    <div key={obj.id || index} className="objective-tight">
                        <span className="icon-tight">{obj.icon || "✓"}</span>
                        <span className="text-tight">{obj.objective}</span>
                    </div>
                ))}
            </div>
        );
    };

    const formatDuration = (seconds) => {
        if (!seconds) return "0 min";
        const minutes = Math.floor(seconds / 60);
        return `${minutes} min`;
    };

    const getTotalSectionDuration = (section) => {
        if (!section.subsections) return 0;
        return section.subsections.reduce((total, subsection) => {
            if (!subsection.lessons) return total;
            return total + subsection.lessons.reduce((subTotal, lesson) => 
                subTotal + (lesson.video_duration || 0), 0
            );
        }, 0);
    };

    const getTotalSubsectionDuration = (subsection) => {
        if (!subsection.lessons) return 0;
        return subsection.lessons.reduce((total, lesson) => 
            total + (lesson.video_duration || 0), 0
        );
    };

    const getLessonIcon = (lessonType) => {
        const icons = {
            video: "fas fa-play-circle",
            article: "fas fa-file-alt",
            quiz: "fas fa-question-circle",
            assignment: "fas fa-tasks"
        };
        return icons[lessonType] || "fas fa-circle";
    };

    const getLessonIconColor = (lessonType) => {
        const colors = {
            video: "var(--primary-color)",
            article: "var(--success-color)",
            quiz: "var(--warning-color)",
            assignment: "var(--accent-color)"
        };
        return colors[lessonType] || "var(--text-secondary)";
    };

    if (loading) {
        return (
            <div className="enterprise-loading">
                <div className="loading-animation">
                    <div className="loading-spinner"></div>
                    <div className="loading-pulse"></div>
                </div>
                <div className="loading-text">
                    <h3>Loading Course Content</h3>
                    <p>Preparing your learning experience...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="enterprise-error">
                <div className="error-icon">⚠️</div>
                <div className="error-content">
                    <h3>Unable to Load Course</h3>
                    <p>{error}</p>
                    <button className="retry-btn" onClick={() => window.location.reload()}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="enterprise-error">
                <div className="error-icon">🔍</div>
                <div className="error-content">
                    <h3>Course Not Found</h3>
                    <p>The requested course could not be found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="enterprise-course">
            {/* Video Preview Modal */}
            {showVideoModal && currentVideo && (
                <div className="video-modal-overlay" onClick={closeVideoModal}>
                    <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="video-modal-header">
                            <h3>{currentVideo.title}</h3>
                            <button className="video-modal-close" onClick={closeVideoModal}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="video-player-container">
                            {isYouTubeVideo(currentVideo.video_url) ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(currentVideo.video_url)}?autoplay=1`}
                                    title={currentVideo.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            ) : isLocalVideo(currentVideo.video_url) ? (
                                <video controls autoPlay style={{ width: '100%', height: '100%' }}>
                                    <source src={currentVideo.video_url} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            ) : (
                                <div className="video-not-supported">
                                    <i className="fas fa-exclamation-triangle"></i>
                                    <p>Video format not supported</p>
                                </div>
                            )}
                        </div>
                        <div className="video-modal-footer">
                            <p>Preview Content - Enroll to access all videos</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Course Hero Section */}
            <div className="course-hero">
                <div className="hero-background"></div>
                <div className="hero-content">
                    <div className="course-breadcrumb">
                        <span>Courses</span>
                        <span className="breadcrumb-divider">/</span>
                        <span>{course.category || 'Uncategorized'}</span>
                        <span className="breadcrumb-divider">/</span>
                        <span className="current-course">{course.title}</span>
                    </div>
                    
                    <div className="hero-main">
                        <div className="hero-text">
                            <h1 className="course-title">{course.title}</h1>
                            <p className="course-subtitle">{course.short_description}</p>
                            
                            <div className="hero-meta">
                                <div className="meta-item">
                                    <i className="fas fa-chart-line"></i>
                                    <span className="level-badge">{course.level}</span>
                                </div>
                                <div className="meta-item">
                                    <i className="fas fa-clock"></i>
                                    <span>{course.duration_hours} hours</span>
                                </div>
                                <div className="meta-item">
                                    <i className="fas fa-globe"></i>
                                    <span>{course.language}</span>
                                </div>
                                {course.certificate_available && (
                                    <div className="meta-item">
                                        <i className="fas fa-award"></i>
                                        <span>Certificate</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="hero-actions">
                            <div className="pricing-card">
                                <div className="price-display">
                                    {(() => {
                                        const regularPrice = parseFloat(course.price);
                                        const discountPrice = parseFloat(course.discount_price);
                                        const hasValidDiscount = discountPrice && discountPrice < regularPrice;
                                        
                                        return hasValidDiscount ? (
                                            <div className="discount-price-group">
                                                <span className="original-price">${course.price}</span>
                                                <span className="current-price">${course.discount_price}</span>
                                                <span className="discount-tag">
                                                    Save {Math.round(((regularPrice - discountPrice) / regularPrice) * 100)}%
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="current-price">${course.price}</span>
                                        );
                                    })()}
                                </div>
                                <button className="enroll-btn-primary">
                                    <i className="fas fa-lock"></i>
                                    Enroll Now
                                </button>
                                <div className="money-back">
                                    <i className="fas fa-shield-alt"></i>
                                    30-day money-back guarantee
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="course-container">
                <div className="course-layout">
                    {/* Main Content Column */}
                    <div className="course-main-content">
                        {/* Course Overview */}
                        <section className="content-section">
                            <div className="section-header">
                                <i className="fas fa-info-circle"></i>
                                <h2>Course Overview</h2>
                            </div>
                            <div className="section-content">
                                <p className="course-description">{course.description}</p>
                            </div>
                        </section>

                        {/* What You'll Learn */}
                        {course.learning_objectives && course.learning_objectives.length > 0 && (
                            <section className="content-section">
                                <div className="section-header">
                                    <i className="fas fa-bullseye"></i>
                                    <h2>What You'll Learn</h2>
                                </div>
                                <div className="section-content">
                                    {formatLearningObjectives(course.learning_objectives)}
                                </div>
                            </section>
                        )}

                        {/* Course Curriculum */}
                        <section className="content-section">
                            <div className="section-header">
                                <i className="fas fa-book-open"></i>
                                <h2>Course Curriculum</h2>
                                <span className="section-count">
                                    {course.sections?.length || 0} sections • 
                                    {course.sections?.reduce((total, section) => 
                                        total + (section.subsections?.length || 0), 0
                                    ) || 0} subsections • 
                                    {course.sections?.reduce((total, section) => 
                                        total + (section.subsections?.reduce((subTotal, subsection) => 
                                            subTotal + (subsection.lessons?.length || 0), 0
                                        ) || 0), 0
                                    ) || 0} lessons
                                </span>
                            </div>
                            <div className="section-content">
                                {course.sections && course.sections.length > 0 ? (
                                    <div className="curriculum-enterprise">
                                        {course.sections.map((section, sectionIndex) => {
                                            const sectionDuration = getTotalSectionDuration(section);
                                            const isSectionExpanded = expandedSections.has(section.id);
                                            
                                            return (
                                                <div key={section.id} className="curriculum-section">
                                                    {/* Section Header */}
                                                    <div 
                                                        className={`section-header-enterprise ${isSectionExpanded ? 'expanded' : ''}`}
                                                        onClick={() => toggleSection(section.id)}
                                                    >
                                                        <div className="section-header-main">
                                                            <div className="section-indicator">
                                                                <div className="section-number">
                                                                    {String(sectionIndex + 1).padStart(2, '0')}
                                                                </div>
                                                                <div className="section-toggle">
                                                                    <i className={`fas fa-chevron-${isSectionExpanded ? 'up' : 'down'}`}></i>
                                                                </div>
                                                            </div>
                                                            <div className="section-content-main">
                                                                <h3 className="section-title">{section.title}</h3>
                                                                <div className="section-meta">
                                                                    <div className="meta-item">
                                                                        <i className="fas fa-layer-group"></i>
                                                                        {section.subsections?.length || 0} Subsections
                                                                    </div>
                                                                    <div className="meta-item">
                                                                        <i className="fas fa-play-circle"></i>
                                                                        {section.subsections?.reduce((total, sub) => 
                                                                            total + (sub.lessons?.length || 0), 0
                                                                        ) || 0} Lessons
                                                                    </div>
                                                                    {sectionDuration > 0 && (
                                                                        <div className="meta-item">
                                                                            <i className="fas fa-clock"></i>
                                                                            {formatDuration(sectionDuration)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Section Content - Subsections & Lessons */}
                                                    <div className={`section-content-enterprise ${isSectionExpanded ? 'expanded' : ''}`}>
                                                        {section.subsections && section.subsections.map((subsection, subIndex) => {
                                                            const subsectionDuration = getTotalSubsectionDuration(subsection);
                                                            const isSubsectionExpanded = expandedSubsections.has(subsection.id);
                                                            
                                                            return (
                                                                <div key={subsection.id} className="subsection-enterprise">
                                                                    {/* Subsection Header */}
                                                                    <div 
                                                                        className={`subsection-header-enterprise ${isSubsectionExpanded ? 'expanded' : ''}`}
                                                                        onClick={() => toggleSubsection(subsection.id)}
                                                                    >
                                                                        <div className="subsection-indicator">
                                                                            <div className="subsection-number">
                                                                                {sectionIndex + 1}.{subIndex + 1}
                                                                            </div>
                                                                            <div className="subsection-toggle">
                                                                                <i className={`fas fa-chevron-${isSubsectionExpanded ? 'up' : 'down'}`}></i>
                                                                            </div>
                                                                        </div>
                                                                        <div className="subsection-content-main">
                                                                            <div className="subsection-title">{subsection.title}</div>
                                                                            <div>{subsection.lessons?.length || 0} Lectures&nbsp; • {formatDuration(subsectionDuration)}</div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Lessons List */}
                                                                    <div className={`lessons-list-enterprise ${isSubsectionExpanded ? 'expanded' : ''}`}>
                                                                        {subsection.lessons && subsection.lessons.length > 0 ? (
                                                                            subsection.lessons.map((lesson, lessonIndex) => (
                                                                                <div 
                                                                                    key={lesson.id} 
                                                                                    className={`lesson-item-enterprise ${lesson.is_preview ? 'preview-available' : ''}`}
                                                                                    onClick={() => lesson.is_preview && playPreviewVideo(lesson)}
                                                                                >
                                                                                    <div className="lesson-icon" style={{ color: getLessonIconColor(lesson.lesson_type) }}>
                                                                                        <i className={getLessonIcon(lesson.lesson_type)}></i>
                                                                                    </div>
                                                                                    <div className="lesson-content">
                                                                                        <div className="lesson-main">
                                                                                            <div className="lesson-title">{lesson.title}</div>
                                                                                            <div className="lesson-meta">
                                                                                                <span className="lesson-type">{lesson.lesson_type}</span>
                                                                                                {lesson.video_duration > 0 && (
                                                                                                    <span className="lesson-duration">{formatDuration(lesson.video_duration)}</span>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="lesson-actions">
                                                                                            {lesson.is_preview ? (
                                                                                                <span className="preview-badge clickable">
                                                                                                    <i className="fas fa-eye"></i>
                                                                                                    Preview
                                                                                                </span>
                                                                                            ) : (
                                                                                                <span className="locked-badge">
                                                                                                    <i className="fas fa-lock"></i>
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            ))
                                                                        ) : (
                                                                            <div className="no-lessons-message">
                                                                                <i className="fas fa-info-circle"></i>
                                                                                <span>No lessons available in this subsection yet.</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <i className="fas fa-book"></i>
                                        <h4>Curriculum Coming Soon</h4>
                                        <p>The course content is being prepared by the instructor.</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Requirements */}
                        {course.requirements && (
                            <section className="content-section">
                                <div className="section-header">
                                    <i className="fas fa-tools"></i>
                                    <h2>Requirements</h2>
                                </div>
                                <div className="section-content">
                                    <div className="requirements-content">
                                        <p>{course.requirements}</p>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar Column */}
                    <div className="course-sidebar">
                        {/* Instructor Card */}
                        <div className="sidebar-card">
                            <div className="card-header">
                                <h3>Instructor</h3>
                            </div>
                            <div className="instructor-info">
                                <div className="instructor-avatar">
                                    <i className="fas fa-user-tie"></i>
                                </div>
                                <div className="instructor-details">
                                    <h4>{course.instructor_name || 'Instructor'}</h4>
                                    <div className="instructor-stats">
                                        <div className="stat">
                                            <strong>{course.instructor?.total_students || 0}</strong>
                                            <span>Students</span>
                                        </div>
                                        <div className="stat">
                                            <strong>{course.instructor?.instructor_rating || '5.0'}</strong>
                                            <span>Rating</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Course Stats */}
                        <div className="sidebar-card">
                            <div className="card-header">
                                <h3>Course Statistics</h3>
                            </div>
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <div className="stat-icon">
                                        <i className="fas fa-users"></i>
                                    </div>
                                    <div className="stat-info">
                                        <div className="stat-value">{course.enrollment_count}</div>
                                        <div className="stat-label">Enrolled</div>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-icon">
                                        <i className="fas fa-star"></i>
                                    </div>
                                    <div className="stat-info">
                                        <div className="stat-value">{course.average_rating}</div>
                                        <div className="stat-label">Rating</div>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-icon">
                                        <i className="fas fa-comments"></i>
                                    </div>
                                    <div className="stat-info">
                                        <div className="stat-value">{course.total_reviews}</div>
                                        <div className="stat-label">Reviews</div>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-icon">
                                        <i className="fas fa-calendar"></i>
                                    </div>
                                    <div className="stat-info">
                                        <div className="stat-value">
                                            {course.published_at ? new Date(course.published_at).getFullYear() : 'N/A'}
                                        </div>
                                        <div className="stat-label">Published</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Actions */}
                        <div className="sidebar-card">
                            <div className="action-buttons">
                                <button className="action-btn secondary">
                                    <i className="fas fa-heart"></i>
                                    Add to Wishlist
                                </button>
                                <button className="action-btn secondary">
                                    <i className="fas fa-share-alt"></i>
                                    Share Course
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Course;