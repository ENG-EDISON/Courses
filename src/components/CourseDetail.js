import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { getCoursePreviewStructure } from "../api/CoursesApi";
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
    const [videoDuration, setVideoDuration] = useState(null);
    const [videoReady, setVideoReady] = useState(false);
    const videoRef = useRef(null);

    // Fetch course full structure from API
    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                setLoading(true);
                const response = await getCoursePreviewStructure(courseId);
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
        if (lesson.is_preview && (lesson.video_url || lesson.video_file)) {
            setCurrentVideo(lesson);
            setShowVideoModal(true);
            // Reset video state when opening new video
            setVideoDuration(null);
            setVideoReady(false);
        }
    };

    // Close video modal
    const closeVideoModal = () => {
        setShowVideoModal(false);
        setCurrentVideo(null);
        setVideoDuration(null);
        setVideoReady(false);
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    // Enhanced video event handlers
    const handleVideoLoadStart = () => {
        console.log('Video load started...');
        setVideoReady(false);
    };

    const handleVideoLoadedMetadata = (e) => {
        const video = e.target;
        const duration = video.duration;
        setVideoDuration(duration);
        
        console.log('Video metadata loaded:', {
            duration: duration,
            seekable: video.seekable.length > 0 ? `${video.seekable.start(0)}-${video.seekable.end(0)}` : 'none',
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            readyState: video.readyState,
            buffered: video.buffered.length > 0 ? `${video.buffered.end(0)}` : 'none'
        });

        // Check if we have a valid duration
        if (duration && duration > 0 && !isNaN(duration)) {
            setVideoReady(true);
            console.log('✅ Video is ready for playback and seeking');
        } else {
            console.log('⚠️ Video duration not available yet, waiting for more data...');
        }
    };

    const handleVideoCanPlay = (e) => {
        console.log('Video can start playing');
        setVideoReady(true);
    };

    const handleVideoCanPlayThrough = (e) => {
        console.log('✅ Video can play through without stopping to buffer');
        setVideoReady(true);
    };

    const handleVideoError = (e) => {
        const video = e.target;
        console.error('Video error:', video.error);
        
        let errorMessage = 'Video playback error: ';
        if (video.error) {
            switch(video.error.code) {
                case video.error.MEDIA_ERR_ABORTED:
                    errorMessage += 'Playback was aborted';
                    break;
                case video.error.MEDIA_ERR_NETWORK:
                    errorMessage += 'Network error occurred';
                    break;
                case video.error.MEDIA_ERR_DECODE:
                    errorMessage += 'Video decoding error - file may be corrupt';
                    break;
                case video.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                    errorMessage += 'Video format not supported';
                    break;
                default:
                    errorMessage += 'Unknown error occurred';
            }
        }
        console.error(errorMessage);
    };

    const handleVideoProgress = (e) => {
        const video = e.target;
        if (video.buffered.length > 0) {
            const bufferedEnd = video.buffered.end(video.buffered.length - 1);
            const duration = video.duration;
            
            if (duration > 0 && !videoDuration) {
                setVideoDuration(duration);
                console.log('📊 Duration updated from progress:', duration);
            }
            
            console.log(`📦 Buffered: ${bufferedEnd.toFixed(1)}s / ${duration ? duration.toFixed(1) + 's' : 'unknown'}`);
        }
    };

    const handleVideoSeeked = (e) => {
        console.log('🎯 Video seeked to:', e.target.currentTime.toFixed(1) + 's');
    };

    const handleVideoWaiting = (e) => {
        console.log('⏳ Video waiting for data...');
    };

    const handleVideoPlaying = (e) => {
        console.log('▶️ Video playing');
    };

    // Test seeking functionality
    const testSeeking = (time) => {
        if (videoRef.current && videoReady) {
            console.log(`🧪 Testing seek to: ${time}s`);
            
            if (!videoDuration || time > videoDuration) {
                console.log('❌ Cannot seek beyond video duration');
                return;
            }
            
            videoRef.current.currentTime = time;
            
            setTimeout(() => {
                const actualTime = videoRef.current.currentTime;
                const accuracy = Math.abs(actualTime - time);
                console.log(`📊 Actual time: ${actualTime.toFixed(1)}s | Accuracy: ${accuracy.toFixed(2)}s`);
                
                if (accuracy > 2) {
                    console.log('⚠️ Seek accuracy is poor - video may not be properly encoded for seeking');
                }
            }, 200);
        } else {
            console.log('❌ Video not ready for seeking');
        }
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
        return url && (url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg') || url.includes('.mov') || url.includes('.avi'));
    };

    // Get video source for a lesson
    const getVideoSource = (lesson) => {
        if (lesson.video_file) {
            return {
                type: 'uploaded',
                src: lesson.video_file,
                isExternal: false
            };
        } else if (lesson.video_url) {
            if (isYouTubeVideo(lesson.video_url)) {
                return {
                    type: 'youtube',
                    src: lesson.video_url,
                    isExternal: true
                };
            } else if (isLocalVideo(lesson.video_url)) {
                return {
                    type: 'external',
                    src: lesson.video_url,
                    isExternal: false
                };
            } else {
                return {
                    type: 'unknown',
                    src: lesson.video_url,
                    isExternal: true
                };
            }
        }
        return null;
    };

    // Check if lesson has preview content
    const hasPreviewContent = (lesson) => {
        return lesson.is_preview && (lesson.video_url || lesson.video_file);
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
        if (!seconds || seconds === 0) return "0 min";
        const minutes = Math.floor(seconds / 60);
        return `${minutes} min`;
    };

    const formatTime = (seconds) => {
        if (!seconds || seconds === 0) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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

    // Get video badge type
    const getVideoBadgeType = (lesson) => {
        const videoSource = getVideoSource(lesson);
        if (!videoSource) return null;

        const badges = {
            uploaded: { text: 'Uploaded Video', icon: 'fas fa-video', color: 'var(--success-color)' },
            youtube: { text: 'YouTube', icon: 'fab fa-youtube', color: 'var(--youtube-red)' },
            external: { text: 'External Video', icon: 'fas fa-external-link-alt', color: 'var(--info-color)' },
            unknown: { text: 'Video Link', icon: 'fas fa-link', color: 'var(--warning-color)' }
        };

        return badges[videoSource.type] || badges.unknown;
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
            {/* Enhanced Video Preview Modal */}
            {showVideoModal && currentVideo && (
                <div className="video-modal-overlay" onClick={closeVideoModal}>
                    <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="video-modal-header">
                            <div className="video-title-section">
                                <h3>{currentVideo.title}</h3>
                                {getVideoBadgeType(currentVideo) && (
                                    <span
                                        className="video-source-badge"
                                        style={{ color: getVideoBadgeType(currentVideo).color }}
                                    >
                                        <i className={getVideoBadgeType(currentVideo).icon}></i>
                                        {getVideoBadgeType(currentVideo).text}
                                    </span>
                                )}
                            </div>
                            <button className="video-modal-close" onClick={closeVideoModal}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        
                        {/* Enhanced Video Player Container */}
                        <div className="video-player-container">
                            {(() => {
                                const videoSource = getVideoSource(currentVideo);

                                if (!videoSource) {
                                    return (
                                        <div className="video-not-supported">
                                            <i className="fas fa-exclamation-triangle"></i>
                                            <p>No video content available</p>
                                        </div>
                                    );
                                }

                                switch (videoSource.type) {
                                    case 'youtube':
                                        return (
                                            <iframe
                                                src={`https://www.youtube.com/embed/${getYouTubeVideoId(videoSource.src)}?autoplay=1`}
                                                title={currentVideo.title}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                        );

                                    case 'uploaded':
                                    case 'external':
                                        return (
                                            <div className="enhanced-video-wrapper">
                                                {/* Video Loading State */}
                                                {!videoReady && (
                                                    <div className="video-loading-state">
                                                        <div className="loading-spinner"></div>
                                                        <p>Loading video metadata...</p>
                                                        <small>Duration will be available once video loads</small>
                                                    </div>
                                                )}
                                                
                                                <video
                                                    ref={videoRef}
                                                    controls
                                                    autoPlay
                                                    style={{ 
                                                        width: '100%', 
                                                        height: '100%',
                                                        opacity: videoReady ? 1 : 0.7
                                                    }}
                                                    key={videoSource.src}
                                                    onLoadStart={handleVideoLoadStart}
                                                    onLoadedMetadata={handleVideoLoadedMetadata}
                                                    onCanPlay={handleVideoCanPlay}
                                                    onCanPlayThrough={handleVideoCanPlayThrough}
                                                    onError={handleVideoError}
                                                    onSeeked={handleVideoSeeked}
                                                    onProgress={handleVideoProgress}
                                                    onWaiting={handleVideoWaiting}
                                                    onPlaying={handleVideoPlaying}
                                                    preload="auto"
                                                    crossOrigin="anonymous"
                                                    controlsList="nodownload"
                                                >
                                                    <source src={videoSource.src} type="video/mp4" />
                                                    <source src={videoSource.src} type="video/webm" />
                                                    <source src={videoSource.src} type="video/ogg" />
                                                    Your browser does not support the video tag.
                                                </video>
                                                
                                                {/* Enhanced Seek Test Panel */}
                                                <div className="seek-test-panel">
                                                    <div className="video-status">
                                                        <span className={`status-indicator ${videoReady ? 'ready' : 'loading'}`}>
                                                            {videoReady ? '✅ Ready' : '⏳ Loading...'}
                                                        </span>
                                                        {videoDuration && (
                                                            <span className="duration-info">
                                                                Duration: {formatTime(videoDuration)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="seek-test-buttons">
                                                        <small>Test Seeking:</small>
                                                        <button 
                                                            onClick={() => testSeeking(0)}
                                                            className="seek-test-btn"
                                                            disabled={!videoReady}
                                                        >
                                                            0s
                                                        </button>
                                                        <button 
                                                            onClick={() => testSeeking(30)}
                                                            className="seek-test-btn"
                                                            disabled={!videoReady || !videoDuration || videoDuration < 30}
                                                        >
                                                            30s
                                                        </button>
                                                        <button 
                                                            onClick={() => testSeeking(60)}
                                                            className="seek-test-btn"
                                                            disabled={!videoReady || !videoDuration || videoDuration < 60}
                                                        >
                                                            1:00
                                                        </button>
                                                        {videoDuration && videoDuration > 90 && (
                                                            <button 
                                                                onClick={() => testSeeking(90)}
                                                                className="seek-test-btn"
                                                                disabled={!videoReady}
                                                            >
                                                                1:30
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );

                                    case 'unknown':
                                    default:
                                        return videoSource.isExternal ? (
                                            <div className="external-video-link">
                                                <div className="external-video-icon">
                                                    <i className="fas fa-external-link-alt"></i>
                                                </div>
                                                <h4>External Video Content</h4>
                                                <p>This lesson contains video content from an external source.</p>
                                                <a
                                                    href={videoSource.src}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="external-link-btn"
                                                >
                                                    <i className="fas fa-external-link-alt"></i>
                                                    Open Video in New Tab
                                                </a>
                                            </div>
                                        ) : (
                                            <div className="video-not-supported">
                                                <i className="fas fa-exclamation-triangle"></i>
                                                <p>Video format not supported</p>
                                                <a
                                                    href={videoSource.src}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="external-link-btn"
                                                >
                                                    Try opening directly
                                                </a>
                                            </div>
                                        );
                                }
                            })()}
                        </div>
                        
                        <div className="video-modal-footer">
                            <p>Preview Content - Enroll to access all videos</p>
                            {/* Enhanced Debug Info */}
                            <div className="video-debug-info">
                                <strong>Video Status:</strong> {videoReady ? 'Ready for playback' : 'Loading metadata...'}
                                {videoDuration && (
                                    <span> | Duration: {formatTime(videoDuration)}</span>
                                )}
                                {currentVideo.video_duration && (
                                    <span> | Expected: {formatTime(currentVideo.video_duration)}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Rest of your component remains the same */}
            {/* Course Hero Section */}
            <div className="course-hero">
                {/* ... existing hero content ... */}
            </div>

            {/* Main Content */}
            <div className="course-container">
                <div className="course-layout">
                    {/* Main Content Column */}
                    <div className="course-main-content">
                        {/* ... existing course content sections ... */}
                    </div>

                    {/* Sidebar Column */}
                    <div className="course-sidebar">
                        {/* ... existing sidebar content ... */}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Course;