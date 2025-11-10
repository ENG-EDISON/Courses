const VideoHeader = ({ activeVideo, completionStatus, onMarkComplete }) => (
    <div className="video-player__header">
        <div className="video-player__title-section">
            <h3 className="video-player__title">{activeVideo.title}</h3>
            <VideoMeta 
                activeVideo={activeVideo}
                isCompleted={completionStatus[activeVideo.id]}
            />
        </div>
        <VideoActions 
            isCompleted={completionStatus[activeVideo.id]}
            onMarkComplete={() => onMarkComplete(activeVideo.id)}
        />
    </div>
);

const VideoMeta = ({ activeVideo, isCompleted }) => (
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
        {isCompleted && (
            <>
                <span className="meta-separator">•</span>
                <span className="meta-completed">✅ Completed</span>
            </>
        )}
    </div>
);

const VideoActions = ({ isCompleted, onMarkComplete }) => (
    <div className="video-actions">
        {!isCompleted && (
            <button
                className="action-btn action-btn--complete"
                onClick={onMarkComplete}
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Mark Complete
            </button>
        )}
        <button className="action-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2V14M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Notes
        </button>
    </div>
);

export default VideoHeader;