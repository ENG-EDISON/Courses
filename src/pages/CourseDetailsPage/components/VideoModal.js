// components/VideoModal.js
import { useRef, useEffect } from 'react';
import { getVideoSource, getYouTubeVideoId } from "../utils/videoUtils";

function VideoModal({ show, currentVideo, onClose }) {
    const videoRef = useRef(null);
    
    // Prevent right-click and keyboard shortcuts
    useEffect(() => {
        const handleContextMenu = (e) => {
            e.preventDefault();
        };

        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Early return must come AFTER all hooks
    if (!show || !currentVideo) return null;

    const videoSource = getVideoSource(currentVideo);

    const renderVideoContent = () => {
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
                    <video
                        ref={videoRef}
                        controls
                        autoPlay
                        style={{ width: '100%', height: '100%' }}
                        key={videoSource.src}
                        controlsList="nodownload" // Prevents download button
                        onContextMenu={(e) => e.preventDefault()} // Prevents right-click
                    >
                        <source src={videoSource.src} type="video/mp4" />
                        <source src={videoSource.src} type="video/webm" />
                        <source src={videoSource.src} type="video/ogg" />
                        Your browser does not support the video tag.
                    </video>
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
    };

    return (
        <div className="video-modal-overlay" onClick={onClose}>
            <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="video-modal-header">
                    <div className="video-title-section">
                        <h3>{currentVideo.title}</h3>
                    </div>
                    <button className="video-modal-close" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="video-player-container">
                    {renderVideoContent()}
                </div>
                <div className="video-modal-footer">
                    <p>Preview Content - Enroll to access all videos</p>
                </div>
            </div>
        </div>
    );
}

export default VideoModal;