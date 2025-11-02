// CourseContent.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCourseFullStructure } from '../api/CoursesApi';
import { 
    getCourseLessonProgress, 
    updateBulkLessonProgress, 
    getCourseProgressSummary,
    trackLessonProgress,
    getLastPlayedLesson,
    getUserEnrollment
} from '../api/LessonProgressApi';
import "../static/CourseContentPage.css"

const CourseContentPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeVideo, setActiveVideo] = useState(null);
    const [expandedSections, setExpandedSections] = useState(new Set());
    const [completionStatus, setCompletionStatus] = useState({});
    const [progressSummary, setProgressSummary] = useState(null);
    const [enrollmentId, setEnrollmentId] = useState(null);
    const [lastPlayed, setLastPlayed] = useState(null);

    useEffect(() => {
        const fetchCourseContent = async () => {
            try {
                console.log("Fetching course content for course ID:", id);
                
                // Fetch all data in parallel
                const [courseResponse, progressResponse, summaryResponse, lastPlayedResponse] = await Promise.all([
                    getCourseFullStructure(id),
                    getCourseLessonProgress(id),
                    getCourseProgressSummary(id),
                    getLastPlayedLesson(id).catch(err => ({ data: null })) // Safe fallback
                ]);

                console.log("Course data:", courseResponse.data);
                console.log("Progress data:", progressResponse.data);
                console.log("Summary data:", summaryResponse.data);
                console.log("Last played:", lastPlayedResponse.data);

                setCourse(courseResponse.data);
                setProgressSummary(summaryResponse.data);

                // Process progress data
                const progressData = progressResponse.data;
                const completedLessons = {};
                
                if (Array.isArray(progressData)) {
                    progressData.forEach(progress => {
                        const lessonId = progress.lesson || progress.lesson_id;
                        if (progress.completed && lessonId) {
                            completedLessons[lessonId] = true;
                            console.log(`Found completed lesson: ${lessonId}`);
                        }
                    });
                }

                console.log("Completed lessons:", completedLessons);
                setCompletionStatus(completedLessons);

                // Handle last played lesson
                if (lastPlayedResponse.data && lastPlayedResponse.data.lesson_id) {
                    setLastPlayed(lastPlayedResponse.data);
                    console.log("Last played lesson:", lastPlayedResponse.data);
                }

                // Try to get enrollment ID
                if (Array.isArray(progressData) && progressData.length > 0) {
                    const enrollmentIdFromData = progressData[0].enrollment;
                    if (enrollmentIdFromData) {
                        setEnrollmentId(enrollmentIdFromData);
                    }
                }

                // Set active video: last played OR first video
                let activeVideoToSet = null;
                
                if (lastPlayedResponse.data && lastPlayedResponse.data.lesson_id) {
                    activeVideoToSet = findLessonInCourse(courseResponse.data, lastPlayedResponse.data.lesson_id);
                    if (activeVideoToSet) {
                        // Add last played time to the video data
                        activeVideoToSet.lastPlayedTime = lastPlayedResponse.data.current_time;
                    }
                }
                
                if (!activeVideoToSet) {
                    activeVideoToSet = findFirstVideo(courseResponse.data);
                }
                
                setActiveVideo(activeVideoToSet);

                // Expand first section by default
                if (courseResponse.data.sections && courseResponse.data.sections.length > 0) {
                    setExpandedSections(new Set([courseResponse.data.sections[0].id]));
                }
                
            } catch (err) {
                console.error('Full error details:', err);
                setError('Failed to load course content');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCourseContent();
        }
    }, [id]);

    // Video source detection function
const getVideoSource = (videoUrl) => {
    if (!videoUrl) return { type: 'none', source: '' };
    
    // Check if it's a YouTube URL
    const youtubeMatch = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (youtubeMatch) {
        return {
            type: 'youtube',
            source: `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0&modestbranding=1`,
            canTrack: false
        };
    }
    
    // Get base URL from environment and extract domain
    const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/';
    const baseDomain = new URL(baseUrl).hostname;
    
    // Check if it's a self-hosted video
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.m3u8'];
    const isVideoFile = videoExtensions.some(ext => 
        videoUrl.toLowerCase().includes(ext) || 
        videoUrl.toLowerCase().includes('/media/') ||
        videoUrl.toLowerCase().includes(baseDomain) || // Use environment domain
        videoUrl.startsWith('/media/') || // Relative media URLs
        videoUrl.startsWith(baseUrl + 'media/') // Full media URLs with base URL
    );
    
    if (isVideoFile) {
        // Handle relative URLs
        let finalUrl = videoUrl;
        if (videoUrl.startsWith('/media/')) {
            finalUrl = `${baseUrl}${videoUrl.replace(/^\//, '')}`;
        }
        
        return {
            type: 'self-hosted',
            source: finalUrl,
            canTrack: true
        };
    }
    
    // Default case (could be other external services)
    return {
        type: 'external',
        source: videoUrl,
        canTrack: false
    };
};

    // Enhanced Video Player Component
    const EnhancedVideoPlayer = ({ video, onProgressUpdate, onCompleted, isCompleted }) => {
    const videoRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const videoSource = getVideoSource(video.video_url);

    // Auto-resume from last position
    useEffect(() => {
        if (videoRef.current && video.lastPlayedTime && video.lastPlayedTime > 0) {
            videoRef.current.currentTime = video.lastPlayedTime;
            console.log("Resuming video from:", video.lastPlayedTime, "seconds");
        }
    }, [video.lastPlayedTime]);

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
            console.log("Video duration:", videoRef.current.duration);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const newTime = videoRef.current.currentTime;
            setCurrentTime(newTime);
            
            // Update progress every 10 seconds for self-hosted videos
            if (Math.floor(newTime) % 10 === 0 && videoSource.canTrack) {
                onProgressUpdate(newTime, false);
            }
            
            // Auto-complete at 95% watched (for self-hosted videos only)
            if (duration > 0 && newTime / duration > 0.95 && !isCompleted && videoSource.canTrack) {
                console.log("Auto-completing video at 95% watched");
                onProgressUpdate(duration, true);
                onCompleted();
            }
        }
    };

    const handleVideoEnd = () => {
        if (videoSource.canTrack && !isCompleted) {
            console.log("Video ended, marking as completed");
            onProgressUpdate(duration, true);
            onCompleted();
        }
    };

    const handleVideoPause = () => {
        if (videoRef.current && videoSource.canTrack) {
            onProgressUpdate(videoRef.current.currentTime, false);
        }
    };

    // Helper function to format time
    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // For YouTube videos - uses aspect ratio container
    if (videoSource.type === 'youtube') {
        return (
            <div className="youtube-container">
                <iframe
                    src={videoSource.source}
                    title={video.title}
                    className="video-player__iframe"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
        );
    }

    // For self-hosted videos - uses fixed height container
    if (videoSource.type === 'self-hosted') {
        return (
            <div className="self-hosted-container">
                <div className="self-hosted-video">
                    <video
                        ref={videoRef}
                        controls
                        className="video-player__element"
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={handleVideoEnd}
                        onLoadedMetadata={handleLoadedMetadata}
                        onPause={handleVideoPause}
                    >
                        <source src={videoSource.source} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    
                    {/* Progress overlay for self-hosted videos */}
                    <div className="video-progress-overlay">
                        <div className="progress-bar">
                            <div 
                                className="progress-fill" 
                                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                            />
                        </div>
                        <div className="time-display">
                            {formatTime(currentTime)} / {formatTime(duration)}
                            {video.lastPlayedTime > 0 && (
                                <span className="resume-indicator"> (Resumed)</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // For other external videos or unsupported formats
    return (
        <div className="self-hosted-container">
            <div className="video-player__placeholder">
                <div className="placeholder-icon">🎬</div>
                <p>Video format not supported</p>
                <a href={videoSource.source} target="_blank" rel="noopener noreferrer" className="external-video-link">
                    Open video in new tab
                </a>
            </div>
        </div>
    );
};

    const findFirstVideo = (courseData) => {
        if (!courseData.sections) return null;
        
        for (const section of courseData.sections) {
            for (const subsection of section.subsections) {
                if (subsection.lessons && subsection.lessons.length > 0) {
                    return {
                        ...subsection.lessons[0],
                        sectionTitle: section.title,
                        subsectionTitle: subsection.title,
                        lastPlayedTime: 0
                    };
                }
            }
        }
        return null;
    };

    const findLessonInCourse = (courseData, lessonId) => {
        if (!courseData.sections) return null;
        
        for (const section of courseData.sections) {
            for (const subsection of section.subsections) {
                if (subsection.lessons) {
                    const lesson = subsection.lessons.find(l => l.id === lessonId);
                    if (lesson) {
                        return {
                            ...lesson,
                            sectionTitle: section.title,
                            subsectionTitle: subsection.title,
                            lastPlayedTime: 0
                        };
                    }
                }
            }
        }
        return null;
    };

    const toggleSection = (sectionId) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(sectionId)) {
            newExpanded.delete(sectionId);
        } else {
            newExpanded.add(sectionId);
        }
        setExpandedSections(newExpanded);
    };

    const handleVideoSelect = async (lesson, sectionTitle, subsectionTitle) => {
        const videoData = {
            ...lesson,
            sectionTitle,
            subsectionTitle,
            lastPlayedTime: lastPlayed?.lesson_id === lesson.id ? lastPlayed.current_time : 0
        };
        
        setActiveVideo(videoData);
        
        // Track that user started watching this lesson
        await trackLessonPlay(lesson.id, 0, false);
    };

    const trackLessonPlay = async (lessonId, currentTime = 0, completed = false) => {
        try {
            const videoSource = getVideoSource(activeVideo?.video_url);
            
            // Only track time for self-hosted videos
            const trackedTime = videoSource.canTrack ? Math.floor(currentTime) : 0;
            
            await trackLessonProgress(lessonId, {
                current_time: trackedTime,
                completed: completed,
                total_duration: activeVideo?.video_duration || 0
            });
            
            console.log("Tracked lesson play:", { 
                lessonId, 
                currentTime: trackedTime, 
                completed,
                videoType: videoSource.type 
            });
            
            // Update local completion status if completed
            if (completed && !completionStatus[lessonId]) {
                setCompletionStatus(prev => ({
                    ...prev,
                    [lessonId]: true
                }));
            }
            
        } catch (error) {
            console.error('Error tracking lesson progress:', error);
        }
    };

    const markLessonAsCompleted = async (lessonId) => {
        try {
            if (completionStatus[lessonId]) {
                return;
            }

            console.log("Marking lesson as completed:", lessonId);

            // Update local state immediately for better UX
            setCompletionStatus(prev => ({
                ...prev,
                [lessonId]: true
            }));

            // Track as completed
            await trackLessonPlay(lessonId, activeVideo?.video_duration || 0, true);

            // Also update via bulk API for consistency
            const bulkProgressData = [
                {
                    lesson_id: parseInt(lessonId),
                    completed: true,
                    watched_duration: activeVideo?.video_duration || 0
                }
            ];
            
            await updateBulkLessonProgress(id, bulkProgressData);

            // Refresh progress summary
            const summaryResponse = await getCourseProgressSummary(id);
            setProgressSummary(summaryResponse.data);

            console.log("Successfully marked lesson as completed");

        } catch (error) {
            console.error('Error updating lesson progress:', error);
            console.error('Error details:', error.response?.data);
            
            // Revert local state on error
            setCompletionStatus(prev => {
                const newState = { ...prev };
                delete newState[lessonId];
                return newState;
            });
        }
    };

    const handleResumeLastPlayed = async () => {
        if (lastPlayed && lastPlayed.lesson_id) {
            const lesson = findLessonInCourse(course, lastPlayed.lesson_id);
            if (lesson) {
                await handleVideoSelect(lesson, lastPlayed.section_title, lastPlayed.subsection_title);
            }
        }
    };

    const getTotalLessons = () => {
        if (!course?.sections) return 0;
        return course.sections.reduce((total, section) => 
            total + section.subsections.reduce((subTotal, subsection) => 
                subTotal + (subsection.lessons ? subsection.lessons.length : 0), 0
            ), 0
        );
    };

    const getCompletedLessons = () => {
        return Object.keys(completionStatus).length;
    };

    const getProgressPercentage = () => {
        const total = getTotalLessons();
        return total > 0 ? Math.round((getCompletedLessons() / total) * 100) : 0;
    };

    const formatTimeSpent = (seconds) => {
        if (!seconds) return '0m';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    if (loading) {
        return (
            <div className="course-content">
                <div className="course-content__loading">
                    <div className="loading-spinner"></div>
                    <p>Loading course content...</p>
                </div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="course-content">
                <div className="course-content__error">
                    <h2>Unable to load course</h2>
                    <p>{error || 'Course not found'}</p>
                    <button 
                        onClick={() => navigate('/enrolled-courses')} 
                        className="btn btn--primary"
                    >
                        Back to My Courses
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="course-content">
            {/* Enhanced Header */}
            <div className="course-content__header">
                <div className="course-content__breadcrumb">
                    <Link to="/enrolled-courses" className="breadcrumb-link">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        My Courses
                    </Link>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-current">{course.title}</span>
                </div>
                
                {/* Resume Banner */}
                {lastPlayed && lastPlayed.lesson_id !== activeVideo?.id && (
                    <div className="resume-banner">
                        <div className="resume-content">
                            <span>📺 Continue from where you left off:</span>
                            <strong> "{lastPlayed.lesson_title}"</strong>
                            {lastPlayed.current_time > 0 && (
                                <span> ({(lastPlayed.current_time / 60).toFixed(0)}m watched)</span>
                            )}
                        </div>
                        <button 
                            className="btn btn--primary btn--sm"
                            onClick={handleResumeLastPlayed}
                        >
                            Resume
                        </button>
                    </div>
                )}
                
                <div className="course-header__main">
                    <div className="course-header__info">
                        <h1 className="course-content__title">{course.title}</h1>
                        <p className="course-content__instructor">By {course.instructor_name}</p>
                        
                        {/* Enhanced Meta Information */}
                        <div className="course-meta-grid">
                            <div className="meta-item">
                                <div className="meta-icon">📚</div>
                                <div className="meta-content">
                                    <span className="meta-label">Level</span>
                                    <span className="meta-value">{course.level}</span>
                                </div>
                            </div>
                            <div className="meta-item">
                                <div className="meta-icon">🗂️</div>
                                <div className="meta-content">
                                    <span className="meta-label">Category</span>
                                    <span className="meta-value">{course.category}</span>
                                </div>
                            </div>
                            <div className="meta-item">
                                <div className="meta-icon">⭐</div>
                                <div className="meta-content">
                                    <span className="meta-label">Rating</span>
                                    <span className="meta-value">{course.average_rating}/5 ({course.total_reviews} reviews)</span>
                                </div>
                            </div>
                            {progressSummary && (
                                <div className="meta-item">
                                    <div className="meta-icon">🕒</div>
                                    <div className="meta-content">
                                        <span className="meta-label">Time Spent</span>
                                        <span className="meta-value">{formatTimeSpent(progressSummary.total_watched_seconds)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Progress Card */}
                    <div className="progress-card">
                        <div className="progress-card__header">
                            <h4>Your Progress</h4>
                            <span className="progress-percentage">{getProgressPercentage()}%</span>
                        </div>
                        <div className="progress-bar">
                            <div 
                                className="progress-bar__fill" 
                                style={{ width: `${getProgressPercentage()}%` }}
                            ></div>
                        </div>
                        <div className="progress-stats">
                            <span>{getCompletedLessons()} of {getTotalLessons()} lessons completed</span>
                            {progressSummary && (
                                <span className="progress-time">
                                    {formatTimeSpent(progressSummary.total_watched_seconds)} spent
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="course-content__layout">
                {/* Main Content Area */}
                <div className="course-content__main">
                    {/* Video Player Section */}
                    <div className="video-section">
                        <div className="video-player">
                            {activeVideo ? (
                                <>
                                    <div className="video-player__header">
                                        <div className="video-player__title-section">
                                            <h3 className="video-player__title">{activeVideo.title}</h3>
                                            <div className="video-player__meta">
                                                <span className="meta-badge">{activeVideo.sectionTitle}</span>
                                                <span className="meta-separator">•</span>
                                                <span className="meta-badge">{activeVideo.subsectionTitle}</span>
                                                {activeVideo.video_duration && (
                                                    <>
                                                        <span className="meta-separator">•</span>
                                                        <span className="meta-duration">{activeVideo.video_duration} min</span>
                                                    </>
                                                )}
                                                {completionStatus[activeVideo.id] && (
                                                    <>
                                                        <span className="meta-separator">•</span>
                                                        <span className="meta-completed">✅ Completed</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="video-actions">
                                            {!completionStatus[activeVideo.id] && (
                                                <button 
                                                    className="action-btn action-btn--complete"
                                                    onClick={() => markLessonAsCompleted(activeVideo.id)}
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                        <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                    Mark Complete
                                                </button>
                                            )}
                                            <button className="action-btn">
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                    <path d="M8 2V14M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                                </svg>
                                                Notes
                                            </button>
                                        </div>
                                    </div>
                                    <div className="video-player__container">
                                        <EnhancedVideoPlayer 
                                            video={activeVideo}
                                            onProgressUpdate={(currentTime, completed) => trackLessonPlay(activeVideo.id, currentTime, completed)}
                                            onCompleted={() => markLessonAsCompleted(activeVideo.id)}
                                            isCompleted={completionStatus[activeVideo.id]}
                                        />
                                    </div>
                                    <div className="video-player__content">
                                        <div className="content-section">
                                            <h4>About this lesson</h4>
                                            <p>{activeVideo.content || 'No additional content provided for this lesson.'}</p>
                                        </div>
                                        {activeVideo.resources && (
                                            <div className="content-section">
                                                <h5>Lesson Resources</h5>
                                                <a 
                                                    href={activeVideo.resources} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="resource-link"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                        <path d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <path d="M4.66675 6.66666L8.00008 9.99999L11.3334 6.66666" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <path d="M8 10V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                    Download Resources
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="video-player__empty">
                                    <div className="empty-state">
                                        <div className="empty-icon">📺</div>
                                        <h3>Select a Lesson</h3>
                                        <p>Choose a lesson from the course curriculum to start learning</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Course Details Section */}
                    <div className="course-details-section">
                        <div className="details-tabs">
                            <button className="tab-btn tab-btn--active">Description</button>
                            <button className="tab-btn">Objectives</button>
                            <button className="tab-btn">Resources</button>
                        </div>
                        
                        <div className="tab-content">
                            <div className="course-description">
                                <h3>Course Overview</h3>
                                <p>{course.description}</p>
                            </div>
                            
                            {course.learning_objectives && course.learning_objectives.length > 0 && (
                                <div className="learning-objectives">
                                    <h3>What You'll Learn</h3>
                                    <div className="objectives-grid">
                                        {course.learning_objectives.map((objective) => (
                                            <div key={objective.id} className="objective-card">
                                                <div className="objective-icon">{objective.icon}</div>
                                                <div className="objective-content">
                                                    <p>{objective.objective}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Enhanced Sidebar */}
                <div className="course-content__sidebar">
                    <div className="curriculum-sidebar">
                        <div className="sidebar-header">
                            <h3>Course Curriculum</h3>
                            <div className="curriculum-stats">
                                <span>{course.sections ? course.sections.length : 0} sections</span>
                                <span>•</span>
                                <span>{getTotalLessons()} lessons</span>
                                <span>•</span>
                                <span>{getProgressPercentage()}% complete</span>
                            </div>
                        </div>
                        
                        <div className="curriculum-sections">
                            {course.sections && course.sections.map(section => (
                                <SectionAccordion
                                    key={section.id}
                                    section={section}
                                    isExpanded={expandedSections.has(section.id)}
                                    onToggle={() => toggleSection(section.id)}
                                    activeVideo={activeVideo}
                                    onVideoSelect={handleVideoSelect}
                                    completionStatus={completionStatus}
                                    onMarkComplete={markLessonAsCompleted}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Enhanced Section Accordion Component
const SectionAccordion = ({ section, isExpanded, onToggle, activeVideo, onVideoSelect, completionStatus, onMarkComplete }) => {
    const totalLessons = section.subsections ? section.subsections.reduce((total, subsection) => 
        total + (subsection.lessons ? subsection.lessons.length : 0), 0
    ) : 0;

    const completedLessons = section.subsections ? section.subsections.reduce((total, subsection) => 
        total + (subsection.lessons ? subsection.lessons.filter(lesson => completionStatus[lesson.id]).length : 0), 0
    ) : 0;

    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return (
        <div className="section-accordion">
            <div 
                className={`section-accordion__header ${isExpanded ? 'section-accordion__header--expanded' : ''}`}
                onClick={onToggle}
            >
                <div className="section-accordion__title">
                    <div className="section-title-row">
                        <h4>{section.title}</h4>
                        <span className="section-progress">{progressPercentage}%</span>
                    </div>
                    <div className="section-meta-row">
                        <span className="section-meta">
                            {section.subsections ? section.subsections.length : 0} topics • {totalLessons} lessons
                        </span>
                        <span className="section-completion">
                            {completedLessons}/{totalLessons} completed
                        </span>
                    </div>
                    <div className="section-progress-bar">
                        <div 
                            className="section-progress__fill" 
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>
                <div className="section-accordion__icon">
                    <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 16 16" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path 
                            d={isExpanded ? "M4 10L8 6L12 10" : "M6 4L10 8L6 12"} 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            </div>
            
            {isExpanded && section.subsections && (
                <div className="section-accordion__content">
                    {section.subsections.map(subsection => (
                        <Subsection
                            key={subsection.id}
                            subsection={subsection}
                            sectionTitle={section.title}
                            activeVideo={activeVideo}
                            onVideoSelect={onVideoSelect}
                            completionStatus={completionStatus}
                            onMarkComplete={onMarkComplete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// Enhanced Subsection Component
const Subsection = ({ subsection, sectionTitle, activeVideo, onVideoSelect, completionStatus, onMarkComplete }) => {
    const completedLessons = subsection.lessons ? 
        subsection.lessons.filter(lesson => completionStatus[lesson.id]).length : 0;

    return (
        <div className="subsection">
            <div className="subsection__header">
                <div className="subsection-title">
                    <h5>{subsection.title}</h5>
                    {subsection.description && (
                        <p className="subsection-description">{subsection.description}</p>
                    )}
                </div>
                <div className="subsection-stats">
                    <span className="subsection-progress">{completedLessons}/{subsection.lessons ? subsection.lessons.length : 0}</span>
                </div>
            </div>
            
            {subsection.lessons && (
                <div className="subsection__lessons">
                    {subsection.lessons.map(lesson => (
                        <LessonItem
                            key={lesson.id}
                            lesson={lesson}
                            sectionTitle={sectionTitle}
                            subsectionTitle={subsection.title}
                            isActive={activeVideo?.id === lesson.id}
                            isCompleted={completionStatus[lesson.id]}
                            onSelect={onVideoSelect}
                            onMarkComplete={onMarkComplete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// Enhanced Lesson Item Component
const LessonItem = ({ lesson, sectionTitle, subsectionTitle, isActive, isCompleted, onSelect, onMarkComplete }) => {
    const formatDuration = (minutes) => {
        if (!minutes) return '';
        return `${minutes} min`;
    };

    const handleLessonClick = (e) => {
        if (e.target.closest('.lesson-mark-complete')) {
            return;
        }
        onSelect(lesson, sectionTitle, subsectionTitle);
    };

    const handleMarkComplete = (e) => {
        e.stopPropagation();
        onMarkComplete(lesson.id);
    };

    return (
        <div 
            className={`lesson-item ${isActive ? 'lesson-item--active' : ''} ${isCompleted ? 'lesson-item--completed' : ''}`}
            onClick={handleLessonClick}
        >
            <div className="lesson-item__status">
                {isCompleted ? (
                    <div className="status-completed">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                ) : (
                    <div className="status-pending">
                        <div className="status-circle"></div>
                    </div>
                )}
            </div>
            
            <div className="lesson-item__icon">
                {lesson.lesson_type === 'video' ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path 
                            d="M6 4L12 8L6 12V4Z" 
                            fill="currentColor" 
                        />
                    </svg>
                ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path 
                            d="M2 2H14V14H2V2Z" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                        />
                    </svg>
                )}
            </div>
            
            <div className="lesson-item__content">
                <h6 className="lesson-item__title">{lesson.title}</h6>
                <div className="lesson-item__meta">
                    {lesson.lesson_type === 'video' && lesson.video_duration && (
                        <span className="lesson-item__duration">
                            {formatDuration(lesson.video_duration)}
                        </span>
                    )}
                    {lesson.is_preview && (
                        <span className="lesson-item__preview">Preview</span>
                    )}
                </div>
            </div>

            {!isCompleted && (
                <button 
                    className="lesson-mark-complete"
                    onClick={handleMarkComplete}
                    title="Mark as completed"
                >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                </button>
            )}
            
            {isActive && (
                <div className="lesson-item__playing">
                    <div className="playing-indicator"></div>
                </div>
            )}
        </div>
    );
};

export default CourseContentPage;